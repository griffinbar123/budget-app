// app/api/income-sources/[id]/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

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
        return NextResponse.json({ message: "Invalid income source ID" }, { status: 400 });
     }

    const { data, error } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', user.id) // Ensure the user owns the income source
      .eq('id', id)
      .single(); // Retrieve a single record

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ message: "Income source not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching income source:", error);
    return NextResponse.json({ message: "Error fetching income source", error: error.message }, { status: 500 });
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
            return NextResponse.json({ message: "Invalid income source ID" }, { status: 400 });
        }

        const updatedSource = await request.json();

        // Input validation (add more as needed)
        if (!updatedSource.name) {
            return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('income_sources')
            .update({
                name: updatedSource.name, // Update the name
                // ... other fields you allow updating ...
            })
            .eq('id', id)
            .eq('user_id', user.id) // Ensure the user owns the income source
            .select()
            .single()

        if (error) {
            throw error;
        }
        if (!data) {
          return NextResponse.json({ message: "Income source not found or you don't have permission to update it" }, { status: 404 });
        }


        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Error updating income source:", error);
        return NextResponse.json({ message: "Error updating income source", error: error.message }, { status: 500 });
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
            return NextResponse.json({ message: "Invalid income source ID" }, { status: 400 });
        }


    const { error } = await supabase
      .from('income_sources')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure the user owns the income source

    if (error) {
      throw error;
    }

        return NextResponse.json({ message: "Income Source deleted successfully" }, { status: 204 });


    } catch (error) {
        console.error("Error deleting income source:", error);
        return NextResponse.json({ message: "Error deleting income source", error: error.message }, { status: 500 });
    }
}