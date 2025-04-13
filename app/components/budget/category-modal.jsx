// app/components/budget/category-modal.jsx
export default function CategoryModal({ isOpen, onClose, onSave, formData, onChange, editingCategory }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-background-primary p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-text-primary">
                    {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
                <div className="mb-4">
                    <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="category-name">
                        Category Name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:shadow-outline bg-background-secondary"
                        id="category-name"
                        type="text"
                        placeholder="Category Name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="category-type">
                        Type
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:shadow-outline bg-background-secondary"
                        id="category-type"
                        name="type"
                        value={formData.type}
                        onChange={onChange}
                    >
                        <option value="expense">Expense</option>
                        <option value="reserve">Savings Goal</option>
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
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        className="bg-neutral hover:bg-neutral-hover text-text-primary font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-accent-primary hover:bg-accent-primary/90 text-text-primary font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={onSave}
                    >
                        {editingCategory ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            </div>
        </div>
    );
}