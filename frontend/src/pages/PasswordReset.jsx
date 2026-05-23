// frontend/src/pages/PasswordReset.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  AlertCircle, CheckCircle, Shield, Key,
  Globe, ChevronDown, Send
} from 'lucide-react';

import { useStore } from '../store';

// إضافة CSS للتأثيرات الحركية وإصلاح RTL للأيقونات
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

  [dir="rtl"] .input-with-icon-left {
    padding-right: 2.5rem !important;
    padding-left: 1rem !important;
  }
  
  [dir="rtl"] .input-with-icon-right {
    padding-left: 2.5rem !important;
    padding-right: 1rem !important;
  }
  
  [dir="rtl"] .input-with-both-icons {
    padding-right: 2.5rem !important;
    padding-left: 2.5rem !important;
  }
  
  [dir="ltr"] .input-with-icon-left {
    padding-left: 2.5rem !important;
    padding-right: 1rem !important;
  }
  
  [dir="ltr"] .input-with-icon-right {
    padding-right: 2.5rem !important;
    padding-left: 1rem !important;
  }
  
  [dir="ltr"] .input-with-both-icons {
    padding-left: 2.5rem !important;
    padding-right: 2.5rem !important;
  }
  
  [dir="rtl"] .icon-left {
    right: 0.75rem;
    left: auto;
  }
  
  [dir="rtl"] .icon-right {
    left: 0.75rem;
    right: auto;
  }
  
  [dir="ltr"] .icon-left {
    left: 0.75rem;
    right: auto;
  }
  
  [dir="ltr"] .icon-right {
    right: 0.75rem;
    left: auto;
  }
  
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
    font-size: 0.9rem;
  }

  .steps-simple {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 1.5rem;
  }
  
  .step-simple-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }
  
  .step-simple-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .step-simple-icon.active {
    background: linear-gradient(to right, #2563eb, #1d4ed8);
    color: white;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  }

  .step-simple-icon.completed {
    background: linear-gradient(to right, #2563eb, #1d4ed8);
    color: white;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  }
  
  .step-simple-icon.inactive {
    background-color: #e5e7eb;
    color: #9ca3af;
  }
  
  .dark .step-simple-icon.inactive {
    background-color: #374151;
    color: #6b7280;
  }
  
  .step-simple-title {
    font-size: 0.75rem;
    margin-top: 0.375rem;
    font-weight: 500;
  }
  
  .step-simple-title.active {
    background: linear-gradient(to right, #2563eb, #1d4ed8);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  .step-simple-title.completed {
    background: linear-gradient(to right, #2563eb, #1d4ed8);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  .step-simple-title.inactive {
    color: #9ca3af;
  }
  
  .dark .step-simple-title.inactive {
    color: #6b7280;
  }
  
  .step-simple-connector {
    flex: 1;
    height: 0.25rem;
    margin: 0 0.5rem;
    border-radius: 9999px;
    background-color: #e5e7eb;
  }
  
  .dark .step-simple-connector {
    background-color: #374151;
  }
  
  .step-simple-connector.active {
    background: linear-gradient(to right, #2563eb, #1d4ed8);
  }

  .otp-container {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .otp-input {
    width: 3.5rem;
    height: 3.5rem;
    text-align: center !important;
    font-size: 1.5rem;
    font-weight: 600;
    border-width: 2px;
    border-radius: 0.75rem;
    transition: all 0.2s ease;
    background-color: #f9fafb;
    color: #1f2937;
    border-color: #e5e7eb;
    direction: ltr !important;
    unicode-bidi: embed !important;
    padding: 0 !important;
  }

  .dark .otp-input {
    background-color: #374151;
    color: #f9fafb;
    border-color: #4b5563;
    direction: ltr !important;
    unicode-bidi: embed !important;
  }

  .otp-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
    transform: scale(1.02);
  }

  .otp-input.success {
    border-color: #10b981;
    background-color: #f0fdf4;
  }

  .dark .otp-input.success {
    border-color: #10b981;
    background-color: #064e3b;
  }

  .otp-input.error {
    border-color: #ef4444;
    background-color: #fef2f2;
    animation: shake 0.5s ease-in-out;
  }

  .dark .otp-input.error {
    border-color: #ef4444;
    background-color: #7f1d1d;
  }

  [dir="rtl"] .otp-input {
    text-align: center !important;
    direction: ltr !important;
  }
`;
document.head.appendChild(style);

const PasswordReset = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const { 
    requestResetCode, 
    verifyResetCode, 
    resetPasswordWithCode,
    isLoading: storeLoading,
    error: storeError
  } = useStore();

  const [step, setStep] = useState(1);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form data
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  const emailInputRef = useRef(null);
  const otpInputs = useRef([]);
  const languageButtonRef = useRef(null);
  const formRef = useRef(null);
  
  // Steps configuration
  const steps = [
    { number: 1, title: t('reset.steps.email'), icon: Mail },
    { number: 2, title: t('reset.steps.verification'), icon: Shield },
    { number: 3, title: t('reset.steps.reset'), icon: Key }
  ];

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
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

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
    if (step === 2 && otpInputs.current[0]) {
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  useEffect(() => {
    if (storeError) {
      setErrorMessage(storeError);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }, [storeError]);

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    setPasswordChecks(checks);
    
    const strength = Object.values(checks).filter(Boolean).length * 20;
    setPasswordStrength(strength);
    
    const errors = [];
    if (!checks.length) errors.push(t('validation.password.minLength'));
    if (!checks.uppercase) errors.push(t('validation.password.uppercase'));
    if (!checks.lowercase) errors.push(t('validation.password.lowercase'));
    if (!checks.number) errors.push(t('validation.password.number'));
    if (!checks.special) errors.push(t('validation.password.special'));
    
    return errors;
  };

  const validateConfirmPassword = (password, confirmPwd) => {
    const errors = [];
    if (password !== confirmPwd) {
      errors.push(t('validation.password.mismatch'));
    }
    return errors;
  };

  const validateEmail = () => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      errors.email = t('validation.required.email');
    } else if (!emailRegex.test(email)) {
      errors.email = t('validation.email.invalidFormat');
    }
    return errors;
  };

  const validateOtp = () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      return { otp: t('reset.verify.codeInvalid') };
    }
    return {};
  };

  const validateStepFields = () => {
    const errors = {};
    
    switch(step) {
      case 1:
        const emailErrors = validateEmail();
        if (emailErrors.email) errors.email = emailErrors.email;
        break;
        
      case 2:
        const otpErrors = validateOtp();
        if (otpErrors.otp) errors.otp = otpErrors.otp;
        break;
        
      case 3:
        if (!newPassword) {
          errors.password = t('validation.required.password');
        } else {
          const passwordErrors = validatePassword(newPassword);
          if (passwordErrors.length > 0) {
            errors.password = passwordErrors[0];
          }
        }
        
        if (!confirmPassword) {
          errors.confirmPassword = t('validation.required.confirmPassword');
        } else {
          const confirmErrors = validateConfirmPassword(newPassword, confirmPassword);
          if (confirmErrors.length > 0) {
            errors.confirmPassword = confirmErrors[0];
          }
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // REQUEST CODE - حقيقي
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErrorMessage('');
    
    if (!validateStepFields()) {
      formRef.current?.classList.add('error-shake');
      setTimeout(() => formRef.current?.classList.remove('error-shake'), 500);
      return;
    }
    
    setLoading(true);
    
    const result = await requestResetCode(email);
    
    setLoading(false);
    
    if (result.success) {
      setDirection(1);
      setStep(2);
      setTimer(60);
      setCanResend(false);
      setSubmitted(false);
      setValidationErrors({});
      
      // عرض رسالة نجاح
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md w-full mx-4';
      successDiv.innerHTML = `
        <div class="flex items-center space-x-3 rtl:space-x-reverse">
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>
            <p class="text-sm text-green-700 font-medium">${result.message || t('reset.notifications.codeSent')}</p>
          </div>
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } else {
      setValidationErrors({ email: result.error });
      formRef.current?.classList.add('error-shake');
      setTimeout(() => formRef.current?.classList.remove('error-shake'), 500);
    }
  };

  // RESEND CODE - حقيقي
  const handleResendCode = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setErrorMessage('');
    
    const result = await requestResetCode(email);
    
    setLoading(false);
    
    if (result.success) {
      setTimer(60);
      setCanResend(false);
      setValidationErrors({});
      
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md w-full mx-4';
      successDiv.innerHTML = `
        <div class="flex items-center space-x-3 rtl:space-x-reverse">
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>
            <p class="text-sm text-green-700 font-medium">${t('reset.notifications.codeResent')}</p>
          </div>
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } else {
      setValidationErrors({ otp: result.error });
    }
  };

  // VERIFY CODE - حقيقي
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErrorMessage('');
    
    if (!validateStepFields()) {
      formRef.current?.classList.add('error-shake');
      setTimeout(() => formRef.current?.classList.remove('error-shake'), 500);
      return;
    }
    
    setLoading(true);
    
    const enteredCode = otpCode.join('');
    const result = await verifyResetCode(email, enteredCode);
    
    setLoading(false);
    
    if (result.success && result.valid) {
      setDirection(1);
      setStep(3);
      setSubmitted(false);
      setValidationErrors({});
    } else {
      setValidationErrors({ otp: result.error || t('reset.verify.codeInvalid') });
      formRef.current?.classList.add('error-shake');
      setTimeout(() => formRef.current?.classList.remove('error-shake'), 500);
    }
  };

  // RESET PASSWORD - حقيقي
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErrorMessage('');
    
    if (!validateStepFields()) {
      formRef.current?.classList.add('error-shake');
      setTimeout(() => formRef.current?.classList.remove('error-shake'), 500);
      return;
    }
    
    setLoading(true);
    
    const enteredCode = otpCode.join('');
    const result = await resetPasswordWithCode(email, enteredCode, newPassword);
    
    setLoading(false);
    
    if (result.success) {
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setValidationErrors({ password: result.error });
      formRef.current?.classList.add('error-shake');
      setTimeout(() => formRef.current?.classList.remove('error-shake'), 500);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
    
    if (validationErrors.otp) {
      setValidationErrors(prev => ({ ...prev, otp: null }));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpCode[index] && index > 0) {
        otpInputs.current[index - 1]?.focus();
      }
    }
  };

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
        setTimeout(() => langButton.classList.remove('scale-110'), 200);
      }
    }, 50);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' }
  ];

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return t('security.passwordStrength.weak');
    if (passwordStrength < 70) return t('security.passwordStrength.medium');
    return t('security.passwordStrength.strong');
  };

  const renderFieldError = (fieldName) => {
    if ((submitted || touchedFields[fieldName]) && validationErrors[fieldName]) {
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
    return null;
  };

  const getOtpInputClass = (hasError, hasValue) => {
    let classes = 'otp-input';
    if (hasError) {
      classes += ' error';
    } else if (hasValue) {
      classes += ' success';
    }
    return classes;
  };

  const ResetAnimation = () => (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-32 h-32 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-6"
        >
          <Key className="w-16 h-16 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">{t('reset.title')}</h3>
        <p className="text-primary-100">{t('reset.subtitle')}</p>
      </div>
    </div>
  );

  return (
    <div 
      ref={formRef}
      className="h-screen flex overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 no-scrollbar"
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={i18n.language}
    >
      {/* Error Notification */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Switcher */}
      <div ref={languageButtonRef} className={`fixed top-4 z-50 ${isRTL ? 'left-4' : 'right-4'}`}>
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

      {/* Success Notification for Reset */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-green-700 font-medium">{t('reset.notifications.passwordChanged')}</p>
                <p className="text-xs text-green-600 mt-0.5">{t('reset.notifications.redirecting')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full h-full">
        {/* Left Side - Form */}
        <motion.div 
          className="w-full lg:w-1/2 h-full"
          animate={{ x: isTransitioning ? (direction > 0 ? [0, -20, 0] : [0, 20, 0]) : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full flex items-center justify-center p-6 lg:p-8 overflow-hidden">
            <div className="w-full max-w-md">
              {/* Steps */}
              <div className="steps-simple mb-6">
                {steps.map((s, index) => {
                  const StepIcon = s.icon;
                  const isActive = step === s.number;
                  const isCompleted = step > s.number;
                  
                  let iconClass = "step-simple-icon";
                  let titleClass = "step-simple-title";
                  
                  if (isActive) {
                    iconClass += " active";
                    titleClass += " active";
                  } else if (isCompleted) {
                    iconClass += " completed";
                    titleClass += " completed";
                  } else {
                    iconClass += " inactive";
                    titleClass += " inactive";
                  }
                  
                  return (
                    <React.Fragment key={s.number}>
                      <div className="step-simple-item">
                        <div className={iconClass}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                        </div>
                        <span className={titleClass}>{s.title}</span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`step-simple-connector ${step > s.number ? 'active' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step + '-' + i18n.language}
                  custom={direction}
                  variants={languageSwitchVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Request Code */}
                  {step === 1 && (
                    <form onSubmit={handleRequestCode} className="space-y-6">
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {t('reset.title')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {t('reset.subtitle')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('reset.fields.email.label')}
                        </label>
                        <div className="relative">
                          <div className="absolute icon-left top-1/2 -translate-y-1/2">
                            <Mail className={`w-5 h-5 ${validationErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            ref={emailInputRef}
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setTouchedFields(prev => ({ ...prev, email: true }));
                              if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: null }));
                            }}
                            className={`w-full input-with-icon-left py-3 text-gray-900 dark:text-white text-base bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none transition-colors
                              ${validationErrors.email 
                                ? 'border-red-500 focus:border-red-500' 
                                : email && !validationErrors.email
                                  ? 'border-green-500 focus:border-green-500'
                                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                              }`}
                            placeholder={t('reset.fields.email.placeholder')}
                            autoFocus
                          />
                        </div>
                        {renderFieldError('email')}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 hover:shadow-lg transition-all"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('reset.buttons.sending')}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>{t('reset.buttons.sendCode')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Step 2: Verify Code */}
                  {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {t('reset.verify.title')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {t('reset.verify.subtitle')}
                        </p>
                        <p className="text-xs text-primary-600 mt-1">{email}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                          {t('reset.verify.codeLabel')}
                        </label>
                        <div className="otp-container">
                          {otpCode.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => otpInputs.current[index] = el}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className={getOtpInputClass(!!validationErrors.otp, !!digit)}
                              aria-label={`Digit ${index + 1} of 6`}
                            />
                          ))}
                        </div>
                        {renderFieldError('otp')}
                      </div>

                      <div className="text-center">
                        {!canResend ? (
                          <p className="text-sm text-gray-500">
                            {t('reset.verify.resendTimer')}{' '}
                            <span className="font-mono font-bold text-primary-600">{formatTime(timer)}</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={loading}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                          >
                            {loading ? t('reset.buttons.sending') : t('reset.buttons.resendCode')}
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 hover:shadow-lg transition-all"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('reset.buttons.verifying')}</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5" />
                            <span>{t('reset.buttons.verify')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Step 3: Reset Password */}
                  {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {t('reset.reset.title')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {t('reset.reset.subtitle')}
                        </p>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('reset.fields.newPassword.label')}
                        </label>
                        <div className="relative">
                          <div className="absolute icon-left top-1/2 -translate-y-1/2">
                            <Lock className={`w-5 h-5 ${validationErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setTouchedFields(prev => ({ ...prev, password: true }));
                              if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: null }));
                              validatePassword(e.target.value);
                            }}
                            className={`w-full input-with-both-icons py-3 text-gray-900 dark:text-white text-base bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none transition-colors
                              ${validationErrors.password 
                                ? 'border-red-500 focus:border-red-500' 
                                : newPassword && !validationErrors.password
                                  ? 'border-green-500 focus:border-green-500'
                                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                              }`}
                            placeholder={t('reset.fields.newPassword.placeholder')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute icon-right top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {renderFieldError('password')}

                        {/* Password Strength */}
                        {newPassword && (
                          <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {t('security.passwordStrength.label')}
                              </span>
                              <span className={`text-xs font-medium ${
                                passwordStrength < 40 ? 'text-red-500' : 
                                passwordStrength < 70 ? 'text-yellow-500' : 'text-green-500'
                              }`}>
                                {getPasswordStrengthText()}
                              </span>
                            </div>
                            
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${passwordStrength}%` }}
                                className={`h-full ${getPasswordStrengthColor()}`}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.length ? 'text-green-500' : 'text-gray-400'}`}>
                                {passwordChecks.length ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                <span>{t('security.passwordChecks.length')}</span>
                              </div>
                              <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.uppercase ? 'text-green-500' : 'text-gray-400'}`}>
                                {passwordChecks.uppercase ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                <span>{t('security.passwordChecks.uppercase')}</span>
                              </div>
                              <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.lowercase ? 'text-green-500' : 'text-gray-400'}`}>
                                {passwordChecks.lowercase ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                <span>{t('security.passwordChecks.lowercase')}</span>
                              </div>
                              <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.number ? 'text-green-500' : 'text-gray-400'}`}>
                                {passwordChecks.number ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                <span>{t('security.passwordChecks.number')}</span>
                              </div>
                              <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.special ? 'text-green-500' : 'text-gray-400'}`}>
                                {passwordChecks.special ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                <span>{t('security.passwordChecks.special')}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('reset.fields.confirmPassword.label')}
                        </label>
                        <div className="relative">
                          <div className="absolute icon-left top-1/2 -translate-y-1/2">
                            <Lock className={`w-5 h-5 ${validationErrors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setTouchedFields(prev => ({ ...prev, confirmPassword: true }));
                              if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
                            }}
                            className={`w-full input-with-both-icons py-3 text-gray-900 dark:text-white text-base bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none transition-colors
                              ${validationErrors.confirmPassword 
                                ? 'border-red-500 focus:border-red-500' 
                                : confirmPassword && !validationErrors.confirmPassword
                                  ? 'border-green-500 focus:border-green-500'
                                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                              }`}
                            placeholder={t('reset.fields.confirmPassword.placeholder')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute icon-right top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {renderFieldError('confirmPassword')}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 hover:shadow-lg transition-all"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('reset.buttons.resetting')}</span>
                          </>
                        ) : (
                          <>
                            <Key className="w-5 h-5" />
                            <span>{t('reset.buttons.resetPassword')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Back to Login */}
                  <div className="text-center mt-6">
                    <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                      <span>{t('reset.backToLogin')}</span>
                    </Link>
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
            <ResetAnimation />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;