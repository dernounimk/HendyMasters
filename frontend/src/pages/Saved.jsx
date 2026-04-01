// frontend/src/pages/Saved.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Bookmark, Heart, MapPin, DollarSign, Clock, MessageCircle,
  Share2, Star, Trash2, Loader, AlertCircle, User, Briefcase,
  Wrench, PlusCircle, X, Send, Search
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

// Post Card Component for Saved Posts
const SavedPostCard = ({ post, onUnsave }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, savePost } = useStore();
  
  const [saving, setSaving] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats?.likesCount || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'أمس';
    if (diff < 7) return `منذ ${diff} أيام`;
    return date.toLocaleDateString('ar-DZ');
  };
  
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('ar-DZ').format(amount) + ' دج';
  };
  
  const handleUnsave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const result = await savePost(post._id);
      if (result.success) {
        toast.success('تم إزالة البوست من المحفوظات');
        if (onUnsave) onUnsave(post._id);
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };
  
  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      if (response.data.success) {
        setIsLiked(response.data.data.liked);
        setLikesCount(response.data.data.likesCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('حدث خطأ');
    }
  };
  
  const handleMessage = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    
    const loadingToast = toast.loading('جاري التحقق...');
    
    try {
      const { checkMessagingPermission, createConversation } = useStore.getState();
      const permission = await checkMessagingPermission(post.author._id);
      
      toast.dismiss(loadingToast);
      
      if (permission?.allowed) {
        const postUrl = `${window.location.origin}/post/${post._id}`;
        const messageText = `مرحباً، أنا مهتم بمنشورك: "${post.title}"\n\nرابط المنشور: ${postUrl}\n\nهل يمكننا مناقشة التفاصيل؟`;
        
        const result = await createConversation(post.author._id, messageText);
        
        if (result?.conversation?._id) {
          navigate(`/messages/${result.conversation._id}`);
        } else if (result?._id) {
          navigate(`/messages/${result._id}`);
        }
      } else {
        toast.error(permission?.reason || 'لا يمكنك مراسلة صاحب هذا المنشور');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'حدث خطأ');
    }
  };
  
  const handleShare = async (e) => {
    e.stopPropagation();
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
    setShowShareMenu(false);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
      {/* Header - Author */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?.username}`} onClick={(e) => e.stopPropagation()}>
            <img
              src={post.author?.profileImage || defaultImgProfile}
              alt={post.author?.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800"
              onError={(e) => { e.target.src = defaultImgProfile; }}
            />
          </Link>
          <div className="flex-1">
            <Link to={`/profile/${post.author?.username}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600">
              {post.author?.username}
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatDate(post.createdAt)}</span>
              <span>•</span>
              <span>{post.type === 'service_request' ? 'طلب خدمة' : 'فرصة عمل'}</span>
            </div>
          </div>
          
          {/* Unsave Button */}
          <button
            onClick={handleUnsave}
            disabled={saving}
            className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors"
            title="إزالة من المحفوظات"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Bookmark className="w-5 h-5 fill-current" />}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-2 cursor-pointer" onClick={() => navigate(`/post/${post._id}`)}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h3>
        
        <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{post.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(post.budget)}</span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {post.description}
        </p>
        
        {/* Tags */}
        {post.requiredSkills && post.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.requiredSkills.slice(0, 3).map(skill => (
              <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                {skill}
              </span>
            ))}
            {post.requiredSkills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                +{post.requiredSkills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="relative h-48 mt-2 cursor-pointer" onClick={() => navigate(`/post/${post._id}`)}>
          <img
            src={post.images[0].url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {post.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
              +{post.images.length}
            </div>
          )}
        </div>
      )}
      
      {/* Actions */}
      <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{likesCount}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleMessage}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              مراسلة
            </button>
            
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    نسخ الرابط
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

// Skeleton Component
const SavedSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-3 w-5/6 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

const Saved = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const containerRef = useRef(null);
  
  const fetchSavedPosts = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await api.get('/posts/saved', {
        params: { page: reset ? 1 : page + 1, limit: 10 }
      });
      
      if (response.data.success) {
        const newPosts = response.data.posts;
        
        if (reset) {
          setSavedPosts(newPosts);
        } else {
          setSavedPosts(prev => [...prev, ...newPosts]);
        }
        
        setHasMore(response.data.pagination?.hasMore || newPosts.length === 10);
        
        if (!reset && newPosts.length > 0) {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      toast.error('فشل في تحميل البوستات المحفوظة');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);
  
  const handleUnsave = (postId) => {
    setSavedPosts(prev => prev.filter(post => post._id !== postId));
  };
  
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (hasMore && !loadingMore && !loading) {
        fetchSavedPosts(false);
      }
    }
  }, [hasMore, loadingMore, loading, fetchSavedPosts]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedPosts(true);
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('saved.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {savedPosts.length} {t('saved.postsCount')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Saved Posts List */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]"
      >
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <SavedSkeleton key={i} />
            ))}
          </>
        ) : savedPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('saved.noSavedPosts')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t('saved.noSavedPostsDesc')}
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              {t('saved.explorePosts')}
            </Link>
          </div>
        ) : (
          <>
            {savedPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SavedPostCard post={post} onUnsave={handleUnsave} />
              </motion.div>
            ))}
            
            {loadingMore && (
              <div className="py-4 text-center">
                <Loader className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
              </div>
            )}
            
            {!hasMore && savedPosts.length > 0 && (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {t('saved.endOfList')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Saved;