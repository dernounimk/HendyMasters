// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  User, Lock, Globe, Moon, Sun, Ban, Shield,
  ChevronRight, Eye, EyeOff, CheckCircle, Loader,
  Save, Key, Mail, MapPin, LogOut, RefreshCw
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { 
    user, 
    theme, 
    toggleTheme, 
    updateUser, 
    logout,
    updateProfile,
    updatePrivacy,
    fetchBlockedUsers,
    unblockUser,
    changePassword,
    requestResetCode,
    verifyResetCode,
    resetPasswordWithCode
  } = useStore();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: '',
    phone: '',
    bio: '',
    location: '',
    email: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Reset password with email state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPasswordReset, setNewPasswordReset] = useState('');
  const [resetStep, setResetStep] = useState('email');
  const [resetLoading, setResetLoading] = useState(false);
  
  // Privacy state
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showOnlineStatus: true
  });
  
  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  
  // Show password toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        email: user.email || ''
      });
      setPrivacy({
        showEmail: user.privacy?.showEmail || false,
        showPhone: user.privacy?.showPhone || false,
        showLocation: user.privacy?.showLocation !== false,
        showOnlineStatus: user.privacy?.showOnlineStatus !== false
      });
    }
  }, [user]);
  
  // Fetch blocked users
  const loadBlockedUsers = async () => {
    setLoadingBlocked(true);
    try {
      const users = await fetchBlockedUsers();
      setBlockedUsers(users);
    } catch (error) {
      toast.error('فشل في جلب قائمة المحظورين');
    } finally {
      setLoadingBlocked(false);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'blocked') {
      loadBlockedUsers();
    }
  }, [activeTab]);
  
  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateProfile({
        username: profileForm.username,
        phone: profileForm.phone,
        bio: profileForm.bio,
        location: profileForm.location
      });
      
      if (result.success) {
        toast.success('تم تحديث الملف الشخصي بنجاح');
      } else {
        toast.error(result.error || 'فشل تحديث الملف الشخصي');
      }
    } catch (error) {
      toast.error(error.message || 'فشل تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };
  
  // Update privacy
  const handleUpdatePrivacy = async () => {
    setLoading(true);
    try {
      const result = await updatePrivacy(privacy);
      if (result.success) {
        toast.success('تم تحديث إعدادات الخصوصية');
      } else {
        toast.error(result.error || 'فشل تحديث الخصوصية');
      }
    } catch (error) {
      toast.error(error.message || 'فشل تحديث الخصوصية');
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setLoading(true);
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        toast.success('تم تغيير كلمة المرور بنجاح');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.error || 'فشل تغيير كلمة المرور');
      }
    } catch (error) {
      toast.error(error.message || 'فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };
  
  // Request reset code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('البريد الإلكتروني مطلوب');
      return;
    }
    
    setResetLoading(true);
    try {
      const result = await requestResetCode(resetEmail);
      if (result.success) {
        setResetStep('code');
        toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      } else {
        toast.error(result.error || 'فشل إرسال الرمز');
      }
    } catch (error) {
      toast.error(error.message || 'فشل إرسال الرمز');
    } finally {
      setResetLoading(false);
    }
  };
  
  // Verify reset code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!resetCode || resetCode.length !== 6) {
      toast.error('الرمز يجب أن يكون 6 أرقام');
      return;
    }
    
    setResetLoading(true);
    try {
      const result = await verifyResetCode(resetEmail, resetCode);
      if (result.valid) {
        setResetStep('password');
        toast.success('الرمز صحيح، أدخل كلمة المرور الجديدة');
      } else {
        toast.error(result.error || 'الرمز غير صحيح');
      }
    } catch (error) {
      toast.error(error.message || 'فشل التحقق من الرمز');
    } finally {
      setResetLoading(false);
    }
  };
  
  // Reset password with code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPasswordReset || newPasswordReset.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setResetLoading(true);
    try {
      const result = await resetPasswordWithCode(resetEmail, resetCode, newPasswordReset);
      if (result.success) {
        toast.success('تم إعادة تعيين كلمة المرور بنجاح');
        setResetStep('email');
        setResetEmail('');
        setResetCode('');
        setNewPasswordReset('');
      } else {
        toast.error(result.error || 'فشل إعادة تعيين كلمة المرور');
      }
    } catch (error) {
      toast.error(error.message || 'فشل إعادة تعيين كلمة المرور');
    } finally {
      setResetLoading(false);
    }
  };
  
  // Unblock user
  const handleUnblockUser = async (userId, username) => {
    try {
      const result = await unblockUser(userId);
      if (result.success) {
        toast.success(`تم إلغاء حظر ${username}`);
        setBlockedUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        toast.error(result.error || 'فشل إلغاء الحظر');
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ');
    }
  };
  
  // Change language
  const changeLanguage = async (lang) => {
    setSelectedLanguage(lang);
    await i18n.changeLanguage(lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
    toast.success(`تم تغيير اللغة إلى ${lang === 'ar' ? 'العربية' : 'English'}`);
  };
  
  // Tabs
  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'security', label: 'الأمان', icon: Lock },
    { id: 'privacy', label: 'الخصوصية', icon: Shield },
    { id: 'appearance', label: 'المظهر', icon: theme === 'dark' ? Moon : Sun },
    { id: 'language', label: 'اللغة', icon: Globe },
    { id: 'blocked', label: 'المستخدمون المحظورون', icon: Ban },
  ];
  
  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          الإعدادات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          إدارة حسابك وتفضيلاتك الشخصية
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-4 border-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-right">{tab.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  الملف الشخصي
                </h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الموقع
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        placeholder="المدينة، الولاية"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      السيرة الذاتية
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="اكتب نبذة عن نفسك..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    حفظ التغييرات
                  </button>
                </form>
              </motion.div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Change Password */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary-500" />
                    تغيير كلمة المرور
                  </h2>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        كلمة المرور الحالية
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        كلمة المرور الجديدة
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                      تغيير كلمة المرور
                    </button>
                  </form>
                </div>
                
                {/* Reset Password with Email */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary-500" />
                    إعادة تعيين كلمة المرور عبر البريد
                  </h2>
                  
                  {resetStep === 'email' && (
                    <form onSubmit={handleRequestResetCode}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="example@email.com"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {resetLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                        إرسال رمز التحقق
                      </button>
                    </form>
                  )}
                  
                  {resetStep === 'code' && (
                    <form onSubmit={handleVerifyCode}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          رمز التحقق
                        </label>
                        <input
                          type="text"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          placeholder="أدخل الرمز المكون من 6 أرقام"
                          maxLength={6}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          تم إرسال الرمز إلى {resetEmail}
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {resetLoading ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        التحقق من الرمز
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetStep('email')}
                        className="w-full mt-2 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        تغيير البريد الإلكتروني
                      </button>
                    </form>
                  )}
                  
                  {resetStep === 'password' && (
                    <form onSubmit={handleResetPassword}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          كلمة المرور الجديدة
                        </label>
                        <div className="relative">
                          <input
                            type={showResetPassword ? 'text' : 'password'}
                            value={newPasswordReset}
                            onChange={(e) => setNewPasswordReset(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {resetLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                        إعادة تعيين كلمة المرور
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  إعدادات الخصوصية
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">إظهار البريد الإلكتروني</p>
                      <p className="text-sm text-gray-500">عرض بريدك الإلكتروني في الملف الشخصي</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.showEmail ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          privacy.showEmail ? 'right-1 translate-x-0' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">إظهار رقم الهاتف</p>
                      <p className="text-sm text-gray-500">عرض رقم هاتفك في الملف الشخصي</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showPhone: !privacy.showPhone })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.showPhone ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          privacy.showPhone ? 'right-1 translate-x-0' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">إظهار الموقع</p>
                      <p className="text-sm text-gray-500">عرض موقعك في الملف الشخصي</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showLocation: !privacy.showLocation })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.showLocation ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          privacy.showLocation ? 'right-1 translate-x-0' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">إظهار حالة الاتصال</p>
                      <p className="text-sm text-gray-500">عرض ما إذا كنت متصلاً أم لا</p>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showOnlineStatus: !privacy.showOnlineStatus })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy.showOnlineStatus ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          privacy.showOnlineStatus ? 'right-1 translate-x-0' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleUpdatePrivacy}
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ الإعدادات
                </button>
              </motion.div>
            )}
            
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-primary-500" />}
                  المظهر
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <Sun className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                    <p className="font-medium text-gray-900 dark:text-white">فاتح</p>
                    <p className="text-sm text-gray-500">وضع النهار</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <Moon className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
                    <p className="font-medium text-gray-900 dark:text-white">داكن</p>
                    <p className="text-sm text-gray-500">وضع الليل</p>
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Language Tab */}
            {activeTab === 'language' && (
              <motion.div
                key="language"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-500" />
                  اللغة
                </h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedLanguage === 'ar'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-2xl">🇸🇦</span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-900 dark:text-white">العربية</p>
                      <p className="text-sm text-gray-500">Arabic</p>
                    </div>
                    {selectedLanguage === 'ar' && <CheckCircle className="w-5 h-5 text-primary-500" />}
                  </button>
                  
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedLanguage === 'en'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-2xl">🇺🇸</span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-900 dark:text-white">English</p>
                      <p className="text-sm text-gray-500">الإنجليزية</p>
                    </div>
                    {selectedLanguage === 'en' && <CheckCircle className="w-5 h-5 text-primary-500" />}
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Blocked Users Tab */}
            {activeTab === 'blocked' && (
              <motion.div
                key="blocked"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-500" />
                  المستخدمون المحظورون
                </h2>
                
                {loadingBlocked ? (
                  <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ban className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">لا يوجد مستخدمون محظورون</p>
                    <p className="text-sm text-gray-400 mt-2">عند حظر مستخدم، سيظهر هنا</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedUsers.map((blockedUser) => (
                      <div
                        key={blockedUser._id}
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
                      >
                        <img
                          src={blockedUser.profileImage || defaultImgProfile}
                          alt={blockedUser.username}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => { e.target.src = defaultImgProfile; }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{blockedUser.username}</p>
                          <p className="text-sm text-gray-500">{blockedUser.role === 'client' ? 'عميل' : blockedUser.role === 'artisan' ? 'حرفي' : 'عامل'}</p>
                        </div>
                        <button
                          onClick={() => handleUnblockUser(blockedUser._id, blockedUser.username)}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          إلغاء الحظر
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Logout Button */}
          <div className="mt-6">
            <button
              onClick={logout}
              className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 font-semibold rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;