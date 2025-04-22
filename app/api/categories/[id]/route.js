// /app/api/categories/[id]/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// --- GET Handler (Keep as is) ---
export async function GET(request, { params }) {
    // ... (previous code) ...
     try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
             console.error("Auth Error fetching category:", userError);
            return NextResponse.json({ message: "Authentication error" }, { status: 401 });
        }
        if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id) // Ensure user owns the category
            .eq('id', id)
            .single(); // Expect exactly one row

        if (error) {
             if (error.code === 'PGRST116') {
                return NextResponse.json({ message: "Category not found" }, { status: 404 });
            }
            console.error("Supabase GET category error:", error);
            throw error; // Re-throw other errors
        }
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("API Error fetching category:", error);
        return NextResponse.json({ message: "Error fetching category" }, { status: 500 });
    }
}

// --- PUT Handler (Keep as is, assumes UI prevents editing name *of* Uncategorized) ---
export async function PUT(request, { params }) {
    // ... (previous code) ...
     try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
             console.error("Auth Error updating category:", userError);
            return NextResponse.json({ message: "Authentication error" }, { status: 401 });
        }
        if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
         if (isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
        }

        const updatedCategory = await request.json();
        if (!updatedCategory.name || !updatedCategory.type || typeof updatedCategory.plannedAmount !== 'number') {
            return NextResponse.json({ message: "Missing or invalid required fields: name, type, plannedAmount" }, { status: 400 });
        }
        if (updatedCategory.type !== "expense" && updatedCategory.type !== "reserve") {
            return NextResponse.json({ message: "Invalid category type" }, { status: 400 });
        }

        // Consider adding a check here if name === 'Uncategorized' and id corresponds to the original default one
        // if (isTryingToEditTheDefaultUncategorizedName) { return error; }

        const { data, error } = await supabase
            .from('categories')
            .update({
                name: updatedCategory.name.trim(), // Trim name on update too
                type: updatedCategory.type,
                planned_amount: parseFloat(updatedCategory.plannedAmount)
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
             if (error.code === 'PGRST116') {
                return NextResponse.json({ message: "Category not found or permission denied" }, { status: 404 });
            }
            console.error("Supabase PUT category error:", error);
            throw error;
        }
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("API Error updating category:", error);
        return NextResponse.json({ message: "Error updating category" }, { status: 500 });
    }
}

// --- DELETE Handler (Modified to Prevent Deleting 'Uncategorized') ---
export async function DELETE(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("Auth Error deleting category:", userError);
            return NextResponse.json({ message: "Authentication error" }, { status: 401 });
        }
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
        }

        // --- Check if the category being deleted is 'Uncategorized' ---
        const { data: categoryToDelete, error: fetchErr } = await supabase
            .from('categories')
            .select('name')
            .eq('id', id)
            .eq('user_id', user.id)
            .maybeSingle(); // Use maybeSingle to handle not found case gracefully

        if (fetchErr) {
             console.error("Error fetching category name before delete:", fetchErr);
             throw fetchErr; // Let the main catch handle it
        }

        if (!categoryToDelete) {
             // Category doesn't exist or doesn't belong to user
             return NextResponse.json({ message: "Category not found or permission denied" }, { status: 404 });
        }

        if (categoryToDelete.name === 'Uncategorized') {
             // Prevent deletion of the specific 'Uncategorized' category
             return NextResponse.json({ message: "Cannot delete the default 'Uncategorized' category." }, { status: 400 }); // 400 Bad Request
        }
        // --- END Check ---


        // --- Proceed with Deletion ---
        const { error: deleteError, count } = await supabase
            .from('categories')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('user_id', user.id); // Re-check user_id for safety

        if (deleteError) {
            console.error("Supabase delete category error:", deleteError);
            throw deleteError;
        }

        // If count is 0 here, it implies a race condition or inconsistency, but we already checked existence.
        // Still good practice to check count if needed, but the fetch above mostly covers it.
        // if (count === 0) {
        //     return NextResponse.json({ message: "Category not found or permission denied during delete" }, { status: 404 });
        // }

        // Successfully deleted, return 204 No Content
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("API Error deleting category:", error);
        return NextResponse.json({ message: "Error deleting category" }, { status: 500 });
    }
}