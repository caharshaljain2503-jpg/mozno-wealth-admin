// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();
  
  // Check if user is authenticated
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    // Redirect to login page but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;