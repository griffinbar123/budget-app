// /app/api/transactions/[id]/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'; // Import server client helper

// --- GET Handler (Fetch Single Transaction by ID) ---
export async function GET(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Auth Error fetching transaction:", userError);
            return NextResponse.json({ message: userError?.message || "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id, 10); // Specify radix 10
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid transaction ID" }, { status: 400 });
        }

        // Fetch transaction and join related category/source data if needed
        const { data, error } = await supabase
            .from('transactions')
            .select('*, category:categories(id, name, type), source:income_sources(id, name)')
            .eq('user_id', user.id) // Ensure user owns the transaction
            .eq('id', id)
            .single(); // Expect exactly one row

        if (error) {
             // Handle case where .single() finds no rows (PGRST116) or multiple rows
             if (error.code === 'PGRST116') {
                return NextResponse.json({ message: "Transaction not found or permission denied" }, { status: 404 });
            }
            console.error("Supabase GET transaction error:", error);
            throw error; // Re-throw other errors to be caught below
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("API Error fetching transaction:", error);
        return NextResponse.json({ message: "Error fetching transaction", error: error.message }, { status: 500 });
    }
}


// --- PUT Handler (Update Transaction by ID - Handles Partial Updates) ---
export async function PUT(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ message: userError?.message || "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id, 10);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid transaction ID" }, { status: 400 });
        }

        // Get data from request body
        let requestData;
        try {
            requestData = await request.json();
        } catch (e) {
            return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
        }


        // Build update object dynamically, mapping camelCase from request to snake_case for DB
        const fieldsToUpdate = {};

        if (requestData.date !== undefined) fieldsToUpdate.date = requestData.date; // Validate date format if needed
        if (requestData.description !== undefined) fieldsToUpdate.description = requestData.description;
        if (requestData.amount !== undefined && typeof requestData.amount === 'number') {
            fieldsToUpdate.amount = requestData.amount;
        } else if (requestData.amount !== undefined) {
             console.warn(`Invalid 'amount' received for transaction update ${id}:`, requestData.amount);
             // Return error or ignore invalid amount? Let's return error.
              return NextResponse.json({ message: "Invalid 'amount' field provided" }, { status: 400 });
        }
        if (requestData.type !== undefined) fieldsToUpdate.type = requestData.type; // Validate type if needed

        // Map incoming 'categoryId' to database 'category_id'
        if (requestData.categoryId !== undefined) {
            // Allow setting category_id to null
            fieldsToUpdate.category_id = requestData.categoryId ? parseInt(requestData.categoryId, 10) : null;
            if (requestData.categoryId && isNaN(fieldsToUpdate.category_id)) {
                  return NextResponse.json({ message: "Invalid categoryId provided" }, { status: 400 });
             }
        }
        // Map incoming 'sourceId' to database 'source_id'
        if (requestData.sourceId !== undefined) {
             fieldsToUpdate.source_id = requestData.sourceId ? parseInt(requestData.sourceId, 10) : null;
              if (requestData.sourceId && isNaN(fieldsToUpdate.source_id)) {
                  return NextResponse.json({ message: "Invalid sourceId provided" }, { status: 400 });
             }
        }
        // Add mappings for other potentially updatable fields if necessary (e.g., account_id)
        // if (requestData.accountId !== undefined) fieldsToUpdate.account_id = requestData.accountId;


        // Check if there's actually anything valid to update
        if (Object.keys(fieldsToUpdate).length === 0) {
             return NextResponse.json({ message: "No valid fields provided for update" }, { status: 400 });
        }

        // --- Database Update Logic ---
        const { data, error } = await supabase
            .from('transactions')
            .update(fieldsToUpdate) // Pass only the fields that were actually sent & mapped
            .eq('id', id)
            .eq('user_id', user.id) // Ensure user owns the transaction
            .select('*, category:categories(id, name, type), source:income_sources(id, name)') // Reselect potentially joined data
            .single(); // Expect one row to be updated and returned

        if (error) {
             if (error.code === 'PGRST116') { // Error code if 0 rows match the .eq filters
                return NextResponse.json({ message: "Transaction not found or permission denied" }, { status: 404 });
            }
            console.error("Supabase PUT transaction error:", error);
            throw error; // Re-throw other errors to be caught below
        }

        return NextResponse.json(data, { status: 200 }); // Return updated transaction

    } catch (error) {
        console.error("API Error updating transaction:", error);
        // Handle potential JSON parsing errors specifically
        if (error instanceof SyntaxError) {
             return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
        }
        // Generic error for other issues
        return NextResponse.json({ message: "Error updating transaction", error: error.message }, { status: 500 });
    }
}


// --- DELETE Handler (Delete Transaction by ID) ---
export async function DELETE(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Auth Error deleting transaction:", userError);
            return NextResponse.json({ message: userError?.message || "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id, 10);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid transaction ID" }, { status: 400 });
        }

        // Perform deletion scoped to the user
        const { error, count } = await supabase
            .from('transactions')
            .delete({ count: 'exact' }) // Get count of deleted rows
            .eq('id', id)
            .eq('user_id', user.id); // Important: Ensure user owns the transaction

        if (error) {
            console.error("Supabase delete transaction error:", error);
            throw error; // Let the catch block handle it
        }

        // Check if any row was actually deleted
        if (count === 0) {
             return NextResponse.json({ message: "Transaction not found or permission denied" }, { status: 404 });
        }

        // Successfully deleted, return 204 No Content
        // Note: NextResponse(null, ...) is standard for 204
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("API Error deleting transaction:", error);
        return NextResponse.json({ message: "Error deleting transaction", error: error.message }, { status: 500 });
    }
}