// app/home/savings/page.jsx
'use client'
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
// import { initializeStore, selectTransactions } from '../../store/financeSlice'; // and any other actions/selectors
// import NavigationLinks from "@/app/components/generic/navigation-links";
// import SavingsOverview from '@/app/components/savings/savings-overview';
// import SavingsChartSection from '@/app/components/savings/savings-chart';
import PageHeader from "@/app/components/generic/page-header";
import NotBuiltYet from '@/app/components/not-built-yet';

export default function tempPage() {
    return (
        <>
            <PageHeader title="Savings" subtitle="This feature is currently under construction."/>
          <NotBuiltYet />
        </>
    )
}



// const SavingsPage = () => {
//     const dispatch = useDispatch();
//     const currentMonthSummary = useSelector((state) => state.finance.currentMonthSummary);
//     const categories = useSelector((state) => state.finance.funds.budgetCategories);
//     const transactions = useSelector(selectTransactions); // Use the selector
//     const isLoading = useSelector((state) => state.finance.isLoading);
//     const isInitialized = useSelector((state) => state.finance.isInitialized)
//     const fetchError = useSelector((state) => state.finance.fetchError)

//     const [reserveChartData, setReserveChartData] = useState([]);

//     useEffect(() => {
//         if (!isInitialized) {
//             dispatch(initializeStore());
//         }
//     }, [dispatch, isInitialized]);

//     useEffect(() => {
//         if (categories && transactions) { // Ensure data is loaded
//           const chartData = categories
//             .filter(category => category.type === 'reserve')
//             .map(category => ({
//                 name: category.name,
//                 planned: category.plannedAmount,
//                 reserved: Math.abs(transactions
//                                     .filter(trans => trans.categoryId === category.id && trans.type === 'reserve') //Keep type as reserve internally
//                                     .reduce((sum, trans) => sum + Math.abs(trans.amount), 0)),
//             }));

//             // Calculate 'remaining' *after* calculating 'reserved'
//             const updatedChartData = chartData.map(category => ({
//                 ...category,
//                 remaining: category.planned - category.reserved,
//             }));

//             setReserveChartData(updatedChartData);

//         }
//     }, [categories, transactions]); // Depend on Redux data

//     const today = new Date();
//     const monthName = today.toLocaleString('default', { month: 'long' });
//     const year = today.getFullYear();
//     const currentMonthYearLabel = `${monthName} ${year}`;

//     // Calculate derived values *after* data is loaded
//     const totalSavings = currentMonthSummary?.savingsBalance || 0;  // From Redux
//     const plannedSavingsGoals = currentMonthSummary?.plannedReserves || 0; // From Redux, renamed internally
//     const allocatedThisMonth = currentMonthSummary?.reservedReserves || 0; // From Redux, renamed internally
//     const remainingSavingsGoals = Math.max(0, plannedSavingsGoals - allocatedThisMonth); // Calculate remaining

//     const savingsPageLinks = [
//         { href: "/home", text: "View Home" },
//         { href: "/home/budget", text: "View Budget" },
//         { href: "/home/transactions", text: "View Transactions" },
//         { href: "/home/ai-chat", text: "AI Chat" }, // Add your AI chat link
//     ];
//     if (isLoading) {
//         return <div className="flex justify-center items-center h-screen">Loading financial data...</div>;
//     }
//     if (fetchError) {
//         return (<div className="flex justify-center items-center h-screen text-danger-primary">
//             Error loading data: {fetchError}
//         </div>)
//     }
//     return (
//         <>
//              <PageHeader title="Savings Dashboard" subtitle={`${currentMonthYearLabel} Summary`} />

//             <SavingsOverview
//                 totalSavings={totalSavings}
//                 plannedSavingsGoals={plannedSavingsGoals}
//                 allocatedThisMonth={allocatedThisMonth}
//                 remainingSavingsGoals={remainingSavingsGoals}
//             />

//             <SavingsChartSection chartData={reserveChartData} />

//             <NavigationLinks links={savingsPageLinks} />
//         </>
//     );
// };

// export default SavingsPage;