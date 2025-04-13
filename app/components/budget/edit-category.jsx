import BudgetCategory from "./budget-category";
import { FiX, FiPenTool } from "react-icons/fi"


export default function BudgetCategoryWithEdit ({ budgetCat, getCategoryById, onEdit, onDelete }) {
    const categoryData = getCategoryById(budgetCat.id); // Pass the full ID
    if (!categoryData) return null; // Handle case where category data is not found

    return (
        <div className="group relative bg-background-secondary p-4 rounded-lg">
            <BudgetCategory
                budgetCat={budgetCat}
            />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(budgetCat.id)}
                    className="p-1 hover:bg-background-primary rounded"
                >
                    <FiPenTool className="w-5 h-5 text-accent-primary" />
                </button>
                <button
                    onClick={() => onDelete(budgetCat.id)}
                    className="p-1 hover:bg-background-primary rounded"
                >
                    <FiX className="w-5 h-5 text-danger-primary" />
                </button>
            </div>
        </div>
    );
};