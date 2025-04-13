// app/components/buttons/plaid-link-button.jsx
'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useEffect, useState } from 'react';
import PrimaryButton from './primary-button';
import { useDispatch } from 'react-redux';
import { fetchPlaidInfo, syncTransactions } from '../../store/transactionsSlice'; // Import

function PlaidLinkButton({ setError }) {
    const [token, setToken] = useState(null);
    const dispatch = useDispatch(); // Get dispatch

    const { open, ready, error: plaidError } = usePlaidLink({
        token: token,
        onSuccess: async (public_token, metadata) => {
            const response = await fetch('/api/plaid/exchange-public-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ public_token }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Token exchange failed:', response.status, errorText);
                setError(`Token exchange failed: ${response.status} - ${errorText}`);
                return;
            }

            const data = await response.json();
            console.log('Token exchange successful! Response:', data);
            dispatch(fetchPlaidInfo()); // Fetch Plaid info (item_id, etc.)
            dispatch(syncTransactions()); //  <-- Dispatch syncTransactions here!
        },
        onExit: (err, metadata) => { /* ... */ },
        onEvent: (eventName, metadata) => { /* ... */ },
    });

    useEffect(() => {
        const fetchLinkToken = async () => {
           // ... (same as before) ...
           try {
                const response = await fetch('/api/plaid/create-link-token', {
                    method: 'POST',
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch link token: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                setToken(data.link_token);

            } catch (error) {
                console.error("Error fetching link token:", error);
                setError(error.message);
            }
        };
         if (!token) {
            fetchLinkToken();
        }
    }, [setError, token, open]);

    if (plaidError) {
        return <div>Error: {plaidError.message}</div>;
    }

    return (
        <PrimaryButton
            onClick={() => ready && token && open()}
            disabled={!ready || !token}
        >
            Connect Bank Account
        </PrimaryButton>
    );
}

export default PlaidLinkButton;