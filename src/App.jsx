import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import GBSECDashboard from './components/GBSECDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gbsec_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) setUser(parsed);
      }
    } catch (_) {}
    setLoaded(true);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('gbsec_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gbsec_session');
  };

  if (!loaded) return null;

  // 1. Login
  if (!user) return <LoginPage onLoginSuccess={handleLogin} />;
  
  // 2. Dashboard
  return <GBSECDashboard user={user} onLogout={handleLogout} />;
}
