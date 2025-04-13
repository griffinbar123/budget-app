// app/components/budget/stats-overview.jsx
import StatCard from "@/app/components/stat-card";

function StatsOverview({ currentMonthSummary }) {
    return (
        <section className="mb-8 bg-background-secondary p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">Budget Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Budget Section */}
                <StatCard
                    label="Budgeted This Month"
                    value={currentMonthSummary?.budgetedThisMonth || 0}
                    color="orange"
                    description="Total amount allocated for expenses and savings goals." // Updated
                    subtext={`Expenses: $${currentMonthSummary?.plannedExpenses?.toLocaleString() || 'N/A'} | Savings Goals: $${currentMonthSummary?.plannedReserves?.toLocaleString() || 'N/A'}`} // Updated
                />
                <StatCard
                    label="Total Spent (This Month)"
                    value={(currentMonthSummary?.spentExpenses + currentMonthSummary?.reservedReserves) || 0}
                    color="orange"
                    description="Combined total of expenses spent and funds moved to savings goals." // Updated
                    subtext={`Expenses: $${Math.abs(currentMonthSummary?.spentExpenses ?? 0).toLocaleString()} | Savings Goals: $${Math.abs(currentMonthSummary?.reservedReserves ?? 0).toLocaleString()}`} // Updated
                />
                <StatCard
                    label="Expense Budget Remaining"
                    value={Math.max(0, currentMonthSummary?.plannedExpenses - currentMonthSummary?.spentExpenses) || 0}
                    color={(currentMonthSummary?.plannedExpenses - currentMonthSummary?.spentExpenses) < 0 ? "red" : "orange"}
                    description="Amount remaining in the expense budget before overspending."
                    subtext={(currentMonthSummary?.plannedExpenses - currentMonthSummary?.spentExpenses) < 0 ? `Overspent: $${Math.abs(currentMonthSummary?.plannedExpenses - currentMonthSummary?.spentExpenses).toLocaleString()}` : null}
                />
                <StatCard
                    label="Savings Goals Remaining" // Updated
                    value={Math.max(0, currentMonthSummary?.plannedReserves - currentMonthSummary?.reservedReserves) || 0}
                    color={(currentMonthSummary?.plannedReserves - currentMonthSummary?.reservedReserves) < 0 ? "red" : "orange"}
                    description="Amount remaining to be allocated to reach savings goals." // Updated
                    subtext={(currentMonthSummary?.plannedReserves - currentMonthSummary?.reservedReserves) < 0 ? `Overspent: $${Math.abs(currentMonthSummary?.plannedReserves - currentMonthSummary?.reservedReserves).toLocaleString()}` : null}

                />

                {/* Income Section - Separated for Clarity */}
                <StatCard
                    label="Planned Income"
                    value={currentMonthSummary?.plannedIncome || 0}
                    color="blue"
                    description="Total income expected for the current month."
                    span={"md:col-span-2 lg:col-span-1"}
                />
                <StatCard
                    label="Received Income (This Month)"
                    value={currentMonthSummary?.receivedIncome || 0}
                    color="green"
                    description="Total income received to date in the current month."
                    span={"md:col-span-2 lg:col-span-1"}
                />
            </div>
        </section>
    );
}

export default StatsOverview;