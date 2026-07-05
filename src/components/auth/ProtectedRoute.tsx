import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

/**
 * Blocks access to everything under it unless the user is authenticated.
 * Used to wrap the whole authenticated app shell (DashboardLayout).
 */
export const RequireAuth: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // avoid a flash-redirect while session is loading
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
};

/**
 * Blocks access to a route unless the logged-in user has the given role.
 * An entrepreneur hitting /dashboard/investor (or vice versa) gets bounced
 * back to their own dashboard instead of seeing the other role's UI.
 */
export const RequireRole: React.FC<{ role: UserRole }> = ({ role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return <Outlet />;
};
