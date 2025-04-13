// app/home/accounts/page.jsx
'use client'

import PlaidLinkButton from '@/app/components/buttons/plaid-link-button';
import PageHeader from '@/app/components/generic/page-header';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaidInfo, disconnectPlaidAccount, selectPlaidInfo } from '../../store/transactionsSlice';

function AccountsPage() {
    const dispatch = useDispatch();
    const plaidInfo = useSelector(selectPlaidInfo);
    const loading = useSelector((state) => state.transactions.loading); // Correct
    const error = useSelector((state) => state.transactions.error);   // Correct
    const [plaidError, setPlaidError] = useState(null); // Local error state


    useEffect(() => {
        dispatch(fetchPlaidInfo()); // Fetch Plaid info on component mount
    }, [dispatch]);

    useEffect(() => {
    }, [plaidInfo]);

    const handleDisconnect = async () => {
        if (confirm("Are you sure you want to disconnect your Plaid account?")) {
            dispatch(disconnectPlaidAccount());
        }
    };

    if (loading === 'pending') {
        return <div className="flex justify-center items-center h-screen">Loading account data...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-danger-primary">Error: {error}</div>;
    }


  return (
    <div>
      <PageHeader
        title="Manage Accounts"
        subtitle="Connect and manage your bank accounts."
      />

      <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-background-secondary rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">Connected Accounts</h2>

        {plaidInfo && plaidInfo.itemId ? (
          <div>
            <p className="text-text-secondary">
              Your account is currently connected via Plaid (Item ID: {plaidInfo.itemId}).
            </p>
            <button
              onClick={handleDisconnect}
              className="bg-danger-primary hover:bg-danger-primary/90 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Disconnect Account
            </button>
          </div>
        ) : (
          <>
            <p className="text-text-secondary mb-4">
              Connect your bank account to automatically import transactions and get a
              clearer picture of your spending habits. We use Plaid to securely connect to your
              bank. Your credentials are never stored on our servers.
            </p>
            <p className="text-text-secondary mb-4">
              to over 11,000 financial institutions in the US, Canada, and Europe.  Your data is
              encrypted and protected with industry-leading security practices.
            </p>
            <PlaidLinkButton setError={setPlaidError}/>
            {plaidError && <p className="text-danger-primary mt-2">{plaidError}</p>}


            <h2 className="text-lg font-semibold mt-8 mb-2 text-text-primary">Frequently Asked Questions</h2>
            <ul className="list-disc list-inside text-text-secondary">
              <li>
                <strong>Is my data safe?</strong> Yes, we use Plaid to securely connect to your
                bank account.  Your credentials are never stored on our servers, and all
                communication with Plaid is encrypted. Plaid uses advanced security measures to
                protect your data.
              </li>
              <li>
                <strong>Which banks are supported?</strong> Plaid supports thousands of
                financial institutions in the US, Canada, and Europe. You can search for your
                bank during the connection process.
              </li>
              <li>
                <strong>What information does Plaid access?</strong>  Plaid accesses your
                transaction history, account balances, and account details.  You will be
                asked to grant permission to our application to access this information during the
                connection process.  You can revoke this permission at any time.
              </li>
              <li><strong>How do I disconnect my account?</strong> You can disconnect your account by clicking the "Disconnect" button on this page.</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default AccountsPage;