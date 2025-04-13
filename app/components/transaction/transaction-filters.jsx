// app/components/transaction/transaction-filters.jsx

import React from 'react';
import { FiSearch } from "react-icons/fi";
import { useSelector } from 'react-redux'; // Import useSelector
import { selectAllCategories, selectAllIncomeSources } from "@/app/store/financeSlice"; // Import selectors


function TransactionFilters({ filterCategory, searchQuery, sortBy, onFilterChange, onSearchChange, onSortChange }) {
    const categoriesList = useSelector(selectAllCategories); // Use the selector!
    const incomeSources = useSelector(selectAllIncomeSources); // Use the selector

    return (
        <section className="mb-4 flex flex-col sm:flex-row gap-4 items-stretch px-4 sm:px-6 md:px-8 lg:px-10">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiSearch className="w-5 h-5 text-text-secondary" />
                </div>
                <input
                    type="search"
                    placeholder="Search descriptions..."
                    className="block w-full p-2 pl-10 text-sm text-text-primary rounded-lg bg-background-secondary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                    value={searchQuery}
                    onChange={onSearchChange}
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="text-text-primary sm:mr-2">Filter by Category/Source:</div>
                <select
                    className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary w-full sm:w-auto"
                    value={filterCategory}
                    onChange={onFilterChange}
                >
                    <option value="all">All Transactions</option>
                    <optgroup label="Expense Categories">
                        {categoriesList.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </optgroup>
                    <optgroup label="Income Sources">
                        {incomeSources.map(source => (
                            <option key={source.id} value={`income-${source.id}`}>Income: {source.name}</option>
                        ))}
                    </optgroup>
                </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="text-text-primary sm:mr-2">Sort By:</div>
                <select
                    className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary w-full sm:w-auto"
                    value={sortBy}
                    onChange={onSortChange}
                >
                    <option value="date-desc">Date (Newest First)</option>
                    <option value="date-asc">Date (Oldest First)</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                </select>
            </div>
        </section>
    );
}

export default TransactionFilters;