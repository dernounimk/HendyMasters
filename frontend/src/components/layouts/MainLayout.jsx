// frontend/src/components/layouts/MainLayout.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search, Bell, PlusCircle, MessageCircle, User,
  LogOut, Settings, Home, Users, Bookmark,
  Briefcase, Wrench, Award, Star, MapPin,
  RefreshCw, Zap, Menu, X
} from 'lucide-react';

import logo from '../../../public/logo.jpg'
import { useStore } from '../../store';
import api from '../../services/api';
import socketService from '../../services/socketService';
import defaultImgProfile from '../../assets/images/default-avatar.png';

// --- Styles (CSS-in-JS) ---
const style = document.createElement('style');
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { height: 100vh; width: 100vw; overflow: hidden !important; }
  
  .layout-container {
    display: grid;
    grid-template-columns: 300px 1fr 320px;
    gap: 1.5rem;
    height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    overflow: hidden;
  }
  .dark .layout-container { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); }
  
  .layout-column {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    height: calc(100vh - 3rem);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .dark .layout-column { background: rgba(17, 24, 39, 0.7); border-color: rgba(75, 85, 99, 0.3); }
  
  .column-content { flex: 1; padding: 1.5rem; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
  .left-column-content { display: flex; flex-direction: column; height: 100%; gap: 1rem; overflow-y: auto; overflow-x: hidden; }
  .left-column-content::-webkit-scrollbar { width: 4px; }
  .left-column-content::-webkit-scrollbar-track { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
  .left-column-content::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
  
  .right-column-content { display: flex; flex-direction: column; height: 100%; gap: 1rem; overflow: hidden; }
  .suggestions-section { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
  .suggestions-section::-webkit-scrollbar { width: 4px; }
  .suggestions-section::-webkit-scrollbar-track { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
  .suggestions-section::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
  
  .main-column {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 3rem);
    overflow: hidden;
    position: relative;
  }
  
  /* الشريط العلوي */
  .top-bar-container {
    flex-shrink: 0;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    border-radius: 40px;
    margin-bottom: 1rem;
    border: 1px solid rgba(37, 99, 235, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dark .top-bar-container {
    background: rgba(17, 24, 39, 0.6);
    border-color: rgba(59, 130, 246, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .action-button {
    background: white;
    backdrop-filter: blur(8px);
    border-radius: 24px;
    border: 1px solid rgba(37, 99, 235, 0.2);
    transition: all 0.3s ease;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.1);
    cursor: pointer;
  }
  .dark .action-button {
    background: rgba(31, 41, 55, 0.8);
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
  }
  .action-button:hover {
    background: #eff6ff;
    transform: translateY(-2px);
  }
  .dark .action-button:hover { background: rgba(37, 99, 235, 0.3); }
  
  /* زر البروفايل مع الاسم */
  .profile-button {
    background: white;
    backdrop-filter: blur(8px);
    border-radius: 40px;
    border: 1px solid rgba(37, 99, 235, 0.2);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.3rem 1rem 0.3rem 0.3rem;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  .dark .profile-button { background: rgba(31, 41, 55, 0.8); color: #3b82f6; }
  .profile-button:hover { transform: translateY(-2px); background: #eff6ff; }
  .dark .profile-button:hover { background: rgba(37, 99, 235, 0.3); }
  
  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 30px;
    object-fit: cover;
    border: 2px solid white;
  }
  .dark .profile-avatar { border-color: #1f2937; }
  
  .profile-username {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1f2937;
  }
  .dark .profile-username { color: #f3f4f6; }
  
  .notification-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border-radius: 30px;
    min-width: 20px;
    height: 20px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border: 2px solid white;
  }
  .dark .notification-badge { border-color: #1f2937; }
  
  /* العناصر الجانبية */
  .nav-item {
    border-radius: 20px;
    padding: 0.75rem 1.25rem;
    margin-bottom: 0.25rem;
    transition: all 0.3s ease;
    color: #4b5563;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    white-space: nowrap;
  }
  .dark .nav-item { color: #9ca3af; }
  .nav-item:hover { transform: translateX(5px); color: #2563eb; background: rgba(37, 99, 235, 0.05); }
  .dark .nav-item:hover { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
  .nav-item-active {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white !important;
  }
  .dark .nav-item-active { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
  .nav-item-active:hover { transform: translateX(0); }
  
  /* زر تسجيل الخروج */
  .nav-item-logout {
    color: #ef4444 !important;
    margin-top: 0.5rem;
    border-top: 1px solid rgba(37, 99, 235, 0.1);
    border-radius: 0;
    padding-top: 1rem;
    width: 100%;
    background: transparent;
    cursor: pointer;
  }
  .dark .nav-item-logout { border-top-color: rgba(59, 130, 246, 0.2); color: #f87171 !important; }
  .nav-item-logout:hover { color: #dc2626 !important; background: rgba(239, 68, 68, 0.1) !important; transform: translateX(5px); }
  
  .suggested-card {
    background: white;
    border-radius: 24px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 1px solid rgba(37, 99, 235, 0.2);
    transition: all 0.3s;
  }
  .dark .suggested-card { background: rgba(31, 41, 55, 0.9); border-color: rgba(59, 130, 246, 0.3); }
  .suggested-card:hover { border-color: #2563eb; transform: translateY(-2px); }
  
  .online-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border-radius: 50%;
    border: 2px solid white;
  }
  .dark .online-indicator { border-color: #1f2937; }
  
  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.5rem;
    scrollbar-width: thin;
  }
  .main-content::-webkit-scrollbar { width: 6px; }
  .main-content::-webkit-scrollbar-track { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
  .main-content::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
  
  /* الشريط السفلي للهواتف */
  .mobile-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(37, 99, 235, 0.15);
    padding: 0.5rem 1rem;
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
    z-index: 100;
  }
  .dark .mobile-bottom-nav { background: rgba(17, 24, 39, 0.95); border-top-color: rgba(59, 130, 246, 0.2); }
  
  .mobile-nav-items {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .mobile-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    border-radius: 30px;
    color: #9ca3af;
    text-decoration: none;
    transition: all 0.2s;
  }
  .dark .mobile-nav-item { color: #6b7280; }
  .mobile-nav-item.active {
    color: white;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }
  .dark .mobile-nav-item.active { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
  .mobile-nav-icon svg { width: 22px; height: 22px; }
  .mobile-nav-label { font-size: 0.7rem; font-weight: 500; }
  
  /* سايدبار للهواتف */
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    border-right: 1px solid rgba(37, 99, 235, 0.15);
  }
  .dark .mobile-sidebar { background: rgba(17, 24, 39, 0.98); border-right-color: rgba(59, 130, 246, 0.2); }
  .mobile-sidebar.open { transform: translateX(0); }
  [dir="rtl"] .mobile-sidebar { transform: translateX(100%); left: auto; right: 0; border-left: 1px solid rgba(37, 99, 235, 0.15); border-right: none; }
  [dir="rtl"] .mobile-sidebar.open { transform: translateX(0); }
  
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
  }
  
  /* العلامة الزرقاء المصغرة للمستخدمين المقترحين */
  .suggested-verified-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.75rem;
    height: 0.75rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 50%;
    margin-left: 0.25rem;
    flex-shrink: 0;
  }
  
  .suggested-verified-badge svg {
    width: 0.45rem;
    height: 0.45rem;
    color: white;
    stroke-width: 3;
  }
  
  /* تنسيقات الشاشات الصغيرة */
  @media (max-width: 1024px) {
    .layout-container { 
      grid-template-columns: 1fr; 
      padding: 1rem; 
      padding-bottom: 0;
    }
    .left-column, .right-column { display: none; }
    .mobile-bottom-nav { display: block; }
    .main-column { 
      height: calc(100vh - 2rem);
    }
    .main-content {
      padding-bottom: 70px;
    }
  }
  
  /* للشاشات الصغيرة جداً */
  @media (max-width: 640px) {
    .layout-container {
      padding: 0.75rem;
    }
    .main-content {
      padding-bottom: 75px;
    }
    .top-bar-container {
      margin-bottom: 0.75rem;
    }
  }
  
  /* للشاشات التي بها notch */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .main-content {
      padding-bottom: calc(70px + env(safe-area-inset-bottom));
    }
    @media (max-width: 640px) {
      .main-content {
        padding-bottom: calc(75px + env(safe-area-inset-bottom));
      }
    }
  }
`;
document.head.appendChild(style);

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isLoading, theme, token, fetchUnreadCount } = useStore();
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const mobileSidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  
  const isRTL = i18n.language === 'ar';
  const canCreatePost = user?.role === 'client' || user?.role === 'artisan';
  
  // عناصر الشريط السفلي (Home, Messages, Create, Profile)
  const bottomNavItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/messages', icon: MessageCircle, label: t('nav.messages'), badge: unreadMessagesCount },
    ...(canCreatePost ? [{ path: '/posts/create', icon: PlusCircle, label: t('nav.create') }] : []),
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];
  
  // عناصر القائمة الجانبية (مع زر تسجيل الخروج في النهاية)
  const sidebarItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/explore', icon: Search, label: t('nav.search') },
    ...(canCreatePost ? [{ path: '/posts/create', icon: PlusCircle, label: t('nav.create') }] : []),
    { path: '/messages', icon: MessageCircle, label: t('nav.messages'), badge: unreadMessagesCount },
    { path: '/notifications', icon: Bell, label: t('nav.notifications'), badge: unreadNotificationsCount },
    { path: '/saved', icon: Bookmark, label: t('nav.saved') },
    { path: '/profile', icon: User, label: t('nav.profile') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];
  
  // --- جلب البيانات ---
  const fetchUnreadNotificationsCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) setUnreadNotificationsCount(res.data.data.unreadCount);
    } catch (error) { console.error(error); }
  }, [isAuthenticated]);
  
  const loadUnreadCount = useCallback(async () => {
    if (isAuthenticated && token) {
      const count = await fetchUnreadCount();
      setUnreadMessagesCount(count);
    }
  }, [isAuthenticated, token, fetchUnreadCount]);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      fetchUnreadNotificationsCount();
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleNewNotification = () => fetchUnreadNotificationsCount();
    const handleNewMessage = () => loadUnreadCount();
    const handleMessagesRead = () => loadUnreadCount();
    
    socketService.on('notification:new', handleNewNotification);
    socketService.on('message:new', handleNewMessage);
    socketService.on('messages:read', handleMessagesRead);
    
    return () => {
      socketService.off('notification:new', handleNewNotification);
      socketService.off('message:new', handleNewMessage);
      socketService.off('messages:read', handleMessagesRead);
    };
  }, [isAuthenticated, fetchUnreadNotificationsCount, loadUnreadCount]);
  
  useEffect(() => {
    if (!isAuthenticated && !isLoading) navigate('/login');
  }, [isAuthenticated, isLoading]);
  
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);
  
  // إغلاق السايدبار عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileSidebarRef.current && !mobileSidebarRef.current.contains(e.target) && isMobileSidebarOpen)
        setIsMobileSidebarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileSidebarOpen]);
  
  // --- جلب المستخدمين المقترحين ---
  const fetchUserStats = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/stats`);
      if (response.data?.success && response.data?.data) {
        return {
          rating: response.data.data.rating || 0,
          totalRatings: response.data.data.totalRatings || 0
        };
      }
      return null;
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(`Error fetching stats for user ${userId}:`, error);
      }
      return null;
    }
  };
  
  const fetchSuggestedUsers = useCallback(async () => {
    if (!isAuthenticated || !token || !user?._id) return;
    
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: { limit: 20, page: 1 }
      });
      
      if (response.data?.success && response.data?.data) {
        const currentUserId = String(user._id);
        const otherUsers = response.data.data.filter(u => String(u._id) !== currentUserId);
        
        if (otherUsers.length > 0) {
          const usersWithStats = await Promise.all(
            otherUsers.slice(0, 10).map(async (dbUser) => {
              if (String(dbUser._id) === currentUserId) return null;
              
              const stats = await fetchUserStats(dbUser._id);
              
              let craft = t('roles.artisan');
              if (dbUser.professionalInfo?.craft) {
                craft = i18n.language === 'ar' 
                  ? t(`crafts.${dbUser.professionalInfo.craft}`, dbUser.professionalInfo.craft.replace(/_/g, ' '))
                  : dbUser.professionalInfo.craft.replace(/_/g, ' ');
              } else if (dbUser.role === 'client') {
                craft = t('roles.client');
              } else if (dbUser.role === 'worker') {
                craft = t('roles.worker');
              }
              
              const rating = stats?.rating || dbUser.stats?.rating || 0;
              
              return {
                _id: dbUser._id,
                id: dbUser._id,
                name: dbUser.username,
                username: dbUser.username,
                avatar: dbUser.profileImage,
                profileImage: dbUser.profileImage,
                role: dbUser.role,
                craft: craft,
                location: dbUser.location || t('search.defaultLocation', 'Algeria'),
                rating: parseFloat(rating).toFixed(1),
                isOnline: dbUser.isOnline || false,
                bio: dbUser.bio || '',
                isVerified: dbUser.isVerified || false
              };
            })
          );
          
          const validUsers = usersWithStats.filter(u => u !== null && String(u._id) !== currentUserId);
          const shuffled = [...validUsers].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3);
          setSuggestedUsers(selected);
        } else {
          setSuggestedUsers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, user?._id, i18n.language, t]);
  
  useEffect(() => {
    if (user && token && isAuthenticated) {
      const timer = setTimeout(() => fetchSuggestedUsers(), 500);
      return () => clearTimeout(timer);
    }
  }, [user, token, isAuthenticated, fetchSuggestedUsers]);
  
  const handleRefreshUsers = () => {
    setIsRefreshing(true);
    fetchSuggestedUsers().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };
  
  const handleLogout = async () => { await logout(); navigate('/login'); };
  
  // Scroll to top when route changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="layout-container" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ===== القائمة الجانبية (للكمبيوتر) ===== */}
      <aside className="left-column layout-column">
        <div className="column-content">
          <div className="left-column-content">
            <div className="logo-section">
              <Link to="/" className="flex items-center gap-3 mb-4 group">
                <div className="logo-container w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src={logo} alt="Handys" className="logo-image w-10 h-10 object-cover" />
                </div>
                <span className="logo-text text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Handys</span>
              </Link>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`nav-item ${isActive ? 'nav-item-active' : ''}`}>
                    <div className="relative">
                      <Icon size={20} />
                      {item.badge > 0 && <span className="notification-badge">{item.badge > 99 ? '99+' : item.badge}</span>}
                    </div>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {/* زر تسجيل الخروج في نهاية القائمة */}
              <button onClick={handleLogout} className="nav-item nav-item-logout">
                <LogOut size={20} />
                <span>{t('nav.logout')}</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>
      
      {/* ===== سايدبار الهواتف ===== */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      <div ref={mobileSidebarRef} className={`mobile-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Handys" className="w-10 h-10 rounded-xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Handys</span>
            </div>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="action-button w-10 h-10">
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsMobileSidebarOpen(false)} className={`nav-item ${isActive ? 'nav-item-active' : ''}`}>
                  <div className="relative">
                    <Icon size={20} />
                    {item.badge > 0 && <span className="notification-badge">{item.badge > 99 ? '99+' : item.badge}</span>}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button onClick={() => { handleLogout(); setIsMobileSidebarOpen(false); }} className="nav-item nav-item-logout">
              <LogOut size={20} />
              <span>{t('nav.logout')}</span>
            </button>
          </nav>
        </div>
      </div>
      
      {/* ===== العمود الرئيسي ===== */}
      <main className="main-column">
        {/* الشريط العلوي */}
        <div className="top-bar-container">
          {/* زر القائمة للهواتف فقط */}
          <button onClick={() => setIsMobileSidebarOpen(true)} className="action-button lg:hidden">
            <Menu size={20} />
          </button>
          
          {/* زر البحث للشاشات الكبيرة فقط */}
          <Link to="/explore" className="action-button hidden lg:flex">
            <Search size={20} />
          </Link>
          
          {/* زر البروفايل مع اسم المستخدم (يظهر في جميع الشاشات) */}
          <Link to="/profile" className="profile-button">
            <img src={user?.profileImage || defaultImgProfile} className="profile-avatar" alt="avatar" />
            <span className="profile-username">{user?.username}</span>
          </Link>
          
          {/* أيقونة الإشعارات */}
          <Link to="/notifications" className="action-button relative">
            <Bell size={20} />
            {unreadNotificationsCount > 0 && <span className="notification-badge">{unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}</span>}
          </Link>
        </div>
        
        <div ref={mainContentRef} className="main-content">
          <Outlet />
        </div>
      </main>
      
      {/* ===== العمود الأيمن (مقترحات) ===== */}
      <aside className="right-column layout-column">
        <div className="column-content">
          <div className="right-column-content">
            <div className="section-title">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span>{t('nav.suggestedUsers')}</span>
                </h3>
                <button
                  onClick={handleRefreshUsers}
                  className={`refresh-button ${isRefreshing ? 'spinning' : ''}`}
                  title={t('common.refresh')}
                  disabled={isRefreshing || loading}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="suggestions-section">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
                </div>
              ) : suggestedUsers.length > 0 ? (
                <div className="space-y-2">
                  {suggestedUsers.map(user => (
                    <div key={user._id || user.id} className="suggested-card">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.profileImage || user.avatar || defaultImgProfile}
                            alt={user.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-primary-200 dark:border-primary-800"
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultImgProfile; }}
                          />
                          {user.isOnline && <span className="online-indicator" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            {user.isVerified && (
                              <div className="suggested-verified-badge">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-primary-500 flex-shrink-0" />
                            <span className="truncate">{user.craft}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                              <Star className="w-3 h-3 text-yellow-500 ml-1 flex-shrink-0" />
                              <span className="font-medium">{user.rating}</span>
                            </div>
                            {user.location && (
                              <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                <MapPin className="w-3 h-3 text-primary-500 ml-1 flex-shrink-0" />
                                <span className="truncate max-w-[60px]">{user.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Link
                          to={`/profile/${user.username}`}
                          className="w-full flex items-center justify-center gap-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-gray-700 dark:text-primary-300 text-xs font-medium py-2 px-3 rounded-xl transition-all transform hover:scale-105 border border-primary-200 dark:border-primary-700"
                        >
                          <User className="w-3 h-3" />
                          <span>{t('nav.viewProfile')}</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="w-12 h-12 text-primary-300 dark:text-primary-700 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('suggestions.noUsers')}</p>
                  <button
                    onClick={handleRefreshUsers}
                    className="mt-3 text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('common.tryAgain')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
      
      {/* ===== الشريط السفلي للهواتف ===== */}
      <div className="mobile-bottom-nav">
        <div className="mobile-nav-items">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
                <div className="mobile-nav-icon relative">
                  <Icon />
                  {item.badge > 0 && <span className="notification-badge" style={{ top: -8, right: -10 }}>{item.badge > 99 ? '99+' : item.badge}</span>}
                </div>
                <span className="mobile-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;