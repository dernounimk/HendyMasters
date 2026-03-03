import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid 
} from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Mock API function - replace with actual API call
const fetchPosts = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 1,
      content: 'أقدم لكم اليوم مجموعة من الأعمال اليدوية الجديدة التي قمت بتصميمها. كل قطعة مصنوعة يدوياً بمواد طبيعية 100%',
      images: [
        'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3',
      ],
      likes: 234,
      comments: 45,
      shares: 12,
      createdAt: new Date(2024, 0, 15, 10, 30),
      isLiked: false,
      isSaved: false,
      user: {
        id: 1,
        name: 'أحمد محمد',
        username: '@ahmed_artisan',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3',
        isArtisan: true,
        specialty: 'نجارة'
      }
    },
    {
      id: 2,
      content: 'ورشة عمل مجانية لتعليم أساسيات الفخار يوم السبت القادم. المكان محدود، سارع بالتسجيل!',
      images: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?ixlib=rb-4.0.3',
      ],
      likes: 567,
      comments: 89,
      shares: 234,
      createdAt: new Date(2024, 0, 14, 15, 45),
      isLiked: true,
      isSaved: true,
      user: {
        id: 2,
        name: 'فاطمة علي',
        username: '@fatima_pottery',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3',
        isArtisan: true,
        specialty: 'فخار'
      }
    },
    {
      id: 3,
      content: 'بعد شهر من العمل المتواصل، هذا هو مشروعي الجديد. رأيكم يهمني!',
      images: [
        'https://images.unsplash.com/photo-1615528679110-3b157d1a3f47?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1581539250439-c96689b516dd?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?ixlib=rb-4.0.3',
      ],
      likes: 1234,
      comments: 156,
      shares: 89,
      createdAt: new Date(2024, 0, 13, 9, 15),
      isLiked: false,
      isSaved: false,
      user: {
        id: 3,
        name: 'محمد حسن',
        username: '@mohamed_wood',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3',
        isArtisan: true,
        specialty: 'أعمال خشبية'
      }
    }
  ];
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    onSuccess: (data) => {
      setPosts(data);
      // Initialize liked and saved sets
      const liked = new Set(data.filter(p => p.isLiked).map(p => p.id));
      const saved = new Set(data.filter(p => p.isSaved).map(p => p.id));
      setLikedPosts(liked);
      setSavedPosts(saved);
    }
  });

  const handleLike = (postId) => {
    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast.success('تم إزالة الإعجاب');
      } else {
        newSet.add(postId);
        toast.success('تم الإعجاب بالمنشور');
      }
      return newSet;
    });
  };

  const handleSave = (postId) => {
    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast.success('تم إزالة من المحفوظات');
      } else {
        newSet.add(postId);
        toast.success('تم الحفظ');
      }
      return newSet;
    });
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    toast.success('تم نسخ الرابط');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">حدث خطأ في تحميل المنشورات</p>
        <button
          onClick={() => refetch()}
          className="btn-primary"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          المنشورات
        </h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowPathIcon className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Create Post Card */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 mb-6"
        >
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <Link
              to="/posts/create"
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
            >
              شارك مهاراتك مع الآخرين...
            </Link>
          </div>
          <div className="flex justify-around mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 dark:text-gray-400">
              <PhotoIcon className="w-5 h-5" />
              <span>صورة</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 dark:text-gray-400">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>منشور</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Posts Feed */}
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="card mb-6"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${post.user.id}`}>
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-12 h-12 rounded-full object-cover hover:opacity-90 transition"
                  />
                </Link>
                <div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/profile/${post.user.id}`}
                      className="font-semibold text-gray-900 hover:underline dark:text-white"
                    >
                      {post.user.name}
                    </Link>
                    {post.user.isArtisan && (
                      <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full dark:bg-primary-900 dark:text-primary-300">
                        {post.user.specialty}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{post.user.username}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(post.createdAt, { 
                        addSuffix: true,
                        locale: ar 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-2">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className={`grid gap-1 ${
                post.images.length === 1 ? 'grid-cols-1' :
                post.images.length === 2 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {post.images.map((image, idx) => (
                  <div
                    key={idx}
                    className={`relative overflow-hidden ${
                      post.images.length === 3 && idx === 0 ? 'row-span-2' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Post image ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      style={{ aspectRatio: '16/9' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Post Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <HeartIconSolid className="w-4 h-4 text-red-500" />
                <span>{likedPosts.has(post.id) ? post.likes + 1 : post.likes}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{post.comments} تعليق</span>
                <span>{post.shares} مشاركة</span>
              </div>
            </div>

            {/* Post Actions */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-around">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    likedPosts.has(post.id)
                      ? 'text-red-600'
                      : 'text-gray-600 hover:text-red-600 dark:text-gray-400'
                  }`}
                >
                  {likedPosts.has(post.id) ? (
                    <HeartIconSolid className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span>إعجاب</span>
                </button>

                <Link
                  to={`/posts/${post.id}`}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 rounded-lg dark:text-gray-400"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span>تعليق</span>
                </Link>

                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 rounded-lg dark:text-gray-400"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>مشاركة</span>
                </button>

                <button
                  onClick={() => handleSave(post.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    savedPosts.has(post.id)
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600 dark:text-gray-400'
                  }`}
                >
                  {savedPosts.has(post.id) ? (
                    <BookmarkIconSolid className="w-5 h-5" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </AnimatePresence>

      {/* Load More Button */}
      {posts.length > 0 && (
        <div className="text-center mt-8">
          <button className="btn-outline">
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;