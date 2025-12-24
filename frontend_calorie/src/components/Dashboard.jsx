import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CloudCog, Download, Upload } from 'lucide-react';
import React from 'react';
import MacrosGraph from './MacrosGraph';
import { CalorieGraph } from './CalorieGraph';
import { CalorieProgressChart } from './CalorieProgressChart';
import html2pdf from 'html2pdf.js';
import { motion } from "framer-motion"
import { useRef } from 'react';
import useDailyAdvice from './useDailyAdivce';
import DailyAdviceCard from './dailyAdviceCard';

import { Api } from '../utils/API';

import ChatWidget from './chatWidget'


export function Dashboard({ profile }) {
  const [reportData, setReportData] = useState(null);
  const [dailyCalories, setDailyCalories] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [weight, setWeight] = useState(100); 
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const session = JSON.parse(localStorage.getItem('session'));
  const [uploadedMealId, setUploadedMealId] = useState(null);
  const [mealAIAdvice, setMealAIAdvice] = useState("");
  const [mealAIloading, setMealAIloading] = useState(false);

  const [deleteimage,setdeleteimage]  = useState(false);
  const reportRef = useRef();
  const [dailyMacros, setDailyMacros] = useState({
    date: new Date().toISOString().split('T')[0],
    protein: 0,
    carbs: 0,
    fats: 0
  });
 const sessionInfo=session.user.sessionInfo;
  const [targetMacros, setTargetMacros] = useState({
    protein: 0,
    carbs: 0,
    fats: 0
  });
  
  // Get current date information
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  const [showModal, setShowModal] = useState(false);
const [updatedProfile, setUpdatedProfile] = useState(profile);


  const { advice, loading: adviceLoading } = useDailyAdvice();


  const goal = session.user.goal;
  const motivationalQuotes = {
    'calorie_tracking': [
      "Every meal you track is a step toward your health goals.",
      "Consistency in tracking leads to success in achieving your goals.",
      "Your future self will thank you for tracking today."
    ],
    'weight_loss': [
      "Small changes today lead to big results tomorrow.",
      "Your body can stand almost anything. It's your mind you have to convince.",
      "The only bad workout is the one that didn't happen."
    ],
    'weight_gain': [
      "Building strength takes time, patience, and consistent effort.",
      "Every gram of protein brings you closer to your muscle goals.",
      "Your body is capable of amazing transformations with the right nutrition."
    ]
  };
  
  const [showAllDays, setShowAllDays] = useState(false);

  useEffect(() => {
    fetchCalorieData();
    // console.log(monthlyData);
  }, [deleteimage]);

  const fetchCalorieData = async () => {
    try {
      let session = JSON.parse(localStorage.getItem('session'));
      setTargetMacros(session.user.sessionInfo.macros);
     
      if (!session) {
        console.error('No authentication token found');
        return;
      }

      const dailyResponse = await fetch(`${Api}/meals/daily`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        credentials: 'include',
      });
    

      if (!dailyResponse.ok) {
        let errorMessage = 'Failed to fetch daily calories';
        try {
          const errorData = await dailyResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await dailyResponse.text();
          errorMessage = `Server error: ${dailyResponse.status} ${dailyResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let dailyData;
      try {
        dailyData = await dailyResponse.json();
        setDailyMacros(dailyData.macros);
        // console.log(dailyData.macros);
      } catch (e) {
        console.error('Failed to parse daily response as JSON:', e);
        dailyData = {
          date: new Date().toISOString().split('T')[0],
          total: 0,
          breakdown: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, other: 0 },
        };
      }

      setDailyCalories(dailyData || {
        date: new Date().toISOString().split('T')[0],
        total: 0,
        breakdown: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, other: 0 },
      });

      const monthlyResponse = await fetch(`${Api}/meals/monthly`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        credentials: 'include',
      });

      if (!monthlyResponse.ok) {
        let errorMessage = 'Failed to fetch monthly data';
        try {
          const errorData = await monthlyResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await monthlyResponse.text();
          errorMessage = `Server error: ${monthlyResponse.status} ${monthlyResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let monthlyData;
      try {
        monthlyData = await monthlyResponse.json();
      } catch (e) {
        console.error('Failed to parse monthly response as JSON:', e);
        monthlyData = [];
      }

      setMonthlyData(monthlyData || []);
    } catch (error) {
      console.error('Error fetching calorie data:', error);
    }
  };
      const fetchMealRecommendation = async (description) => {
      try {
        setMealAIloading(true);
        const res = await fetch(`${Api}/agent/recommendation`,{
          headers: {  
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          method: 'POST',
          body: JSON.stringify(
            {
              mealDescription: description
            }
          )
        });
        const data = await res.json();
        setMealAIAdvice(data.answer);
      } catch {
        setMealAIAdvice("");
      } finally {
        setMealAIloading(false);
      }
    };



  const generateHealthReport = async () => {
    setLoading(true);
    const session = localStorage.getItem('session') 
      ? JSON.parse(localStorage.getItem('session')) 
      : null;
  
      const profile = {
      monthlyData: monthlyData,
    };
  
    if (!session || !monthlyData) {
      console.error("Missing session or monthlyData");
      return;
    }
  
    const token = session.token;
    const user = session.user;
  
    // Construct report profile
    const reportProfile = {
      name: user.name,
      age: user.age,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      goal: user.goal,
      bmi: user.bmi,
      macros: user.sessionInfo.macros,
      dailyCalories: user.sessionInfo.dailyCalories,
      monthlyData: monthlyData
    };
  
    try{
      console.log(reportProfile)
      const response = await fetch(`${Api}/calories/report`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportProfile),
      });
  
      if (!response.ok) throw new Error('Failed to generate health report');
      
      const data = await response.json();
      console.log("Health Report Generated:", data);
      // optionally:
      setReportData(data);
    } catch (error) {
      console.error('Error generating health report:', error);
    }
    finally{
      setLoading(false);
    }
  };

  

  const downloadPDF = () => {
    setLoading(true);
    const element = reportRef.current;
    const opt = {
      margin:       0.5,
      filename:     'Health_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    setLoading(false);
  };
  

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setPredictions(null);
  };

  const handleDelete = async () => {
    if (!uploadedMealId) {
      alert('No uploaded meal to delete.');
      return;
    }
  
    try {
      const session = JSON.parse(localStorage.getItem('session'));
      if (!session) {
        console.error('No authentication token found');
        return;
      }
  
      const response = await fetch(`${Api}/meals/meals/${uploadedMealId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.token}`,
        },
        credentials: 'include',
      });
  
      if (!response.ok) {
        let errorMessage = 'Failed to delete meal';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
  
      alert('Meal deleted successfully');
      setdeleteimage(true);
      setUploadedMealId(null);
      setPredictions([]);
      setSelectedFile(null);
      setPreviewUrl(null);
      setWeight(100);
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert(`Error deleting meal: ${error.message}`);
    }
  };
  
  const handleupdateprofile = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session'));
      if (!session) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${Api}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify(updatedProfile)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const data = await response.json();
      const updatedSession = {
        ...session,
        user: updatedProfile
      };
      localStorage.setItem('session',JSON.stringify(updatedSession));
      alert('Profile updated!');
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem('session'));
      if (!session) {
        console.error('No authentication token found');
        return;
      }
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('mealType', mealType);
      formData.append('weight', weight); // <-- New: adding weight
      console.log(mealType);
      const response = await fetch(`${Api}/meals/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload meal';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
        console.log(data);
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      setPredictions(data.predictions);
      // console.log("data",data);
      await fetchMealRecommendation(data.predictions);
      await fetchCalorieData();
      setUploadedMealId(data.meal._id);
      setSelectedFile(null);
      setPreviewUrl(null);
      setWeight(100); // <-- reset to 100g
    } catch (error) {
      console.error('Error uploading meal:', error);
      alert(`Error uploading meal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const breakdownData = dailyCalories?.breakdown 
  ? Object.entries(dailyCalories.breakdown).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }))
  : [];

  // Function to check if a day is the current day
  const isCurrentDay = (day) => {
    return day === currentDay;
  };

  // Function to check if a day is in the current month
  const isCurrentMonth = (month, year) => {
    return month === currentMonth && year === currentYear;
  };

  // Function to get visible days based on showAllDays state
  const getVisibleDays = (days) => {
    if (!days || days.length === 0) return [];
    
    // Filter out future days
    const filteredDays = days.filter(day => {
      // Always filter out future days, regardless of month
      return day.day <= currentDay;
    });
    
    // If showAllDays is true, return all filtered days
    if (showAllDays) {
      return filteredDays;
    }
    
    // Otherwise, return only the last 5 days
    return filteredDays.slice(-5);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={updatedProfile.name}
            onChange={(e) => setUpdatedProfile({ ...updatedProfile, name: e.target.value })}
            placeholder={profile.name}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={updatedProfile.age}
            onChange={(e) => setUpdatedProfile({ ...updatedProfile, age: e.target.value })}
            placeholder={profile.age}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={updatedProfile.gender}
            onChange={(e) => setUpdatedProfile({ ...updatedProfile, gender: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={updatedProfile.weight}
            onChange={(e) => setUpdatedProfile({ ...updatedProfile, weight: e.target.value })}
            placeholder={profile.weight}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
          <input
            type="number"
            value={updatedProfile.height}
            onChange={(e) => setUpdatedProfile({ ...updatedProfile, height: e.target.value })}
            placeholder={profile.height}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
          <select
            value={updatedProfile.goal}
            onChange={(e) => setUpdatedProfile({ ...updatedProfile, goal: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Goal</option>
            <option value="calorie_tracking">Calorie Tracking</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="weight_gain">Weight Gain</option>
          </select>
        </div>

        {/* Modal buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleupdateprofile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  </div>
)}

<header className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold">Welcome, {profile.name}</h1>
    </div>
    {profile.bmi !== undefined && (
      <div className="bg-blue-100 px-3 py-1 rounded-full text-sm sm:text-base">
        <span className="text-blue-800">BMI: {profile.bmi?.toFixed(1)}</span>
      </div>
    )}
  </div>

  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-right w-full sm:w-auto">
    <div className="text-center sm:text-right">
      <p className="text-sm text-gray-600">Daily Calories</p>
      <p className="text-xl sm:text-2xl font-bold">{dailyCalories?.total || 0} kcal</p>
    </div>
    <div className="flex flex-row sm:flex-col gap-2">
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
      >
        Update Profile
      </button>
      <button
        onClick={() => {
          localStorage.removeItem("session");
          window.location.href = '/';
        }}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
      >
        Log Out
      </button>
    </div>
  </div>
</header>
  <DailyAdviceCard advice={advice} loading={adviceLoading} />


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Add Meal</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    disabled={!selectedFile}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (in grams)</label>
                  <input
                    type="number"
                    placeholder="in grams (100g default)"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="1"
                    max="2000"
                    disabled={!selectedFile}
/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-48 object-contain rounded-lg"
                  />
                </div>
              )}

              {predictions && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Detected Items:</h3>
                  <ul className="space-y-2">
                  {predictions.map((pred, index) => (
    <li key={index} className="flex justify-between">
      <span>{pred.name}</span>
      <span className="text-gray-600">{pred.calories} kcal</span>
    </li>
  ))}
                  </ul>
                </div>
              )}
              {mealAIloading && (
  <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-500 italic">
    AI is analyzing your meal…
  </div>
)}

              {mealAIAdvice && !mealAIloading && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-sm font-semibold text-green-700 mb-1">
                    🤖 AI Meal Suggestion
                  </h3>
                  <p className="text-sm text-gray-700">
                    {mealAIAdvice}
                  </p>
                </div>
              )}

               
              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Upload size={20} />
                {loading ? 'Processing...' : 'Upload and Analyze'}
              </button>
              <button 
              disabled={loading ||!uploadedMealId}
              onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
    Delete This Upload
  </button>
            
 

            </div>
          </div>
         
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Daily Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={breakdownData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>

            </ResponsiveContainer>
          </div>
        </div>





        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MacrosGraph dailyMacros={dailyMacros} targetMacros={targetMacros} />
          <CalorieProgressChart 
            dailyCalories={dailyCalories} 
            targetCalories={session?.user?.sessionInfo?.dailyCalories || 0} 
          />
        </div>





        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Daily Motivation</h2>
        <div className="space-y-4">
          {(motivationalQuotes[goal] || []).map((quote, index) => (
            <div key={index} className="bg-blue-50 p-4 rounded-lg text-gray-700 italic border-l-4 border-blue-500">
              "{quote}"
            </div>
          ))}
        </div>
        </div>
     



 
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Progress - {monthlyData?.month} {monthlyData?.year}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData?.days || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day"
                tick={{ fontSize: 12 }}
                label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft', offset: 15 }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'total') return [`${value} kcal`, 'Total Calories'];
                  return [value, name];
                }}
                labelFormatter={(day) => `${monthlyData?.month} ${day}, ${monthlyData?.year}`}
              />
              <Bar dataKey="total" fill="#8884d8" name="Total Calories">
                {(monthlyData?.days || []).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.total > (session?.user?.sessionInfo?.dailyCalories || 0) ? '#ff6b6b' : '#4CAF50'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p>Green bars indicate days within calorie target</p>
            <p>Red bars indicate days exceeding calorie target</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Daily Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calories</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breakfast</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lunch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dinner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Snacks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protein (g)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs (g)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fats (g)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getVisibleDays(monthlyData?.days || []).map((day, index) => (
                    <tr 
                      key={index} 
                      className={`${isCurrentDay(day.day) ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isCurrentDay(day.day) ? 'text-blue-800' : 'text-gray-900'
                      }`}>
                        {day.day}
                        {isCurrentDay(day.day) && <span className="ml-1 text-xs text-blue-600">(Today)</span>}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        day.total > (session?.user?.sessionInfo?.dailyCalories || 0) 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {day.total} kcal
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.breakdown.breakfast}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.breakdown.lunch}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.breakdown.dinner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.breakdown.snacks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Number(day.macros?.protein || 0).toFixed(3)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Number(day.macros?.carbs || 0).toFixed(3)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Number(day.macros?.fats || 0).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* View More/Less Button */}
              {monthlyData?.days && monthlyData.days.filter(day => {
                if (isCurrentMonth(monthlyData?.month, monthlyData?.year)) {
                  return day.day <= currentDay;
                }
                return true;
              }).length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllDays(!showAllDays)}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    {showAllDays ? 'Show Less' : 'View More'}
                  </button>
                </div>
              )}
            </div>
          </div>




        </div>


        <div className="p-6">
          <h1 className="text-xl font-bold mb-4">Generate Health Report</h1>

          <button
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={generateHealthReport}
          >
             {loading  ? 'Generating Report' : '📥 Generate Report'}
          </button>

    
        </div>

          {reportData && (<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <div ref={reportRef} className="space-y-6 text-gray-800">
        <h1 className="text-3xl font-bold text-center">Health Report</h1>

        <section>
          <h2 className="text-xl font-semibold mb-1">👤 Profile Summary</h2>
          <p><strong>Name:</strong> {session.user.name}</p>
          <p><strong>Age:</strong> {session.user.age}</p>
          <p><strong>BMI:</strong> {session.user.bmi}</p>
          <p><strong>Goal:</strong> {session.user.goal}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-1">🔥 Daily Calorie Target</h2>
          <p>{reportData.dailyCaloriesTarget} kcal</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-1">🥗 Macronutrient Targets</h2>
          <ul className="list-disc pl-6">
            
            <li><strong>Protein:</strong> {reportData.macronutrientTarget.protein}g</li>
            <li><strong>Carbs:</strong> {reportData.macronutrientTarget.carbs}g</li>
            <li><strong>Fats:</strong> {reportData.macronutrientTarget.fats}g</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-1">🩺 Overall Assessment</h2>
          <p>{reportData.overallAssessment
          }</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-1">🔍 Observations</h2>
          <p>{reportData.observations
          }</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-1">✅ Recommendations</h2>
          <div className="whitespace-pre-wrap">{reportData.
recommendations}</div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-1">📅 Weekly Advice</h2>
          <p>{reportData.
weeklyAdvice
}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-1">💡 Lifestyle Tips</h2>
          <div className="whitespace-pre-wrap">{reportData.lifestyleTips
          }</div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-1">💬 Motivation</h2>
          <p>{reportData.motivationalNote
          }</p>
        </section>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={downloadPDF}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading  ? 'Downloading' : '📥 Download as PDF'}
        </button>
      </div>
    </div>)}
        




      </div>
      <ChatWidget />
    </div>
  );
}
