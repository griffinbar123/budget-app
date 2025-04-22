// /app/home/accounts/page.jsx
'use client'

import React, { useState } from 'react'; // Removed useEffect as fetch is handled in layout
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '@/app/components/generic/page-header';
import PlaidLinkButton from '@/app/components/buttons/plaid-link-button';
// Import relevant actions/selectors from the transactions slice
import {
    disconnectPlaidAccount,
    selectPlaidInfo,
    // Optional: fetchPlaidInfo (if adding fallback)
} from '../../store/transactionsSlice'; // Adjust path if necessary
// Optional: Import a spinner component
// import Spinner from '@/app/components/generic/spinner';

function AccountsPage() {
    const dispatch = useDispatch();

    // Get Plaid connection status and loading states from Redux
    const plaidInfo = useSelector(selectPlaidInfo); // e.g., { itemId: '...', plaidCursor: '...' } or null
    const plaidLoading = useSelector((state) => state.transactions.plaidLoading); // 'idle' | 'pending' | 'succeeded' | 'failed'
    const plaidError = useSelector((state) => state.transactions.plaidError);   // Error message or null

    // Local state specifically for errors originating from the PlaidLinkButton component itself
    const [plaidLinkError, setPlaidLinkError] = useState(null);

    // Handler for disconnecting Plaid
    const handleDisconnect = async () => {
        if (confirm("Are you sure you want to disconnect your Plaid account? This will stop automatic transaction syncing.")) {
            dispatch(disconnectPlaidAccount())
                // Optional: Add toast notifications for success/error
                // .unwrap()
                // .then(() => toast.success('Account disconnected.'))
                // .catch((err) => toast.error(`Disconnect failed: ${err.message || 'Unknown error'}`));
        }
    };

    // --- Conditional Loading/Error Display ---
    // Show full page loader ONLY if initial fetch is pending and we have no data yet
    if (plaidLoading === 'pending' && !plaidInfo) {
        return (
            // Replace with a nicer spinner/skeleton component when available
            <div className="flex justify-center items-center h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
                 {/* <Spinner size="lg" /> */}
                 <p className="text-text-secondary animate-pulse">Loading account connection status...</p>
            </div>
        );
    }

    // Show full page error ONLY if initial fetch failed and we have no data yet
    if (plaidLoading === 'failed' && plaidError && !plaidInfo) {
         return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-center px-4">
                 <p className="text-danger-primary font-semibold text-lg mb-2">Error Loading Account Status</p>
                 <p className="text-text-secondary">{plaidError}</p>
                 {/* Optionally add a retry button here */}
             </div>
        );
    }
    // --- End Loading/Error Display ---

    // Determine if an operation (connecting/disconnecting/fetching) is in progress
    // Use this to disable buttons and show loading text
    const isProcessing = plaidLoading === 'pending';

    return (
        <div>
            <PageHeader
                title="Manage Accounts"
                subtitle="Connect or disconnect your bank accounts via Plaid."
            />

            <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-background-secondary rounded-xl shadow-md max-w-3xl mx-auto"> {/* Increased max-w */}
                <h2 className="text-xl font-semibold mb-6 text-text-primary border-b border-gray-600 pb-2"> {/* Larger title, border */}
                    Connected Accounts
                </h2>

                {/* Display based on whether Plaid info exists */}
                {plaidInfo?.itemId ? (
                    // --- Account Connected View ---
                    <div className="space-y-4">
                        <p className="text-success-primary font-medium"> {/* Success message */}
                           ✅ Account successfully connected via Plaid.
                        </p>
                        <p className="text-sm text-text-secondary">
                           Your transactions will be automatically synced periodically. You can manage your connection below.
                        </p>
                        {/* Display disconnect error inline if it occurs while connected */}
                        {plaidLoading === 'failed' && plaidError && (
                            <p className="text-danger-primary text-sm mt-2">Error during last operation: {plaidError}</p>
                        )}
                        <div className="pt-4"> {/* Add spacing */}
                            <button
                                onClick={handleDisconnect}
                                disabled={isProcessing} // Disable button during any Plaid operation
                                className={`inline-flex items-center justify-center bg-danger-primary hover:bg-danger-primary/90 text-white font-bold py-2 px-5 rounded-lg transition-opacity duration-200 ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? 'Processing...' : 'Disconnect Account'}
                                {/* {isProcessing && <Spinner size="sm" className="ml-2"/>} */}
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- No Account Connected View ---
                    <div className="space-y-4">
                         {/* Display general plaid error if initial fetch failed (but component didn't exit early) */}
                         {plaidLoading === 'failed' && plaidError && !plaidLinkError && (
                             <p className="text-danger-primary text-sm">Could not retrieve connection status: {plaidError}</p>
                         )}
                        <p className="text-text-secondary">
                            Connect your bank account to automatically import transactions and get a
                            clearer picture of your finances.
                        </p>
                        <p className="text-text-secondary mb-4">
                             We use Plaid to securely link your accounts. Your credentials are never stored on our servers.
                        </p>

                        {/* Plaid Link Button Component */}
                        <div className="my-6"> {/* Add spacing */}
                             <PlaidLinkButton
                                setError={setPlaidLinkError}
                                disabled={isProcessing} // Disable if any Plaid action is pending
                            />
                        </div>
                         {/* Display Plaid Link specific errors */}
                        {plaidLinkError && <p className="text-danger-primary mt-2 text-sm">{plaidLinkError}</p>}

                        {/* FAQs */}
                        <h3 className="text-lg font-semibold pt-6 mb-2 text-text-primary border-t border-gray-600"> {/* Separator */}
                            Frequently Asked Questions
                        </h3>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 text-sm">
                            <li>
                                <strong>Is my data safe?</strong> Yes, Plaid uses advanced security measures and encryption. Your bank credentials are never stored on our servers.
                            </li>
                            <li>
                                <strong>Which banks are supported?</strong> Plaid supports thousands of institutions across North America and Europe. You can search during the connection process.
                            </li>
                            <li>
                                <strong>What information is accessed?</strong> We access transaction history, account balances, and basic account details (like name and type) to provide the budgeting service. You grant permission during connection.
                            </li>
                            <li>
                                <strong>How do I disconnect?</strong> Once connected, a "Disconnect Account" button will appear on this page.
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountsPage;