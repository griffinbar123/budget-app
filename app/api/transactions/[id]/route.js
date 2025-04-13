// app/api/transactions/[id]/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'; // Import server client

export async function GET(request, { params }) {
  try {
        const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ message: "Invalid transaction ID" }, { status: 400 });
        }

    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(id, name, type), source:income_sources(id, name)')
      .eq('user_id', user.id) // Important: Fetch only the user's transactions
      .eq('id', id)
      .single() // Get a single transaction

    if (error) {
      throw error;
    }
    if(!data) {
        return NextResponse.json({message: "transaction not found"}, {status: 404})
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ message: "Error fetching transactions", error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ message: "Invalid transaction ID" }, { status: 400 });
        }

        const updatedTransaction = await request.json();

        // Input Validation (REQUIRED - and more comprehensive)
        if (!updatedTransaction.date || !updatedTransaction.description || typeof updatedTransaction.amount !== 'number' || !updatedTransaction.type) {
          return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }
        //check other types
        if (typeof updatedTransaction.date !== "string" || !updatedTransaction.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
        }
        if (updatedTransaction.type !== 'expense' && updatedTransaction.type !== 'income' && updatedTransaction.type != 'transfer'){
          return NextResponse.json({message: "Transaction type invalid"}, {status: 400})
        }
        //check for category id or source id
        if(updatedTransaction.type == 'expense' && !updatedTransaction.categoryId) {
          return NextResponse.json({message: 'Missing required field: categoryId'}, {status: 400})
        }
        if(updatedTransaction.type == 'income' && !updatedTransaction.sourceId) {
            return NextResponse.json({message: 'Missing required field: sourceId'}, {status: 400})
        }


        // Explicitly define the fields to update.
        const updateData = {
          date: new Date(updatedTransaction.date), // Convert to Date object
          description: updatedTransaction.description,
          amount: parseFloat(updatedTransaction.amount),
          type: updatedTransaction.type,
          category_id: updatedTransaction.categoryId ? parseInt(updatedTransaction.categoryId) : null, // Convert to integer
          source_id: updatedTransaction.sourceId ? parseInt(updatedTransaction.sourceId) : null, // Convert to integer
          account_id: updatedTransaction.accountId,  // Include if present
          plaid_category_id: updatedTransaction.plaidCategoryId,
          plaid_transaction_id: updatedTransaction.plaidTransactionId,
          from_account_id: updatedTransaction.fromAccountId, // For transfers
          to_account_id: updatedTransaction.toAccountId,     // For transfers
          // Do *NOT* include user_id here.  The user_id should NEVER be updated.
        };

        const { data, error } = await supabase
            .from('transactions')
            .update(updateData) // Update *only* the specified fields
            .eq('id', id)
            .eq('user_id', user.id) // Ensure the user owns the transaction
            .select('*, category:categories(id, name, type), source:income_sources(id, name)') // Fetch updated data with joins
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
          return NextResponse.json({ message: "Transaction not found or you don't have permission to update it" }, { status: 404 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Error updating transaction:", error);
        return NextResponse.json({ message: "Error updating transaction", error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ message: "Invalid transaction ID" }, { status: 400 });
        }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns the transaction

    if (error) {
      throw error;
    }

        return NextResponse.json({ message: "Transaction deleted successfully" }, { status: 204 }); // 204 No Content


    } catch (error) {
        console.error("Error deleting transaction:", error);
        return NextResponse.json({ message: "Error deleting transaction", error: error.message }, { status: 500 });
    }
}