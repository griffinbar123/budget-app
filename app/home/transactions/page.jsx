// /app/home/transactions/page.jsx
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import Actions & Thunks from specific slices
import {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    selectAllTransactions, // Selector for the list
    selectTransactionById, // Selector for editing (optional, can also find in array)
    // Add selectors for loading/error states if needed specifically
} from '../../store/transactionsSlice';
// Import category/source selectors if needed directly (though child components might handle this)
// import { selectAllCategories } from '../../store/categoriesSlice';
// import { selectAllIncomeSources } from '../../store/incomeSourcesSlice';

// Import Components
import TransactionTable from "@/app/components/transaction/transaction-table";
import TransactionFilters from "@/app/components/transaction/transaction-filters";
import TransactionModal from "@/app/components/transaction/transaction-modal";
import PageHeader from "@/app/components/generic/page-header";
import NavigationLinks from "@/app/components/generic/navigation-links";
import TransactionOverview from '@/app/components/transaction/transaction-overview';
import ChartSection from '@/app/components/transaction/chart-section'; // Optional: Daily chart
import AddTransactionButton from '@/app/components/transaction/add-transaction';

// Initial state for the transaction form modal
const initialFormData = {
    date: new Date().toISOString().split('T')[0], // Default to today
    description: '',
    categoryId: '', // Empty string for '-- Select --' option
    sourceId: '',   // Empty string for '-- Select --' option
    amount: '',
    type: 'expense', // Default type
};

// Helper function to format date (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return '';
    }
};

const TransactionsPage = () => {
    const dispatch = useDispatch();

    // --- Selectors ---
    const allTransactions = useSelector(selectAllTransactions); // Gets array of transaction objects
    // Loading/error states from the transactions slice
    const transactionsLoading = useSelector(state => state.transactions.loading);
    const transactionsError = useSelector(state => state.transactions.error);
    // Categories/Sources are likely selected within Filter/Modal components now

    // --- Component State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingTransactionId, setEditingTransactionId] = useState(null);
    // Filters & Sorting State
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    // Chart State (Optional)
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${year}-${month}`;
    });
    const [chartData, setChartData] = useState([]);

    // --- Chart Data Preparation (Optional) ---
    function prepareDailyExpenditureData(transactionsInput, monthString) {
        const dailyExpenditures = {};
        const targetMonth = monthString;
        if (!transactionsInput || !targetMonth) return [];
        const transactionsArray = Array.isArray(transactionsInput) ? transactionsInput : Object.values(transactionsInput);

        transactionsArray
            .filter(trans => trans?.type === 'expense' && trans?.date?.startsWith(targetMonth))
            .forEach(trans => {
                try {
                    const day = trans.date.split('-')[2];
                    if (day) {
                       dailyExpenditures[day] = (dailyExpenditures[day] || 0) + Math.abs(trans.amount);
                    }
                } catch (e) { console.error("Error processing date for chart:", trans?.date, e); }
            });

        const year = parseInt(monthString.split('-')[0], 10);
        const month = parseInt(monthString.split('-')[1], 10) - 1;
        if (isNaN(year) || isNaN(month)) return [];

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const formattedChartData = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = String(day).padStart(2, '0');
            formattedChartData.push({ day: dayStr, expenditure: dailyExpenditures[dayStr] || 0 });
        }
        return formattedChartData;
    }

    useEffect(() => {
        const preparedChartData = prepareDailyExpenditureData(allTransactions, currentMonth);
        setChartData(preparedChartData);
    }, [currentMonth, allTransactions]);

    // --- Modal Handlers ---
    const handleAddTransactionModal = () => {
        setFormData(initialFormData);
        setEditingTransactionId(null);
        setIsModalOpen(true);
    };

    const handleEditTransaction = (transactionId) => {
        // Find transaction directly from the array provided by the selector
        const transactionToEdit = allTransactions.find(trans => trans?.id === transactionId);
        if (transactionToEdit) {
            setFormData({
                date: formatDateForInput(transactionToEdit.date),
                description: transactionToEdit.description || '',
                categoryId: transactionToEdit.category_id?.toString() ?? '', // Handle null category_id
                sourceId: transactionToEdit.source_id?.toString() ?? '',     // Handle null source_id
                amount: Math.abs(transactionToEdit.amount).toString(),      // Use positive amount for input
                type: transactionToEdit.type,
            });
            setEditingTransactionId(transactionId);
            setIsModalOpen(true);
        } else {
            console.error("Transaction not found for editing:", transactionId);
            alert("Could not find transaction to edit."); // User feedback
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransactionId(null);
        setFormData(initialFormData);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Form Submission (Save/Update) ---
    const handleSaveTransaction = () => {
        const amountValue = parseFloat(formData.amount);
        // Enhanced Validation
        if (!formData.date || !formData.description.trim() || isNaN(amountValue) || amountValue <= 0) {
            alert("Please fill in Date, Description, and a valid positive Amount.");
            return;
        }
        if (formData.type === 'expense' && !formData.categoryId) {
             alert("Please select a Category for expenses.");
            return;
        }
         if (formData.type === 'income' && !formData.sourceId) {
             alert("Please select an Income Source for income.");
            return;
        }

        const transactionData = {
            date: formData.date,
            description: formData.description.trim(),
            amount: formData.type === 'income' ? Math.abs(amountValue) : -Math.abs(amountValue),
            type: formData.type,
            categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
            sourceId: formData.sourceId ? parseInt(formData.sourceId, 10) : null,
            // Include other fields if your modal collects them (e.g., accountId)
        };

        if (editingTransactionId) {
            dispatch(updateTransaction({ ...transactionData, id: editingTransactionId }));
        } else {
            dispatch(addTransaction(transactionData));
        }
        handleCloseModal();
    };

    // --- Delete Handler ---
    const handleDeleteTransaction = (transactionId) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            dispatch(deleteTransaction(transactionId));
        }
    };

    // --- Filtering and Sorting ---
    const filteredTransactions = useMemo(() => {
        let filtered = Array.isArray(allTransactions) ? [...allTransactions] : []; // Start with shallow copy

        // Filter by Category/Source
        if (filterCategory !== 'all') {
            if (filterCategory.startsWith('income-')) {
                const sourceId = parseInt(filterCategory.split('-')[1], 10);
                filtered = filtered.filter(trans => trans?.type === 'income' && trans?.source_id === sourceId);
            } else {
                 const categoryIdNum = parseInt(filterCategory, 10);
                 // Assuming transfers aren't filtered by expense categories
                 filtered = filtered.filter(trans => trans?.type === 'expense' && trans?.category_id === categoryIdNum);
            }
        }

        // Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(trans =>
                trans?.description?.toLowerCase().includes(lowerQuery)
            );
        }

        // Sorting (added null checks)
        filtered.sort((a, b) => {
            const safeA = a || {};
            const safeB = b || {};
            switch (sortBy) {
                case 'date-asc':
                    return new Date(safeA.date || 0) - new Date(safeB.date || 0);
                case 'amount-desc':
                    return Math.abs(safeB.amount || 0) - Math.abs(safeA.amount || 0);
                case 'amount-asc':
                    return Math.abs(safeA.amount || 0) - Math.abs(safeB.amount || 0);
                case 'date-desc':
                default:
                    return new Date(safeB.date || 0) - new Date(safeA.date || 0);
            }
        });

        return filtered;
    }, [allTransactions, filterCategory, searchQuery, sortBy]);


    // --- Filter/Sort State Handlers ---
    const handleFilterChange = (e) => setFilterCategory(e.target.value);
    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleSortChange = (e) => setSortBy(e.target.value);
    const handleMonthChange = (e) => setCurrentMonth(e.target.value);

    // --- Calculated Overview Stats (based on *current month* of filtered data) ---
    const overviewStats = useMemo(() => {
        const currentMonthFilteredTransactions = filteredTransactions.filter(t => t?.date?.startsWith(currentMonth));
        const totalTransactions = currentMonthFilteredTransactions.length;
        const totalExpenses = currentMonthFilteredTransactions.reduce((sum, trans) => trans?.type === 'expense' ? sum + Math.abs(trans.amount || 0) : sum, 0);
        const totalIncome = currentMonthFilteredTransactions.reduce((sum, trans) => trans?.type === 'income' ? sum + Math.abs(trans.amount || 0) : sum, 0);
        const netChange = totalIncome - totalExpenses;
        return { totalTransactions, totalExpenses, totalIncome, netChange };
    }, [filteredTransactions, currentMonth]);


    // --- Month Formatting ---
    const formatMonth = (monthString) => {
        if (!monthString) return 'Invalid Date';
        try {
            const [year, month] = monthString.split('-');
            const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleString('default', { month: 'long', year: 'numeric' });
        } catch (e) { return 'Invalid Date'; }
    };
    const formattedMonthString = formatMonth(currentMonth);

    // --- Navigation Links ---
    const transactionPageLinks = [
        { href: "/home", text: "View Home" },
        { href: "/home/budget", text: "View Budget" },
        { href: "/home/savings", text: "View Savings" },
        { href: "/home/ai-chat", text: "AI Chat" },
    ];

    // --- Loading/Error Handling ---
    if (transactionsLoading === 'pending' && !allTransactions.length) { // Show loading only on initial load maybe
      return <div className="flex justify-center items-center h-screen">Loading transactions...</div>;
    }
    // Display error prominently if it occurs
    if (transactionsLoading === 'failed' && transactionsError) {
      return <div className="flex flex-col justify-center items-center h-screen text-danger-primary">
                 <p>Error loading transactions:</p>
                 <p>{transactionsError}</p>
             </div>;
    }

    // --- Render ---
    return (
        // Using padding instead of container for flexibility
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <PageHeader title="Transactions" subtitle="Manage and view your financial activity" />

            <TransactionOverview
                totalTransactions={overviewStats.totalTransactions}
                totalExpenses={overviewStats.totalExpenses}
                totalIncome={overviewStats.totalIncome}
                netChange={overviewStats.netChange}
                formattedMonthString={formattedMonthString}
            />

            {/* Optional: Daily Expenditure Chart */}
            <ChartSection
                chartData={chartData}
                currentMonth={currentMonth}
                handleMonthChange={handleMonthChange}
                formattedMonthString={formattedMonthString}
            />

            <TransactionFilters
                filterCategory={filterCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                // Assumes filters component uses useSelector internally for lists
            />

            {/* Add Button */}
            <div className="mb-4 flex justify-end">
                <AddTransactionButton onAdd={handleAddTransactionModal} />
            </div>

            {/* Transaction Table Section */}
            <section className="mb-8">
                {/* Removed redundant h2 and padding, let table handle its styling */}
                <TransactionTable
                    transactions={filteredTransactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                />
            </section>

            {/* Modal */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTransaction}
                formData={formData}
                onChange={handleFormChange}
                editingTransactionId={editingTransactionId}
                // Assumes modal component uses useSelector internally for lists
            />

            <NavigationLinks links={transactionPageLinks} />
        </div>
    );
};

export default TransactionsPage;