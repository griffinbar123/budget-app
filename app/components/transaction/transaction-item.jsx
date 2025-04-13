// components/transaction/transaction-item.jsx
'use client'
import { selectCategoryById } from '@/app/store/categoriesSlice';
import React from 'react';
import { useSelector } from 'react-redux';

function TransactionItem({ categoryId, amount, date, description, sourceId, type }) {

    const category = useSelector(state => categoryId ? selectCategoryById(state, categoryId) : null);
    const categoryName = category?.name || 'Unknown Category';

    return (
        <div className="flex items-center justify-between p-2 border-b border-background-secondary last:border-0">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{description}</p>
                <p className="text-sm text-text-secondary truncate">
                  {/* Display source name for income, category name for expense/transfer */}
                  {type === 'income' ? `Income` : categoryName}

                </p>
                <p className="text-xs text-text-secondary">{date}</p>
            </div>
            <div className={`text-sm font-semibold ${type === 'income' ? 'text-success-primary' : 'text-danger-primary'}`}>
                {type === 'income' ? '+' : '-'}${Math.abs(amount).toFixed(2)}
            </div>
        </div>
    );
};

export default TransactionItem;