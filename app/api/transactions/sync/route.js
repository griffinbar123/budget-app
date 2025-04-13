// app/api/transactions/sync/route.js
import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createClient } from '@/app/utils/supabase/server';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV], // Use your environment variable
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("User:", user); // Log the user object

        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if(userError) {
           return NextResponse.json({ message: "Could not get user", error: userError.message }, { status: 500 })
        }

        if (!user.user_metadata || !user.user_metadata.plaid_access_token) {
            return NextResponse.json({ message: "Plaid access token not found for user." }, { status: 400 });
        }
        const accessToken = user.user_metadata.plaid_access_token;
        let cursor = user.user_metadata.plaid_cursor || null;
        console.log("accessToken:", accessToken); // Log the access token
        console.log("Initial cursor:", cursor); // Log the initial cursor

        let added = [];
        let modified = [];
        let removed = [];
        let hasMore = true;

        while (hasMore) {
            console.log("Calling Plaid transactionsSync with cursor:", cursor);
            const syncResponse = await plaidClient.transactionsSync({
                access_token: accessToken,
                cursor: cursor,
            });

            console.log("Plaid transactionsSync Response:", syncResponse); // Log the ENTIRE response
            const data = syncResponse.data;

            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);
            cursor = data.next_cursor;
            hasMore = data.has_more;

            console.log("Added Transactions:", added.length);
            console.log("Modified Transactions:", modified.length);
            console.log("Removed Transactions:", removed.length);
            console.log("Next Cursor:", cursor);
            console.log("Has More:", hasMore);
        }
        console.log("Finished fetching transactions from Plaid.");

        // Update cursor
        try {
            console.log("Updating cursor in database to:", cursor);
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    plaid_cursor: cursor
                }
            });
            if (updateError) {
                throw updateError; // Throw to be caught by outer catch
            }
            console.log("Cursor updated successfully.");
        } catch (updateError) {
            console.error("Error updating cursor:", updateError);
            return NextResponse.json({ message: "Error updating cursor", error: updateError.message }, { status: 500 });
        }


    // Fetch the "Uncategorized" category ID.
    let uncategorizedCategoryId;
    try {
        const { data: uncategorizedCategory, error: uncategorizedError } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', 'Uncategorized')
          .single();

        if (uncategorizedError) {
            throw uncategorizedError; // Throw to be caught by outer catch
        }

        if (!uncategorizedCategory) {
            console.error("Uncategorized category not found.");
            return NextResponse.json({ message: 'Uncategorized category not found. Please create it.' }, { status: 500 });
        }

      uncategorizedCategoryId = uncategorizedCategory.id;
      console.log("Uncategorized Category ID:", uncategorizedCategoryId); // Log the ID

    } catch (error) {
        console.error("Error fetching Uncategorized category:", error);
        return NextResponse.json({ message: "Error fetching Uncategorized category", error: error.message }, { status: 500 });
    }


      try {
          // Process added transactions
          if (added.length > 0) {
            console.log("Inserting added transactions:", added);
            const transactionsToInsert = added.map(transaction => ({
                user_id: user.id,
                account_id: transaction.account_id,
                date: new Date(transaction.date),
                description: transaction.name,
                amount: -parseFloat(transaction.amount),
                type: transaction.amount > 0 ? 'income' : 'expense',
                category_id: uncategorizedCategoryId,
                source_id: null,
                plaid_category_id: transaction.category_id,
                plaid_transaction_id: transaction.transaction_id,
                from_account_id: transaction.transfer_from_account_id,
                to_account_id: transaction.transfer_to_account_id,
            }));

            const { data: insertedData, error: insertError } = await supabase
                .from('transactions')
                .insert(transactionsToInsert)
                .select('*, category:categories(id, name, type), source:income_sources(id, name)');

            console.log("Insert Result:", insertedData, insertError); // Log the result
            if (insertError) {
                throw insertError; // Throw to be caught by outer catch
            }
          }
      } catch(error) {
          console.error("Error inserting transactions", error)
          return NextResponse.json({message: "Error inserting transactions", error: error.message}, {status: 500})
      }

      // Process modified transactions
    try{
        for (const transaction of modified) {
            console.log("Updating:", transaction);
            const { data, error } = await supabase
                .from('transactions')
                .update({
                    date: new Date(transaction.date),
                    description: transaction.name,
                    amount: -parseFloat(transaction.amount),
                    type: transaction.amount > 0 ? 'income' : 'expense',
                    category_id: uncategorizedCategoryId,
                    source_id: null,
                    account_id: transaction.account_id,
                    plaid_category_id: transaction.category_id,
                    from_account_id: transaction.transfer_from_account_id,
                    to_account_id: transaction.transfer_to_account_id,
                })
                .eq('plaid_transaction_id', transaction.transaction_id)
                .eq('user_id', user.id)
                .select(); //select
               

            console.log("Update Result:", data, error); // Log the result
            if (error) {
               throw error
            }
        }
      } catch(error) {
          console.error("Error updating transaction:", error);
          return NextResponse.json({ message: "Error updating transaction in Supabase", error: error.message }, { status: 500 });
      }

      // Process removed transactions
    try {
        for (const transaction of removed) {
            console.log("Deleting:", transaction);
            const { error, data } = await supabase
                .from('transactions')
                .delete()
                .eq('plaid_transaction_id', transaction.transaction_id)
                .eq('user_id', user.id);
             console.log("Delete Result:", data, error); // Log the result

            if (error) {
              throw error;
            }
        }
      } catch (error) {
            console.error("Error deleting transaction:", error);
            return NextResponse.json({ message: "Error deleting transaction", error: error.message }, { status: 500 });

      }

    return NextResponse.json({ added, modified, removed, nextCursor: cursor }, { status: 200 });

  } catch (error) {
    console.error("Error syncing transactions:", error);
    return NextResponse.json({ message: "Failed to sync transactions", error: error.message }, { status: 500 });
  }
}