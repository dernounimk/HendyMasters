// frontend/src/pages/PostDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin, Heart, MessageCircle, Share2, Bookmark, Clock,
  Send, X, Loader, AlertCircle, ChevronRight, Trash2
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

// مكون ConfirmationModal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
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
      </div>
    </div>
  );
};

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        setError(response.data.message || 'فشل في تحميل البوست');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || 'حدث خطأ في تحميل البوست');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);
  
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
  
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
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
      toast.error('حدث خطأ');
    }
  };
  
  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
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
        toast.success(result.data.saved ? 'تم الحفظ' : 'تم الإزالة');
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };
  
  const handleMessage = async () => {
    if (!isAuthenticated) {
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
        
        const messageText = `${user?.username}
اهتمام بمنشورك

${post.title}
${formatCurrency(post.budget)} · ${post.location}

${postUrl}

نرحب بالتفاصيل`;
        
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
    const loadingToast = toast.loading(`جاري المشاركة مع ${recipientName}...`);
    
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      
      const shareMessage = `${user?.username} شارك معك منشوراً

${post.title}
${formatCurrency(post.budget)} · ${post.location}

${postUrl}`;
      
      const { createConversation } = useStore.getState();
      const result = await createConversation(recipientId, shareMessage);
      
      toast.dismiss(loadingToast);
      
      if (result?.conversation?._id || result?._id) {
        toast.success(`تمت المشاركة مع ${recipientName} بنجاح`);
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
        toast.error('فشل في إرسال المشاركة');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'حدث خطأ أثناء المشاركة');
    } finally {
      setSharing(false);
    }
  };
  
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط المنشور');
      
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
      toast.error('فشل نسخ الرابط');
    }
    setShowShareModal(false);
  };
  
  const handleDelete = async () => {
    if (deleting) return;
    
    setDeleting(true);
    const loadingToast = toast.loading('جاري حذف المنشور...');
    
    try {
      const response = await api.delete(`/posts/${post._id}`);
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success('تم حذف المنشور بنجاح');
        navigate('/');
      } else {
        throw new Error(response.data.message || 'فشل حذف المنشور');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error deleting post:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف المنشور');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل المنشور...</p>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            عذراً!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'المنشور غير موجود أو تم حذفه'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-4 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
        <span>رجوع</span>
      </button>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author?.username}`}>
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
            
            {/* زر القائمة - يظهر فقط لصاحب البوست */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                {showMoreMenu && (
                  <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowDeleteModal(true);
                      }}
                      disabled={deleting}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف المنشور</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="px-4 pb-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{post.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{formatCurrency(post.budget)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 whitespace-pre-wrap">
            {post.description}
          </p>
        </div>
        
        {post.images && post.images.length > 0 && (
          <div className="relative">
            {post.images.length === 1 ? (
              <div className="relative mt-2">
                <img
                  src={post.images[0].url}
                  alt={post.title}
                  className="w-full h-auto max-h-[500px] object-contain bg-gray-100 dark:bg-gray-900 cursor-pointer"
                  onClick={() => setSelectedImage(post.images[0].url)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 mt-2">
                {post.images.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img
                      src={img.url}
                      alt={`${post.title} - ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
                  <span className="text-sm">{savesCount}</span>
                </button>
              )}
              
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">{sharesCount}</span>
              </button>
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
      
      {/* Modal عرض الصورة */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
      
      {/* Modal تأكيد الحذف */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="حذف المنشور"
        message={`هل أنت متأكد من حذف المنشور "${post?.title}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
      />
      
      {/* Modal المشاركة */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">مشاركة المنشور</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">اختر شخصاً لمشاركة المنشور معه</p>
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              {loadingConversations ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                  <p className="text-gray-500 mt-2">جاري تحميل المحادثات...</p>
                </div>
              ) : conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map(conv => (
                    <button
                      key={conv._id}
                      onClick={() => handleShareWithUser(conv._id, conv.username)}
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
                        <p className="text-xs text-gray-500">أرسل كرسالة</p>
                      </div>
                      {sharing ? (
                        <Loader className="w-4 h-4 animate-spin text-primary-500" />
                      ) : (
                        <Send className="w-4 h-4 text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد محادثات للمشاركة</p>
                  <button
                    onClick={handleCopyLink}
                    className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    نسخ رابط المنشور
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;