import Meal from '../models/Meal.js';
import calorieDatabase from '../utils/calorie_Database.json' with { type: 'json' };
import processImageWithYOLO from '../utils/process_image.js';
 

export const deleteMeal = async (req, res) => {
  const mealId = req.params.id;

  try {
    const deleted = await Meal.findByIdAndDelete(mealId);
    if (!deleted) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.status(200).json({ message: 'Meal deleted successfully' });
  } catch (err) {
    console.error('Error deleting meal:', err);
    res.status(500).json({ error: 'Server error while deleting meal' });
  }
};

export const addMeal = async (req, res) => {
    const { mealType, weight } = req.body;
    const yoloResults = await processImageWithYOLO(req.file.path);
    console.log("yolo123", yoloResults);
  
    const uniqueItems = [...new Set(yoloResults.map(item => item.name))];
    const weightPerItem = weight / uniqueItems.length;
  
    const items = uniqueItems.map(name => {
      const itemData = calorieDatabase.find(item => item.name.toLowerCase() === name.toLowerCase());
      const caloriesPer100g = itemData ? itemData.calories : 0;
      const calories = (caloriesPer100g * weightPerItem) / 100;
      
      // Calculate macros based on the weight
      const protein = itemData ? (itemData.Proteins * weightPerItem) / 100 : 0;
      const carbs = itemData ? (itemData.Carbs * weightPerItem) / 100 : 0;
      const fats = itemData ? (itemData.Fats * weightPerItem) / 100 : 0;
      
      return { 
        name, 
        calories: Math.round(calories),
        macros: {
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fats: Math.round(fats * 10) / 10
        }
      };
    });
  
    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
    
    // Calculate total macros for the meal
    const totalMacros = items.reduce((sum, item) => ({
      protein: sum.protein + item.macros.protein,
      carbs: sum.carbs + item.macros.carbs,
      fats: sum.fats + item.macros.fats
    }), { protein: 0, carbs: 0, fats: 0 });
  
    const meal = await Meal.create({
      userId: req.user._id,
      mealType,
      calories: totalCalories,
      items: items.map(i => `${i.name} (${i.calories} cal)`),
      imageUrl: req.file.path,
      macros: totalMacros
    });
  
    res.status(201).send({ meal, predictions: items });
  };

  
export const getDailyMeals = async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const meals = await Meal.find({ userId: req.user._id, createdAt: { $gte: startOfDay } });

  const breakdown = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, other: 0 };
  let totalCalories = 0;
  
  // Initialize daily macros
  const dailyMacros = { protein: 0, carbs: 0, fats: 0 };

  meals.forEach(meal => {
    breakdown[meal.mealType] += meal.calories;
    totalCalories += meal.calories;
    
    // Add macros from each meal to daily totals
    if (meal.macros) {
      dailyMacros.protein += meal.macros.protein || 0;
      dailyMacros.carbs += meal.macros.carbs || 0;
      dailyMacros.fats += meal.macros.fats || 0;
    }
  });

  res.send({ 
    date: startOfDay.toISOString().split('T')[0], 
    total: totalCalories, 
    breakdown,
    macros: dailyMacros
  });
};

export const getMonthlyMeals = async (req, res) => {
  // Get the current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  
  // Calculate the start of the current month
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  // Calculate the end of the current month
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  // Get the number of days in the current month
  const daysInMonth = endOfMonth.getDate();

  // Get all meals for the current month
  const meals = await Meal.find({ 
    userId: req.user._id, 
    createdAt: { 
      $gte: startOfMonth,
      $lte: endOfMonth
    } 
  });

  // Initialize an object to store daily totals
  const dailyTotals = {};

  // Process each meal
  meals.forEach(meal => {
    const date = new Date(meal.createdAt);
    const day = date.getDate();
    const dayKey = day.toString();
    
    if (!dailyTotals[dayKey]) {
      dailyTotals[dayKey] = {
        day: day,
        total: 0,
        breakdown: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, other: 0 },
        macros: { protein: 0, carbs: 0, fats: 0 }
      };
    }
    
    dailyTotals[dayKey].total += meal.calories;
    dailyTotals[dayKey].breakdown[meal.mealType] += meal.calories;
    
    // Add macros from each meal to daily totals
    if (meal.macros) {
      dailyTotals[dayKey].macros.protein += meal.macros.protein || 0;
      dailyTotals[dayKey].macros.carbs += meal.macros.carbs || 0;
      dailyTotals[dayKey].macros.fats += meal.macros.fats || 0;
    }
  });

  // Create an array with all days of the month (1 to daysInMonth)
  const result = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = day.toString();
    
    // Skip future days for the current month
    if (day > currentDay) {
      continue;
    }
    
    if (dailyTotals[dayKey]) {
      // Day has data
      result.push({
        day: day,
        total: dailyTotals[dayKey].total,
        breakdown: dailyTotals[dayKey].breakdown,
        macros: dailyTotals[dayKey].macros
      });
    } else {
      // Day has no data
      result.push({
        day: day,
        total: 0,
        breakdown: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, other: 0 },
        macros: { protein: 0, carbs: 0, fats: 0 }
      });
    }
  }

  // Add month and year information
  const monthName = startOfMonth.toLocaleString('default', { month: 'long' });
  
  res.send({
    month: monthName,
    year: currentYear,
    days: result
  });
};
