// app/api/plaid/exchange-public-token/route.js
import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createClient } from '@/app/utils/supabase/server';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
     if(userError) {
            console.error(userError)
            return NextResponse.json({message: "Could not get user"}, {status: 500})
     }

    const { public_token } = await request.json();
    console.log("Received public_token:", public_token);

    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    console.log("Plaid tokenResponse:", tokenResponse);

    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;

    console.log('Access Token:', accessToken);
    console.log('Item ID:', itemId);

    // Store Plaid info in user_metadata - CORRECTED
        const { error } = await supabase.auth.updateUser({
            data: {
                plaid_access_token: accessToken,
                plaid_item_id: itemId,
                plaid_cursor: null, // Initialize cursor
            }
        });


    if (error) {
      throw error; // Re-throw to be caught by the outer catch
    }

    return NextResponse.json({ success: true, message: "Access token exchanged and stored successfully." }, {status: 200});

  } catch (error) {
    console.error("Error exchanging public token:", error);
    return NextResponse.json({ message: "Failed to exchange public token", error: error.message }, { status: 500 });
  }
}