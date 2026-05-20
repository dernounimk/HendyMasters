// frontend/src/pages/Notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';
import {
  Bell, Heart, Bookmark, Share2, Star,
  Trash2, CheckCheck, Loader,
  Clock, MoreHorizontal, ChevronLeft
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

// إضافة CSS مخصص لصفحة الإشعارات
const notificationsStyle = document.createElement('style');
notificationsStyle.textContent = `
  /* ==================== الوضع الفاتح (الألوان الداكنة) ==================== */
  .notifications-glass-card {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(203, 213, 225, 0.5);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  }
  
  /* عنصر الإشعار في الوضع الفاتح */
  .notifications-glass-item {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(203, 213, 225, 0.6);
    transition: all 0.3s ease;
  }
  
  .notifications-glass-item:hover {
    border-color: #2563eb !important;
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.98) !important;
  }
  
  /* الإشعارات غير المقروءة في الوضع الفاتح */
  .notifications-unread {
    background: rgba(59, 130, 246, 0.08) !important;
    border-left: 3px solid #2563eb !important;
  }
  
  .notifications-unread:hover {
    background: rgba(59, 130, 246, 0.12) !important;
  }
  
  /* جميع النصوص في الوضع الفاتح - أسود */
  .notifications-glass-card,
  .notifications-glass-card *,
  .notifications-glass-item,
  .notifications-glass-item * {
    color: #000000 !important;
  }
  
  /* استثناء الأيقونات الملونة */
  .notifications-glass-item .text-red-500,
  .notifications-glass-item .text-yellow-500,
  .notifications-glass-item .text-green-500,
  .notifications-glass-item .text-blue-500,
  .notifications-glass-item .text-gray-400,
  .notifications-glass-item .text-gray-500,
  .notifications-glass-item .text-gray-600 {
    color: inherit !important;
  }
  
  /* أيقونات الحالة المختلفة - تحافظ على ألوانها */
  .notifications-glass-item svg.text-red-500 {
    color: #ef4444 !important;
  }
  
  .notifications-glass-item svg.text-yellow-500 {
    color: #eab308 !important;
  }
  
  .notifications-glass-item svg.text-green-500 {
    color: #22c55e !important;
  }
  
  .notifications-glass-item svg.text-blue-500 {
    color: #3b82f6 !important;
  }
  
  /* النصوص العادية */
  .notifications-glass-card h1,
  .notifications-glass-card h2,
  .notifications-glass-card h3,
  .notifications-glass-card p,
  .notifications-glass-card span,
  .notifications-glass-card label,
  .notifications-glass-item p,
  .notifications-glass-item span,
  .notifications-glass-item .text-gray-400,
  .notifications-glass-item .text-gray-500,
  .notifications-glass-item .text-gray-600 {
    color: #000000 !important;
  }
  
  /* الروابط وأسماء المستخدمين */
  .notifications-glass-item a,
  .notifications-glass-item .font-semibold {
    color: #000000 !important;
  }
  
  .notifications-glass-item a:hover,
  .notifications-glass-item .font-semibold:hover {
    color: #2563eb !important;
  }
  
  /* الوقت والنصوص الثانوية */
  .notifications-glass-item .text-xs,
  .notifications-glass-item .clock-text {
    color: #4b5563 !important;
  }
  
  /* ==================== الوضع المظلم ==================== */
  .dark .notifications-glass-card {
    background: rgba(17, 24, 39, 0.75) !important;
    border-color: rgba(75, 85, 99, 0.4);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  .dark .notifications-glass-item {
    background: rgba(31, 41, 55, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .dark .notifications-glass-item:hover {
    border-color: #3b82f6 !important;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
    background: rgba(31, 41, 55, 0.85) !important;
  }
  
  .dark .notifications-unread {
    background: rgba(59, 130, 246, 0.15) !important;
    border-left: 3px solid #3b82f6 !important;
  }
  
  .dark .notifications-unread:hover {
    background: rgba(59, 130, 246, 0.2) !important;
  }
  
  /* النصوص في الوضع المظلم - بيضاء */
  .dark .notifications-glass-card,
  .dark .notifications-glass-card *,
  .dark .notifications-glass-item,
  .dark .notifications-glass-item * {
    color: #ffffff !important;
  }
  
  .dark .notifications-glass-item .text-xs,
  .dark .notifications-glass-item .clock-text {
    color: #9ca3af !important;
  }
  
  /* ==================== الفلتر ==================== */
  .notifications-filter-select {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(37, 99, 235, 0.3) !important;
    transition: all 0.3s ease;
    color: #000000 !important;
  }
  
  .notifications-filter-select:hover {
    border-color: #2563eb !important;
    background: rgba(255, 255, 255, 0.95) !important;
  }
  
  .dark .notifications-filter-select {
    background: rgba(31, 41, 55, 0.7) !important;
    border-color: rgba(59, 130, 246, 0.3) !important;
    color: #ffffff !important;
  }
  
  .dark .notifications-filter-select:hover {
    border-color: #3b82f6 !important;
    background: rgba(31, 41, 55, 0.85) !important;
  }
  
  .notifications-filter-select option {
    background: white !important;
    color: #000000 !important;
  }
  
  .dark .notifications-filter-select option {
    background: #1f2937 !important;
    color: #ffffff !important;
  }
  
  /* ==================== سكيلتون ==================== */
  .notifications-skeleton {
    background: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(4px);
  }
  
  .dark .notifications-skeleton {
    background: rgba(31, 41, 55, 0.5) !important;
  }
  
  /* ==================== أزرار القائمة المنسدلة ==================== */
  .dark .notifications-glass-item button span {
    color: #ffffff !important;
  }
`;
document.head.appendChild(notificationsStyle);

const NotificationSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="notifications-skeleton rounded-xl p-4 animate-pulse border border-gray-200/50 dark:border-gray-700/30">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-300/70 dark:bg-gray-600/50"></div>
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-300/70 dark:bg-gray-600/50 rounded mb-2"></div>
          <div className="h-3 w-48 bg-gray-300/70 dark:bg-gray-600/50 rounded"></div>
        </div>
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isRTL = i18n.language === 'ar';
  
  const getIcon = () => {
    switch(notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'save':
        return <Bookmark className="w-5 h-5 text-yellow-500" />;
      case 'share':
        return <Share2 className="w-5 h-5 text-green-500" />;
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getItemClass = () => {
    if (notification.read) {
      return 'notifications-glass-item';
    }
    return 'notifications-glass-item notifications-unread';
  };
  
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
    
    if (notification.relatedId && notification.relatedModel === 'Post') {
      navigate(`/post/${notification.relatedId}`);
    } else if (notification.relatedId && notification.relatedModel === 'Review') {
      navigate(`/profile/${notification.sender?.username}`);
    } else if (notification.sender) {
      navigate(`/profile/${notification.sender.username}`);
    }
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor((now - date) / 3600000);
    const diffDays = Math.floor((now - date) / 86400000);
    
    if (diffMins < 1) return t('notifications.time.justNow');
    if (diffMins < 60) return t('notifications.time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('notifications.time.hoursAgo', { count: diffHours });
    if (diffDays === 1) return t('notifications.time.yesterday');
    if (diffDays < 7) return t('notifications.time.daysAgo', { count: diffDays });
    return date.toLocaleDateString(isRTL ? 'ar-DZ' : 'en-US');
  };
  
  return (
    <motion.div 
      className={`${getItemClass()} rounded-xl p-4 cursor-pointer relative group`}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={notification.sender?.profileImage || defaultImgProfile}
            alt={notification.sender?.username}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
            onError={(e) => { e.target.src = defaultImgProfile; }}
          />
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-md">
            {getIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-base">
                <span className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {notification.sender?.username}
                </span>
                <span> {notification.title}</span>
              </p>
              <p className="text-sm mt-1 opacity-80">
                {notification.message}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3 h-3 opacity-60" />
                <span className="text-xs opacity-60">{formatTime(notification.createdAt)}</span>
                
                {!notification.read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {(isHovered || showActions) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
                    className="p-1.5 opacity-60 hover:opacity-100 rounded-lg transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden`}
                      >
                        {!notification.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification._id); setShowActions(false); }}
                            className="w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCheck className="w-4 h-4 text-green-500" />
                            <span>{t('notifications.actions.markAsRead')}</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(notification._id); setShowActions(false); }}
                          className="w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{t('notifications.actions.delete')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Notifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);
  
  const fetchNotifications = useCallback(async (reset = true) => {
    const currentPage = reset ? 1 : page + 1;
    
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await api.get('/notifications', {
        params: { page: currentPage, limit: 20 }
      });
      
      if (response.data.success) {
        const newNotifications = response.data.data.notifications;
        const newUnreadCount = response.data.data.unreadCount;
        
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setUnreadCount(newUnreadCount);
        setHasMore(response.data.data.hasMore);
        
        if (!reset && newNotifications.length > 0) {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(t('notifications.errors.fetchFailed'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, t]);
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev => prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success(t('notifications.toasts.markedAsRead'));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error(t('notifications.errors.markAsReadFailed'));
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      toast(t('notifications.toasts.noUnread'));
      return;
    }
    
    setMarkingAll(true);
    try {
      const response = await api.put('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
        toast.success(t('notifications.toasts.allMarkedAsRead'));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(t('notifications.errors.markAllFailed'));
    } finally {
      setMarkingAll(false);
    }
  };
  
  const handleDelete = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        const deletedNotification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success(t('notifications.toasts.deleted'));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(t('notifications.errors.deleteFailed'));
    }
  };
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);
  
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchNotifications(false);
        }
      },
      { threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('notifications-sentinel');
    if (sentinel) observer.observe(sentinel);
    
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, loading, loadingMore, fetchNotifications]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(true);
    }
  }, [isAuthenticated, fetchNotifications]);
  
  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.success(notification.title);
    };
    
    socketService.on('notification:new', handleNewNotification);
    
    return () => {
      socketService.off('notification:new', handleNewNotification);
    };
  }, []);
  
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* الرأس */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="notifications-glass-card p-5 mb-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {t('notifications.title')}
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
                  {t('notifications.unreadCount', { count: unreadCount })}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="notifications-filter-select px-4 py-2 rounded-xl text-sm font-medium cursor-pointer focus:outline-none"
            >
              <option value="all">{t('notifications.filter.all')}</option>
              <option value="unread">{t('notifications.filter.unread')}</option>
            </select>
            
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                {markingAll ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                {t('notifications.markAllAsRead')}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* قائمة الإشعارات */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[1, 2, 3, 4, 5].map(i => (
                <NotificationSkeleton key={i} />
              ))}
            </motion.div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="notifications-glass-card p-12 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Bell className="w-12 h-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {filter === 'all' ? t('notifications.empty.noNotifications') : t('notifications.empty.noUnread')}
              </h3>
              <p className="opacity-70">
                {filter === 'all' 
                  ? t('notifications.empty.description')
                  : t('notifications.empty.noUnreadDescription')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
              
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-6 text-center"
                >
                  <div className="relative inline-block">
                    <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm mt-3 opacity-70">{t('notifications.loadingMore')}</p>
                </motion.div>
              )}
              
              <div id="notifications-sentinel" className="h-10" />
              
              {!hasMore && notifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-6 text-center"
                >
                  <p className="text-sm opacity-60">
                    {t('notifications.endOfList')}
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

export default Notifications;