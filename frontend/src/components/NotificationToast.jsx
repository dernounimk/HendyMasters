// frontend/src/components/NotificationToast.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Star, MessageCircle, UserPlus, Send, CheckCircle, XCircle } from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

const NotificationToast = ({ notification, onClose }) => {
  const { t, i18n } = useTranslation();
  
  const getIcon = () => {
    switch(notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'save':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'proposal':
        return <Send className="w-5 h-5 text-green-500" />;
      case 'proposal_accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <UserPlus className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor((now - date) / 3600000);
    const isRTL = i18n.language === 'ar';
    
    if (diffMins < 1) return t('notifications.time.justNow');
    if (diffMins < 60) return t('notifications.time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('notifications.time.hoursAgo', { count: diffHours });
    return date.toLocaleTimeString(isRTL ? 'ar-DZ' : 'en-US');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 mb-3 w-80"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img
            src={notification.sender?.profileImage || defaultImgProfile}
            alt={notification.sender?.username}
            className="w-10 h-10 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-600"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {notification.sender?.username}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatTime(notification.createdAt)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      
      {notification.relatedId && (
        <Link
          to={`/post/${notification.relatedId}`}
          className="block mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-center pt-2 border-t border-gray-100 dark:border-gray-700 transition-colors rounded-lg py-1"
          onClick={onClose}
        >
          {t('notifications.actions.viewDetails')}
        </Link>
      )}
    </motion.div>
  );
};

export default NotificationToast;