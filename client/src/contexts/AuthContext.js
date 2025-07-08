import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [appSettings, setAppSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      if (token) {
        try {
          const settings = await api.getAppSettings();
          setAppSettings(settings);
        } catch (error) {
          console.error("Initialization Error:", error);
          setToken(null);
          setAppSettings(null);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };
    initialize();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data && data.token) {
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
    } else {
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    setToken(null);
    setAppSettings(null);
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const reloadSettings = async () => {
    setIsLoading(true);
    if (token) {
      try {
        const settings = await api.getAppSettings();
        setAppSettings(settings);
      } catch (error) {
        console.error("Failed to reload settings", error);
      }
    }
    setIsLoading(false);
  };

  const value = {
    token,
    login,
    logout,
    isAuthenticated: !!token,
    appSettings,
    isLoading,
    reloadSettings,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
