// /app/components/transaction/transaction-overview.jsx

// Changed prop name from formattedMonthString to formattedDateRangeString
export default function TransactionOverview({
    totalTransactions,
    totalExpenses,
    totalIncome,
    netChange,
    formattedDateRangeString // Use the new prop name
}) {
    // Helper to format currency (optional, can also format in parent)
    const formatCurrency = (num) => (typeof num === 'number' ? num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00');

    return (
        <section className="mb-8 bg-background-secondary p-4 sm:p-6 rounded-xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 shadow-md"> {/* Added shadow */}
             {/* Updated Title to include the date range */}
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
                Overview ({formattedDateRangeString})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat Card Descriptions are now generic */}
                <div className="bg-background-primary p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-text-primary text-sm">Total Transactions</h3> {/* Slightly smaller heading */}
                    <p className="text-xl text-text-primary">{totalTransactions}</p>
                    <p className="text-xs text-text-secondary">Transactions in selected range</p> {/* Generic description */}
                </div>
                <div className="bg-background-primary p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-danger-primary text-sm">Total Expenses</h3>
                    <p className="text-xl text-danger-primary">${formatCurrency(totalExpenses)}</p>
                    <p className="text-xs text-text-secondary">Sum of expenses in selected range</p> {/* Generic description */}
                </div>
                <div className="bg-background-primary p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-success-primary text-sm">Total Income</h3>
                    <p className="text-xl text-success-primary">${formatCurrency(totalIncome)}</p>
                    <p className="text-xs text-text-secondary">Sum of income in selected range</p> {/* Generic description */}
                </div>
                <div className="bg-background-primary p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-accent-primary text-sm">Net Change</h3>
                    <p className={`text-xl font-semibold ${netChange >= 0 ? 'text-success-primary' : 'text-danger-primary'}`}> {/* Dynamic color */}
                       {netChange >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netChange))}
                    </p>
                    <p className="text-xs text-text-secondary">Income minus expenses in range</p> {/* Generic description */}
                </div>
            </div>
        </section>
    );
  }