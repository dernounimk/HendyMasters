// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { Filter, X, Loader, PlusCircle, Briefcase } from 'lucide-react';
import PostCard from '../components/PostCard';

const Home = () => {
  const { t } = useTranslation();
  const { 
    user, 
    allPosts, 
    allPostsLoading, 
    hasMoreAllPosts,
    fetchAllPosts,
    resetAllPosts
  } = useStore();
  
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    location: '',
    minBudget: '',
    maxBudget: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  useEffect(() => {
    resetAllPosts();
    fetchAllPosts();
    
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 100 && !allPostsLoading && hasMoreAllPosts && !loadingMore) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const loadMore = async () => {
    setLoadingMore(true);
    await fetchAllPosts(filters, false);
    setLoadingMore(false);
  };
  
  const applyFilters = () => {
    resetAllPosts();
    fetchAllPosts(filters);
    setShowFilters(false);
  };
  
  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      location: '',
      minBudget: '',
      maxBudget: ''
    });
    resetAllPosts();
    fetchAllPosts();
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            آخر العروض
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>فلترة</span>
          </button>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="الموقع"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="الحد الأدنى للميزانية"
                value={filters.minBudget}
                onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="الحد الأقصى للميزانية"
                value={filters.maxBudget}
                onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              >
                <option value="">جميع الأنواع</option>
                <option value="service_request">طلبات خدمة</option>
                <option value="job_opportunity">فرص عمل</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                تطبيق
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                مسح الكل
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Posts Grid */}
      <div className="space-y-6">
        {allPosts.length === 0 && !allPostsLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد بوستات
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              كن أول من ينشر عرضاً!
            </p>
            {(user?.role === 'client' || user?.role === 'artisan') && (
              <Link
                to="/posts/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                أنشئ بوست جديد
              </Link>
            )}
          </div>
        ) : (
          <>
            {allPosts.map(post => (
              <PostCard key={post._id} post={post} showActions={true} />
            ))}
            
            {/* Loading Indicator */}
            {(allPostsLoading || loadingMore) && (
              <div className="flex justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            )}
            
            {/* No More Posts */}
            {!hasMoreAllPosts && allPosts.length > 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                لقد وصلت إلى نهاية القائمة
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;