// --- app/home/page.jsx ---
'use client'
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react'; // Keep useState, useEffect
import {
    selectCurrentMonthTransactions,
    selectPlaidInfo  // Keep PlaidInfo selector
} from '../store/transactionsSlice';
import {
  selectCurrentMonthSummary,
  selectCurrentMonthChartData,
  selectAllCategories // Correct: From categoriesSlice
} from '../store/categoriesSlice';
import PageHeader from "@/app/components/generic/page-header";
import NavigationLinks from '@/app/components/generic/navigation-links';
import CategoryBreakdownSection from "../components/home/category-breakdown";
import RecentTransactionsSection from "../components/home/recent-transactions";
import QuickStatsSection from "../components/home/quick-stats";
import CustomBarChart from "@/app/components/charts/bar-chart";
import FundBreakdownChart from "@/app/components/charts/funds-breakdown-chart";

// --- Visualization Section Component ---
function VisualizationSection({ currentMonthSummary, currentMonthChartData }) {
  return (
    <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FundBreakdownChart budgetSummary={currentMonthSummary} />
        <CustomBarChart chartData={currentMonthChartData || []} />
      </div>
    </section>
  );
}

// --- Combined Category and Transaction Section ---
function CategoryAndTransactionsSection({ categories, transactions }) {
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

const HomePage = () => {
    // const dispatch = useDispatch(); // NO LONGER NEEDED

    const maxTransactionsToShow = 8;
    const maxCategoriesToShow = 8;

    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    const currentMonthYearLabel = `${monthName} ${year} Summary`;

    // Use selectors to get data from the Redux store
    const transactionsLoading = useSelector(state => state.transactions.loading);
    const categoriesLoading = useSelector(state => state.categories.loading);
    const incomeSourcesLoading = useSelector(state => state.incomeSources.loading);
    const transactionsError = useSelector(state => state.transactions.error);
    const categoriesError = useSelector(state => state.categories.error);
    const incomeSourcesError = useSelector(state => state.incomeSources.error); // Corrected

    const currentMonthSummary = useSelector(selectCurrentMonthSummary);
    const currentMonthChartData = useSelector(selectCurrentMonthChartData);
    const currentMonthTransactions = useSelector(selectCurrentMonthTransactions).slice(0, maxTransactionsToShow);
    const categories = useSelector(selectAllCategories);
    const [displayedCategories, setDisplayedCategories] = useState([]); // Keep this
    const plaidInfo = useSelector(selectPlaidInfo); // Get Plaid info


    // useEffect(() => { // NO DATA FETCHING HERE
    //     dispatch(fetchCategories());
    //     dispatch(fetchIncomeSources());
    //      dispatch(fetchPlaidInfo());
    //     if (plaidInfo && plaidInfo.itemId) {
    //       dispatch(fetchTransactions());
    //     }
    // }, [dispatch, plaidInfo]);


    useEffect(() => { // Keep this for slicing categories
        if (Array.isArray(categories)) {
            setDisplayedCategories(categories.slice(0, maxCategoriesToShow));
        }
    }, [categories]);


    // Define links for the HomePage
    const homePageLinks = [
        { href: "/home/budget", text: "View Budget" },
        { href: "/home/transactions", text: "View Transactions" },
        { href: "/home/savings", text: "View Savings" },
        { href: "/home/ai-chat", text: "AI Chat" },
    ];


   if (transactionsLoading === 'pending' || categoriesLoading === 'pending' || incomeSourcesLoading === 'pending') {
        return <div className="flex justify-center items-center h-screen">Loading financial data...</div>;
    }

    if (transactionsError) {
        return <div className="flex justify-center items-center h-screen text-danger-primary">Error loading transactions: {transactionsError}</div>;
    }
    if (categoriesError) {
        return <div className="flex justify-center items-center h-screen text-danger-primary">Error loading categories: {categoriesError}</div>;
    }
    if(incomeSourcesError) {
      return  <div className="flex justify-center items-center h-screen text-danger-primary">Error loading income sources: {incomeSourcesError}</div>;
    }

    return (
        <>
            <PageHeader title="Home Dashboard" subtitle={currentMonthYearLabel} />
            <VisualizationSection
                currentMonthSummary={currentMonthSummary}
                currentMonthChartData={currentMonthChartData}
            />

            <QuickStatsSection currentMonthSummary={currentMonthSummary} />

            <CategoryAndTransactionsSection
                categories={displayedCategories}
                transactions={currentMonthTransactions}
            />
            <NavigationLinks links={homePageLinks} />

        </>
    );
};

export default HomePage;