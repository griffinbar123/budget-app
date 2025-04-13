// app/api/categories/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request) {
  try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name'); // Example: Sort alphabetically

    if (error) {
      throw error;
    }

    return NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ message: "Error fetching categories", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const newCategory = await request.json();

        // Input validation (REQUIRED)
        if (!newCategory.name || !newCategory.type) {
            return NextResponse.json({ message: "Missing required fields: name and type" }, { status: 400 }); // 400 Bad Request
        }

        if (typeof newCategory.name !== 'string' || newCategory.name.trim() === '') {
          return NextResponse.json({ message: "Category name must be a non-empty string" }, { status: 400 });
        }

        if (newCategory.type !== 'expense' && newCategory.type !== 'reserve') {
            return NextResponse.json({ message: "Invalid category type. Must be 'expense' or 'reserve'." }, { status: 400 });
        }
        if (typeof newCategory.plannedAmount !== 'number') {
            return NextResponse.json({message: 'planned amount must be a number'}, {status: 400})
        }
        const { data, error } = await supabase
            .from('categories')
            .insert([
                {
                    user_id: user.id,
                    name: newCategory.name,
                    type: newCategory.type,
                    planned_amount: parseFloat(newCategory.plannedAmount), // Ensure it's a number
                }
            ])
            .select() // Return the newly created category
            .single();

        if (error) {
            console.error("Error inserting category:", error);
             return NextResponse.json({ message: "Error inserting category", error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 }); // 201 Created

    } catch (error) {
        console.error("Error adding category:", error);
        return NextResponse.json({ message: "Error adding category", error: error.message }, { status: 500 });
    }
}