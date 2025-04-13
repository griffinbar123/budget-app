// app/components/home/quick-stats.jsx
import StatCard from "@/app/components/stat-card";
import { useSelector } from 'react-redux'; // Import useSelector
import { selectCurrentMonthSummary } from "@/app/store/categoriesSlice";

function QuickStatsSection() { // No longer takes currentMonthSummary as a prop
    const currentMonthSummary = useSelector(selectCurrentMonthSummary); // Get from Redux

    // Provide default values in case currentMonthSummary is null/undefined
    const summary = currentMonthSummary || {
        totalAssets: 0,
        budgetedThisMonth: 0,
        plannedExpenses: 0,
        plannedReserves: 0,
        receivedIncome: 0,
        spentExpenses: 0,
        reservedReserves: 0,
        remainingExpenses: 0,
        remainingReserves: 0,
        plannedIncome: 0,
    };

    const remainingIncome = (summary.plannedIncome || 0) - (summary.receivedIncome || 0);
    const remainingExpenses = (summary.plannedExpenses || 0) - (summary.spentExpenses || 0);
    const remainingReserves = (summary.plannedReserves || 0) - (summary.reservedReserves || 0);

    return (
        <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
            <div className="bg-background-secondary p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4 text-text-primary">
                    Total Funds Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Assets"
                        value={summary.totalAssets}
                        span={"lg:col-span-2"}
                        color="blue"
                         // We'll handle dynamic subtext later, once we have account data
                        description="Actual money across all accounts"
                    />
                    <StatCard
                        label="Budgeted This Month"
                        value={summary.budgetedThisMonth}
                        span={"lg:col-span-2"}
                        color="orange"
                        subtext={`Expenses: $${summary.plannedExpenses?.toLocaleString() || 'N/A'} | Savings Goals: $${summary.plannedReserves?.toLocaleString() || 'N/A'}`}
                        description="Planned expenses and reserves budgeted for this month"
                    />
                    <div className="lg:col-span-4 md:col-span-2  grid gap-4 grid-cols-1 lg:grid-cols-3">
                        <StatCard
                            label="Planned Income"
                            value={summary.plannedIncome}
                            span={"lg:col-span-1"}
                            subtext={`Received: $${summary.receivedIncome?.toLocaleString() || 'N/A'} | Remaining: $${remainingIncome.toLocaleString()}`}
                            description="Total planned income this month"
                            color="green"
                        />
                        <StatCard
                            label="Planned Expenses"
                            value={summary.plannedExpenses}
                            span={"lg:col-span-1 "}
                            subtext={`Spent: $${summary.spentExpenses?.toLocaleString() || 'N/A'} | Remaining: $${remainingExpenses.toLocaleString()}`}
                            description="Total planned expenses this month"
                            color="red"
                        />
                        <StatCard
                            label="Planned Savings Goals"
                            value={summary.plannedReserves}
                            span={"lg:col-span-1 "}
                            subtext={`Allocated: $${summary.reservedReserves?.toLocaleString() || 'N/A'} | Remaining: $${remainingReserves.toLocaleString()}`}
                            description="Total planned savings goals this month"
                            color="indigo"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default QuickStatsSection;