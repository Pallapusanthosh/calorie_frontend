import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const calculateCalorieTarget = async (req, res) => {
  try {
    const { name, age, gender, weight, height, goal, bmi } = req.body;

    const prompt = `Calculate a daily calorie target for a person with the following profile:
    - Name: ${name}
    - Age: ${age}
    - Gender: ${gender}
    - Weight: ${weight} kg
    - Height: ${height} feet
    - BMI: ${bmi}
    - Goal: ${goal}

    Please provide:
    1. A daily calorie target
    2. A brief explanation of the calculation
    3. Recommended macronutrient distribution (protein, carbs, fats)
    4. Weekly calorie adjustment recommendations based on the goal
    
    Format the response as a JSON object with the following structure:
    {
      "dailyCalories": number,
      "explanation": string,
      "macros": {
        "protein": number,
        "carbs": number,
        "fats": number
      },
      "weeklyAdjustment": string
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("text",text);
    // Parse the JSON response
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const calorieData = JSON.parse(cleanedText);
    console.log('data',calorieData);
    res.json(calorieData);
  } catch (error) {
    console.error('Error calculating calorie target:', error);
    res.status(500).json({ error: 'Failed to calculate calorie target' });
  }
}; 