'use client'

// components/FundBreakdownChart.jsx

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FundBreakdownChart({ budgetSummary }) { // Remove color props

  // --- Data for Pie Chart - use budgetSummary data, with fallbacks ---
  const hasData = budgetSummary && typeof budgetSummary.plannedExpenses === 'number' && typeof budgetSummary.plannedReserves === 'number';

  const data = hasData ? [
    { name: "Expenses", value: budgetSummary?.plannedExpenses || 0 },
    { name: "Savings Goals", value: budgetSummary?.plannedReserves || 0 }  // Use plannedReserves INTERNALLY, "Savings Goals" for display
  ] : [];

  // Define colors using CSS variables *inside* the component
  const COLORS = [
    "rgb(var(--danger-primary))",  // Use CSS variables for consistency
    "rgb(var(--success-primary))",  // Use CSS variables
  ];

  return (
    <div className="bg-background-secondary p-6 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 text-text-primary">
          Expenses vs Savings Goals  {/* Updated title */}
      </h2>

      <div className="h-64 text-text-primary">
          <ResponsiveContainer width="100%" height="100%">
          {hasData ? (
            <PieChart width={400} height={300}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"

              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: "rgb(var(--background-primary))" }} // Use CSS vars
                contentStyle={{ backgroundColor: "rgb(var(--background-primary))", borderColor: "rgb(var(--background-secondary))" }} // Use CSS vars
                itemStyle={{
                  color: "rgb(var(--text-primary))", // Use CSS Vars
                }}
                labelStyle={{
                  color: "rgb(var(--text-primary))", // Use CSS Vars
                }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Legend
              iconSize={10}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                color: "rgb(var(--text-primary))", // Use CSS Vars
                fontSize: '0.65rem',
              }}
              />
            </PieChart>
            ) : (
                <div className="flex justify-center items-center h-full text-text-secondary">
                    No data available.
                </div>
            )}
          </ResponsiveContainer>
        </div>
    </div>
  );
}