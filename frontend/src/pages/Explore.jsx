// frontend/src/pages/Search.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import {
  Search, User, Users, Loader2, MapPin, Star, Wrench,
  ArrowLeft, Check, Sparkles, X
} from 'lucide-react';

// استيراد الصورة الافتراضية
import defaultImgProfile from '../assets/images/default-avatar.png';

// إضافة CSS مخصص لصفحة البحث
const searchStyle = document.createElement('style');
searchStyle.textContent = `
  /* ==================== الوضع الفاتح ==================== */
  .search-glass-card {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(203, 213, 225, 0.5);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  }
  
  .search-input-wrapper {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(8px);
    border-radius: 20px;
    border: 1px solid rgba(203, 213, 225, 0.6);
    transition: all 0.3s ease;
  }
  
  .search-input-wrapper:focus-within {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .search-input {
    background: transparent !important;
    color: #000000 !important;
  }
  
  .search-input::placeholder {
    color: #9ca3af !important;
  }
  
  .search-result-item {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(203, 213, 225, 0.6);
    border-radius: 20px;
    transition: all 0.3s ease;
  }
  
  .search-result-item:hover {
    border-color: #2563eb !important;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 1) !important;
  }
  
  .search-empty-state {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(8px);
    border-radius: 28px;
    border: 1px solid rgba(203, 213, 225, 0.5);
  }
  
  /* ==================== الوضع المظلم ==================== */
  .dark .search-glass-card {
    background: rgba(17, 24, 39, 0.75) !important;
    border-color: rgba(75, 85, 99, 0.4);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  .dark .search-input-wrapper {
    background: rgba(31, 41, 55, 0.8) !important;
    border-color: rgba(75, 85, 99, 0.4);
  }
  
  .dark .search-input-wrapper:focus-within {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
  
  .dark .search-input {
    color: #ffffff !important;
  }
  
  .dark .search-result-item {
    background: rgba(31, 41, 55, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .dark .search-result-item:hover {
    background: rgba(31, 41, 55, 0.9) !important;
    border-color: #3b82f6 !important;
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
  }
  
  .dark .search-empty-state {
    background: rgba(31, 41, 55, 0.6) !important;
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  /* النصوص */
  .search-result-item * {
    color: #000000 !important;
  }
  
  .dark .search-result-item * {
    color: #ffffff !important;
  }
  
  .search-result-item .text-gray-500,
  .search-result-item .text-gray-400 {
    color: #6b7280 !important;
  }
  
  .dark .search-result-item .text-gray-500,
  .dark .search-result-item .text-gray-400 {
    color: #9ca3af !important;
  }
  
  /* ==================== تحسينات السكرول ==================== */
  .search-results-container {
    max-height: calc(100vh - 320px);
    min-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  /* تخصيص شريط السكرول */
  .search-results-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .search-results-container::-webkit-scrollbar-track {
    background: rgba(203, 213, 225, 0.2);
    border-radius: 10px;
  }
  
  .search-results-container::-webkit-scrollbar-thumb {
    background: rgba(37, 99, 235, 0.4);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  .search-results-container::-webkit-scrollbar-thumb:hover {
    background: rgba(37, 99, 235, 0.6);
  }
  
  /* للوضع المظلم */
  .dark .search-results-container::-webkit-scrollbar-track {
    background: rgba(75, 85, 99, 0.2);
  }
  
  .dark .search-results-container::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.4);
  }
  
  .dark .search-results-container::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.6);
  }
  
  /* إخفاء السكرول عندما لا تكون هناك حاجة له */
  .search-results-container::-webkit-scrollbar-thumb:vertical {
    min-height: 40px;
  }
  
  /* للـ Firefox */
  .search-results-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(37, 99, 235, 0.4) rgba(203, 213, 225, 0.2);
  }
  
  .dark .search-results-container {
    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(75, 85, 99, 0.2);
  }
  
  /* منع السكرول المزدوج */
  body {
    overflow-y: auto;
  }
  
  /* تحسين عرض البطاقات */
  .search-result-item {
    overflow: hidden;
  }
  
  /* تأثير التحميل */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-spin-slow {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(searchStyle);

// مكون نتيجة البحث
const SearchResultItem = ({ user, t, i18n }) => {
  const navigate = useNavigate();
  
  const handleVisitProfile = () => {
    navigate(`/profile/${user.username}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="search-result-item p-4 cursor-pointer group"
      onClick={handleVisitProfile}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={user.profileImage || defaultImgProfile}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-300 dark:border-blue-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImgProfile;
            }}
          />
          {user.isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {user.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              @{user.username}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <Wrench className="w-3.5 h-3.5 text-blue-500 ml-1" />
              <span>{user.craft}</span>
            </div>
            
            {user.rating > 0 && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <Star className="w-3.5 h-3.5 text-yellow-500 ml-1 fill-yellow-500" />
                <span>{user.rating}</span>
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <MapPin className="w-3.5 h-3.5 text-blue-500 ml-1" />
                <span className="truncate max-w-[120px]">{user.location}</span>
              </div>
            )}
          </div>
          
          {user.bio && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-1">
              {user.bio}
            </p>
          )}
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const Explore = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token, isAuthenticated, user: currentUser } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  
  // جلب التقييمات الحقيقية للمستخدم
  const fetchUserStats = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/stats`);
      if (response.data?.success && response.data?.data) {
        return {
          rating: response.data.data.rating || 0,
          completedJobs: response.data.data.completedJobs || 0
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching stats for user ${userId}:`, error);
      return null;
    }
  };
  
  // دالة البحث
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 Searching for:', query);
      
      const params = {
        search: query,
        limit: 20,
        page: 1
      };
      
      const response = await api.get('/users', { params });
      
      if (response.data?.success && response.data?.data) {
        // استبعاد المستخدم الحالي
        let users = response.data.data.filter(u => u._id !== currentUser?._id);
        
        // جلب إحصائيات لكل مستخدم
        const usersWithStats = await Promise.all(
          users.map(async (dbUser) => {
            const stats = await fetchUserStats(dbUser._id);
            
            let craft = t('roles.artisan');
            if (dbUser.professionalInfo?.craft) {
              craft = i18n.language === 'ar' 
                ? t(`crafts.${dbUser.professionalInfo.craft}`, dbUser.professionalInfo.craft.replace(/_/g, ' '))
                : dbUser.professionalInfo.craft.replace(/_/g, ' ');
            } else if (dbUser.role === 'client') {
              craft = t('roles.client');
            } else if (dbUser.role === 'worker') {
              craft = t('roles.worker');
            }
            
            const rating = stats?.rating || dbUser.stats?.rating || 0;
            
            return {
              _id: dbUser._id,
              name: dbUser.username,
              username: dbUser.username,
              profileImage: dbUser.profileImage,
              role: dbUser.role,
              craft: craft,
              location: dbUser.location || t('search.defaultLocation'),
              rating: parseFloat(rating).toFixed(1),
              isOnline: dbUser.isOnline || false,
              bio: dbUser.bio || ''
            };
          })
        );
        
        setResults(usersWithStats);
      }
    } catch (error) {
      console.error('❌ Error searching users:', error);
    } finally {
      setLoading(false);
    }
  }, [i18n.language, currentUser?._id, t]);
  
  // دالة البحث مع debounce
  const searchUsers = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  }, [performSearch]);
  
  // تنفيذ البحث عند تغيير النص
  useEffect(() => {
    if (searchQuery) {
      searchUsers(searchQuery);
    } else {
      setResults([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchUsers]);
  
  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };
  
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* Search Bar */}
        <div className="search-input-wrapper p-1">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className={`search-input w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl text-sm focus:outline-none`}
              autoFocus
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={clearSearch}
                className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Search Results */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="search-glass-card p-4"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t('search.results')} {results.length > 0 && `(${results.length})`}
              </span>
            </div>
            {loading && results.length === 0 && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs text-gray-400">{t('search.searching')}</span>
              </div>
            )}
          </div>
          
          {loading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                {t('search.searching')}
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results-container space-y-3 pr-2">
              <AnimatePresence>
                {results.map((user, index) => (
                  <SearchResultItem
                    key={user._id}
                    user={user}
                    t={t}
                    i18n={i18n}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="search-empty-state p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('search.noResults')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('search.noResultsQuery', { query: searchQuery })}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Empty State */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="search-glass-card p-12 text-center"
        >
          <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-14 h-14 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {t('search.empty.title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {t('search.empty.description')}
          </p>
          
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
              {t('search.empty.suggestions.searchArtisans')}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
              {t('search.empty.suggestions.connect')}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
              {t('search.empty.suggestions.viewReviews')}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Explore;