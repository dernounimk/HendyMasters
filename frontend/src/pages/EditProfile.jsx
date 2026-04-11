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

// إضافة CSS للتأثيرات الحركية
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
  
  /* تصحيح مواقع أزرار التمرير */
  [dir="rtl"] .scroll-button-left {
    left: 0.5rem;
    right: auto;
  }
  
  [dir="rtl"] .scroll-button-right {
    right: 0.5rem;
    left: auto;
  }
  
  [dir="ltr"] .scroll-button-left {
    left: 0.5rem;
    right: auto;
  }
  
  [dir="ltr"] .scroll-button-right {
    right: 0.5rem;
    left: auto;
  }

  /* أنيميشن بسيط */
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

  /* تنسيقات الحاويات */
  .crafts-container, .skills-container {
    padding-left: 3rem !important;
    padding-right: 3rem !important;
  }

  .craft-button, .skill-button {
    transition: all 0.2s ease;
  }
  
  .craft-button:hover, .skill-button:hover {
    transform: none !important;
    background-color: #f3f4f6;
  }
  
  .craft-button.selected, .skill-button.selected {
    background-color: #2563eb;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  }

  .craft-button.selected .craft-icon {
    color: white;
  }

  .craft-icon {
    transition: color 0.2s ease;
  }

  /* Modal Popup Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    max-width: 400px;
    width: 90%;
    animation: slideUp 0.2s ease-out;
  }

  .dark .modal-content {
    background: #1f2937;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

// ✅ Modal Popup Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title || 'تأكيد'}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message || 'هل أنت متأكد من رغبتك في القيام بهذا الإجراء؟'}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            {cancelText || 'إلغاء'}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {confirmText || 'تأكيد'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Skeleton للتعديل
const EditProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600 animate-pulse"></div>
          <div className="px-6 py-8">
            <div className="flex flex-col items-center -mt-20 mb-8">
              <div className="w-28 h-28 rounded-2xl bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800 animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mt-4 animate-pulse"></div>
            </div>
            
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditProfile = () => {
  const { t } = useTranslation();
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
    username: '', // ✅ أضفنا حقل username
    bio: '',
    email: '',
    phone: '',
    location: '',
    
    // معلومات مهنية (للحرفيين والعمال فقط)
    professionalInfo: {
      craft: '',
      experience: '',
      dailyRate: '',
      skills: []
    },
    
    // إعدادات الخصوصية
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
  
  // ✅ Modal state
  const [showRemoveAvatarModal, setShowRemoveAvatarModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isRTL = document.dir === 'rtl';
  const isArtisan = currentUser?.role === 'artisan';
  const isWorker = currentUser?.role === 'worker';
  const isClient = currentUser?.role === 'client';
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
    "غليزان", "Relizane", "المغير", "El M'Ghair", "المنيعة", "El Menia",
    "أولاد جلال", "Ouled Djellal", "بني عباس", "Béni Abbès",
    "عين صالح", "Aïn Salah", "عين قزام", "Aïn Guezzam",
    "تقرت", "Touggourt", "جانت", "Djanet", "تيميمون", "Timimoun"
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
    t('skills.carpentry'), t('skills.blacksmithing'), t('skills.welding'),
    t('skills.stone_cutting'), t('skills.carving'), t('skills.glass_installation'),
    t('skills.kitchen_installation'), t('skills.window_installation'),
    t('skills.general_maintenance'), t('skills.facade_cleaning'),
    t('skills.carpet_cleaning'), t('skills.pest_control'), t('skills.gardening'),
    t('skills.automatic_irrigation'), t('skills.artificial_grass'),
    t('skills.decorative_painting')
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
      // حساب الأيام المتبقية لتغيير اسم المستخدم
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
          skills: profileData.professionalInfo?.skills || []
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
      setOriginalData(newFormData);

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
      // التحقق من صحة اسم المستخدم (أحرف إنجليزية وأرقام وشرطة سفلية فقط)
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

  // ✅ دالة مع popup تأكيد لحذف الصورة
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

  // دوال التمرير
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
    return (
      formData.username !== originalData.username ||
      formData.bio !== originalData.bio ||
      formData.email !== originalData.email ||
      formData.phone !== originalData.phone ||
      formData.location !== originalData.location ||
      JSON.stringify(formData.professionalInfo) !== JSON.stringify(originalData.professionalInfo) ||
      JSON.stringify(formData.privacy) !== JSON.stringify(originalData.privacy) ||
      avatarFile !== null
    );
  };

  // ✅ دالة مع popup تأكيد للإلغاء
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      toast.info(t('profile.edit.noChanges'));
      return;
    }
    
    setIsSubmitting(true);

    try {
      // رفع الصورة أولاً إذا وجدت
      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile);
        if (!uploadResult?.success) {
          setIsSubmitting(false);
          return;
        }
      }

      // بناء كائن التحديث
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

      if (formData.bio !== originalData.bio) {
        updateData.bio = formData.bio;
      }

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

      if (formData.location !== originalData.location) {
        updateData.location = formData.location;
      }

      if (isProfessional) {
        const professionalChanged = 
          formData.professionalInfo.craft !== originalData.professionalInfo?.craft ||
          formData.professionalInfo.experience !== originalData.professionalInfo?.experience ||
          formData.professionalInfo.dailyRate !== originalData.professionalInfo?.dailyRate ||
          JSON.stringify(formData.professionalInfo.skills) !== JSON.stringify(originalData.professionalInfo?.skills || []);

        if (professionalChanged) {
          updateData.professionalInfo = {
            ...(formData.professionalInfo.craft && { craft: formData.professionalInfo.craft }),
            ...(formData.professionalInfo.experience && { experience: formData.professionalInfo.experience }),
            ...(formData.professionalInfo.dailyRate && { dailyRate: formData.professionalInfo.dailyRate }),
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

      console.log('Sending update data:', updateData);
      
      const result = await updateProfile(updateData);
      
      if (result?.success) {
        toast.success(t('profile.edit.success'));
        setOriginalData({
          ...formData
        });
        
        // تحديث اسم المستخدم في الرابط إذا تم تغييره
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
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('profile.errors.notFound')}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    );
  }

  const isUsernameChangeAllowed = daysUntilUsernameChange === null || daysUntilUsernameChange === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ✅ Popup Modals */}
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
          {/* رأس الصفحة */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleCancelClick}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              <span>{t('common.back')}</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('profile.edit.title')}
            </h1>
          </div>

          {/* نموذج التعديل */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* غلاف الملف الشخصي */}
            <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600 relative">
              <button
                type="button"
                onClick={handleCancelClick}
                className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6">
              {/* الصورة الشخصية */}
              <div className="flex flex-col items-center -mt-16 mb-8">
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

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t('profile.edit.clickToChangeAvatar')}
                </p>
              </div>

              {/* أقسام التعديل */}
              <div className="space-y-8">
                {/* القسم 1: المعلومات الأساسية */}
                <motion.div 
                  initial={false}
                  animate={{ height: 'auto' }}
                  className="border-b border-gray-200 dark:border-gray-700 pb-6"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSection(selectedSection === 'basic' ? '' : 'basic')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-primary-600" />
                      {t('steps.basicInfo')}
                    </h2>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${selectedSection === 'basic' ? 'rotate-180' : ''}`} />
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
                        {/* ✅ اسم المستخدم - قابل للتعديل مع رسوم بيانية */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <AtSign className="w-4 h-4 inline ml-1 rtl:mr-1" />
                            {t('profile.edit.username')}
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={!isUsernameChangeAllowed}
                            className={`w-full px-4 py-2 border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent
                              ${!isUsernameChangeAllowed 
                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-75' 
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder={t('profile.edit.usernamePlaceholder')}
                            minLength={3}
                            maxLength={30}
                          />
                          
                          {/* ✅ عرض الأيام المتبقية لتغيير اسم المستخدم */}
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
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('profile.edit.usernameChangeNote')}
                          </p>
                        </div>

                        {/* البريد الإلكتروني */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Mail className="w-4 h-4 inline ml-1 rtl:mr-1" />
                            {t('profile.edit.email')}
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="email@example.com"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('profile.edit.emailNote')}
                          </p>
                        </div>

                        {/* رقم الهاتف */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Phone className="w-4 h-4 inline ml-1 rtl:mr-1" />
                            {t('profile.edit.phone')}
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="05XX XX XX XX"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('profile.edit.phoneNote')}
                          </p>
                        </div>

                        {/* السيرة الذاتية */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Briefcase className="w-4 h-4 inline ml-1 rtl:mr-1" />
                            {t('profile.edit.bio')}
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            placeholder={t('profile.edit.bioPlaceholder')}
                            maxLength={500}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
                            {formData.bio.length}/500
                          </p>
                        </div>

                        {/* الموقع */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <MapPin className="w-4 h-4 inline ml-1 rtl:mr-1" />
                            {t('profile.edit.location')}
                          </label>
                          
                          {formData.location && (
                            <div className="flex items-center justify-between rounded-lg p-2 mb-2 bg-primary-50 dark:bg-gray-700 border border-primary-200 dark:border-primary-800">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <MapPin className="w-4 h-4 text-primary-600" />
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
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
                            <div className="flex items-center border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
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
                              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* القسم 2: المعلومات المهنية - فقط للمحترفين */}
                {isProfessional && (
                  <motion.div 
                    initial={false}
                    animate={{ height: 'auto' }}
                    className="border-b border-gray-200 dark:border-gray-700 pb-6"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSection(selectedSection === 'professional' ? '' : 'professional')}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary-600" />
                        {t('steps.professional')}
                      </h2>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${selectedSection === 'professional' ? 'rotate-180' : ''}`} />
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
                          {/* الحرفة - لكل المحترفين */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <Wrench className="w-4 h-4 inline ml-1 rtl:mr-1" />
                              {t('professional.craft.label')}
                            </label>
                            
                            <div className="relative mb-4">
                              <button
                                type="button"
                                onClick={() => scrollCrafts('left')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              
                              <div 
                                ref={craftsContainerRef}
                                className="crafts-container flex overflow-x-auto scrollbar-hide rtl:space-x-reverse space-x-2 py-2 px-12"
                              >
                                {crafts.map((craft) => {
                                  const Icon = craft.icon;
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
                                      className={`craft-button flex-shrink-0 flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                                        ${formData.professionalInfo.craft === craft.id
                                          ? 'bg-primary-600 text-white'
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                      <Icon className={`craft-icon w-4 h-4 ${
                                        formData.professionalInfo.craft === craft.id
                                          ? 'text-white'
                                          : 'text-gray-500 dark:text-gray-400'
                                      }`} />
                                      {craft.name}
                                    </button>
                                  );
                                })}
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => scrollCrafts('right')}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* الخبرة - للحرفيين فقط */}
                          {isArtisan && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Clock className="w-4 h-4 inline ml-1 rtl:mr-1" />
                                {t('professional.experience.label')}
                              </label>
                              <div className="grid grid-cols-5 gap-2">
                                {experienceOptions.map((exp) => (
                                  <button
                                    key={exp.value}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        professionalInfo: {
                                          ...prev.professionalInfo,
                                          experience: exp.value
                                        }
                                      }));
                                    }}
                                    className={`experience-button py-2 px-1 rounded-lg text-sm font-medium transition-all
                                      ${formData.professionalInfo.experience === exp.value
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      }`}
                                  >
                                    {exp.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* السعر اليومي - للعمال فقط */}
                          {isWorker && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="2000"
                              />
                            </div>
                          )}

                          {/* المهارات - للعمال فقط */}
                          {isWorker && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Award className="w-4 h-4 inline ml-1 rtl:mr-1" />
                                {t('professional.skills.label')}
                              </label>
                              
                              <div className="relative mb-4">
                                <button
                                  type="button"
                                  onClick={() => scrollSkills('left')}
                                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
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
                                          ? 'bg-primary-600 text-white'
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
                                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                              
                              <p className="text-sm font-medium text-primary-600">
                                {t('professional.skills.selected', { count: formData.professionalInfo.skills.length })}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* القسم 3: إعدادات الخصوصية */}
                <motion.div 
                  initial={false}
                  animate={{ height: 'auto' }}
                  className="border-b border-gray-200 dark:border-gray-700 pb-6"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSection(selectedSection === 'privacy' ? '' : 'privacy')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary-600" />
                      {t('profile.edit.privacy')}
                    </h2>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${selectedSection === 'privacy' ? 'rotate-180' : ''}`} />
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
                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {t('profile.edit.showEmail')}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            name="privacy.showEmail"
                            checked={formData.privacy.showEmail}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {t('profile.edit.showPhone')}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            name="privacy.showPhone"
                            checked={formData.privacy.showPhone}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {t('profile.edit.showLocation')}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            name="privacy.showLocation"
                            checked={formData.privacy.showLocation}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {t('profile.edit.showOnlineStatus')}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            name="privacy.showOnlineStatus"
                            checked={formData.privacy.showOnlineStatus}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* أزرار التحكم */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingAvatar || !hasChanges()}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
                      ${!hasChanges() 
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>{t('common.saving')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{t('common.save')}</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;