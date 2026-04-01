// frontend/src/store/index.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import socketService from '../services/socketService';

// ============== Slice: Auth ==============
const createAuthSlice = (set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  currentLanguage: 'ar',
  isRTL: true,

  setLanguage: (lang) => {
    set({ currentLanguage: lang, isRTL: lang === 'ar' });
    localStorage.setItem('language', lang);
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        socketService.initialize(token);
        
        setTimeout(async () => {
          await get().fetchUnreadNotificationsCount();
          await get().fetchUnreadCount();
          window.dispatchEvent(new CustomEvent('user:loggedin', { detail: user }));
        }, 100);
        
        return { success: true, user };
      }
      throw new Error(response.data.message || 'فشل تسجيل الدخول');
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return false;
    }

    set({ isLoading: true });
    try {
      const response = await api.get('/users/me');
      if (response.data.success) {
        const userData = response.data.data;
        
        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
        
        if (userData && token) {
          socketService.initialize(token);
          
          setTimeout(async () => {
            await get().fetchUnreadNotificationsCount();
            await get().fetchUnreadCount();
            window.dispatchEvent(new CustomEvent('user:loggedin', { detail: userData }));
          }, 100);
        }
        return true;
      }
      throw new Error('Session expired');
    } catch (error) {
      console.error('Auth check failed:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        socketService.disconnect();
      } else {
        set({ isLoading: false });
      }
      return false;
    }
  },
  
  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      set({ user: updatedUser });
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        socketService.initialize(token);
        
        return { success: true, user };
      }
      throw new Error(response.data.message || 'فشل التسجيل');
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // دوال إعادة تعيين كلمة المرور بالرمز (OTP)
  requestResetCode: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/request-reset-code', { email });
      set({ isLoading: false });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في طلب الرمز';
      set({ isLoading: false, error: errorMessage });
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  verifyResetCode: async (email, code) => {
    try {
      console.log('🔐 Sending verify request:', { email, code });
      
      const response = await api.post('/auth/verify-reset-code', { email, code });
      
      console.log('📨 Verify response:', response.data);
      
      return { 
        success: true, 
        valid: response.data.valid || false,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Verify error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'الرمز غير صحيح';
      return { 
        success: false, 
        valid: false,
        error: errorMessage 
      };
    }
  },

  resetPasswordWithCode: async (email, code, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/reset-password-with-code', { 
        email, 
        code, 
        newPassword 
      });
      set({ isLoading: false });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في إعادة تعيين كلمة المرور';
      set({ isLoading: false, error: errorMessage });
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  // دوال إعادة تعيين كلمة المرور بالرابط
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/forgot-password', { email });
      set({ isLoading: false });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في طلب إعادة التعيين';
      set({ isLoading: false, error: errorMessage });
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  verifyResetToken: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/auth/verify-reset-token/${token}`);
      set({ isLoading: false });
      return { 
        success: true, 
        isValid: true,
        email: response.data.email 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'الرمز غير صالح';
      set({ isLoading: false, error: errorMessage });
      return { 
        success: false, 
        isValid: false, 
        error: errorMessage 
      };
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      set({ isLoading: false });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في إعادة تعيين كلمة المرور';
      set({ isLoading: false, error: errorMessage });
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      set({ isLoading: false });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في تغيير كلمة المرور';
      set({ isLoading: false, error: errorMessage });
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  // دوال الخصوصية والمستخدمين المحظورين
  updatePrivacy: async (privacy) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/users/privacy', privacy);
      if (response.data.success) {
        const updatedUser = { ...get().user, privacy: response.data.data.privacy };
        set({ user: updatedUser, isLoading: false });
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data.message || 'فشل تحديث الخصوصية');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في تحديث الخصوصية';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  fetchBlockedUsers: async () => {
    try {
      const response = await api.get('/users/blocks');
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await api.delete(`/users/block/${userId}`);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
      throw new Error(response.data.message || 'فشل إلغاء الحظر');
    } catch (error) {
      console.error('Error unblocking user:', error);
      return { success: false, error: error.response?.data?.message || 'حدث خطأ' };
    }
  },

  blockUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/users/block/${userId}`);
      if (response.data.success) {
        set({ isLoading: false });
        return { success: true, message: response.data.message };
      }
      throw new Error(response.data.message || 'فشل حظر المستخدم');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في حظر المستخدم';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    socketService.disconnect();
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  setUser: (userData) => {
    set({ user: userData });
  }
});

// ============== Slice: Profile ==============
const createProfileSlice = (set, get) => ({
  profileData: null,
  profileLoading: false,
  profileError: null,
  activeTab: 'about',

  fetchProfileByUsername: async (username) => {
    set({ profileLoading: true, profileError: null });
    try {
      const response = await api.get(`/users/profile/${username}`);
      if (response.data.success) {
        set({ profileData: response.data.data, profileLoading: false });
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data.message || 'فشل جلب الملف الشخصي');
    } catch (error) {
      set({ profileError: error.response?.data?.message || error.message, profileLoading: false });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  fetchCurrentUserProfile: async () => {
    set({ profileLoading: true, profileError: null });
    try {
      const response = await api.get('/users/me');
      if (response.data.success) {
        set({ profileData: response.data.data, profileLoading: false });
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data.message || 'فشل جلب الملف الشخصي');
    } catch (error) {
      set({ profileError: error.response?.data?.message || error.message, profileLoading: false });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  updateProfile: async (profileData) => {
    set({ profileLoading: true, profileError: null });
    try {
      const response = await api.put('/users/profile', profileData);
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        const currentUser = get().user;
        
        if (currentUser && currentUser._id === updatedUser._id) {
          set({ user: updatedUser });
        }
        
        set({ profileData: updatedUser, profileLoading: false });
        return { success: true, data: updatedUser };
      }
      throw new Error(response.data.message || 'فشل تحديث الملف الشخصي');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ profileError: errorMessage, profileLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  clearProfileError: () => set({ profileError: null })
});

// ============== Slice: Posts ==============
const createPostsSlice = (set, get) => ({
  posts: [],
  postsLoading: false,
  postsPage: 1,
  hasMorePosts: true,
  postsError: null,

  fetchUserPosts: async (userId, reset = true) => {
    const { postsPage, posts } = get();
    if (reset) {
      set({ postsLoading: true, posts: [], postsPage: 1, hasMorePosts: true });
    } else {
      set({ postsLoading: true });
    }
    
    try {
      const response = await api.get(`/users/${userId}/posts`, {
        params: { page: reset ? 1 : postsPage, limit: 10 }
      });
      
      if (response.data.success) {
        const newPosts = response.data.data;
        set({
          posts: reset ? newPosts : [...posts, ...newPosts],
          hasMorePosts: newPosts.length === 10,
          postsLoading: false
        });
        if (!reset && newPosts.length > 0) {
          set((state) => ({ postsPage: state.postsPage + 1 }));
        }
      } else {
        set({ postsLoading: false });
      }
    } catch (error) {
      set({ postsError: error.response?.data?.message || error.message, postsLoading: false });
    }
  },

  resetPosts: () => set({ posts: [], postsPage: 1, hasMorePosts: true }),
  incrementPostsPage: () => set((state) => ({ postsPage: state.postsPage + 1 }))
});

// ============== Slice: Reviews ==============
const createReviewsSlice = (set, get) => ({
  reviews: [],
  reviewsLoading: false,
  reviewsPage: 1,
  hasMoreReviews: true,
  reviewsStats: { average: 0, count: 0 },
  reviewsError: null,

  fetchUserReviews: async (userId, reset = true) => {
    const { reviewsPage, reviews } = get();
    if (reset) {
      set({ reviewsLoading: true, reviews: [], reviewsPage: 1, hasMoreReviews: true });
    } else {
      set({ reviewsLoading: true });
    }
    
    try {
      const response = await api.get(`/users/${userId}/reviews`, {
        params: { page: reset ? 1 : reviewsPage, limit: 10 }
      });
      
      if (response.data.success) {
        const newReviews = response.data.data;
        set({
          reviews: reset ? newReviews : [...reviews, ...newReviews],
          hasMoreReviews: newReviews.length === 10,
          reviewsStats: response.data.stats || { average: 0, count: 0 },
          reviewsLoading: false
        });
        if (!reset && newReviews.length > 0) {
          set((state) => ({ reviewsPage: state.reviewsPage + 1 }));
        }
      }
    } catch (error) {
      set({ reviewsError: error.response?.data?.message || error.message, reviewsLoading: false });
    }
  },

  resetReviews: () => set({ reviews: [], reviewsPage: 1, hasMoreReviews: true }),
  incrementReviewsPage: () => set((state) => ({ reviewsPage: state.reviewsPage + 1 }))
});

// ============== Slice: Posts Management ==============
const createPostsManagementSlice = (set, get) => ({
  allPosts: [],
  allPostsLoading: false,
  allPostsPage: 1,
  hasMoreAllPosts: true,
  allPostsError: null,
  currentPost: null,
  currentPostLoading: false,
  currentPostError: null,
  
  fetchAllPosts: async (filters = {}, reset = true) => {
    const { allPostsPage, allPosts } = get();
    if (reset) {
      set({ allPostsLoading: true, allPosts: [], allPostsPage: 1, hasMoreAllPosts: true });
    } else {
      set({ allPostsLoading: true });
    }
    
    try {
      const response = await api.get('/posts', {
        params: { 
          page: reset ? 1 : allPostsPage, 
          limit: 10,
          ...filters
        }
      });
      
      if (response.data.success) {
        const newPosts = response.data.posts;
        set({
          allPosts: reset ? newPosts : [...allPosts, ...newPosts],
          hasMoreAllPosts: newPosts.length === 10,
          allPostsLoading: false
        });
        if (!reset && newPosts.length > 0) {
          set((state) => ({ allPostsPage: state.allPostsPage + 1 }));
        }
        return response.data;
      }
    } catch (error) {
      set({ allPostsError: error.response?.data?.message || error.message, allPostsLoading: false });
    }
  },
  
  fetchSavedPosts: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/posts/saved', {
        params: { page, limit }
      });
      if (response.data.success) {
        return {
          posts: response.data.posts,
          pagination: response.data.pagination
        };
      }
      return { posts: [], pagination: null };
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      return { posts: [], pagination: null };
    }
  },
  
  fetchPostById: async (postId) => {
    set({ currentPostLoading: true, currentPostError: null });
    try {
      const response = await api.get(`/posts/${postId}`);
      if (response.data.success) {
        set({ currentPost: response.data.data, currentPostLoading: false });
        return response.data.data;
      }
    } catch (error) {
      set({ currentPostError: error.response?.data?.message || error.message, currentPostLoading: false });
    }
  },
  
  createPost: async (postData, images) => {
    set({ allPostsLoading: true });
    try {
      const currentUser = get().user;
      
      if (currentUser) {
        if (currentUser.role === 'client' && postData.type !== 'service_request') {
          throw new Error('العميل يمكنه فقط إنشاء طلبات خدمة');
        }
        if (currentUser.role === 'artisan' && postData.type !== 'job_opportunity') {
          throw new Error('الحرفي يمكنه فقط إنشاء فرص عمل');
        }
        if (currentUser.role === 'worker') {
          throw new Error('العامل لا يمكنه إنشاء منشورات');
        }
      }
      
      const formData = new FormData();
      
      Object.keys(postData).forEach(key => {
        if (key === 'requiredSkills' && Array.isArray(postData[key])) {
          formData.append(key, JSON.stringify(postData[key]));
        } else if (postData[key] !== undefined && postData[key] !== null) {
          formData.append(key, postData[key]);
        }
      });
      
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }
      
      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        set((state) => ({
          allPosts: [response.data.data, ...state.allPosts],
          allPostsLoading: false
        }));
        
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            posts: [response.data.data._id, ...(currentUser.posts || [])],
            stats: {
              ...currentUser.stats,
              postsCount: (currentUser.stats?.postsCount || 0) + 1
            }
          };
          set({ user: updatedUser });
        }
        
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({ allPostsLoading: false });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  savePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/save`);
      if (response.data.success) {
        set((state) => ({
          allPosts: state.allPosts.map(post => 
            post._id === postId 
              ? { 
                  ...post, 
                  stats: { 
                    ...post.stats, 
                    savesCount: response.data.data.savesCount 
                  },
                  isSaved: response.data.data.saved
                }
              : post
          ),
          currentPost: state.currentPost?._id === postId
            ? { 
                ...state.currentPost, 
                stats: { 
                  ...state.currentPost.stats, 
                  savesCount: response.data.data.savesCount 
                },
                isSaved: response.data.data.saved
              }
            : state.currentPost
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
  
  resetAllPosts: () => set({ allPosts: [], allPostsPage: 1, hasMoreAllPosts: true }),
  incrementAllPostsPage: () => set((state) => ({ allPostsPage: state.allPostsPage + 1 })),
  clearCurrentPost: () => set({ currentPost: null, currentPostError: null })
});

// ============== Slice: Notifications ==============
const createNotificationsSlice = (set, get) => ({
  notifications: [],
  notificationsLoading: false,
  notificationsPage: 1,
  hasMoreNotifications: true,
  unreadNotificationsCount: 0,
  notificationsError: null,

  fetchNotifications: async (page = 1, reset = true) => {
    const { notificationsPage, notifications } = get();
    if (reset) {
      set({ notificationsLoading: true, notifications: [], notificationsPage: 1, hasMoreNotifications: true });
    } else {
      set({ notificationsLoading: true });
    }
    
    try {
      const response = await api.get('/notifications', {
        params: { page: reset ? 1 : notificationsPage, limit: 20 }
      });
      
      if (response.data.success) {
        const newNotifications = response.data.data.notifications;
        set({
          notifications: reset ? newNotifications : [...notifications, ...newNotifications],
          hasMoreNotifications: response.data.data.hasMore,
          unreadNotificationsCount: response.data.data.unreadCount,
          notificationsLoading: false
        });
        if (!reset && newNotifications.length > 0) {
          set((state) => ({ notificationsPage: state.notificationsPage + 1 }));
        }
        return response.data.data;
      }
    } catch (error) {
      set({ notificationsError: error.response?.data?.message || error.message, notificationsLoading: false });
      return { notifications: [], unreadCount: 0, hasMore: false };
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        set((state) => ({
          notifications: state.notifications.map(notif =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          ),
          unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1)
        }));
        return response.data.data;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      if (response.data.success) {
        set((state) => ({
          notifications: state.notifications.map(notif => ({ ...notif, read: true })),
          unreadNotificationsCount: 0
        }));
        return true;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        const deletedNotification = get().notifications.find(n => n._id === notificationId);
        set((state) => ({
          notifications: state.notifications.filter(notif => notif._id !== notificationId),
          unreadNotificationsCount: deletedNotification && !deletedNotification.read
            ? Math.max(0, state.unreadNotificationsCount - 1)
            : state.unreadNotificationsCount
        }));
        return true;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  fetchUnreadNotificationsCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        const count = response.data.data.unreadCount;
        set({ unreadNotificationsCount: count });
        return count;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      return 0;
    }
  },

  resetNotifications: () => set({ notifications: [], notificationsPage: 1, hasMoreNotifications: true }),
  incrementNotificationsPage: () => set((state) => ({ notificationsPage: state.notificationsPage + 1 }))
});

// ============== Main Store ==============
export const useStore = create(
  persist(
    (set, get) => ({
      ...createAuthSlice(set, get),
      ...createProfileSlice(set, get),
      ...createPostsSlice(set, get),
      ...createReviewsSlice(set, get),
      ...createPostsManagementSlice(set, get),
      ...createNotificationsSlice(set, get),
      
      theme: localStorage.getItem('theme') || 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        set({ theme: newTheme });
      },

      // ============== Chat Functions ==============
      createConversation: async (recipientId, initialMessage = '') => {
        return new Promise((resolve, reject) => {
          if (!recipientId) {
            reject(new Error('معرف المستلم غير صالح'));
            return;
          }
          
          const currentUser = get().user;
          if (currentUser && String(currentUser._id) === String(recipientId)) {
            reject(new Error('لا يمكنك إنشاء محادثة مع نفسك'));
            return;
          }
          
          if (!socketService.getConnectionStatus()) {
            reject(new Error('لا يوجد اتصال بالخادم'));
            return;
          }
          
          socketService.emit('conversation:start', {
            recipientId,
            initialMessage
          }, (response) => {
            if (response?.success) {
              resolve(response.data);
            } else {
              reject(new Error(response?.message || 'فشل في إنشاء المحادثة'));
            }
          });
          
          setTimeout(() => {
            reject(new Error('انتهت مهلة الاتصال'));
          }, 10000);
        });
      },
      
      checkMessagingPermission: async (userId) => {
        try {
          const response = await api.get(`/messages/check/${userId}`);
          if (response.data?.success) {
            return response.data.data;
          }
          return { allowed: false, reason: 'فشل التحقق من الصلاحية' };
        } catch (error) {
          return { allowed: false, reason: error.response?.data?.message || 'حدث خطأ' };
        }
      },
      
      fetchConversations: async () => {
        try {
          const response = await api.get('/messages/conversations');
          if (response.data?.success) {
            return response.data.data;
          }
          return [];
        } catch (error) {
          console.error('Error fetching conversations:', error);
          return [];
        }
      },
      
      fetchUnreadCount: async () => {
        try {
          const response = await api.get('/messages/unread-count');
          if (response.data?.success) {
            return response.data.data.totalUnread;
          }
          return 0;
        } catch (error) {
          console.error('Error fetching unread count:', error);
          return 0;
        }
      },
      
      sendMessage: async (conversationId, recipientId, content) => {
        return new Promise((resolve, reject) => {
          if (!socketService.getConnectionStatus()) {
            reject(new Error('لا يوجد اتصال بالخادم'));
            return;
          }
          
          socketService.emit('message:send', {
            conversationId,
            recipientId,
            content
          }, (response) => {
            if (response?.success) {
              resolve(response.data);
            } else {
              reject(new Error(response?.message || 'فشل في إرسال الرسالة'));
            }
          });
        });
      },
      
      markMessagesAsRead: async (conversationId) => {
        if (socketService.getConnectionStatus()) {
          socketService.emit('messages:read', { conversationId });
        }
        try {
          await api.put(`/messages/conversations/${conversationId}/read`);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        currentLanguage: state.currentLanguage,
        isRTL: state.isRTL,
        theme: state.theme
      }),
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return {
            ...persistedState,
            isAuthenticated: !!persistedState.token,
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating storage:', error);
        } else if (state?.token && state?.isAuthenticated) {
          setTimeout(() => {
            socketService.initialize(state.token);
          }, 500);
          console.log('✅ Storage rehydrated, socket initialized');
        }
      }
    }
  )
);