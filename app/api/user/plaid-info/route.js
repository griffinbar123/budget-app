// app/api/user/plaid-info/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
        if(userError){
            console.error(userError)
            return NextResponse.json({message: "Could not get user"}, {status: 500})
        }

    // Access Plaid info directly from user.user_metadata - CORRECT
    const plaidInfo = {
        itemId: user.user_metadata?.plaid_item_id ?? null, // CORRECT
        plaidCursor: user.user_metadata?.plaid_cursor ?? null, // CORRECT
    };

    return NextResponse.json(plaidInfo, { status: 200 });

  } catch (error) {
    console.error("Error fetching Plaid info:", error);
    return NextResponse.json({ message: "Error fetching Plaid info", error: error.message }, { status: 500 });
  }
}