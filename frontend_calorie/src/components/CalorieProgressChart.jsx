import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function CalorieProgressChart({ dailyCalories, targetCalories }) {
  if (!dailyCalories || !targetCalories) return null;

  const consumed = dailyCalories.total || 0;
  const remaining = Math.max(0, targetCalories - consumed);
  
  const data = [
    { name: 'Consumed', value: consumed },
    { name: 'Remaining', value: remaining }
  ];

  const COLORS = ['#4CAF50', '#E0E0E0'];
  const percentage = Math.min(100, (consumed / targetCalories) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Daily Calorie Progress</h2>
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} kcal`, 'Calories']}
                labelFormatter={(name) => name}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
            <div className="text-sm text-gray-600">of target</div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">{consumed} / {targetCalories} kcal</p>
        <p className="text-sm text-gray-600">Consumed / Target</p>
      </div>
    </div>
  );
} 