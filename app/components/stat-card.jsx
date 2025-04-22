// /app/components/stat-card.jsx
'use client'
import React from 'react'

function StatCard({ label, value, color, description, subtext, span, suffix }) {

  const getColorClass = (colorName) => {
    switch (colorName) {
      case 'blue':    return 'text-blue-500'; 
      case 'orange': return 'text-orange-500';
      case 'green':   return 'text-success-primary';
      case 'red':     return 'text-danger-primary';
      case 'indigo': return 'text-indigo-500';
      default:        return 'text-text-primary';
    }
  };

  const colorClass = getColorClass(color);

  const formattedValue = typeof value === 'number' ? value.toLocaleString(undefined, {
      minimumFractionDigits: (value % 1 === 0) ? 0 : 2,
      maximumFractionDigits: 2
  }) : '';

  const showCurrencySymbol = typeof value === 'number';

  return (
    <div className={`bg-background-primary p-4 rounded-lg shadow ${span || ''}`}> 
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">{label}</h3>
            <span
                data-testid="stat-card-value" 
                className={`text-lg font-semibold ${colorClass}`}
            >
                {showCurrencySymbol ? '$' : ''}{formattedValue}{suffix || ''}
            </span>
        </div>
        {subtext && (
            <p className="text-xs text-text-secondary/80">
             {subtext}
            </p>
        )}
        {description && (
             <p className="text-xs text-text-secondary leading-tight">
                 {description}
             </p>
        )}
      </div>
    </div>
  )
}

export default StatCard
