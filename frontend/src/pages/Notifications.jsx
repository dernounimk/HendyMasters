import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  BellIcon,
  CheckCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

// Mock notifications data
const fetchNotifications = () => {
  return [
    {
      id: 1,
      type: 'like',
      read: false,
      user: {
        id: 2,
        name: 'فاطمة علي',
        username: '@fatima_pottery',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3'
      },
      post: {
        id: 123,
        content: 'تعلم صناعة الفخار...'
      },
      createdAt: new Date(2024, 0, 15, 10, 30)
    },
    {
      id: 2,
      type: 'comment',
      read: false,
      user: {
        id: 3,
        name: 'محمد حسن',
        username: '@mohamed_wood',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3'
      },
      post: {
        id: 456,
        content: 'مشروع خشبي جديد...'
      },
      comment: 'عمل رائع! استمر',
      createdAt: new Date(2024, 0, 14, 15, 45)
    },
    {
      id: 3,
      type: 'follow',
      read: true,
      user: {
        id: 4,
        name: 'سارة أحمد',
        username: '@sara_art',
        avatar: 'https://images.unsplash.com/photo-1494790108777-223fd4f5609d?ixlib=rb-4.0.3'
      },
      createdAt: new Date(2024, 0, 13, 9, 15)
    },
    {
      id: 4,
      type: 'like',
      read: true,
      user: {
        id: 5,
        name: 'خالد العمري',
        username: '@khalid_artisan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3'
      },
      post: {
        id: 789,
        content: 'أعمال يدوية جديدة...'
      },
      createdAt: new Date(2024, 0, 12, 18, 20)
    }
  ];
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(fetchNotifications());
  const [filter, setFilter] = useState('all'); // all, unread
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success('تم تحديد الكل كمقروء');
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('تم حذف الإشعار');
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  );

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'like':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlusIcon className="w-5 h-5 text-green-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification) => {
    switch(notification.type) {
      case 'like':
        return (
          <>
            <span className="font-semibold">{notification.user.name}</span>
            {' أعجب بمنشورك '}
            <span className="text-gray-600 dark:text-gray-400">
              "{notification.post.content.substring(0, 30)}..."
            </span>
          </>
        );
      case 'comment':
        return (
          <>
            <span className="font-semibold">{notification.user.name}</span>
            {' علق على منشورك: '}
            <span className="text-gray-600 dark:text-gray-400">
              "{notification.comment}"
            </span>
          </>
        );
      case 'follow':
        return (
          <>
            <span className="font-semibold">{notification.user.name}</span>
            {' بدأ متابعتك'}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BellIconSolid className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            الإشعارات
          </h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount} جديد
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">الكل</option>
            <option value="unread">غير مقروء</option>
          </select>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              تحديد الكل كمقروء
            </button>
          )}

          <Link
            to="/settings/notifications"
            className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:text-gray-400"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <BellIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            لا توجد إشعارات
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'unread' 
              ? 'ليس لديك إشعارات غير مقروءة' 
              : 'سوف تظهر هنا الإشعارات الجديدة'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-r-4 border-primary-500' : ''
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Link to={`/profile/${notification.user.id}`}>
                      <img
                        src={notification.user.avatar}
                        alt={notification.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-gray-800 dark:text-gray-200">
                          {getNotificationText(notification)}
                        </p>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <CheckCircleIcon className="w-4 h-4 text-primary-500" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <span className="sr-only">حذف</span>
                            ×
                          </button>
                        </div>
                      </div>

                      {/* Time */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(notification.createdAt, { 
                          addSuffix: true, 
                          locale: ar 
                        })}
                      </p>
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Preview for post */}
                  {notification.type !== 'follow' && notification.post && (
                    <Link 
                      to={`/posts/${notification.post.id}`}
                      className="block mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {notification.post.content}
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Load More */}
      {filteredNotifications.length >= 10 && (
        <div className="text-center mt-6">
          <button className="btn-outline">
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;