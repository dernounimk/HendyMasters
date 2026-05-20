// frontend/src/pages/Messages.jsx
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

// إضافة CSS مخصص لصفحة الرسائل
const messagesStyle = document.createElement('style');
messagesStyle.textContent = `
  /* ==================== الوضع الفاتح ==================== */
  .messages-glass-container {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(203, 213, 225, 0.5);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }
  
  .messages-conversation-item {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(203, 213, 225, 0.4);
    transition: all 0.3s ease;
    border-radius: 16px;
  }
  
  .messages-conversation-item:hover {
    background: rgba(255, 255, 255, 1) !important;
    border-color: #2563eb !important;
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  }
  
  .messages-conversation-active {
    background: rgba(59, 130, 246, 0.12) !important;
    border-left: 3px solid #2563eb !important;
  }
  
  .messages-chat-header {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(203, 213, 225, 0.6);
  }
  
  .messages-bubble-sent {
    background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
    border-radius: 22px;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  }
  
  .messages-bubble-received {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(203, 213, 225, 0.6);
    border-radius: 22px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  
  .messages-input-container {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(8px);
    border-top: 1px solid rgba(203, 213, 225, 0.6);
  }
  
  .messages-input {
    background: rgba(243, 244, 246, 0.8) !important;
    border: 1px solid rgba(203, 213, 225, 0.5);
    border-radius: 24px;
    transition: all 0.3s ease;
  }
  
  .messages-input:focus {
    background: rgba(255, 255, 255, 1) !important;
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .messages-send-btn {
    background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
    border-radius: 24px;
    transition: all 0.3s ease;
  }
  
  .messages-send-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  
  .messages-glass-container *,
  .messages-conversation-item * {
    color: #000000 !important;
  }
  
  .messages-bubble-received,
  .messages-bubble-received * {
    color: #000000 !important;
  }
  
  .messages-bubble-sent,
  .messages-bubble-sent * {
    color: #ffffff !important;
  }
  
  .messages-bubble-sent .text-xs {
    color: rgba(255, 255, 255, 0.8) !important;
  }
  
  .messages-conversation-item .text-gray-500,
  .messages-conversation-item .text-xs {
    color: #4b5563 !important;
  }
  
  /* ==================== الوضع المظلم ==================== */
  .dark .messages-glass-container {
    background: rgba(17, 24, 39, 0.75) !important;
    border-color: rgba(75, 85, 99, 0.4);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  .dark .messages-conversation-item {
    background: rgba(31, 41, 55, 0.6) !important;
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .dark .messages-conversation-item:hover {
    background: rgba(31, 41, 55, 0.85) !important;
    border-color: #3b82f6 !important;
  }
  
  .dark .messages-conversation-active {
    background: rgba(59, 130, 246, 0.2) !important;
    border-left-color: #3b82f6 !important;
  }
  
  .dark .messages-chat-header {
    background: rgba(31, 41, 55, 0.85) !important;
    border-bottom-color: rgba(75, 85, 99, 0.4);
  }
  
  .dark .messages-bubble-sent {
    background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  }
  
  .dark .messages-bubble-received {
    background: rgba(55, 65, 81, 0.9) !important;
    border-color: rgba(75, 85, 99, 0.5);
  }
  
  .dark .messages-bubble-received,
  .dark .messages-bubble-received * {
    color: #ffffff !important;
  }
  
  .dark .messages-input-container {
    background: rgba(31, 41, 55, 0.85) !important;
    border-top-color: rgba(75, 85, 99, 0.4);
  }
  
  .dark .messages-input {
    background: rgba(55, 65, 81, 0.8) !important;
    border-color: rgba(75, 85, 99, 0.5);
    color: #ffffff !important;
  }
  
  .dark .messages-input:focus {
    background: rgba(55, 65, 81, 1) !important;
    border-color: #3b82f6 !important;
  }
  
  .dark .messages-glass-container * {
    color: #ffffff !important;
  }
  
  .dark .messages-conversation-item .text-gray-500,
  .dark .messages-conversation-item .text-xs {
    color: #9ca3af !important;
  }
  
  /* سكرول مخصص */
  .messages-scroll::-webkit-scrollbar {
    width: 6px;
  }
  
  .messages-scroll::-webkit-scrollbar-track {
    background: rgba(203, 213, 225, 0.2);
    border-radius: 10px;
  }
  
  .messages-scroll::-webkit-scrollbar-thumb {
    background: rgba(37, 99, 235, 0.4);
    border-radius: 10px;
  }
  
  .messages-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(37, 99, 235, 0.6);
  }
  
  .dark .messages-scroll::-webkit-scrollbar-track {
    background: rgba(75, 85, 99, 0.2);
  }
  
  .dark .messages-scroll::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.4);
  }
`;
document.head.appendChild(messagesStyle);

// مكون Popup التأكيد
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger = true }) => {
  const { t } = useTranslation();
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

const Messages = () => {
  const { t, i18n } = useTranslation();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, fetchBlockedUsers } = useStore();
  
  const isRTL = i18n.language === 'ar';
  
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Refs
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  
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
    if (!isSocketConnected) return;
    
    socketService.emit('conversations:fetch', { page: 1, limit: 50 }, (response) => {
      if (response?.success) {
        let conversationsList = response.data || [];
        const filteredConversations = conversationsList.filter(conv => {
          const other = conv.participants?.find(p => p._id !== user?._id);
          if (!other) return false;
          return !blockedUsers.some(blocked => blocked._id === other._id);
        });
        
        setConversations(filteredConversations);
        
        if (conversationId && !currentConversation) {
          const conv = filteredConversations.find(c => c._id === conversationId);
          if (conv) selectConversation(conv);
        }
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
        toast.error(t('messages.errors.unauthorized'));
        setConversations(prev => prev.filter(conv => conv._id !== convId));
        navigate('/messages');
      } else {
        toast.error(t('messages.errors.fetchMessagesFailed'));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isInitialLoadRef.current = false;
    }
  };
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // عرض محتوى الرسالة
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
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {t('messages.actions.viewPost')}
            </Link>
          );
        } else {
          parts.push(
            <a
              key={`link-${idx}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {t('messages.actions.openLink')}
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
      if (!isSocketConnected) toast.error(t('messages.errors.noConnection'));
      return;
    }
    
    if (isBlocked) {
      toast.error(t('messages.errors.cannotMessageBlocked'));
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
        toast.error(response?.message || t('messages.errors.sendFailed'));
        setNewMessage(content);
      }
      setSending(false);
    });
  };
  
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    if (scrollTop <= 50 && !loadingMore && hasMore && !loading && currentConversation && !isInitialLoadRef.current) {
      fetchMessages(currentConversation._id, false, page);
    }
  }, [loadingMore, hasMore, loading, currentConversation, page, fetchMessages]);
  
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
  
  const openDeleteConfirm = () => {
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };
  
  const openBlockConfirm = () => {
    setConfirmAction(isBlocked ? 'unblock' : 'block');
    setShowConfirmModal(true);
  };
  
  const selectConversation = (conversation) => {
    const other = conversation.participants?.find(p => p._id !== user?._id);
    if (other && blockedUsers.some(blocked => blocked._id === other._id)) {
      toast.error(t('messages.errors.conversationBlocked'));
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
  
  const executeDeleteConversation = async () => {
    if (!currentConversation) return;
    
    setDeletingConversation(true);
    try {
      const response = await api.delete(`/messages/conversations/${currentConversation._id}`);
      if (response.data.success) {
        toast.success(t('messages.toasts.conversationDeleted'));
        setConversations(prev => prev.filter(conv => conv._id !== currentConversation._id));
        setCurrentConversation(null);
        navigate('/messages');
      } else {
        toast.error(response.data.message || t('messages.errors.deleteFailed'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.errors.deleteFailed'));
    } finally {
      setDeletingConversation(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };
  
  const executeBlockUser = async () => {
    if (!otherUser) return;
    
    setBlockingUser(true);
    try {
      if (confirmAction === 'unblock') {
        const response = await api.delete(`/users/block/${otherUser._id}`);
        if (response.data.success) {
          toast.success(t('messages.toasts.userUnblocked', { username: otherUser.username }));
          await loadBlockedUsers();
          setIsBlocked(false);
          await fetchConversations();
        } else {
          toast.error(response.data.message || t('messages.errors.unblockFailed'));
        }
      } else {
        const response = await api.post(`/users/block/${otherUser._id}`);
        if (response.data.success) {
          toast.success(t('messages.toasts.userBlocked', { username: otherUser.username }));
          await loadBlockedUsers();
          setConversations(prev => prev.filter(conv => conv._id !== currentConversation._id));
          setCurrentConversation(null);
          setIsBlocked(true);
          navigate('/messages');
        } else {
          toast.error(response.data.message || t('messages.errors.blockFailed'));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.errors.blockFailed'));
    } finally {
      setBlockingUser(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };
  
  const handleConfirmAction = () => {
    if (confirmAction === 'delete') {
      executeDeleteConversation();
    } else if (confirmAction === 'block' || confirmAction === 'unblock') {
      executeBlockUser();
    }
  };
  
  const getConfirmModalProps = () => {
    if (confirmAction === 'delete') {
      return {
        title: t('messages.modals.deleteTitle'),
        message: t('messages.modals.deleteMessage'),
        confirmText: t('messages.modals.delete'),
        isDanger: true
      };
    } else if (confirmAction === 'block') {
      return {
        title: t('messages.modals.blockTitle'),
        message: t('messages.modals.blockMessage', { username: otherUser?.username }),
        confirmText: t('messages.modals.block'),
        isDanger: true
      };
    } else if (confirmAction === 'unblock') {
      return {
        title: t('messages.modals.unblockTitle'),
        message: t('messages.modals.unblockMessage', { username: otherUser?.username }),
        confirmText: t('messages.modals.unblock'),
        isDanger: false
      };
    }
    return {};
  };
  
  useEffect(() => {
    if (!loading && !loadingMore && messages.length > 0 && !isInitialLoadRef.current) {
      scrollToBottom();
    }
  }, [messages, loading, loadingMore]);
  
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
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (hours < 24) return date.toLocaleTimeString(isRTL ? 'ar-DZ' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    if (date.toDateString() === yesterday.toDateString()) return t('messages.time.yesterday');
    return date.toLocaleDateString(isRTL ? 'ar-DZ' : 'en-US');
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
    <div className="h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="messages-glass-container h-full"
      >
        <div className="flex h-full">
          {/* قائمة المحادثات */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col ${currentConversation ? 'hidden sm:flex' : 'flex'}`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">{t('messages.title')}</h2>
                </div>
                {isSocketConnected ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">{t('messages.status.online')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">{t('messages.status.offline')}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto messages-scroll p-2">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{t('messages.empty.noConversations')}</p>
                  <Link 
                    to="/explore" 
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
                  >
                    {t('messages.empty.findPeople')}
                  </Link>
                </div>
              ) : (
                conversations.map((conv, index) => {
                  const other = conv.participants?.find(p => p._id !== user?._id);
                  if (!other) return null;
                  const isOnline = onlineUsers.some(u => u.id === other._id);
                  const lastMessage = conv.lastMessage;
                  const unread = conv.unreadCount || 0;
                  return (
                    <motion.div
                      key={conv._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => selectConversation(conv)} 
                      className={`messages-conversation-item p-3 mb-2 cursor-pointer transition-all duration-300 ${
                        currentConversation?._id === conv._id ? 'messages-conversation-active' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={other.profileImage || defaultImgProfile} 
                            alt={other.username} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
                            onError={(e) => e.target.src = defaultImgProfile} 
                          />
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">{other.username}</p>
                            {lastMessage && (
                              <span className="text-xs opacity-70">{formatTime(lastMessage.createdAt)}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm opacity-70 truncate">
                              {lastMessage?.sender?._id === user?._id ? `${t('messages.you')}: ` : ''}
                              {lastMessage?.content?.substring(0, 50) || t('messages.empty.noMessages')}
                            </p>
                            {unread > 0 && (
                              <span className="bg-blue-500 text-white text-xs font-medium min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                                {unread > 99 ? '99+' : unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
          
          {/* نافذة المحادثة */}
          <div className={`flex-1 flex flex-col ${!currentConversation ? 'hidden sm:flex' : 'flex'}`}>
            {currentConversation && otherUser ? (
              <>
                {/* رأس المحادثة */}
                <div className="messages-chat-header p-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigate('/messages')} 
                      className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Link 
                      to={`/profile/${otherUser.username}`} 
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300"
                    >
                      <div className="relative">
                        <img 
                          src={otherUser.profileImage || defaultImgProfile} 
                          alt={otherUser.username} 
                          className="w-11 h-11 rounded-full object-cover border-2 border-blue-500"
                          onError={(e) => e.target.src = defaultImgProfile} 
                        />
                        {isUserOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold hover:text-blue-600 transition-colors">
                          {otherUser.username}
                        </p>
                        <p className="text-xs opacity-70">
                          {isUserOnline ? t('messages.status.online') : t('messages.status.offline')}
                        </p>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={openDeleteConfirm} 
                      disabled={deletingConversation} 
                      className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 text-red-600"
                      title={t('messages.actions.deleteConversation')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    {isBlocked ? (
                      <button 
                        onClick={openBlockConfirm} 
                        disabled={blockingUser} 
                        className="p-2.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all duration-300 text-green-600"
                        title={t('messages.actions.unblockUser')}
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={openBlockConfirm} 
                        disabled={blockingUser} 
                        className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 text-red-600"
                        title={t('messages.actions.blockUser')}
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* رسالة الحظر */}
                <AnimatePresence>
                  {isBlocked && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 dark:bg-red-900/20 p-4 text-center border-b border-red-200 dark:border-red-800 flex-shrink-0"
                    >
                      <ShieldAlert className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 dark:text-red-400 font-medium">{t('messages.blocked.title')}</p>
                      <p className="text-red-500 dark:text-red-300 text-sm mt-1">{t('messages.blocked.description')}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* حاوية الرسائل */}
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 messages-scroll"
                  style={{ 
                    overflowY: 'auto',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    minHeight: 0
                  }}
                >
                  {loadingMore && (
                    <div className="flex justify-center py-2">
                      <div className="w-6 h-6 border-2 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-xs mr-2 opacity-70">{t('messages.loadingMore')}</span>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-70">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-blue-500" />
                      </div>
                      <p>{t('messages.empty.startConversation')}</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const isOwn = message.sender?._id === user?._id;
                        const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id;
                        return (
                          <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
                              {!isOwn && showAvatar && (
                                <img 
                                  src={message.sender?.profileImage || defaultImgProfile} 
                                  alt="" 
                                  className="w-8 h-8 rounded-full object-cover border border-blue-200 dark:border-blue-800 flex-shrink-0" 
                                  onError={(e) => e.target.src = defaultImgProfile}
                                />
                              )}
                              {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}
                              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-full`}>
                                <div className={`px-4 py-2.5 break-words max-w-full ${
                                  isOwn ? 'messages-bubble-sent text-white' : 'messages-bubble-received'
                                }`}>
                                  {renderMessageContent(message.content)}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 text-xs opacity-60 ${isOwn ? 'justify-end' : 'justify-start'}`}>
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
                            <img 
                              src={otherUser.profileImage || defaultImgProfile} 
                              alt="" 
                              className="w-8 h-8 rounded-full object-cover" 
                              onError={(e) => e.target.src = defaultImgProfile}
                            />
                            <div className="messages-bubble-received px-4 py-2.5">
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
                <div className="messages-input-container p-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input 
                      ref={inputRef}
                      type="text" 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && !isBlocked && sendMessage()} 
                      onKeyUp={isBlocked ? undefined : handleTyping} 
                      placeholder={isBlocked ? t('messages.input.blockedPlaceholder') : t('messages.input.placeholder')} 
                      disabled={isBlocked}
                      className="messages-input flex-1 py-3 px-5 text-sm focus:outline-none transition-all duration-300 disabled:opacity-50"
                    />
                    <button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sending || !isSocketConnected || isBlocked} 
                      className="messages-send-btn p-3 text-white disabled:opacity-50 transition-all duration-300"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  {!isSocketConnected && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      ⚠️ {t('messages.errors.noConnection')}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mb-5">
                  <MessageCircle className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('messages.empty.selectConversation')}</h3>
                <p className="opacity-70">{t('messages.empty.selectDescription')}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
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
        cancelText={t('common.cancel')}
        isDanger={modalProps.isDanger}
      />
    </div>
  );
};

export default Messages;