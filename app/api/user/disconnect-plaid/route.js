// app/api/user/disconnect-plaid/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';


export async function DELETE(request) {
  try {
    const supabase = await createClient();
        const {
          data: { user }, error: userError
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (userError) {
            return NextResponse.json({message: "Could not get user"}, {status: 500})
        }

    // Update user metadata to clear Plaid info - CORRECTED
    const { error } = await supabase.auth.updateUser({
        data: {
            plaid_access_token: null,
            plaid_item_id: null,
            plaid_cursor: null
        }
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "Plaid account disconnected successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error disconnecting Plaid account:", error);
    return NextResponse.json({ message: "Error disconnecting Plaid account", error: error.message }, { status: 500 });
  }
}