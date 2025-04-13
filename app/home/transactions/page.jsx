// // app/home/transactions/page.jsx
// 'use client'
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//     addTransaction,
//     initializeStore,
//     selectAllTransactions, // Corrected import
//     updateTransaction,
//     deleteTransaction,
//     selectAllCategories,
//     selectAllIncomeSources

// } from '../../store/financeSlice'; // Corrected imports
// import TransactionTable from "@/app/components/transaction/transaction-table";
// import TransactionFilters from "@/app/components/transaction/transaction-filters";
// import TransactionModal from "@/app/components/transaction/transaction-modal";
// import PageHeader from "@/app/components/generic/page-header";
// import NavigationLinks from "@/app/components/generic/navigation-links";
// import TransactionOverview from '@/app/components/transaction/transaction-overview';
// import ChartSection from '@/app/components/transaction/chart-section';
// import AddTransactionButton from '@/app/components/transaction/add-transaction';

// const initialFormData = {
//     date: '',
//     description: '',
//     categoryId: '',
//     amount: '',
//     type: 'expense',
//     sourceId: '',
// };

// const TransactionsPage = () => {
//     const dispatch = useDispatch();
//     const transactions = useSelector(selectAllTransactions); // Use the correct selector
//     const categoriesList = useSelector(selectAllCategories); // Use selector
//     const incomeSources = useSelector(selectAllIncomeSources); // Use selector
//     const currentMonthSummary = useSelector(state => state.finance.currentMonthSummary);
//     const isLoading = useSelector(state => state.finance.loading);
//     const fetchError = useSelector(state => state.finance.error);
//     const isInitialized = useSelector(state => state.finance.isInitialized);


//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [formData, setFormData] = useState(initialFormData);
//     const [editingTransactionId, setEditingTransactionId] = useState(null);
//     const [filterCategory, setFilterCategory] = useState('all');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [sortBy, setSortBy] = useState('date-desc');
//     const [currentMonth, setCurrentMonth] = useState(() => {
//         const today = new Date();
//         const month = String(today.getMonth() + 1).padStart(2, '0');
//         const year = today.getFullYear();
//         return `${year}-${month}`;
//     });
//     const [chartData, setChartData] = useState([]);

//     useEffect(() => {
//         if (!isInitialized) {
//           dispatch(initializeStore());
//         }
//       }, [dispatch, isInitialized]);

//       useEffect(() => {
//         if (transactions.length > 0) { // Only prepare if transactions exist.
//           const preparedChartData = prepareDailyExpenditureData(transactions, currentMonth);
//           setChartData(preparedChartData);
//         }
//       }, [currentMonth, transactions]);

//     function prepareDailyExpenditureData(transactions, monthString) {
//         const dailyExpenditures = {};
//         const targetMonth = monthString;

//         if (transactions) {
//             transactions
//                 .filter(trans => trans.type === 'expense' && trans.date.startsWith(targetMonth))
//                 .forEach(trans => {
//                     const day = trans.date.split('-')[2];
//                     dailyExpenditures[day] = (dailyExpenditures[day] || 0) + Math.abs(trans.amount);
//                 });
//         }

//         const year = parseInt(monthString.split('-')[0]);
//         const month = parseInt(monthString.split('-')[1]) - 1;
//         const daysInMonth = new Date(year, month + 1, 0).getDate();

//         const formattedChartData = [];
//         for (let day = 1; day <= daysInMonth; day++) {
//             const dayStr = String(day).padStart(2, '0');
//             formattedChartData.push({
//                 day: dayStr,
//                 expenditure: Math.abs(dailyExpenditures[dayStr] || 0),
//             });
//         }
//         return formattedChartData;
//     }


//     const handleAddTransactionModal = () => {
//         setFormData(initialFormData);
//         setEditingTransactionId(null);
//         setIsModalOpen(true);
//     };

//     const handleEditTransaction = (transactionId) => {
//         const transactionToEdit = transactions.find(trans => trans.id === transactionId);
//         if (transactionToEdit) {
//             setFormData({
//                 date: transactionToEdit.date,
//                 description: transactionToEdit.description,
//                 categoryId: transactionToEdit.categoryId || '',
//                 sourceId: transactionToEdit.sourceId || '',
//                 amount: Math.abs(transactionToEdit.amount).toString(),
//                 type: transactionToEdit.type,
//             });
//             setEditingTransactionId(transactionId);
//             setIsModalOpen(true);
//         }
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         setEditingTransactionId(null);
//         setFormData(initialFormData);
//     };

//     const handleFormChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleSaveTransaction = () => {
//         const amountValue = parseFloat(formData.amount) || 0;
//         const newTransaction = {
//             ...formData,
//             amount: formData.type === 'income' ? Math.abs(amountValue) : -Math.abs(amountValue),
//             categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
//             sourceId: formData.sourceId ? parseInt(formData.sourceId, 10) : null,
//         };

//         if (editingTransactionId) {
//             dispatch(updateTransaction({ ...newTransaction, id: editingTransactionId }));
//         } else {
//             dispatch(addTransaction({ ...newTransaction, id: Date.now() })); // Use Date.now()
//         }
//         handleCloseModal();
//     };


//     const handleDeleteTransaction = (transactionId) => {
//         dispatch(deleteTransaction(transactionId));
//     };

//     const filteredTransactions = React.useMemo(() => {
//         let filtered = [...transactions];

//         if (filterCategory !== 'all') {
//             if (filterCategory.startsWith('income-')) {
//                 const sourceId = parseInt(filterCategory.split('-')[1], 10);
//                 filtered = filtered.filter(trans => trans.type === 'income' && trans.sourceId === sourceId);
//             } else {
//                 filtered = filtered.filter(trans => trans.type !== 'income' && String(trans.categoryId) === filterCategory);
//             }
//         }

//         if (searchQuery) {
//             const lowerQuery = searchQuery.toLowerCase();
//             filtered = filtered.filter(trans =>
//                 trans.description.toLowerCase().includes(lowerQuery)
//             );
//         }

//         if (sortBy === 'date-desc') {
//             filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
//         } else if (sortBy === 'date-asc') {
//             filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
//         } else if (sortBy === 'amount-desc') {
//             filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
//         } else if (sortBy === 'amount-asc') {
//             filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
//         }

//         return filtered;
//     }, [transactions, filterCategory, searchQuery, sortBy]);


//     const handleFilterChange = (e) => {
//         setFilterCategory(e.target.value);
//     };

//     const handleSearchChange = (e) => {
//         setSearchQuery(e.target.value);
//     };

//     const handleSortChange = (e) => {
//         setSortBy(e.target.value);
//     };

//     const totalTransactions = filteredTransactions.length;
//     const totalExpenses = filteredTransactions.reduce((sum, trans) => trans.type === 'expense' ? sum + Math.abs(trans.amount) : sum, 0);
//     const totalIncome = filteredTransactions.reduce((sum, trans) => trans.type === 'income' ? sum + Math.abs(trans.amount) : sum, 0);
//     const netChange = totalIncome - totalExpenses;

//     const formatMonth = (monthString) => {
//         if (!monthString) return ''; // Handle undefined/null
//         const [year, month] = monthString.split('-');
//         if(!year || !month) return '';
//         const date = new Date(parseInt(year, 10), parseInt(month, 10) -1);
//         if (isNaN(date)) return '';
//         return date.toLocaleString('default', { month: 'long', year: 'numeric' });
//     };

//     const formattedMonthString = formatMonth(currentMonth);

//     const handleMonthChange = (event) => {
//         setCurrentMonth(event.target.value);
//     };

//     const transactionPageLinks = [
//         { href: "/home", text: "View Home" },
//         { href: "/home/budget", text: "View Budget" },
//         { href: "/home/savings", text: "View Savings" },
//         { href: "/home/ai-chat", text: "AI Chat" },
//     ];

//     if (isLoading === 'pending') {
//       return <div className="flex justify-center items-center h-screen">Loading financial data...</div>;
//     }

//     if (fetchError) {
//       return <div className="flex justify-center items-center h-screen text-danger-primary">Error loading data: {fetchError}</div>;
//     }


//     return (
//         <>
//             <PageHeader title="Transactions" subtitle="Manage and view your financial transactions" />

//             <TransactionOverview
//                 totalTransactions={totalTransactions}
//                 totalExpenses={totalExpenses}
//                 totalIncome={totalIncome}
//                 netChange={netChange}
//                 formattedMonthString={formattedMonthString}
//             />

//             <ChartSection
//                 chartData={chartData}
//                 currentMonth={currentMonth}
//                 handleMonthChange={handleMonthChange}
//                 formattedMonthString={formattedMonthString}
//             />

//             <TransactionFilters
//                 filterCategory={filterCategory}
//                 searchQuery={searchQuery}
//                 sortBy={sortBy}
//                 onFilterChange={handleFilterChange}
//                 onSearchChange={handleSearchChange}
//                 onSortChange={handleSortChange}
//             />

//             <AddTransactionButton onAdd={handleAddTransactionModal} />

//             <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
//                 <h2 className="text-lg font-semibold mb-4 text-text-primary">Transactions</h2>

//                 <TransactionTable
//                     transactions={filteredTransactions}
//                     onEdit={handleEditTransaction}
//                     onDelete={handleDeleteTransaction}
//                 />
//             </section>

//             <TransactionModal
//                 isOpen={isModalOpen}
//                 onClose={handleCloseModal}
//                 onSave={handleSaveTransaction}
//                 formData={formData}
//                 onChange={handleFormChange}
//                 editingTransactionId={editingTransactionId}
//             />
//             <NavigationLinks links={transactionPageLinks} />
//         </>
//     );
// };

// export default TransactionsPage;

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