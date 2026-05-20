import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, ArrowLeft,
  User, Wrench, Users, Shield, AlertCircle, CheckCircle,
  Globe, ChevronDown, Sparkles, Fingerprint, Key,
  Clock, AlertTriangle, Loader, X, Zap
} from 'lucide-react';

import { useStore } from '../store';
import Lottie from 'lottie-react';
import loginAnimation from '../assets/animations/login-animation.json';

const style = document.createElement('style');
style.textContent = `
  html, body {
    overflow: hidden !important;
    height: 100vh !important;
    width: 100vw !important;
    margin: 0 !important;
    padding: 0 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
  }

  #root {
    height: 100vh !important;
    width: 100vw !important;
    overflow: hidden !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
  }

  .h-screen {
    height: 100vh !important;
    max-height: 100vh !important;
    overflow: hidden !important;
  }

  .no-scrollbar {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
    overflow-y: hidden !important;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none !important;
  }

  .language-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .language-button:hover {
    transform: scale(1.05);
  }

  .error-shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }

  .success-pulse {
    animation: pulse 1s ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .dropdown-scroll {
    max-height: 200px;
    overflow-y: auto !important;
  }

  .language-transition {
    transition: all 0.3s ease-in-out;
  }
  
  .language-transition * {
    transition: transform 0.3s ease-in-out, margin 0.3s ease-in-out, padding 0.3s ease-in-out;
  }

  .fade-enter {
    opacity: 0;
  }
  
  .fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in;
  }
  
  .fade-exit {
    opacity: 1;
  }
  
  .fade-exit-active {
    opacity: 0;
    transition: opacity 300ms ease-in;
  }

  [dir="rtl"] .space-x-reverse {
    --tw-space-x-reverse: 1;
  }

  /* إصلاحات RTL المحسنة للـ Inputs */
  [dir="rtl"] .input-with-icon-left {
    padding-right: 2.75rem !important;
    padding-left: 1rem !important;
  }
  
  [dir="rtl"] .input-with-icon-right {
    padding-left: 2.75rem !important;
    padding-right: 1rem !important;
  }
  
  [dir="ltr"] .input-with-icon-left {
    padding-left: 2.75rem !important;
    padding-right: 1rem !important;
  }
  
  [dir="ltr"] .input-with-icon-right {
    padding-right: 2.75rem !important;
    padding-left: 1rem !important;
  }
  
  /* مواضع الأيقونات في RTL/LTR */
  [dir="rtl"] .icon-left {
    right: 0.875rem;
    left: auto;
  }
  
  [dir="rtl"] .icon-right {
    left: 0.875rem;
    right: auto;
  }
  
  [dir="ltr"] .icon-left {
    left: 0.875rem;
    right: auto;
  }
  
  [dir="ltr"] .icon-right {
    right: 0.875rem;
    left: auto;
  }
  
  /* توجيه النص في الحقول */
  [dir="rtl"] input {
    text-align: right;
  }
  
  [dir="ltr"] input {
    text-align: left;
  }
  
  input {
    text-overflow: ellipsis;
  }
  
  input::placeholder {
    opacity: 0.7;
    font-size: 0.875rem;
  }
`;
document.head.appendChild(style);

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // استخدام Zustand store
  const { 
    login, 
    isLoading, 
    isLocked, 
    lockTimeRemaining,
    loginAttempts,
    isAuthenticated,
    user
  } = useStore();

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState({ field: null, message: '' });
  
  const languageButtonRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const formRef = useRef(null);

  // توجيه المستخدم إذا كان مسجل الدخول بالفعل
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // إظهار تأثير النجاح عند نجاح تسجيل الدخول
  useEffect(() => {
    if (isAuthenticated) {
      setShowSuccessAnimation(true);
      
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // معالجة تغيير اللغة
  useEffect(() => {
    const handleLanguageChange = () => {
      const newIsRTL = i18n.language === 'ar';
      if (newIsRTL !== isRTL) {
        setIsTransitioning(true);
        setIsRTL(newIsRTL);
        
        document.documentElement.dir = newIsRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
        
        document.body.classList.add('language-transition');
        
        setTimeout(() => {
          document.body.classList.remove('language-transition');
          setIsTransitioning(false);
        }, 300);
      }
    };

    handleLanguageChange();
  }, [i18n.language, isRTL]);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageButtonRef.current && !languageButtonRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const formatLockTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return [t('validation.email.invalidFormat')];
    }
    return [];
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = t('validation.required.email');
    } else {
      const emailErrors = validateEmail(formData.email);
      if (emailErrors.length > 0) {
        errors.email = emailErrors[0];
      }
    }
    
    if (!formData.password) {
      errors.password = t('validation.required.password');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // مسح الخطأ الخاص بالحقل عند التغيير
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // مسح خطأ تسجيل الدخول الخاص بالحقل عند التغيير
    if (loginError.field === name) {
      setLoginError({ field: null, message: '' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'CapsLock') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setErrorMessage(t('login.errors.accountLocked'));
      return;
    }
    
    setSubmitted(true);
    setLoginError({ field: null, message: '' });
    
    if (!validateForm()) {
      formRef.current?.classList.add('error-shake');
      setTimeout(() => formRef.current?.classList.remove('error-shake'), 500);
      return;
    }
    
    // إخفاء animation قبل البدء
    setShowSuccessAnimation(false);
    
    // استدعاء دالة login
    const result = await login(formData.email, formData.password);
    
    if (!result?.success) {
      // التحقق من نوع الخطأ
      const error = result?.error || '';
      console.log('Login error:', error);
      
      // محاكاة أخطاء مختلفة للتجربة
      if (formData.email === 'test@test.com' || error.includes('email') || error.includes('بريد')) {
        setLoginError({ 
          field: 'email', 
          message: t('login.errors.emailNotFound') || 'البريد الإلكتروني غير صحيح أو غير موجود'
        });
        setFormData(prev => ({ ...prev, email: '' }));
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      } 
      else if (formData.password === 'wrong' || error.includes('password') || error.includes('كلمة المرور')) {
        setLoginError({ 
          field: 'password', 
          message: t('login.errors.invalidPassword') || 'كلمة المرور غير صحيحة'
        });
        setFormData(prev => ({ ...prev, password: '' }));
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
      } else {
        setErrorMessage(error || t('login.errors.invalidCredentials'));
      }
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' }
  ];

  const changeLanguage = (lng) => {
    if (lng === i18n.language) return;
    
    setIsTransitioning(true);
    
    const langOrder = ['ar', 'fr', 'en'];
    const currentIndex = langOrder.indexOf(i18n.language);
    const newIndex = langOrder.indexOf(lng);
    setDirection(newIndex > currentIndex ? 1 : -1);
    
    setShowLanguageMenu(false);
    
    setTimeout(() => {
      i18n.changeLanguage(lng);
      localStorage.setItem('i18nextLng', lng);
      
      const langButton = document.querySelector('.language-button');
      if (langButton) {
        langButton.classList.add('scale-110');
        setTimeout(() => {
          langButton.classList.remove('scale-110');
        }, 200);
      }
    }, 50);
  };

  const languageSwitchVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const renderFieldError = (fieldName) => {
    // عرض خطأ التحقق الأول
    if (submitted && validationErrors[fieldName]) {
      return (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1 flex items-center space-x-1 rtl:space-x-reverse"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{validationErrors[fieldName]}</span>
        </motion.p>
      );
    }
    
    // عرض خطأ تسجيل الدخول الخاص بالحقل
    if (loginError.field === fieldName) {
      return (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1 flex items-center space-x-1 rtl:space-x-reverse"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{loginError.message}</span>
        </motion.p>
      );
    }
    
    return null;
  };

  return (
    <div 
      ref={formRef}
      className={`h-screen flex overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 no-scrollbar ${
        showSuccessAnimation ? 'success-pulse' : ''
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={i18n.language}
    >
      {/* Language Switcher - مطابق تماماً لصفحة Register */}
      <div 
        ref={languageButtonRef}
        className={`fixed top-4 z-50 ${isRTL ? 'left-4' : 'right-4'}`}
        style={{ transition: 'left 0.3s ease-in-out, right 0.3s ease-in-out' }}
      >
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="language-button flex items-center space-x-2 rtl:space-x-reverse bg-white dark:bg-gray-800 shadow-lg rounded-lg px-5 py-2.5 text-base font-medium text-gray-700 dark:text-gray-200 transition-colors border border-gray-200 dark:border-gray-700"
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm">{languages.find(lang => lang.code === i18n.language)?.name || 'English'}</span>
            <motion.div
              animate={{ rotate: showLanguageMenu ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {showLanguageMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden dropdown-scroll`}
              >
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left rtl:text-right px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 rtl:space-x-reverse ${
                      i18n.language === lang.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <span className="flex-1">{lang.name}</span>
                    {i18n.language === lang.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Notification - للأخطاء العامة فقط */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 z-50 ${isRTL ? 'left-1/2 -translate-x-1/2' : 'left-1/2 -translate-x-1/2'} bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 max-w-md w-full mx-4`}
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400 flex-1">{errorMessage}</p>
              <button
                onClick={() => setShowError(false)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <motion.div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        animate={{ scale: isTransitioning ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          animate={{
            x: isRTL ? [0, -20, 0] : [0, 20, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div 
          animate={{
            x: isRTL ? [0, 20, 0] : [0, -20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </motion.div>

      <div className="flex w-full h-full">
        {/* Left Side - Login Form */}
        <motion.div 
          className="w-full lg:w-1/2 h-full"
          animate={{ x: isTransitioning ? (direction > 0 ? [0, -20, 0] : [0, 20, 0]) : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full flex items-center justify-center p-6 lg:p-8 overflow-hidden">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={i18n.language}
                  custom={direction}
                  variants={languageSwitchVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {/* Header with Logo and App Name */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <img 
                        src="/logo.jpg" 
                        alt="Handys Logo" 
                        className="w-20 h-20 object-cover rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                      />
                      
                      <h1 className="mt-3 text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
                        Handys
                      </h1>
                    </motion.div>
                  </div>

                  {/* Lock Warning */}
                  {isLocked && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Clock className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                            {t('login.errors.accountLocked')}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                            {t('login.errors.tooManyAttempts', { minutes: Math.ceil(lockTimeRemaining / 60) })}
                          </p>
                        </div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {formatLockTime(lockTimeRemaining)}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('login.fields.email.label')}
                      </label>
                      <div className="relative">
                        <div className="absolute icon-left top-1/2 -translate-y-1/2">
                          <Mail className={`w-5 h-5 ${validationErrors.email || loginError.field === 'email' ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                          ref={emailInputRef}
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          className={`w-full input-with-icon-left py-3 text-gray-900 dark:text-white text-base bg-white dark:bg-gray-700 border rounded-lg outline-none transition-colors
                            ${validationErrors.email || loginError.field === 'email'
                              ? 'border-red-500 focus:border-red-500' 
                              : formData.email && !validationErrors.email && loginError.field !== 'email'
                                ? 'border-green-500 focus:border-green-500'
                                : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                            }`}
                          placeholder={t('login.fields.email.placeholder')}
                          disabled={isLocked}
                        />
                      </div>
                      {renderFieldError('email')}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('login.fields.password.label')}
                      </label>
                      <div className="relative">
                        <div className="absolute icon-left top-1/2 -translate-y-1/2">
                          <Lock className={`w-5 h-5 ${validationErrors.password || loginError.field === 'password' ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                          ref={passwordInputRef}
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          className={`w-full input-with-icon-left py-3 text-gray-900 dark:text-white text-base bg-white dark:bg-gray-700 border rounded-lg outline-none transition-colors
                            ${validationErrors.password || loginError.field === 'password'
                              ? 'border-red-500 focus:border-red-500' 
                              : formData.password && !validationErrors.password && loginError.field !== 'password'
                                ? 'border-green-500 focus:border-green-500'
                                : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                            }`}
                          placeholder={t('login.fields.password.placeholder')}
                          disabled={isLocked}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute icon-right top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Caps Lock Warning */}
                      {capsLockOn && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center space-x-1 rtl:space-x-reverse mt-1"
                        >
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            {t('login.security.capsLockOn')}
                          </span>
                        </motion.div>
                      )}
                      
                      {renderFieldError('password')}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          disabled={isLocked}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('login.rememberMe')}
                        </span>
                      </label>
                      
                      <Link
                        to="/password-reset"
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                      >
                        {t('login.buttons.forgotPassword')}
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || isLocked}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 hover:shadow-lg transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>{t('login.buttons.loggingIn')}</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5" />
                          <span>{t('login.buttons.login')}</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Register Link */}
                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('login.links.noAccount')}{' '}
                      <Link to="/register" className="text-primary-600 hover:underline font-medium">
                        {t('login.links.register')}
                      </Link>
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Animation */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-md px-4">
            <Lottie 
              animationData={loginAnimation}
              loop={true}
              className="w-full h-auto"
            />
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center"
          >
            <Lock className="w-8 h-8 text-white/50" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center"
          >
            <Key className="w-8 h-8 text-white/50" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;