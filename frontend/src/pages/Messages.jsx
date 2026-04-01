// frontend/src/pages/Messages.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import socketService from '../services/socketService';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Send, User, ArrowLeft, CheckCheck, Check, Clock, Loader,
  MessageCircle, Wifi, WifiOff, Ban, Trash2
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

const Messages = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useStore();
  
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
  
  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  
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
  
  // جلب المحادثات
  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/messages/conversations');
      if (response.data?.success) {
        setConversations(response.data.data || []);
        if (conversationId && !currentConversation) {
          const conv = response.data.data.find(c => c._id === conversationId);
          if (conv) selectConversation(conv);
        }
      }
    } catch (error) {
      toast.error('فشل في جلب المحادثات');
    }
  }, [conversationId, currentConversation]);
  
  // جلب الرسائل
  const fetchMessages = async (convId, reset = true) => {
    try {
      if (reset) { setLoading(true); setMessages([]); setPage(1); setHasMore(true); }
      const response = await api.get(`/messages/conversations/${convId}/messages`, {
        params: { page: reset ? 1 : page + 1, limit: 30 }
      });
      if (response.data?.success) {
        const newMessages = response.data.data || [];
        if (reset) setMessages(newMessages);
        else setMessages(prev => [...newMessages, ...prev]);
        setHasMore(newMessages.length === 30);
        if (!reset && newMessages.length > 0) setPage(prev => prev + 1);
        if (socketService.getConnectionStatus())
          socketService.emit('messages:read', { conversationId: convId });
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('غير مصرح لك بالوصول إلى هذه المحادثة');
        navigate('/messages');
      } else {
        toast.error('فشل في جلب الرسائل');
      }
    } finally { setLoading(false); }
  };
  
  // إرسال رسالة
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !isSocketConnected) {
      if (!isSocketConnected) toast.error('لا يوجد اتصال بالخادم');
      return;
    }
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId, content, sender: { _id: user._id, username: user.username, profileImage: user.profileImage },
      createdAt: new Date().toISOString(), readBy: [user._id], isTemp: true
    };
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
    
    socketService.emit('message:send', {
      conversationId: currentConversation?._id,
      recipientId: currentConversation?.participants.find(p => p._id !== user._id)?._id,
      content
    }, (response) => {
      if (response?.success) {
        setMessages(prev => prev.map(msg => msg._id === tempId ? response.data.message : msg));
        setConversations(prev => prev.map(conv => conv._id === response.data.conversationId ? { ...conv, lastMessage: response.data.message, lastMessageAt: response.data.message.createdAt, unreadCount: 0 } : conv));
      } else {
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
        toast.error(response?.message || 'فشل في إرسال الرسالة');
        setNewMessage(content);
      }
      setSending(false);
    });
  };
  
  // حدث الكتابة
  const handleTyping = () => {
    if (!currentConversation || !isSocketConnected) return;
    const recipient = currentConversation.participants.find(p => p._id !== user._id);
    if (!recipient) return;
    socketService.emit('typing:start', { conversationId: currentConversation._id, recipientId: recipient._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isSocketConnected) socketService.emit('typing:stop', { conversationId: currentConversation._id, recipientId: recipient._id });
    }, 2000);
  };
  
  // اختيار محادثة
  const selectConversation = (conversation) => {
    setCurrentConversation(conversation);
    fetchMessages(conversation._id);
    navigate(`/messages/${conversation._id}`);
  };
  
  // حذف المحادثة
  const deleteConversation = async () => {
    if (!currentConversation) return;
    
    setDeletingConversation(true);
    try {
      const response = await api.delete(`/messages/conversations/${currentConversation._id}`);
      if (response.data.success) {
        toast.success('تم حذف المحادثة بنجاح');
        // إزالة المحادثة من القائمة
        setConversations(prev => prev.filter(conv => conv._id !== currentConversation._id));
        // إغلاق المحادثة الحالية
        setCurrentConversation(null);
        navigate('/messages');
      } else {
        toast.error(response.data.message || 'فشل حذف المحادثة');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف المحادثة');
    } finally {
      setDeletingConversation(false);
    }
  };
  
  // حظر مستخدم
  const blockUser = async () => {
    const otherUser = currentConversation?.participants.find(p => p._id !== user?._id);
    if (!otherUser) return;
    
    setBlockingUser(true);
    try {
      const response = await api.post(`/users/block/${otherUser._id}`);
      if (response.data.success) {
        toast.success(`تم حظر المستخدم ${otherUser.username} بنجاح`);
        setCurrentConversation(null);
        navigate('/messages');
        await fetchConversations();
      } else {
        toast.error(response.data.message || 'فشل حظر المستخدم');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحظر');
    } finally {
      setBlockingUser(false);
    }
  };
  
  // تحميل المزيد عند التمرير للأعلى
  const handleScroll = async (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && !loadingMore && hasMore && !loading && currentConversation) {
      setLoadingMore(true);
      const currentHeight = e.target.scrollHeight;
      try {
        const nextPage = page + 1;
        const response = await api.get(`/messages/conversations/${currentConversation._id}/messages`, {
          params: { page: nextPage, limit: 30 }
        });
        if (response.data?.success) {
          const newMessages = response.data.data || [];
          if (newMessages.length > 0) {
            setMessages(prev => [...newMessages, ...prev]);
            setHasMore(newMessages.length === 30);
            setPage(nextPage);
            setTimeout(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - currentHeight;
              }
            }, 50);
          } else {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error('Error loading more messages:', error);
      } finally {
        setLoadingMore(false);
      }
    }
  };
  
  // التمرير للأسفل
  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  
  // تأثيرات Socket
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (currentConversation?._id === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        if (isSocketConnected) socketService.emit('messages:read', { conversationId: data.conversationId });
      }
      setConversations(prev => prev.map(conv => conv._id === data.conversationId ? { ...conv, lastMessage: data.message, lastMessageAt: data.message.createdAt, unreadCount: (conv.unreadCount || 0) + 1 } : conv));
    };
    
    const handleTypingStart = (data) => {
      if (currentConversation?._id === data.conversationId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.username }));
      }
    };
    
    const handleTypingStop = (data) => {
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
  }, [currentConversation, isSocketConnected]);
  
  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { scrollToBottom(); }, [messages]);
  
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
  
  const otherUser = currentConversation?.participants?.find(p => p._id !== user?._id);
  const isUserOnline = onlineUsers.some(u => u.id === otherUser?._id);
  const isTyping = Object.values(typingUsers).length > 0;
  
  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
      {/* قائمة المحادثات */}
      <div className={`w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col ${currentConversation ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                        <p className="text-sm text-gray-500 truncate">{lastMessage?.sender?._id === user?._id ? 'أنت: ' : ''}{lastMessage?.content || 'لا توجد رسائل'}</p>
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
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
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
                <button 
                  onClick={deleteConversation} 
                  disabled={deletingConversation}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={blockUser} 
                  disabled={blockingUser}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600"
                >
                  <Ban className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMore && <div className="flex justify-center py-2"><Loader className="w-5 h-5 animate-spin text-gray-400" /></div>}
              {loading ? <div className="flex justify-center py-8"><Loader className="w-8 h-8 animate-spin text-primary-500" /></div> : (
                <>
                  {messages.map((message, index) => {
                    const isOwn = message.sender?._id === user?._id;
                    const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id;
                    return (
                      <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[70%]`}>
                          {!isOwn && showAvatar && <img src={message.sender?.profileImage || defaultImgProfile} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
                          {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}
                          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-full`}>
                            <div className={`px-4 py-2 rounded-2xl break-words max-w-full ${isOwn ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  {isTyping && (
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
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                  onKeyUp={handleTyping} 
                  placeholder="اكتب رسالة..." 
                  className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
                <button onClick={sendMessage} disabled={!newMessage.trim() || sending || !isSocketConnected} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
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
    </div>
  );
};

export default Messages;