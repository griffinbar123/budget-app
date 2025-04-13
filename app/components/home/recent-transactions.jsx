// app/components/home/recent-transactions.jsx

import Link from "next/link";
import TransactionItem from "../transaction/transaction-item";

function RecentTransactionsSection({ transactions }) { // Receive transactions as a prop
    return (
            <div className="bg-background-secondary p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold mb-4 text-text-primary">
                        Recent Transactions
                    </h2>
                    <Link
                        href="/home/transactions"
                        className="text-sm text-accent-primary hover:text-accent-primary/80"
                    >
                        View All
                    </Link>
                </div>

                <div className="space-y-3">
                    {transactions?.map((transaction) => (
                        <TransactionItem
                            key={transaction.id}
                            categoryId={transaction.categoryId}
                            amount={transaction.amount}
                            date={transaction.date}
                            description={transaction.description}
                        />
                    ))}
                </div>

                <div className="mt-4">
                    <Link
                        href="/home/transactions"
                        className="w-full bg-accent-primary text-text-primary py-2 px-4 rounded-lg hover:bg-accent-primary/90 transition-colors flex justify-center"
                    >
                        View All Transactions
                    </Link>
                </div>
            </div>
    );
}
export default RecentTransactionsSection;