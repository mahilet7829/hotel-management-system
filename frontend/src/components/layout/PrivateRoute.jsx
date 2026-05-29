import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, token } = useAuthStore();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated || !token) {
    // Redirect to login while saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    // Roles are strings like ["ROLE_MANAGER"] not objects
    const userRoles = user?.roles || [];

    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      // User doesn't have required role - show unauthorized
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
        }}>
          <h1 style={{ fontSize: '72px', margin: '0', color: '#DC2626' }}>403</h1>
          <h2 style={{ fontSize: '24px', margin: '10px 0', color: '#374151' }}>
            Access Denied
          </h2>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '20px' }}>
            You do not have permission to access this page.
          </p>
          <button
            onClick={() => {
              const userRoles = user?.roles || [];

              if (userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_MANAGER')) {
                window.location.href = '/manager';
              } else if (userRoles.includes('ROLE_WAITER')) {
                window.location.href = '/waiter';
              } else if (userRoles.includes('ROLE_CHEF')) {
                window.location.href = '/chef';
              } else if (userRoles.includes('ROLE_CLEANER')) {
                window.location.href = '/cleaner';
              } else {
                window.location.href = '/login';
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Go to My Dashboard
          </button>
        </div>
      );
    }
  }

  // User is authenticated and has required role
  return children;
};

export default PrivateRoute;