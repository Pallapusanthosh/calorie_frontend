import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { ProfileForm } from './components/ProfileForm';
import { Dashboard } from './components/Dashboard';
import React from 'react';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isValidSession = (session) => {
    return (
      session &&
      session.token &&
      session.user &&
      session.user._id
    );
  };

  const fetchProfile = async (userId) => {
    try {
      const session = JSON.parse(localStorage.getItem('session')); // Parse the session JSON string
      console.log('locltoken', session); // Log the parsed session object
  
      const response = await fetch(`http://localhost:5000/profile/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`, // Access the token from the parsed session
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setLoading(false); // Stop loading if the request fails
        throw new Error('Failed to fetch profile');
      }
  
      const data = await response.json();
      console.log('Profile data:', data);
      setProfile(data); // Update the profile state
      setLoading(false); // Stop loading after successfully fetching the profile
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false); // Stop loading even if there is an error
    }
  };
  useEffect(() => {
    const storedSession = JSON.parse(localStorage.getItem('session'));
  
    const handleSession = async () => {
      if (isValidSession(storedSession)) {
        setSession(storedSession);
        await fetchProfile(storedSession.user._id);
      } else {
        setLoading(false); // Stop loading if the session is invalid
      }
    };
  
    handleSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth onLogin={setSession} />;
  }

  if (!profile) {
    return <ProfileForm onComplete={setProfile} />;
  }

  return <Dashboard profile={profile} />;
}

export default App;
