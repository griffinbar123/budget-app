'use client'

import React from 'react'

function StatCard({ label, value, color, description, subtext, span, suffix }) {

  const getColorClass = (colorName) => {
    switch (colorName) {
      case 'blue':   return 'text-blue-500'; // Or 'text-accent-primary' if you prefer
      case 'orange': return 'text-orange-500';
      case 'green':  return 'text-success-primary';
      case 'red':    return 'text-danger-primary';
      case 'indigo': return 'text-indigo-500'; // Or a custom 'reserve' color
      default:      return 'text-text-primary';
    }
  };

  const colorClass = getColorClass(color);


  return (
    <div className={`bg-background-primary p-4 rounded-lg ${span}`}>
        <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">{label}</h3>
            {/* Apply the dynamic color class here */}
            <span className={`text-lg font-semibold ${colorClass}`}>
              ${value?.toLocaleString()}{suffix && suffix}
            </span>
        </div>
        {subtext && (
            <p className="text-xs text-text-secondary/80">
            {subtext}
            </p>
        )}
        <p className="text-xs text-text-secondary leading-tight">
            {description}
        </p>
        </div>
  </div>
  )
}

export default StatCard