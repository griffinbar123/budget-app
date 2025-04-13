// app/api/categories/uncategorized/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (userError){
        return NextResponse.json({message: "could not get user"}, {status: 500})
    }

    // Find the "Uncategorized" category for the current user.
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Uncategorized') // IMPORTANT: Match your category name
      .single(); // Expect only one

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ message: 'Uncategorized category not found' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 }); // Return the entire object.

  } catch (error) {
    console.error("Error fetching Uncategorized category:", error);
    return NextResponse.json({ message: "Error fetching Uncategorized category", error: error.message }, { status: 500 });
  }
}