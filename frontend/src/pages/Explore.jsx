// pages/Search.jsx - نسخة مبسطة
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import {
  Search, User, Users, X, Loader2, MapPin, Star, Wrench,
  ArrowLeft, UserPlus, Check
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
const SearchResultItem = ({ user, t }) => {
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
            src={user.profileImage || defaultImgProfile}
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
          
          <div className="flex items-center gap-3 mt-1 flex-wrap">
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
      limit: 3,  // تغيير من 20 إلى 3
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
          
          let craft = 'حرفي';
          if (dbUser.professionalInfo?.craft) {
            craft = i18n.language === 'ar' 
              ? craftTranslations[dbUser.professionalInfo.craft] || dbUser.professionalInfo.craft
              : dbUser.professionalInfo.craft.replace(/_/g, ' ');
          } else if (dbUser.role === 'client') {
            craft = 'عميل';
          }
          
          const rating = stats?.rating || dbUser.stats?.rating || 0;
          
          return {
            _id: dbUser._id,
            name: dbUser.username,
            username: dbUser.username,
            profileImage: dbUser.profileImage,
            role: dbUser.role,
            craft: craft,
            location: dbUser.location || 'الجزائر',
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
}, [i18n.language, currentUser?._id]);
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
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المستخدم..."
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
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
      </div>
      
      {/* Search Results */}
      {searchQuery && (
        <div>
          <div className="flex items-center justify-between mb-4">
            {loading && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                <span className="text-xs text-gray-500">جاري البحث...</span>
              </div>
            )}
          </div>
          
          {loading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                جاري البحث...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {results.map((user) => (
                  <SearchResultItem
                    key={user._id}
                    user={user}
                    t={t}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                لم نجد أي مستخدمين باسم "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Empty State */}
      {!searchQuery && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ابحث عن مستخدمين
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            اكتب اسم المستخدم الذي تبحث عنه في شريط البحث
          </p>
        </div>
      )}
    </div>
  );
};

export default Explore;