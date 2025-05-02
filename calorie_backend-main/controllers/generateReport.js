import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateHealthReport = async (req, res) => {
  try {
    const { name, age, gender, weight, height, bmi, goal, macros , monthlyData } = req.body;
    const prompt = `Generate a detailed personalized health report for the following user with the defined goal:
- Name: ${name}
- Age: ${age}
- Gender: ${gender}
- Weight: ${weight} kg
- Height: ${height} cm
- BMI: ${bmi}
- Goal: ${goal}Daily Intake for a atmost 31 days:
${JSON.stringify(monthlyData, null, 2)}
Please provide a JSON response with the following structure:
{
  "dailyCaloriesTarget": number,//these can be generated based on the monthly data for the next month
  "macronutrientTarget": {//these can be generated based on the monthly data for the next month
    "protein": number,
    "carbs": number,
    "fats": number
  },
  "overallAssessment": string,
  "observations": string,
  "recommendations": string,
  "weeklyAdvice": string,
  "lifestyleTips": string,
  "motivationalNote": string
} generate the  macronutrinettarget and dailycaloriestarget  for next month
 `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Remove ```json blocks if any
    const cleanedText = text.replace(/```json|```/g, '').trim();

    const report = JSON.parse(cleanedText); // this should now work
    res.send(report);
  } catch (error) {
    console.error('Error generating report:', error.message);
    res.status(500).json({ error: 'Failed to generate health report' });
  }
};
