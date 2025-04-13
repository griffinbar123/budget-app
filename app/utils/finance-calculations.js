// app/utils/finance-calculations.js

export function calculateCurrentMonthSummary(transactions, categories, incomeSources) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentMonthString = `${currentYear}-${currentMonth}`;

    // Ensure transactions, categories, and incomeSources are arrays
    const transactionsArray = Object.values(transactions || {}); // Handle null/undefined
    const categoriesArray = Object.values(categories || {});
    const incomeSourcesArray = Object.values(incomeSources || {});

    // Filter transactions for the current month.
    const currentMonthTransactions = transactionsArray.filter(trans => trans.date.startsWith(currentMonthString));

    // Calculate total income received.
    const totalIncomeReceivedCurrentMonth = currentMonthTransactions
        .filter(trans => trans.type === 'income')
        .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);

    // Calculate total expenses spent.
    const totalExpensesSpentCurrentMonth = currentMonthTransactions
        .filter(trans => trans.type === 'expense')
        .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);

    // Calculate planned expenses and reserves for this month.
    const plannedExpenses = categoriesArray
        .filter(cat => cat.type === 'expense')
        .reduce((sum, cat) => sum + (cat.planned_amount || 0), 0); // Use planned_amount

    const plannedReserves = categoriesArray
        .filter(cat => cat.type === 'reserve')
        .reduce((sum, cat) => sum + (cat.planned_amount || 0), 0); // Use planned_amount

    // Calculate total amount moved to reserves this month.
    const currentMonthSavingsForReserves = currentMonthTransactions
        .filter(trans => trans.type === 'transfer')
        .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);

    // Calculate total planned income
    const totalIncomePlannedMonthly = incomeSourcesArray.reduce((sum, source) => sum + (source.plannedAmount || 0), 0); //Make sure plannedAmount exists

    return {
        totalAssets: 0,  // You'll need to fetch/calculate this
        budgetedThisMonth: plannedExpenses + plannedReserves,
        plannedIncome: totalIncomePlannedMonthly,
        plannedExpenses: plannedExpenses,
        plannedReserves: plannedReserves,
        receivedIncome: totalIncomeReceivedCurrentMonth,
        spentExpenses: totalExpensesSpentCurrentMonth,
        reservedReserves: currentMonthSavingsForReserves, // Use consistent naming
        remainingIncome: totalIncomePlannedMonthly - totalIncomeReceivedCurrentMonth,
        remainingExpenses: plannedExpenses - totalExpensesSpentCurrentMonth,
        remainingReserves: plannedReserves - currentMonthSavingsForReserves,
    };
}

export function prepareCurrentMonthChartData(transactions, categories) {
      if (!transactions || !categories) {
        return [];
    }
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentMonthString = `${currentYear}-${currentMonth}`;

    // Filter transactions for the current month.
    const currentMonthTransactions = Object.values(transactions).filter(trans => trans.date.startsWith(currentMonthString));

    return Object.values(categories).map((category) => { // Ensure categories is an array
      const spentCurrentMonth = currentMonthTransactions
        .filter(
          (trans) => trans.category_id === category.id && trans.type === "expense"
        )
        .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);

      return {
        name: category.name,
        budget: category.planned_amount || 0, // Use planned_amount
        spent: spentCurrentMonth,
        remaining: (category.planned_amount || 0) - spentCurrentMonth,
      };
    });
}
//No longer needed
// export function getCategoryById(categoriesList, categoryId) {
//     const category = categoriesList.find(cat => cat.id === categoryId);
//     return category || null; // Important: Return null if not found
// }