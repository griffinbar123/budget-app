// /app/components/budget/budget-category.jsx
'use client'
import React from 'react';

export default function BudgetCategory({ budgetCat, spentAmount }) {
    if (!budgetCat) {
        // console.warn("BudgetCategory rendered without budgetCat prop"); // <-- REMOVE this line
        return null;
    }
    // Add a check here to prevent errors if budgetCat is undefined or null.
    if (!budgetCat) {
        console.warn("BudgetCategory rendered without budgetCat prop");
        return null; // Render nothing if no category data
    }

    // Determine if it's a reserve/savings goal (adjust type name if needed)
    const isReserve = budgetCat.type === 'reserve';

    // Safely get planned amount, default to 1 for progress calculation if 0 or invalid to avoid division by zero errors
    // although we handle planned 0 specifically below. Defaulting planned to 0 is safer for display.
    const planned = budgetCat.planned_amount ?? 0;
    const plannedForCalc = planned === 0 ? 1 : planned; // Use 1 only for division

    // Ensure spentAmount is a number, default to 0
    const actualSpent = typeof spentAmount === 'number' ? spentAmount : 0;

    // Calculate progress percentage
    let progress = (actualSpent / plannedForCalc) * 100;
    // Handle potential NaN results, though unlikely with ?? 1
    if (isNaN(progress)) progress = 0;
    // If planned is genuinely 0, progress is > 100% if anything is spent
    if (planned === 0 && actualSpent > 0) progress = 101;
    if (planned === 0 && actualSpent === 0) progress = 0;


    // Determine progress bar color and capped width for display
    const progressColor = progress > 100 ? "bg-danger-primary" : "bg-accent-primary";
    const displayProgress = Math.min(progress, 100); // Cap visual width at 100%

    // Format numbers for display
    const formatCurrency = (num) => (typeof num === 'number' ? num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');

    return (
        <div className="bg-background-secondary p-4 rounded-lg shadow"> {/* Added shadow */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    {/* Category Name */}
                    <h4 className="font-medium text-text-primary">
                        {budgetCat.name}
                        {/* Display '(Savings Goal)' only if it's a reserve type */}
                        {isReserve && (
                            <span className="ml-2 text-xs font-light text-success-primary"> {/* Adjusted style */}
                                (Savings Goal)
                            </span>
                        )}
                    </h4>
                    {/* Spent/Allocated vs Planned Text */}
                    <p className="text-sm text-text-secondary">
                        {isReserve ? 'Allocated' : 'Spent'}: ${formatCurrency(actualSpent)} / ${formatCurrency(planned)}
                    </p>
                </div>
            </div>
            {/* Progress Bar Container with ARIA attributes */}
            <div
                className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden" // Using theme-agnostic colors for track potentially, or use theme variable like --progress-background
                role="progressbar" // <-- ROLE added
                aria-valuenow={progress.toFixed(0)} // Current percentage as whole number
                aria-valuemin="0"
                aria-valuemax="100" // Max is conceptually 100% for a bar
                aria-label={`${budgetCat.name} budget progress`} // Accessibility label
            >
                {/* Inner progress element */}
                <div
                    className={`h-full rounded-full ${progressColor} transition-width duration-300 ease-in-out`} // Added transition
                    style={{ width: `${displayProgress}%` }} // Use capped width
                />
            </div>
        </div>
    );
};