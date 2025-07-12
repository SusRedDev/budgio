import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [travelMode, setTravelMode] = useState(false);
  const [isPanicMode, setIsPanicMode] = useState(false);

  // Set up axios interceptor to include token in requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/me`);
          setUser(response.data);
          setTravelMode(response.data.settings?.travel_mode?.travel_mode_enabled || false);
          
          // Check if user is in panic mode based on token
          const tokenData = parseJwt(token);
          setIsPanicMode(tokenData?.is_panic_mode || false);
        } catch (error) {
          console.error('Error loading user data:', error);
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password
      });
      
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      setTravelMode(userData.settings?.travel_mode?.travel_mode_enabled || false);
      setIsPanicMode(false);
      
      localStorage.setItem('token', access_token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const panicLogin = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/panic-login`, {
        username,
        password
      });
      
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      setTravelMode(userData.settings?.travel_mode?.travel_mode_enabled || false);
      setIsPanicMode(true);
      
      localStorage.setItem('token', access_token);
      return { success: true };
    } catch (error) {
      console.error('Panic login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, userData);
      
      const { access_token, user: newUser } = response.data;
      
      setToken(access_token);
      setUser(newUser);
      setTravelMode(false);
      setIsPanicMode(false);
      
      localStorage.setItem('token', access_token);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTravelMode(false);
    setIsPanicMode(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateTravelMode = async (settings) => {
    try {
      await axios.post(`${API_BASE_URL}/travel-mode`, settings);
      
      // Refresh user data
      const response = await axios.get(`${API_BASE_URL}/me`);
      setUser(response.data);
      setTravelMode(response.data.settings?.travel_mode?.travel_mode_enabled || false);
      
      return { success: true };
    } catch (error) {
      console.error('Travel mode update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update travel mode' 
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await axios.post(`${API_BASE_URL}/change-password`, passwordData);
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to change password' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    travelMode,
    isPanicMode,
    login,
    panicLogin,
    register,
    logout,
    updateTravelMode,
    changePassword,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};