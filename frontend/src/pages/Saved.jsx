// frontend/src/pages/Saved.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Bookmark, Loader, Search, RefreshCw
} from 'lucide-react';
import PostCard from '../components/PostCard';

const SavedSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
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
        toast.error('فشل في تحميل البوستات المحفوظة');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);
  
  const handleUnsave = (postId) => {
    setSavedPosts(prev => prev.filter(post => post._id !== postId));
    setTotal(prev => prev - 1);
    toast.success('تم إزالة البوست من المحفوظات');
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
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('saved.title') || 'المحفوظات'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {total} بوست محفوظ
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Saved Posts List */}
      <div className="space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <SavedSkeleton key={i} />
            ))}
          </>
        ) : savedPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد بوستات محفوظة
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              قم بحفظ البوستات التي تعجبك لتظهر هنا
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              استكشف البوستات
            </Link>
          </div>
        ) : (
          <>
            {savedPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard 
                  post={post} 
                  onSave={() => handleUnsave(post._id)}
                />
              </motion.div>
            ))}
            
            {loadingMore && (
              <div className="py-4 text-center">
                <Loader className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">جاري تحميل المزيد...</p>
              </div>
            )}
            
            {/* Sentinel for infinite scroll */}
            <div id="saved-sentinel" className="h-10" />
            
            {!hasMore && savedPosts.length > 0 && (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                لقد وصلت إلى نهاية القائمة ({total} بوست)
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Saved;