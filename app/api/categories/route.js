// /app/api/categories/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// --- GET Handler (Keep as is) ---
export async function GET(request) {
  try {
        const supabase = await createClient();
        const {
          data: { user }, error: userError // Check user error
        } = await supabase.auth.getUser();

        if (userError) {
            console.error("Auth Error fetching categories:", userError);
            return NextResponse.json({ message: "Authentication error" }, { status: 401 });
        }
        if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name'); // Example: Sort alphabetically

        if (error) {
            console.error("Supabase GET categories error:", error);
            throw error; // Re-throw
        }

        // Return the array inside a 'data' property for consistency
        return NextResponse.json({ data: data || [] }, { status: 200 });

    } catch (error) {
        console.error("API Error fetching categories:", error);
        return NextResponse.json({ message: "Error fetching categories" }, { status: 500 });
    }
}

// --- POST Handler (Modified for Duplicate Check) ---
export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

         if (userError) {
            console.error("Auth Error adding category:", userError);
            return NextResponse.json({ message: "Authentication error" }, { status: 401 });
        }
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const newCategory = await request.json();

        // --- Input validation ---
        if (!newCategory.name || !newCategory.type || typeof newCategory.plannedAmount !== 'number') {
            return NextResponse.json({ message: "Missing or invalid required fields: name, type, plannedAmount" }, { status: 400 });
        }
        const categoryName = newCategory.name.trim(); // Trim whitespace
        if (categoryName === '') {
          return NextResponse.json({ message: "Category name cannot be empty" }, { status: 400 });
        }
        if (newCategory.type !== 'expense' && newCategory.type !== 'reserve') { // Keep 'reserve' if type exists, adjust if needed
            return NextResponse.json({ message: "Invalid category type. Must be 'expense' or 'reserve'." }, { status: 400 });
        }
        // --- END Input validation ---

        // --- Duplicate Name Check (Case-Insensitive) ---
        const { count: existingCount, error: countError } = await supabase
            .from('categories')
            .select('id', { count: 'exact', head: true }) // Efficiently check existence
            .eq('user_id', user.id)
            .ilike('name', categoryName); // Case-insensitive check

        if (countError) {
            console.error("Supabase count categories error:", countError);
            throw countError; // Let the generic error handler catch it
        }

        if (existingCount && existingCount > 0) {
            // Name already exists for this user
            return NextResponse.json({ message: `Category name "${categoryName}" already exists.` }, { status: 409 }); // 409 Conflict
        }
        // --- END Duplicate Name Check ---

        // --- Insert new category ---
        const { data, error: insertError } = await supabase
            .from('categories')
            .insert({
                user_id: user.id,
                name: categoryName, // Use trimmed name
                type: newCategory.type,
                planned_amount: parseFloat(newCategory.plannedAmount),
            })
            .select() // Return the newly created category
            .single();

        if (insertError) {
            console.error("Supabase insert category error:", insertError);
             // Handle potential specific errors, e.g., unique constraint if somehow check failed
            throw insertError;
        }

        return NextResponse.json(data, { status: 201 }); // 201 Created

    } catch (error) {
        console.error("API Error adding category:", error);
        // Handle potential specific DB errors if needed (like unique constraint violation)
        return NextResponse.json({ message: "Error adding category" }, { status: 500 });
    }
}