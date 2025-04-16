import { useState } from 'react';
import React from 'react';
import { CalorieGraph } from './CalorieGraph';

export function ProfileForm({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [calorieData, setCalorieData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    goal: 'weight_loss'
  });

  const calculateBMI = (weight, height) => {
    const heightInMeters = height * 0.3048; // Convert feet to meters
    return weight / (heightInMeters * heightInMeters);
  };

  const calculateCalories = async (profile) => {
    const token = localStorage.getItem('session') ? JSON.parse(localStorage.getItem('session')).token : null;
    try {
      const response = await fetch('http://localhost:5000/calories/calculate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error('Failed to calculate calories');
      const data = await response.json();
      setCalorieData(data);
      return data;
    } catch (error) {
      console.error('Error calculating calories:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const bmi = calculateBMI(Number(formData.weight), Number(formData.height));

    const profile = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      weight: Number(formData.weight),
      height: Number(formData.height),
      goal: formData.goal,
      bmi
    };

    try {
      // First save the profile
      const session = JSON.parse(localStorage.getItem('session'))
      const token = localStorage.getItem('session') ? JSON.parse(localStorage.getItem('session')).token : null;
      
      // Calculate calories first to get the session info
      const calorieData = await calculateCalories(profile);
      
      // Include session info in the profile update
      const profileWithSession = {
        ...profile,
        sessionInfo: calorieData
      };

      const profileResponse = await fetch('http://localhost:5000/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileWithSession),
      });

      if (!profileResponse.ok) throw new Error('Failed to save profile');
      const profileData = await profileResponse.json();
      
      const updatedSession = {
        ...session,
        user: profileData,
      };
      localStorage.setItem('session', JSON.stringify(updatedSession));
      alert('Profile updated!');
      
      // Combine profile and calorie data
      const completeData = {
        ...profileData,
        calorieData
      };

      onComplete(completeData);
    } catch (error) {
      alert('Error saving profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                required
                value={formData.weight}
                onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Height (cms)</label>
              <input
                type="number"
                required
                value={formData.height}
                placeholder='height in cms 1feet = 30.4 cms'
                onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Goal</label>
              <select
                value={formData.goal}
                onChange={e => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Body Building</option>
                <option value="calorie_tracking">Calorie Tracking</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}