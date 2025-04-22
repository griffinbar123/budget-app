// app/components/home/quick-stats.jsx
'use client'
import StatCard from "@/app/components/stat-card";
import { useSelector } from 'react-redux';
import { selectCurrentMonthSummary } from "@/app/store/categoriesSlice"; // Ensure path is correct

function QuickStatsSection() {
    // Get the summary object including budget figures from Redux
    const summary = useSelector(selectCurrentMonthSummary);

    // Provide default values
    const receivedIncome = summary?.receivedIncome ?? 0;
    const spentExpenses = summary?.spentExpenses ?? 0;
    const plannedExpenses = summary?.plannedExpenses ?? 0;
    const remainingExpenses = summary?.remainingExpenses ?? 0;
    const totalTransactions = summary?.totalTransactions ?? 0;
    const netChange = receivedIncome - spentExpenses;

    return (
        <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
            {/* Add bg-background-secondary back to this div */}
            <div className="bg-background-secondary p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4 text-text-primary">
                    Current Month Overview
                </h2>
                {/* Using 3 columns for 2 rows layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Row 1: Actuals */}
                    <StatCard
                        label="Income"
                        value={receivedIncome}
                        color="green"
                        description="Total income received this month."
                    />
                    <StatCard
                        label="Expenses"
                        value={spentExpenses}
                        color="red"
                        description="Total expenses paid this month."
                    />
                     <StatCard
                        label="Net Change"
                        value={netChange}
                        color={netChange >= 0 ? "green" : "red"}
                        description="Income minus expenses."
                    />

                    {/* Row 2: Budget & Transactions */}
                     <StatCard
                        label="Expense Budget"
                        value={plannedExpenses}
                        color="orange" // Use a color distinct from income/expense
                        description="Total planned for expenses."
                    />
                    <StatCard
                        label="Budget Remaining"
                        value={remainingExpenses}
                        // Orange/Green if positive/zero, Red if negative (overspent)
                        color={remainingExpenses >= 0 ? "orange" : "red"}
                        description={remainingExpenses >= 0 ? "Amount left in expense budget." : "Amount overspent."}
                        subtext={remainingExpenses < 0 ? `Overspent by $${Math.abs(remainingExpenses).toLocaleString()}` : null}
                    />
                     <StatCard
                        label="Transactions"
                        value={totalTransactions}
                        color="blue" // Use a neutral/informative color
                        description="Transactions recorded this month."
                    />
                </div>
            </div>
        </section>
    );
}

export default QuickStatsSection;