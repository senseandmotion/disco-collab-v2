import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Get session slug from the current path
    const pathParts = location.pathname.split('/');
    const sessionSlugIndex = pathParts.indexOf('session') + 1;
    const sessionSlug = pathParts[sessionSlugIndex];
    
    if (sessionSlug) {
      // Redirect to join page with session info
      return <Navigate to={`/join?session=${sessionSlug}`} state={{ from: location }} replace />;
    }
    
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};