// frontend/src/pages/Notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';
import {
  Bell, Heart, Bookmark, Share2, Star,
  Trash2, CheckCheck, Loader,
  Clock, MoreHorizontal
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

const NotificationSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-3 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  
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

  const getBackgroundColor = () => {
    if (notification.read) {
      return 'bg-white dark:bg-gray-800';
    }
    return 'bg-primary-50 dark:bg-primary-900/20';
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
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-DZ');
  };
  
  return (
    <div 
      className={`${getBackgroundColor()} rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer relative group`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={notification.sender?.profileImage || defaultImgProfile}
            alt={notification.sender?.username}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800"
            onError={(e) => { e.target.src = defaultImgProfile; }}
          />
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
            {getIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white">
                <span className="font-semibold">{notification.sender?.username}</span>
                <span className="text-gray-600 dark:text-gray-400"> {notification.title}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{formatTime(notification.createdAt)}</span>
                
                {!notification.read && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                )}
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  {!notification.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification._id); setShowActions(false); }}
                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg flex items-center gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      تعليم كمقروء
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(notification._id); setShowActions(false); }}
                    className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
      toast.error('فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev => prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success('تم تعليم الإشعار كمقروء');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('فشل في تعليم الإشعار كمقروء');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      toast('لا توجد إشعارات غير مقروءة');
      return;
    }
    
    setMarkingAll(true);
    try {
      const response = await api.put('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
        toast.success('تم تعليم جميع الإشعارات كمقروءة');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('فشل في تعليم الإشعارات كمقروءة');
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
        toast.success('تم حذف الإشعار');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('فشل في حذف الإشعار');
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
  }, [isAuthenticated]);
  
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('notifications.title')}
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {unreadCount} إشعار غير مقروء
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
            >
              <option value="all">جميع الإشعارات</option>
              <option value="unread">غير المقروءة</option>
            </select>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {markingAll ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                تعليم الكل كمقروء
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map(i => (
              <NotificationSkeleton key={i} />
            ))}
          </>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'لا توجد إشعارات' : 'لا توجد إشعارات غير مقروءة'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? 'ستظهر الإشعارات هنا عندما يتفاعل معك أحدهم'
                : 'ليس لديك إشعارات غير مقروءة حالياً'}
            </p>
          </div>
        ) : (
          <>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
            
            {loadingMore && (
              <div className="py-4 text-center">
                <Loader className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
              </div>
            )}
            
            <div id="notifications-sentinel" className="h-10" />
            
            {!hasMore && notifications.length > 0 && (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                لقد وصلت إلى نهاية الإشعارات
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;