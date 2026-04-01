// store/slices/reviewsSlice.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createReviewsSlice = (set, get) => ({
  // State
  reviews: [],
  reviewsLoading: false,
  reviewsError: null,
  reviewsPage: 1,
  reviewsLimit: 10,
  hasMoreReviews: true,
  reviewsTotal: 0,
  reviewsStats: {
    average: 0,
    count: 0,
    distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  },

  // Reset reviews
  resetReviews: () => {
    set({
      reviews: [],
      reviewsLoading: false,
      reviewsError: null,
      reviewsPage: 1,
      hasMoreReviews: true,
      reviewsTotal: 0,
      reviewsStats: {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    });
  },

  // Increment reviews page
  incrementReviewsPage: () => {
    set(state => ({ reviewsPage: state.reviewsPage + 1 }));
  },

  // Fetch user reviews
  fetchUserReviews: async (userId) => {
    const { reviewsPage, reviewsLimit, reviews } = get();
    
    if (get().reviewsLoading) return;
    
    set({ reviewsLoading: true, reviewsError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${API_URL}/users/${userId}/reviews?page=${reviewsPage}&limit=${reviewsLimit}`,
        { headers }
      );
      
      if (response.data.success) {
        const newReviews = response.data.data || [];
        const total = response.data.pagination?.total || newReviews.length;
        const stats = response.data.stats || { average: 0, count: 0 };
        
        const hasMore = reviewsPage * reviewsLimit < total;
        
        // حساب توزيع التقييمات
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        newReviews.forEach(review => {
          const rating = Math.round(review.rating);
          if (rating >= 1 && rating <= 5) {
            distribution[rating]++;
          }
        });
        
        set({
          reviews: reviewsPage === 1 ? newReviews : [...reviews, ...newReviews],
          reviewsTotal: total,
          reviewsStats: {
            average: stats.average || 0,
            count: stats.count || 0,
            distribution
          },
          hasMoreReviews: hasMore,
          reviewsLoading: false
        });
      } else {
        set({
          reviewsError: response.data.message || 'Failed to fetch reviews',
          reviewsLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      set({
        reviewsError: error.response?.data?.message || error.message || 'Failed to fetch reviews',
        reviewsLoading: false
      });
    }
  },

  // Create review
  createReview: async (userId, reviewData) => {
    set({ reviewsLoading: true, reviewsError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          reviewsError: 'Not authenticated',
          reviewsLoading: false
        });
        return { success: false, error: 'Not authenticated' };
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(
        `${API_URL}/users/${userId}/reviews`, 
        reviewData, 
        { headers }
      );
      
      if (response.data.success) {
        // إعادة جلب التقييمات بعد إضافة تقييم جديد
        await get().fetchUserReviews(userId);
        
        return { success: true, data: response.data.data };
      } else {
        set({
          reviewsError: response.data.message || 'Failed to create review',
          reviewsLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error creating review:', error);
      set({
        reviewsError: error.response?.data?.message || error.message || 'Failed to create review',
        reviewsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    set({ reviewsLoading: true, reviewsError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          reviewsError: 'Not authenticated',
          reviewsLoading: false
        });
        return { success: false, error: 'Not authenticated' };
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.put(
        `${API_URL}/reviews/${reviewId}`, 
        reviewData, 
        { headers }
      );
      
      if (response.data.success) {
        set(state => ({
          reviews: state.reviews.map(review => 
            review._id === reviewId ? response.data.data : review
          ),
          reviewsLoading: false
        }));
        
        return { success: true, data: response.data.data };
      } else {
        set({
          reviewsError: response.data.message || 'Failed to update review',
          reviewsLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error updating review:', error);
      set({
        reviewsError: error.response?.data?.message || error.message || 'Failed to update review',
        reviewsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    set({ reviewsLoading: true, reviewsError: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({
          reviewsError: 'Not authenticated',
          reviewsLoading: false
        });
        return { success: false, error: 'Not authenticated' };
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, { headers });
      
      if (response.data.success) {
        set(state => ({
          reviews: state.reviews.filter(review => review._id !== reviewId),
          reviewsTotal: state.reviewsTotal - 1,
          reviewsLoading: false
        }));
        
        return { success: true };
      } else {
        set({
          reviewsError: response.data.message || 'Failed to delete review',
          reviewsLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      set({
        reviewsError: error.response?.data?.message || error.message || 'Failed to delete review',
        reviewsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Clear reviews error
  clearReviewsError: () => {
    set({ reviewsError: null });
  }
});