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
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (loggedIn && token) {
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsLoggedIn(true);
          } catch (apiError) {
            console.error('Token validation failed:', apiError);
            const isUnauthorized = apiError?.response?.status === 401 || 
                                   apiError?.message?.includes('401') ||
                                   apiError?.message?.includes('Unauthorized');
            
            if (isUnauthorized) {
              console.log('Token is invalid (401), clearing auth data');
              localStorage.removeItem('token');
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('user');
              setUser(null);
              setIsLoggedIn(false);
              // Redirect to login after clearing token
              window.location.href = '/login';
            } else {
              // For other errors (network, 500, etc.), try to use stored user data
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                try {
                  const parsedUser = JSON.parse(storedUser);
                  setUser(parsedUser);
                  setIsLoggedIn(true);
                  console.log('Using stored user data due to API error (non-401)');
                } catch (e) {
                  console.error('Failed to parse stored user:', e);
                }
              } else {
                // If no stored user and not 401, keep token but set logged in to false
                console.warn('API error but keeping token:', apiError);
              }
            }
          }
        } else {
          // No token or not logged in, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        const isUnauthorized = error?.response?.status === 401 || 
                               error?.message?.includes('401') ||
                               error?.message?.includes('Unauthorized');
        
        if (isUnauthorized) {
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          setUser(null);
          setIsLoggedIn(false);
        }
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

