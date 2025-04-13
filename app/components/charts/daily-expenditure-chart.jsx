// DailyExpenditureChart.jsx
'use client'; // Make sure it's 'use client'

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer, // For responsiveness
} from 'recharts';

const DailyExpenditureChart = ({ chartData, textPrimary, textSecondary }) => {
  return (
    <ResponsiveContainer width="100%" height={300}> {/* Responsive chart container */}
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={textSecondary} /> {/* Theme grid color */}
        <XAxis dataKey="day" stroke={textPrimary} tickLine={false} /> {/* Theme X axis text */}
        <YAxis stroke={textPrimary} tickLine={false} /> {/* Theme Y axis text */}
        <Tooltip contentStyle={{ backgroundColor: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} /> {/* Tooltip styling - adjust as needed */}
        <Line type="monotone" dataKey="expenditure" stroke="#f97316" strokeWidth={2} /> {/* Line color - orange from your theme? */}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DailyExpenditureChart;