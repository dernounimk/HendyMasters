import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

// Mock data for saved posts
const fetchSavedPosts = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 1,
      content: 'تعلم كيفية صناعة الفخار في المنزل - دليل خطوة بخطوة للمبتدئين',
      images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?ixlib=rb-4.0.3'],
      likes: 345,
      comments: 67,
      savedAt: new Date(2024, 0, 10, 14, 30),
      user: {
        id: 2,
        name: 'فاطمة علي',
        username: '@fatima_pottery',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3',
        specialty: 'فخار'
      }
    },
    {
      id: 3,
      content: 'أفكار مبتكرة لإعادة تدوير الخشب وتحويله إلى تحف فنية',
      images: [
        'https://images.unsplash.com/photo-1615528679110-3b157d1a3f47?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1581539250439-c96689b516dd?ixlib=rb-4.0.3'
      ],
      likes: 892,
      comments: 134,
      savedAt: new Date(2024, 0, 8, 9, 15),
      user: {
        id: 3,
        name: 'محمد حسن',
        username: '@mohamed_wood',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3',
        specialty: 'أعمال خشبية'
      }
    }
  ];
};

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['savedPosts'],
    queryFn: fetchSavedPosts,
    onSuccess: (data) => setSavedPosts(data)
  });

  const handleRemoveFromSaved = (postId) => {
    setSavedPosts(prev => prev.filter(post => post.id !== postId));
    toast.success('تم إزالة المنشور من المحفوظات');
  };

  const handleBulkRemove = () => {
    setSavedPosts(prev => prev.filter(post => !selectedPosts.has(post.id)));
    toast.success(`تم إزالة ${selectedPosts.size} منشورات من المحفوظات`);
    setSelectedPosts(new Set());
    setIsSelectionMode(false);
  };

  const toggleSelectPost = (postId) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedPosts(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            المحفوظات
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {savedPosts.length} منشور محفوظ
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {savedPosts.length > 0 && (
            <button
              onClick={toggleSelectionMode}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isSelectionMode
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {isSelectionMode ? 'إلغاء التحديد' : 'تحديد'}
            </button>
          )}
          
          {isSelectionMode && selectedPosts.size > 0 && (
            <button
              onClick={handleBulkRemove}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              حذف المحدد ({selectedPosts.size})
            </button>
          )}
        </div>
      </div>

      {savedPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <BookmarkOutlineIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            لا توجد منشورات محفوظة
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            قم بحفظ المنشورات التي تعجبك لتجدها لاحقاً
          </p>
          <Link to="/" className="btn-primary inline-block">
            استعرض المنشورات
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${
                isSelectionMode && selectedPosts.has(post.id) ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {isSelectionMode && (
                <div className="absolute top-2 right-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPosts.has(post.id)}
                    onChange={() => toggleSelectPost(post.id)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </div>
              )}

              <Link to={`/posts/${post.id}`}>
                {post.images && post.images.length > 0 && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.images[0]}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {post.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        +{post.images.length - 1}
                      </span>
                    )}
                  </div>
                )}
              </Link>

              <div className="p-4">
                {/* User Info */}
                <Link to={`/profile/${post.user.id}`} className="flex items-center space-x-2 mb-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {post.user.specialty}
                    </p>
                  </div>
                </Link>

                {/* Content */}
                <Link to={`/posts/${post.id}`}>
                  <p className="text-gray-800 dark:text-gray-200 mb-3 line-clamp-2">
                    {post.content}
                  </p>
                </Link>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <HeartIcon className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </span>
                  </div>
                  <span>
                    تم الحفظ {formatDistanceToNow(post.savedAt, { addSuffix: true, locale: ar })}
                  </span>
                </div>

                {/* Actions */}
                {!isSelectionMode && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="text-gray-600 hover:text-primary-600 dark:text-gray-400">
                      <HeartIcon className="w-5 h-5" />
                    </button>
                    <button className="text-gray-600 hover:text-primary-600 dark:text-gray-400">
                      <ChatBubbleLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromSaved(post.id)}
                      className="text-gray-600 hover:text-red-600 dark:text-gray-400"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button className="text-gray-600 hover:text-primary-600 dark:text-gray-400">
                      <BookmarkSolidIcon className="w-5 h-5 text-primary-600" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPosts;