import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuth from './hooks/useAuth';

// Auth Components
import Login from './pages/auth/LoginPage';
import ProtectedRoute from './components/layout/PrivateRoute';

// Dashboard Pages
import ChefDashboard from './pages/chef/ChefDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import RoomsPage from './pages/manager/RoomsPage';

// Phase 4 Pages
import CleanerDashboard from './pages/cleaner/CleanerDashboard';
import QRScanPage from './pages/cleaner/QRScanPage';
import CleaningHistoryPage from './pages/cleaner/CleaningHistoryPage';
import AssignCleaningPage from './pages/manager/AssignCleaningPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const AppRoutes = () => {
 const { user, isHydrated } = useAuth();

if (!isHydrated) {
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
}
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      
      {/* Protected Routes - Main Dashboard based on role */}
     <Route path="/" element={
  <ProtectedRoute>
    {user?.roles?.includes('ROLE_ADMIN') ? <ManagerDashboard /> :
     user?.roles?.includes('ROLE_MANAGER') ? <ManagerDashboard /> :
     user?.roles?.includes('ROLE_CHEF') ? <ChefDashboard /> :
     user?.roles?.includes('ROLE_WAITER') ? <WaiterDashboard /> :
     user?.roles?.includes('ROLE_CLEANER') ? <CleanerDashboard /> :
     <Navigate to="/login" />}
  </ProtectedRoute>
} />



      {/* Room Management */}
      <Route path="/rooms" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
          <RoomsPage />
        </ProtectedRoute>
      } />
      
      {/* Manager Routes */}
      <Route path="/manager" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
          <ManagerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/manager/cleaning" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
          <AssignCleaningPage />
        </ProtectedRoute>
      } />
      
      {/* Chef Routes */}
      <Route path="/chef" element={
        <ProtectedRoute allowedRoles={['ROLE_CHEF']}>
          <ChefDashboard />
        </ProtectedRoute>
      } />
      
      {/* Waiter Routes */}
      <Route path="/waiter" element={
        <ProtectedRoute allowedRoles={['ROLE_WAITER']}>
          <WaiterDashboard />
        </ProtectedRoute>
      } />
      
      {/* Cleaner Routes */}
      <Route path="/cleaner" element={
        <ProtectedRoute allowedRoles={['ROLE_CLEANER']}>
          <CleanerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/cleaner/scan" element={
        <ProtectedRoute allowedRoles={['ROLE_CLEANER']}>
          <QRScanPage />
        </ProtectedRoute>
      } />
      
      <Route path="/cleaner/history" element={
        <ProtectedRoute allowedRoles={['ROLE_CLEANER']}>
          <CleaningHistoryPage />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;