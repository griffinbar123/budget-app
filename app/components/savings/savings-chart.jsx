import FundBreakdownChart from "../charts/funds-breakdown-chart";

export default function SavingsChartSection({ chartData }) {
    return (
        <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">Savings Goal Breakdown</h2>
            <div className="bg-background-secondary p-4 sm:p-6 rounded-xl overflow-x-auto">
                <FundBreakdownChart // Or replace with a different chart type
                    budgetSummary={ chartData }
                /> 
            </div>
        </section>
    );
}