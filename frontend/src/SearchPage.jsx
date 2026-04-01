// pages/Search.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import debounce from 'lodash/debounce';
import {
  Search, User, Users, X, Loader2, Clock, TrendingUp,
  UserPlus, Check, MapPin, Briefcase, Star, Wrench,
  Sparkles, ArrowLeft
} from 'lucide-react';

// استيراد الصورة الافتراضية
import defaultImgProfile from '../assets/images/default-avatar.png';

// ترجمة المهن
const craftTranslations = {
  'electrician': 'كهربائي',
  'plumber': 'سباك',
  'carpenter': 'نجار',
  'painter': 'دهان',
  'mason': 'بناء',
  'mover': 'ناقل أثاث',
  'cleaner': 'منظف',
  'ac_technician': 'فني تكييف',
  'tiler': 'بلاط',
  'blacksmith': 'حداد',
  'gardener': 'بستاني',
  'handyman': 'عامل صيانة',
  'cabinet_maker': 'نجار موبيليا',
  'upholsterer': 'مفروشات',
  'glass_worker': 'عامل زجاج',
  'flooring_specialist': 'أرضيات',
  'facade_worker': 'واجهات',
  'roofer': 'أسقف',
  'kitchen_installer': 'مطابخ',
  'bathroom_installer': 'حمامات',
  'solar_installer': 'طاقة شمسية',
  'electronics_repair': 'إلكترونيات',
  'security_systems': 'أنظمة أمنية',
  'network_tech': 'شبكات',
  'satellite_installer': 'ستالايت',
  'cctv_installer': 'كاميرات',
  'smart_home_tech': 'منزل ذكي',
  'hvac_tech': 'تدفئة وتبريد',
  'elevator_tech': 'مصاعد',
  'pool_tech': 'مسابح',
  'gas_tech': 'غاز',
  'auto_electrician': 'كهربائي سيارات',
  'generator_tech': 'مولدات',
  'interior_designer': 'مصمم داخلي',
  'decorator': 'ديكور',
  'landscape_designer': 'تنسيق حدائق',
  'stone_cutter': 'قص حجر',
  'wood_carver': 'نحت خشب',
  'foundation_worker': 'أساسات',
  'steel_fixer': 'حديد تسليح',
  'plasterer': 'جبس',
  'window_installer': 'نوافذ',
  'door_installer': 'أبواب',
  'appliance_repair': 'أجهزة منزلية',
  'furniture_repair': 'أثاث',
  'pest_control': 'مكافحة حشرات',
  'water_tank_cleaner': 'تنظيف خزانات'
};

// مكون نتيجة البحث
const SearchResultItem = ({ user, isFollowing, onFollow, t }) => {
  const navigate = useNavigate();
  
  const handleVisitProfile = () => {
    navigate(`/profile/${user.username}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-gray-700"
      onClick={handleVisitProfile}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={user.profileImage || user.avatar || defaultImgProfile}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImgProfile;
            }}
          />
          {user.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {user.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              @{user.username}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <Wrench className="w-3 h-3 text-primary-500 ml-1" />
              <span>{user.craft}</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <Star className="w-3 h-3 text-yellow-500 ml-1" />
              <span>{user.rating}</span>
            </div>
            
            {user.location && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <MapPin className="w-3 h-3 text-primary-500 ml-1" />
                <span className="truncate max-w-[100px]">{user.location}</span>
              </div>
            )}
          </div>
          
          {user.bio && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {user.bio}
            </p>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollow(user._id);
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isFollowing
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
          }`}
        >
          {isFollowing ? (
            <>
              <Check className="w-3 h-3" />
              <span>{t('nav.following')}</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3" />
              <span>{t('nav.follow')}</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// مكون البحث السريع (نتائج فورية)
const QuickSearchResults = ({ results, onSelect, isOpen, onClose, t }) => {
  const resultsRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  if (!isOpen || results.length === 0) return null;
  
  return (
    <div
      ref={resultsRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
    >
      <div className="max-h-96 overflow-y-auto">
        {results.slice(0, 5).map((user) => (
          <div
            key={user._id}
            onClick={() => onSelect(user)}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <img
              src={user.profileImage || defaultImgProfile}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImgProfile;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.craft}
              </p>
            </div>
          </div>
        ))}
        {results.length > 5 && (
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              و {results.length - 5} نتيجة أخرى
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token, isAuthenticated, user: currentUser } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [followedUsers, setFollowedUsers] = useState({});
  const [showQuickResults, setShowQuickResults] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    craft: '',
    city: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const searchInputRef = useRef(null);
  
  // قائمة الحرف للفلتر
  const craftsList = [
    'كهربائي', 'سباك', 'نجار', 'دهان', 'بناء', 'منظف', 
    'فني تكييف', 'بلاط', 'حداد', 'بستاني', 'مصمم داخلي'
  ];
  
  // قائمة المدن
  const citiesList = [
    'الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'باتنة', 'بجاية'
  ];
  
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
  const searchUsers = useCallback(
    debounce(async (query) => {
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
          page: 1,
          ...(filters.role && { role: filters.role }),
          ...(filters.craft && { craft: Object.keys(craftTranslations).find(
            key => craftTranslations[key] === filters.craft
          ) }),
          ...(filters.city && { city: filters.city })
        };
        
        const response = await api.get('/users', { params });
        
        if (response.data?.success && response.data?.data) {
          // استبعاد المستخدم الحالي
          let users = response.data.data.filter(u => u._id !== currentUser?._id);
          
          // جلب إحصائيات لكل مستخدم
          const usersWithStats = await Promise.all(
            users.map(async (dbUser) => {
              const stats = await fetchUserStats(dbUser._id);
              
              let craft = 'حرفي';
              if (dbUser.professionalInfo?.craft) {
                craft = i18n.language === 'ar' 
                  ? craftTranslations[dbUser.professionalInfo.craft] || dbUser.professionalInfo.craft
                  : dbUser.professionalInfo.craft.replace(/_/g, ' ');
              } else if (dbUser.role === 'client') {
                craft = 'عميل';
              }
              
              const rating = stats?.rating || dbUser.stats?.rating || 0;
              const completedJobs = stats?.completedJobs || dbUser.stats?.completedJobs || 0;
              
              return {
                _id: dbUser._id,
                name: dbUser.username,
                username: dbUser.username,
                profileImage: dbUser.profileImage,
                role: dbUser.role,
                craft: craft,
                location: dbUser.location || 'الجزائر',
                rating: parseFloat(rating).toFixed(1),
                completedJobs: completedJobs,
                isOnline: dbUser.isOnline || false,
                bio: dbUser.bio || ''
              };
            })
          );
          
          setResults(usersWithStats);
          
          // حفظ البحث في السجل
          if (query.trim() && !recentSearches.includes(query.trim())) {
            setRecentSearches(prev => [query.trim(), ...prev].slice(0, 10));
            localStorage.setItem('recent_searches', JSON.stringify([query.trim(), ...recentSearches].slice(0, 10)));
          }
        }
      } catch (error) {
        console.error('❌ Error searching users:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [filters, i18n.language, currentUser?._id]
  );
  
  // تحميل السجلات المحفوظة
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // عمليات بحث مقترحة
    setTrendingSearches(['كهربائي', 'سباك', 'نجار', 'دهان', 'بناء']);
  }, []);
  
  // تنفيذ البحث عند تغيير النص
  useEffect(() => {
    if (searchQuery) {
      searchUsers(searchQuery);
      setShowQuickResults(true);
    } else {
      setResults([]);
      setShowQuickResults(false);
    }
  }, [searchQuery, searchUsers]);
  
  const handleFollow = async (userId) => {
    try {
      setFollowedUsers(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
      
      await api.post(`/users/${userId}/follow`);
    } catch (error) {
      console.error('Error following user:', error);
      setFollowedUsers(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    searchInputRef.current?.focus();
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };
  
  const applyFilters = () => {
    setShowFilters(false);
    if (searchQuery) {
      searchUsers(searchQuery);
    }
  };
  
  const resetFilters = () => {
    setFilters({ role: '', craft: '', city: '' });
    if (searchQuery) {
      searchUsers(searchQuery);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t('common.back')}</span>
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('nav.search')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          ابحث عن مستخدمين، حرفيين، أو عاملين
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowQuickResults(true)}
            placeholder={t('nav.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Quick Results Dropdown */}
        <QuickSearchResults
          results={results}
          onSelect={(user) => navigate(`/profile/${user.username}`)}
          isOpen={showQuickResults && searchQuery.length > 0}
          onClose={() => setShowQuickResults(false)}
          t={t}
        />
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{t('nav.filters')}</span>
          </button>
          
          {(filters.role || filters.craft || filters.city) && (
            <button
              onClick={resetFilters}
              className="text-sm text-red-500 hover:text-red-600"
            >
              {t('common.clear')}
            </button>
          )}
        </div>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="p-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm"
                >
                  <option value="">كل الأدوار</option>
                  <option value="artisan">حرفي</option>
                  <option value="worker">عامل</option>
                  <option value="client">عميل</option>
                </select>
                
                <select
                  value={filters.craft}
                  onChange={(e) => setFilters({ ...filters, craft: e.target.value })}
                  className="p-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm"
                >
                  <option value="">كل الحرف</option>
                  {craftsList.map(craft => (
                    <option key={craft} value={craft}>{craft}</option>
                  ))}
                </select>
                
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="p-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm"
                >
                  <option value="">كل المدن</option>
                  {citiesList.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={applyFilters}
                className="mt-3 w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                {t('common.apply')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Recent Searches */}
      {!searchQuery && recentSearches.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('nav.recentSearches')}
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-red-500 hover:text-red-600"
            >
              {t('common.clearAll')}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((query, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(query)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Trending Searches */}
      {!searchQuery && trendingSearches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            {t('nav.trending')}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((query, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(query)}
                className="px-3 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full text-sm text-primary-700 dark:text-primary-400 hover:from-primary-100 hover:to-primary-200 transition-colors"
              >
                <Sparkles className="w-3 h-3 inline ml-1" />
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Search Results */}
      {searchQuery && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('nav.results')} ({results.length})
            </h3>
            {loading && (
              <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
            )}
          </div>
          
          {loading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.searching')}
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {results.map((user) => (
                  <SearchResultItem
                    key={user._id}
                    user={user}
                    isFollowing={followedUsers[user._id]}
                    onFollow={handleFollow}
                    t={t}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('search.noResults')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('search.tryDifferent')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;