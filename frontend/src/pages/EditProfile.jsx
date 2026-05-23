// pages/EditProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import defaultImgProfile from '../assets/images/default-avatar.png';

import {
  User, Mail, Phone, MapPin, Briefcase, Save, X,
  Camera, Trash2, Loader, Eye, EyeOff, Globe,
  Wrench, Award, Clock, DollarSign, ChevronLeft, ChevronRight, ChevronDown,
  Shield, AlertCircle, AtSign, Search, CheckCircle, Users, Hammer,
  UserRound, UserPlus, UserCog
} from 'lucide-react';

// أيقونات الحرف
import { 
  FaBolt, FaWrench, FaPaintBrush, FaHammer, FaTruck, FaBroom,
  FaSnowflake, FaWater, FaCouch, FaHardHat, FaTools,
  FaFire, FaLeaf, FaRuler, FaPaintRoller, FaSatelliteDish,
  FaHome, FaBath, FaDoorOpen, FaWindowMaximize,
  FaSolarPanel, FaNetworkWired,
  FaSwimmingPool, FaGasPump,
} from 'react-icons/fa';

import { 
  MdOutlineKitchen, MdOutlineSmartphone, MdOutlineSecurity,
  MdOutlineConstruction, MdOutlineDesignServices,
  MdOutlineRoofing, MdOutlineSolarPower,
} from 'react-icons/md';

import { 
  GiGearHammer, GiWaterTank,
  GiPlantsAndAnimals, GiStoneCrafting, GiElevator,
  GiAutoRepair, GiWoodCabin, GiGlassCelebration, GiCctvCamera,
} from 'react-icons/gi';

import { RiHomeGearLine, RiPaintBrushLine } from 'react-icons/ri';

// إضافة CSS
const style = document.createElement('style');
style.textContent = `
  /* إخفاء شريط التمرير */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* تنسيقات الحاويات */
  .crafts-container, .skills-container {
    padding-left: 3rem !important;
    padding-right: 3rem !important;
  }

  .craft-button, .skill-button {
    transition: all 0.2s ease;
    border-radius: 12px;
  }
  
  .craft-button.selected, .skill-button.selected {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
    color: white !important;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  }

  .craft-button.selected .craft-icon {
    color: white !important;
  }

  .craft-icon {
    transition: color 0.2s ease;
  }
  
  /* البطاقة الرئيسية - بدون خلفية */
  .edit-profile-card {
    background: transparent !important;
    border-radius: 0;
  }
  
  /* الأقسام */
  .edit-profile-section {
    background: #ffffff !important;
    border-radius: 24px;
    border: 1px solid #e5e7eb;
  }
  
  .dark .edit-profile-section {
    background: #1f2937 !important;
    border-color: #374151;
  }
  
  /* الحقول والـ select - بنفس التصميم */
  .edit-input, .edit-select {
    border-radius: 20px !important;
    transition: all 0.3s ease;
    background: #f9fafb !important;
    border: 1px solid #e5e7eb !important;
    color: #000000 !important;
    padding: 10px 16px;
    width: 100%;
    font-size: 14px;
  }
  
  .edit-input:focus, .edit-select:focus {
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    border-color: #2563eb !important;
    background: #ffffff !important;
    outline: none;
  }
  
  .dark .edit-input, .dark .edit-select {
    background: #374151 !important;
    border-color: #4b5563 !important;
    color: #ffffff !important;
  }
  
  .dark .edit-input:focus, .dark .edit-select:focus {
    background: #4b5563 !important;
    border-color: #3b82f6 !important;
  }
  
  .edit-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-position: left 12px center;
    background-repeat: no-repeat;
    background-size: 20px;
  }
  
  .dark .edit-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  }
  
  [dir="rtl"] .edit-select {
    background-position: right 12px center;
    padding-right: 40px;
    padding-left: 16px;
  }
  
  [dir="ltr"] .edit-select {
    background-position: left 12px center;
    padding-left: 40px;
    padding-right: 16px;
  }
  
  /* القائمة المنسدلة للمدن */
  .cities-dropdown {
    border-radius: 20px;
    overflow: hidden;
  }
  
  .city-option {
    transition: all 0.2s ease;
  }
  
  .city-option:hover {
    background: #f3f4f6 !important;
  }
  
  .dark .city-option:hover {
    background: #4b5563 !important;
  }
  
  /* أزرار التنقل */
  .nav-scroll-btn {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
    border-radius: 20px !important;
    transition: all 0.3s ease;
  }
  
  .nav-scroll-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  
  /* مؤشرات القسم */
  .section-icon {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border-radius: 16px;
  }
  
  /* النصوص */
  .section-title {
    color: #000000 !important;
  }
  
  .dark .section-title {
    color: #ffffff !important;
  }
  
  .section-label {
    color: #4b5563 !important;
  }
  
  .dark .section-label {
    color: #9ca3af !important;
  }

  /* ==================== أزرار التبديل (Toggle) ==================== */
  .editprofile-toggle {
    position: relative;
    width: 48px;
    height: 24px;
    border-radius: 30px;
    transition: all 0.3s ease;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  .editprofile-toggle.active {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  }
  
  .editprofile-toggle.inactive {
    background: #cbd5e1 !important;
  }
  
  .dark .editprofile-toggle.inactive {
    background: #4b5563 !important;
  }
  
  .editprofile-toggle-knob {
    position: absolute;
    top: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;
document.head.appendChild(style);

// Modal Popup Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
          {title || 'تأكيد'}
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {message || 'هل أنت متأكد من رغبتك في القيام بهذا الإجراء؟'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
          >
            {cancelText || 'إلغاء'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300"
          >
            {confirmText || 'تأكيد'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Skeleton
const EditProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl mb-6"></div>
          <div className="flex flex-col items-center -mt-20 mb-8">
            <div className="w-28 h-28 rounded-2xl bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800"></div>
            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mt-4"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-12 w-full bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditProfile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const craftsContainerRef = useRef(null);
  const skillsContainerRef = useRef(null);
  
  const { 
    user: currentUser,
    profileData,
    profileLoading,
    profileError,
    uploadingAvatar,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    fetchCurrentUserProfile,
    clearProfileError
  } = useStore();

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    professionalInfo: {
      craft: '',
      experience: '',
      dailyRate: '',
      skills: []
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showOnlineStatus: true
    }
  });

  const [originalData, setOriginalData] = useState({});
  const [daysUntilUsernameChange, setDaysUntilUsernameChange] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedSection, setSelectedSection] = useState('basic');
  
  const [showRemoveAvatarModal, setShowRemoveAvatarModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isRTL = i18n.language === 'ar';
  const isArtisan = currentUser?.role === 'artisan';
  const isWorker = currentUser?.role === 'worker';
  const isProfessional = isArtisan || isWorker;

  // قائمة الولايات الجزائرية
  const algerianCities = [
    "أدرار", "Adrar", "الشلف", "Chlef", "الأغواط", "Laghouat",
    "أم البواقي", "Oum El Bouaghi", "باتنة", "Batna", "بجاية", "Béjaïa",
    "بسكرة", "Biskra", "بشار", "Béchar", "البليدة", "Blida",
    "البويرة", "Bouira", "تمنراست", "Tamanrasset", "تبسة", "Tébessa",
    "تلمسان", "Tlemcen", "تيارت", "Tiaret", "تيزي وزو", "Tizi Ouzou",
    "الجزائر", "Algiers", "الجلفة", "Djelfa", "جيجل", "Jijel",
    "سطيف", "Sétif", "سعيدة", "Saïda", "سكيكدة", "Skikda",
    "سيدي بلعباس", "Sidi Bel Abbès", "عنابة", "Annaba", "قالمة", "Guelma",
    "قسنطينة", "Constantine", "المدية", "Médéa", "مستغانم", "Mostaganem",
    "المسيلة", "M'Sila", "معسكر", "Mascara", "ورقلة", "Ouargla",
    "وهران", "Oran", "البيض", "El Bayadh", "إليزي", "Illizi",
    "برج بوعريريج", "Bordj Bou Arréridj", "بومرداس", "Boumerdès",
    "الطارف", "El Tarf", "تندوف", "Tindouf", "تيسمسيلت", "Tissemsilt",
    "الوادي", "El Oued", "خنشلة", "Khenchela", "سوق أهراس", "Souk Ahras",
    "تيبازة", "Tipaza", "ميلة", "Mila", "عين الدفلى", "Aïn Defla",
    "النعامة", "Naâma", "عين تموشنت", "Aïn Témouchent", "غرداية", "Ghardaïa",
    "غليزان", "Relizane"
  ];

  const filteredCities = algerianCities.filter(city => 
    city.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  // قائمة الحرف
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
    { id: 'handyman', name: t('crafts.handyman'), icon: FaTools, category: 'basic' }
  ];

  // سنوات الخبرة
  const experienceOptions = [
    { value: '0-1', label: t('professional.experience.options.0-1') },
    { value: '1-3', label: t('professional.experience.options.1-3') },
    { value: '3-5', label: t('professional.experience.options.3-5') },
    { value: '5-10', label: t('professional.experience.options.5-10') },
    { value: '10+', label: t('professional.experience.options.10+') }
  ];

  // مهارات العمال
  const workerSkills = [
    t('skills.loading_unloading'), t('skills.cleaning'), t('skills.organizing'),
    t('skills.packing'), t('skills.wrapping'), t('skills.construction'),
    t('skills.farming'), t('skills.painting'), t('skills.furniture_assembly'),
    t('skills.moving'), t('skills.assembling'), t('skills.repairing'),
    t('skills.plumbing'), t('skills.electrical'), t('skills.tiling'),
    t('skills.carpentry'), t('skills.blacksmithing'), t('skills.welding')
  ];

  // تحميل بيانات المستخدم
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      if (!profileData) {
        await fetchCurrentUserProfile();
      }
    };
    
    loadProfile();
  }, [currentUser, profileData, navigate, fetchCurrentUserProfile]);

  // تحديث النموذج عند تحميل البيانات
  useEffect(() => {
    if (profileData) {
      let daysLeft = null;
      if (profileData.lastUsernameChange) {
        const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
        const timeSinceLastChange = Date.now() - new Date(profileData.lastUsernameChange).getTime();
        if (timeSinceLastChange < FIFTEEN_DAYS) {
          daysLeft = Math.ceil((FIFTEEN_DAYS - timeSinceLastChange) / (24 * 60 * 60 * 1000));
        }
      }
      setDaysUntilUsernameChange(daysLeft);

      const newFormData = {
        username: profileData.username || '',
        bio: profileData.bio || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        professionalInfo: {
          craft: profileData.professionalInfo?.craft || '',
          experience: profileData.professionalInfo?.experience || '',
          dailyRate: profileData.professionalInfo?.dailyRate || '',
          skills: [...(profileData.professionalInfo?.skills || [])]
        },
        privacy: {
          showEmail: profileData.privacy?.showEmail || false,
          showPhone: profileData.privacy?.showPhone || false,
          showLocation: profileData.privacy?.showLocation !== undefined 
            ? profileData.privacy.showLocation 
            : true,
          showOnlineStatus: profileData.privacy?.showOnlineStatus !== undefined 
            ? profileData.privacy.showOnlineStatus 
            : true
        }
      };

      setFormData(newFormData);
      setOriginalData(JSON.parse(JSON.stringify(newFormData)));

      if (profileData.profileImage) {
        setAvatarPreview(profileData.profileImage);
      }
    }
  }, [profileData]);

  // عرض الأخطاء
  useEffect(() => {
    if (profileError) {
      toast.error(profileError);
      clearProfileError();
    }
  }, [profileError, clearProfileError]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'username') {
      const usernameRegex = /^[a-zA-Z0-9_]*$/;
      if (value && !usernameRegex.test(value)) {
        toast.error(t('profile.edit.usernameInvalidChars'));
        return;
      }
      setFormData(prev => ({ ...prev, username: value }));
    } else if (name.startsWith('privacy.')) {
      const privacyField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [privacyField]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('professional.')) {
      const profField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        professionalInfo: {
          ...prev.professionalInfo,
          [profField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // دالة خاصة لتبديل إعدادات الخصوصية
  const handlePrivacyToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: !prev.privacy[field]
      }
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.edit.avatarTooLarge'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.edit.invalidImageType'));
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatarClick = () => {
    setShowRemoveAvatarModal(true);
  };

  const confirmRemoveAvatar = async () => {
    setShowRemoveAvatarModal(false);
    const result = await removeAvatar();
    if (result?.success) {
      setAvatarPreview(defaultImgProfile);
      setAvatarFile(null);
      toast.success(t('profile.edit.avatarRemoved'));
    }
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        skills: prev.professionalInfo.skills.includes(skill)
          ? prev.professionalInfo.skills.filter(s => s !== skill)
          : [...prev.professionalInfo.skills, skill]
      }
    }));
  };

  const selectLocation = (city) => {
    setFormData(prev => ({
      ...prev,
      location: city
    }));
    setShowCityDropdown(false);
    setSearchTerm('');
  };

  const removeLocation = () => {
    setFormData(prev => ({
      ...prev,
      location: ''
    }));
  };

  const scrollCrafts = (direction) => {
    if (craftsContainerRef.current) {
      const scrollAmount = 300;
      craftsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollSkills = (direction) => {
    if (skillsContainerRef.current) {
      const scrollAmount = 250;
      skillsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // التحقق من وجود تغييرات
  const hasChanges = () => {
    const currentSkills = [...formData.professionalInfo.skills].sort();
    const originalSkills = [...(originalData.professionalInfo?.skills || [])].sort();
    const skillsChanged = JSON.stringify(currentSkills) !== JSON.stringify(originalSkills);
    
    return (
      formData.username !== originalData.username ||
      formData.bio !== originalData.bio ||
      formData.email !== originalData.email ||
      formData.phone !== originalData.phone ||
      formData.location !== originalData.location ||
      formData.professionalInfo.craft !== originalData.professionalInfo?.craft ||
      formData.professionalInfo.experience !== originalData.professionalInfo?.experience ||
      formData.professionalInfo.dailyRate !== originalData.professionalInfo?.dailyRate ||
      skillsChanged ||
      JSON.stringify(formData.privacy) !== JSON.stringify(originalData.privacy) ||
      avatarFile !== null
    );
  };

  const handleCancelClick = () => {
    if (hasChanges()) {
      setShowCancelModal(true);
    } else {
      navigate(-1);
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigate(-1);
  };

  // دالة handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      toast.info(t('profile.edit.noChanges'));
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile);
        if (!uploadResult?.success) {
          setIsSubmitting(false);
          return;
        }
      }

      const updateData = {};

      if (formData.username !== originalData.username) {
        if (!formData.username || formData.username.trim() === '') {
          toast.error(t('profile.edit.usernameRequired'));
          setIsSubmitting(false);
          return;
        }
        if (formData.username.length < 3 || formData.username.length > 30) {
          toast.error(t('profile.edit.usernameLength'));
          setIsSubmitting(false);
          return;
        }
        updateData.username = formData.username;
      }

      if (formData.bio !== originalData.bio) updateData.bio = formData.bio;

      if (formData.email !== originalData.email) {
        if (formData.email && formData.email.trim() !== '') {
          updateData.email = formData.email;
        } else {
          toast.error(t('profile.edit.emailRequired'));
          setIsSubmitting(false);
          return;
        }
      }

      if (formData.phone !== originalData.phone) {
        if (formData.phone && formData.phone.trim() !== '') {
          updateData.phone = formData.phone;
        } else {
          toast.error(t('profile.edit.phoneRequired'));
          setIsSubmitting(false);
          return;
        }
      }

      if (formData.location !== originalData.location) updateData.location = formData.location;

      // تحديث المعلومات المهنية
      if (isProfessional) {
        const currentSkills = [...formData.professionalInfo.skills].sort();
        const originalSkills = [...(originalData.professionalInfo?.skills || [])].sort();
        const skillsChanged = JSON.stringify(currentSkills) !== JSON.stringify(originalSkills);
        
        const professionalChanged = 
          formData.professionalInfo.craft !== originalData.professionalInfo?.craft ||
          formData.professionalInfo.experience !== originalData.professionalInfo?.experience ||
          formData.professionalInfo.dailyRate !== originalData.professionalInfo?.dailyRate ||
          skillsChanged;

        if (professionalChanged) {
          updateData.professionalInfo = {
            craft: formData.professionalInfo.craft || '',
            experience: formData.professionalInfo.experience || '',
            dailyRate: formData.professionalInfo.dailyRate || '',
            skills: formData.professionalInfo.skills || []
          };
        }
      }

      if (JSON.stringify(formData.privacy) !== JSON.stringify(originalData.privacy)) {
        updateData.privacy = formData.privacy;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info(t('profile.edit.noChanges'));
        setIsSubmitting(false);
        return;
      }

      const result = await updateProfile(updateData);
      
      if (result?.success) {
        toast.success(t('profile.edit.success'));
        setOriginalData(JSON.parse(JSON.stringify(formData)));
        
        const newUsername = updateData.username || profileData.username;
        navigate(`/profile/${newUsername}`);
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || t('profile.edit.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading && !profileData) {
    return <EditProfileSkeleton />;
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('profile.errors.notFound')}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    );
  }

  const isUsernameChangeAllowed = daysUntilUsernameChange === null || daysUntilUsernameChange === 0;

  return (
    <div className="min-h-screen">
      <ConfirmModal
        isOpen={showRemoveAvatarModal}
        onClose={() => setShowRemoveAvatarModal(false)}
        onConfirm={confirmRemoveAvatar}
        title={t('profile.edit.confirmRemoveAvatarTitle') || 'حذف الصورة الشخصية'}
        message={t('profile.edit.confirmRemoveAvatarMessage') || 'هل أنت متأكد من حذف الصورة الشخصية؟'}
        confirmText={t('common.delete') || 'حذف'}
        cancelText={t('common.cancel') || 'إلغاء'}
      />

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title={t('profile.edit.confirmCancelTitle') || 'إلغاء التعديلات'}
        message={t('profile.edit.confirmCancelMessage') || 'هل أنت متأكد من إلغاء التعديلات؟ سيتم فقدان جميع التغييرات غير المحفوظة.'}
        confirmText={t('common.confirm') || 'تأكيد'}
        cancelText={t('common.cancel') || 'إلغاء'}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl mb-6 relative">
            <button
              type="button"
              onClick={handleCancelClick}
              className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center -mt-20 mb-8">
            <div className="relative group">
              <img
                src={avatarPreview || defaultImgProfile}
                alt={profileData.username}
                className="w-28 h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImgProfile;
                }}
              />
              
              <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  disabled={uploadingAvatar}
                >
                  <Camera className="w-4 h-4 text-gray-700" />
                </button>
                
                {avatarPreview && avatarPreview !== defaultImgProfile && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatarClick}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    disabled={uploadingAvatar}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />

            <p className="text-sm dark:text-gray-900 text-gray-300 mt-2">
              {t('profile.edit.clickToChangeAvatar')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* القسم 1: المعلومات الأساسية */}
              <div className="edit-profile-section p-5">
                <button
                  type="button"
                  onClick={() => setSelectedSection(selectedSection === 'basic' ? '' : 'basic')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h2 className="section-title text-lg font-medium flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    {t('steps.basicInfo')}
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${selectedSection === 'basic' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {selectedSection === 'basic' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4"
                    >
                      <div>
                        <label className="section-label block text-sm font-medium mb-2">
                          <AtSign className="w-4 h-4 inline ml-1 rtl:mr-1" />
                          {t('profile.edit.username')}
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          disabled={!isUsernameChangeAllowed}
                          className={`edit-input ${!isUsernameChangeAllowed ? 'opacity-75 cursor-not-allowed' : ''}`}
                          placeholder={t('profile.edit.usernamePlaceholder')}
                          minLength={3}
                          maxLength={30}
                        />
                        
                        {!isUsernameChangeAllowed && daysUntilUsernameChange > 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('profile.edit.usernameChangeWait', { days: daysUntilUsernameChange })}
                          </p>
                        )}
                        
                        {isUsernameChangeAllowed && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {t('profile.edit.usernameChangeAvailable')}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="section-label block text-sm font-medium mb-2">
                          <Mail className="w-4 h-4 inline ml-1 rtl:mr-1" />
                          {t('profile.edit.email')}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="edit-input"
                          placeholder="email@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="section-label block text-sm font-medium mb-2">
                          <Phone className="w-4 h-4 inline ml-1 rtl:mr-1" />
                          {t('profile.edit.phone')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="edit-input"
                          placeholder="05XX XX XX XX"
                          required
                        />
                      </div>

                      <div>
                        <label className="section-label block text-sm font-medium mb-2">
                          <Briefcase className="w-4 h-4 inline ml-1 rtl:mr-1" />
                          {t('profile.edit.bio')}
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="edit-input resize-none"
                          placeholder={t('profile.edit.bioPlaceholder')}
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
                          {formData.bio.length}/500
                        </p>
                      </div>

                      <div>
                        <label className="section-label block text-sm font-medium mb-2">
                          <MapPin className="w-4 h-4 inline ml-1 rtl:mr-1" />
                          {t('profile.edit.location')}
                        </label>
                        
                        {formData.location && (
                          <div className="flex items-center justify-between rounded-xl p-3 mb-2 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {formData.location}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={removeLocation}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        <div className="relative">
                          <div className="flex items-center border rounded-2xl bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
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
                          
                          {showCityDropdown && (
                            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                              {filteredCities.length > 0 ? (
                                filteredCities.map(city => (
                                  <button
                                    key={city}
                                    type="button"
                                    onClick={() => selectLocation(city)}
                                    className={`w-full text-left rtl:text-right px-4 py-2 text-sm transition-colors flex items-center justify-between city-option
                                      ${formData.location === city ? 'bg-blue-50 dark:bg-gray-700 text-blue-600' : 'text-gray-700 dark:text-gray-200'}`}
                                  >
                                    <span>{city}</span>
                                    {formData.location === city && (
                                      <CheckCircle className="w-3 h-3 text-blue-600" />
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">{t('professional.location.noResults')}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* القسم 2: المعلومات المهنية - فقط للمحترفين */}
              {isProfessional && (
                <div className="edit-profile-section p-5">
                  <button
                    type="button"
                    onClick={() => setSelectedSection(selectedSection === 'professional' ? '' : 'professional')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h2 className="section-title text-lg font-medium flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                      {t('steps.professional')}
                    </h2>
                    <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${selectedSection === 'professional' ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {selectedSection === 'professional' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-4"
                      >
                        <div>
                          <label className="section-label block text-sm font-medium mb-2">
                            <Wrench className="w-4 h-4 inline ml-1 rtl:mr-1" />
                            {t('professional.craft.label')}
                          </label>
                          
                          <div className="relative mb-4">
                            <button
                              type="button"
                              onClick={() => scrollCrafts('left')}
                              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            
                            <div 
                              ref={craftsContainerRef}
                              className="crafts-container flex overflow-x-auto scrollbar-hide rtl:space-x-reverse space-x-2 py-2 px-12"
                            >
                              {crafts.map((craft) => {
                                const Icon = craft.icon;
                                const isSelected = formData.professionalInfo.craft === craft.id;
                                return (
                                  <button
                                    key={craft.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        professionalInfo: {
                                          ...prev.professionalInfo,
                                          craft: craft.id
                                        }
                                      }));
                                    }}
                                    className={`craft-button flex-shrink-0 flex items-center gap-2 py-2.5 px-4 text-sm font-medium whitespace-nowrap transition-all
                                      ${isSelected
                                        ? 'selected'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      }`}
                                  >
                                    <Icon className={`craft-icon w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                    {craft.name}
                                  </button>
                                );
                              })}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => scrollCrafts('right')}
                              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {isArtisan && (
                          <div>
                            <label className="section-label block text-sm font-medium mb-2">
                              <Clock className="w-4 h-4 inline ml-1 rtl:mr-1" />
                              {t('professional.experience.label')}
                            </label>
                            <select
                              value={formData.professionalInfo.experience}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  professionalInfo: {
                                    ...prev.professionalInfo,
                                    experience: e.target.value
                                  }
                                }));
                              }}
                              className="edit-select"
                            >
                              <option value="">اختر سنوات الخبرة</option>
                              {experienceOptions.map((exp) => (
                                <option key={exp.value} value={exp.value}>
                                  {exp.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {isWorker && (
                          <div>
                            <label className="section-label block text-sm font-medium mb-2">
                              <DollarSign className="w-4 h-4 inline ml-1 rtl:mr-1" />
                              {t('professional.dailyRate.label')}
                            </label>
                            <input
                              type="number"
                              name="professional.dailyRate"
                              value={formData.professionalInfo.dailyRate}
                              onChange={handleInputChange}
                              min="1000"
                              max="50000"
                              step="500"
                              className="edit-input"
                              placeholder="2000"
                            />
                          </div>
                        )}

                        {isWorker && (
                          <div>
                            <label className="section-label block text-sm font-medium mb-2">
                              <Award className="w-4 h-4 inline ml-1 rtl:mr-1" />
                              {t('professional.skills.label')}
                            </label>
                            
                            <div className="relative mb-4">
                              <button
                                type="button"
                                onClick={() => scrollSkills('left')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              
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
                                      ${formData.professionalInfo.skills.includes(skill)
                                        ? 'selected'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      }`}
                                  >
                                    {skill}
                                  </button>
                                ))}
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => scrollSkills('right')}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                            
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {t('professional.skills.selected', { count: formData.professionalInfo.skills.length })}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* القسم 3: إعدادات الخصوصية - مع Toggle buttons */}
              <div className="edit-profile-section p-5">
                <button
                  type="button"
                  onClick={() => setSelectedSection(selectedSection === 'privacy' ? '' : 'privacy')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h2 className="section-title text-lg font-medium flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    {t('settings.privacy.title') || 'إعدادات الخصوصية'}
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${selectedSection === 'privacy' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {selectedSection === 'privacy' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-3"
                    >
                      {/* إظهار البريد الإلكتروني - Toggle */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {t('settings.privacy.showEmail') || 'إظهار البريد الإلكتروني'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePrivacyToggle('showEmail')}
                          className={`editprofile-toggle ${formData.privacy.showEmail ? 'active' : 'inactive'}`}
                        >
                          <div className={`editprofile-toggle-knob ${formData.privacy.showEmail ? (isRTL ? 'right-1' : 'right-1') : (isRTL ? 'left-1' : 'left-1')}`} />
                        </button>
                      </div>

                      {/* إظهار رقم الهاتف - Toggle */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {t('settings.privacy.showPhone') || 'إظهار رقم الهاتف'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePrivacyToggle('showPhone')}
                          className={`editprofile-toggle ${formData.privacy.showPhone ? 'active' : 'inactive'}`}
                        >
                          <div className={`editprofile-toggle-knob ${formData.privacy.showPhone ? (isRTL ? 'right-1' : 'right-1') : (isRTL ? 'left-1' : 'left-1')}`} />
                        </button>
                      </div>

                      {/* إظهار الموقع - Toggle */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {t('settings.privacy.showLocation') || 'إظهار الموقع'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePrivacyToggle('showLocation')}
                          className={`editprofile-toggle ${formData.privacy.showLocation ? 'active' : 'inactive'}`}
                        >
                          <div className={`editprofile-toggle-knob ${formData.privacy.showLocation ? (isRTL ? 'right-1' : 'right-1') : (isRTL ? 'left-1' : 'left-1')}`} />
                        </button>
                      </div>

                      {/* إظهار حالة الاتصال - Toggle */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {t('settings.privacy.showOnlineStatus') || 'إظهار حالة الاتصال'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePrivacyToggle('showOnlineStatus')}
                          className={`editprofile-toggle ${formData.privacy.showOnlineStatus ? 'active' : 'inactive'}`}
                        >
                          <div className={`editprofile-toggle-knob ${formData.privacy.showOnlineStatus ? (isRTL ? 'right-1' : 'right-1') : (isRTL ? 'left-1' : 'left-1')}`} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* أزرار التحكم */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingAvatar || !hasChanges()}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${!hasChanges() || isSubmitting || uploadingAvatar
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-[1.02]'
                    }`}
                >
                  {isSubmitting || uploadingAvatar ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>{t('common.saving') || 'جاري الحفظ...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{t('common.save') || 'حفظ'}</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  {t('common.cancel') || 'إلغاء'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;