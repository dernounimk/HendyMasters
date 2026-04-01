// src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Menu, X, Home, Users, FileText, MessageCircle, 
  Bell, User, LogOut, Settings, ChevronDown, 
  Sun, Moon, Globe, Search, PlusCircle, Bookmark,
  Briefcase, Wrench, UserCog
} from 'lucide-react';

import { useStore } from '../../store'; // ✅ استيراد من Zustand بدلاً من Context

const Layout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ استخدام Zustand store
  const { 
    user, 
    isAuthenticated, 
    logout, 
    isLoading,
    theme,
    toggleTheme,
    currentLanguage,
    changeLanguage 
  } = useStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // تحديد إذا كان المسار الحالي يتطلب عرض Sidebar
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const showSidebar = isAuthenticated && !isAuthPage;

  // إغلاق القوائم عند تغيير المسار
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/artisans', icon: Users, label: t('nav.artisans') },
    { path: '/posts', icon: FileText, label: t('nav.posts') },
    { path: '/chat', icon: MessageCircle, label: t('nav.chat'), badge: 3 },
    { path: '/notifications', icon: Bell, label: t('nav.notifications'), badge: 5 },
    { path: '/profile', icon: User, label: t('nav.profile') },
    { path: '/saved', icon: Bookmark, label: t('nav.saved') },
  ];

  const roleBasedItems = {
    artisan: [
      { path: '/artisan/dashboard', icon: Briefcase, label: t('nav.artisanDashboard') },
      { path: '/posts/create', icon: PlusCircle, label: t('nav.createPost') },
    ],
    worker: [
      { path: '/worker/dashboard', icon: Wrench, label: t('nav.workerDashboard') },
      { path: '/jobs', icon: Briefcase, label: t('nav.jobs') },
    ],
    client: [
      { path: '/dashboard', icon: UserCog, label: t('nav.dashboard') },
      { path: '/posts/create', icon: PlusCircle, label: t('nav.createPost') },
    ]
  };

  // إضافة العناصر حسب دور المستخدم
  if (user?.role && roleBasedItems[user.role]) {
    navigationItems.push(...roleBasedItems[user.role]);
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  // إذا كانت صفحة مصادقة، اعرض المحتوى بدون Sidebar
  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar للمستخدمين غير المسجلين */}
      {!isAuthenticated && (
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-primary-600">
                  HandyMasters
                </Link>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {/* Language Switcher */}
                <div className="relative">
                  <button
                    onClick={() => {}}
                    className="flex items-center space-x-1 rtl:space-x-reverse text-gray-700 dark:text-gray-300"
                  >
                    <Globe className="w-5 h-5" />
                    <span>{languages.find(l => l.code === currentLanguage)?.flag}</span>
                  </button>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Auth Buttons */}
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {t('nav.register')}
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Layout للمستخدمين المسجلين مع Sidebar */}
      {isAuthenticated && (
        <div className="flex h-screen">
          {/* Sidebar للهواتف */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
            )}
          </AnimatePresence>

          <motion.aside
            initial={{ x: currentLanguage === 'ar' ? 300 : -300 }}
            animate={{ x: isSidebarOpen ? 0 : currentLanguage === 'ar' ? 300 : -300 }}
            transition={{ type: "spring", damping: 20 }}
            className={`fixed top-0 ${currentLanguage === 'ar' ? 'right-0' : 'left-0'} h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-50 lg:static lg:translate-x-0`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-primary-600">
                  HandyMasters
                </Link>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 rtl:space-x-reverse w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {/* Top Bar */}
            <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center justify-between px-4 h-16">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex-1 flex items-center justify-end space-x-4 rtl:space-x-reverse">
                  {/* Search */}
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Language Switcher */}
                  <div className="relative">
                    <button
                      onClick={() => {}}
                      className="flex items-center space-x-1 rtl:space-x-reverse p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Globe className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  {/* Notifications */}
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>

                  {/* Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute ${currentLanguage === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700`}
                        >
                          <Link
                            to="/profile"
                            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>{t('nav.profile')}</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>{t('nav.settings')}</span>
                          </Link>
                          <hr className="my-1 dark:border-gray-700" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 rtl:space-x-reverse w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t('nav.logout')}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t dark:border-gray-700"
                  >
                    <div className="p-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t('nav.searchPlaceholder')}
                          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                          autoFocus
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Page Content */}
            <div className="p-4">
              {children}
            </div>
          </main>
        </div>
      )}

      {/* إذا كان المستخدم غير مسجل، اعرض المحتوى فقط */}
      {!isAuthenticated && (
        <main>
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;