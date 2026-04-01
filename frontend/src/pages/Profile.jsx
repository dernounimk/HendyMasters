// frontend/src/pages/Profile.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, Star,
  MessageCircle, Share2, Award, Clock, ThumbsUp, Grid, FileText,
  Facebook, Twitter, Linkedin, Globe, DollarSign, Wrench, AlertCircle,
  UserPlus, Loader, Edit, CheckCircle, X, ChevronLeft, ChevronRight,
  Eye, EyeOff, AtSign, Link as LinkIcon, Heart, Bookmark, Send, MoreHorizontal,
  Instagram, Youtube, Shield, Verified, Info, Settings, LogOut, PlusCircle
} from 'lucide-react';

// استيراد الصورة الافتراضية
import defaultImgProfile from '../assets/images/default-avatar.png';

// Skeleton Component
const ProfileSkeleton = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600 animate-pulse"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-4">
              <div className="relative mb-4 sm:mb-0 sm:ml-6 rtl:sm:mr-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800 animate-pulse"></div>
              </div>
              <div className="flex-1 sm:mr-6 rtl:sm:ml-6">
                <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, onLike, onSave }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, savePost } = useStore();
  
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats?.likesCount || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const isOwner = user?._id === post.author?._id;
  
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
  
  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      if (response.data.success) {
        setIsLiked(response.data.data.liked);
        setLikesCount(response.data.data.likesCount);
        if (onLike) onLike(post._id, response.data.data.liked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('حدث خطأ');
    }
  };
  
  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const result = await savePost(post._id);
      if (result.success) {
        setIsSaved(result.data.saved);
        if (onSave) onSave(post._id, result.data.saved);
        toast.success(result.data.saved ? 'تم الحفظ' : 'تم الإزالة');
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ');
    } finally {
      setSaving(false);
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
          
          {/* Share Menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {showShareMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  نسخ الرابط
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-2">
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
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
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
        <div className="relative h-56 mt-2">
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
            
            {!isOwner && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 transition-colors ${
                  isSaved ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
                }`}
              >
                <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isOwner && (
              <>
                <button
                  onClick={handleMessage}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  مراسلة
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Profile Component
const Profile = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const navigate = useNavigate();
  
  const { 
    user: currentUser, 
    isAuthenticated,
    profileData,
    profileLoading,
    profileError,
    posts,
    postsLoading,
    hasMorePosts,
    reviews,
    reviewsLoading,
    hasMoreReviews,
    reviewsStats,
    activeTab,
    fetchProfileByUsername,
    fetchCurrentUserProfile,
    fetchUserPosts,
    fetchUserReviews,
    resetPosts,
    resetReviews,
    incrementPostsPage,
    incrementReviewsPage,
    setActiveTab,
    clearProfileError,
    savePost
  } = useStore();

  const [showContactInfo, setShowContactInfo] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const postsContainerRef = useRef(null);
  
  const isOwnProfile = useMemo(() => {
    if (!profileData || !currentUser) return false;
    return String(profileData._id) === String(currentUser._id);
  }, [profileData?._id, currentUser?._id]);
  
  const canCreatePost = useMemo(() => {
    return currentUser?.role === 'client' || currentUser?.role === 'artisan';
  }, [currentUser?.role]);
  
  const showPostsTab = useMemo(() => {
    return profileData?.role === 'client' || profileData?.role === 'artisan';
  }, [profileData?.role]);
  
  const isDataReady = useMemo(() => {
    if (username) {
      return !profileLoading && profileData !== null;
    }
    return currentUser !== null;
  }, [username, profileLoading, profileData, currentUser]);

  const isRTL = document.dir === 'rtl';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return t('time.today');
    if (diffDays === 1) return t('time.yesterday');
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
    if (diffDays < 30) return t('time.weeksAgo', { count: Math.floor(diffDays / 7) });
    return date.toLocaleDateString('ar-DZ');
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast.error(t('profile.errors.loginRequired'));
      navigate('/login');
      return;
    }
    
    if (!profileData?._id) {
      toast.error('بيانات المستخدم غير متاحة');
      return;
    }
    
    if (isOwnProfile) {
      toast.error('لا يمكنك مراسلة نفسك');
      return;
    }
    
    const loadingToast = toast.loading('جاري التحقق من صلاحية المراسلة...');
    
    try {
      const { checkMessagingPermission, createConversation } = useStore.getState();
      const permission = await checkMessagingPermission(profileData._id);
      
      toast.dismiss(loadingToast);
      
      if (permission?.allowed) {
        const result = await createConversation(profileData._id);
        
        if (result?.conversation?._id) {
          navigate(`/messages/${result.conversation._id}`);
        } else if (result?._id) {
          navigate(`/messages/${result._id}`);
        }
      } else {
        toast.error(permission?.reason || 'لا يمكنك مراسلة هذا المستخدم');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error checking messaging permission:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في التحقق من صلاحية المراسلة');
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleCreatePost = () => {
    navigate('/posts/create');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success(t('profile.linkCopied'));    
    setShowShareMenu(false);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const loadMorePosts = () => {
    if (!hasMorePosts || postsLoading) return;
    incrementPostsPage();
    if (profileData?._id) {
      fetchUserPosts(profileData._id, false);
    }
  };

  const loadMoreReviews = () => {
    if (!hasMoreReviews || reviewsLoading) return;
    incrementReviewsPage();
    if (profileData?._id) {
      fetchUserReviews(profileData._id, false);
    }
  };

  // Handle scroll for infinite scroll
  const handleScroll = useCallback(() => {
    if (!postsContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = postsContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (activeTab === 'posts' && hasMorePosts && !postsLoading) {
        loadMorePosts();
      } else if (activeTab === 'reviews' && hasMoreReviews && !reviewsLoading) {
        loadMoreReviews();
      }
    }
  }, [activeTab, hasMorePosts, hasMoreReviews, postsLoading, reviewsLoading, loadMorePosts, loadMoreReviews]);

  // Fetch profile data
  useEffect(() => {
    const loadProfile = async () => {
      clearProfileError();
      resetPosts();
      resetReviews();
      setInitialLoadComplete(false);
      
      let result;
      if (username) {
        result = await fetchProfileByUsername(username);
      } else if (currentUser) {
        result = await fetchCurrentUserProfile();
      } else {
        navigate('/login');
        return;
      }
      
      if (result?.success) {
        setInitialLoadComplete(true);
      }
    };
    
    loadProfile();
  }, [username, currentUser?._id, navigate]);

  // Fetch posts when tab changes
  useEffect(() => {
    if (activeTab === 'posts' && profileData?._id && showPostsTab && initialLoadComplete) {
      fetchUserPosts(profileData._id, true);
    }
  }, [activeTab, profileData?._id, showPostsTab, initialLoadComplete]);

  // Fetch reviews when tab changes
  useEffect(() => {
    if (activeTab === 'reviews' && profileData?._id && initialLoadComplete) {
      fetchUserReviews(profileData._id, true);
    }
  }, [activeTab, profileData?._id, initialLoadComplete]);

  // Show error
  useEffect(() => {
    if (profileError) {
      toast.error(profileError);
    }
  }, [profileError]);

  // Show loading skeleton
  if (profileLoading && !profileData) {
    return <ProfileSkeleton />;
  }

  if (username && profileLoading) {
    return <ProfileSkeleton />;
  }

  if (!username && !currentUser && !profileLoading) {
    navigate('/login');
    return null;
  }

  if (!profileData && !profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('profile.errors.notFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('profile.errors.userNotFound')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 relative bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-4">
              <div className="relative mb-4 sm:mb-0 sm:ml-6 rtl:sm:mr-6">
                <img
                  src={profileData.profileImage || defaultImgProfile}
                  alt={profileData.username}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(profileData.profileImage || defaultImgProfile)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImgProfile;
                  }}
                  loading="lazy"
                />
                {profileData.professionalInfo?.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 sm:mr-6 rtl:sm:ml-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {profileData.username}
                      {profileData.professionalInfo?.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {/* Role Badge */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${profileData.role === 'artisan' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' : ''}
                        ${profileData.role === 'worker' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${profileData.role === 'client' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                      `}>
                        {profileData.role === 'artisan' && <Briefcase className="w-3 h-3 ml-1 rtl:mr-1" />}
                        {profileData.role === 'worker' && <Wrench className="w-3 h-3 ml-1 rtl:mr-1" />}
                        {profileData.role === 'client' && <User className="w-3 h-3 ml-1 rtl:mr-1" />}
                        {t(`roles.${profileData.role}`)}
                      </span>
                      
                      {/* Location */}
                      {profileData.location && (
                        <span className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 ml-1 rtl:mr-1" />
                          {profileData.location}
                        </span>
                      )}
                      
                      {/* Join Date */}
                      <span className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 ml-1 rtl:mr-1" />
                        {new Date(profileData.createdAt).toLocaleDateString('ar-DZ')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {!isOwnProfile ? (
                      <button
                        onClick={handleMessage}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t('profile.message')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleEditProfile}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>{t('profile.editProfile')}</span>
                      </button>
                    )}
                    
                    {/* Share Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="p-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50`}
                        >
                          <button
                            onClick={handleShare}
                            className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            {t('profile.copyLink')}
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profileData.bio && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl">
                    {profileData.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-8 mt-6">
                  {showPostsTab && (
                    <button 
                      onClick={() => setActiveTab('posts')}
                      className="text-center hover:opacity-80 transition-opacity"
                    >
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {profileData.stats?.postsCount || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('profile.stats.posts')}
                      </div>
                    </button>
                  )}
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {profileData.stats?.rating || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {t('profile.stats.rating')}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <AnimatePresence>
                  {(showContactInfo || !isOwnProfile) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2 overflow-hidden"
                    >
                      {profileData.email && (isOwnProfile || profileData.privacy?.showEmail) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <a href={`mailto:${profileData.email}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                            {profileData.email}
                          </a>
                        </div>
                      )}
                      
                      {profileData.phone && (isOwnProfile || profileData.privacy?.showPhone) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a href={`tel:${profileData.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                            {profileData.phone}
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Professional Info */}
                {profileData.role !== 'client' && profileData.professionalInfo && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {t('profile.professionalInfo')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.role === 'artisan' && (
                        <>
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t(`crafts.${profileData.professionalInfo.craft}`)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t('profile.experience')}: {t(`professional.experience.options.${profileData.professionalInfo.experience}`)}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {profileData.role === 'worker' && (
                        <>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t('profile.dailyRate')}: {profileData.professionalInfo.dailyRate?.toLocaleString()} DZD
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t('profile.skillsCount', { count: profileData.professionalInfo.skills?.length || 0 })}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {profileData.role === 'worker' && profileData.professionalInfo.skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {profileData.professionalInfo.skills.slice(0, 5).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {skill}
                          </span>
                        ))}
                        {profileData.professionalInfo.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                            +{profileData.professionalInfo.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8 rtl:space-x-reverse overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'about'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>{t('profile.tabs.about')}</span>
            </button>
            
            {showPostsTab && (
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'posts'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{t('profile.tabs.posts')}</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>{t('profile.tabs.reviews')}</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div 
          ref={postsContainerRef}
          onScroll={handleScroll}
          className="overflow-y-auto max-h-[calc(100vh-400px)]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('profile.about.title')}
                  </h3>
                  
                  <div className="space-y-6">
                    {profileData.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('profile.about.bio')}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{profileData.bio}</p>
                      </div>
                    )}
                    
                    {(profileData.email || profileData.phone || profileData.location) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('profile.about.contact')}</h4>
                        <div className="space-y-2">
                          {profileData.email && (isOwnProfile || profileData.privacy?.showEmail) && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <a href={`mailto:${profileData.email}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                                {profileData.email}
                              </a>
                            </div>
                          )}
                          
                          {profileData.phone && (isOwnProfile || profileData.privacy?.showPhone) && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <a href={`tel:${profileData.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                                {profileData.phone}
                              </a>
                            </div>
                          )}
                          
                          {profileData.location && (isOwnProfile || profileData.privacy?.showLocation) && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">{profileData.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {profileData.role !== 'client' && profileData.professionalInfo && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('profile.about.professional')}</h4>
                        <div className="space-y-2">
                          {profileData.role === 'artisan' && (
                            <>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {t('profile.about.craft')}: {t(`crafts.${profileData.professionalInfo.craft}`)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {t('profile.about.experience')}: {t(`professional.experience.options.${profileData.professionalInfo.experience}`)}
                                </span>
                              </div>
                            </>
                          )}
                          {profileData.role === 'worker' && (
                            <>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {t('profile.about.dailyRate')}: {profileData.professionalInfo.dailyRate?.toLocaleString()} DZD
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Wrench className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                  <span className="text-gray-700 dark:text-gray-300 block mb-1">{t('profile.about.skills')}:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {profileData.professionalInfo.skills?.map(skill => (
                                      <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('profile.about.account')}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AtSign className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">@{profileData.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {t('profile.joined', { date: new Date(profileData.createdAt).toLocaleDateString('ar-DZ') })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === 'posts' && showPostsTab && (
                <div className="space-y-4">
                  {posts.length === 0 && !postsLoading && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {t('profile.posts.noPosts')}
                      </h3>
                      {isOwnProfile && canCreatePost && (
                        <button
                          onClick={handleCreatePost}
                          className="mt-4 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                          <PlusCircle className="w-5 h-5" />
                          <span>{t('profile.posts.createFirst')}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {postsLoading && posts.length === 0 && (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 animate-pulse">
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
                      ))}
                    </div>
                  )}

                  {posts.map(post => (
                    <PostCard 
                      key={post._id} 
                      post={post} 
                      onSave={() => {}}
                      onLike={() => {}}
                    />
                  ))}
                  
                  {hasMorePosts && posts.length > 0 && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">جاري التحميل...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                          {reviewsStats.average?.toFixed(1) || 0}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${
                              star <= Math.round(reviewsStats.average || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ({reviewsStats.count || 0} تقييم)
                        </div>
                      </div>
                    </div>
                  </div>

                  {reviews.length === 0 && !reviewsLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        لا توجد تقييمات
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile 
                          ? 'لم يتم تقييمك بعد'
                          : 'لا توجد تقييمات لهذا المستخدم'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                          <div className="flex items-start gap-3">
                            <Link to={`/profile/${review.reviewer?.username}`}>
                              <img
                                src={review.reviewer?.profileImage || defaultImgProfile}
                                alt={review.reviewer?.username}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => { e.target.src = defaultImgProfile; }}
                              />
                            </Link>
                            <div className="flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <Link to={`/profile/${review.reviewer?.username}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                                    {review.reviewer?.username}
                                  </Link>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star key={star} className={`w-3 h-3 ${
                                        star <= review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300 dark:text-gray-600'
                                      }`} />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('ar-DZ')}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                                  {review.comment}
                                </p>
                              )}
                              {review.post && (
                                <Link to={`/post/${review.post._id}`} className="mt-2 inline-block text-xs text-primary-600 hover:underline">
                                  عرض المنشور
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {hasMoreReviews && reviews.length > 0 && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">جاري التحميل...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImgProfile;
                }}
              />
              <button 
                onClick={() => setShowImageModal(false)} 
                className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;