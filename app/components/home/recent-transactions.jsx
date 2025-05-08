// /app/components/home/recent-transactions.jsx
'use client';
import React, { useMemo, useCallback } from 'react';
import TransactionItem from '../transaction/transaction-item'; // Use updated TransactionItem
import { useSelector, useDispatch } from 'react-redux';

// Import Selectors
import { selectAllCategories } from '@/app/store/categoriesSlice';
import { selectAllIncomeSources } from '@/app/store/incomeSourcesSlice';
// Import Actions
import { updateTransaction, deleteTransaction } from '@/app/store/transactionsSlice';
// No toast import needed

// Default to empty array for the transactions prop for safety
export default function RecentTransactionsSection({ transactions = [] }) {
    const dispatch = useDispatch();

    // Get category and source data from Redux store
    const categories = useSelector(selectAllCategories) || []; // Default to empty array
    const incomeSources = useSelector(selectAllIncomeSources) || []; // Default to empty array

    // --- Create lookup maps and filtered lists using useMemo for efficiency ---
    const { categoryMap, expenseCategories } = useMemo(() => {
        const map = {};
        const expenseCats = [];
        // Check if categories is an array before using .forEach
        if (Array.isArray(categories)) {
            categories.forEach(cat => {
                if (cat?.id) { // Check if cat and id exist
                    map[cat.id] = cat.name || 'Unnamed'; // Use default if name missing
                    if (cat.type === 'expense') {
                        // Only include expense categories in the list for the dropdown
                        expenseCats.push(cat);
                    }
                }
            });
            // Sort expense categories alphabetically for dropdown consistency
            expenseCats.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        // ALWAYS return the object structure, even if empty
        return { categoryMap: map, expenseCategories: expenseCats };
    }, [categories]); // Dependency is the categories array

    const sourceMap = useMemo(() => {
        const map = {};
         // Add safety check here too
        if(Array.isArray(incomeSources)) {
            incomeSources.forEach(source => {
                 if (source?.id) map[source.id] = source.name || 'Unnamed Source'; // Use default
            });
        }
        return map;
    }, [incomeSources]); // Dependency is the incomeSources array

    // --- Handlers wrapped in useCallback for stable references ---
    const handleCategoryChange = useCallback((transactionId, newCategoryIdValue) => {
        // Parse the ID, ensuring null if the value is empty/invalid
        const newCategoryId = newCategoryIdValue ? parseInt(newCategoryIdValue, 10) : null;
        if (newCategoryIdValue && isNaN(newCategoryId)) {
             console.error("Invalid category ID selected:", newCategoryIdValue);
             alert("Invalid category selected."); // Basic fallback alert
             return;
        }

        console.log(`Updating transaction ${transactionId} category to ${newCategoryId}`);
        // Dispatch the update thunk
        dispatch(updateTransaction({ id: transactionId, categoryId: newCategoryId }))
            .unwrap() // Handles promise state from createAsyncThunk
            .then(() => console.log(`Transaction ${transactionId} category updated.`))
            .catch((err) => {
                console.error("Failed to update category:", err);
                // Use basic alert for error feedback since no toast library
                alert(`Failed to update category: ${err?.message || 'Unknown error'}`);
            });
    }, [dispatch]); // Dependency: dispatch (stable by default from react-redux)

    const handleDelete = useCallback((transactionId) => {
        // Using window.confirm for simple confirmation
        if (window.confirm("Delete this transaction?")) {
            console.log(`Deleting transaction ${transactionId}`);
            dispatch(deleteTransaction(transactionId))
                .unwrap()
                .then(() => console.log(`Transaction ${transactionId} deleted.`))
                .catch((err) => {
                     console.error("Failed to delete transaction:", err);
                     // Use basic alert for error feedback
                     alert(`Failed to delete: ${err?.message || 'Unknown error'}`);
                 });
         }
    }, [dispatch]); // Dependency: dispatch
    // --- End Handlers ---

    // --- Render Logic ---
    return (
        <div className="bg-background-secondary p-4 rounded-xl shadow-md"> {/* Added padding */}
            <h3 className="text-lg font-semibold mb-3 text-text-primary">
                Recent Activity
            </h3>
            <div className="space-y-1">
                {/* Check if transactions array exists and has items */}
                {transactions && transactions.length > 0 ? (
                    transactions.map(transaction => {
                        // Basic check for transaction validity before rendering item
                        if (!transaction?.id) {
                            console.warn("Skipping rendering transaction without ID:", transaction);
                            return null;
                        }

                        // Note: Names are now resolved inside TransactionItem using the maps
                        // const categoryName = ... // No longer needed here
                        // const sourceName = ... // No longer needed here

                        // Pass necessary data and handlers down to TransactionItem
                        return (
                            <TransactionItem
                                key={transaction.id}
                                transactionId={transaction.id} // Pass only the ID
                                categoryMap={categoryMap} // Pass lookup map
                                sourceMap={sourceMap}       // Pass lookup map
                                expenseCategories={expenseCategories} // Pass list for dropdown
                                onCategoryChange={handleCategoryChange} // Pass memoized handler
                                onDelete={handleDelete} // Pass memoized handler
                            />
                        );
                    })
                ) : (
                    // Message displayed when transactions array is empty or null
                    <p className="text-sm text-text-secondary italic text-center py-4">
                        No recent transactions to display.
                    </p>
                )}
            </div>
        </div>
    );
}