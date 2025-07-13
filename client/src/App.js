import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import SavingsPage from './pages/SavingsPage';
import SettingsPage from './pages/SettingsPage';
import InitialSetupPage from './pages/InitialSetupPage';
import Navbar from './components/layout/Navbar';
import { Button } from './components/ui/button';

const AppLayout = () => ( <div><Navbar /><main><Outlet /></main></div> );

const LoadingScreen = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-background">
    <p className="text-muted-foreground">{message}</p>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
      <h2 className="text-xl font-semibold text-destructive">Application Error</h2>
      <p className="text-muted-foreground max-w-md text-center">{error}</p>
      <Button onClick={onRetry}>Retry Connection</Button>
  </div>
);

function App() {
  const { isAuthenticated, appSettings, isLoading, initError, initializeApp } = useAuth();

  // --- DIAGNOSTIC STEP ---
  // This will print the settings object to the browser console when it changes.
  useEffect(() => {
    console.log("Auth context has updated. Received settings:", appSettings);
  }, [appSettings]);

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (initError) {
    return <ErrorScreen error={initError} onRetry={initializeApp} />;
  }

  // If setup is NOT complete, always force the user to the setup page.
  if (appSettings && !appSettings.setup_complete) {
    return (
      <Routes>
        <Route path="/setup" element={<InitialSetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // If setup IS complete, use the normal authentication flow.
  return (
    <Routes>
      {isAuthenticated ? (
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;