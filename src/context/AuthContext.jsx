import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from backend HttpOnly cookie on mount
  useEffect(() => {
    let isMounted = true;
    api.auth.me()
      .then(res => {
        if (isMounted && res && res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      return res;
    }
    throw new Error('Login failed');
  };

  const register = async (email, password, fullName) => {
    const res = await api.auth.register({ name: fullName, email, password });
    // Log user in immediately upon successful registration
    await login(email, password);
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout API notice:', err.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
