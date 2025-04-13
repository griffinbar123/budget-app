// app/api/plaid/create-link-token/route.js
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
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        //in a real app, get user id from database.
        const clientUserId = user.id;
        const plaidRequest = {
            user: {
                // This should be a unique ID representing the user in *your* system.
                client_user_id: clientUserId,
            },
            client_name: 'WalletCanvas', // Replace with your app name
            products: ['transactions'], // Add other products as needed (e.g., 'auth', 'identity')
            language: 'en',
            country_codes: ['US'], // Replace with your supported country codes
        };
        
        const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);

        return NextResponse.json(createTokenResponse.data);

    } catch (error) {
        console.error("Error creating link token:", error);
        return NextResponse.json({ message: "Failed to create link token", error: error.message,  }, { status: 500 });
    }
}