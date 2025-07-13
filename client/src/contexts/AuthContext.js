import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [appSettings, setAppSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      // This API call now correctly checks if the app is set up first.
      const settings = await api.getAppSettings();
      setAppSettings(settings);
    } catch (error) {
      console.error("Initialization Error:", error);
      // If this fails, it's a server error, not a login issue.
      // We clear the token to be safe.
      setToken(null);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [token, initialize]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data && data.token) {
      localStorage.setItem('authToken', data.token);
      setToken(data.token); // This will trigger the useEffect to re-run and get settings.
    } else {
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const value = {
    token,
    login,
    logout,
    isAuthenticated: !!token,
    appSettings,
    isLoading,
    reloadSettings: initialize // Function to re-run initialization after setup.
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}