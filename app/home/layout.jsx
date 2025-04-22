// app/home/layout.jsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../store/categoriesSlice';
import { fetchIncomeSources } from '../store/incomeSourcesSlice';
import { fetchPlaidInfo, fetchTransactions, syncTransactions, selectPlaidInfo } from '../store/transactionsSlice';
import Layout from '../components/layout'; 

export default function HomeLayout({ children }) {
    const dispatch = useDispatch();
    const plaidInfo = useSelector(selectPlaidInfo);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchIncomeSources());
        dispatch(fetchPlaidInfo());
    }, [dispatch]);

    useEffect(() => {
        if (plaidInfo && plaidInfo.itemId) {
            // If Plaid is connected, SYNC transactions.
            dispatch(syncTransactions());
        } else {
            // If Plaid is NOT connected, fetch *only* manually-added transactions.
            dispatch(fetchTransactions());
        }
    }, [dispatch, plaidInfo]);

    return (
        <Layout> {/* Use the Layout component HERE */}
            {children} {/* The actual page content */}
        </Layout>
    );
}