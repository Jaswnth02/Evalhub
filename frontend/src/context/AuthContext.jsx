import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('evalhub_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.auth.getCurrentUser();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('evalhub_token');
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        localStorage.removeItem('evalhub_token');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login handler
  async function login(email, password) {
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('evalhub_token', res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed.');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }

  // Register handler
  async function register(userData) {
    setError(null);
    try {
      const res = await api.auth.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('evalhub_token', res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Registration failed.');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }

  // Logout handler
  async function logout() {
    try {
      await api.auth.logout();
    } catch (e) {}
    localStorage.removeItem('evalhub_token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isFaculty: user?.role === 'faculty',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
