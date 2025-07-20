import React from 'react';
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
import { Box, CircularProgress, Button } from '@mui/material';

const AppLayout = () => (
  <div>
    <Navbar />
    <main>
      <Outlet />
    </main>
  </div>
);

const LoadingScreen = ({ message }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
    <p style={{ marginLeft: '1rem' }}>{message}</p>
  </Box>
);

const ErrorScreen = ({ error, onRetry }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
    <h2 style={{ color: 'red' }}>Application Error</h2>
    <p>{error}</p>
    <Button onClick={onRetry} variant="contained">Retry Connection</Button>
  </Box>
);

function App() {
  const { isAuthenticated, appSettings, isLoading, initError, initializeApp } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (initError) {
    return <ErrorScreen error={initError} onRetry={initializeApp} />;
  }

  if (appSettings && !appSettings.setup_complete) {
    return (
      <Routes>
        <Route path="/setup" element={<InitialSetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

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