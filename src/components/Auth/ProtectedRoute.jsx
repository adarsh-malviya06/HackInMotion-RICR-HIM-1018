import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, onRedirectToLogin }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading financial workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (onRedirectToLogin) onRedirectToLogin();
    return null;
  }

  return <>{children}</>;
};
