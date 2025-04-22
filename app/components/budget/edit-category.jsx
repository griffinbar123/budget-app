// /app/components/budget/edit-category.jsx
import BudgetCategory from "./budget-category";
import { FiX, FiPenTool } from "react-icons/fi";
import { useSelector } from 'react-redux';
import { selectCurrentMonthTransactions } from '@/app/store/transactionsSlice';

export default function BudgetCategoryWithEdit ({ budgetCat, onEdit, onDelete }) {

    // --- Calculate spentAmount for this specific category ---
    const transactions = useSelector(selectCurrentMonthTransactions);
    const spentAmount = useSelector(state => {
        if (!budgetCat || !transactions) return 0;
        return Object.values(transactions)
               .filter(trans => trans.category_id === budgetCat.id && trans.type === 'expense')
               .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);
    });
    // --- End Calculation ---

    if (!budgetCat) {
        console.warn("BudgetCategoryWithEdit rendered without budgetCat prop");
        return null;
    }

    return (
        <div className="group relative bg-background-secondary p-4 rounded-lg">
            <BudgetCategory
                budgetCat={budgetCat}
                spentAmount={spentAmount}
            />
            {/* Edit/Delete buttons appear on hover */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                {/* Edit Button (Always shown, but modal will disable name input) */}
                <button
                    onClick={() => onEdit(budgetCat.id)}
                    className="p-1 hover:bg-background-primary rounded"
                    aria-label={`Edit category ${budgetCat.name}`}
                >
                    <FiPenTool className="w-5 h-5 text-accent-primary" />
                </button>

                {/* --- Conditionally render Delete Button --- */}
                {budgetCat.name !== 'Uncategorized' && (
                    <button
                        onClick={() => onDelete(budgetCat.id)}
                        className="p-1 hover:bg-background-primary rounded"
                        aria-label={`Delete category ${budgetCat.name}`}
                    >
                        <FiX className="w-5 h-5 text-danger-primary" />
                    </button>
                )}
                {/* --- End Conditional Render --- */}
            </div>
        </div>
    );
};