// frontend/src/pages/PostDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin, Heart, MessageCircle, Share2, Bookmark, Clock,
  Send, X, Loader, AlertCircle, ChevronRight, Trash2, ChevronLeft
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

// إضافة CSS مخصص لصفحة تفاصيل البوست
const postDetailsStyle = document.createElement('style');
postDetailsStyle.textContent = `
  /* ==================== الوضع الفاتح (الألوان الداكنة) ==================== */
  .post-details-glass-card {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  /* النصوص الرئيسية في الوضع الفاتح - أسود */
  .post-details-glass-card h1,
  .post-details-glass-card h2,
  .post-details-glass-card h3,
  .post-details-glass-card .font-bold,
  .post-details-glass-card .font-semibold {
    color: #1f2937 !important;
  }
  
  /* النصوص العادية في الوضع الفاتح - رمادي غامق */
  .post-details-glass-card p,
  .post-details-glass-card span,
  .post-details-glass-card label {
    color: #374151 !important;
  }
  
  /* النصوص الثانوية في الوضع الفاتح - رمادي */
  .post-details-glass-card .text-gray-500,
  .post-details-glass-card .text-gray-600 {
    color: #6b7280 !important;
  }
  
  /* ==================== الوضع المظلم ==================== */
  .dark .post-details-glass-card {
    background: rgba(17, 24, 39, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  /* النصوص الرئيسية في الوضع المظلم - أبيض */
  .dark .post-details-glass-card h1,
  .dark .post-details-glass-card h2,
  .dark .post-details-glass-card h3,
  .dark .post-details-glass-card .font-bold,
  .dark .post-details-glass-card .font-semibold {
    color: #f3f4f6 !important;
  }
  
  /* النصوص العادية في الوضع المظلم - رمادي فاتح */
  .dark .post-details-glass-card p,
  .dark .post-details-glass-card span,
  .dark .post-details-glass-card label {
    color: #d1d5db !important;
  }
  
  /* النصوص الثانوية في الوضع المظلم */
  .dark .post-details-glass-card .text-gray-500,
  .dark .post-details-glass-card .text-gray-600 {
    color: #9ca3af !important;
  }
  
  /* ==================== الأزرار ==================== */
  .post-details-btn {
    transition: all 0.3s ease;
  }
  
  .post-details-btn:hover {
    transform: scale(1.05);
  }
  
  /* ==================== معرض الصور ==================== */
  .post-details-image {
    transition: all 0.3s ease;
  }
  
  .post-details-image:hover {
    transform: scale(1.02);
  }
  
  /* ==================== زر الرجوع ==================== */
  .post-details-back-btn {
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }
  
  .post-details-back-btn:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: translateX(-2px);
  }
  
  .dark .post-details-back-btn {
    background: rgba(31, 41, 55, 0.5);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .dark .post-details-back-btn:hover {
    background: rgba(31, 41, 55, 0.7);
  }
  
  /* العلامة الزرقاء المصغرة لتفاصيل البوست */
  .details-verified-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    margin-left: 0.25rem;
    flex-shrink: 0;
  }
  
  .details-verified-badge svg {
    width: 0.625rem;
    height: 0.625rem;
    color: white;
    stroke-width: 3;
  }
`;
document.head.appendChild(postDetailsStyle);

// مكون ConfirmationModal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger = true }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDanger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {isDanger ? (
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <Trash2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-line">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              {cancelText || t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {confirmText || t('common.confirm')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, savePost } = useStore();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const isOwner = user?._id === post?.author?._id;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const currentLang = i18n.language;
    const isRTL = currentLang === 'ar';
    
    if (diff === 0) return t('time.today');
    if (diff === 1) return t('time.yesterday');
    if (diff < 7) return t('time.daysAgo', { count: diff });
    
    const locale = isRTL ? 'ar-DZ' : (currentLang === 'fr' ? 'fr-FR' : 'en-US');
    return date.toLocaleDateString(locale);
  };
  
  const formatCurrency = (amount) => {
    if (!amount) return '';
    const currentLang = i18n.language;
    const locale = currentLang === 'ar' ? 'ar-DZ' : (currentLang === 'fr' ? 'fr-FR' : 'en-US');
    return new Intl.NumberFormat(locale).format(amount) + ' ' + t('currency.dzd');
  };
  
  const getPostTypeText = () => {
    return post?.type === 'service_request' ? t('postTypes.serviceRequest') : t('postTypes.jobOpportunity');
  };
  
  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/posts/${id}`);
      if (response.data.success) {
        const postData = response.data.data;
        setPost(postData);
        setIsSaved(postData.isSaved || false);
        setIsLiked(postData.isLiked || false);
        setLikesCount(postData.stats?.likesCount || 0);
        setSavesCount(postData.stats?.savesCount || 0);
        setSharesCount(postData.stats?.sharesCount || 0);
      } else {
        setError(response.data.message || t('errors.loadPostFailed'));
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || t('errors.loadPostError'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);
  
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error(t('errors.loginRequired'));
      navigate('/login');
      return;
    }
    
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      if (response.data.success) {
        setIsLiked(response.data.data.liked);
        setLikesCount(response.data.data.likesCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error(t('errors.general'));
    }
  };
  
  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error(t('errors.loginRequired'));
      navigate('/login');
      return;
    }
    
    if (saving) return;
    setSaving(true);
    try {
      const result = await savePost(post._id);
      if (result.success) {
        setIsSaved(result.data.saved);
        setSavesCount(result.data.savesCount);
        toast.success(result.data.saved ? t('messages.saved') : t('messages.unsaved'));
      }
    } catch (error) {
      toast.error(error.message || t('errors.general'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast.error(t('errors.loginRequired'));
      navigate('/login');
      return;
    }
    
    const loadingToast = toast.loading(t('messages.checking'));
    
    try {
      const { checkMessagingPermission, createConversation } = useStore.getState();
      const permission = await checkMessagingPermission(post.author._id);
      
      toast.dismiss(loadingToast);
      
      if (permission?.allowed) {
        const postUrl = `${window.location.origin}/post/${post._id}`;
        
        const messageText = `${user?.username}
${t('messages.interestInPost')}

${post.title}
${formatCurrency(post.budget)} · ${post.location}

${postUrl}

${t('messages.welcomeDetails')}`;
        
        const result = await createConversation(post.author._id, messageText);
        
        if (result?.conversation?._id) {
          navigate(`/messages/${result.conversation._id}`);
        } else if (result?._id) {
          navigate(`/messages/${result._id}`);
        }
      } else {
        toast.error(permission?.reason || t('messages.cannotMessage'));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || t('errors.general'));
    }
  };
  
  const handleShareClick = async () => {
    setLoadingConversations(true);
    setShowShareModal(true);
    try {
      const response = await api.get('/posts/conversations-for-sharing');
      if (response.data?.success) {
        const users = response.data.users || [];
        const filteredUsers = users.filter(u => u._id !== user?._id);
        setConversations(filteredUsers);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };
  
  const handleShareWithUser = async (recipientId, recipientName) => {
    if (sharing) return;
    
    setSharing(true);
    const loadingToast = toast.loading(t('messages.sharingWith', { name: recipientName }));
    
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      
      const shareMessage = `${user?.username} ${t('messages.sharedPost')}

${post.title}
${formatCurrency(post.budget)} · ${post.location}

${postUrl}`;
      
      const { createConversation } = useStore.getState();
      const result = await createConversation(recipientId, shareMessage);
      
      toast.dismiss(loadingToast);
      
      if (result?.conversation?._id || result?._id) {
        toast.success(t('messages.shareSuccess', { name: recipientName }));
        setShowShareModal(false);
        
        try {
          const shareResponse = await api.post(`/posts/${post._id}/share`, {
            userIds: [recipientId]
          });
          if (shareResponse.data.success) {
            setSharesCount(shareResponse.data.data.sharesCount);
          }
        } catch (shareError) {
          console.error('Error updating share count:', shareError);
        }
      } else {
        toast.error(t('messages.shareFailed'));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || t('messages.shareError'));
    } finally {
      setSharing(false);
    }
  };
  
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('messages.linkCopied'));
      
      try {
        const shareResponse = await api.post(`/posts/${post._id}/share`, {
          userIds: []
        });
        if (shareResponse.data.success) {
          setSharesCount(shareResponse.data.data.sharesCount);
        }
      } catch (shareError) {
        console.error('Error updating share count:', shareError);
      }
    } catch (error) {
      toast.error(t('messages.copyLinkFailed'));
    }
    setShowShareModal(false);
  };
  
  const handleDelete = async () => {
    if (deleting) return;
    
    setDeleting(true);
    const loadingToast = toast.loading(t('messages.deletingPost'));
    
    try {
      const response = await api.delete(`/posts/${post._id}`);
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(t('messages.postDeleted'));
        navigate('/');
      } else {
        throw new Error(response.data.message || t('messages.deleteFailed'));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error deleting post:', error);
      toast.error(error.response?.data?.message || t('messages.deleteError'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{t('messages.loadingPost')}</p>
        </motion.div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('errors.somethingWrong')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || t('errors.postNotFound')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            {t('actions.goHome')}
          </button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      
      {/* بطاقة المنشور - تصميم زجاجي */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="post-details-glass-card overflow-hidden"
      >
        {/* رأس البطاقة */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author?.username}`}>
              <img
                src={post.author?.profileImage || defaultImgProfile}
                alt={post.author?.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
                onError={(e) => { e.target.src = defaultImgProfile; }}
              />
            </Link>
            <div className="flex-1">
              <Link 
                to={`/profile/${post.author?.username}`} 
                className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                {post.author?.username}
                {post.author?.isVerified && (
                  <div className="details-verified-badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span>{getPostTypeText()}</span>
              </div>
            </div>
            
            {/* زر القائمة - يظهر فقط لصاحب البوست */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowDeleteModal(true);
                        }}
                        disabled={deleting}
                        className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{t('actions.deletePost')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        
        {/* محتوى البوست */}
        <div className="px-5 pb-3">
          <h1 className="text-xl font-bold mb-3">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">{post.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 dark:text-gray-300">{formatCurrency(post.budget)}</span>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 whitespace-pre-wrap leading-relaxed">
            {post.description}
          </p>
        </div>
        
        {/* معرض الصور */}
        {post.images && post.images.length > 0 && (
          <div className="mb-2">
            {post.images.length === 1 ? (
              <div className="relative">
                <img
                  src={post.images[0].url}
                  alt={post.title}
                  className="w-full h-auto max-h-[500px] object-contain bg-gray-100/50 dark:bg-gray-900/50 cursor-pointer post-details-image"
                  onClick={() => setSelectedImage(post.images[0].url)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {post.images.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img
                      src={img.url}
                      alt={`${post.title} - ${idx + 1}`}
                      className="w-full h-full object-cover post-details-image"
                    />
                    {idx === 3 && post.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">+{post.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* أزرار التفاعل */}
        <div className="p-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={handleLike}
                className={`post-details-btn flex items-center gap-1.5 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:text-gray-400'
                }`}
              >
                <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                <span className="text-sm">{likesCount}</span>
              </button>
              
              {!isOwner && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`post-details-btn flex items-center gap-1.5 transition-colors ${
                    isSaved ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500 dark:text-gray-400'
                  }`}
                >
                  <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                  <span className="text-sm">{savesCount}</span>
                </button>
              )}
              
              <button
                onClick={handleShareClick}
                className="post-details-btn flex items-center gap-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">{sharesCount}</span>
              </button>
            </div>
            
            {!isOwner && (
              <button
                onClick={handleMessage}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {t('actions.message')}
              </button>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Modal عرض الصورة */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="max-w-full max-h-[90vh] object-contain rounded-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal تأكيد الحذف */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('modals.deletePostTitle')}
        message={t('modals.deletePostMessage', { title: post?.title })}
        confirmText={t('modals.delete')}
        cancelText={t('common.cancel')}
        isDanger={true}
      />
      
      {/* Modal المشاركة */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('modals.sharePostTitle')}</h3>
                  <button 
                    onClick={() => setShowShareModal(false)} 
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('modals.sharePostDescription')}</p>
              </div>
              <div className="p-4 overflow-y-auto max-h-96">
                {loadingConversations ? (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{t('messages.loadingConversations')}</p>
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-2">
                    {conversations.map(conv => (
                      <button
                        key={conv._id}
                        onClick={() => handleShareWithUser(conv._id, conv.username)}
                        disabled={sharing}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 disabled:opacity-50"
                      >
                        <img 
                          src={conv.profileImage || defaultImgProfile} 
                          alt={conv.username} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" 
                          onError={(e) => e.target.src = defaultImgProfile}
                        />
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900 dark:text-white">{conv.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('modals.sendAsMessage')}</p>
                        </div>
                        {sharing ? (
                          <Loader className="w-4 h-4 animate-spin text-blue-500" />
                        ) : (
                          <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{t('modals.noConversations')}</p>
                    <button
                      onClick={handleCopyLink}
                      className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      {t('modals.copyLink')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostDetails;