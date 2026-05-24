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
  MessageCircle, Share2, Award, Clock, FileText,
  DollarSign, Wrench, AlertCircle,
  Loader, Edit, CheckCircle, X, ChevronLeft, ChevronRight,
  AtSign, Link as LinkIcon, Heart, Bookmark,
  Info, PlusCircle, Eye, MoreHorizontal, Ban, Flag,
  ShieldCheck
} from 'lucide-react';

import defaultImgProfile from '../assets/images/default-avatar.png';
import AddReviewModal from '../components/reviews/AddReviewModal';
import ReviewCard from '../components/reviews/ReviewCard';
import PostCard from '../components/PostCard';

// CSS مخصص لصفحة البروفايل
const profileStyle = document.createElement('style');
profileStyle.textContent = `
  .profile-glass-card {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .profile-glass-card-inner {
    background: rgba(255, 255, 255, 0.5) !important;
    backdrop-filter: blur(8px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
  }
  
  .profile-glass-card h1,
  .profile-glass-card h2,
  .profile-glass-card h3,
  .profile-glass-card .font-bold,
  .profile-glass-card .font-semibold,
  .profile-text-primary {
    color: #1f2937 !important;
  }
  
  .profile-glass-card p,
  .profile-glass-card span,
  .profile-glass-card label,
  .profile-text-secondary {
    color: #374151 !important;
  }
  
  .profile-glass-card .text-gray-500,
  .profile-glass-card .text-gray-600,
  .profile-text-muted {
    color: #6b7280 !important;
  }
  
  .dark .profile-glass-card {
    background: rgba(17, 24, 39, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  .dark .profile-glass-card-inner {
    background: rgba(17, 24, 39, 0.5) !important;
    border-color: rgba(75, 85, 99, 0.2);
  }
  
  .dark .profile-glass-card h1,
  .dark .profile-glass-card h2,
  .dark .profile-glass-card h3,
  .dark .profile-glass-card .font-bold,
  .dark .profile-glass-card .font-semibold,
  .dark .profile-text-primary {
    color: #f3f4f6 !important;
  }
  
  .dark .profile-glass-card p,
  .dark .profile-glass-card span,
  .dark .profile-glass-card label,
  .dark .profile-text-secondary {
    color: #d1d5db !important;
  }
  
  .dark .profile-glass-card .text-gray-500,
  .dark .profile-glass-card .text-gray-600,
  .dark .profile-text-muted {
    color: #9ca3af !important;
  }
  
  .profile-tab {
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
  }
  
  .profile-tab-active {
    border-bottom-color: #2563eb !important;
    color: #2563eb !important;
  }
  
  .dark .profile-tab-active {
    border-bottom-color: #3b82f6 !important;
    color: #3b82f6 !important;
  }
  
  .profile-tab-inactive {
    color: #6b7280 !important;
  }
  
  .dark .profile-tab-inactive {
    color: #9ca3af !important;
  }
  
  .profile-tab-inactive:hover {
    color: #2563eb !important;
  }
  
  .dark .profile-tab-inactive:hover {
    color: #3b82f6 !important;
  }
  
  .profile-stat {
    transition: all 0.3s ease;
  }
  
  .profile-stat:hover {
    transform: translateY(-2px);
  }

  .profile-more-menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: transparent;
  }

  .profile-more-menu-dropdown {
    position: absolute;
    z-index: 9999;
    min-width: 240px;
  }
  
  /* العلامة الزرقاء المصغرة */
  .verified-badge-sm {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
    flex-shrink: 0;
  }
  
  .verified-badge-sm svg {
    width: 0.625rem;
    height: 0.625rem;
    color: white;
    stroke-width: 3;
  }
  
  .verified-badge-md {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
    flex-shrink: 0;
  }
  
  .verified-badge-md svg {
    width: 0.75rem;
    height: 0.75rem;
    color: white;
    stroke-width: 3;
  }
  
  .verified-badge-lg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
    flex-shrink: 0;
  }
  
  .verified-badge-lg svg {
    width: 0.875rem;
    height: 0.875rem;
    color: white;
    stroke-width: 3;
  }
  
  .verified-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: #1f2937;
    color: white;
    font-size: 0.65rem;
    font-weight: 500;
    border-radius: 0.375rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    pointer-events: none;
    z-index: 100;
  }
  
  .verified-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: #1f2937 transparent transparent transparent;
  }
  
  .verified-badge-sm:hover .verified-tooltip,
  .verified-badge-md:hover .verified-tooltip,
  .verified-badge-lg:hover .verified-tooltip {
    opacity: 1;
    visibility: visible;
  }
  
  .verified-text-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 500;
    color: #2563eb;
  }
  
  .dark .verified-text-badge {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .verified-animate {
    animation: fadeInScale 0.2s ease-out;
  }
`;
document.head.appendChild(profileStyle);

const formatDate = (dateString, language) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  let locale;
  switch (language) {
    case 'ar':
      locale = 'ar-DZ';
      break;
    case 'fr':
      locale = 'fr-FR';
      break;
    default:
      locale = 'en-US';
  }
  
  try {
    return date.toLocaleDateString(locale, options);
  } catch (error) {
    return date.toLocaleDateString('en-US', options);
  }
};

// مكون العلامة الزرقاء المصغر
const VerifiedBadge = ({ size = 'sm', showTooltip = true, className = '' }) => {
  const sizeClass = {
    sm: 'verified-badge-sm',
    md: 'verified-badge-md',
    lg: 'verified-badge-lg'
  }[size];
  
  return (
    <div className={`${sizeClass} verified-animate ${className} relative`}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
      {showTooltip && (
        <span className="verified-tooltip">حساب موثق ✓</span>
      )}
    </div>
  );
};

const VerifiedTextBadge = () => {
  return (
    <span className="verified-text-badge">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
      موثق
    </span>
  );
};

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="profile-glass-card overflow-hidden mb-6">
          <div className="h-32 rounded-t-3xl bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
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

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger = true }) => {
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
              <Ban className="w-6 h-6 text-gray-600 dark:text-gray-400" />
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
              {cancelText || 'إلغاء'}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {confirmText || 'تأكيد'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MoreMenu = ({ isOpen, onClose, onShare, onBlockToggle, isBlocked, onReport, isRTL, blockingUser }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="profile-more-menu-overlay" onClick={onClose} />
      
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="profile-more-menu-dropdown"
        style={{
          position: 'fixed',
          top: 'auto',
          left: isRTL ? 'auto' : 'auto',
          right: isRTL ? '20px' : '20px',
          transform: 'translateY(calc(100% + 10px))',
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden w-64">
          <div className="py-1">
            <button
              onClick={() => {
                onShare();
                onClose();
              }}
              className="w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-left rtl:text-right"
            >
              <LinkIcon className="w-4 h-4 flex-shrink-0" />
              <span>نسخ الرابط</span>
            </button>
            
            <button
              onClick={() => {
                onBlockToggle();
                onClose();
              }}
              disabled={blockingUser}
              className={`w-full px-4 py-3 text-sm transition-colors flex items-center gap-3 text-left rtl:text-right ${
                isBlocked
                  ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                  : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
              }`}
            >
              <Ban className="w-4 h-4 flex-shrink-0" />
              <span>{isBlocked ? 'إلغاء حظر المستخدم' : 'حظر المستخدم'}</span>
            </button>
            
            <button
              onClick={() => {
                onReport();
                onClose();
              }}
              className="w-full px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 text-left rtl:text-right border-t border-gray-200 dark:border-gray-700"
            >
              <Flag className="w-4 h-4 flex-shrink-0" />
              <span>الإبلاغ عن المستخدم</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  
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
    deleteReview,
    updateReview,
    fetchBlockedUsers,
    blockUser,
    unblockUser
  } = useStore();

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState(null);
  const [blockingUser, setBlockingUser] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  
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
  
  const isRTL = i18n.language === 'ar' || document.dir === 'rtl';
  const currentLanguage = i18n.language;

  const displayRating = useMemo(() => {
    const rating = profileData?.stats?.rating;
    if (typeof rating === 'number') return rating.toFixed(1);
    if (typeof rating === 'string') return parseFloat(rating).toFixed(1);
    return '0.0';
  }, [profileData?.stats?.rating]);

  const loadBlockedUsers = useCallback(async () => {
    if (!currentUser) return;
    try {
      const blocked = await fetchBlockedUsers();
      setBlockedUsers(blocked || []);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  }, [fetchBlockedUsers, currentUser]);

  useEffect(() => {
    if (profileData && currentUser && !isOwnProfile) {
      const isUserBlocked = blockedUsers.some(blocked => blocked._id === profileData._id);
      setIsBlocked(isUserBlocked);
    }
  }, [profileData, currentUser, blockedUsers, isOwnProfile]);

  useEffect(() => {
    if (currentUser && profileData && !isOwnProfile && reviews.length > 0) {
      const existingReview = reviews.find(r => r.reviewer?._id === currentUser._id);
      setUserExistingReview(existingReview || null);
    } else {
      setUserExistingReview(null);
    }
  }, [currentUser, profileData, reviews, isOwnProfile]);

  const loadReviews = useCallback(async (reset = true) => {
    if (profileData?._id) {
      await fetchUserReviews(profileData._id, 1, reset);
    }
  }, [profileData?._id, fetchUserReviews]);

  const loadPosts = useCallback(async (reset = true) => {
    if (profileData?._id && showPostsTab) {
      await fetchUserPosts(profileData._id, reset);
    }
  }, [profileData?._id, showPostsTab, fetchUserPosts]);

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    
    if (isBlocked) {
      toast.error('لا يمكنك مراسلة هذا المستخدم لأنه محظور');
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
    toast.success('تم نسخ الرابط');
  };

  const openBlockConfirm = () => {
    setConfirmAction(isBlocked ? 'unblock' : 'block');
    setShowConfirmModal(true);
  };

  const openDeleteReviewConfirm = (reviewId) => {
    setReviewToDelete(reviewId);
    setConfirmAction('deleteReview');
    setShowConfirmModal(true);
  };

  const executeBlockAction = async () => {
    if (confirmAction === 'deleteReview') {
      try {
        await deleteReview(reviewToDelete);
        toast.success('تم حذف التقييم بنجاح');
        await loadReviews(true);
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف التقييم');
      } finally {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setReviewToDelete(null);
      }
      return;
    }

    if (!profileData) return;
    
    setBlockingUser(true);
    try {
      if (confirmAction === 'unblock') {
        const response = await api.delete(`/users/block/${profileData._id}`);
        if (response.data.success) {
          toast.success(`تم إلغاء حظر المستخدم ${profileData.username}`);
          await loadBlockedUsers();
          setIsBlocked(false);
        } else {
          toast.error(response.data.message || 'فشل إلغاء الحظر');
        }
      } else {
        const response = await api.post(`/users/block/${profileData._id}`);
        if (response.data.success) {
          toast.success(`تم حظر المستخدم ${profileData.username} بنجاح`);
          await loadBlockedUsers();
          setIsBlocked(true);
        } else {
          toast.error(response.data.message || 'فشل حظر المستخدم');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء معالجة الحظر');
    } finally {
      setBlockingUser(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const handleReportUser = () => {
    toast.info('سيتم إضافة خاصية الإبلاغ قريباً');
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handlePostDelete = (deletedPostId) => {
    loadPosts(true);
    toast.success('تم حذف المنشور');
  };

  const handleReviewDelete = async (reviewId) => {
    openDeleteReviewConfirm(reviewId);
  };

  const closeMoreMenu = () => {
    setShowMoreMenu(false);
  };

  useEffect(() => {
    if (!hasMorePosts || postsLoading || activeTab !== 'posts') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !postsLoading) {
          incrementPostsPage();
          if (profileData?._id) {
            fetchUserPosts(profileData._id, false);
          }
        }
      },
      { threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('posts-sentinel');
    if (sentinel) observer.observe(sentinel);
    
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMorePosts, postsLoading, activeTab, profileData?._id, incrementPostsPage, fetchUserPosts]);

  useEffect(() => {
    if (!hasMoreReviews || reviewsLoading || activeTab !== 'reviews') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreReviews && !reviewsLoading) {
          incrementReviewsPage();
          if (profileData?._id) {
            fetchUserReviews(profileData._id, reviews.length / 10 + 1, false);
          }
        }
      },
      { threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('reviews-sentinel');
    if (sentinel) observer.observe(sentinel);
    
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMoreReviews, reviewsLoading, activeTab, profileData?._id, reviews.length, incrementReviewsPage, fetchUserReviews]);

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
    loadBlockedUsers();
  }, [username, currentUser?._id, navigate]);

  useEffect(() => {
    if (activeTab === 'posts' && profileData?._id && showPostsTab && initialLoadComplete) {
      loadPosts(true);
    }
  }, [activeTab, profileData?._id, showPostsTab, initialLoadComplete, loadPosts]);

  useEffect(() => {
    if (activeTab === 'reviews' && profileData?._id && initialLoadComplete) {
      loadReviews(true);
    }
  }, [activeTab, profileData?._id, initialLoadComplete, loadReviews]);

  useEffect(() => {
    if (profileError) {
      toast.error(profileError);
    }
  }, [profileError]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            المستخدم غير موجود
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            عذراً، لم نتمكن من العثور على المستخدم المطلوب
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="profile-glass-card overflow-hidden mb-6">
          <div className="h-32 relative rounded-t-3xl">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-4">
              <div className="relative mb-4 sm:mb-0 sm:ml-6 rtl:sm:mr-6">
                <img
                  src={profileData.profileImage || defaultImgProfile}
                  alt={profileData.username}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg object-cover cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-300"
                  onClick={() => handleImageClick(profileData.profileImage || defaultImgProfile)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImgProfile;
                  }}
                  loading="lazy"
                />
              </div>

              <div className="flex-1 sm:mr-6 rtl:sm:ml-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
                      {profileData.username}
                      {profileData.isVerified === true && (
                        <VerifiedBadge size="sm" />
                      )}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${profileData.role === 'artisan' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${profileData.role === 'worker' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${profileData.role === 'client' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                      `}>
                        {profileData.role === 'artisan' ? 'حرفي' : profileData.role === 'worker' ? 'عامل' : 'عميل'}
                      </span>
                      
                      {profileData.isVerified === true && (
                        <VerifiedTextBadge />
                      )}
                      
                      {profileData.location && (
                        <span className="inline-flex items-center text-sm">
                          <MapPin className="w-4 h-4 ml-1 rtl:mr-1" />
                          {profileData.location}
                        </span>
                      )}
                      
                      <span className="inline-flex items-center text-sm">
                        <Calendar className="w-4 h-4 ml-1 rtl:mr-1" />
                        {formatDate(profileData.createdAt, currentLanguage)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isOwnProfile ? (
                      <>
                        <button
                          onClick={handleMessage}
                          disabled={isBlocked}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                            isBlocked
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:scale-[1.02] text-white'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{isBlocked ? 'محظور' : 'مراسلة'}</span>
                        </button>
                        
                        {userExistingReview ? (
                          <button
                            onClick={() => setActiveTab('reviews')}
                            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>عرض تقييمك</span>
                          </button>
                        ) : (
                          !isBlocked && (
                            <button
                              onClick={() => setShowAddReviewModal(true)}
                              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
                            >
                              <Star className="w-4 h-4" />
                              <span>تقييم</span>
                            </button>
                          )
                        )}
                      </>
                    ) : (
                      <button
                        onClick={handleEditProfile}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span className='text-white'>تعديل الملف</span>
                      </button>
                    )}
                    
                    {!isOwnProfile && (
                      <div className="relative">
                        <button
                          onClick={() => setShowMoreMenu(!showMoreMenu)}
                          className="p-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 border border-white/20 dark:border-gray-700/30"
                          disabled={blockingUser}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        <MoreMenu
                          isOpen={showMoreMenu}
                          onClose={closeMoreMenu}
                          onShare={handleShare}
                          onBlockToggle={openBlockConfirm}
                          isBlocked={isBlocked}
                          onReport={handleReportUser}
                          isRTL={isRTL}
                          blockingUser={blockingUser}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {profileData.bio && (
                  <p className="mt-4 max-w-2xl profile-text-secondary">
                    {profileData.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-8 mt-6">
                  {showPostsTab && (
                    <button 
                      onClick={() => setActiveTab('posts')}
                      className="profile-stat text-center hover:opacity-80 transition-all duration-300"
                    >
                      <div className="text-xl font-bold">
                        {profileData.stats?.postsCount || 0}
                      </div>
                      <div className="text-xs profile-text-muted">
                        منشورات
                      </div>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="profile-stat text-center hover:opacity-80 transition-all duration-300"
                  >
                    <div className="text-xl font-bold">
                      {profileData.stats?.totalRatings || 0}
                    </div>
                    <div className="text-xs profile-text-muted flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      تقييمات
                    </div>
                  </button>
                </div>

                {profileData.role !== 'client' && profileData.professionalInfo && (
                  <div className="mt-6 p-4 profile-glass-card-inner">
                    <h3 className="font-medium mb-3 flex items-center gap-2 profile-text-primary">
                      <Briefcase className="w-4 h-4" />
                      المعلومات المهنية
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.role === 'artisan' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm profile-text-secondary">
                              الحرفة: {profileData.professionalInfo.craft}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 profile-text-muted" />
                            <span className="text-sm profile-text-secondary">
                              الخبرة: {profileData.professionalInfo.experience}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {profileData.role === 'worker' && (
                        <>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 profile-text-muted" />
                            <span className="text-sm profile-text-secondary">
                              السعر اليومي: {profileData.professionalInfo.dailyRate?.toLocaleString()} دج
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 profile-text-muted" />
                            <span className="text-sm profile-text-secondary">
                              {profileData.professionalInfo.skills?.length || 0} مهارة
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {profileData.role === 'worker' && profileData.professionalInfo.skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {profileData.professionalInfo.skills.slice(0, 5).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded text-xs font-medium profile-text-secondary border border-gray-200/50 dark:border-gray-700/50">
                            {skill}
                          </span>
                        ))}
                        {profileData.professionalInfo.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100/50 dark:bg-gray-700/50 rounded text-xs font-medium profile-text-secondary">
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
        <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 rounded-t-2xl">
          <nav className="flex space-x-8 rtl:space-x-reverse overflow-x-auto scrollbar-hide px-2">
            <button
              onClick={() => setActiveTab('about')}
              className={`profile-tab py-4 px-1 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'about' ? 'profile-tab-active' : 'profile-tab-inactive'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>نبذة</span>
            </button>
            
            {showPostsTab && (
              <button
                onClick={() => setActiveTab('posts')}
                className={`profile-tab py-4 px-1 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'posts' ? 'profile-tab-active' : 'profile-tab-inactive'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>المنشورات</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('reviews')}
              className={`profile-tab py-4 px-1 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'reviews' ? 'profile-tab-active' : 'profile-tab-inactive'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>التقييمات</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="profile-glass-card p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  نبذة عن المستخدم
                </h3>
                
                <div className="space-y-6">
                  {profileData.bio && (
                    <div>
                      <h4 className="text-sm font-medium profile-text-muted mb-2">السيرة الذاتية</h4>
                      <p className="profile-text-secondary">{profileData.bio}</p>
                    </div>
                  )}
                  
                  {(profileData.email || profileData.phone || profileData.location) && (
                    <div>
                      <h4 className="text-sm font-medium profile-text-muted mb-2">معلومات الاتصال</h4>
                      <div className="space-y-2">
                        {profileData.email && (isOwnProfile || profileData.privacy?.showEmail) && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 profile-text-muted" />
                            <a href={`mailto:${profileData.email}`} className="profile-text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {profileData.email}
                            </a>
                          </div>
                        )}
                        
                        {profileData.phone && (isOwnProfile || profileData.privacy?.showPhone) && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 profile-text-muted" />
                            <a href={`tel:${profileData.phone}`} className="profile-text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {profileData.phone}
                            </a>
                          </div>
                        )}
                        
                        {profileData.location && (isOwnProfile || profileData.privacy?.showLocation) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 profile-text-muted" />
                            <span className="profile-text-secondary">{profileData.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {profileData.role !== 'client' && profileData.professionalInfo && (
                    <div>
                      <h4 className="text-sm font-medium profile-text-muted mb-2">المعلومات المهنية</h4>
                      <div className="space-y-2">
                        {profileData.role === 'artisan' && (
                          <>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 profile-text-muted" />
                              <span className="profile-text-secondary">
                                الحرفة: {profileData.professionalInfo.craft}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 profile-text-muted" />
                              <span className="profile-text-secondary">
                                الخبرة: {profileData.professionalInfo.experience}
                              </span>
                            </div>
                          </>
                        )}
                        {profileData.role === 'worker' && (
                          <>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 profile-text-muted" />
                              <span className="profile-text-secondary">
                                السعر اليومي: {profileData.professionalInfo.dailyRate?.toLocaleString()} دج
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Wrench className="w-4 h-4 profile-text-muted mt-1" />
                              <div>
                                <span className="profile-text-secondary block mb-1">المهارات:</span>
                                <div className="flex flex-wrap gap-2">
                                  {profileData.professionalInfo.skills?.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded text-xs profile-text-secondary border border-gray-200/50 dark:border-gray-700/50">
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
                    <h4 className="text-sm font-medium profile-text-muted mb-2">معلومات الحساب</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 profile-text-muted" />
                        <span className="profile-text-secondary">
                          انضم في {formatDate(profileData.createdAt, currentLanguage)}
                        </span>
                      </div>
                      {profileData.isVerified && profileData.verifiedAt && (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-blue-500" />
                          <span className="profile-text-secondary text-blue-600 dark:text-blue-400">
                            حساب موثق منذ {formatDate(profileData.verifiedAt, currentLanguage)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && showPostsTab && (
              <div className="space-y-4">
                {posts.length === 0 && !postsLoading && (
                  <div className="profile-glass-card p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 profile-text-muted" />
                    <h3 className="text-lg font-medium mb-2">
                      لا توجد منشورات
                    </h3>
                    {isOwnProfile && canCreatePost && (
                      <button
                        onClick={handleCreatePost}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                      >
                        <PlusCircle className="w-5 h-5" />
                        <span>أنشئ منشورك الأول</span>
                      </button>
                    )}
                  </div>
                )}

                {postsLoading && posts.length === 0 && (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="profile-glass-card p-4 animate-pulse">
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
                    onDelete={handlePostDelete}
                  />
                ))}
                
                <div id="posts-sentinel" className="h-10" />
                
                {postsLoading && posts.length > 0 && (
                  <div className="text-center py-4">
                    <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                  </div>
                )}
                
                {!hasMorePosts && posts.length > 0 && (
                  <div className="text-center py-4 profile-text-muted text-sm">
                    🏁 لقد وصلت إلى نهاية المنشورات
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="profile-glass-card p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold">
                          {reviewsStats.average?.toFixed(1) || 0}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${
                              star <= Math.round(reviewsStats.average || 0)
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          ))}
                        </div>
                        <div className="text-xs profile-text-muted mt-1">
                          {reviewsStats.count || 0} تقييم
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = reviewsStats.distribution?.[rating] || 0;
                          const percentage = reviewsStats.count > 0 
                            ? (count / reviewsStats.count) * 100 
                            : 0;
                          return (
                            <div key={rating} className="flex items-center gap-2">
                              <span className="text-xs profile-text-muted w-6">
                                {rating} ★
                              </span>
                              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs profile-text-muted w-8">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {reviewsLoading && reviews.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="profile-glass-card p-4 animate-pulse">
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
                ) : reviews.length === 0 ? (
                  <div className="profile-glass-card p-8 text-center">
                    <Star className="w-12 h-12 mx-auto mb-4 profile-text-muted" />
                    <h3 className="text-lg font-medium mb-2">
                      لا توجد تقييمات
                    </h3>
                    <p className="profile-text-secondary">
                      {isOwnProfile 
                        ? 'لم يتم تقييمك بعد'
                        : 'لا توجد تقييمات لهذا المستخدم'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review._id} id={`review-${review._id}`}>
                        <ReviewCard
                          review={review}
                          onDelete={handleReviewDelete}
                          onUpdate={updateReview}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div id="reviews-sentinel" className="h-10" />
                
                {reviewsLoading && reviews.length > 0 && (
                  <div className="text-center py-4">
                    <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                  </div>
                )}
                
                {!hasMoreReviews && reviews.length > 0 && (
                  <div className="text-center py-4 profile-text-muted text-sm">
                    🏁 لقد وصلت إلى نهاية التقييمات
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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
                className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImgProfile;
                }}
              />
              <button 
                onClick={() => setShowImageModal(false)} 
                className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={showAddReviewModal}
        onClose={() => {
          setShowAddReviewModal(false);
          loadReviews(true);
        }}
        reviewedUserId={profileData?._id}
        reviewedUserName={profileData?.username}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
          setReviewToDelete(null);
        }}
        onConfirm={executeBlockAction}
        title={
          confirmAction === 'block' ? 'حظر المستخدم' :
          confirmAction === 'unblock' ? 'إلغاء حظر المستخدم' :
          'حذف التقييم'
        }
        message={
          confirmAction === 'block'
            ? `هل أنت متأكد من رغبتك في حظر المستخدم ${profileData?.username}؟\n\nبعد الحظر، لن تتمكن من رؤية منشوراته أو مراسلته.`
            : confirmAction === 'unblock'
            ? `هل أنت متأكد من رغبتك في إلغاء حظر المستخدم ${profileData?.username}؟`
            : 'هل أنت متأكد من حذف هذا التقييم؟\n\nلا يمكن التراجع عن هذا الإجراء.'
        }
        confirmText={
          confirmAction === 'block' ? 'حظر' :
          confirmAction === 'unblock' ? 'إلغاء الحظر' :
          'حذف'
        }
        cancelText="إلغاء"
        isDanger={confirmAction !== 'unblock'}
      />
    </div>
  );
};

export default Profile;