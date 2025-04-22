// /app/components/transaction/transaction-modal.jsx
'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { selectAllCategories } from '@/app/store/categoriesSlice';
import { selectAllIncomeSources } from '@/app/store/incomeSourcesSlice';

function TransactionModal({ isOpen, onClose, onSave, formData, onChange, editingTransactionId }) {
    const categoriesList = useSelector(selectAllCategories) || [];
    const incomeSources = useSelector(selectAllIncomeSources) || [];

    if (!isOpen) return null;

    const expenseCategories = categoriesList.filter(cat => cat.type === 'expense');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background-primary p-6 rounded-lg w-full max-w-md shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-text-primary">
                    {editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}
                </h3>

                {/* Add data-testid to the form */}
                <form
                    data-testid="transaction-modal-form" // <-- ADDED data-testid
                    onSubmit={(e) => {
                        e.preventDefault(); // Prevent default browser submission
                        onSave(); // Call the passed-in save handler
                    }}
                    className="space-y-4"
                >
                    {/* Date Input */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-1 text-text-secondary">Date</label>
                        <input id="date" type="date" name="date" value={formData.date} onChange={onChange} required className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"/>
                    </div>
                    {/* Type Select */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium mb-1 text-text-secondary">Type</label>
                        <select id="type" name="type" value={formData.type} onChange={onChange} className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary">
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            {/* <option value="transfer">Transfer</option> */}
                        </select>
                    </div>

                    {/* Conditional Category/Source Dropdown */}
                    {formData.type === 'expense' ? (
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium mb-1 text-text-secondary">Category</label>
                            <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={onChange} required className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary">
                                <option value="">-- Select Category --</option>
                                {expenseCategories.map(cat => (<option key={`cat-${cat.id}`} value={cat.id}>{cat.name}</option>))}
                            </select>
                        </div>
                    ) : formData.type === 'income' ? (
                        <div>
                            <label htmlFor="sourceId" className="block text-sm font-medium mb-1 text-text-secondary">Income Source</label>
                            <select id="sourceId" name="sourceId" value={formData.sourceId} onChange={onChange} required className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary">
                                <option value="">-- Select Income Source --</option>
                                {incomeSources.map(source => (<option key={`inc-${source.id}`} value={source.id}>{source.name}</option>))}
                            </select>
                        </div>
                    ) : null }

                    {/* Description Input */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1 text-text-secondary">Description</label>
                        <input id="description" type="text" name="description" value={formData.description} onChange={onChange} required className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"/>
                    </div>
                    {/* Amount Input */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-1 text-text-secondary">Amount</label>
                        <input id="amount" type="number" name="amount" value={formData.amount} onChange={onChange} required step="0.01" min="0.01" className="w-full p-2 rounded bg-background-secondary text-text-primary border border-background-secondary focus:border-accent-primary focus:ring-accent-primary"/>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral hover:bg-neutral-hover text-text-primary font-medium">
                            Cancel
                        </button>
                        {/* This button triggers the form onSubmit */}
                        <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 font-medium">
                            {editingTransactionId ? 'Save Changes' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TransactionModal;