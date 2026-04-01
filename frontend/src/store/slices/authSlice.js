// store/slices/authSlice.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// إعداد interceptors لـ axios
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          if (response.data.success) {
            const { token } = response.data.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const createAuthSlice = (set, get) => ({
  // State
  user: null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  loginAttempts: 0,
  isLocked: false,
  lockTimeRemaining: 0,
  
  // إعدادات اللغة
  currentLanguage: localStorage.getItem('i18nextLng') || 'en',
  isRTL: localStorage.getItem('i18nextLng') === 'ar',
  isTransitioning: false,
  direction: 1,

  // Set user
  setUser: (user) => {
    set({ user });
  },

  // تغيير اللغة
  changeLanguage: (lng, direction = 1) => {
    const isRTL = lng === 'ar';
    set({ 
      isTransitioning: true,
      direction,
      currentLanguage: lng,
      isRTL 
    });
    
    localStorage.setItem('i18nextLng', lng);
    
    setTimeout(() => {
      set({ isTransitioning: false });
    }, 300);
  },

  // التحقق من المصادقة عند تحميل التطبيق
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ 
        isAuthenticated: false, 
        user: null,
        token: null,
        isLoading: false 
      });
      return { success: false };
    }

    set({ isLoading: true });
    
    try {
      // تعيين التوكن في الهيدر
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // ✅ استخدام المسار الصحيح - /api/users/me بدلاً من /api/auth/me
      const response = await axios.get(`${API_URL}/users/me`);
      
      console.log('Check auth response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data;
        
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
          isLoading: false
        });
        
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      return { success: false };
    }
  },

  // Register
  register: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        return { success: true, user };
      }
      
    } catch (error) {
      let errorMessage = 'حدث خطأ في التسجيل';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          loginAttempts: 0
        });
        
        return { success: true, user };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'حدث خطأ في تسجيل الدخول';
      let field = null;
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        
        if (errorMessage.includes('email') || errorMessage.includes('بريد')) {
          field = 'email';
        } else if (errorMessage.includes('password') || errorMessage.includes('كلمة المرور')) {
          field = 'password';
        }
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage,
        isAuthenticated: false
      });
      
      return { success: false, error: errorMessage, field };
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });
    
    try {
      if (get().token) {
        await axios.post(`${API_URL}/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        loginAttempts: 0,
        isLocked: false
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null })
});