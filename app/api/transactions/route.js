// app/api/transactions/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(id, name, type), source:income_sources(id, name)')
      .eq('user_id', user.id) // Important: Fetch only the user's transactions
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    // No changes needed here.  We fetch *all* transactions for the user,
    // regardless of whether they have a Plaid account connected.
    return NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ message: "Error fetching transactions", error: error.message }, { status: 500 });
  }
}


export async function POST(request) {
  try {
      const supabase = await createClient();
      const {
          data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const newTransaction = await request.json();
      // Input Validation
      if (!newTransaction.date || !newTransaction.description || typeof newTransaction.amount !== 'number' || !newTransaction.type) {
          return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
      }
      if(newTransaction.type == 'expense' && !newTransaction.categoryId) {
          return NextResponse.json({message: 'Missing required field: categoryId'}, {status: 400})
      }
       if(newTransaction.type == 'income' && !newTransaction.sourceId) {
          return NextResponse.json({message: 'Missing required field: sourceId'}, {status: 400})
      }

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
          user_id: user.id,
          date: new Date(newTransaction.date),
          amount: parseFloat(newTransaction.amount),
          category_id: newTransaction.categoryId ? parseInt(newTransaction.categoryId) : null,
          source_id: newTransaction.sourceId ? parseInt(newTransaction.sourceId) : null,
          description: newTransaction.description, // Explicitly set
          type: newTransaction.type,             // Explicitly set
          account_id: newTransaction.accountId,
          plaid_category_id: newTransaction.plaidCategoryId,
          plaid_transaction_id: newTransaction.plaidTransactionId,
          from_account_id: newTransaction.fromAccountId,
          to_account_id: newTransaction.toAccountId
      }
    ])
    .select('*, category:categories(id, name, type), source:income_sources(id, name)') //select for return
    .single(); // Return single object

  if (error) {
    console.error("Error inserting transaction:", error);
    return NextResponse.json({ message: "Error inserting transaction", error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });


} catch (error) {
  console.error("Error adding transaction:", error);
  return NextResponse.json({ message: "Error adding transaction", error: error.message }, { status: 500 });
}
}