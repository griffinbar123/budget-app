// /app/home/page.jsx
'use client'
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import {
    selectCurrentMonthTransactions,} from '../store/transactionsSlice';
import {
  selectCurrentMonthSummary,
  selectCurrentMonthChartData, // <- Re-add selector import for the bar chart
  selectAllCategories
} from '../store/categoriesSlice';
import PageHeader from "@/app/components/generic/page-header";
import NavigationLinks from '@/app/components/generic/navigation-links';
import CategoryBreakdownSection from "../components/home/category-breakdown";
import RecentTransactionsSection from "../components/home/recent-transactions";
import QuickStatsSection from "../components/home/quick-stats";
import CustomBarChart from "@/app/components/charts/bar-chart"; // <- Re-add chart component import
// FundBreakdownChart import remains removed

// --- Combined Category and Transaction Section (Keep) ---
function CategoryAndTransactionsSection({ categories, transactions }) {
    // ... (definition remains the same)
     return (
        <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CategoryBreakdownSection categories={categories} />
                </div>
                <div className="lg:col-span-1">
                    <RecentTransactionsSection transactions={transactions} />
                </div>
            </div>
        </section>
    );
}

// --- Main HomePage Component ---
const HomePage = () => {
    const maxTransactionsToShow = 8;
    const maxCategoriesToShow = 8;

    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    const currentMonthYearLabel = `${monthName} ${year} Summary`;

    // --- Selectors ---
    const transactionsLoading = useSelector(state => state.transactions.loading);
    const categoriesLoading = useSelector(state => state.categories.loading);
    const incomeSourcesLoading = useSelector(state => state.incomeSources.loading);
    const transactionsError = useSelector(state => state.transactions.error);
    const categoriesError = useSelector(state => state.categories.error);
    const incomeSourcesError = useSelector(state => state.incomeSources.error);

    const currentMonthSummary = useSelector(selectCurrentMonthSummary);
    const currentMonthChartData = useSelector(selectCurrentMonthChartData); // <- Use the selector
    const currentMonthTransactions = useSelector(selectCurrentMonthTransactions).slice(0, maxTransactionsToShow);
    const categories = useSelector(selectAllCategories);
    const [displayedCategories, setDisplayedCategories] = useState([]);
    // const plaidInfo = useSelector(selectPlaidInfo);


    useEffect(() => {
        if (Array.isArray(categories)) {
            setDisplayedCategories(categories.slice(0, maxCategoriesToShow));
        }
    }, [categories]);


    const homePageLinks = [
        { href: "/home/budget", text: "View Budget" },
        { href: "/home/transactions", text: "View Transactions" },
        { href: "/home/savings", text: "View Savings" },
        { href: "/home/ai-chat", text: "AI Chat" },
    ];


   if (transactionsLoading === 'pending' || categoriesLoading === 'pending' || incomeSourcesLoading === 'pending') {
        // ... loading state ...
         return <div className="flex justify-center items-center h-screen">Loading financial data...</div>;
   }
    const combinedError = transactionsError || categoriesError || incomeSourcesError;
    if (combinedError) {
        // ... error state ...
         return <div className="flex flex-col justify-center items-center h-screen text-danger-primary">
                    <p>Error loading data:</p>
                    <p>{combinedError}</p>
                </div>;
    }

    // --- Render function ---
    return (
        <>
            <PageHeader title="Home Dashboard" subtitle={currentMonthYearLabel} />

            {/* Section for the Bar Chart */}
            <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
                 <CustomBarChart chartData={currentMonthChartData || []} />
            </section>

            {/* Keep Quick Stats */}
            <QuickStatsSection />

            {/* Keep Categories & Transactions */}
            <CategoryAndTransactionsSection
                categories={displayedCategories}
                transactions={currentMonthTransactions}
            />

            <NavigationLinks links={homePageLinks} />
        </>
    );
};

export default HomePage;