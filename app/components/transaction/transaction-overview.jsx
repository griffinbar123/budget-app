export default function TransactionOverview({ totalTransactions, totalExpenses, totalIncome, netChange, formattedMonthString }) {
    return (
        <section className="mb-8 bg-background-secondary p-4 sm:p-6 rounded-xl mx-4 sm:mx-6 md:mx-8 lg:mx-10">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-background-primary p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-text-primary">Total Transactions</h3>
                    <p className="text-xl text-text-primary">{totalTransactions}</p>
                    <p className="text-sm text-text-secondary">Number of transactions in {formattedMonthString}</p>
                </div>
                <div className="bg-background-primary p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-danger-primary">Total Expenses</h3>
                    <p className="text-xl text-danger-primary">${totalExpenses.toLocaleString()}</p>
                    <p className="text-sm text-text-secondary">Sum of all expenses in {formattedMonthString}</p>
                </div>
                <div className="bg-background-primary p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-success-primary">Total Income</h3>
                    <p className="text-xl text-success-primary">${totalIncome.toLocaleString()}</p>
                    <p className="text-sm text-text-secondary">Sum of all income in {formattedMonthString}</p>
                </div>
                <div className="bg-background-primary p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-accent-primary">Net Change</h3>
                    <p className="text-xl text-accent-primary">${netChange.toLocaleString()}</p>
                    <p className="text-sm text-text-secondary">Income minus expenses in {formattedMonthString}</p>
                </div>
            </div>
        </section>
    );
  }