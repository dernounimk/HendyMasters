// frontend/src/pages/Settings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  User, Lock, Globe, Moon, Sun, Ban, Shield,
  ChevronRight, Eye, EyeOff, CheckCircle, Loader,
  Save, Key, Mail, MapPin, LogOut, RefreshCw,
  Languages, Phone, Award, Star, Wrench
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

// إضافة CSS مخصص بنفس نمط Saved.jsx
const settingsStyle = document.createElement('style');
settingsStyle.textContent = `
  /* ==================== الوضع الفاتح (الألوان الداكنة) ==================== */
  .settings-glass-card {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  /* النصوص الرئيسية في الوضع الفاتح - أسود */
  .settings-glass-card h1,
  .settings-glass-card h2,
  .settings-glass-card h3,
  .settings-glass-card .title-text,
  .settings-glass-card .font-bold,
  .settings-glass-card .font-semibold {
    color: #1f2937 !important;
  }
  
  /* النصوص العادية في الوضع الفاتح - رمادي غامق */
  .settings-glass-card p,
  .settings-glass-card span,
  .settings-glass-card label {
    color: #374151 !important;
  }
  
  /* النصوص الثانوية في الوضع الفاتح */
  .settings-glass-card .text-gray-500,
  .settings-glass-card .text-gray-600,
  .settings-glass-card .text-sm:not(.font-bold) {
    color: #6b7280 !important;
  }
  
  /* ==================== الوضع المظلم ==================== */
  .dark .settings-glass-card {
    background: rgba(17, 24, 39, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  /* النصوص الرئيسية في الوضع المظلم - أبيض */
  .dark .settings-glass-card h1,
  .dark .settings-glass-card h2,
  .dark .settings-glass-card h3,
  .dark .settings-glass-card .font-bold,
  .dark .settings-glass-card .font-semibold {
    color: #f3f4f6 !important;
  }
  
  /* النصوص العادية في الوضع المظلم - رمادي فاتح */
  .dark .settings-glass-card p,
  .dark .settings-glass-card span,
  .dark .settings-glass-card label {
    color: #d1d5db !important;
  }
  
  /* النصوص الثانوية في الوضع المظلم */
  .dark .settings-glass-card .text-gray-500,
  .dark .settings-glass-card .text-gray-600 {
    color: #9ca3af !important;
  }
  
  .settings-glass-card:hover {
    border-color: #2563eb !important;
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);
  }
  
  .dark .settings-glass-card:hover {
    border-color: #3b82f6 !important;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
  }
  
  /* ==================== أزرار التحديث ==================== */
  .settings-refresh-btn {
    transition: all 0.3s ease;
  }
  
  .settings-refresh-btn:hover {
    transform: rotate(180deg);
    background: rgba(37, 99, 235, 0.1);
  }
  
  /* ==================== سكيلتون الشاشة ==================== */
  .settings-skeleton {
    background: rgba(255, 255, 255, 0.4) !important;
    backdrop-filter: blur(4px);
  }
  
  .dark .settings-skeleton {
    background: rgba(31, 41, 55, 0.4) !important;
  }
  
  /* ==================== الحقول والإدخالات ==================== */
  .settings-input {
    background: rgba(255, 255, 255, 0.5) !important;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(37, 99, 235, 0.2) !important;
    border-radius: 20px;
    transition: all 0.3s ease;
    color: #1f2937 !important;
  }
  
  .dark .settings-input {
    background: rgba(31, 41, 55, 0.5) !important;
    border-color: rgba(59, 130, 246, 0.2) !important;
    color: #f3f4f6 !important;
  }
  
  .settings-input:focus {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    outline: none;
  }
  
  /* ==================== أزرار التبديل (Toggle) ==================== */
  .settings-toggle {
    position: relative;
    width: 48px;
    height: 24px;
    border-radius: 30px;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .settings-toggle.active {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  }
  
  .settings-toggle.inactive {
    background: #cbd5e1 !important;
  }
  
  .dark .settings-toggle.inactive {
    background: #4b5563 !important;
  }
  
  .settings-toggle-knob {
    position: absolute;
    top: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  /* ==================== الشريط الجانبي ==================== */
  .settings-sidebar-btn-active {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(29, 78, 216, 0.15) 100%) !important;
    color: #2563eb !important;
    border-right: 4px solid #2563eb !important;
  }
  
  .dark .settings-sidebar-btn-active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%) !important;
    color: #3b82f6 !important;
    border-right: 4px solid #3b82f6 !important;
  }
  
  .settings-sidebar-btn-inactive {
    color: #4b5563 !important;
  }
  
  .settings-sidebar-btn-inactive:hover {
    background: rgba(0, 0, 0, 0.05) !important;
    color: #2563eb !important;
  }
  
  .dark .settings-sidebar-btn-inactive {
    color: #9ca3af !important;
  }
  
  .dark .settings-sidebar-btn-inactive:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    color: #3b82f6 !important;
  }
  
  /* ==================== عنوان الصفحة ==================== */
  .settings-title {
    color: #1f2937 !important;
  }
  
  .dark .settings-title {
    color: #f3f4f6 !important;
  }
  
  .settings-subtitle {
    color: #6b7280 !important;
  }
  
  .dark .settings-subtitle {
    color: #9ca3af !important;
  }
`;
document.head.appendChild(settingsStyle);

// Skeleton Component بنفس نمط Saved
const SettingsSkeleton = () => {
  return (
    <div className="settings-skeleton rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex-1">
          <div className="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-12 w-full bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
        <div className="h-12 w-full bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
        <div className="h-12 w-full bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
        <div className="h-12 w-5/6 bg-gray-300 dark:bg-gray-600 rounded-xl mx-auto"></div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { 
    user, 
    theme, 
    toggleTheme, 
    logout,
    updatePrivacy,
    fetchBlockedUsers,
    unblockUser,
    changePassword,
    fetchCurrentUserProfile
  } = useStore();
  
  const [activeTab, setActiveTab] = useState('security');
  const [loading, setLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [blockedLoaded, setBlockedLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showOnlineStatus: true
  });
  
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const isRTL = i18n.language === 'ar';
  
  const languages = [
    { code: 'ar', name: t('languages.arabic'), nativeName: 'العربية', dir: 'rtl' },
    { code: 'en', name: t('languages.english'), nativeName: 'English', dir: 'ltr' },
    { code: 'fr', name: t('languages.french'), nativeName: 'Français', dir: 'ltr' }
  ];
  
  useEffect(() => {
    if (user) {
      setPrivacy({
        showEmail: user.privacy?.showEmail || false,
        showPhone: user.privacy?.showPhone || false,
        showLocation: user.privacy?.showLocation !== false,
        showOnlineStatus: user.privacy?.showOnlineStatus !== false
      });
    }
  }, [user]);
  
  const loadBlockedUsers = useCallback(async (force = false) => {
    if (blockedLoaded && !force) return;
    if (loadingBlocked) return;
    
    setLoadingBlocked(true);
    try {
      const users = await fetchBlockedUsers();
      setBlockedUsers(users || []);
      setBlockedLoaded(true);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      toast.error(t('errors.blockedFetchError', 'Failed to load blocked users'));
    } finally {
      setLoadingBlocked(false);
    }
  }, [fetchBlockedUsers, blockedLoaded, loadingBlocked, t]);
  
  useEffect(() => {
    if (activeTab === 'blocked' && !blockedLoaded && !loadingBlocked) {
      loadBlockedUsers();
    }
  }, [activeTab, blockedLoaded, loadingBlocked, loadBlockedUsers]);
  
  const handleUpdatePrivacy = async () => {
    setLoading(true);
    try {
      const result = await updatePrivacy(privacy);
      if (result.success) {
        await fetchCurrentUserProfile();
        toast.success(t('success.privacyUpdated', 'Privacy settings updated'));
      } else {
        toast.error(result.error || t('errors.privacyUpdateError', 'Failed to update privacy'));
      }
    } catch (error) {
      toast.error(error.message || t('errors.privacyUpdateError', 'Failed to update privacy'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('errors.passwordMismatch', 'New passwords do not match'));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t('errors.passwordTooShort', 'Password must be at least 6 characters'));
      return;
    }
    if (!passwordForm.currentPassword) {
      toast.error(t('errors.currentPasswordRequired', 'Current password is required'));
      return;
    }
    
    setLoading(true);
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        toast.success(t('success.passwordChanged', 'Password changed successfully'));
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.error || t('errors.passwordChangeError', 'Failed to change password'));
      }
    } catch (error) {
      toast.error(error.message || t('errors.passwordChangeError', 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnblockUser = async (userId, username) => {
    try {
      const result = await unblockUser(userId);
      if (result.success) {
        toast.success(t('success.userUnblocked', '{{username}} has been unblocked', { username }));
        setBlockedUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        toast.error(result.error || t('errors.unblockError', 'Failed to unblock user'));
      }
    } catch (error) {
      toast.error(error.message || t('errors.unblockError', 'Failed to unblock user'));
    }
  };
  
  const changeLanguage = async (lang) => {
    setSelectedLanguage(lang);
    await i18n.changeLanguage(lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
    toast.success(t('success.languageChanged', 'Language changed to {{language}}', { 
      language: languages.find(l => l.code === lang)?.name 
    }));
  };
  
  const handleRefresh = () => {
    if (activeTab === 'blocked') {
      setRefreshing(true);
      setBlockedLoaded(false);
      loadBlockedUsers(true).finally(() => setRefreshing(false));
    }
  };
  
  const tabs = [
    { id: 'security', label: t('nav.security'), icon: Lock },
    { id: 'privacy', label: t('nav.privacy'), icon: Shield },
    { id: 'appearance', label: t('nav.appearance'), icon: theme === 'dark' ? Moon : Sun },
    { id: 'language', label: t('nav.language'), icon: Languages },
    { id: 'blocked', label: t('nav.blocked'), icon: Ban },
  ];
  
  // أنيميشن بسيط وسلس للظهور والاختفاء
  const pageAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.25, ease: "easeInOut" }
  };
  
  return (
    <div className="w-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold settings-title">{t('nav.settings')}</h1>
            <p className="text-sm settings-subtitle">{t('settings.subtitle')}</p>
          </div>
        </div>
        
        {activeTab === 'blocked' && blockedLoaded && blockedUsers.length > 0 && (
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 disabled:opacity-50 shadow-md settings-refresh-btn"
            title={t('common.refresh') || 'تحديث'}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: '#4b5563' }} />
          </motion.button>
        )}
      </motion.div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* الشريط الجانبي */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="settings-glass-card overflow-hidden">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-300 ${
                    isActive 
                      ? 'settings-sidebar-btn-active' 
                      : 'settings-sidebar-btn-inactive'
                  } ${isRTL && isActive ? 'border-l-4 border-r-0' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-right font-medium">{tab.label}</span>
                  <ChevronRight className={`w-4 h-4 opacity-50 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* المحتوى الرئيسي - مع أنيميشن سلسة عند التبديل */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageAnimation}
                className="max-w-md mx-auto"
              >
                <div className="settings-glass-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold">{t('settings.security.changePassword')}</h2>
                  </div>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('settings.security.currentPassword')}</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="settings-input w-full px-4 py-2.5"
                          required
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('settings.security.newPassword')}</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="settings-input w-full px-4 py-2.5"
                          required
                          minLength={6}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('settings.security.confirmPassword')}</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="settings-input w-full px-4 py-2.5"
                          required
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                      {t('settings.security.changePasswordBtn')}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageAnimation}
                className="settings-glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold">{t('settings.privacy.title')}</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div>
                      <p className="font-medium">{t('settings.privacy.showEmail')}</p>
                      <p className="text-sm">{t('settings.privacy.showEmailDesc')}</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                      className={`settings-toggle ${privacy.showEmail ? 'active' : 'inactive'}`}
                    >
                      <div className={`settings-toggle-knob ${privacy.showEmail ? (isRTL ? 'right-1' : 'right-1') : (isRTL ? 'left-1' : 'left-1')}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div>
                      <p className="font-medium">{t('settings.privacy.showPhone')}</p>
                      <p className="text-sm">{t('settings.privacy.showPhoneDesc')}</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showPhone: !privacy.showPhone })}
                      className={`settings-toggle ${privacy.showPhone ? 'active' : 'inactive'}`}
                    >
                      <div className={`settings-toggle-knob ${privacy.showPhone ? (isRTL ? 'right-1' : 'right-1') : (isRTL ? 'left-1' : 'left-1')}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div>
                      <p className="font-medium">{t('settings.privacy.showLocation')}</p>
                      <p className="text-sm">{t('settings.privacy.showLocationDesc')}</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showLocation: !privacy.showLocation })}
                      className={`settings-toggle ${privacy.showLocation ? 'active' : 'inactive'}`}
                    >
                      <div className={`settings-toggle-knob ${privacy.showLocation ? (isRTL ? 'right-1' : 'right-1') : (isRTL ? 'left-1' : 'left-1')}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{t('settings.privacy.showOnlineStatus')}</p>
                      <p className="text-sm">{t('settings.privacy.showOnlineStatusDesc')}</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showOnlineStatus: !privacy.showOnlineStatus })}
                      className={`settings-toggle ${privacy.showOnlineStatus ? 'active' : 'inactive'}`}
                    >
                      <div className={`settings-toggle-knob ${privacy.showOnlineStatus ? (isRTL ? 'right-1' : 'right-1') : (isRTL ? 'left-1' : 'left-1')}`} />
                    </button>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdatePrivacy}
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {t('common.save')}
                </motion.button>
              </motion.div>
            )}
            
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageAnimation}
                className="settings-glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-lg font-bold">{t('settings.appearance.title')}</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { if (theme !== 'light') toggleTheme(); }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                        : 'border-gray-200/50 hover:border-blue-400 bg-white/10'
                    }`}
                  >
                    <Sun className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                    <p className="font-medium">{t('settings.appearance.light')}</p>
                    <p className="text-sm">{t('settings.appearance.lightDesc')}</p>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                        : 'border-gray-200/50 hover:border-blue-400 bg-white/10'
                    }`}
                  >
                    <Moon className="w-10 h-10 mx-auto mb-3 text-indigo-500" />
                    <p className="font-medium">{t('settings.appearance.dark')}</p>
                    <p className="text-sm">{t('settings.appearance.darkDesc')}</p>
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'language' && (
              <motion.div
                key="language"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageAnimation}
                className="settings-glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold">{t('settings.language.title')}</h2>
                </div>
                
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ scale: 1.01, x: isRTL ? -4 : 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                        selectedLanguage === lang.code
                          ? 'border-blue-500 bg-blue-500/10 shadow-md'
                          : 'border-gray-200/50 hover:border-blue-400 bg-white/10'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-lg font-bold text-white">{lang.nativeName.charAt(0)}</span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-medium">{lang.name}</p>
                        <p className="text-sm">{lang.nativeName}</p>
                      </div>
                      {selectedLanguage === lang.code && <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'blocked' && (
              <motion.div
                key="blocked"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageAnimation}
                className="settings-glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                    <Ban className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold">{t('settings.blocked.title')}</h2>
                </div>
                
                {loadingBlocked ? (
                  <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100/50 dark:bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ban className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="font-medium">{t('settings.blocked.noUsers')}</p>
                    <p className="text-sm mt-2">{t('settings.blocked.noUsersDesc')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {blockedUsers.map((blockedUser, index) => (
                        <motion.div
                          key={blockedUser._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-white/20 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300"
                        >
                          <img
                            src={blockedUser.profileImage || defaultImgProfile}
                            alt={blockedUser.username}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white/50 dark:border-gray-600/50"
                            onError={(e) => { e.target.src = defaultImgProfile; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{blockedUser.username}</p>
                            <p className="text-sm">
                              {blockedUser.role === 'client' ? t('roles.client') : 
                               blockedUser.role === 'artisan' ? t('roles.artisan') : t('roles.worker')}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUnblockUser(blockedUser._id, blockedUser.username)}
                            className="px-4 py-2 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-all duration-300 font-medium"
                          >
                            {t('settings.blocked.unblock')}
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* زر تسجيل الخروج */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-6"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={logout}
              className="w-full py-4 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-2xl hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              {t('nav.logout')}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;