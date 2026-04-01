// store/slices/jobsSlice.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createJobsSlice = (set, get) => ({
  // State
  completedJobs: [],
  jobsLoading: false,
  jobsError: null,
  jobsPage: 1,
  jobsLimit: 10,
  hasMoreJobs: true,
  jobsTotal: 0,
  jobsStats: {
    totalEarnings: 0,
    averageRating: 0,
    totalJobs: 0,
    clientSatisfaction: 0
  },
  
  selectedJob: null,
  jobDetailsLoading: false,

  // Reset jobs
  resetJobs: () => {
    set({
      completedJobs: [],
      jobsLoading: false,
      jobsError: null,
      jobsPage: 1,
      hasMoreJobs: true,
      jobsTotal: 0,
      jobsStats: {
        totalEarnings: 0,
        averageRating: 0,
        totalJobs: 0,
        clientSatisfaction: 0
      },
      selectedJob: null
    });
  },

  // Increment jobs page
  incrementJobsPage: () => {
    set(state => ({ jobsPage: state.jobsPage + 1 }));
  },

  // Fetch completed jobs for a user
  fetchUserCompletedJobs: async (userId) => {
    const { jobsPage, jobsLimit, completedJobs } = get();
    
    // Don't fetch if already loading
    if (get().jobsLoading) return;
    
    set({ jobsLoading: true, jobsError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${API_URL}/users/${userId}/completed-jobs?page=${jobsPage}&limit=${jobsLimit}`,
        { headers }
      );
      
      if (response.data.success) {
        const newJobs = response.data.data || [];
        const total = response.data.pagination?.total || newJobs.length;
        const stats = response.data.stats || {
          totalEarnings: 0,
          averageRating: 0,
          totalJobs: 0
        };
        
        // حساب نسبة رضا العملاء
        const clientSatisfaction = stats.totalJobs > 0 
          ? Math.round((stats.averageRating / 5) * 100) 
          : 0;
        
        const hasMore = jobsPage * jobsLimit < total;
        
        set({
          completedJobs: jobsPage === 1 ? newJobs : [...completedJobs, ...newJobs],
          jobsTotal: total,
          jobsStats: {
            totalEarnings: stats.totalEarnings || 0,
            averageRating: stats.averageRating || 0,
            totalJobs: stats.totalJobs || 0,
            clientSatisfaction
          },
          hasMoreJobs: hasMore,
          jobsLoading: false
        });
      } else {
        set({
          jobsError: response.data.message || 'Failed to fetch jobs',
          jobsLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      set({
        jobsError: error.response?.data?.message || error.message || 'Failed to fetch jobs',
        jobsLoading: false
      });
    }
  },

  // Fetch single job details
  fetchJobDetails: async (jobId) => {
    set({ jobDetailsLoading: true, jobsError: null });
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/jobs/${jobId}`, { headers });
      
      if (response.data.success) {
        set({
          selectedJob: response.data.data,
          jobDetailsLoading: false
        });
        return { success: true, data: response.data.data };
      } else {
        set({
          jobsError: response.data.message || 'Failed to fetch job details',
          jobDetailsLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      set({
        jobsError: error.response?.data?.message || error.message || 'Failed to fetch job details',
        jobDetailsLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Add a completed job (for when a job is marked as completed)
  addCompletedJob: (jobData) => {
    set(state => ({
      completedJobs: [jobData, ...state.completedJobs],
      jobsTotal: state.jobsTotal + 1,
      jobsStats: {
        ...state.jobsStats,
        totalJobs: state.jobsStats.totalJobs + 1,
        totalEarnings: state.jobsStats.totalEarnings + (jobData.budget || 0)
      }
    }));
  },

  // Update a job's review
  updateJobReview: (jobId, reviewData) => {
    set(state => {
      const updatedJobs = state.completedJobs.map(job => 
        job._id === jobId 
          ? { ...job, review: reviewData }
          : job
      );
      
      // إعادة حساب متوسط التقييم
      const jobsWithReviews = updatedJobs.filter(job => job.review);
      const totalRating = jobsWithReviews.reduce((sum, job) => sum + (job.review?.rating || 0), 0);
      const averageRating = jobsWithReviews.length > 0 ? totalRating / jobsWithReviews.length : 0;
      const clientSatisfaction = jobsWithReviews.length > 0 
        ? Math.round((averageRating / 5) * 100) 
        : 0;
      
      return {
        completedJobs: updatedJobs,
        jobsStats: {
          ...state.jobsStats,
          averageRating,
          clientSatisfaction
        }
      };
    });
  },

  // Clear selected job
  clearSelectedJob: () => {
    set({ selectedJob: null });
  },

  // Clear jobs error
  clearJobsError: () => {
    set({ jobsError: null });
  }
});