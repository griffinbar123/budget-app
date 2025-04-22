// /app/api/transactions/sync/route.js (Updated: Removed find-or-create for Uncategorized)
import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createClient } from '@/app/utils/supabase/server';

// --- Plaid Configuration ---
const plaidEnv = process.env.PLAID_ENV === 'sandbox' ? PlaidEnvironments.sandbox :
                 process.env.PLAID_ENV === 'development' ? PlaidEnvironments.development :
                 PlaidEnvironments.production;

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
    let supabase; // Define supabase outside try blocks if used in multiple
    let user;     // Define user outside try blocks

    try {
        // --- Get Authenticated User ---
        supabase = await createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        user = userData?.user; // Extract user object

        console.log("Sync API: User ID Attempting Sync:", user?.id);

        if (userError || !user) {
            console.warn("Sync API: Unauthorized access attempt or error getting user.", userError);
            const status = userError ? 500 : 401;
            const message = userError ? "Could not get user" : "Unauthorized";
            return NextResponse.json({ message, error: userError?.message }, { status });
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
            });
            console.log(`Sync API: Plaid transactionsSync Response received for user ${user.id}`);
            const data = syncResponse.data;

            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);
            cursor = data.next_cursor;
            hasMore = data.has_more;

            console.log(`Sync API: User ${user.id} - Added: ${data.added.length}, Modified: ${data.modified.length}, Removed: ${data.removed.length}, Has More: ${hasMore}, Next Cursor: ${cursor}`);
        }
        console.log(`Sync API: Finished fetching transactions from Plaid for user ${user.id}. Total Added: ${added.length}, Modified: ${modified.length}, Removed: ${removed.length}`);

        // --- Update Plaid Cursor in Supabase User Metadata ---
        // Doing this *before* processing transactions ensures we don't re-fetch if DB insert fails
        try {
            console.log(`Sync API: Updating cursor in database for user ${user.id} to:`, cursor);
            const { error: updateError } = await supabase.auth.updateUser({
                data: { plaid_cursor: cursor }
            });
            if (updateError) {
                // Log error but maybe don't stop the whole sync? Decide strategy.
                // For now, we throw to let outer catch handle it.
                console.error(`Sync API: Error updating cursor for user ${user.id}:`, updateError);
                throw new Error(`Failed to update Plaid cursor: ${updateError.message}`);
            }
            console.log(`Sync API: Cursor updated successfully for user ${user.id}.`);
        } catch (cursorUpdateError) {
             // Let outer catch block handle the error response
             throw cursorUpdateError;
        }

        // --- Fetch the REQUIRED "Uncategorized" Category ID ---
        // Assumes the trigger/signup logic has already created it.
        let uncategorizedCategoryId;
        try {
            console.log("Sync API: Fetching REQUIRED 'Uncategorized' category for user:", user.id);
            const { data: uncategorizedCategory, error: uncategorizedError } = await supabase
              .from('categories')
              .select('id')
              .eq('user_id', user.id)
              .eq('name', 'Uncategorized') // Find by the exact name
              .single(); // Use .single() - expects exactly one row, throws error if 0 or >1

            if (uncategorizedError) {
                // This error includes the case where 0 or multiple rows are returned by .single()
                console.error(`Sync API: Critical - Could not find 'Uncategorized' category for user ${user.id}. RLS/Trigger issue?`, uncategorizedError);
                // Throw a specific error to be caught by the outer handler
                throw new Error(`Default 'Uncategorized' category missing or inaccessible: ${uncategorizedError.message}`);
            }

            uncategorizedCategoryId = uncategorizedCategory.id;
            console.log(`Sync API: Found 'Uncategorized' category ID: ${uncategorizedCategoryId} for user ${user.id}`);

        } catch (error) {
             // Catch errors specifically from trying to get the category ID
            console.error(`Sync API: Error fetching REQUIRED Uncategorized category for user ${user.id}:`, error);
            // Return a specific error - the app cannot proceed without this category ID
            return NextResponse.json({ message: "Critical setup error: Default 'Uncategorized' category missing or inaccessible.", error: error.message }, { status: 500 });
        }
        // --- END Fetch Category ID ---

        // --- Process Added Transactions using UPSERT ---
        if (added.length > 0) {
            console.log(`Sync API: Processing ${added.length} added transactions for user ${user.id} using category ID ${uncategorizedCategoryId}`);
            const transactionsToUpsert = added.map(transaction => ({
                user_id: user.id,
                account_id: transaction.account_id,
                plaid_transaction_id: transaction.transaction_id,
                date: transaction.date,
                description: transaction.name,
                amount: -transaction.amount, // Invert Plaid's amount sign
                type: transaction.amount >= 0 ? 'expense' : 'income',
                category_id: uncategorizedCategoryId, // Default category
                source_id: null,
                plaid_category_id: transaction.category_id,
            }));

            try {
                 const { data: upsertedData, error: upsertError } = await supabase
                    .from('transactions')
                    .upsert(transactionsToUpsert, { onConflict: 'plaid_transaction_id' })
                    .select('id'); // Select only ID for efficiency check

                 if (upsertError) throw upsertError; // Throw to outer catch

                 console.log(`Sync API: Successfully processed (upserted) ${transactionsToUpsert.length} potential new transactions for user ${user.id}. Response count: ${upsertedData?.length || 0}`);

            } catch (error) {
                console.error(`Sync API: Database error during bulk upsert for user ${user.id}.`, error);
                 // Throw error to outer catch block
                throw new Error(`Error processing new transactions: ${error.message}`);
            }
        }

        // --- Process Modified Transactions ---
        if (modified.length > 0) {
            console.log(`Sync API: Processing ${modified.length} modified transactions for user ${user.id}.`);
            for (const transaction of modified) {
                try {
                    // Note: Using plaid_transaction_id for matching assumes it's unique per user
                    const { data: updatedData, error: updateError } = await supabase
                        .from('transactions')
                        .update({
                            date: transaction.date,
                            description: transaction.name,
                            amount: -transaction.amount,
                            type: transaction.amount >= 0 ? 'expense' : 'income',
                            plaid_category_id: transaction.category_id,
                            account_id: transaction.account_id,
                            // We explicitly DO NOT update category_id here to preserve manual assignments
                        })
                        .eq('plaid_transaction_id', transaction.transaction_id)
                        .eq('user_id', user.id)
                        .select('id'); // Check if row was found/updated

                    if (updateError) throw updateError; // Throw to outer catch

                    if (updatedData && updatedData.length > 0) {
                        console.log(`Sync API: Successfully updated transaction ${updatedData[0].id} (Plaid ID: ${transaction.transaction_id}) for user ${user.id}.`);
                    } else {
                         console.warn(`Sync API: Modified transaction with Plaid ID ${transaction.transaction_id} not found for user ${user.id} during update.`);
                    }
                } catch (error) {
                    console.error(`Sync API: Error processing modification for Plaid transaction ${transaction.transaction_id} for user ${user.id}:`, error);
                    // Decide if one failure should stop all modifications
                     throw new Error(`Error processing modified transaction ${transaction.transaction_id}: ${error.message}`); // Let outer catch handle it
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
                    .delete({ count: 'exact' })
                    .in('plaid_transaction_id', removedPlaidIds)
                    .eq('user_id', user.id);

                if (deleteError) throw deleteError; // Throw to outer catch

                 console.log(`Sync API: Successfully processed (deleted) ${deletedCount || 0} removed transactions for user ${user.id}.`);
            } catch (error) {
                 console.error(`Sync API: Database error during bulk delete for user ${user.id}:`, error);
                  throw new Error(`Error deleting removed transactions: ${error.message}`); // Let outer catch handle it
            }
        }

        console.log(`Sync API: Sync completed successfully for user ${user.id}.`);
        // Return success response including the arrays for Redux state update
        return NextResponse.json({
            message: "Sync successful",
            added: added, // Return actual added transactions from Plaid
            modified: modified, // Return actual modified transactions from Plaid
            removed: removed, // Return actual removed transactions from Plaid
            nextCursor: cursor
        }, { status: 200 });

    } catch (error) {
        // Catch errors from Plaid client calls, DB operations, or other unexpected issues
        console.error("Sync API: Overall error during sync process:", error);
        const errorMessage = error.response?.data?.error_message // Plaid error structure
                           || error.message                    // General JS Error/DB Error
                           || "Unknown error during sync";
        const errorCode = error.response?.data?.error_code || // Plaid error code
                          error.code ||                       // DB error code
                          'UNKNOWN_SYNC_ERROR';
        return NextResponse.json({ message: "Failed to sync transactions", error: errorMessage, errorCode: errorCode }, { status: 500 });
    }
}