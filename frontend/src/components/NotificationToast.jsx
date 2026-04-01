// frontend/src/components/NotificationToast.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star, MessageCircle, UserPlus, Send, CheckCircle } from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

const NotificationToast = ({ notification, onClose }) => {
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
        return <UserPlus className="w-5 h-5 text-primary-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-3 w-80"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img
            src={notification.sender?.profileImage || defaultImgProfile}
            alt={notification.sender?.username}
            className="w-10 h-10 rounded-full object-cover"
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
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.createdAt).toLocaleTimeString('ar-DZ')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      
      {notification.relatedId && (
        <Link
          to={`/post/${notification.relatedId}`}
          className="block mt-2 text-xs text-primary-600 hover:text-primary-700 text-center pt-2 border-t border-gray-100"
          onClick={onClose}
        >
          عرض التفاصيل
        </Link>
      )}
    </motion.div>
  );
};

export default NotificationToast;