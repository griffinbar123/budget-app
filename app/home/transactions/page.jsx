// /app/home/transactions/page.jsx
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// --- Import Actions & Thunks ---
import {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    selectAllTransactions // Selector for the list
} from '../../store/transactionsSlice'; // Correct slice path assumed

// --- Import Components ---
import TransactionTable from "@/app/components/transaction/transaction-table";
import TransactionFilters from "@/app/components/transaction/transaction-filters";
import TransactionModal from "@/app/components/transaction/transaction-modal";
import PageHeader from "@/app/components/generic/page-header";
import NavigationLinks from "@/app/components/generic/navigation-links";
import TransactionOverview from '@/app/components/transaction/transaction-overview';
import ChartSection from '@/app/components/transaction/chart-section'; // Displays daily expenditures chart
import AddTransactionButton from '@/app/components/transaction/add-transaction';
// Note: No toast imports as per previous request

// --- Initial State & Helpers ---

const initialFormData = {
    date: new Date().toISOString().split('T')[0], // Default to today
    description: '',
    categoryId: '',
    sourceId: '',
    amount: '',
    type: 'expense',
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    } catch (e) {
        console.error("Error formatting date for input:", dateString, e);
        return '';
    }
};

const getStartOfMonth = (date) => {
    try {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    } catch (e) { return ''; }
};

const getToday = () => new Date().toISOString().split('T')[0];

const formatDateForLabel = (dateString) => {
    if (!dateString) return '?';
    try {
         const date = new Date(dateString);
         const offset = date.getTimezoneOffset();
         const adjustedDate = new Date(date.getTime() + (offset * 60 * 1000));
         return adjustedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'});
    } catch(e) { return '?' }
};

// --- Daily Expenditure Data Preparation (Uses Date Range) ---
function prepareDailyExpenditureData(transactionsInput, startDateStr, endDateStr) {
    const dailyExpenditures = {};
    if (!transactionsInput || !startDateStr || !endDateStr) return [];

    const transactionsArray = Array.isArray(transactionsInput) ? transactionsInput : Object.values(transactionsInput);
    // Use UTC interpretation of dates to avoid timezone shifts when comparing ranges
    const start = new Date(startDateStr + 'T00:00:00Z');
    const end = new Date(endDateStr + 'T00:00:00Z');

     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn("Invalid date range for chart:", startDateStr, endDateStr);
        return [];
    }

    transactionsArray
        .filter(trans => {
            if (!trans?.date || trans.type !== 'expense') return false;
            try {
                 const transDate = new Date(trans.date + 'T00:00:00Z');
                 return !isNaN(transDate.getTime()) && transDate >= start && transDate <= end;
            } catch(e) { return false; }
        })
        .forEach(trans => {
            dailyExpenditures[trans.date] = (dailyExpenditures[trans.date] || 0) + Math.abs(trans.amount || 0);
        });

    const formattedChartData = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayLabel = String(currentDate.getUTCDate()).padStart(2, '0'); // Use UTC day
        formattedChartData.push({
            day: dayLabel,
            fullDate: dateStr,
            expenditure: dailyExpenditures[dateStr] || 0,
        });
        currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Increment UTC day
    }
    return formattedChartData;
}


// --- Main TransactionsPage Component ---
const TransactionsPage = () => {
    const dispatch = useDispatch();

    // --- Selectors ---
    const allTransactions = useSelector(selectAllTransactions);
    const transactionsLoading = useSelector(state => state.transactions.loading);
    const transactionsError = useSelector(state => state.transactions.error);

    // --- Component State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingTransactionId, setEditingTransactionId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    // Date Range State
    const [startDate, setStartDate] = useState(getStartOfMonth(new Date()));
    const [endDate, setEndDate] = useState(getToday());

    // --- Filtering and Sorting Memo (includes date range) ---
    const filteredTransactions = useMemo(() => {
        let filtered = Array.isArray(allTransactions) ? [...allTransactions] : [];
        const validStartDate = startDate || '0000-00-00';
        const validEndDate = endDate || '9999-99-99';

        // 1. Filter by Date Range
        filtered = filtered.filter(trans => {
            const transactionDate = trans?.date;
            return transactionDate && transactionDate >= validStartDate && transactionDate <= validEndDate;
        });

        // 2. Filter by Category/Source
        if (filterCategory !== 'all') {
            if (filterCategory.startsWith('income-')) {
                const sourceId = parseInt(filterCategory.split('-')[1], 10);
                filtered = filtered.filter(trans => trans?.type === 'income' && trans?.source_id === sourceId);
            } else {
                 const categoryIdNum = parseInt(filterCategory, 10);
                 filtered = filtered.filter(trans => trans?.type === 'expense' && trans?.category_id === categoryIdNum);
            }
        }

        // 3. Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(trans =>
                trans?.description?.toLowerCase().includes(lowerQuery)
            );
        }

        // 4. Sorting
        filtered.sort((a, b) => {
            const safeA = a || {}; const safeB = b || {};
            switch (sortBy) {
                case 'date-asc': return new Date(safeA.date || 0) - new Date(safeB.date || 0);
                case 'amount-desc': return Math.abs(safeB.amount || 0) - Math.abs(safeA.amount || 0);
                case 'amount-asc': return Math.abs(safeA.amount || 0) - Math.abs(safeB.amount || 0);
                case 'date-desc': default: return new Date(safeB.date || 0) - new Date(safeA.date || 0);
            }
        });

        return filtered;
    }, [allTransactions, filterCategory, searchQuery, sortBy, startDate, endDate]);


    // --- Calculated Overview Stats (based on filteredTransactions) ---
    const overviewStats = useMemo(() => {
        const transactionsInView = filteredTransactions;
        const totalTransactions = transactionsInView.length;
        const totalExpenses = transactionsInView.reduce((sum, trans) => trans?.type === 'expense' ? sum + Math.abs(trans.amount || 0) : sum, 0);
        const totalIncome = transactionsInView.reduce((sum, trans) => trans?.type === 'income' ? sum + Math.abs(trans.amount || 0) : sum, 0);
        const netChange = totalIncome - totalExpenses;
        return { totalTransactions, totalExpenses, totalIncome, netChange };
    }, [filteredTransactions]);


    // --- Chart Data Calculation (based on date range) ---
    const chartData = useMemo(() => {
        // Calculate based on the filtered list for consistency with overview
        return prepareDailyExpenditureData(filteredTransactions, startDate, endDate);
    }, [startDate, endDate, filteredTransactions]);


    // --- Handlers ---
    const handleAddTransactionModal = () => { setIsModalOpen(true); setFormData(initialFormData); setEditingTransactionId(null); };
    const handleEditTransaction = (transactionId) => {
        const transactionToEdit = allTransactions.find(trans => trans?.id === transactionId);
        if (transactionToEdit) {
            setFormData({
                date: formatDateForInput(transactionToEdit.date),
                description: transactionToEdit.description || '',
                categoryId: transactionToEdit.category_id?.toString() ?? '',
                sourceId: transactionToEdit.source_id?.toString() ?? '',
                amount: Math.abs(transactionToEdit.amount).toString(),
                type: transactionToEdit.type,
            });
            setEditingTransactionId(transactionId);
            setIsModalOpen(true);
        } else {
            console.error("Transaction not found for editing:", transactionId);
            alert("Error: Could not find the transaction to edit.");
        }
     };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingTransactionId(null); setFormData(initialFormData); };
    const handleFormChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleSaveTransaction = () => {
        const amountValue = parseFloat(formData.amount);
        if (!formData.date || !formData.description.trim() || isNaN(amountValue) || amountValue <= 0) {
            alert("Please fill in Date, Description, and a valid positive Amount."); return;
        }
        if (formData.type === 'expense' && !formData.categoryId) { alert("Please select a Category for expenses."); return; }
        if (formData.type === 'income' && !formData.sourceId) { alert("Please select an Income Source for income."); return; }

        const transactionData = {
            date: formData.date, description: formData.description.trim(),
            amount: formData.type === 'income' ? Math.abs(amountValue) : -Math.abs(amountValue),
            type: formData.type,
            categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
            sourceId: formData.sourceId ? parseInt(formData.sourceId, 10) : null,
        };
        const promise = editingTransactionId
            ? dispatch(updateTransaction({ ...transactionData, id: editingTransactionId }))
            : dispatch(addTransaction(transactionData));
        promise.unwrap().then((res) => {
            console.log(`Transaction ${editingTransactionId ? 'updated' : 'added'} successfully.`);
        }).catch((err) => {
            console.error("Failed to save transaction:", err);
            alert(`Failed to save: ${err?.message || 'Please try again.'}`);
        });
        handleCloseModal();
    };
    const handleDeleteTransaction = (transactionId) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            dispatch(deleteTransaction(transactionId)).unwrap().then(() => {
                console.log("Transaction deleted.");
            }).catch((err) => {
                console.error(`Delete failed:`, err);
                alert(`Delete failed: ${err?.message || 'Unknown error'}`);
            });
        }
    };
    const handleFilterChange = (e) => setFilterCategory(e.target.value);
    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleSortChange = (e) => setSortBy(e.target.value);
    const handleStartDateChange = (e) => setStartDate(e.target.value);
    const handleEndDateChange = (e) => setEndDate(e.target.value);


    // --- Dynamic Labels ---
    const formattedDateRangeString = `${formatDateForLabel(startDate)} - ${formatDateForLabel(endDate)}`;
    const pageSubtitle = `View and manage financial activity for ${formattedDateRangeString}`;

    // --- Navigation Links ---
    const transactionPageLinks = [
        { href: "/home", text: "View Home" },
        { href: "/home/budget", text: "View Budget" },
        { href: "/home/savings", text: "View Savings" },
        { href: "/home/ai-chat", text: "AI Chat" },
    ];

    // --- Loading/Error Handling ---
    const showLoadingIndicator = transactionsLoading === 'pending';
    const showError = transactionsLoading === 'failed' && transactionsError;

    if (showError) {
        return <div className="flex flex-col justify-center items-center h-screen text-center px-4">
                 <p className="text-danger-primary font-semibold text-lg mb-2">Error Loading Transactions</p>
                 <p className="text-text-secondary">{transactionsError}</p>
             </div>;
    }

    // --- Render Page ---
    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            {/* Use dynamic page subtitle */}
            <PageHeader title="Transactions" subtitle={pageSubtitle} />

            {/* Overview uses stats from filteredTransactions & gets range label */}
            <TransactionOverview
                totalTransactions={overviewStats.totalTransactions}
                totalExpenses={overviewStats.totalExpenses}
                totalIncome={overviewStats.totalIncome}
                netChange={overviewStats.netChange}
                formattedDateRangeString={formattedDateRangeString} // Pass range label
            />

            {/* Chart section uses date-range based data and gets range label */}
            <ChartSection
                chartData={chartData}
                dateRangeLabel={formattedDateRangeString} // Pass range label
            />

            {/* Filters including date range */}
            <TransactionFilters
                filterCategory={filterCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                startDate={startDate}
                endDate={endDate}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
            />

            {/* Add Button & Optional Loading Indicator */}
             <div className="mt-4 mb-4 flex justify-end items-center gap-4 px-4 sm:px-6 md:px-8 lg:px-10">
                 {showLoadingIndicator && <span className="text-sm text-text-secondary italic">Loading...</span>}
                 <AddTransactionButton onAdd={handleAddTransactionModal} />
             </div>

            {/* Transaction Table Section */}
            <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
                <TransactionTable
                    transactions={filteredTransactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                />
                {/* Message is now handled inside TransactionTable */}
            </section>

            {/* Modal */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTransaction}
                formData={formData}
                onChange={handleFormChange}
                editingTransactionId={editingTransactionId}
                // Assumes modal uses internal useSelector for category/source lists
            />

            <NavigationLinks links={transactionPageLinks} />
        </div>
    );
};

export default TransactionsPage;