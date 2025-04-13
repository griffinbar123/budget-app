 // app/home/savings/page.jsx
'use client'
import StatCard from "@/app/components/stat-card";

// --- New Component: SavingsOverview ---
export default function SavingsOverview({ totalSavings, plannedSavingsGoals, allocatedThisMonth, remainingSavingsGoals }) {
    return (
        <section className="mb-8 bg-background-secondary p-4 sm:p-6 rounded-xl mx-4 sm:mx-6 md:mx-8 lg:mx-10">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">Savings Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Savings"
                    value={totalSavings}
                    color="blue"
                    description="Total amount in savings accounts"
                    span={"lg:col-span-2"}
                />
                <StatCard
                    label="Planned Savings Goals (This Month)"
                    value={plannedSavingsGoals}
                    color="orange"
                    description="Total savings goals planned for this month"
                    span={"lg:col-span-2"}
                />
                <StatCard
                    label="Allocated This Month"
                    value={allocatedThisMonth}
                    color="green"
                    description="Amount saved towards goals this month"
                />
                <StatCard
                    label="Savings Goals Remaining"
                    value={remainingSavingsGoals}
                    color="orange"
                    description="Amount still needed to reach this month's savings goals"
                />
            </div>
        </section>
    );
}
