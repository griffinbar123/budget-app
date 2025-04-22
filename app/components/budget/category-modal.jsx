// /app/components/budget/category-modal.jsx

// Add 'isNameDisabled' prop with a default value
export default function CategoryModal({
    isOpen,
    onClose,
    onSave,
    formData,
    onChange,
    editingCategory, // Still useful to know if editing
    isNameDisabled = false // New prop
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-background-primary p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-text-primary">
                    {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
                <div className="mb-4">
                    <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="category-name">
                        Category Name
                    </label>
                    <input
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:shadow-outline bg-background-secondary ${isNameDisabled ? 'cursor-not-allowed opacity-70' : ''}`} // Style disabled state
                        id="category-name"
                        type="text"
                        placeholder="Category Name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        disabled={isNameDisabled} // <-- Apply disabled attribute
                        aria-disabled={isNameDisabled} // Accessibility
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="category-type">
                        Type
                    </label>
                    {/* Optionally disable type change for 'Uncategorized' too if its type must be 'expense' */}
                    <select
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:shadow-outline bg-background-secondary ${isNameDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
                        id="category-type"
                        name="type"
                        value={formData.type}
                        onChange={onChange}
                        disabled={isNameDisabled} // Optionally disable
                        aria-disabled={isNameDisabled}
                    >
                        <option value="expense">Expense</option>
                        {/* Keep reserve if type still exists, otherwise remove */}
                        {/* <option value="reserve">Savings Goal</option> */}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="category-amount">
                        Allocated Amount
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:shadow-outline bg-background-secondary"
                        id="category-amount"
                        type="number"
                        placeholder="Amount"
                        name="plannedAmount"
                        value={formData.plannedAmount}
                        onChange={onChange}
                        // Typically amount is always editable
                    />
                </div>
                <div className="flex justify-end gap-2"> {/* Added gap */}
                    <button
                        className="bg-neutral hover:bg-neutral-hover text-text-primary font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={onClose}
                        type="button" // Ensure it doesn't submit form
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-accent-primary hover:bg-accent-primary/90 text-text-primary font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={onSave}
                        type="button" // Ensure it doesn't submit form
                    >
                        {editingCategory ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            </div>
        </div>
    );
}