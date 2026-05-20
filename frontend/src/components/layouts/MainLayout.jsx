// frontend/src/components/layouts/MainLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search, Bell, PlusCircle, MessageCircle, User,
  ChevronDown, LogOut, Settings, Moon, Sun,
  Menu, X, Home, Users, FileText, Bookmark,
  Briefcase, Wrench, Award, Star, Clock,
  UserPlus, Sparkles, Heart, MapPin, Globe,
  Lock, Key, Zap, CheckCircle, AlertCircle, RefreshCw,
  Wifi, WifiOff
} from 'lucide-react';

import logo from '../../../public/logo.jpg'

import { useStore } from '../../store';
import api from '../../services/api';
import socketService from '../../services/socketService';
import defaultImgProfile from '../../assets/images/default-avatar.png';

// CSS Styles
const style = document.createElement('style');
style.textContent = `
  html, body {
    overflow: hidden !important;
    height: 100vh !important;
    width: 100vw !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  #root {
    height: 100vh !important;
    width: 100vw !important;
    overflow: hidden !important;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    gap: 1.5rem;
    height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    overflow: hidden;
  }

  .dark .layout-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }

  .layout-column {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 32px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.8);
    height: calc(100vh - 3rem);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .dark .layout-column {
    background: rgba(17, 24, 39, 0.7);
    border-color: rgba(75, 85, 99, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .column-content {
    flex: 1;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .left-column-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
    overflow: hidden;
  }

  .logo-section {
    flex-shrink: 0;
  }

  .nav-section {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: visible;
    padding-right: 0;
  }

  .user-profile-section {
    flex-shrink: 0;
    margin-top: auto;
    padding-top: 0.5rem;
  }

  .right-column-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
    overflow: hidden;
  }

  .section-title {
    flex-shrink: 0;
  }

  .suggestions-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 0.5rem;
  }

  .suggestions-section::-webkit-scrollbar {
    width: 4px;
  }

  .suggestions-section::-webkit-scrollbar-track {
    background: rgba(37, 99, 235, 0.1);
    border-radius: 10px;
  }

  .suggestions-section::-webkit-scrollbar-thumb {
    background: #2563eb;
    border-radius: 10px;
  }

  .main-column {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 3rem);
    overflow: hidden;
  }

  .top-bar-container {
    flex-shrink: 0;
    padding: 0 1rem 1rem 1rem;
    background: transparent;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: #2563eb rgba(37, 99, 235, 0.1);
  }

  .dark .main-content {
    scrollbar-color: #3b82f6 rgba(59, 130, 246, 0.1);
  }

  .main-content::-webkit-scrollbar {
    width: 6px;
  }

  .main-content::-webkit-scrollbar-track {
    background: rgba(37, 99, 235, 0.1);
    border-radius: 10px;
  }

  .dark .main-content::-webkit-scrollbar-track {
    background: rgba(59, 130, 246, 0.1);
  }

  .main-content::-webkit-scrollbar-thumb {
    background: #2563eb;
    border-radius: 10px;
  }

  .dark .main-content::-webkit-scrollbar-thumb {
    background: #3b82f6;
  }

  .action-button {
    background: white;
    backdrop-filter: blur(8px);
    border-radius: 20px;
    border: 1px solid rgba(37, 99, 235, 0.2);
    transition: all 0.3s ease;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.1);
  }

  .dark .action-button {
    background: rgba(31, 41, 55, 0.7);
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  .action-button:hover {
    background: #eff6ff;
    border-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  }

  .dark .action-button:hover {
    background: rgba(37, 99, 235, 0.2);
    border-color: #3b82f6;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
  }

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
    position: relative;
    overflow: hidden;
  }

  .dark .nav-item {
    color: #9ca3af;
  }

  .nav-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .nav-item:hover::before {
    opacity: 1;
  }

  .nav-item:hover {
    transform: translateX(5px);
    color: #2563eb;
  }

  .dark .nav-item:hover {
    color: #3b82f6;
  }

  .nav-item-active {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white !important;
  }

  .nav-item-active:hover {
    transform: translateX(0);
  }

  .dark .nav-item-active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white !important;
  }

  .notification-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border-radius: 30px;
    min-width: 22px;
    height: 22px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
    border: 2px solid white;
  }

  .dark .notification-badge {
    border-color: #1f2937;
  }

  [dir="rtl"] .notification-badge {
    right: auto;
    left: -6px;
  }

  /* ============================================ */
  /* إصلاحات الوضع المظلم للمستخدمين المقترحين */
  /* ============================================ */
  
  /* عنوان "المستخدمون المقترحون" */
  .section-title h3,
  .section-title .dark\\:text-white {
    color: #1f2937 !important;
  }
  
  .dark .section-title h3,
  .dark .section-title .text-gray-900,
  .dark .section-title span {
    color: #f3f4f6 !important;
  }
  
  /* بطاقات المستخدمين المقترحين */
  .suggested-card {
    background: white;
    border-radius: 24px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    border: 1px solid rgba(37, 99, 235, 0.2);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.1);
  }

  .dark .suggested-card {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
  
  /* اسم المستخدم في البطاقة */
  .suggested-card .text-gray-900,
  .suggested-card .dark\\:text-white,
  .suggested-card p.font-semibold {
    color: #111827 !important;
  }
  
  .dark .suggested-card .text-gray-900,
  .dark .suggested-card .dark\\:text-white,
  .dark .suggested-card p.font-semibold {
    color: #ffffff !important;
  }
  
  /* النصوص الثانوية (المهنة، التقييم، الموقع) */
  .suggested-card .text-gray-600,
  .suggested-card .dark\\:text-gray-400,
  .suggested-card .text-xs {
    color: #4b5563 !important;
  }
  
  .dark .suggested-card .text-gray-600,
  .dark .suggested-card .text-xs:not(.text-white) {
    color: #cbd5e1 !important;
  }
  
  /* زر "عرض الملف الشخصي" */
  .suggested-card a.bg-primary-50 {
    background: #eff6ff;
    color: #1f2937;
    border-color: rgba(37, 99, 235, 0.3);
  }
  
  .dark .suggested-card a.bg-primary-50 {
    background: rgba(37, 99, 235, 0.25);
    color: #93c5fd;
    border-color: rgba(59, 130, 246, 0.4);
  }
  
  .dark .suggested-card a.bg-primary-50:hover {
    background: rgba(37, 99, 235, 0.4);
    color: #bfdbfe;
  }
  
  /* حالة عدم وجود مستخدمين */
  .suggestions-section .text-gray-500,
  .suggestions-section .dark\\:text-gray-400 {
    color: #6b7280;
  }
  
  .dark .suggestions-section .text-gray-500,
  .dark .suggestions-section p {
    color: #9ca3af !important;
  }

  .suggested-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .suggested-card:hover::before {
    opacity: 1;
  }

  .suggested-card:hover {
    border-color: #2563eb;
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);
  }

  .dark .suggested-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
  }

  .online-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    background: #10b981;
    border-radius: 30px;
    border: 2px solid white;
    box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
  }

  .dark .online-indicator {
    border-color: #1f2937;
  }

  [dir="rtl"] .online-indicator {
    right: auto;
    left: 2px;
  }

  .create-post-btn {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border-radius: 24px;
    padding: 0 1.5rem;
    height: 48px;
    color: white;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
    position: relative;
    overflow: hidden;
  }

  .dark .create-post-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .create-post-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .create-post-btn:hover::before {
    opacity: 1;
  }

  .create-post-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.4);
  }

  .dropdown-menu {
    background: white;
    border-radius: 24px;
    padding: 0.5rem;
    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(37, 99, 235, 0.2);
  }

  .dark .dropdown-menu {
    background: #1f2937;
    border-color: rgba(59, 130, 246, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .dropdown-item {
    border-radius: 20px;
    padding: 0.75rem 1.25rem;
    transition: all 0.3s ease;
    color: #4b5563;
    font-weight: 500;
    position: relative;
    overflow: hidden;
  }

  .dark .dropdown-item {
    color: #9ca3af;
  }

  .dropdown-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .dropdown-item:hover::before {
    opacity: 1;
  }

  .dropdown-item:hover {
    transform: translateX(5px);
    color: #2563eb;
  }

  .dark .dropdown-item:hover {
    color: #3b82f6;
  }

  .text-muted {
    color: #6b7280;
  }

  .dark .text-muted {
    color: #9ca3af;
  }

  .text-strong {
    color: #111827;
    font-weight: 600;
  }

  .dark .text-strong {
    color: #f9fafb;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .dark .logo-text {
    background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .logo-image {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .group:hover .logo-image {
    transform: scale(1.05);
  }

  .logo-container {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  }

  .dark .logo-container {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .bg-gradient-primary {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .dark .bg-gradient-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  .float-animation {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .pulse-animation {
    animation: pulse 2s ease-in-out infinite;
  }

  .refresh-button {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(4px);
    border-radius: 30px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
    transition: all 0.3s ease;
    border: 1px solid rgba(37, 99, 235, 0.2);
    cursor: pointer;
  }

  .dark .refresh-button {
    background: rgba(31, 41, 55, 0.5);
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.2);
  }

  .refresh-button:hover {
    transform: rotate(180deg);
    background: white;
    border-color: #2563eb;
  }

  .dark .refresh-button:hover {
    background: rgba(37, 99, 235, 0.2);
    border-color: #3b82f6;
  }

  .refresh-button.spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.05);
  }

  .dark .connection-status {
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 1024px) {
    .layout-container {
      grid-template-columns: 80px 1fr;
      gap: 1rem;
    }
    
    .right-column {
      display: none;
    }
    
    .left-column {
      width: 80px;
    }
    
    .nav-item span {
      display: none;
    }
    
    .nav-item {
      justify-content: center;
      padding: 0.75rem;
    }

    .logo-container {
      width: 40px;
      height: 40px;
      margin: 0 auto;
    }

    .logo-image {
      width: 32px;
      height: 32px;
    }

    .logo-text {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .layout-container {
      grid-template-columns: 1fr;
      padding: 1rem;
    }
    
    .left-column {
      display: none;
    }
  }
`;
document.head.appendChild(style);

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    user, 
    isAuthenticated, 
    logout, 
    isLoading,
    theme,
    toggleTheme,
    token,
    fetchUnreadCount
  } = useStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const isRTL = i18n.language === 'ar';
  // Modified condition: worker cannot create posts, only client and artisan can
  const canCreatePost = user?.role === 'client' || user?.role === 'artisan';

  const fetchUnreadNotificationsCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadNotificationsCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = useCallback(async () => {
    if (isAuthenticated && token) {
      try {
        const count = await fetchUnreadCount();
        setUnreadMessagesCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    }
  }, [isAuthenticated, token, fetchUnreadCount]);

  useEffect(() => {
    const checkConnection = setInterval(() => {
      setIsSocketConnected(socketService.getConnectionStatus());
    }, 3000);
    return () => clearInterval(checkConnection);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      fetchUnreadNotificationsCount();
    }
  }, [isAuthenticated, loadUnreadCount, fetchUnreadNotificationsCount]);

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
                bio: dbUser.bio || ''
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
  }, [isAuthenticated, token, user?._id, user?.username, i18n.language, t]);

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

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const navigationItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/explore', icon: Search, label: t('nav.search') },
    ...(canCreatePost ? [{ path: '/posts/create', icon: PlusCircle, label: t('nav.create') }] : []),
    { path: '/messages', icon: MessageCircle, label: t('nav.messages'), badge: unreadMessagesCount },
    { path: '/notifications', icon: Bell, label: t('nav.notifications'), badge: unreadNotificationsCount },
    { path: '/saved', icon: Bookmark, label: t('nav.saved') },
    { path: '/profile', icon: User, label: t('nav.profile') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="layout-container" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            x: isRTL ? [0, -20, 0] : [0, 20, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div 
          animate={{
            x: isRTL ? [0, 20, 0] : [0, -20, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="fixed top-20 left-20 w-16 h-16 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-0 border border-primary-200 dark:border-primary-800"
      >
        <Lock className="w-8 h-8 text-primary-400 dark:text-primary-600" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="fixed bottom-20 right-20 w-16 h-16 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-0 border border-primary-200 dark:border-primary-800"
      >
        <Key className="w-8 h-8 text-primary-400 dark:text-primary-600" />
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: isRTL ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 300 : -300 }}
              className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-80 z-50 lg:hidden`}
            >
              <div className="layout-column h-full w-full">
                <div className="column-content">
                  <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="flex items-center gap-2 group">
                      <div className="logo-container">
                        <img src={logo} alt="Handys" className="logo-image" />
                      </div>
                      <span className="logo-text">Handys</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="action-button">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {navigationItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                          onMouseEnter={() => setHoveredItem(index)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <div className="relative">
                            <Icon className="w-5 h-5" />
                            {item.badge > 0 && (
                              <span className="notification-badge">
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            )}
                          </div>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Left Column - Sidebar */}
      <aside className="left-column layout-column relative z-10">
        <div className="column-content">
          <div className="left-column-content">
            <div className="logo-section">
              <Link to="/" className="flex items-center gap-3 mb-4 group">
                <div className="logo-container">
                  <img src={logo} alt="Handys" className="logo-image" />
                </div>
                <span className="logo-text">Handys</span>
              </Link>
            </div>

            <div className="nav-section">
              <nav className="space-y-1">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                      onMouseEnter={() => setHoveredItem(index)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5" />
                        {item.badge > 0 && (
                          <span className="notification-badge">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {/* Middle Column - Main Content */}
      <main className="main-column relative z-10 p-1">
        <div className="top-bar-container">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="action-button lg:hidden">
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/explore" className="action-button" title={t('nav.search')}>
              <Search className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="connection-status hidden sm:flex">
                {isSocketConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">{t('messages.status.online')}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600 dark:text-red-400">{t('messages.status.offline')}</span>
                  </>
                )}
              </div>

              <button
                onClick={handleThemeToggle}
                className="action-button"
                title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {canCreatePost && (
                <Link to="/posts/create" className="create-post-btn hidden lg:flex">
                  <PlusCircle className="w-5 h-5" />
                  <span>{t('nav.createPost')}</span>
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="action-button w-auto px-3 gap-2"
                >
                  <img
                    src={user?.profileImage || defaultImgProfile}
                    alt={user?.username}
                    className="w-6 h-6 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImgProfile; }}
                  />
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 dropdown-menu z-50`}
                    >
                      <div className="p-3 border-b border-primary-100 dark:border-primary-900">
                        <p className="text-sm font-semibold text-gray-500">{user?.username}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Award className="w-3 h-3 text-primary-500" />
                          {t(`roles.${user?.role}`)}
                        </p>
                      </div>
                      
                      <Link to="/profile" className="dropdown-item flex mt-1 items-center gap-3" onClick={() => setIsProfileMenuOpen(false)}>
                        <User className="w-4 h-4" />
                        <span className="text-sm">{t('nav.profile')}</span>
                      </Link>
                      
                      <Link to="/saved" className="dropdown-item flex items-center gap-3" onClick={() => setIsProfileMenuOpen(false)}>
                        <Bookmark className="w-4 h-4" />
                        <span className="text-sm">{t('nav.saved')}</span>
                      </Link>
                      
                      <Link to="/settings" className="dropdown-item flex items-center gap-3" onClick={() => setIsProfileMenuOpen(false)}>
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">{t('nav.settings')}</span>
                      </Link>
                      
                      <hr className="my-1 border-primary-100 dark:border-primary-900" />
                      
                      <button
                        onClick={() => { handleLogout(); setIsProfileMenuOpen(false); }}
                        className="dropdown-item flex items-center gap-3 w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">{t('nav.logout')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <Outlet />
        </div>
      </main>

      {/* Right Column - Suggested Users */}
      <aside className="right-column layout-column relative z-10">
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
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-primary-500 flex-shrink-0" />
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
    </div>
  );
};

export default MainLayout;