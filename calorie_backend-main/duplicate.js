import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Meal from './models/Meal.js';

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const userIds = [
  '67fd81f5951cc9a31da515cb',
  '67fd9a69951cc9a31da518ee',
  '67fe3a31f74db73f9f88f404',
  '67fe4299c8019d9aac97cafe'
];

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks', 'other'];

const getMealDistribution = (totalCalories) => {
  // Divide totalCalories among meal types with some randomness
  const percentages = [0.25, 0.3, 0.25, 0.1, 0.1]; // Adjustable proportions
  return percentages.map(p =>
    Math.floor(p * totalCalories * (0.85 + Math.random() * 0.3)) // ±15% randomness
  );
};

const generateMacros = (calories) => {
  const protein = Math.floor((calories * 0.3) / 4);
  const carbs = Math.floor((calories * 0.5) / 4);
  const fats = Math.floor((calories * 0.2) / 9);
  return { protein, carbs, fats };
};

const startDate = new Date('2025-04-01');
const endDate = new Date('2025-04-14');

const mealsToInsert = [];

for (const userId of userIds) {
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    let totalCalories;

    if (userId === '67fd81f5951cc9a31da515cb') {
      const goHigh = Math.random() < 0.5; // 50% chance high or low
      totalCalories = goHigh
        ? Math.floor(Math.random() * 500 + 1450) // 1450–1950
        : Math.floor(Math.random() * 400 + 1000); // 1000–1400
    } else {
      totalCalories = Math.floor(Math.random() * 800 + 1200); // 1200–2000
    }

    const mealCalories = getMealDistribution(totalCalories);

    mealTypes.forEach((mealType, i) => {
      const calories = mealCalories[i];
      const macros = generateMacros(calories);

      mealsToInsert.push({
        userId,
        mealType,
        calories,
        items: ['Food A', 'Food B', 'Food C'],
        imageUrl: 'https://example.com/meal.jpg',
        macros,
        createdAt: new Date(date)
      });
    });
  }
}

await Meal.insertMany(mealsToInsert);
console.log('✅ Meals inserted with varying daily calories.');
await mongoose.disconnect();
