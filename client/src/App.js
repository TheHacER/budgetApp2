import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import SettingsPage from './pages/SettingsPage';
import InitialSetupPage from './pages/InitialSetupPage';
import Navbar from './components/layout/Navbar';

const AppLayout = () => ( <div><Navbar /><main><Outlet /></main></div> );

function App() {
  const { isAuthenticated, appSettings, isLoading } = useAuth();
  if (isLoading) { return <div className="flex items-center justify-center h-screen">Loading...</div>; }
  if (isAuthenticated) {
    if (appSettings && !appSettings.setup_complete) {
      return ( <Routes><Route path="/setup" element={<InitialSetupPage />} /><Route path="*" element={<Navigate to="/setup" replace />} /></Routes> );
    }
    return (
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="/setup" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }
  return ( <Routes><Route path="/login" element={<LoginPage />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes> );
}
export default App;
