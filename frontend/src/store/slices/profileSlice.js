// frontend/src/store/slices/profileSlice.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createProfileSlice = (set, get) => ({
  // State
  profileData: null,
  profileLoading: false,
  profileError: null,
  uploadingAvatar: false,
  profilePage: 1,
  profileLimit: 10,
  hasMoreProfile: true,
  activeTab: 'about',
  
  // Posts state
  posts: [],
  postsLoading: false,
  postsError: null,
  postsPage: 1,
  postsLimit: 10,
  hasMorePosts: true,
  
  // Reviews state
  reviews: [],
  reviewsLoading: false,
  reviewsError: null,
  reviewsPage: 1,
  reviewsLimit: 10,
  hasMoreReviews: true,
  reviewsStats: null,
  
  // Jobs state
  completedJobs: [],
  jobsLoading: false,
  jobsError: null,
  jobsPage: 1,
  jobsLimit: 10,
  hasMoreJobs: true,

  // Set active tab
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Increment pages
  incrementPostsPage: () => set(state => ({ postsPage: state.postsPage + 1 })),
  incrementReviewsPage: () => set(state => ({ reviewsPage: state.reviewsPage + 1 })),
  incrementJobsPage: () => set(state => ({ jobsPage: state.jobsPage + 1 })),

  // Reset functions
  resetPosts: () => set({ 
    posts: [], 
    postsPage: 1, 
    hasMorePosts: true,
    postsError: null 
  }),
  
  resetReviews: () => set({ 
    reviews: [], 
    reviewsPage: 1, 
    hasMoreReviews: true,
    reviewsStats: null,
    reviewsError: null 
  }),
  
  resetJobs: () => set({ 
    completedJobs: [], 
    jobsPage: 1, 
    hasMoreJobs: true,
    jobsError: null 
  }),

  resetProfile: () => set({
    profileData: null,
    profileLoading: false,
    profileError: null,
    profilePage: 1,
    hasMoreProfile: true,
    activeTab: 'about',
    posts: [],
    reviews: [],
    completedJobs: []
  }),

  // Clear profile error
  clearProfileError: () => set({ profileError: null }),

  // Fetch profile by username
  fetchProfileByUsername: async (username) => {
    if (!username) {
      set({ profileError: 'اسم المستخدم مطلوب', profileLoading: false });
      return { success: false, error: 'اسم المستخدم مطلوب' };
    }
    
    set({ profileLoading: true, profileError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/users/profile/${username}`, { headers });
      
      if (response.data?.success && response.data?.data) {
        set({
          profileData: response.data.data,
          profileLoading: false
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          profileError: response.data?.message || 'فشل في تحميل الملف الشخصي',
          profileLoading: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({
        profileError: error.response?.data?.message || error.message || 'فشل في تحميل الملف الشخصي',
        profileLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Fetch current user profile
  fetchCurrentUserProfile: async () => {
    set({ profileLoading: true, profileError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          profileError: 'غير مصرح به',
          profileLoading: false
        });
        return { success: false, error: 'غير مصرح به' };
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/users/me`, { headers });
      
      if (response.data?.success && response.data?.data) {
        set({
          profileData: response.data.data,
          profileLoading: false
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          profileError: response.data?.message || 'فشل في تحميل الملف الشخصي',
          profileLoading: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      set({
        profileError: error.response?.data?.message || error.message || 'فشل في تحميل الملف الشخصي',
        profileLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    set({ profileLoading: true, profileError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          profileError: 'غير مصرح به',
          profileLoading: false
        });
        return { success: false, error: 'غير مصرح به' };
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // فقط أرسل البيانات الموجودة (لا ترسل undefined)
      const updateData = {};
      
      if (profileData.email !== undefined) updateData.email = profileData.email;
      if (profileData.phone !== undefined) updateData.phone = profileData.phone;
      if (profileData.bio !== undefined) updateData.bio = profileData.bio;
      if (profileData.location !== undefined) updateData.location = profileData.location;
      if (profileData.professionalInfo !== undefined) updateData.professionalInfo = profileData.professionalInfo;
      if (profileData.privacy !== undefined) updateData.privacy = profileData.privacy;
      
      console.log('Sending update data to server:', updateData);
      
      const response = await axios.put(`${API_URL}/users/profile`, updateData, { headers });
      
      if (response.data?.success && response.data?.data) {
        set({
          profileData: response.data.data,
          profileLoading: false
        });
        
        // تحديث المستخدم في store إذا كان هو نفس المستخدم
        const { user, setUser } = get();
        if (user && user._id === response.data.data._id) {
          setUser(response.data.data);
        }
        
        return { success: true, data: response.data.data };
      } else {
        set({
          profileError: response.data?.message || 'فشل في تحديث الملف الشخصي',
          profileLoading: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      set({
        profileError: error.response?.data?.message || error.message || 'فشل في تحديث الملف الشخصي',
        profileLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    set({ uploadingAvatar: true, profileError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          profileError: 'غير مصرح به',
          uploadingAvatar: false
        });
        return { success: false, error: 'غير مصرح به' };
      }
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const headers = { 
        Authorization: `Bearer ${token}`
      };
      
      const response = await axios.post(`${API_URL}/users/upload-avatar`, formData, { 
        headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted + '%');
          }
        }
      });
      
      if (response.data?.success && response.data?.data) {
        set(state => ({
          profileData: state.profileData 
            ? { ...state.profileData, profileImage: response.data.data.profileImage }
            : null,
          uploadingAvatar: false
        }));
        
        const { user, setUser } = get();
        if (user) {
          setUser({ ...user, profileImage: response.data.data.profileImage });
        }
        
        return { success: true, data: response.data.data };
      } else {
        set({
          profileError: response.data?.message || 'فشل في رفع الصورة',
          uploadingAvatar: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      set({
        profileError: error.response?.data?.message || error.message || 'فشل في رفع الصورة',
        uploadingAvatar: false
      });
      return { success: false, error: error.message };
    }
  },

  // Remove avatar
  removeAvatar: async () => {
    set({ uploadingAvatar: true, profileError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          profileError: 'غير مصرح به',
          uploadingAvatar: false
        });
        return { success: false, error: 'غير مصرح به' };
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`${API_URL}/users/remove-avatar`, { headers });
      
      if (response.data?.success && response.data?.data) {
        set(state => ({
          profileData: state.profileData 
            ? { ...state.profileData, profileImage: response.data.data.profileImage }
            : null,
          uploadingAvatar: false
        }));
        
        const { user, setUser } = get();
        if (user) {
          setUser({ ...user, profileImage: response.data.data.profileImage });
        }
        
        return { success: true, data: response.data.data };
      } else {
        set({
          profileError: response.data?.message || 'فشل في إزالة الصورة',
          uploadingAvatar: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      set({
        profileError: error.response?.data?.message || error.message || 'فشل في إزالة الصورة',
        uploadingAvatar: false
      });
      return { success: false, error: error.message };
    }
  },

  // Fetch user posts
  fetchUserPosts: async (userId) => {
    if (!userId) return;
    
    const { postsPage, postsLimit } = get();
    set({ postsLoading: true, postsError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/users/${userId}/posts`, {
        headers,
        params: { page: postsPage, limit: postsLimit }
      });
      
      if (response.data?.success) {
        set(state => ({
          posts: [...state.posts, ...(response.data.data || [])],
          hasMorePosts: response.data.data?.length === postsLimit,
          postsLoading: false
        }));
        return { success: true, data: response.data.data };
      } else {
        set({
          postsError: response.data?.message || 'فشل في تحميل المنشورات',
          postsLoading: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      set({
        postsError: error.response?.data?.message || error.message || 'فشل في تحميل المنشورات',
        postsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Fetch user reviews
  fetchUserReviews: async (userId) => {
    if (!userId) return;
    
    const { reviewsPage, reviewsLimit } = get();
    set({ reviewsLoading: true, reviewsError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/users/${userId}/reviews`, {
        headers,
        params: { page: reviewsPage, limit: reviewsLimit }
      });
      
      if (response.data?.success) {
        set(state => ({
          reviews: [...state.reviews, ...(response.data.data || [])],
          reviewsStats: response.data.stats || null,
          hasMoreReviews: response.data.data?.length === reviewsLimit,
          reviewsLoading: false
        }));
        return { success: true, data: response.data.data };
      } else {
        set({
          reviewsError: response.data?.message || 'فشل في تحميل التقييمات',
          reviewsLoading: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      set({
        reviewsError: error.response?.data?.message || error.message || 'فشل في تحميل التقييمات',
        reviewsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Fetch user completed jobs
  fetchUserCompletedJobs: async (userId) => {
    if (!userId) return;
    
    const { jobsPage, jobsLimit } = get();
    set({ jobsLoading: true, jobsError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/users/${userId}/completed-jobs`, {
        headers,
        params: { page: jobsPage, limit: jobsLimit }
      });
      
      if (response.data?.success) {
        set(state => ({
          completedJobs: [...state.completedJobs, ...(response.data.data || [])],
          hasMoreJobs: response.data.data?.length === jobsLimit,
          jobsLoading: false
        }));
        return { success: true, data: response.data.data };
      } else {
        set({
          jobsError: response.data?.message || 'فشل في تحميل المشاريع',
          jobsLoading: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
      set({
        jobsError: error.response?.data?.message || error.message || 'فشل في تحميل المشاريع',
        jobsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Calculate overall rating
  calculateOverallRating: (completedJobs, reviews) => {
    let totalRating = 0;
    let totalCount = 0;
    
    if (completedJobs && completedJobs.length > 0) {
      completedJobs.forEach(job => {
        if (job.rating) {
          totalRating += job.rating;
          totalCount++;
        }
      });
    }
    
    if (reviews && reviews.length > 0) {
      reviews.forEach(review => {
        if (review.rating) {
          totalRating += review.rating;
          totalCount++;
        }
      });
    }
    
    return totalCount > 0 ? (totalRating / totalCount).toFixed(1) : 0;
  },

  // Get user by ID
  getUserById: async (userId) => {
    set({ profileLoading: true, profileError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/users/${userId}`, { headers });
      
      if (response.data?.success && response.data?.data) {
        set({
          profileData: response.data.data,
          profileLoading: false
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          profileError: response.data?.message || 'فشل في تحميل المستخدم',
          profileLoading: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      set({
        profileError: error.response?.data?.message || error.message || 'فشل في تحميل المستخدم',
        profileLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Follow/Unfollow user
  toggleFollow: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'غير مصرح به' };
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API_URL}/users/${userId}/follow`, {}, { headers });
      
      if (response.data?.success) {
        return { 
          success: true, 
          isFollowing: response.data.isFollowing,
          message: response.data.message 
        };
      } else {
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user followers
  getUserFollowers: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/users/${userId}/followers`, { headers });
      
      if (response.data?.success) {
        return { success: true, data: response.data.data, count: response.data.count };
      } else {
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      return { success: false, error: error.message };
    }
  },

  // Save/Unsave post
  toggleSavePost: async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'غير مصرح به' };
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API_URL}/users/save-post/${postId}`, {}, { headers });
      
      if (response.data?.success) {
        // تحديث savedPosts في profileData إذا كان موجوداً
        set(state => {
          if (state.profileData) {
            const savedPosts = state.profileData.savedPosts || [];
            let newSavedPosts;
            
            if (response.data.isSaved) {
              newSavedPosts = [...savedPosts, postId];
            } else {
              newSavedPosts = savedPosts.filter(id => id.toString() !== postId.toString());
            }
            
            return {
              profileData: {
                ...state.profileData,
                savedPosts: newSavedPosts
              }
            };
          }
          return state;
        });
        
        return { 
          success: true, 
          isSaved: response.data.isSaved,
          message: response.data.message 
        };
      } else {
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error toggling save post:', error);
      return { success: false, error: error.message };
    }
  },

  // Get saved posts
  getSavedPosts: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'غير مصرح به' };
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/users/saved-posts`, { headers });
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user stats
  getUserStats: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/users/${userId}/stats`, { headers });
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all users with filters
  getAllUsers: async (filters = {}) => {
    set({ profileLoading: true, profileError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const { role, search, city, craft, page = 1, limit = 20 } = filters;
      
      const params = {};
      if (role) params.role = role;
      if (search) params.search = search;
      if (city) params.city = city;
      if (craft) params.craft = craft;
      if (page) params.page = page;
      if (limit) params.limit = limit;
      
      const response = await axios.get(`${API_URL}/users`, { headers, params });
      
      if (response.data?.success) {
        set({
          profileLoading: false
        });
        return { 
          success: true, 
          data: response.data.data,
          pagination: response.data.pagination
        };
      } else {
        set({
          profileError: response.data?.message || 'فشل في تحميل المستخدمين',
          profileLoading: false
        });
        return { success: false, error: response.data?.message };
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      set({
        profileError: error.response?.data?.message || error.message || 'فشل في تحميل المستخدمين',
        profileLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Update online status
  updateOnlineStatus: async (isOnline) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/users/online-status`, { isOnline }, { headers });
      
      // تحديث الحالة في store
      set(state => ({
        profileData: state.profileData 
          ? { ...state.profileData, isOnline }
          : null
      }));
      
      const { user, setUser } = get();
      if (user) {
        setUser({ ...user, isOnline });
      }
      
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  },

  // Clear specific data
  clearProfileData: () => set({ profileData: null }),
  clearPosts: () => set({ posts: [], postsPage: 1, hasMorePosts: true }),
  clearReviews: () => set({ reviews: [], reviewsPage: 1, hasMoreReviews: true, reviewsStats: null }),
  clearJobs: () => set({ completedJobs: [], jobsPage: 1, hasMoreJobs: true }),

  // Refresh profile data
  refreshProfile: async () => {
    const { profileData, fetchCurrentUserProfile } = get();
    if (profileData) {
      await fetchCurrentUserProfile();
    }
  }
});

export default createProfileSlice;