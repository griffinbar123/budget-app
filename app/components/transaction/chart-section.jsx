import DailyExpenditureChart from "../charts/daily-expenditure-chart";

export default function ChartSection({ chartData, currentMonth, handleMonthChange, formattedMonthString }) {
  return (
      <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Daily Expenditures ({formattedMonthString})</h2>
              <div>
                  <input
                      type="month"
                      value={currentMonth}
                      onChange={handleMonthChange}
                      className="p-2 rounded-lg bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                  />
              </div>
          </div>

          <div className="bg-background-secondary p-4 sm:p-6 rounded-xl overflow-x-auto">
              <DailyExpenditureChart chartData={chartData} /> 
          </div>
      </section>
  );
}