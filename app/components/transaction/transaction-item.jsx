// /app/components/transaction/transaction-item.jsx
'use client'
import React from 'react'; // Import React
import { FiX } from "react-icons/fi"; // Import delete icon
import { useSelector } from 'react-redux'; // Keep useSelector
import { selectTransactionById } from '@/app/store/transactionsSlice'; // Import selector by ID

// Helper (optional, can be moved)
const formatDateDisplay = (dateString) => {
     if (!dateString) return 'N/A';
     try {
         const [year, month, day] = dateString.split('-');
         return `${month}/${day}/${year}`;
     } catch (e) {
         return dateString; // Fallback
     }
 };

// Accepts transactionId, maps, lists, and handlers
function TransactionItemComponent({
    transactionId,      // <-- Receive ID instead of full object
    categoryMap,        // <-- Receive pre-computed map
    sourceMap,          // <-- Receive pre-computed map
    expenseCategories,  // <-- Receive list for dropdown
    onCategoryChange,   // Function: (transactionId, newCategoryIdValue) => void
    onDelete,           // Function: (transactionId) => void
}) {

    // --- Select the specific transaction data using the ID ---
    const transaction = useSelector(state => selectTransactionById(state, transactionId));

    // --- Render null or loading state if transaction not found ---
    if (!transaction) {
        // This could briefly happen if item deleted, prevents error
        return null;
    }
    // --- End Data Selection ---

    // --- FIX: Destructure category_id and source_id (snake_case) ---
    const { id, amount, date, description, type, category_id, source_id } = transaction;
    // --- END FIX ---

    // Resolve names using the passed-in maps
    const categoryName = category_id ? (categoryMap[category_id] || 'Unknown Category') : null;
    const sourceName = source_id ? (sourceMap[source_id] || 'Unknown Source') : 'N/A'; // Use N/A for missing source name

    // Conditionally render dropdown for expense, text for income
    const displayCategoryOrSource = type === 'income'
        ? (sourceName || 'Unknown Source') // Display source name
        : type === 'expense'
            ? ( // Render dropdown for expenses
                <select
                    // --- FIX: Use category_id (snake_case) for the value ---
                    value={category_id ?? ''} // Handle null category_id for default/unselected state
                    // --- END FIX ---
                    onChange={(e) => onCategoryChange(id, e.target.value)} // Pass event value (which is ID string)
                    onClick={(e) => e.stopPropagation()} // Prevent clicks bubbling up if item is wrapped
                    className="bg-transparent border-none text-text-secondary text-sm p-0 focus:ring-0 focus:outline-none appearance-none cursor-pointer hover:text-accent-primary"
                    aria-label={`Change category for ${description}`}
                >
                    {/* Default option for unassigned state */}
                    <option value="">-- Select --</option>
                    {/* Map over the passed-in list of expense categories */}
                    {(expenseCategories || []).map(cat => ( // Add safety map over empty array
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    {/* Show current selection if it's somehow not in the main list (e.g., maybe 'Uncategorized' wasn't passed or type mismatch) */}
                    {category_id && !expenseCategories.some(c => c.id === category_id) && (
                         <option value={category_id} disabled>{categoryName || `ID: ${category_id}`}</option>
                     )}
                </select>
              )
            : 'N/A'; // Handle other types like 'transfer' if they exist

    // Format amount for display
    const formattedAmount = Math.abs(amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const amountColor = amount >= 0 ? 'text-success-primary' : 'text-danger-primary';
    const amountSign = amount >= 0 ? '+' : '-';

    return (
        <div className="group flex items-center justify-between p-2 border-b border-background-secondary last:border-0 hover:bg-background-primary/50 transition-colors duration-150">
            {/* Transaction Details */}
            <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-medium text-text-primary truncate" title={description}>{description}</p>
                {/* Category Dropdown / Source Name */}
                <div className="text-sm text-text-secondary truncate">
                    {displayCategoryOrSource}
                </div>
                {/* Date */}
                <p className="text-xs text-text-secondary">{formatDateDisplay(date)}</p>
            </div>
            {/* Amount */}
            <div className={`text-sm font-semibold whitespace-nowrap ${amountColor} mr-2`}>
                {amountSign}${formattedAmount}
            </div>
            {/* Delete Button (appears on hover) */}
            <button
                 onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                 className="p-1 rounded text-danger-primary opacity-0 group-hover:opacity-100 hover:bg-danger-primary/20 transition-opacity duration-150"
                 aria-label={`Delete transaction ${description}`}
            >
                 <FiX className="w-4 h-4" />
            </button>
        </div>
    );
};

// Memoize the component for performance
const TransactionItem = React.memo(TransactionItemComponent);
export default TransactionItem;