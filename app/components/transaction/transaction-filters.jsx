// /app/components/transaction/transaction-filters.jsx
'use client';

import React from 'react';
import { FiSearch } from "react-icons/fi";
import { useSelector } from 'react-redux';
import { selectAllCategories } from "@/app/store/categoriesSlice";
import { selectAllIncomeSources } from "@/app/store/incomeSourcesSlice";


// Added date props and handlers
function TransactionFilters({
    filterCategory,
    searchQuery,
    sortBy,
    startDate, // New prop
    endDate,   // New prop
    onFilterChange,
    onSearchChange,
    onSortChange,
    onStartDateChange, // New prop
    onEndDateChange    // New prop
}) {
    const categoriesList = useSelector(selectAllCategories) || [];
    const incomeSources = useSelector(selectAllIncomeSources) || [];

    // Filter categories to only show 'expense' type for the dropdown
    const expenseCategories = categoriesList.filter(cat => cat?.type === 'expense');

    return (
        // Use flex-wrap for better responsiveness
        <section className="mb-6 flex flex-wrap gap-4 items-end px-4 sm:px-6 md:px-8 lg:px-10">

            {/* Date Range Filters */}
            <div className="flex flex-col sm:flex-row gap-2 items-end">
                 <div>
                     <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
                     <input
                         id="start-date"
                         type="date"
                         value={startDate}
                         onChange={onStartDateChange}
                         className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary w-full sm:w-auto"
                         aria-label="Filter start date"
                     />
                 </div>
                 <div>
                     <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
                     <input
                         id="end-date"
                         type="date"
                         value={endDate}
                         onChange={onEndDateChange}
                         className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary w-full sm:w-auto"
                         aria-label="Filter end date"
                     />
                 </div>
            </div>

             {/* Search Input */}
            <div className="relative flex-grow min-w-[200px]"> {/* Added flex-grow and min-w */}
                <label htmlFor="search-desc" className="block text-sm font-medium text-text-secondary mb-1">Search</label>
                <div className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 pointer-events-none"> {/* Adjusted top-6 based on label */}
                    <FiSearch className="w-5 h-5 text-text-secondary" />
                </div>
                <input
                    id="search-desc"
                    type="search"
                    placeholder="Descriptions..."
                    className="block w-full p-2 pl-10 text-sm text-text-primary rounded-lg bg-background-secondary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                    value={searchQuery}
                    onChange={onSearchChange}
                    aria-label="Search descriptions"
                />
            </div>

            {/* Category/Source Filter */}
            <div className="flex flex-col min-w-[180px]"> {/* Added min-w */}
                <label htmlFor="filter-cat-source" className="block text-sm font-medium text-text-secondary mb-1">Filter By</label>
                <select
                    id="filter-cat-source"
                    className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary w-full sm:w-auto"
                    value={filterCategory}
                    onChange={onFilterChange}
                    aria-label="Filter by Category or Source"
                >
                    <option value="all">All Types</option>
                    <optgroup label="Expense Categories">
                        {/* Map over expenseCategories */}
                        {expenseCategories.map(cat => (
                            <option key={`cat-${cat.id}`} value={cat.id}>{cat.name}</option>
                        ))}
                    </optgroup>
                    <optgroup label="Income Sources">
                        {incomeSources.map(source => (
                            <option key={`inc-${source.id}`} value={`income-${source.id}`}>Income: {source.name}</option>
                        ))}
                    </optgroup>
                </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex flex-col min-w-[180px]"> {/* Added min-w */}
                 <label htmlFor="sort-by" className="block text-sm font-medium text-text-secondary mb-1">Sort By</label>
                <select
                    id="sort-by"
                    className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary w-full sm:w-auto"
                    value={sortBy}
                    onChange={onSortChange}
                    aria-label="Sort transactions"
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