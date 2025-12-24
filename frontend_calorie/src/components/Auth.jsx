import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import {Api} from '../utils/API';
import React from 'react';

export function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      const token = credentialResponse.credential; // This is the Google OAuth token

      const response = await fetch(`${Api}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error('Failed to log in');

      const data = await response.json();
      localStorage.setItem('session', JSON.stringify(data));
      onLogin(data);
    } catch (error) {
      alert('Error logging in with Google');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to FoodTrack</h1>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => alert('Google Sign-In failed')}
        />
      </div>
    </div>
  );
}