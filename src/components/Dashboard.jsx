import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Upload } from 'lucide-react';
import React from 'react';

export function Dashboard({ profile }) {
  const [dailyCalories, setDailyCalories] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [weight, setWeight] = useState(100); // <-- New: default 100g
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const session = JSON.parse(localStorage.getItem('session'));

  const [showModal, setShowModal] = useState(false);
const [updatedProfile, setUpdatedProfile] = useState(profile);

  const goal = session.user.goal;
  const testimonials = {
    'calorie_tracking': [
      "Tracking my calories helped me stay consistent every day.",
      "Seeing my numbers made me so much more mindful about what I eat."
    ],
    'weight_loss': [
      "I've lost 5kg in two months by just sticking to my calorie goals!",
      "This app made my weight loss journey feel achievable."
    ],
    'weight_gain': [
      "I finally started gaining healthy weight without stressing out.",
      "Reaching my calorie surplus has never been easier!"
    ]
  };
  

  useEffect(() => {
    fetchCalorieData();
  }, []);

  const fetchCalorieData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session'));
      if (!session) {
        console.error('No authentication token found');
        return;
      }

      const dailyResponse = await fetch(`http://localhost:5000/meals/daily`, {
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

      const monthlyResponse = await fetch(`http://localhost:5000/meals/monthly`, {
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


  const handleupdateprofile = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('session'));
      if (!session) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:5000/profile`, {
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
      const response = await fetch(`http://localhost:5000/meals`, {
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
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      setPredictions(data.predictions);
      await fetchCalorieData();
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


<header className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
  <div className="flex items-center gap-4">
    <h1 className="text-2xl font-bold">Welcome, {profile.name}</h1>
    <div className="bg-blue-100 px-3 py-1 rounded-full">
      <span className="text-blue-800">BMI: {profile.bmi.toFixed(1)}</span>
    </div>
  </div>

  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-right">
    <div>
      <p className="text-sm text-gray-600">Daily Calories</p>
      <p className="text-2xl font-bold">{dailyCalories?.total || 0} kcal</p>
    </div>
    <button
      onClick={() => setShowModal(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
    >
      Update Profile
    </button>
  </div>
</header>


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

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Upload size={20} />
                {loading ? 'Processing...' : 'Upload and Analyze'}
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">What People Say</h2>
        <div className="space-y-4">
          {(testimonials[goal] || []).map((quote, index) => (
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
                    fill={entry.total > (profile.calorieData?.dailyCalories || 0) ? '#ff6b6b' : '#4CAF50'}
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(monthlyData?.days || []).map((day, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day.day}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${day.total > (profile.calorieData?.dailyCalories || 0) ? 'text-red-600' : 'text-green-600'}`}>
                        {day.total} kcal
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.breakdown.breakfast}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.breakdown.lunch}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.breakdown.dinner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.breakdown.snacks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
