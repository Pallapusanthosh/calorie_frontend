import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { ProfileForm } from './components/ProfileForm';
import { Dashboard } from './components/Dashboard';
import { Api } from './utils/API';
import React from 'react';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileIncompleteOnAuth, setProfileIncompleteOnAuth] = useState(false); // New state

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
      const session = JSON.parse(localStorage.getItem('session'));
      const response = await fetch(`${Api}/profile/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setProfile(null);
        setLoading(false);
        return;
      };

      const data = await response.json();
      setProfile(data);
      setLoading(false);

    } catch (error) {
      console.warn('Profile not found or error occurred:', error);
      setProfile(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedSession = JSON.parse(localStorage.getItem('session'));

    const handleSession = async () => {
      if (isValidSession(storedSession)) {
        setSession(storedSession);
        // Check if profile was incomplete during the initial auth
        if (storedSession.profileIncomplete) {
          setProfileIncompleteOnAuth(true);
          setLoading(false); // No need to fetch profile yet
        } else {
          await fetchProfile(storedSession.user._id);
        }
      } else {
        setLoading(false);
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
    return (
      <Auth
        onLogin={async (newSession) => {
          setSession(newSession);
          localStorage.setItem('session', JSON.stringify(newSession));
          // Set the profileIncomplete flag from the auth response
          setProfileIncompleteOnAuth(newSession.profileIncomplete);
          if (!newSession.profileIncomplete) {
            await fetchProfile(newSession.user._id);
          }
        }}
      />
    );
  }

  // Show ProfileForm if it was incomplete on authentication OR if fetchProfile failed
  if (profileIncompleteOnAuth || !profile) {
    return (
      <ProfileForm
        onComplete={(createdProfile) => {
          setProfile(createdProfile);
          setProfileIncompleteOnAuth(false); // Reset the flag
        }}
      />
    );
  }

  return <Dashboard profile={profile} />;
}

export default App;