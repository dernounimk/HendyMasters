// store/slices/postsSlice.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createPostsSlice = (set, get) => ({
  // State
  posts: [],
  postsLoading: false,
  postsError: null,
  postsPage: 1,
  postsLimit: 10,
  hasMorePosts: true,
  postsTotal: 0,
  
  currentPost: null,
  postLoading: false,

  // Reset posts
  resetPosts: () => {
    set({
      posts: [],
      postsLoading: false,
      postsError: null,
      postsPage: 1,
      hasMorePosts: true,
      postsTotal: 0,
      currentPost: null
    });
  },

  // Increment posts page
  incrementPostsPage: () => {
    set(state => ({ postsPage: state.postsPage + 1 }));
  },

  // Fetch user posts
  fetchUserPosts: async (userId) => {
    const { postsPage, postsLimit, posts } = get();
    
    if (get().postsLoading) return;
    
    set({ postsLoading: true, postsError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${API_URL}/users/${userId}/posts?page=${postsPage}&limit=${postsLimit}`,
        { headers }
      );
      
      if (response.data.success) {
        const newPosts = response.data.data || [];
        const total = response.data.pagination?.total || newPosts.length;
        const hasMore = postsPage * postsLimit < total;
        
        set({
          posts: postsPage === 1 ? newPosts : [...posts, ...newPosts],
          postsTotal: total,
          hasMorePosts: hasMore,
          postsLoading: false
        });
      } else {
        set({
          postsError: response.data.message || 'Failed to fetch posts',
          postsLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({
        postsError: error.response?.data?.message || error.message || 'Failed to fetch posts',
        postsLoading: false
      });
    }
  },

  // Fetch single post
  fetchPostById: async (postId) => {
    set({ postLoading: true, postsError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/posts/${postId}`, { headers });
      
      if (response.data.success) {
        set({
          currentPost: response.data.data,
          postLoading: false
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          postsError: response.data.message || 'Failed to fetch post',
          postLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      set({
        postsError: error.response?.data?.message || error.message || 'Failed to fetch post',
        postLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Create post
  createPost: async (postData) => {
    set({ postsLoading: true, postsError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          postsError: 'Not authenticated',
          postsLoading: false
        });
        return { success: false, error: 'Not authenticated' };
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${API_URL}/posts`, postData, { headers });
      
      if (response.data.success) {
        set(state => ({
          posts: [response.data.data, ...state.posts],
          postsTotal: state.postsTotal + 1,
          postsLoading: false
        }));
        return { success: true, data: response.data.data };
      } else {
        set({
          postsError: response.data.message || 'Failed to create post',
          postsLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error creating post:', error);
      set({
        postsError: error.response?.data?.message || error.message || 'Failed to create post',
        postsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Update post
  updatePost: async (postId, postData) => {
    set({ postsLoading: true, postsError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          postsError: 'Not authenticated',
          postsLoading: false
        });
        return { success: false, error: 'Not authenticated' };
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.put(`${API_URL}/posts/${postId}`, postData, { headers });
      
      if (response.data.success) {
        set(state => ({
          posts: state.posts.map(post => 
            post._id === postId ? response.data.data : post
          ),
          currentPost: response.data.data,
          postsLoading: false
        }));
        return { success: true, data: response.data.data };
      } else {
        set({
          postsError: response.data.message || 'Failed to update post',
          postsLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error updating post:', error);
      set({
        postsError: error.response?.data?.message || error.message || 'Failed to update post',
        postsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Delete post
  deletePost: async (postId) => {
    set({ postsLoading: true, postsError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          postsError: 'Not authenticated',
          postsLoading: false
        });
        return { success: false, error: 'Not authenticated' };
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.delete(`${API_URL}/posts/${postId}`, { headers });
      
      if (response.data.success) {
        set(state => ({
          posts: state.posts.filter(post => post._id !== postId),
          postsTotal: state.postsTotal - 1,
          postsLoading: false
        }));
        return { success: true };
      } else {
        set({
          postsError: response.data.message || 'Failed to delete post',
          postsLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      set({
        postsError: error.response?.data?.message || error.message || 'Failed to delete post',
        postsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Like/Unlike post
  toggleLike: async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(`${API_URL}/posts/${postId}/like`, {}, { headers });
      
      if (response.data.success) {
        // تحديث حالة الإعجاب في القائمة
        set(state => ({
          posts: state.posts.map(post => 
            post._id === postId 
              ? { 
                  ...post, 
                  isLiked: response.data.isLiked,
                  likesCount: response.data.likesCount 
                }
              : post
          ),
          currentPost: state.currentPost?._id === postId
            ? { 
                ...state.currentPost, 
                isLiked: response.data.isLiked,
                likesCount: response.data.likesCount 
              }
            : state.currentPost
        }));
        
        return { success: true, isLiked: response.data.isLiked };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear posts error
  clearPostsError: () => {
    set({ postsError: null });
  }
});