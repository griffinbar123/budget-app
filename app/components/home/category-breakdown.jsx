// app/components/home/category-breakdown.jsx
import Link from "next/link";
import BudgetCategory from "../budget/budget-category";
import { useSelector } from 'react-redux';
import { selectCurrentMonthTransactions } from "@/app/store/transactionsSlice"; // Correct import

function CategoryBreakdownSection({ categories }) {
    const transactions = useSelector(selectCurrentMonthTransactions); // Use correct selector

    const getSpentAmount = (categoryId) => {
        return Object.values(transactions) // Ensure transactions is an array
          .filter(trans => trans.category_id === categoryId && trans.type === 'expense')
          .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);
    }

    return (
            <div className="bg-background-secondary p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold mb-4 text-text-primary">
                        Category Breakdown
                    </h2>
                    <Link
                        href="/home/budget"
                        className="text-sm text-accent-primary hover:text-accent-primary/80"
                    >
                        View All
                    </Link>
                </div>
                <div className="space-y-4">
                    {categories?.map((categoryData) => (
                        <BudgetCategory
                            key={categoryData.id}
                            budgetCat={categoryData}
                            spentAmount={getSpentAmount(categoryData.id)} // Pass spent amount
                        />
                    ))}
                    {categories?.length > 7 && (
                        <div className="mt-4">
                            <Link
                                href="/home/budget"
                                className="w-full bg-accent-primary text-text-primary py-2 px-4 rounded-lg hover:bg-accent-primary/90 transition-colors flex justify-center"
                            >
                                View All Budget Categories
                            </Link>
                        </div>
                    )}
                </div>
            </div>
    );
}
export default CategoryBreakdownSection;