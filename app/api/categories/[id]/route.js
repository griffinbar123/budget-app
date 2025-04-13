// app/api/categories/[id]/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request, { params }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
        }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ message: "Error fetching category", error: error.message }, { status: 500 });
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
            return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
        }

        const updatedCategory = await request.json();
         if (!updatedCategory.name || !updatedCategory.type) {
            return NextResponse.json({ message: "Missing required fields: name and type are required" }, { status: 400 });
        }
        if(updatedCategory.type != "expense" && updatedCategory.type != "reserve"){
            return NextResponse.json({ message: "Invalid category type" }, { status: 400 });
        }
         if (typeof updatedCategory.plannedAmount !== 'number') {
            return NextResponse.json({ message: "plannedAmount must be a number" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('categories')
            .update({  // Explicitly update ONLY these fields:
                name: updatedCategory.name,
                type: updatedCategory.type,
                planned_amount: parseFloat(updatedCategory.plannedAmount)
            })
            .eq('id', id)
            .eq('user_id', user.id) // Ensure user owns the category
            .select() //return
            .single();

        if (error) {
            throw error;
        }
         if (!data) {
          return NextResponse.json({ message: "Category not found or you don't have permission to update it" }, { status: 404 });
        }


        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Error updating category", error);
        return NextResponse.json({ message: "Error updating category", error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, {params}) {
    try {
        const supabase = await createClient();
        const { data: {user} } = await supabase.auth.getUser();
        if(!user) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401})
        }
        const id = parseInt(params.id)
         if (!id) {
            return NextResponse.json({ message: "Missing category ID" }, { status: 400 });
        }
        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        if(error) {
            throw error;
        }
        return NextResponse.json({message: "category deleted successfully"}, {status: 204})
    } catch(error) {
        console.error("API Error deleting category:", error);
        return NextResponse.json({ message: "Error deleting category", error: error.message }, { status: 500 });
    }
}