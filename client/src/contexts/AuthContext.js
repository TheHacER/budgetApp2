import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as api from '../services/api'; // Corrected path

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [appSettings, setAppSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [initError, setInitError] = useState('');
    
    const initializeApp = useCallback(async () => {
        setIsLoading(true);
        setInitError('');
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const settings = await api.getAppSettings();
                setAppSettings(settings);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Initialization error:", error);
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
                setInitError("Could not connect to the server. Please ensure the backend is running and refresh.");
            }
        } else {
            // Check for initial setup status even if not logged in
             try {
                const settings = await api.getAppSettings();
                setAppSettings(settings);
            } catch (error) {
                 setInitError("Could not connect to the server for initial check. Is the backend running?");
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    const login = async (email, password) => {
        try {
            const data = await api.login(email, password);
            localStorage.setItem('authToken', data.token);
            await initializeApp(); // Re-initialize to fetch settings
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setAppSettings(null);
    };

    const value = {
        isAuthenticated,
        appSettings,
        isLoading,
        initError,
        login,
        logout,
        initializeApp,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};