import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../shared/LoadingSpinner";

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, hasAnyRole, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user doesn't have permission
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <h1 style={{ fontSize: '72px', margin: 0 }}>403</h1>
        <p style={{ fontSize: '18px', color: '#6B7280' }}>
          You don't have permission to access this page.
        </p>
        <a href="/login" style={{ color: '#3B82F6', textDecoration: 'none' }}>
          Go to Login
        </a>
      </div>
    );
  }

  // Use Outlet for nested routes
  return <Outlet />;
};

export default PrivateRoute;