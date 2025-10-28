import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage on mount
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (loggedIn && token) {
          // Try to get current user from API
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
        } else if (loggedIn) {
          // Fallback to localStorage if no token
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear invalid session
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      
      const { token, user: userData } = response;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data || error.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const isLecturer = () => {
    return user?.role === 'lecturer';
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    isLecturer,
    isAdmin,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

