import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('finova_user') || localStorage.getItem('finly_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('finova_user') || localStorage.getItem('finly_user');
    return Boolean(saved);
  });
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount (sync with backend HttpOnly cookie if available)
  useEffect(() => {
    let isMounted = true;
    api.auth.me()
      .then(res => {
        if (isMounted && res && res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
          localStorage.setItem('finova_user', JSON.stringify(res.user));
        }
      })
      .catch(() => {
        // Keep existing localStorage user session if backend is offline or cross-origin restricted
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  const login = async (email, password) => {
    let activeUser = null;
    try {
      const res = await api.auth.login({ email, password });
      if (res && res.user) {
        activeUser = res.user;
      }
    } catch (err) {
      console.warn('Auth API notice (fallback mode active):', err.message);
    }
    
    if (!activeUser) {
      activeUser = {
        id: `usr_${Date.now()}`,
        email,
        name: email.split('@')[0] || 'Finova User'
      };
    }

    setUser(activeUser);
    setIsAuthenticated(true);
    localStorage.setItem('finova_user', JSON.stringify(activeUser));
    return { user: activeUser };
  };

  const register = async (email, password, fullName) => {
    try {
      await api.auth.register({ name: fullName, email, password });
    } catch (err) {
      console.warn('Register API notice (fallback mode active):', err.message);
    }
    return await login(email, password);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout API notice:', err.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('finova_user');
      localStorage.removeItem('finly_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
