// /app/api/transactions/sync/route.js
import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createClient } from '@/app/utils/supabase/server'; // Use server client

// --- Plaid Configuration ---
// Ensure PLAID_ENV, PLAID_CLIENT_ID, PLAID_SECRET are set in your environment variables
const plaidEnv = process.env.PLAID_ENV === 'sandbox' ? PlaidEnvironments.sandbox :
                 process.env.PLAID_ENV === 'development' ? PlaidEnvironments.development :
                 PlaidEnvironments.production; // Default to production if not specified

const configuration = new Configuration({
  basePath: plaidEnv,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// --- POST Handler for Syncing Transactions ---
export async function POST(request) {
    try {
        // --- Get Authenticated User ---
        const supabase = await createClient(); // Use server client helper
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("Sync API: User:", user?.id); // Log user ID

        if (!user) {
            console.warn("Sync API: Unauthorized access attempt.");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (userError) {
           console.error("Sync API: Error getting user:", userError);
           return NextResponse.json({ message: "Could not get user", error: userError.message }, { status: 500 });
        }

        // --- Check for Plaid Access Token ---
        if (!user.user_metadata?.plaid_access_token) {
            console.warn(`Sync API: Plaid access token not found for user ${user.id}.`);
            return NextResponse.json({ message: "Plaid access token not found for user." }, { status: 400 });
        }
        const accessToken = user.user_metadata.plaid_access_token;
        let cursor = user.user_metadata.plaid_cursor || null;
        console.log(`Sync API: Starting sync for user ${user.id} with cursor:`, cursor);

        // --- Fetch Transactions from Plaid ---
        let added = [];
        let modified = [];
        let removed = [];
        let hasMore = true;

        while (hasMore) {
            console.log(`Sync API: Calling Plaid transactionsSync for user ${user.id} with cursor:`, cursor);
            const syncResponse = await plaidClient.transactionsSync({
                access_token: accessToken,
                cursor: cursor,
                // Optional: add count parameter if needed, e.g., count: 100
            });
            console.log(`Sync API: Plaid transactionsSync Response received for user ${user.id}`);
            const data = syncResponse.data;

            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);
            cursor = data.next_cursor; // Update cursor for next iteration or DB storage
            hasMore = data.has_more;

            console.log(`Sync API: User ${user.id} - Added: ${data.added.length}, Modified: ${data.modified.length}, Removed: ${data.removed.length}, Has More: ${hasMore}, Next Cursor: ${cursor}`);
        }
        console.log(`Sync API: Finished fetching transactions from Plaid for user ${user.id}. Total Added: ${added.length}, Modified: ${modified.length}, Removed: ${removed.length}`);

        // --- Update Plaid Cursor in Supabase User Metadata ---
        try {
            console.log(`Sync API: Updating cursor in database for user ${user.id} to:`, cursor);
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    plaid_cursor: cursor
                }
            });
            if (updateError) {
                throw updateError; // Throw to be caught by outer catch
            }
            console.log(`Sync API: Cursor updated successfully for user ${user.id}.`);
        } catch (updateError) {
            console.error(`Sync API: Error updating cursor for user ${user.id}:`, updateError);
            // Proceed with transaction processing even if cursor update fails? Decide on strategy.
            // For now, we'll return an error.
            return NextResponse.json({ message: "Error updating Plaid cursor", error: updateError.message }, { status: 500 });
        }

        // --- Fetch or Create "Uncategorized" Category ID ---
        let uncategorizedCategoryId;
        try {
            console.log("Sync API: Attempting to find 'Uncategorized' category for user:", user.id);
            // Use .maybeSingle() to avoid error if it doesn't exist
            const { data: existingCategory, error: fetchError } = await supabase
              .from('categories')
              .select('id')
              .eq('user_id', user.id)
              .eq('name', 'Uncategorized') // Exact name match
              .maybeSingle(); // Returns null instead of error if 0 rows

            if (fetchError) {
                console.error(`Sync API: Error fetching category for user ${user.id}:`, fetchError);
                throw fetchError; // Throw to be caught below
            }

            if (existingCategory) {
                // Category found!
                uncategorizedCategoryId = existingCategory.id;
                console.log(`Sync API: 'Uncategorized' category found for user ${user.id} with ID:`, uncategorizedCategoryId);
            } else {
                // Category NOT found, let's create it
                console.log(`Sync API: 'Uncategorized' category not found for user ${user.id}. Creating it...`);
                const { data: newCategory, error: createError } = await supabase
                    .from('categories')
                    .insert({
                        user_id: user.id,
                        name: 'Uncategorized',
                        type: 'expense', // Default type for uncategorized
                        planned_amount: 0 // Default planned amount
                    })
                    .select('id') // Select the ID of the newly created category
                    .single(); // We expect exactly one row back after insert

                if (createError) {
                    console.error(`Sync API: Error creating 'Uncategorized' category for user ${user.id}:`, createError);
                    throw createError; // Throw to be caught below
                }

                if (!newCategory || !newCategory.id) {
                     console.error(`Sync API: Failed to create or retrieve ID for 'Uncategorized' category for user ${user.id}.`);
                     throw new Error("Failed to create or retrieve ID for 'Uncategorized' category.");
                }

                uncategorizedCategoryId = newCategory.id;
                console.log(`Sync API: 'Uncategorized' category created successfully for user ${user.id} with ID:`, uncategorizedCategoryId);
            }

        } catch (error) {
            console.error(`Sync API: Error fetching or creating Uncategorized category for user ${user.id}:`, error);
            // Return a specific error response
            return NextResponse.json({ message: "Database error handling 'Uncategorized' category", error: error.message }, { status: 500 });
        }
        // --- END OF Fetch/Create Category SECTION ---

        // Ensure we have the ID before proceeding (Safety Check)
        if (!uncategorizedCategoryId) {
             console.error(`Sync API: Critical logic failure - uncategorizedCategoryId is missing for user ${user.id}.`);
             return NextResponse.json({ message: "Critical error: Could not obtain Uncategorized category ID." }, { status: 500 });
        }

        // --- Process Added Transactions using UPSERT ---
        if (added.length > 0) {
            console.log(`Sync API: Processing ${added.length} added transactions for user ${user.id} using category ID ${uncategorizedCategoryId}`);
            const transactionsToUpsert = added.map(transaction => ({ // Renamed for clarity
                user_id: user.id,
                account_id: transaction.account_id,
                plaid_transaction_id: transaction.transaction_id, // This is the conflict column
                date: transaction.date,
                description: transaction.name,
                amount: -transaction.amount, // Invert Plaid's amount sign
                type: transaction.amount >= 0 ? 'expense' : 'income', // Determine type based on original Plaid amount sign
                category_id: uncategorizedCategoryId, // Default category
                source_id: null,
                plaid_category_id: transaction.category_id,
                // Add other fields as needed (pending, merchant_name, etc.)
            }));

            try {
                 // --- USE UPSERT TO HANDLE POTENTIAL DUPLICATES ---
                 const { data: upsertedData, error: upsertError } = await supabase
                    .from('transactions')
                    .upsert(transactionsToUpsert, {
                        onConflict: 'plaid_transaction_id', // Specify the constraint column name
                        // By default, without specifying fields to update, this will effectively
                        // perform an "INSERT ... ON CONFLICT DO NOTHING"
                    })
                    .select(); // Optionally select data (might include existing rows)

                 if (upsertError) {
                    console.error(`Sync API: Error upserting added transactions for user ${user.id}:`, upsertError);
                    throw upsertError; // Throw to be caught by outer catch
                 }
                 console.log(`Sync API: Successfully processed (upserted) ${transactionsToUpsert.length} potential new transactions for user ${user.id}. Response data length: ${upsertedData?.length || 0}`);

            } catch (error) {
                console.error(`Sync API: Database error during bulk upsert for user ${user.id}.`, error);
                return NextResponse.json({ message: "Error processing new transactions", error: error.message }, { status: 500 });
            }
        }
        // --- END OF Process Added Transactions ---


        // --- Process Modified Transactions ---
        if (modified.length > 0) {
            console.log(`Sync API: Processing ${modified.length} modified transactions for user ${user.id}.`);
            for (const transaction of modified) {
                try {
                    const { data: updatedData, error: updateError } = await supabase
                        .from('transactions')
                        .update({
                            date: transaction.date,
                            description: transaction.name,
                            amount: -transaction.amount,
                            type: transaction.amount >= 0 ? 'expense' : 'income',
                            plaid_category_id: transaction.category_id,
                            account_id: transaction.account_id,
                            // Decide on category_id: keep existing manual one or overwrite?
                            // category_id: uncategorizedCategoryId, // Option: Overwrite manual category
                        })
                        .eq('plaid_transaction_id', transaction.transaction_id)
                        .eq('user_id', user.id)
                        .select('id');

                    if (updateError) {
                        console.error(`Sync API: Error updating transaction ${transaction.transaction_id} for user ${user.id}:`, updateError);
                        continue; // Log and continue with the next modification
                    }
                    if (updatedData && updatedData.length > 0) {
                        console.log(`Sync API: Successfully updated transaction ${updatedData[0].id} (Plaid ID: ${transaction.transaction_id}) for user ${user.id}.`);
                    } else {
                         console.warn(`Sync API: Modified transaction with Plaid ID ${transaction.transaction_id} not found for user ${user.id} during update.`);
                    }
                } catch (error) {
                    console.error(`Sync API: Error processing modification for Plaid transaction ${transaction.transaction_id} for user ${user.id}:`, error);
                    return NextResponse.json({ message: "Error updating modified transactions", error: error.message }, { status: 500 });
                }
            }
        }

        // --- Process Removed Transactions ---
        if (removed.length > 0) {
             console.log(`Sync API: Processing ${removed.length} removed transactions for user ${user.id}.`);
             const removedPlaidIds = removed.map(t => t.transaction_id);
            try {
                const { error: deleteError, count: deletedCount } = await supabase
                    .from('transactions')
                    .delete({ count: 'exact' }) // Request count of deleted rows
                    .in('plaid_transaction_id', removedPlaidIds)
                    .eq('user_id', user.id);

                if (deleteError) {
                    console.error(`Sync API: Error deleting removed transactions for user ${user.id}:`, deleteError);
                    throw deleteError;
                }
                 console.log(`Sync API: Successfully processed ${deletedCount || 0} removed transactions for user ${user.id}.`);
            } catch (error) {
                 console.error(`Sync API: Database error during bulk delete for user ${user.id}:`, error);
                 return NextResponse.json({ message: "Error deleting removed transactions", error: error.message }, { status: 500 });
            }
        }

        console.log(`Sync API: Sync completed successfully for user ${user.id}.`);
        return NextResponse.json({
            message: "Sync successful",
            // Include the actual arrays for the Redux slice
            added: added,
            modified: modified,
            removed: removed,
            // Keep counts if you want them, or remove if redundant
            addedCount: added.length,
            modifiedCount: modified.length,
            removedCount: removed.length,
            nextCursor: cursor
        }, { status: 200 });

    } catch (error) {
        // Catch errors from Plaid client or other unexpected issues
        console.error("Sync API: Unhandled error during sync process:", error);
        const errorMessage = error.response?.data?.error_message || error.message || "Unknown error during sync";
        const errorCode = error.response?.data?.error_code || 'UNKNOWN_SYNC_ERROR';
        return NextResponse.json({ message: "Failed to sync transactions", error: errorMessage, errorCode: errorCode }, { status: 500 });
    }
}