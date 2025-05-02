import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MacrosGraph({ dailyMacros, targetMacros }) {
  if (!dailyMacros || !targetMacros) return <p>Loading macro chart...</p>;

  const data = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        label: 'Consumed (g)',
        data: [dailyMacros.protein, dailyMacros.carbs, dailyMacros.fats],
        backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      },
      {
        label: 'Target (g)',
        data: [targetMacros.protein, targetMacros.carbs, targetMacros.fats],
        backgroundColor: ['rgba(255, 99, 132, 0.3)', 'rgba(54, 162, 235, 0.3)', 'rgba(255, 206, 86, 0.3)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
        borderDash: [5, 5]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Macronutrient Intake' },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(1)}g`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Grams (g)' }
      }
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Daily Macronutrients</h3>
        <p className="text-gray-600 mt-2">
          Protein: {dailyMacros.protein.toFixed(1)}g | 
          Carbs: {dailyMacros.carbs.toFixed(1)}g | 
          Fats: {dailyMacros.fats.toFixed(1)}g
        </p>
      </div>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
