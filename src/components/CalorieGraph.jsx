import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function CalorieGraph({ calorieData }) {
  if (!calorieData) return null;

  const data = [
    { name: 'Daily Target', calories: calorieData.dailyCalories || 0 },
    { name: 'Consumed', calories: calorieData.total || 0 }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Calorie Overview</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Calories', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value} cal`, 'Calories']} />
            <Bar dataKey="calories">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === 'Consumed' && entry.calories > (calorieData.dailyCalories || 0) ? '#ff6b6b' : '#8884d8'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Target: {calorieData.dailyCalories || 0} calories</p>
        <p>Consumed: {calorieData.total || 0} calories</p>
      </div>
    </div>
  );
} 