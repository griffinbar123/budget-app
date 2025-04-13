// app/components/transaction/transaction-modal.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectAllCategories, selectAllIncomeSources } from '@/app/store/financeSlice'; // Import selectors


function TransactionModal({ isOpen, onClose, onSave, formData, onChange, editingTransactionId }) {
    const categoriesList = useSelector(selectAllCategories); // Use selector
    const incomeSources = useSelector(selectAllIncomeSources); // Use selector


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background-primary p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-text-primary">
                    {editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-secondary">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={onChange}
                            className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-secondary">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={onChange}
                            className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="transfer">Transfer</option> {/*Consider if you need transfers*/}
                        </select>
                    </div>
                    {formData.type !== 'income' ? (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text-secondary">Category</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={onChange}
                                className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                            >
                                <option value="">-- Select Category --</option>
                                {categoriesList.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text-secondary">Income Source</label>
                            <select
                                name="sourceId"
                                value={formData.sourceId}
                                onChange={onChange}
                                className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                            >
                                <option value="">-- Select Income Source --</option>
                                {incomeSources.map(source => (
                                    <option key={source.id} value={source.id}>{source.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-secondary">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-secondary">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={onChange}
                            className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-neutral hover:bg-neutral-hover text-text-primary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="px-4 py-2 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-primary/90"
                        >
                            {editingTransactionId ? 'Save Changes' : 'Add Transaction'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionModal;