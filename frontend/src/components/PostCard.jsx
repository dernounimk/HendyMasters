// frontend/src/components/PostCard.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin, Heart, MessageCircle,
  Clock, Share2, Bookmark, Send, XCircle, Loader, Trash2, AlertCircle
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

// إضافة CSS مخصص لبطاقة البوست
const postCardStyle = document.createElement('style');
postCardStyle.textContent = `
  /* ==================== بطاقة البوست ==================== */
  .post-card {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(12px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  
  .dark .post-card {
    background: rgba(17, 24, 39, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.3);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }
  
  .post-card:hover {
    border-color: #2563eb !important;
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px);
  }
  
  .dark .post-card:hover {
    border-color: #3b82f6 !important;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
  }
  
  /* النصوص في البطاقة */
  .post-card .post-title {
    color: #1f2937 !important;
  }
  
  .dark .post-card .post-title {
    color: #f3f4f6 !important;
  }
  
  .post-card .post-description {
    color: #4b5563 !important;
  }
  
  .dark .post-card .post-description {
    color: #d1d5db !important;
  }
  
  .post-card .post-meta {
    color: #6b7280 !important;
  }
  
  .dark .post-card .post-meta {
    color: #9ca3af !important;
  }
  
  .post-card .username {
    color: #1f2937 !important;
  }
  
  .dark .post-card .username {
    color: #f3f4f6 !important;
  }
  
  .post-card .username:hover {
    color: #2563eb !important;
  }
  
  .dark .post-card .username:hover {
    color: #3b82f6 !important;
  }
  
  /* العلامة الزرقاء المصغرة للبوستات */
  .post-verified-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.875rem;
    height: 0.875rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    margin-left: 0.25rem;
    flex-shrink: 0;
  }
  
  .post-verified-badge svg {
    width: 0.5rem;
    height: 0.5rem;
    color: white;
    stroke-width: 3;
  }
`;
document.head.appendChild(postCardStyle);

// مكون ConfirmationModal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger = true }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
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
          
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
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
      </div>
    </div>
  );
};

const PostCard = ({ post, onLike, onSave, onShare, onDelete }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, savePost } = useStore();
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats?.likesCount || 0);
  const [savesCount, setSavesCount] = useState(post.stats?.savesCount || 0);
  const [sharesCount, setSharesCount] = useState(post.stats?.sharesCount || 0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const isOwner = user?._id === post.author?._id;
  
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
    return post.type === 'service_request' ? t('postTypes.serviceRequest') : t('postTypes.jobOpportunity');
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
      toast.error(t('errors.general'));
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
        setSavesCount(result.data.savesCount);
        if (onSave) onSave(post._id, result.data.saved);
        toast.success(result.data.saved ? t('messages.saved') : t('messages.unsaved'));
      }
    } catch (error) {
      toast.error(error.message || t('errors.general'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleMessage = async (e) => {
    e.stopPropagation();
    
    if (!user) {
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
  
  const handleShareClick = async (e) => {
    e.stopPropagation();
    setLoadingConversations(true);
    setShowShareModal(true);
    try {
      const response = await api.get('/posts/conversations-for-sharing');
      if (response.data?.success) {
        const users = response.data.users || [];
        const filteredUsers = users.filter(u => u._id !== user?._id);
        setConversations(filteredUsers);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations for sharing:', error);
      toast.error(t('errors.loadConversations'));
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };
  
  const handleShareWithUser = async (recipientId, recipientName, e) => {
    e.stopPropagation();
    
    if (recipientId === user?._id) {
      toast.error(t('messages.cannotShareWithSelf'));
      setShowShareModal(false);
      return;
    }
    
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
            if (onShare) onShare(post._id, shareResponse.data.data.sharesCount);
          }
        } catch (shareError) {
          console.error('Error updating share count:', shareError);
        }
      } else {
        toast.error(t('messages.shareFailed'));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error sharing with user:', error);
      toast.error(error.message || t('messages.shareError'));
    } finally {
      setSharing(false);
    }
  };
  
  const handleCopyLink = async (e) => {
    e.stopPropagation();
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
          if (onShare) onShare(post._id, shareResponse.data.data.sharesCount);
        }
      } catch (shareError) {
        console.error('Error updating share count:', shareError);
      }
    } catch (error) {
      toast.error(t('messages.copyLinkFailed'));
    }
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
        if (onDelete) {
          onDelete(post._id);
        }
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
  
  return (
    <>
      <div className="post-card overflow-hidden">
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
              <Link 
                to={`/profile/${post.author?.username}`} 
                className="username font-semibold hover:text-primary-600 transition-colors flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {post.author?.username}
                {post.author?.isVerified && (
                  <div className="post-verified-badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </Link>
              <div className="post-meta flex items-center gap-2 text-xs">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                {showMoreMenu && (
                  <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMoreMenu(false);
                        setShowDeleteModal(true);
                      }}
                      disabled={deleting}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t('actions.deletePost')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="cursor-pointer" onClick={() => navigate(`/post/${post._id}`)}>
          <div className="px-4 pb-2">
            <h3 className="post-title text-lg font-bold mb-2">
              {post.title}
            </h3>
            
            <div className="post-meta flex flex-wrap gap-3 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{post.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{formatCurrency(post.budget)}</span>
              </div>
            </div>
            
            <p className="post-description text-sm mb-3 line-clamp-3">
              {post.description}
            </p>
          </div>
          
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
        </div>
        
        <div className="p-4 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 transition-colors ${
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
                  className={`flex items-center gap-1.5 transition-colors ${
                    isSaved ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500 dark:text-gray-400'
                  }`}
                >
                  <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                  <span className="text-sm">{savesCount}</span>
                </button>
              )}
              
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">{sharesCount}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {!isOwner && (
                <button
                  onClick={handleMessage}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('actions.message')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal تأكيد الحذف */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('modals.deletePostTitle')}
        message={t('modals.deletePostMessage', { title: post.title })}
        confirmText={t('modals.delete')}
        cancelText={t('common.cancel')}
        isDanger={true}
      />
      
      {/* Modal المشاركة */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('modals.sharePostTitle')}</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('modals.sharePostDescription')}</p>
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              {loadingConversations ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                  <p className="text-gray-500 dark:text-gray-400 mt-2">{t('messages.loadingConversations')}</p>
                </div>
              ) : conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map(conv => (
                    <button
                      key={conv._id}
                      onClick={(e) => handleShareWithUser(conv._id, conv.username, e)}
                      disabled={sharing}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <img 
                        src={conv.profileImage || defaultImgProfile} 
                        alt={conv.username} 
                        className="w-12 h-12 rounded-full object-cover" 
                        onError={(e) => e.target.src = defaultImgProfile}
                      />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">{conv.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('modals.sendAsMessage')}</p>
                      </div>
                      {sharing ? (
                        <Loader className="w-4 h-4 animate-spin text-primary-500" />
                      ) : (
                        <Send className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('modals.noConversations')}</p>
                  <button
                    onClick={handleCopyLink}
                    className="mt-3 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                  >
                    {t('modals.copyLink')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;