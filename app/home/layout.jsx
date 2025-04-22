// /app/home/layout.jsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Import selectors to check state
import { fetchCategories, selectAllCategories } from '../store/categoriesSlice';
import { fetchIncomeSources, selectAllIncomeSources } from '../store/incomeSourcesSlice';
import {
    fetchPlaidInfo,
    fetchTransactions,
    syncTransactions,
    selectPlaidInfo,
    selectTransactionIds // Use selectTransactionIds to efficiently check if transactions exist
} from '../store/transactionsSlice';
import Layout from '../components/layout';

export default function HomeLayout({ children }) {
    const dispatch = useDispatch();

    // Get current state/status using selectors
    const plaidInfo = useSelector(selectPlaidInfo);
    const categoriesStatus = useSelector(state => state.categories.loading);
    const incomeSourcesStatus = useSelector(state => state.incomeSources.loading);
    const plaidInfoStatus = useSelector(state => state.transactions.plaidLoading);
    const transactionsStatus = useSelector(state => state.transactions.loading);
    const categoryIds = useSelector(state => state.categories.ids); // Check if data exists
    const incomeSourceIds = useSelector(state => state.incomeSources.ids);
    const transactionIds = useSelector(selectTransactionIds);

    // --- Effect for Categories, Sources, Plaid Info ---
    useEffect(() => {
        // Only fetch if not already loading/succeeded and data is missing
        if (categoriesStatus === 'idle' && categoryIds.length === 0) {
            dispatch(fetchCategories());
        }
        if (incomeSourcesStatus === 'idle' && incomeSourceIds.length === 0) {
            dispatch(fetchIncomeSources());
        }
        // Fetch Plaid info only if status is idle AND we don't have it yet
        if (plaidInfoStatus === 'idle' && !plaidInfo) {
             dispatch(fetchPlaidInfo());
        }
    // Dependencies should include statuses and data presence indicators if needed
    // Using just dispatch might be okay if you assume these only need to run once per session load
    // but adding statuses makes it more robust against race conditions.
    }, [dispatch, categoriesStatus, incomeSourcesStatus, plaidInfoStatus, plaidInfo, categoryIds.length, incomeSourceIds.length]);

    // --- Effect for Transactions (Sync vs Fetch) ---
    useEffect(() => {
        // Wait until plaidInfo fetch is complete (or already exists)
        if (plaidInfoStatus !== 'pending') {
            // Check if transactions are not already loading/fetched
            if (transactionsStatus === 'idle' && transactionIds.length === 0) {
                if (plaidInfo?.itemId) {
                    console.log("HomeLayout: Plaid connected, dispatching syncTransactions");
                    dispatch(syncTransactions());
                } else {
                     console.log("HomeLayout: Plaid NOT connected, dispatching fetchTransactions (manual)");
                    dispatch(fetchTransactions()); // Fetch only manual if Plaid not linked
                }
            } else {
                 console.log(`HomeLayout: Skipping transaction fetch/sync (Status: ${transactionsStatus}, Count: ${transactionIds.length})`);
            }
        }
    // Depend on plaidInfo fetch status and plaidInfo itself
    }, [dispatch, plaidInfoStatus, plaidInfo, transactionsStatus, transactionIds.length]);

    return (
        <Layout>
            {children}
        </Layout>
    );
}