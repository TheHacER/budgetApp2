import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [appSettings, setAppSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  const navigate = useNavigate();

  const initializeApp = useCallback(async () => {
    setIsLoading(true);
    setInitError(null);
    try {
      const settings = await api.getAppSettings();
      setAppSettings(settings);
    } catch (error) {
      console.error("Initialization Error:", error);
      setInitError(error.message || 'Failed to connect to the server. Please ensure it is running and try again.');
      setAppSettings(null);
      setToken(null);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data && data.token) {
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      await initializeApp(); // Re-fetch settings after a successful login
    } else {
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    setAppSettings(null);
    navigate('/login');
  };

  const value = {
    token,
    login,
    logout,
    isAuthenticated: !!token,
    appSettings,
    isLoading,
    initError,
    initializeApp
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