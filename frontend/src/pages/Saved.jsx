// frontend/src/pages/Saved.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Bookmark, Loader, Search, RefreshCw, ArrowLeft
} from 'lucide-react';
import PostCard from '../components/PostCard';

// إضافة CSS مخصص بنفس نمط MainLayout
const savedStyle = document.createElement('style');
savedStyle.textContent = `
  /* ==================== الوضع الفاتح (الألوان الداكنة) ==================== */
  .saved-glass-card {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  /* النصوص الرئيسية في الوضع الفاتح - أسود */
  .saved-glass-card h1,
  .saved-glass-card h2,
  .saved-glass-card h3,
  .saved-glass-card .title-text,
  .saved-glass-card .font-bold,
  .saved-glass-card .font-semibold {
    color: #1f2937 !important;
  }
  
  /* النصوص العادية في الوضع الفاتح - رمادي غامق */
  .saved-glass-card p,
  .saved-glass-card span,
  .saved-glass-card label {
    color: #374151 !important;
  }
  
  /* النصوص الثانوية في الوضع الفاتح - رمادي */
  .saved-glass-card .text-gray-500,
  .saved-glass-card .text-gray-600,
  .saved-glass-card .text-sm:not(.font-bold) {
    color: #6b7280 !important;
  }
  
  /* الأيقونات في الوضع الفاتح */
  .saved-glass-card svg:not(.text-white):not(.text-yellow-500):not(.text-primary-500) {
    color: #4b5563 !important;
  }
  
  /* ==================== الوضع المظلم ==================== */
  .dark .saved-glass-card {
    background: rgba(17, 24, 39, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  /* النصوص الرئيسية في الوضع المظلم - أبيض */
  .dark .saved-glass-card h1,
  .dark .saved-glass-card h2,
  .dark .saved-glass-card h3,
  .dark .saved-glass-card .font-bold,
  .dark .saved-glass-card .font-semibold {
    color: #f3f4f6 !important;
  }
  
  /* النصوص العادية في الوضع المظلم - رمادي فاتح */
  .dark .saved-glass-card p,
  .dark .saved-glass-card span,
  .dark .saved-glass-card label {
    color: #d1d5db !important;
  }
  
  /* النصوص الثانوية في الوضع المظلم */
  .dark .saved-glass-card .text-gray-500,
  .dark .saved-glass-card .text-gray-600 {
    color: #9ca3af !important;
  }
  
  /* الأيقونات في الوضع المظلم */
  .dark .saved-glass-card svg:not(.text-white):not(.text-yellow-500):not(.text-primary-500) {
    color: #9ca3af !important;
  }
  
  /* ==================== تأثيرات hover ==================== */
  .saved-glass-card:hover {
    border-color: #2563eb !important;
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px);
  }
  
  .dark .saved-glass-card:hover {
    border-color: #3b82f6 !important;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
  }
  
  /* ==================== أزرار التحديث ==================== */
  .saved-refresh-btn {
    transition: all 0.3s ease;
  }
  
  .saved-refresh-btn:hover {
    transform: rotate(180deg);
    background: rgba(37, 99, 235, 0.1);
  }
  
  /* ==================== سكيلتون الشاشة ==================== */
  .saved-skeleton {
    background: rgba(255, 255, 255, 0.4) !important;
    backdrop-filter: blur(4px);
  }
  
  .dark .saved-skeleton {
    background: rgba(31, 41, 55, 0.4) !important;
  }
  
  /* ==================== إصلاح عنوان الصفحة ==================== */
  .saved-title {
    color: #1f2937 !important;
  }
  
  .dark .saved-title {
    color: #f3f4f6 !important;
  }
  
  .saved-subtitle {
    color: #6b7280 !important;
  }
  
  .dark .saved-subtitle {
    color: #9ca3af !important;
  }
`;
document.head.appendChild(savedStyle);

const SavedSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="saved-skeleton rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-3 w-5/6 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

const Saved = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedPosts = useCallback(async (reset = true, pageNum = 1) => {
    const currentPage = reset ? 1 : pageNum;
    
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await api.get('/posts/saved', {
        params: { page: currentPage, limit: 10 }
      });
      
      if (response.data.success) {
        const newPosts = response.data.posts || [];
        const pagination = response.data.pagination;
        
        if (reset) {
          setSavedPosts(newPosts);
        } else {
          setSavedPosts(prev => {
            const existingIds = new Set(prev.map(p => p._id));
            const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p._id));
            return [...prev, ...uniqueNewPosts];
          });
        }
        
        setTotal(pagination?.total || newPosts.length);
        setHasMore(pagination?.hasMore || (newPosts.length === 10 && newPosts.length > 0));
        
        if (!reset && newPosts.length > 0) {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      if (error.response?.status !== 404) {
        toast.error(t('saved.errors.fetchFailed'));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [t]);
  
  const handleUnsave = (postId) => {
    setSavedPosts(prev => prev.filter(post => post._id !== postId));
    setTotal(prev => prev - 1);
    toast.success(t('saved.messages.unsaved'));
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSavedPosts(true, 1);
  };
  
  // استخدام Intersection Observer للـ Infinite Scroll
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchSavedPosts(false, page + 1);
        }
      },
      { threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('saved-sentinel');
    if (sentinel) observer.observe(sentinel);
    
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, loading, loadingMore, page, fetchSavedPosts]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedPosts(true, 1);
    }
  }, [isAuthenticated, fetchSavedPosts]);
  
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="w-full">
      {/* Header - بنفس نمط Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bookmark className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold saved-title">
              {t('saved.title')}
            </h1>
            <p className="text-sm saved-subtitle">
              {total} {t('saved.postsCount')}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 disabled:opacity-50 shadow-md"
          title={t('common.refresh')}
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: '#4b5563' }} />
        </motion.button>
      </motion.div>
      
      {/* Saved Posts List */}
      <div className="space-y-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map(i => (
                <SavedSkeleton key={i} />
              ))}
            </motion.div>
          ) : savedPosts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="saved-glass-card p-12 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Bookmark className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold saved-title mb-2">
                {t('saved.empty.title')}
              </h3>
              <p className="mb-6 saved-subtitle">
                {t('saved.empty.description')}
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <Search className="w-5 h-5" />
                {t('saved.empty.exploreButton')}
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {savedPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PostCard 
                    post={post} 
                    onSave={() => handleUnsave(post._id)}
                  />
                </motion.div>
              ))}
              
              {/* Loading More Indicator */}
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="saved-glass-card py-6 text-center"
                >
                  <div className="relative inline-block">
                    <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm mt-3 saved-subtitle">{t('saved.loadingMore')}</p>
                </motion.div>
              )}
              
              {/* Sentinel for infinite scroll */}
              <div id="saved-sentinel" className="h-10" />
              
              {/* No More Posts */}
              {!hasMore && savedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-6 text-center"
                >
                  <p className="text-sm saved-subtitle">
                    🏁 {t('saved.endOfList', { total })}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Saved;