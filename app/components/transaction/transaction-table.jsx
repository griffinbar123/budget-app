// app/components/transaction/transaction-table.jsx
import React from 'react';
import { FiX, FiPenTool } from "react-icons/fi";
import { useSelector } from 'react-redux';
import { selectCategoryById, selectAllIncomeSources } from '@/app/store/financeSlice'; // Import selectors


function TransactionTable({ transactions, onEdit, onDelete }) {

    const incomeSources = useSelector(selectAllIncomeSources); // Get all income sources

    const getCategoryName = (categoryId) => {
        const category = useSelector(state => selectCategoryById(state, categoryId));
        return category ? category.name : 'Unknown Category';
    };

    const getSourceName = (sourceId) => {
      const source = incomeSources.find(source => source.id === sourceId); // Find in the array
      return source ? source.name : 'Unknown Source';
    };

    return (
        <div className="overflow-x-auto bg-background-secondary rounded-xl">
            <table className="min-w-full divide-y divide-background-primary table-auto">
                <thead className="bg-background-primary">
                    <tr>
                        <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Date
                        </th>
                        <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Description
                        </th>
                        <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Category/Source
                        </th>
                        <th scope="col" className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Amount
                        </th>
                        <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">
                            Type
                        </th>
                        <th scope="col" className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-background-secondary divide-y divide-background-primary">
                    {transactions.map(transaction => (
                        <tr key={transaction.id}>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{transaction.date}</td>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-text-primary">{transaction.description}</td>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                                {transaction.type === 'income' ? (
                                    getSourceName(transaction.sourceId)
                                ) : (
                                       getCategoryName(transaction.categoryId)
                                )}
                            </td>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-right font-mono">
                                <span
                                    className={`${transaction.amount > 0 ? 'text-success-primary' : 'text-danger-primary'}`}
                                >
                                    ${Math.abs(transaction.amount).toLocaleString()}
                                </span>
                            </td>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-text-secondary hidden sm:table-cell">{transaction.type}</td>
                            <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                    onClick={() => onEdit(transaction.id)}
                                    className="text-accent-primary hover:text-accent-primary/70"
                                >
                                    <FiPenTool className="w-4 h-4 inline-block align-middle" />
                                    <span className="hidden sm:inline"> Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                    className="text-danger-primary hover:text-danger-primary/70"
                                >
                                    <FiX className="w-4 h-4 inline-block align-middle" />
                                    <span className="hidden sm:inline"> Delete</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-4 py-4 text-center text-text-secondary">
                                No transactions match your filters or search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TransactionTable;