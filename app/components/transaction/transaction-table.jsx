// /app/components/transaction/transaction-table.jsx
'use client';

import React, { useMemo } from 'react';
import { FiX, FiPenTool } from "react-icons/fi";
import { useSelector, useDispatch } from 'react-redux'; // Import useDispatch
// Import actions/selectors from correct slices
import { selectAllCategories } from '@/app/store/categoriesSlice';
import { selectAllIncomeSources } from '@/app/store/incomeSourcesSlice';
import { updateTransaction } from '@/app/store/transactionsSlice'; // Import the update action

// Helper to format date string (optional)
const formatDateDisplay = (dateString) => {
     if (!dateString) return 'N/A';
     try {
         const [year, month, day] = dateString.split('-');
         return `${month}/${day}/${year}`;
     } catch (e) { return dateString; }
 };


function TransactionTable({ transactions = [], onEdit, onDelete }) {
    const dispatch = useDispatch(); // Get dispatch function

    // --- Select data ONCE at the top level ---
    const categories = useSelector(selectAllCategories) || [];
    const incomeSources = useSelector(selectAllIncomeSources) || [];

    // --- Create lookup maps and filtered lists ---
    const { categoryMap, expenseCategories } = useMemo(() => {
        const map = {};
        const expenseCats = [];
        categories.forEach(cat => {
            if (cat?.id) {
                map[cat.id] = cat.name;
                if (cat.type === 'expense') {
                    expenseCats.push(cat);
                }
            }
        });
        // Sort expense categories alphabetically for dropdown
        expenseCats.sort((a, b) => a.name.localeCompare(b.name));
        return { categoryMap: map, expenseCategories: expenseCats };
    }, [categories]);

    const sourceMap = useMemo(() => {
        const map = {};
        incomeSources.forEach(source => {
             if (source?.id) map[source.id] = source.name;
        });
        return map;
    }, [incomeSources]);

    // --- Inline Category Change Handler ---
    const handleCategoryChange = (transactionId, event) => {
        const newCategoryId = event.target.value ? parseInt(event.target.value, 10) : null;

        // Dispatch update action with only the changed field
        dispatch(updateTransaction({ id: transactionId, categoryId: newCategoryId }))
            .unwrap()
            .then(() => {
                console.log(`Transaction ${transactionId} category updated to ${newCategoryId}`);
                // Optional: Could use a brief visual confirmation if not using toast
            })
            .catch((error) => {
                console.error("Failed to update category inline:", error);
                alert(`Failed to update category: ${error?.message || 'Unknown error'}`); // Use alert as fallback
            });
    };

    // --- Basic prop validation ---
    if (!Array.isArray(transactions)) {
        console.error("TransactionTable received non-array transactions prop:", transactions);
        return <div className="text-danger-primary p-4">Error: Invalid transaction data.</div>;
    }


    return (
        <div className="overflow-x-auto bg-background-secondary rounded-xl shadow">
            <table className="min-w-full divide-y divide-background-primary table-auto">
                <thead className="bg-background-primary">
                    <tr>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Description</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Category/Source</th>
                        <th scope="col" className="py-3 px-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                        <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">Type</th>
                        <th scope="col" className="py-3 px-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-background-secondary divide-y divide-background-primary">{
                    transactions.map(transaction => {
                        // Use maps for display, but pass raw IDs to handlers/dropdowns
                        const sourceName = transaction.source_id ? (sourceMap[transaction.source_id] || 'Unknown Source') : 'N/A';
                        const currentCategoryId = transaction.category_id ?? ''; // Use '' for null/undefined to match select value

                        if (!transaction?.id) return null;

                        return (
                            <tr key={transaction.id} className="hover:bg-background-primary/50 transition-colors duration-150">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDateDisplay(transaction.date)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary max-w-xs truncate" title={transaction.description}>{transaction.description}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {/* Conditional Rendering: Dropdown for Expenses, Text for Income */}
                                    {transaction.type === 'expense' ? (
                                        <select
                                            value={currentCategoryId}
                                            onChange={(e) => handleCategoryChange(transaction.id, e)}
                                            className="p-1 rounded bg-background-secondary border border-transparent hover:border-gray-500 focus:border-accent-primary focus:ring-accent-primary text-sm text-text-primary appearance-none"
                                            aria-label={`Change category for ${transaction.description}`}
                                        >
                                            {/* Add an option for 'Unassigned' if categoryId can be null */}
                                            {/* <option value="">-- Uncategorized --</option> */}
                                            {expenseCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        // Display source name for income
                                        <span>{sourceName}</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono">
                                    <span className={`${transaction.amount >= 0 ? 'text-success-primary' : 'text-danger-primary'}`}>
                                        {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary hidden md:table-cell">{transaction.type}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {/* Edit Button still calls parent handler to open modal */}
                                    <button
                                        onClick={() => onEdit(transaction.id)}
                                        className="text-accent-primary hover:text-accent-primary/70 p-1 rounded"
                                        aria-label={`Edit transaction ${transaction.description}`}
                                    >
                                        <FiPenTool className="w-4 h-4 inline-block align-middle" />
                                        <span className="hidden sm:inline-block ml-1">Edit</span>
                                    </button>
                                    {/* Delete Button still calls parent handler */}
                                    <button
                                        onClick={() => onDelete(transaction.id)}
                                        className="text-danger-primary hover:text-danger-primary/70 p-1 rounded"
                                        aria-label={`Delete transaction ${transaction.description}`}
                                    >
                                        <FiX className="w-4 h-4 inline-block align-middle" />
                                        <span className="hidden sm:inline-block ml-1">Delete</span>
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                }{/* Empty State Message */}
                {transactions.length === 0 && (
                    <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-text-secondary italic">
                            No transactions match your current filters or search.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default TransactionTable;