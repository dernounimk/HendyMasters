import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      setUser(data.user);
      
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      setUser(data.user);
      
      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/verify-phone');
      
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isArtisan: user?.role === 'artisan',
    isClient: user?.role === 'client',
    isWorker: user?.role === 'worker',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
