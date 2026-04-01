import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  User, Mail, Lock, Phone, Briefcase, Users, CheckCircle,
  Eye, EyeOff, Info, Sparkles, Shield,
  MapPin, DollarSign, ArrowRight, ArrowLeft,
  TrendingUp, UserCheck, Calendar, Globe, Search,
  X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  UserPlus, UserCog, UserRound, Wrench, Hammer, Paintbrush,
  Star, Award, Clock, Target, ThumbsUp, Zap, Heart, ShieldCheck,
  AlertCircle
} from 'lucide-react';

import { useStore } from '../store';
import Lottie from 'lottie-react';

// استيراد ملفات الأنيميشن - جميعها Lottie الآن
import registrationAnimationEN from '../assets/animations/steps-animation-en.json';
import registrationAnimationFR from '../assets/animations/steps-animation-fr.json';
import registrationAnimationAR from '../assets/animations/steps-animation-ar.json';

// Import craft icons from Font Awesome
import { 
  FaBolt, FaWrench, FaPaintBrush, FaHammer, FaTruck, FaBroom,
  FaSnowflake, FaWater, FaCouch, FaHardHat, FaTools, FaPlug,
  FaFire, FaLeaf, FaCrop, FaRuler, FaPencilRuler, FaPaintRoller,
  FaHome, FaBath, FaDoorOpen, FaWindowMaximize,
  FaSolarPanel, FaSatelliteDish, FaNetworkWired, FaLock,
  FaTree, FaMountain, FaSwimmingPool, FaGasPump, FaCar,
} from 'react-icons/fa';

// Import from Material Design Icons
import { 
  MdOutlineKitchen, 
  MdOutlineSmartphone,
  MdOutlineSecurity,
  MdOutlinePool,
  MdOutlineAgriculture,
  MdOutlineConstruction,
  MdOutlineDesignServices,
  MdOutlineElectricalServices,
  MdOutlinePlumbing,
  MdOutlineRoofing,
  MdOutlineWindow,
  MdOutlineSolarPower,
  MdOutlineVideocam,
  MdOutlineCameraAlt,
  MdOutlineCamera,
  MdOutlineCameraswitch,
  MdOutlineVideoCameraBack,
  MdOutlineVideoCameraFront,
  MdOutlineVisibility
} from 'react-icons/md';

// Import from Game Icons
import { 
  GiStoneWall, 
  GiGearHammer, 
  GiFurnace,
  GiWaterTank,
  GiPlantsAndAnimals,
  GiStoneCrafting,
  GiElevator,
  GiAutoRepair,
  GiWoodCabin,
  GiGlassCelebration,
  GiCctvCamera,
  GiSentryGun,
  GiSecurityGate
} from 'react-icons/gi';

// Import from Remix Icon
import { 
  RiHomeGearLine,
  RiPaintBrushLine,
} from 'react-icons/ri';

// إضافة CSS للتأثيرات الحركية وإصلاح RTL للأيقونات
const style = document.createElement('style');
style.textContent = `
  /* إخفاء شريط التمرير العام */
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

  /* إخفاء شريط التمرير من الحاوية الرئيسية */
  .h-screen {
    height: 100vh !important;
    max-height: 100vh !important;
    overflow: hidden !important;
  }

  /* منع التمرير في أي حاوية داخلية */
  .overflow-y-auto, .overflow-y-scroll {
    overflow-y: hidden !important;
  }

  /* إخفاء شريط التمرير الأفقي تماماً */
  .overflow-x-auto, .crafts-container, .skills-container {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  .overflow-x-auto::-webkit-scrollbar, 
  .crafts-container::-webkit-scrollbar, 
  .skills-container::-webkit-scrollbar {
    display: none !important;
  }

  /* إصلاحات RTL المحسنة للـ Inputs - باستخدام السمة dir */
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
  
  /* مواضع الأيقونات في RTL */
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
    font-size: 0.9rem;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
    overflow-y: hidden !important;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none !important;
  }

  .flex-col {
    overflow-y: hidden !important;
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
  
  .slide-enter {
    transform: translateX(100%);
  }
  
  .slide-enter-active {
    transform: translateX(0);
    transition: transform 300ms ease-in-out;
  }
  
  .slide-exit {
    transform: translateX(0);
  }
  
  .slide-exit-active {
    transform: translateX(-100%);
    transition: transform 300ms ease-in-out;
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

  .craft-button, .skill-button, .experience-button {
    transition: all 0.2s ease;
  }
  
  .craft-button:hover, .skill-button:hover, .experience-button:hover {
    transform: none !important;
    background-color: #7b7b7b;
  }
  
  .craft-button.selected, .skill-button.selected, .experience-button.selected {
    background-color: #2563eb;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  }

  .scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    background: linear-gradient(to right, #2563eb, #1d4ed8);
    color: white;
    padding: 0.5rem;
    border-radius: 9999px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.2s ease;
    cursor: pointer;
  }

  .scroll-button:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  /* تصحيح مواقع أزرار التمرير - باستخدام السمة dir */
  [dir="rtl"] .scroll-button.left-0 {
    left: 0.5rem;
    right: auto;
  }

  [dir="rtl"] .scroll-button.right-0 {
    right: 0.5rem;
    left: auto;
  }

  [dir="ltr"] .scroll-button.left-0 {
    left: 0.5rem;
    right: auto;
  }

  [dir="ltr"] .scroll-button.right-0 {
    right: 0.5rem;
    left: auto;
  }

  .crafts-container, .skills-container {
    padding-left: 3rem !important;
    padding-right: 3rem !important;
  }

  /* Steps بسيطة بدون أي تأثيرات حركية */
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
    background-color: #374151;
    color: #6b7280;
  }
  
  .step-simple-title {
    font-size: 0.75rem;
    margin-top: 0.375rem;
    font-weight: 500;
  }
  
  .step-simple-title.active {
    color: #2563eb;
  }
  
  .step-simple-title.completed {
    color: #2563eb;
  }
  
  .step-simple-title.inactive {
    color: #6b7280;
  }
  
  .step-simple-connector {
    flex: 1;
    height: 0.25rem;
    margin: 0 0.5rem;
    border-radius: 9999px;
    background-color: #374151;
  }
  
  .step-simple-connector.active {
    background-color: #2563eb;
  }
`;
document.head.appendChild(style);

const Register = () => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const { register, isLoading: authLoading } = useStore();
  
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    craft: '',
    experience: '',
    location: '',
    dailyRate: '',
    skills: [],
    acceptTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const craftsContainerRef = useRef(null);
  const skillsContainerRef = useRef(null);
  const mainContainerRef = useRef(null);
  const languageButtonRef = useRef(null);
  const usernameTimeoutRef = useRef(null);
  const emailTimeoutRef = useRef(null);

  const navigate = useNavigate();

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
    const loadAnimation = async () => {
      const currentLang = i18n.language;
      
      if (currentLang === 'ar') {
        setCurrentAnimation({ type: 'lottie', data: registrationAnimationAR });
      } else if (currentLang === 'fr') {
        setCurrentAnimation({ type: 'lottie', data: registrationAnimationFR });
      } else {
        setCurrentAnimation({ type: 'lottie', data: registrationAnimationEN });
      }
    };

    loadAnimation();
  }, [i18n.language]);

  useEffect(() => {
    if (!formData.role) {
      setFormData(prev => ({
        ...prev,
        role: 'client'
      }));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageButtonRef.current && !languageButtonRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateUsername = (username) => {
    const errors = [];
    
    if (username.length < 3) {
      errors.push(t('validation.username.tooShort'));
    }
    if (username.length > 30) {
      errors.push(t('validation.username.tooLong'));
    }
    
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      errors.push(t('validation.username.invalidCharacters'));
    }
    
    if (username.includes(' ')) {
      errors.push(t('validation.username.noSpaces'));
    }
    
    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(username)) {
      errors.push(t('validation.username.noArabic'));
    }
    
    return errors;
  };

  const validateEmail = (email) => {
    const errors = [];
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.push(t('validation.email.invalidFormat'));
    }
    
    const validDomains = ['.com', '.dz', '.fr', '.net', '.org', '.edu', '.gov'];
    const hasValidDomain = validDomains.some(domain => email.toLowerCase().endsWith(domain));
    if (!hasValidDomain) {
      errors.push(t('validation.email.invalidDomain'));
    }
    
    return errors;
  };

  const validatePhone = (phone) => {
    const errors = [];
    
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    const algerianPhoneRegex = /^(05|06|07)[0-9]{8}$/;
    if (!algerianPhoneRegex.test(cleanPhone)) {
      errors.push(t('validation.phone.invalidAlgerian'));
    }
    
    const repeatedDigits = /(.)\1{5,}/;
    if (repeatedDigits.test(cleanPhone)) {
      errors.push(t('validation.phone.tooManyRepeats'));
    }
    
    return errors;
  };

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

  const validateConfirmPassword = (password, confirmPassword) => {
    const errors = [];
    if (password !== confirmPassword) {
      errors.push(t('validation.password.mismatch'));
    }
    return errors;
  };

  const checkUsernameAvailability = async (username) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const takenUsernames = ['admin', 'user', 'test', 'demo', 'root', 'system'];
    return !takenUsernames.includes(username.toLowerCase());
  };

  const checkEmailAvailability = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const takenEmails = ['admin@example.com', 'test@test.com', 'user@example.com'];
    return !takenEmails.includes(email.toLowerCase());
  };

  const validateStepFields = async () => {
    const errors = {};
    
    switch(step) {
      case 1:
        if (!formData.role) {
          errors.role = t('validation.required.role');
        }
        break;
        
      case 2:
        if (!formData.username) {
          errors.username = t('validation.required.username');
        } else {
          const usernameErrors = validateUsername(formData.username);
          if (usernameErrors.length > 0) {
            errors.username = usernameErrors[0];
          } else {
            setIsCheckingUsername(true);
            try {
              const isAvailable = await checkUsernameAvailability(formData.username);
              if (!isAvailable) {
                errors.username = t('validation.username.taken');
              }
            } catch (error) {
              console.error('Error checking username:', error);
            } finally {
              setIsCheckingUsername(false);
            }
          }
        }
        
        if (!formData.email) {
          errors.email = t('validation.required.email');
        } else {
          const emailErrors = validateEmail(formData.email);
          if (emailErrors.length > 0) {
            errors.email = emailErrors[0];
          } else {
            setIsCheckingEmail(true);
            try {
              const isAvailable = await checkEmailAvailability(formData.email);
              if (!isAvailable) {
                errors.email = t('validation.email.taken');
              }
            } catch (error) {
              console.error('Error checking email:', error);
            } finally {
              setIsCheckingEmail(false);
            }
          }
        }
        
        if (!formData.phone) {
          errors.phone = t('validation.required.phone');
        } else {
          const phoneErrors = validatePhone(formData.phone);
          if (phoneErrors.length > 0) {
            errors.phone = phoneErrors[0];
          }
        }
        break;
        
      case 3:
        if (!formData.password) {
          errors.password = t('validation.required.password');
        } else {
          const passwordErrors = validatePassword(formData.password);
          if (passwordErrors.length > 0) {
            errors.password = passwordErrors[0];
          }
        }
        
        if (!formData.confirmPassword) {
          errors.confirmPassword = t('validation.required.confirmPassword');
        } else {
          const confirmErrors = validateConfirmPassword(formData.password, formData.confirmPassword);
          if (confirmErrors.length > 0) {
            errors.confirmPassword = confirmErrors[0];
          }
        }
        break;
        
      case 4:
        if (!formData.location) {
          errors.location = t('validation.required.location');
        }
        
        if (formData.role === 'artisan') {
          if (!formData.craft) {
            errors.craft = t('validation.required.craft');
          }
          if (!formData.experience) {
            errors.experience = t('validation.required.experience');
          }
        }
        
        if (formData.role === 'worker') {
          if (!formData.dailyRate) {
            errors.dailyRate = t('validation.required.dailyRate');
          } else {
            const rate = parseFloat(formData.dailyRate);
            if (isNaN(rate) || rate < 1000 || rate > 50000) {
              errors.dailyRate = t('validation.invalid.dailyRate');
            }
          }
          if (formData.skills.length === 0) {
            errors.skills = t('validation.required.skills');
          }
        }
        break;
        
      case 5:
        if (!formData.acceptTerms) {
          errors.acceptTerms = t('validation.required.terms');
        }
        break;
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
    
    if (name !== 'craft' && name !== 'experience' && name !== 'skills') {
      setTouchedFields(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    if (name === 'username') {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
      
      usernameTimeoutRef.current = setTimeout(async () => {
        if (value) {
          const errors = validateUsername(value);
          if (errors.length === 0) {
            setIsCheckingUsername(true);
            try {
              const isAvailable = await checkUsernameAvailability(value);
              setValidationErrors(prev => ({
                ...prev,
                username: isAvailable ? null : t('validation.username.taken')
              }));
            } catch (error) {
              console.error('Error checking username:', error);
            } finally {
              setIsCheckingUsername(false);
            }
          } else {
            setValidationErrors(prev => ({
              ...prev,
              username: errors[0]
            }));
          }
        }
      }, 500);
    }
    
    if (name === 'email') {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
      
      emailTimeoutRef.current = setTimeout(async () => {
        if (value) {
          const errors = validateEmail(value);
          if (errors.length === 0) {
            setIsCheckingEmail(true);
            try {
              const isAvailable = await checkEmailAvailability(value);
              setValidationErrors(prev => ({
                ...prev,
                email: isAvailable ? null : t('validation.email.taken')
              }));
            } catch (error) {
              console.error('Error checking email:', error);
            } finally {
              setIsCheckingEmail(false);
            }
          } else {
            setValidationErrors(prev => ({
              ...prev,
              email: errors[0]
            }));
          }
        }
      }, 500);
    }
    
    if (name === 'phone' && value) {
      const errors = validatePhone(value);
      setValidationErrors(prev => ({
        ...prev,
        phone: errors.length > 0 ? errors[0] : null
      }));
    }
    
    if (name === 'password') {
      const errors = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        password: errors.length > 0 ? errors[0] : null
      }));
    }
    
    if (name === 'confirmPassword') {
      const errors = validateConfirmPassword(formData.password, value);
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: errors.length > 0 ? errors[0] : null
      }));
    }
  };

  const selectLocation = (city) => {
    setFormData(prev => ({
      ...prev,
      location: city
    }));
    setShowCityDropdown(false);
    setSearchTerm('');
    
    setTouchedFields(prev => ({
      ...prev,
      location: true
    }));
    
    setValidationErrors(prev => ({
      ...prev,
      location: null
    }));
  };

  const removeLocation = () => {
    setFormData(prev => ({
      ...prev,
      location: ''
    }));
  };

  const nextStep = async () => {
    setSubmitted(true);
    const isValid = await validateStepFields();
    if (isValid) {
      setStep(prev => prev + 1);
      setValidationErrors({});
      setSubmitted(false);
    } else {
      const form = document.querySelector('form');
      form.classList.add('error-shake');
      setTimeout(() => form.classList.remove('error-shake'), 500);
      
      // تم إزالة toast.error
      console.log('Validation errors:', validationErrors);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setValidationErrors({});
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitted(true);
    const isValid = await validateStepFields();
    if (!isValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        location: formData.location,
        ...(formData.role === 'artisan' && {
          craft: formData.craft,
          experience: formData.experience
        }),
        ...(formData.role === 'worker' && {
          dailyRate: formData.dailyRate,
          skills: formData.skills
        })
      };
      
      console.log('Sending registration data:', registrationData);
      
      const result = await register(registrationData);
      console.log('Registration result:', result);
      
      if (result?.success) {
        navigate('/');
      } else {
        setValidationErrors(prev => ({
          ...prev,
          submit: result?.error || 'Registration failed'
        }));
      }
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
      setValidationErrors(prev => ({
        ...prev,
        submit: 'حدث خطأ غير متوقع'
      }));
    } finally {
      setLoading(false);
    }
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

  // ========== التصحيح النهائي للتمرير باستخدام isRTL فقط ==========
  const scrollCrafts = (direction) => {
    if (craftsContainerRef.current) {
      const scrollAmount = 300;
      
      if (isRTL) {
        // في اللغة العربية (RTL):
        // - الزر الأيسر (الموجود على اليسار) يمرر المحتوى لليسار (قيمة سالبة)
        // - الزر الأيمن (الموجود على اليمين) يمرر المحتوى لليمين (قيمة موجبة)
        if (direction === 'left') {
          craftsContainerRef.current.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
          });
        } else {
          craftsContainerRef.current.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      } else {
        // في اللغات LTR (الإنجليزية والفرنسية):
        // - الزر الأيسر يمرر لليسار (قيمة سالبة)
        // - الزر الأيمن يمرر لليمين (قيمة موجبة)
        craftsContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollSkills = (direction) => {
    if (skillsContainerRef.current) {
      const scrollAmount = 250;
      
      if (isRTL) {
        // في اللغة العربية (RTL):
        // - الزر الأيسر -> يمرر لليسار (قيمة سالبة)
        // - الزر الأيمن -> يمرر لليمين (قيمة موجبة)
        if (direction === 'left') {
          skillsContainerRef.current.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
          });
        } else {
          skillsContainerRef.current.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      } else {
        // في اللغات LTR (الإنجليزية والفرنسية):
        // - الزر الأيسر -> يمرر لليسار (قيمة سالبة)
        // - الزر الأيمن -> يمرر لليمين (قيمة موجبة)
        skillsContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };
  // ============================================================

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
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
        setTimeout(() => {
          langButton.classList.remove('scale-110');
        }, 200);
      }
    }, 50);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' }
  ];

  const algerianCities = [
    "أدرار", "Adrar",
    "الشلف", "Chlef",
    "الأغواط", "Laghouat",
    "أم البواقي", "Oum El Bouaghi",
    "باتنة", "Batna",
    "بجاية", "Béjaïa",
    "بسكرة", "Biskra",
    "بشار", "Béchar",
    "البليدة", "Blida",
    "البويرة", "Bouira",
    "تمنراست", "Tamanrasset",
    "تبسة", "Tébessa",
    "تلمسان", "Tlemcen",
    "تيارت", "Tiaret",
    "تيزي وزو", "Tizi Ouzou",
    "الجزائر", "Algiers",
    "الجلفة", "Djelfa",
    "جيجل", "Jijel",
    "سطيف", "Sétif",
    "سعيدة", "Saïda",
    "سكيكدة", "Skikda",
    "سيدي بلعباس", "Sidi Bel Abbès",
    "عنابة", "Annaba",
    "قالمة", "Guelma",
    "قسنطينة", "Constantine",
    "المدية", "Médéa",
    "مستغانم", "Mostaganem",
    "المسيلة", "M'Sila",
    "معسكر", "Mascara",
    "ورقلة", "Ouargla",
    "وهران", "Oran",
    "البيض", "El Bayadh",
    "إليزي", "Illizi",
    "برج بوعريريج", "Bordj Bou Arréridj",
    "بومرداس", "Boumerdès",
    "الطارف", "El Tarf",
    "تندوف", "Tindouf",
    "تيسمسيلت", "Tissemsilt",
    "الوادي", "El Oued",
    "خنشلة", "Khenchela",
    "سوق أهراس", "Souk Ahras",
    "تيبازة", "Tipaza",
    "ميلة", "Mila",
    "عين الدفلى", "Aïn Defla",
    "النعامة", "Naâma",
    "عين تموشنت", "Aïn Témouchent",
    "غرداية", "Ghardaïa",
    "غليزان", "Relizane",
    "المغير", "El M'Ghair",
    "المنيعة", "El Menia",
    "أولاد جلال", "Ouled Djellal",
    "بني عباس", "Béni Abbès",
    "عين صالح", "Aïn Salah",
    "عين قزام", "Aïn Guezzam",
    "تقرت", "Touggourt",
    "جانت", "Djanet",
    "تيميمون", "Timimoun"
  ];

  const filteredCities = algerianCities.filter(city => 
    city.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  const crafts = [
    { id: 'electrician', name: t('crafts.electrician'), icon: FaBolt, category: 'basic' },
    { id: 'plumber', name: t('crafts.plumber'), icon: FaWater, category: 'basic' },
    { id: 'carpenter', name: t('crafts.carpenter'), icon: FaHammer, category: 'basic' },
    { id: 'painter', name: t('crafts.painter'), icon: FaPaintBrush, category: 'basic' },
    { id: 'mason', name: t('crafts.mason'), icon: FaHardHat, category: 'basic' },
    { id: 'mover', name: t('crafts.mover'), icon: FaTruck, category: 'basic' },
    { id: 'cleaner', name: t('crafts.cleaner'), icon: FaBroom, category: 'basic' },
    { id: 'ac_technician', name: t('crafts.ac_technician'), icon: FaSnowflake, category: 'basic' },
    { id: 'tiler', name: t('crafts.tiler'), icon: FaRuler, category: 'basic' },
    { id: 'blacksmith', name: t('crafts.blacksmith'), icon: FaFire, category: 'basic' },
    { id: 'gardener', name: t('crafts.gardener'), icon: FaLeaf, category: 'basic' },
    { id: 'handyman', name: t('crafts.handyman'), icon: FaTools, category: 'basic' },
    { id: 'cabinet_maker', name: t('crafts.cabinet_maker'), icon: FaCouch, category: 'specialized' },
    { id: 'upholsterer', name: t('crafts.upholsterer'), icon: FaCouch, category: 'specialized' },
    { id: 'glass_worker', name: t('crafts.glass_worker'), icon: GiGlassCelebration, category: 'specialized' },
    { id: 'flooring_specialist', name: t('crafts.flooring_specialist'), icon: FaRuler, category: 'specialized' },
    { id: 'facade_worker', name: t('crafts.facade_worker'), icon: FaHome, category: 'specialized' },
    { id: 'roofer', name: t('crafts.roofer'), icon: MdOutlineRoofing, category: 'specialized' },
    { id: 'kitchen_installer', name: t('crafts.kitchen_installer'), icon: MdOutlineKitchen, category: 'specialized' },
    { id: 'bathroom_installer', name: t('crafts.bathroom_installer'), icon: FaBath, category: 'specialized' },
    { id: 'solar_installer', name: t('crafts.solar_installer'), icon: MdOutlineSolarPower, category: 'electronics' },
    { id: 'electronics_repair', name: t('crafts.electronics_repair'), icon: MdOutlineSmartphone, category: 'electronics' },
    { id: 'security_systems', name: t('crafts.security_systems'), icon: MdOutlineSecurity, category: 'electronics' },
    { id: 'network_tech', name: t('crafts.network_tech'), icon: FaNetworkWired, category: 'electronics' },
    { id: 'satellite_installer', name: t('crafts.satellite_installer'), icon: FaSatelliteDish, category: 'electronics' },
    { id: 'cctv_installer', name: t('crafts.cctv_installer'), icon: GiCctvCamera, category: 'electronics' },
    { id: 'smart_home_tech', name: t('crafts.smart_home_tech'), icon: RiHomeGearLine, category: 'electronics' },
    { id: 'hvac_tech', name: t('crafts.hvac_tech'), icon: FaSnowflake, category: 'advanced' },
    { id: 'elevator_tech', name: t('crafts.elevator_tech'), icon: GiElevator, category: 'advanced' },
    { id: 'pool_tech', name: t('crafts.pool_tech'), icon: FaSwimmingPool, category: 'advanced' },
    { id: 'gas_tech', name: t('crafts.gas_tech'), icon: FaGasPump, category: 'advanced' },
    { id: 'auto_electrician', name: t('crafts.auto_electrician'), icon: GiAutoRepair, category: 'advanced' },
    { id: 'generator_tech', name: t('crafts.generator_tech'), icon: GiGearHammer, category: 'advanced' },
    { id: 'interior_designer', name: t('crafts.interior_designer'), icon: MdOutlineDesignServices, category: 'design' },
    { id: 'decorator', name: t('crafts.decorator'), icon: RiPaintBrushLine, category: 'design' },
    { id: 'landscape_designer', name: t('crafts.landscape_designer'), icon: GiPlantsAndAnimals, category: 'design' },
    { id: 'stone_cutter', name: t('crafts.stone_cutter'), icon: GiStoneCrafting, category: 'design' },
    { id: 'wood_carver', name: t('crafts.wood_carver'), icon: GiWoodCabin, category: 'design' },
    { id: 'foundation_worker', name: t('crafts.foundation_worker'), icon: MdOutlineConstruction, category: 'construction' },
    { id: 'steel_fixer', name: t('crafts.steel_fixer'), icon: FaTools, category: 'construction' },
    { id: 'plasterer', name: t('crafts.plasterer'), icon: FaPaintRoller, category: 'construction' },
    { id: 'window_installer', name: t('crafts.window_installer'), icon: FaWindowMaximize, category: 'construction' },
    { id: 'door_installer', name: t('crafts.door_installer'), icon: FaDoorOpen, category: 'construction' },
    { id: 'appliance_repair', name: t('crafts.appliance_repair'), icon: FaTools, category: 'maintenance' },
    { id: 'furniture_repair', name: t('crafts.furniture_repair'), icon: FaCouch, category: 'maintenance' },
    { id: 'pest_control', name: t('crafts.pest_control'), icon: GiPlantsAndAnimals, category: 'maintenance' },
    { id: 'water_tank_cleaner', name: t('crafts.water_tank_cleaner'), icon: GiWaterTank, category: 'maintenance' }
  ];

  const roleOptions = [
    { 
      value: 'client', 
      label: t('accountType.roles.client.label'),
      icon: UserRound,
      icon2: UserPlus,
      description: t('accountType.roles.client.description'),
      features: [
        t('accountType.roles.client.features.postJobs'),
        t('accountType.roles.client.features.browseArtisans'),
        t('accountType.roles.client.features.comparePrices'),
        t('accountType.roles.client.features.directChat')
      ]
    },
    { 
      value: 'artisan', 
      label: t('accountType.roles.artisan.label'),
      icon: Wrench,
      icon2: Hammer,
      description: t('accountType.roles.artisan.description'),
      features: [
        t('accountType.roles.artisan.features.portfolio'),
        t('accountType.roles.artisan.features.receiveOrders'),
        t('accountType.roles.artisan.features.setRates'),
        t('accountType.roles.artisan.features.buildReputation')
      ]
    },
    { 
      value: 'worker', 
      label: t('accountType.roles.worker.label'),
      icon: Users,
      icon2: UserCog,
      description: t('accountType.roles.worker.description'),
      features: [
        t('accountType.roles.worker.features.showSkills'),
        t('accountType.roles.worker.features.dailyRate'),
        t('accountType.roles.worker.features.jobOpportunities'),
        t('accountType.roles.worker.features.directContact')
      ]
    }
  ];

  const experienceOptions = [
    { value: '0-1', label: t('professional.experience.options.0-1') },
    { value: '1-3', label: t('professional.experience.options.1-3') },
    { value: '3-5', label: t('professional.experience.options.3-5') },
    { value: '5-10', label: t('professional.experience.options.5-10') },
    { value: '10+', label: t('professional.experience.options.10+') }
  ];

  const workerSkills = [
    t('skills.loading_unloading'),
    t('skills.cleaning'),
    t('skills.organizing'),
    t('skills.packing'),
    t('skills.wrapping'),
    t('skills.construction'),
    t('skills.farming'),
    t('skills.painting'),
    t('skills.furniture_assembly'),
    t('skills.moving'),
    t('skills.assembling'),
    t('skills.repairing'),
    t('skills.plumbing'),
    t('skills.electrical'),
    t('skills.tiling'),
    t('skills.carpentry'),
    t('skills.blacksmithing'),
    t('skills.welding'),
    t('skills.stone_cutting'),
    t('skills.carving'),
    t('skills.glass_installation'),
    t('skills.kitchen_installation'),
    t('skills.window_installation'),
    t('skills.general_maintenance'),
    t('skills.facade_cleaning'),
    t('skills.carpet_cleaning'),
    t('skills.pest_control'),
    t('skills.gardening'),
    t('skills.automatic_irrigation'),
    t('skills.artificial_grass'),
    t('skills.decorative_painting')
  ];

  const steps = [
    { number: 1, title: t('steps.accountType'), icon: Users },
    { number: 2, title: t('steps.basicInfo'), icon: User },
    { number: 3, title: t('steps.security'), icon: Shield },
    { number: 4, title: t('steps.professional'), icon: Briefcase },
    { number: 5, title: t('steps.confirmation'), icon: CheckCircle }
  ];

  const renderAnimation = () => {
    if (!currentAnimation) return null;

    return (
      <Lottie 
        animationData={currentAnimation.data}
        loop={true}
        className="w-full h-auto"
      />
    );
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
    if (submitted && validationErrors[fieldName]) {
      return (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-red-500 text-xs mt-1 flex items-center space-x-1 rtl:space-x-reverse`}
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{validationErrors[fieldName]}</span>
        </motion.p>
      );
    }
    return null;
  };
  
  return (
    <div 
      ref={mainContainerRef}
      className="h-screen flex overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 no-scrollbar"
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={i18n.language}
    >
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

      <motion.div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        animate={{
          scale: isTransitioning ? [1, 1.1, 1] : 1
        }}
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
        <motion.div 
          className="w-full lg:w-1/2 h-full"
          animate={{
            x: isTransitioning ? (direction > 0 ? [0, -20, 0] : [0, 20, 0]) : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full flex items-center justify-center p-6 lg:p-8 overflow-hidden">
            <div className="w-full max-w-2xl">
              {/* Steps بسيطة بدون أي تأثيرات حركية */}
              <div className="steps-simple mb-6">
                {steps.map((s, index) => {
                  const StepIcon = s.icon;
                  const isActive = step === s.number;
                  const isCompleted = step > s.number;
                  const isInactive = step < s.number;
                  
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
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        <span className={titleClass}>
                          {s.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div 
                          className={`step-simple-connector ${step > s.number ? 'active' : ''}`}
                        />
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Account Type */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="text-center mb-2">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('accountType.title')}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('accountType.subtitle')}
                          </p>
                        </div>

                        <div className="text-center mb-2">
                          <p className="text-lg font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-800 py-3 px-4 rounded-xl">
                            {roleOptions.find(r => r.value === formData.role)?.description || t('accountType.platformDescription')}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {roleOptions.map((role) => {
                            const Icon = role.icon;
                            const Icon2 = role.icon2;
                            const isSelected = formData.role === role.value;
                            
                            return (
                              <label
                                key={role.value}
                                className={`block cursor-pointer relative overflow-hidden rounded-xl transition-all duration-300
                                  ${isSelected 
                                    ? 'border-2 border-primary-600 bg-gradient-to-b from-primary-50 to-white dark:from-gray-800 dark:to-gray-700 shadow-xl'
                                    : 'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 hover:shadow-md'
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name="role"
                                  value={role.value}
                                  checked={isSelected}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                
                                <div className="p-4 flex flex-col h-full">
                                  <div className={`flex items-center space-x-2 rtl:space-x-reverse mb-3`}>
                                    <div className={`p-2 rounded-lg ${
                                        isSelected ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'
                                      }`}>
                                      <Icon className={`w-5 h-5 ${
                                        isSelected ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'
                                      }`} />
                                    </div>
                                    <div className={`p-2 rounded-lg ${
                                        isSelected ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'
                                      }`}>
                                      <Icon2 className={`w-5 h-5 ${
                                        isSelected ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'
                                      }`} />
                                    </div>
                                  </div>
                                  
                                  <h3 className={`text-base font-bold mb-1 ${
                                    isSelected ? 'text-primary-600' : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {role.label}
                                  </h3>
                                  
                                  <div className="mt-auto space-y-1">
                                    {role.features.map((feature, idx) => (
                                      <div key={idx} className={`flex items-center space-x-1 rtl:space-x-reverse`}>
                                        <CheckCircle className={`w-3 h-3 flex-shrink-0 ${
                                          isSelected ? 'text-primary-600' : 'text-gray-400'
                                        }`} />
                                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{feature}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {isSelected && (
                                    <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'}`}>
                                      <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        {renderFieldError('role')}
                      </div>
                    )}

                    {/* Step 2: Basic Info */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <div className="text-center mb-3">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('basicInfo.title')}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('basicInfo.subtitle')}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Username Input */}
                          <div className="relative">
                            <div className="absolute icon-left top-1/2 -translate-y-1/2">
                              <User className={`w-5 h-5 ${validationErrors.username ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              onBlur={() => setTouchedFields(prev => ({ ...prev, username: true }))}
                              className={`w-full input-with-icon-left text-gray-900 dark:text-gray-100 py-3 text-base bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none transition-colors
                                ${validationErrors.username 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : formData.username && !validationErrors.username
                                    ? 'border-green-500 focus:border-green-500'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                                }`}
                              placeholder={t('basicInfo.fields.username.placeholder')}
                              required
                            />
                          </div>
                          {renderFieldError('username')}
                          
                          {/* Email Input */}
                          <div className="relative">
                            <div className="absolute icon-left top-1/2 -translate-y-1/2">
                              <Mail className={`w-5 h-5 ${validationErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                              className={`w-full input-with-icon-left py-3 text-gray-900 dark:text-gray-100 text-base bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none transition-colors
                                ${validationErrors.email 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : formData.email && !validationErrors.email
                                    ? 'border-green-500 focus:border-green-500'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                                }`}
                              placeholder={t('basicInfo.fields.email.placeholder')}
                              required
                            />
                          </div>
                          {renderFieldError('email')}

                          {/* Phone Input */}
                          <div className="relative">
                            <div className="absolute icon-left top-1/2 -translate-y-1/2">
                              <Phone className={`w-5 h-5 ${validationErrors.phone ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              onBlur={() => setTouchedFields(prev => ({ ...prev, phone: true }))}
                              className={`w-full input-with-icon-left text-gray-900 dark:text-gray-100 py-3 text-base bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none transition-colors
                                ${validationErrors.phone 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : formData.phone && !validationErrors.phone
                                    ? 'border-green-500 focus:border-green-500'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                                }`}
                              placeholder={t('basicInfo.fields.phone.placeholder')}
                              required
                            />
                          </div>
                          {renderFieldError('phone')}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Security */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <div className="text-center mb-3">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('security.title')}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('security.subtitle')}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Password Input */}
                          <div className="relative">
                            <div className="absolute icon-left top-1/2 -translate-y-1/2">
                              <Lock className={`w-5 h-5 ${validationErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              onBlur={() => setTouchedFields(prev => ({ ...prev, password: true }))}
                              className={`w-full input-with-both-icons py-3 text-gray-900 dark:text-gray-100 text-base bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none transition-colors
                                ${validationErrors.password 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : formData.password && !validationErrors.password
                                    ? 'border-green-500 focus:border-green-500'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                                }`}
                              placeholder={t('security.fields.password.placeholder')}
                              required
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
                          {formData.password && (
                            <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
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
                                  {passwordChecks.length ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0" />}
                                  <span>{t('security.passwordChecks.length')}</span>
                                </div>
                                <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.uppercase ? 'text-green-500' : 'text-gray-400'}`}>
                                  {passwordChecks.uppercase ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0" />}
                                  <span>{t('security.passwordChecks.uppercase')}</span>
                                </div>
                                <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.lowercase ? 'text-green-500' : 'text-gray-400'}`}>
                                  {passwordChecks.lowercase ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0" />}
                                  <span>{t('security.passwordChecks.lowercase')}</span>
                                </div>
                                <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.number ? 'text-green-500' : 'text-gray-400'}`}>
                                  {passwordChecks.number ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0" />}
                                  <span>{t('security.passwordChecks.number')}</span>
                                </div>
                                <div className={`flex items-center space-x-1 rtl:space-x-reverse ${passwordChecks.special ? 'text-green-500' : 'text-gray-400'}`}>
                                  {passwordChecks.special ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0" />}
                                  <span>{t('security.passwordChecks.special')}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Confirm Password */}
                          <div className="relative">
                            <div className="absolute icon-left top-1/2 -translate-y-1/2">
                              <Lock className={`w-5 h-5 ${validationErrors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              onBlur={() => setTouchedFields(prev => ({ ...prev, confirmPassword: true }))}
                              className={`w-full input-with-both-icons py-3 text-gray-900 dark:text-gray-100 text-base bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none transition-colors
                                ${validationErrors.confirmPassword 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : formData.confirmPassword && !validationErrors.confirmPassword
                                    ? 'border-green-500 focus:border-green-500'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                                }`}
                              placeholder={t('security.fields.confirmPassword.placeholder')}
                              required
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
                      </div>
                    )}

                    {/* Step 4: Professional Info */}
                    {step === 4 && formData.role && (
                      <div className="space-y-5">
                        {/* Location Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className={`flex items-center space-x-1 rtl:space-x-reverse`}>
                              <MapPin className="w-4 h-4" />
                              <span>{t('professional.location.label')} *</span>
                            </div>
                          </label>
                          
                          {formData.location && (
                            <div 
                              className={`flex items-center justify-between rounded-lg p-2 mb-2 ${
                                submitted && validationErrors.location 
                                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                  : 'bg-primary-50 dark:bg-gray-700 border border-primary-200 dark:border-primary-800'
                              }`}
                            >
                              <div className={`flex items-center space-x-2 rtl:space-x-reverse`}>
                                <MapPin className={`w-4 h-4 ${submitted && validationErrors.location ? 'text-red-600' : 'text-primary-600'}`} />
                                <span className={`text-sm font-medium ${submitted && validationErrors.location ? 'text-red-700' : 'text-primary-700 dark:text-primary-300'}`}>
                                  {formData.location}
                                </span>
                              </div>
                              <button
                                onClick={removeLocation}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          <div className="relative">
                            <div className={`flex items-center border rounded-lg bg-gray-50 dark:bg-gray-700 ${
                              submitted && validationErrors.location 
                                ? 'border-red-500' 
                                : 'border-gray-200 dark:border-gray-600'
                            }`}>
                              <Search className={`w-4 h-4 ${isRTL ? 'mr-3' : 'ml-3'} text-gray-400`} />
                              <input
                                type="text"
                                placeholder={t('professional.location.placeholder')}
                                value={searchTerm}
                                onChange={(e) => {
                                  setSearchTerm(e.target.value);
                                  setShowCityDropdown(true);
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                className={`flex-1 py-2 px-2 text-sm bg-transparent text-gray-900 dark:text-gray-100 outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCityDropdown(!showCityDropdown)}
                                className={`p-2 ${isRTL ? 'ml-1' : 'mr-1'}`}
                              >
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                            
                            <AnimatePresence>
                              {showCityDropdown && (
                                <div 
                                  className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto dropdown-scroll"
                                >
                                  {filteredCities.length > 0 ? (
                                    filteredCities.map(city => (
                                      <button
                                        key={city}
                                        type="button"
                                        onClick={() => selectLocation(city)}
                                        className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between
                                          ${formData.location === city ? 'bg-primary-50 dark:bg-gray-700 text-primary-600' : 'text-gray-700 dark:text-gray-200'}`}
                                      >
                                        <span>{city}</span>
                                        {formData.location === city && (
                                          <CheckCircle className="w-3 h-3 text-primary-600" />
                                        )}
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-2 text-sm text-gray-500">{t('professional.location.noResults')}</div>
                                  )}
                                </div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          {renderFieldError('location')}
                          <p className="text-xs text-gray-500 mt-1">{t('professional.location.help')}</p>
                        </div>

                        {/* Client Section */}
                        {formData.role === 'client' && (
                          <div 
                            className={`flex items-center space-x-3 rtl:space-x-reverse bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4`}
                          >
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                              <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t('professional.clientMessage.title')}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {t('professional.clientMessage.description')}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Artisan Section */}
                        {formData.role === 'artisan' && (
                          <div className="space-y-4">
                            {/* Craft Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('professional.craft.label')} *
                              </label>
                              
                              <div className="relative">
                                {/* Left Scroll Button */}
                                <button
                                  type="button"
                                  onClick={() => scrollCrafts('left')}
                                  className="scroll-button left-0"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                <div 
                                  ref={craftsContainerRef}
                                  className="crafts-container flex overflow-x-auto scrollbar-hide rtl:space-x-reverse space-x-3 py-2 px-12"
                                >
                                  {crafts.map((craft) => {
                                    const Icon = craft.icon;
                                    const isSelected = formData.craft === craft.id;
                                    
                                    return (
                                      <button
                                        key={craft.id}
                                        type="button"
                                        onClick={() => {
                                          setFormData(prev => ({ ...prev, craft: craft.id }));
                                        }}
                                        className={`craft-button flex-shrink-0 p-3 rounded-xl border-2 transition-all flex flex-col items-center min-w-[90px]
                                          ${isSelected 
                                            ? 'selected border-primary-600'
                                            : 'border-gray-500 hover:border-gray-400'
                                          }`}
                                      >
                                        <Icon className="w-7 h-7 mb-2 text-gray-700 dark:text-gray-300" />
                                        <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 line-clamp-2">{craft.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                                
                                {/* Right Scroll Button */}
                                <button
                                  type="button"
                                  onClick={() => scrollCrafts('right')}
                                  className="scroll-button right-0"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                              {renderFieldError('craft')}
                            </div>

                            {/* Experience */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('professional.experience.label')} *
                              </label>
                              <div className={`grid grid-cols-5 gap-2`}>
                                {experienceOptions.map((exp) => (
                                  <button
                                    key={exp.value}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, experience: exp.value }));
                                    }}
                                    className={`experience-button py-2 px-1 rounded-lg text-sm font-medium transition-all
                                      ${formData.experience === exp.value
                                        ? 'selected'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      }`}
                                  >
                                    {exp.label}
                                  </button>
                                ))}
                              </div>
                              {renderFieldError('experience')}
                            </div>
                          </div>
                        )}

                        {/* Worker Section */}
                        {formData.role === 'worker' && (
                          <div className="space-y-4">
                            {/* Daily Rate */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('professional.dailyRate.label')} *
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  name="dailyRate"
                                  value={formData.dailyRate}
                                  onChange={handleChange}
                                  onBlur={() => setTouchedFields(prev => ({ ...prev, dailyRate: true }))}
                                  min="700"
                                  max="50000"
                                  step="500"
                                  className={`w-full py-3 px-4 text-base bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-700 border rounded-lg outline-none transition-colors ${isRTL ? 'text-right' : 'text-left'}
                                    ${submitted && validationErrors.dailyRate 
                                      ? 'border-red-500 focus:border-red-500' 
                                      : formData.dailyRate && !validationErrors.dailyRate
                                        ? 'border-green-500 focus:border-green-500'
                                        : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                                    }`}
                                  placeholder={t('professional.dailyRate.placeholder')}
                                />
                              </div>
                              {renderFieldError('dailyRate')}
                            </div>

                            {/* Skills */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('professional.skills.label')} *
                              </label>
                              
                              <div className="relative">
                                {/* Left Scroll Button */}
                                <button
                                  type="button"
                                  onClick={() => scrollSkills('left')}
                                  className="scroll-button left-0"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                {/* Skills Container */}
                                <div 
                                  ref={skillsContainerRef}
                                  className="skills-container flex overflow-x-auto scrollbar-hide rtl:space-x-reverse space-x-2 py-2 px-12"
                                >
                                  {workerSkills.map((skill) => (
                                    <button
                                      key={skill}
                                      type="button"
                                      onClick={() => handleSkillToggle(skill)}
                                      className={`skill-button flex-shrink-0 py-2.5 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                                        ${formData.skills.includes(skill)
                                          ? 'selected'
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                      {skill}
                                    </button>
                                  ))}
                                </div>
                                
                                {/* Right Scroll Button */}
                                <button
                                  type="button"
                                  onClick={() => scrollSkills('right')}
                                  className="scroll-button right-0"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                              
                              <p className={`text-sm font-medium mt-2 ${
                                  formData.skills.length === 0 ? 'text-gray-500' : 'text-primary-600'
                                }`}>
                                {t('professional.skills.selected', { count: formData.skills.length })}
                              </p>
                              {renderFieldError('skills')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 5: Confirmation */}
                    {step === 5 && (
                      <div className="space-y-4">
                        <div className="text-center mb-3">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('confirmation.title')}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('confirmation.subtitle')}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('confirmation.summary.fullName')}</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">{formData.username}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('confirmation.summary.email')}</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">{formData.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('confirmation.summary.phone')}</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">{formData.phone}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('confirmation.summary.location')}</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">{formData.location || t('confirmation.summary.notSpecified')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('confirmation.summary.accountType')}</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">
                                {roleOptions.find(r => r.value === formData.role)?.label}
                              </p>
                            </div>
                            {formData.role === 'worker' && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('confirmation.summary.skillsCount')}</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">{formData.skills.length}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Checkbox */}
                        <label 
                          className="checkbox-fixed p-2 rounded-lg cursor-pointer"
                          style={{
                            backgroundColor: submitted && validationErrors.acceptTerms ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                          }}
                        >
                          <div className={`flex items-start`}>
                            <input
                              type="checkbox"
                              name="acceptTerms"
                              checked={formData.acceptTerms}
                              onChange={handleChange}
                              className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 ${
                                submitted && validationErrors.acceptTerms 
                                  ? 'border-red-500 text-red-600 focus:ring-red-500' 
                                  : 'border-gray-300 text-primary-600 focus:ring-primary-500'
                              }`}
                            />
                            <span className={`text-sm ${submitted && validationErrors.acceptTerms ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'} ${isRTL ? 'mr-2' : 'ml-2'}`}>
                              {t('confirmation.terms.agree')}{' '}
                              <Link to="/terms" className="text-primary-600 hover:underline font-medium">{t('confirmation.terms.termsLink')}</Link>
                              {' '}{t('confirmation.terms.and')}{' '}
                              <Link to="/privacy" className="text-primary-600 hover:underline font-medium">{t('confirmation.terms.privacyLink')}</Link>
                            </span>
                          </div>
                        </label>
                        {renderFieldError('acceptTerms')}
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div 
                      className={`flex ${step > 1 ? 'space-x-3 rtl:space-x-reverse' : ''} pt-4`}
                    >
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-base font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                          <span>{t('buttons.previous')}</span>
                        </button>
                      )}
                      
                      {step < 5 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse hover:shadow-lg transition-all"
                        >
                          <span>{t('buttons.next')}</span>
                          {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 hover:shadow-lg transition-all"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{t('buttons.submitting')}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span>{t('buttons.submit')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  
                  </form>
                </motion.div>
              </AnimatePresence>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('links.haveAccount')}{' '}
                  <Link to="/login" className="text-primary-600 hover:underline font-medium">
                    {t('links.login')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Animation */}
        <div 
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden items-center justify-center"
        >
          <div className="absolute inset-0">
            <div 
              className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <div 
              className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10 w-full max-w-md px-4">
            {renderAnimation()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;