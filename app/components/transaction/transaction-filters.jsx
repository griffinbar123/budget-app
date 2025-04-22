// /app/components/transaction/transaction-filters.jsx
'use client'; // Add 'use client'

import React from 'react';
import { FiSearch } from "react-icons/fi";
import { useSelector } from 'react-redux';
// --- CORRECTED IMPORTS ---
import { selectAllCategories } from "@/app/store/categoriesSlice"; // Import from categoriesSlice
import { selectAllIncomeSources } from "@/app/store/incomeSourcesSlice"; // Import from incomeSourcesSlice
// --- END CORRECTION ---


function TransactionFilters({ filterCategory, searchQuery, sortBy, onFilterChange, onSearchChange, onSortChange }) {
    // Selectors can remain here as they are called at the top level
    const categoriesList = useSelector(selectAllCategories) || []; // Default to empty array
    const incomeSources = useSelector(selectAllIncomeSources) || []; // Default to empty array

    return (
        <section className="mb-4 flex flex-col sm:flex-row gap-4 items-stretch px-4 sm:px-6 md:px-8 lg:px-10">
            {/* Search Input */}
            <div className="relative flex-1">
                {/* ... search input jsx ... */}
                 <input
                    type="search"
                    placeholder="Search descriptions..."
                    className="block w-full p-2 pl-10 text-sm text-text-primary rounded-lg bg-background-secondary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                    value={searchQuery}
                    onChange={onSearchChange}
                />
            </div>

            {/* Category/Source Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="text-text-primary sm:mr-2 flex-shrink-0">Filter by:</div> {/* Adjusted label */}
                <select
                    className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary w-full sm:w-auto"
                    value={filterCategory}
                    onChange={onFilterChange}
                    aria-label="Filter by Category or Source" // Accessibility
                >
                    <option value="all">All Transactions</option>
                    <optgroup label="Expense Categories">
                        {/* Map over categoriesList */}
                        {categoriesList.map(cat => (
                            <option key={`cat-${cat.id}`} value={cat.id}>{cat.name}</option>
                        ))}
                    </optgroup>
                    <optgroup label="Income Sources">
                        {/* Map over incomeSources */}
                        {incomeSources.map(source => (
                            <option key={`inc-${source.id}`} value={`income-${source.id}`}>Income: {source.name}</option>
                        ))}
                    </optgroup>
                </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="text-text-primary sm:mr-2 flex-shrink-0">Sort By:</div>
                <select
                    className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary w-full sm:w-auto"
                    value={sortBy}
                    onChange={onSortChange}
                    aria-label="Sort transactions" // Accessibility
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