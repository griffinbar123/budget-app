'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';


function CustomBarChart({ chartData }) {
  return (
    <div className="bg-background-secondary p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">
          Category Allocation vs. Spending
        </h2>
        <div className="h-64 text-text-primary">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis
                        dataKey="name"
                        stroke="rgb(var(--text-primary))"  // Use CSS variables directly
                        tick={{ fill: "rgb(var(--text-secondary))" }} // Use CSS variables
                    />
                    <YAxis
                        stroke="rgb(var(--text-primary))"  // Use CSS variables
                        tick={{ fill: "rgb(var(--text-secondary))" }} // Use CSS variables
                    />
                    <Tooltip
                        cursor={{ fill: "rgb(var(--background-primary))" }}  // Use CSS variables
                        contentStyle={{ backgroundColor: "rgb(var(--background-primary))", borderColor: "rgb(var(--background-secondary))" }}  // Use CSS variables
                        formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar
                        dataKey="budget"
                        name="Planned Amount"  // More general term
                        fill="rgb(var(--accent-primary))" // Use CSS variable
                    />
                    <Bar
                        dataKey="spent"
                        name="Actual Spent"
                        fill="rgb(var(--success-primary))" // Use CSS variable
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  )
}

export default CustomBarChart;