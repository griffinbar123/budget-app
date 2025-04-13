'use client'

import React from 'react'
import { RadialBarChart, RadialBar, Tooltip, Legend, ResponsiveContainer } from 'recharts';


function CustomRadialBarChart({chartData, accentPrimary, textPrimary, textSecondary, backgroundPrimary, backgroundSecondary}) {
  return (
    <div className="bg-background-secondary pt-6 px-6 pb-2 rounded-xl">
        <h2 className="text-lg font-semibold text-text-primary">
            Spending Progress
        </h2>
        <div className="h-64 ">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="10%" 
                  outerRadius="80%" 
                  data={chartData}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    dataKey="Percent Spent"
                    nameKey="name"
                    fill="#222"
                  />
                  <Legend
                    iconSize={6}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      color: textPrimary,
                      fontSize: '0.65rem',
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: backgroundPrimary }}
                    contentStyle={{ backgroundColor: backgroundPrimary, borderColor: backgroundSecondary }}
                    itemStyle={{
                        color: textPrimary,
                    }}
                    labelStyle={{
                      color: textPrimary,
                  }}
                  />
                </RadialBarChart>
            </ResponsiveContainer>
        </div>
    </div>
  )
}

export default CustomRadialBarChart