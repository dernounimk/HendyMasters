// frontend/src/components/PostCard.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin, DollarSign, Heart, MessageCircle,
  Star, Clock, Share2, Bookmark, Send, XCircle, Loader
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

const PostCard = ({ post, onLike, onSave }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, savePost } = useStore();
  
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats?.likesCount || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  
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
  
  const handleShareClick = async (e) => {
    e.stopPropagation();
    setLoadingConversations(true);
    setShowShareModal(true);
    try {
      const response = await api.get('/posts/conversations-for-sharing');
      if (response.data?.success) {
        setConversations(response.data.users);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };
  
  const handleShareWithUser = async (userId, e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/posts/${post._id}/share`, {
        userIds: [userId]
      });
      if (response.data.success) {
        toast.success('تمت المشاركة بنجاح');
        setShowShareModal(false);
      }
    } catch (error) {
      toast.error('فشل المشاركة');
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
    <>
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
            
            {/* Share Button */}
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
                    <Share2 className="w-4 h-4" />
                    نسخ الرابط
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShareClick(e); setShowShareMenu(false); }}
                    className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    مشاركة مع مستخدم
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
          
          {/* Skills Tags */}
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
                <button
                  onClick={handleMessage}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  مراسلة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">مشاركة البوست</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">شارك مع الأشخاص الذين تواصلت معهم</p>
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              {loadingConversations ? (
                <div className="text-center py-8"><Loader className="w-8 h-8 animate-spin mx-auto" /></div>
              ) : conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map(conv => (
                    <button
                      key={conv._id}
                      onClick={(e) => handleShareWithUser(conv._id, e)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                    >
                      <img src={conv.profileImage || defaultImgProfile} alt={conv.username} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{conv.username}</p>
                      </div>
                      <Send className="w-4 h-4 text-primary-600" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا يوجد محادثات للمشاركة</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;