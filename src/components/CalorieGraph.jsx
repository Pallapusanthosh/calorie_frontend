import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function CalorieGraph({ calorieData }) {
  if (!calorieData) return null;

  const data = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        label: 'Macronutrient Distribution (g)',
        data: [
          calorieData.macros.protein,
          calorieData.macros.carbs,
          calorieData.macros.fats
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Macronutrient Distribution'
      }
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Daily Calorie Target: {calorieData.dailyCalories} kcal</h3>
        <p className="text-gray-600 mt-2">{calorieData.explanation}</p>
        <p className="text-gray-600 mt-2">{calorieData.weeklyAdjustment}</p>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
} 