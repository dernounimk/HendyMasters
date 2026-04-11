import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import socketService from '../services/socketService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User, ArrowLeft, CheckCheck, Check, Clock, Loader,
  MessageCircle, Wifi, WifiOff, Ban, Trash2, ShieldAlert, AlertCircle
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

// مكون Popup التأكيد المخصص
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
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

const Messages = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, fetchBlockedUsers } = useStore();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [blockingUser, setBlockingUser] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // State للـ Popup التأكيد
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'delete', 'block', 'unblock'
  
  // Refs
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  
  // تعريف otherUser
  const otherUser = currentConversation?.participants?.find(p => p._id !== user?._id);
  const isUserOnline = onlineUsers.some(u => u.id === otherUser?._id);
  const isTyping = Object.values(typingUsers).length > 0;
  
  // التحقق من المصادقة
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);
  
  // تهيئة Socket
  useEffect(() => {
    if (token && isAuthenticated) {
      socketService.initialize(token);
      const interval = setInterval(() => setIsSocketConnected(socketService.getConnectionStatus()), 3000);
      return () => clearInterval(interval);
    }
  }, [token, isAuthenticated]);
  
  // جلب قائمة المحظورين
  const loadBlockedUsers = useCallback(async () => {
    try {
      const blocked = await fetchBlockedUsers();
      setBlockedUsers(blocked || []);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  }, [fetchBlockedUsers]);
  
  // جلب المحادثات
  const fetchConversations = useCallback(async () => {
    if (!isSocketConnected) {
      console.log('Socket not connected, waiting...');
      return;
    }
    
    console.log('📋 Fetching conversations...');
    
    socketService.emit('conversations:fetch', { page: 1, limit: 50 }, (response) => {
      console.log('📋 Conversations response:', response);
      
      if (response?.success) {
        let conversationsList = response.data || [];
        
        const filteredConversations = conversationsList.filter(conv => {
          const other = conv.participants?.find(p => p._id !== user?._id);
          if (!other) return false;
          if (other._id === user?._id) return false;
          return !blockedUsers.some(blocked => blocked._id === other._id);
        });
        
        setConversations(filteredConversations);
        
        if (conversationId && !currentConversation) {
          const conv = filteredConversations.find(c => c._id === conversationId);
          if (conv) selectConversation(conv);
        }
      } else {
        console.error('Error fetching conversations:', response?.message);
      }
    });
  }, [isSocketConnected, user, blockedUsers, conversationId, currentConversation]);
  
  // جلب الرسائل
  const fetchMessages = async (convId, reset = true, pageToFetch = 1) => {
    try {
      if (reset) {
        setLoading(true);
        setMessages([]);
        setPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await api.get(`/messages/conversations/${convId}/messages`, {
        params: { page: pageToFetch, limit: 30 }
      });
      
      if (response.data?.success) {
        const newMessages = response.data.data || [];
        
        if (reset) {
          setMessages(newMessages);
          setTimeout(() => scrollToBottom(), 100);
        } else {
          const container = messagesContainerRef.current;
          const oldScrollHeight = container?.scrollHeight || 0;
          
          setMessages(prev => [...newMessages, ...prev]);
          setHasMore(newMessages.length === 30);
          setPage(pageToFetch + 1);
          
          if (container && newMessages.length > 0) {
            setTimeout(() => {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - oldScrollHeight;
            }, 50);
          }
        }
        
        if (socketService.getConnectionStatus()) {
          socketService.emit('messages:read', { conversationId: convId });
        }
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('غير مصرح لك بالوصول إلى هذه المحادثة');
        setConversations(prev => prev.filter(conv => conv._id !== convId));
        navigate('/messages');
      } else {
        toast.error('فشل في جلب الرسائل');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isInitialLoadRef.current = false;
    }
  };
  
  // دالة التمرير للأسفل
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // دالة عرض محتوى الرسالة مع زر قابل للنقر
  const renderMessageContent = (content) => {
    if (!content) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    
    if (urls && urls.length > 0) {
      const parts = [];
      let lastIndex = 0;
      
      urls.forEach((url, idx) => {
        const urlIndex = content.indexOf(url, lastIndex);
        if (urlIndex > lastIndex) {
          parts.push(<span key={`text-${idx}`}>{content.substring(lastIndex, urlIndex)}</span>);
        }
        
        const pathMatch = url.match(/\/post\/([a-f0-9]+)/);
        const postId = pathMatch ? pathMatch[1] : null;
        
        if (postId) {
          parts.push(
            <Link
              key={`link-${idx}`}
              to={`/post/${postId}`}
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#0095f6] hover:bg-[#0081d6] text-white text-sm font-semibold rounded-lg transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              عرض المنشور
            </Link>
          );
        } else {
          parts.push(
            <a
              key={`link-${idx}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#0095f6] hover:bg-[#0081d6] text-white text-sm font-semibold rounded-lg transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              فتح الرابط
            </a>
          );
        }
        
        lastIndex = urlIndex + url.length;
      });
      
      if (lastIndex < content.length) {
        parts.push(<span key="text-end">{content.substring(lastIndex)}</span>);
      }
      
      return (
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {parts.map((part, i) => (
            <React.Fragment key={i}>{part}</React.Fragment>
          ))}
        </div>
      );
    }
    
    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // إرسال رسالة
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !isSocketConnected) {
      if (!isSocketConnected) toast.error('لا يوجد اتصال بالخادم');
      return;
    }
    
    if (isBlocked) {
      toast.error('لا يمكنك إرسال رسالة لمستخدم محظور');
      return;
    }
    
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      content,
      sender: { _id: user._id, username: user.username, profileImage: user.profileImage },
      createdAt: new Date().toISOString(),
      readBy: [user._id],
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setTimeout(() => scrollToBottom(), 50);
    
    socketService.emit('message:send', {
      conversationId: currentConversation?._id,
      recipientId: otherUser?._id,
      content
    }, (response) => {
      if (response?.success) {
        setMessages(prev => prev.map(msg => msg._id === tempId ? response.data.message : msg));
        setConversations(prev => prev.map(conv => 
          conv._id === response.data.conversationId 
            ? { ...conv, lastMessage: response.data.message, lastMessageAt: response.data.message.createdAt, unreadCount: 0 }
            : conv
        ));
      } else {
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
        toast.error(response?.message || 'فشل في إرسال الرسالة');
        setNewMessage(content);
      }
      setSending(false);
    });
  };
  
  // التمرير للأعلى لتحميل المزيد
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    if (scrollTop <= 50 && !loadingMore && hasMore && !loading && currentConversation && !isInitialLoadRef.current) {
      console.log('📋 Loading more messages, page:', page);
      fetchMessages(currentConversation._id, false, page);
    }
  }, [loadingMore, hasMore, loading, currentConversation, page, fetchMessages]);
  
  // حدث الكتابة
  const handleTyping = () => {
    if (!currentConversation || !isSocketConnected || isBlocked) return;
    if (!otherUser) return;
    
    socketService.emit('typing:start', { 
      conversationId: currentConversation._id, 
      recipientId: otherUser._id 
    });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isSocketConnected) {
        socketService.emit('typing:stop', { 
          conversationId: currentConversation._id, 
          recipientId: otherUser._id 
        });
      }
    }, 2000);
  };
  
  // فتح Popup تأكيد حذف المحادثة
  const openDeleteConfirm = () => {
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };
  
  // فتح Popup تأكيد حظر المستخدم
  const openBlockConfirm = () => {
    setConfirmAction(isBlocked ? 'unblock' : 'block');
    setShowConfirmModal(true);
  };
  
  // اختيار محادثة
  const selectConversation = (conversation) => {
    console.log('📨 Selecting conversation:', conversation._id);
    
    const other = conversation.participants?.find(p => p._id !== user?._id);
    if (other && blockedUsers.some(blocked => blocked._id === other._id)) {
      toast.error('لا يمكنك الوصول إلى هذه المحادثة، المستخدم محظور');
      setConversations(prev => prev.filter(conv => conv._id !== conversation._id));
      return;
    }
    
    setCurrentConversation(conversation);
    setIsBlocked(blockedUsers.some(blocked => blocked._id === other?._id));
    setPage(1);
    setHasMore(true);
    isInitialLoadRef.current = true;
    fetchMessages(conversation._id, true, 1);
    navigate(`/messages/${conversation._id}`);
  };
  
  // حذف المحادثة بعد التأكيد
  const executeDeleteConversation = async () => {
    if (!currentConversation) return;
    
    setDeletingConversation(true);
    try {
      const response = await api.delete(`/messages/conversations/${currentConversation._id}`);
      if (response.data.success) {
        toast.success('تم حذف المحادثة بنجاح');
        setConversations(prev => prev.filter(conv => conv._id !== currentConversation._id));
        setCurrentConversation(null);
        navigate('/messages');
      } else {
        toast.error(response.data.message || 'فشل حذف المحادثة');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف المحادثة');
    } finally {
      setDeletingConversation(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };
  
  // حظر مستخدم بعد التأكيد
  const executeBlockUser = async () => {
    if (!otherUser) return;
    
    setBlockingUser(true);
    try {
      if (confirmAction === 'unblock') {
        // إلغاء الحظر
        const response = await api.delete(`/users/block/${otherUser._id}`);
        if (response.data.success) {
          toast.success(`تم إلغاء حظر المستخدم ${otherUser.username}`);
          await loadBlockedUsers();
          setIsBlocked(false);
          await fetchConversations();
        } else {
          toast.error(response.data.message || 'فشل إلغاء الحظر');
        }
      } else {
        // حظر المستخدم
        const response = await api.post(`/users/block/${otherUser._id}`);
        if (response.data.success) {
          toast.success(`تم حظر المستخدم ${otherUser.username} بنجاح`);
          await loadBlockedUsers();
          setConversations(prev => prev.filter(conv => conv._id !== currentConversation._id));
          setCurrentConversation(null);
          setIsBlocked(true);
          navigate('/messages');
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
  
  // تنفيذ الإجراء حسب نوع التأكيد
  const handleConfirmAction = () => {
    if (confirmAction === 'delete') {
      executeDeleteConversation();
    } else if (confirmAction === 'block' || confirmAction === 'unblock') {
      executeBlockUser();
    }
  };
  
  // الحصول على نص رسالة التأكيد
  const getConfirmModalProps = () => {
    if (confirmAction === 'delete') {
      return {
        title: 'حذف المحادثة',
        message: `هل أنت متأكد من رغبتك في حذف هذه المحادثة؟\n\nسيتم حذف جميع الرسائل ولا يمكن استعادتها.`,
        confirmText: 'حذف',
        isDanger: true
      };
    } else if (confirmAction === 'block') {
      return {
        title: 'حظر المستخدم',
        message: `هل أنت متأكد من رغبتك في حظر المستخدم ${otherUser?.username}؟\n\nبعد الحظر، لن تتمكن من رؤية منشوراته أو مراسلته.`,
        confirmText: 'حظر',
        isDanger: true
      };
    } else if (confirmAction === 'unblock') {
      return {
        title: 'إلغاء حظر المستخدم',
        message: `هل أنت متأكد من رغبتك في إلغاء حظر المستخدم ${otherUser?.username}؟`,
        confirmText: 'إلغاء الحظر',
        isDanger: false
      };
    }
    return {};
  };
  
  // التمرير عند إضافة رسائل جديدة
  useEffect(() => {
    if (!loading && !loadingMore && messages.length > 0 && !isInitialLoadRef.current) {
      scrollToBottom();
    }
  }, [messages, loading, loadingMore]);
  
  // تأثيرات Socket
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (isBlocked) return;
      if (currentConversation?._id === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
        if (isSocketConnected) {
          socketService.emit('messages:read', { conversationId: data.conversationId });
        }
        setTimeout(() => scrollToBottom(), 100);
      }
      setConversations(prev => prev.map(conv => 
        conv._id === data.conversationId 
          ? { ...conv, lastMessage: data.message, lastMessageAt: data.message.createdAt, unreadCount: (conv.unreadCount || 0) + 1 }
          : conv
      ));
    };
    
    const handleTypingStart = (data) => {
      if (isBlocked) return;
      if (currentConversation?._id === data.conversationId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.username }));
      }
    };
    
    const handleTypingStop = (data) => {
      if (isBlocked) return;
      if (currentConversation?._id === data.conversationId) {
        setTypingUsers(prev => {
          const newState = { ...prev };
          delete newState[data.userId];
          return newState;
        });
      }
    };
    
    socketService.on('message:new', handleNewMessage);
    socketService.on('typing:start', handleTypingStart);
    socketService.on('typing:stop', handleTypingStop);
    socketService.on('users:online', setOnlineUsers);
    
    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('typing:start', handleTypingStart);
      socketService.off('typing:stop', handleTypingStop);
      socketService.off('users:online', setOnlineUsers);
    };
  }, [currentConversation, isSocketConnected, isBlocked]);
  
  useEffect(() => { 
    loadBlockedUsers(); 
  }, [loadBlockedUsers]);
  
  useEffect(() => { 
    fetchConversations(); 
  }, [fetchConversations]);
  
  useEffect(() => {
    if (currentConversation && otherUser) {
      setIsBlocked(blockedUsers.some(blocked => blocked._id === otherUser._id));
    }
  }, [currentConversation, blockedUsers, otherUser]);
  
  useEffect(() => {
    if (isSocketConnected) {
      fetchConversations();
    }
  }, [isSocketConnected]);
  
  // دوال مساعدة
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    if (hours < 24) return date.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
    if (hours < 48) return 'أمس';
    return date.toLocaleDateString('ar-DZ');
  };
  
  const getReadStatus = (message) => {
    if (message.isTemp) return <Loader className="w-3 h-3 animate-spin" />;
    if (message.readBy?.length > 1) return <CheckCheck className="w-3 h-3 text-blue-500" />;
    if (message.readBy?.length === 1 && message.sender._id === user?._id) return <Check className="w-3 h-3" />;
    if (message.sender._id === user?._id) return <Clock className="w-3 h-3" />;
    return null;
  };
  
  const modalProps = getConfirmModalProps();
  
  return (
    <div style={{ height: '100%', display: 'flex', padding: '0' }} className="bg-gray-50 dark:bg-gray-900">
      {/* قائمة المحادثات */}
      <div className={`w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col ${currentConversation ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> الرسائل
            </h2>
            {isSocketConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">لا توجد محادثات</p>
              <Link to="/explore" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">ابحث عن أشخاص</Link>
            </div>
          ) : (
            conversations.map(conv => {
              const other = conv.participants?.find(p => p._id !== user?._id);
              if (!other) return null;
              const isOnline = onlineUsers.some(u => u.id === other._id);
              const lastMessage = conv.lastMessage;
              const unread = conv.unreadCount || 0;
              return (
                <div key={conv._id} onClick={() => selectConversation(conv)} className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${currentConversation?._id === conv._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={other.profileImage || defaultImgProfile} alt={other.username} className="w-12 h-12 rounded-full object-cover" onError={(e) => e.target.src = defaultImgProfile} />
                      {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{other.username}</p>
                        {lastMessage && <span className="text-xs text-gray-500">{formatTime(lastMessage.createdAt)}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate">{lastMessage?.sender?._id === user?._id ? 'أنت: ' : ''}{lastMessage?.content?.substring(0, 50) || 'لا توجد رسائل'}</p>
                        {unread > 0 && <span className="bg-primary-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">{unread > 99 ? '99+' : unread}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* نافذة المحادثة */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-gray-800 ${!currentConversation ? 'hidden sm:flex' : 'flex'}`}>
        {currentConversation && otherUser ? (
          <>
            {/* رأس المحادثة */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/messages')} className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                <div className="flex items-center gap-3">
                  <img src={otherUser.profileImage || defaultImgProfile} alt={otherUser.username} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{otherUser.username}</p>
                    <p className="text-xs text-gray-500">{isUserOnline ? 'متصل' : 'غير متصل'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={openDeleteConfirm} disabled={deletingConversation} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600" title="حذف المحادثة">
                  <Trash2 className="w-5 h-5" />
                </button>
                {isBlocked ? (
                  <button onClick={openBlockConfirm} disabled={blockingUser} className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-600" title="إلغاء الحظر">
                    <Ban className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={openBlockConfirm} disabled={blockingUser} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600" title="حظر المستخدم">
                    <Ban className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* رسالة الحظر */}
            {isBlocked && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 text-center border-b border-red-200 dark:border-red-800 flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 dark:text-red-400 font-medium">لقد قمت بحظر هذا المستخدم</p>
                <p className="text-red-500 dark:text-red-300 text-sm mt-1">لا يمكنك إرسال أو استقبال رسائل من هذا المستخدم</p>
              </div>
            )}
            
            {/* حاوية الرسائل - مع minHeight: 0 لإصلاح السكرول */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1"
              style={{ 
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: 0
              }}
            >
              {loadingMore && (
                <div className="flex justify-center py-2">
                  <Loader className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-xs text-gray-400 mr-2">جاري تحميل المزيد...</span>
                </div>
              )}
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center py-8 text-gray-500">
                  <p>لا توجد رسائل بعد، ابدأ المحادثة</p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isOwn = message.sender?._id === user?._id;
                    const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id;
                    return (
                      <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[75%]`}>
                          {!isOwn && showAvatar && (
                            <img 
                              src={message.sender?.profileImage || defaultImgProfile} 
                              alt="" 
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0" 
                            />
                          )}
                          {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}
                          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-full`}>
                            <div className={`px-4 py-2 rounded-2xl break-words max-w-full ${isOwn ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                              {renderMessageContent(message.content)}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {isOwn && getReadStatus(message)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && !isBlocked && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2">
                        <img src={otherUser.profileImage || defaultImgProfile} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* حقل إدخال الرسالة */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && !isBlocked && sendMessage()} 
                  onKeyUp={isBlocked ? undefined : handleTyping} 
                  placeholder={isBlocked ? "لا يمكنك إرسال رسائل لمستخدم محظور" : "اكتب رسالة..."} 
                  disabled={isBlocked}
                  className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || sending || !isSocketConnected || isBlocked} 
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {!isSocketConnected && <p className="text-xs text-red-500 mt-2 text-center">لا يوجد اتصال بالخادم</p>}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">اختر محادثة</h3>
            <p className="text-gray-500">اختر محادثة من القائمة للبدء في المراسلة</p>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={modalProps.title}
        message={modalProps.message}
        confirmText={modalProps.confirmText}
        cancelText="إلغاء"
        isDanger={modalProps.isDanger}
      />
    </div>
  );
};

export default Messages;