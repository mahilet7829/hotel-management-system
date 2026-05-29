import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Components
import PrivateRoute from './components/layout/PrivateRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import ChefDashboard from './pages/chef/ChefDashboard';
import CleanerDashboard from './pages/cleaner/CleanerDashboard';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  // Function to determine redirect path based on user role
  const getRedirectPath = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user || !user.roles || user.roles.length === 0) {
      return '/login';
    }

    // Roles are strings like ["ROLE_MANAGER"] not objects
    const roles = user.roles;

    if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER')) {
      return '/manager';
    } else if (roles.includes('ROLE_WAITER')) {
      return '/waiter';
    } else if (roles.includes('ROLE_CHEF')) {
      return '/chef';
    } else if (roles.includes('ROLE_CLEANER')) {
      return '/cleaner';
    }

    return '/login';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#DC2626',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Manager Routes (Admin has access too) */}
          <Route
            path="/manager/*"
            element={
              <PrivateRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />

          {/* Waiter Routes */}
          <Route
            path="/waiter/*"
            element={
              <PrivateRoute allowedRoles={['ROLE_WAITER']}>
                <WaiterDashboard />
              </PrivateRoute>
            }
          />

          {/* Chef Routes */}
          <Route
            path="/chef/*"
            element={
              <PrivateRoute allowedRoles={['ROLE_CHEF']}>
                <ChefDashboard />
              </PrivateRoute>
            }
          />

          {/* Cleaner Routes */}
          <Route
            path="/cleaner/*"
            element={
              <PrivateRoute allowedRoles={['ROLE_CLEANER']}>
                <CleanerDashboard />
              </PrivateRoute>
            }
          />

          {/* Default Redirect */}
          <Route
            path="/"
            element={<Navigate to={getRedirectPath()} replace />}
          />

          {/* Catch-all - redirect to appropriate dashboard */}
          <Route
            path="*"
            element={<Navigate to={getRedirectPath()} replace />}
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;