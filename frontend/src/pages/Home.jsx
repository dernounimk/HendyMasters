// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { Filter, X, Loader, PlusCircle, Briefcase, Sparkles, Home as HomeIcon } from 'lucide-react';
import PostCard from '../components/PostCard';

// إضافة CSS مخصص لصفحة الرئيسية
const homeStyle = document.createElement('style');
homeStyle.textContent = `
  /* ==================== الوضع الفاتح (جميع النصوص سوداء) ==================== */
  .home-glass-card {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(203, 213, 225, 0.5);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  }
  
  .home-filters-panel {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(12px);
    border-radius: 28px;
    border: 1px solid rgba(203, 213, 225, 0.6);
    transition: all 0.3s ease;
  }
  
  .home-filter-btn {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(203, 213, 225, 0.5);
    transition: all 0.3s ease;
  }
  
  .home-filter-btn:hover {
    background: rgba(255, 255, 255, 1) !important;
    border-color: #2563eb !important;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  }
  
  .home-input {
    background: rgba(243, 244, 246, 0.9) !important;
    border: 1px solid rgba(203, 213, 225, 0.5);
    border-radius: 16px;
    transition: all 0.3s ease;
    color: #000000 !important;
  }
  
  .home-input:focus {
    background: rgba(255, 255, 255, 1) !important;
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .home-input::placeholder {
    color: #9ca3af !important;
  }
  
  .home-select {
    background: rgba(243, 244, 246, 0.9) !important;
    border: 1px solid rgba(203, 213, 225, 0.5);
    border-radius: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
    color: #000000 !important;
  }
  
  .home-select:focus {
    background: rgba(255, 255, 255, 1) !important;
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .home-select option {
    color: #000000 !important;
    background: white !important;
  }
  
  .home-empty-state {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(8px);
    border-radius: 28px;
    border: 1px solid rgba(203, 213, 225, 0.5);
  }
  
  /* جميع النصوص في الوضع الفاتح - أسود */
  .home-glass-card h1,
  .home-glass-card h2,
  .home-glass-card h3,
  .home-glass-card p,
  .home-glass-card span,
  .home-glass-card label,
  .home-filters-panel h3,
  .home-filters-panel label,
  .home-filters-panel span,
  .home-empty-state h3,
  .home-empty-state p,
  .home-title {
    color: #000000 !important;
  }
  
  /* استثناء النصوص ذات الألوان الخاصة */
  .home-empty-state .text-gray-500,
  .home-empty-state .text-gray-400 {
    color: #6b7280 !important;
  }
  
  /* أيقونات الفلترة */
  .home-filter-btn span,
  .home-filter-btn svg {
    color: #000000 !important;
  }
  
  .home-filter-btn.text-blue-600 span,
  .home-filter-btn.text-blue-600 svg {
    color: #2563eb !important;
  }
  
  /* ==================== الوضع المظلم ==================== */
  .dark .home-glass-card {
    background: rgba(17, 24, 39, 0.75) !important;
    border-color: rgba(75, 85, 99, 0.4);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  .dark .home-filters-panel {
    background: rgba(31, 41, 55, 0.85) !important;
    border-color: rgba(75, 85, 99, 0.4);
  }
  
  .dark .home-filter-btn {
    background: rgba(31, 41, 55, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.4);
  }
  
  .dark .home-filter-btn span,
  .dark .home-filter-btn svg {
    color: #ffffff !important;
  }
  
  .dark .home-filter-btn:hover {
    background: rgba(31, 41, 55, 0.9) !important;
    border-color: #3b82f6 !important;
  }
  
  .dark .home-input {
    background: rgba(55, 65, 81, 0.8) !important;
    border-color: rgba(75, 85, 99, 0.5);
    color: #ffffff !important;
  }
  
  .dark .home-input:focus {
    background: rgba(55, 65, 81, 1) !important;
    border-color: #3b82f6 !important;
  }
  
  .dark .home-input::placeholder {
    color: #9ca3af !important;
  }
  
  .dark .home-select {
    background: rgba(55, 65, 81, 0.8) !important;
    border-color: rgba(75, 85, 99, 0.5);
    color: #ffffff !important;
  }
  
  .dark .home-select:focus {
    background: rgba(55, 65, 81, 1) !important;
    border-color: #3b82f6 !important;
  }
  
  .dark .home-select option {
    background: #1f2937 !important;
    color: #ffffff !important;
  }
  
  .dark .home-empty-state {
    background: rgba(31, 41, 55, 0.6) !important;
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  /* جميع النصوص في الوضع المظلم - بيضاء */
  .dark .home-glass-card h1,
  .dark .home-glass-card h2,
  .dark .home-glass-card h3,
  .dark .home-glass-card p,
  .dark .home-glass-card span,
  .dark .home-glass-card label,
  .dark .home-filters-panel h3,
  .dark .home-filters-panel label,
  .dark .home-filters-panel span,
  .dark .home-empty-state h3,
  .dark .home-empty-state p,
  .dark .home-title {
    color: #ffffff !important;
  }
  
  .dark .home-empty-state .text-gray-500,
  .dark .home-empty-state .text-gray-400 {
    color: #9ca3af !important;
  }
  
  /* ==================== سكرول مخصص ==================== */
  .home-scroll::-webkit-scrollbar {
    width: 6px;
  }
  
  .home-scroll::-webkit-scrollbar-track {
    background: rgba(203, 213, 225, 0.2);
    border-radius: 10px;
  }
  
  .home-scroll::-webkit-scrollbar-thumb {
    background: rgba(37, 99, 235, 0.4);
    border-radius: 10px;
  }
  
  .home-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(37, 99, 235, 0.6);
  }
  
  .dark .home-scroll::-webkit-scrollbar-track {
    background: rgba(75, 85, 99, 0.2);
  }
  
  .dark .home-scroll::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.4);
  }
`;
document.head.appendChild(homeStyle);

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
  
  const hasActiveFilters = filters.type || filters.location || filters.minBudget || filters.maxBudget;
  
  // التحقق مما إذا كان المستخدم يمكنه إنشاء بوست جديد
  const canCreatePost = user?.role === 'client' || user?.role === 'artisan' || user?.role === 'both';
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="home-title text-2xl font-bold">
                {t('home.title')}
              </h1>
              <p className="home-subtitle text-xs mt-0.5" style={{ color: '#6b7280' }}>
                {t('home.subtitle')}
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`home-filter-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              hasActiveFilters ? 'text-blue-600 border-blue-500' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{t('home.filter.button')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </motion.button>
        </div>
        
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="home-filters-panel mt-4 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: '#000000' }}>{t('home.filter.title')}</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: '#6b7280' }} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#4b5563' }}>
                    {t('home.filter.location')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('home.filter.locationPlaceholder')}
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="home-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#4b5563' }}>
                    {t('home.filter.postType')}
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="home-select w-full px-4 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="">{t('home.filter.allTypes')}</option>
                    <option value="service_request">{t('home.filter.serviceRequest')}</option>
                    <option value="job_opportunity">{t('home.filter.jobOpportunity')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#4b5563' }}>
                    {t('home.filter.minBudget')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('home.filter.budgetPlaceholder')}
                    value={filters.minBudget}
                    onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                    className="home-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#4b5563' }}>
                    {t('home.filter.maxBudget')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('home.filter.budgetPlaceholder')}
                    value={filters.maxBudget}
                    onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                    className="home-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
                >
                  {t('home.filter.apply')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  {t('home.filter.clearAll')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Posts Grid */}
      <div className="space-y-5">
        {allPosts.length === 0 && !allPostsLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="home-empty-state p-12 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-12 h-12 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#000000' }}>
              {t('home.empty.title')}
            </h3>
            <p className="mb-6" style={{ color: '#6b7280' }}>
              {t('home.empty.description')}
            </p>
            {canCreatePost && (
              <Link
                to="/posts/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                <PlusCircle className="w-5 h-5" />
                {t('home.empty.createPost')}
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {allPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard post={post} showActions={true} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading Indicator */}
            {(allPostsLoading || loadingMore) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-8"
              >
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="w-4 h-4 text-blue-600 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* No More Posts */}
            {!hasMoreAllPosts && allPosts.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-sm"
                style={{ color: '#6b7280' }}
              >
                {t('home.endOfList')}
              </motion.p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;