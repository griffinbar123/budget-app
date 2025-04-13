// components/budget/budget-category.jsx
'use client'

export default function BudgetCategory({ budgetCat, spentAmount }) { // Receive spentAmount
  // Add a check here to prevent errors if budgetCat is undefined.
  if (!budgetCat) {
    return null; // Or some placeholder content
  }

  const isReserve = budgetCat.type === 'reserve';

  const planned = budgetCat.planned_amount ?? 1; // Avoid division by zero. Use 1 as a fallback, *not* 0.
  const progress = (spentAmount / planned) * 100;

  const progressColor = progress > 100 ? "bg-danger-primary" : "bg-accent-primary";

  return (
    // ... rest of your component ...
     <div className="bg-background-secondary p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-text-primary">
            {budgetCat.name}
            {isReserve && (
              <span className="ml-2 text-sm text-success-primary">
                (Savings Goal)
              </span>
            )}
          </h4>
          <p className="text-sm text-text-secondary">
            {isReserve ? 'Allocated' : 'Spent'}: ${spentAmount.toFixed(2)} / ${planned.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="w-full bg-progress rounded-full h-2">
        <div
          className={`h-2 rounded-full ${progressColor}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};