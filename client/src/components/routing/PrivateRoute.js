import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const authContext = useContext(AuthContext);
  // If context is not available yet, use default values
  const { isAuthenticated = false, user = null, loading = false } = authContext || {};

  console.log('PrivateRoute auth state:', { isAuthenticated, user, loading });

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;