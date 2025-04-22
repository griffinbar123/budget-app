// /app/components/transaction/transaction-table.jsx
'use client';

import React, { useMemo } from 'react';
import { FiX, FiPenTool } from "react-icons/fi";
import { useSelector } from 'react-redux';
import { selectAllCategories } from '@/app/store/categoriesSlice';
import { selectAllIncomeSources } from '@/app/store/incomeSourcesSlice';

// Helper to format date string if needed (optional)
const formatDateDisplay = (dateString) => {
     if (!dateString) return 'N/A';
     try {
         const [year, month, day] = dateString.split('-');
         // Basic formatting MM/DD/YYYY
         return `${month}/${day}/${year}`;
     } catch (e) {
         return dateString; // Fallback to original
     }
 };


function TransactionTable({ transactions = [], onEdit, onDelete }) {

    // --- Select data ONCE at the top level ---
    const categories = useSelector(selectAllCategories) || [];
    const incomeSources = useSelector(selectAllIncomeSources) || [];

    // --- Create lookup maps for efficiency using useMemo ---
    const categoryMap = useMemo(() => {
        const map = {};
        categories.forEach(cat => {
            if (cat?.id) map[cat.id] = cat.name;
        });
        return map;
    }, [categories]);

    const sourceMap = useMemo(() => {
        const map = {};
        incomeSources.forEach(source => {
             if (source?.id) map[source.id] = source.name;
        });
        return map;
    }, [incomeSources]);

    // Basic check for transactions prop
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
                {/* FIX: Ensure no stray whitespace directly inside tbody */}
                <tbody className="bg-background-secondary divide-y divide-background-primary">{
                    transactions.map(transaction => {
                        // --- Use the lookup maps ---
                        const categoryName = transaction.category_id ? (categoryMap[transaction.category_id] || 'Unknown Category') : 'N/A';
                        const sourceName = transaction.source_id ? (sourceMap[transaction.source_id] || 'Unknown Source') : 'N/A';

                        if (!transaction?.id) return null; // Skip rendering if transaction or id is missing

                        return (
                            <tr key={transaction.id} className="hover:bg-background-primary/50 transition-colors duration-150">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDateDisplay(transaction.date)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary max-w-xs truncate" title={transaction.description}>{transaction.description}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {transaction.type === 'income' ? sourceName : categoryName}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono">
                                    {/* Use >= 0 to handle zero amounts correctly */}
                                    <span className={`${transaction.amount >= 0 ? 'text-success-primary' : 'text-danger-primary'}`}>
                                        {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary hidden md:table-cell">{transaction.type}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => onEdit(transaction.id)}
                                        className="text-accent-primary hover:text-accent-primary/70 p-1 rounded"
                                        aria-label={`Edit transaction ${transaction.description}`}
                                    >
                                        <FiPenTool className="w-4 h-4 inline-block align-middle" />
                                        <span className="hidden sm:inline-block ml-1">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(transaction.id)} // Use onDelete prop
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
                }{/* Check for empty state */}
                {transactions.length === 0 && (
                    <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-text-secondary italic">
                            No transactions match your current filters or search.
                        </td>
                    </tr>
                )}
                </tbody>{/* END TBODY HERE */}
            </table>
        </div>
    );
}

export default TransactionTable;