// /app/components/transaction/chart-section.jsx
'use client'

import DailyExpenditureChart from "../charts/daily-expenditure-chart";

// Added dateRangeLabel prop, removed month props
export default function ChartSection({ chartData, dateRangeLabel }) {
  return (
      <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="flex justify-between items-center mb-4">
               {/* Updated Title to include dynamic date range */}
              <h2 className="text-lg font-semibold text-text-primary">
                  Daily Expenditures ({dateRangeLabel})
              </h2>
              {/* Removed Month Picker Input */}
          </div>

          <div className="bg-background-secondary p-4 sm:p-6 rounded-xl overflow-x-auto shadow-md">
              {(!chartData || chartData.length === 0) ? (
                  <p className="text-center text-text-secondary italic py-8">No expenditure data for selected range.</p>
              ) : (
                 <DailyExpenditureChart chartData={chartData} />
              )}
          </div>
      </section>
  );
}