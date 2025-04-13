// app/api/income-sources/route.js
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
      .from('income_sources')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    console.error("Error fetching income sources:", error);
    return NextResponse.json({ message: "Error fetching income sources", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const newSource = await request.json();

        if (!newSource.name) {
          return NextResponse.json({ message: "Missing required field: name" }, { status: 400 });
        }
        const { data, error } = await supabase
            .from('income_sources')
            .insert([
                {
                    user_id: user.id,
                    name: newSource.name,
                }
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }
        return NextResponse.json(data, { status: 201 });

    } catch(error) {
        console.error("Error adding income source", error);
        return NextResponse.json({message: "Error adding income source", error: error.message}, {status: 500})
    }
}