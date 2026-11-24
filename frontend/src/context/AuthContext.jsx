import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('store_rating_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('store_rating_token') || null);
  const [loading, setLoading] = useState(true);
  const { toastSuccess, toastError } = useToast();

  // Verify and refresh profile on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('store_rating_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          // Token will be handled by interceptor if 401
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, token: jwtToken } = res.data.data;

      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('store_rating_token', jwtToken);
      localStorage.setItem('store_rating_user', JSON.stringify(userData));

      toastSuccess(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toastError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const register = async (payload) => {
    try {
      const res = await api.post('/auth/register', payload);
      const { user: userData, token: jwtToken } = res.data.data;

      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('store_rating_token', jwtToken);
      localStorage.setItem('store_rating_user', JSON.stringify(userData));

      toastSuccess(`Registration successful! Welcome, ${userData.name}.`);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed.';
      const errors = err.response?.data?.errors;
      toastError(errorMsg);
      return { success: false, message: errorMsg, errors };
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('store_rating_token');
    localStorage.removeItem('store_rating_user');
    toastSuccess('You have been logged out.');
  }, [toastSuccess]);

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toastSuccess(res.data.message || 'Password updated successfully.');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update password.';
      toastError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const updateCachedUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('store_rating_user', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    changePassword,
    updateCachedUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
