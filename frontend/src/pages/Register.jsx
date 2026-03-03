import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  User, Mail, Lock, Phone, Briefcase, Users, CheckCircle,
  Eye, EyeOff, Info, Sparkles, Shield,
  MapPin, DollarSign, ArrowRight, ArrowLeft,
  TrendingUp, UserCheck, Calendar, Globe, Search,
  X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import registrationAnimation from '../assets/animations/steps-animation.json';

// Import craft icons from Font Awesome
import { 
  FaBolt, FaWrench, FaPaintBrush, FaHammer, FaTruck, FaBroom,
  FaSnowflake, FaWater, FaCouch, FaHardHat, FaTools, FaPlug,
  FaFire, FaLeaf, FaCrop, FaRuler, FaPencilRuler, FaPaintRoller,
  FaHome, FaBath, FaDoorOpen, FaWindowMaximize,
  FaSolarPanel, FaSatelliteDish, FaNetworkWired, FaLock,
  FaTree, FaMountain, FaSwimmingPool, FaGasPump, FaCar,
} from 'react-icons/fa';

// Import from Material Design Icons (only existing ones)
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

// Import from Game Icons (only existing ones)
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

// Import from Remix Icon (only available ones)
import { 
  RiHomeGearLine,
  RiPaintBrushLine,
} from 'react-icons/ri';

const Register = () => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAllCrafts, setShowAllCrafts] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    craft: '',
    experience: '',
    location: '', // تغيير من serviceArea إلى location (ولاية واحدة)
    dailyRate: '',
    skills: [],
    acceptTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Change language function
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    setShowLanguageMenu(false);
  };

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' }
  ];

  // جميع الولايات الجزائرية (58 ولاية)
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

  // تصفية المدن حسب البحث
  const filteredCities = algerianCities.filter(city => 
    city.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  // Crafts list with icons (جميع الأيقونات متوفرة الآن)
  const crafts = [
    // الحرف الأساسية
    { id: 'electrician', name: 'كهربائي', icon: FaBolt, category: 'basic' },
    { id: 'plumber', name: 'سباك', icon: FaWater, category: 'basic' },
    { id: 'carpenter', name: 'نجار', icon: FaHammer, category: 'basic' },
    { id: 'painter', name: 'دهان', icon: FaPaintBrush, category: 'basic' },
    { id: 'mason', name: 'بناء', icon: FaHardHat, category: 'basic' },
    { id: 'mover', name: 'ناقل أثاث', icon: FaTruck, category: 'basic' },
    { id: 'cleaner', name: 'عامل نظافة', icon: FaBroom, category: 'basic' },
    { id: 'ac_technician', name: 'تكييف وتبريد', icon: FaSnowflake, category: 'basic' },
    { id: 'tiler', name: 'بلاط', icon: FaRuler, category: 'basic' },
    { id: 'blacksmith', name: 'حداد', icon: FaFire, category: 'basic' },
    { id: 'gardener', name: 'بستاني', icon: FaLeaf, category: 'basic' },
    { id: 'handyman', name: 'عامل صيانة', icon: FaTools, category: 'basic' },
    
    // الحرف المتخصصة
    { id: 'cabinet_maker', name: 'صانع خزائن', icon: FaCouch, category: 'specialized' },
    { id: 'upholsterer', name: 'مفروشات', icon: FaCouch, category: 'specialized' },
    { id: 'glass_worker', name: 'زجاج ومرايا', icon: GiGlassCelebration, category: 'specialized' },
    { id: 'flooring_specialist', name: 'أرضيات وباركيه', icon: FaRuler, category: 'specialized' },
    { id: 'facade_worker', name: 'واجهات المباني', icon: FaHome, category: 'specialized' },
    { id: 'roofer', name: 'أسقف وعزل', icon: MdOutlineRoofing, category: 'specialized' },
    { id: 'kitchen_installer', name: 'تركيب مطابخ', icon: MdOutlineKitchen, category: 'specialized' },
    { id: 'bathroom_installer', name: 'تركيب حمامات', icon: FaBath, category: 'specialized' },
    
    // حرف الكهرباء والإلكترونيات
    { id: 'solar_installer', name: 'تركيب ألواح شمسية', icon: MdOutlineSolarPower, category: 'electronics' },
    { id: 'electronics_repair', name: 'إصلاح إلكترونيات', icon: MdOutlineSmartphone, category: 'electronics' },
    { id: 'security_systems', name: 'أنظمة أمنية', icon: MdOutlineSecurity, category: 'electronics' },
    { id: 'network_tech', name: 'شبكات وإنترنت', icon: FaNetworkWired, category: 'electronics' },
    { id: 'satellite_installer', name: 'تركيب أطباق لاقطة', icon: FaSatelliteDish, category: 'electronics' },
    { id: 'cctv_installer', name: 'كاميرات مراقبة', icon: GiCctvCamera, category: 'electronics' },
    { id: 'smart_home_tech', name: 'منزل ذكي', icon: RiHomeGearLine, category: 'electronics' },
    
    // حرف متقدمة
    { id: 'hvac_tech', name: 'تدفئة وتبريد مركزي', icon: FaSnowflake, category: 'advanced' },
    { id: 'elevator_tech', name: 'مصاعد وسلالم', icon: GiElevator, category: 'advanced' },
    { id: 'pool_tech', name: 'مسابح ونوافير', icon: FaSwimmingPool, category: 'advanced' },
    { id: 'gas_tech', name: 'غاز طبيعي', icon: FaGasPump, category: 'advanced' },
    { id: 'auto_electrician', name: 'كهربائي سيارات', icon: GiAutoRepair, category: 'advanced' },
    { id: 'generator_tech', name: 'مولدات كهربائية', icon: GiGearHammer, category: 'advanced' },
    
    // حرف التصميم والديكور
    { id: 'interior_designer', name: 'مصمم داخلي', icon: MdOutlineDesignServices, category: 'design' },
    { id: 'decorator', name: 'ديكور', icon: RiPaintBrushLine, category: 'design' },
    { id: 'landscape_designer', name: 'تنسيق حدائق', icon: GiPlantsAndAnimals, category: 'design' },
    { id: 'stone_cutter', name: 'نحت على الحجر', icon: GiStoneCrafting, category: 'design' },
    { id: 'wood_carver', name: 'نقش على الخشب', icon: GiWoodCabin, category: 'design' },
    
    // حرف البناء والتشييد
    { id: 'foundation_worker', name: 'أساسات وخرسانة', icon: MdOutlineConstruction, category: 'construction' },
    { id: 'steel_fixer', name: 'حديد تسليح', icon: FaTools, category: 'construction' },
    { id: 'plasterer', name: 'جبس وجص', icon: FaPaintRoller, category: 'construction' },
    { id: 'window_installer', name: 'تركيب نوافذ', icon: FaWindowMaximize, category: 'construction' },
    { id: 'door_installer', name: 'تركيب أبواب', icon: FaDoorOpen, category: 'construction' },
    
    // حرف الصيانة
    { id: 'appliance_repair', name: 'إصلاح أجهزة', icon: FaTools, category: 'maintenance' },
    { id: 'furniture_repair', name: 'إصلاح أثاث', icon: FaCouch, category: 'maintenance' },
    { id: 'pest_control', name: 'مكافحة حشرات', icon: GiPlantsAndAnimals, category: 'maintenance' },
    { id: 'water_tank_cleaner', name: 'تنظيف خزانات', icon: GiWaterTank, category: 'maintenance' }
  ];

  // Role options
  const roleOptions = [
    { 
      value: 'client', 
      label: t('roles.client'),
      icon: User,
      description: t('roles.clientDesc'),
      features: [
        t('features.client1'),
        t('features.client2'),
        t('features.client3'),
        t('features.client4')
      ]
    },
    { 
      value: 'artisan', 
      label: t('roles.artisan'),
      icon: Briefcase,
      description: t('roles.artisanDesc'),
      features: [
        t('features.artisan1'),
        t('features.artisan2'),
        t('features.artisan3'),
        t('features.artisan4')
      ]
    },
    { 
      value: 'worker', 
      label: t('roles.worker'),
      icon: Users,
      description: t('roles.workerDesc'),
      features: [
        t('features.worker1'),
        t('features.worker2'),
        t('features.worker3'),
        t('features.worker4')
      ]
    }
  ];

  // Experience options
  const experienceOptions = [
    { value: '0-1', label: t('experience.lessThanYear') },
    { value: '1-3', label: t('experience.1to3') },
    { value: '3-5', label: t('experience.3to5') },
    { value: '5-10', label: t('experience.5to10') },
    { value: '10+', label: t('experience.moreThan10') }
  ];

  // Worker skills
  const workerSkills = [
    'تحميل وتفريغ', 'تنظيف', 'تنظيم',
    'تعبئة', 'تغليف', 'بناء',
    'زراعة', 'دهان', 'تركيب أثاث',
    'نقل', 'تجميع', 'إصلاح'
  ];

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // دالة لاختيار ولاية واحدة فقط
  const selectLocation = (city) => {
    setFormData(prev => ({
      ...prev,
      location: city // يتم تعيين ولاية واحدة فقط
    }));
    setShowCityDropdown(false);
    setSearchTerm('');
  };

  // إزالة الولاية المختارة
  const removeLocation = () => {
    setFormData(prev => ({
      ...prev,
      location: ''
    }));
  };

  const validateStep = () => {
    switch(step) {
      case 1:
        return formData.role;
      case 2:
        return formData.name && formData.email && formData.phone;
      case 3:
        return formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword && 
               formData.password.length >= 6;
      case 4:
        // كل الأدوار يجب أن تختار ولاية
        if (!formData.location) return false;
        
        if (formData.role === 'client') return true;
        if (formData.role === 'artisan') {
          return formData.craft && formData.experience;
        }
        if (formData.role === 'worker') {
          return formData.dailyRate && formData.skills.length > 0;
        }
        return false;
      case 5:
        return formData.acceptTerms;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    } else {
      toast.error(t('messages.fillRequired'));
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success(t('messages.accountCreated'));
      navigate('/verify-phone');
    }, 2000);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return t('password.weak');
    if (passwordStrength < 70) return t('password.medium');
    return t('password.strong');
  };

  // Step indicators data
  const steps = [
    { number: 1, title: t('steps.accountType'), icon: Users },
    { number: 2, title: t('steps.basicInfo'), icon: User },
    { number: 3, title: t('steps.security'), icon: Shield },
    { number: 4, title: t('steps.professional'), icon: Briefcase },
    { number: 5, title: t('steps.confirmation'), icon: CheckCircle }
  ];

  // الحصول على الحرف المعروضة (كلها أو المقتطعة)
  const displayedCrafts = showAllCrafts ? crafts : crafts.slice(0, 12);

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            <Globe className="w-4 h-4" />
            <span>{languages.find(lang => lang.code === i18n.language)?.name || 'English'}</span>
          </button>
          
          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2 rtl:space-x-reverse ${
                    i18n.language === lang.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span>{lang.name}</span>
                  {i18n.language === lang.code && (
                    <CheckCircle className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex w-full h-full">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto scrollbar-hide">
          <div className="min-h-full flex items-center justify-center p-4 lg:p-6">
            <div className="w-full max-w-xl py-4">
              {/* Steps Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  {steps.map((s, index) => {
                    const StepIcon = s.icon;
                    const isActive = step >= s.number;
                    const isCompleted = step > s.number;
                    
                    return (
                      <React.Fragment key={s.number}>
                        <div className="flex flex-col items-center relative">
                          <motion.div
                            animate={{ scale: step === s.number ? 1.05 : 1 }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                              ${isActive 
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                              }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <StepIcon className="w-4 h-4" />
                            )}
                          </motion.div>
                          <span className={`text-[10px] mt-1 font-medium hidden lg:block
                            ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {s.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500
                            ${step > s.number ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Step 1: Account Type */}
                    {step === 1 && (
                      <div className="space-y-3">
                        <div className="text-center mb-3">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t('steps.accountType')}
                          </h2>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {t('register.roleDesc')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {roleOptions.map((role) => {
                            const Icon = role.icon;
                            const isSelected = formData.role === role.value;
                            
                            return (
                              <motion.label
                                key={role.value}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={`block cursor-pointer relative overflow-hidden rounded-lg border transition-all duration-300
                                  ${isSelected 
                                    ? 'border-primary-600 bg-primary-50 dark:bg-gray-700'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
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
                                
                                <div className="p-3">
                                  <div className={`flex items-start ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} space-x-2 rtl:space-x-reverse`}>
                                    <div className={`p-2 rounded-lg ${
                                      isSelected 
                                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                    }`}>
                                      <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1">
                                      <h3 className={`text-sm font-bold ${
                                        isSelected ? 'text-primary-600' : 'text-gray-900 dark:text-white'
                                      }`}>
                                        {role.label}
                                      </h3>
                                      
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {role.description}
                                      </p>

                                      <div className="grid grid-cols-2 gap-1 mt-1">
                                        {role.features.map((feature, idx) => (
                                          <div key={idx} className="flex items-center space-x-1 rtl:space-x-reverse">
                                            <CheckCircle className={`w-2.5 h-2.5 ${
                                              isSelected ? 'text-primary-600' : 'text-gray-400'
                                            }`} />
                                            <span className="text-[10px] text-gray-600 dark:text-gray-400">{feature}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {isSelected && (
                                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Basic Info */}
                    {step === 2 && (
                      <div className="space-y-3">
                        <div className="text-center mb-2">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t('steps.basicInfo')}
                          </h2>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {t('register.basicInfoDesc')}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {/* Name Input */}
                          <div className="relative">
                            <div className={`absolute ${i18n.language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2`}>
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full ${i18n.language === 'ar' ? 'pl-8 pr-3' : 'pr-8 pl-3'} py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-600 outline-none`}
                              placeholder={t('fields.fullName')}
                              required
                            />
                          </div>

                          {/* Email Input */}
                          <div className="relative">
                            <div className={`absolute ${i18n.language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2`}>
                              <Mail className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full ${i18n.language === 'ar' ? 'pl-8 pr-3' : 'pr-8 pl-3'} py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-600 outline-none`}
                              placeholder={t('fields.email')}
                              required
                            />
                          </div>

                          {/* Phone Input */}
                          <div className="relative">
                            <div className={`absolute ${i18n.language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2`}>
                              <Phone className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className={`w-full ${i18n.language === 'ar' ? 'pl-8 pr-3' : 'pr-8 pl-3'} py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-600 outline-none`}
                              placeholder={t('fields.phone')}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Security */}
                    {step === 3 && (
                      <div className="space-y-3">
                        <div className="text-center mb-2">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t('steps.security')}
                          </h2>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {t('register.securityDesc')}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {/* Password Input */}
                          <div className="relative">
                            <div className={`absolute ${i18n.language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2`}>
                              <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className={`w-full ${i18n.language === 'ar' ? 'pl-8 pr-8' : 'pr-8 pl-8'} py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-600 outline-none`}
                              placeholder={t('fields.password')}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`absolute ${i18n.language === 'ar' ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 text-gray-400`}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Password Strength */}
                          {formData.password && (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500">
                                  {t('password.strength')}:
                                </span>
                                <span className={`text-[10px] font-medium ${
                                  passwordStrength < 40 ? 'text-red-500' : 
                                  passwordStrength < 70 ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                  {getPasswordStrengthText()}
                                </span>
                              </div>
                              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${passwordStrength}%` }}
                                  className={`h-full ${getPasswordStrengthColor()}`}
                                />
                              </div>
                            </div>
                          )}

                          {/* Confirm Password */}
                          <div className="relative">
                            <div className={`absolute ${i18n.language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2`}>
                              <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`w-full ${i18n.language === 'ar' ? 'pl-8 pr-8' : 'pr-8 pl-8'} py-2 text-sm bg-gray-50 dark:bg-gray-700 border rounded-lg outline-none
                                ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                  ? 'border-red-500'
                                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-600'
                                }`}
                              placeholder={t('fields.confirmPassword')}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className={`absolute ${i18n.language === 'ar' ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 text-gray-400`}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Professional Info */}
                    {step === 4 && formData.role && (
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
                        <div className="text-center mb-2 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-1">
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {formData.role === 'client' ? t('steps.additionalInfo') : 
                             formData.role === 'artisan' ? t('steps.professionalInfo') : t('steps.workInfo')}
                          </h2>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formData.role === 'client' && t('register.clientInfoDesc')}
                            {formData.role === 'artisan' && t('register.artisanInfoDesc')}
                            {formData.role === 'worker' && t('register.workerInfoDesc')}
                          </p>
                        </div>

                        {/* Location Selection - لجميع الأدوار */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              <MapPin className="w-3 h-3" />
                              <span>الولاية *</span>
                            </div>
                          </label>
                          
                          {formData.location && (
                            <div className="flex items-center justify-between bg-primary-50 dark:bg-gray-700 border border-primary-200 dark:border-primary-800 rounded-lg p-2 mb-2">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <MapPin className="w-4 h-4 text-primary-600" />
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
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
                            <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                              <Search className={`w-3 h-3 ${i18n.language === 'ar' ? 'mr-2' : 'ml-2'} text-gray-400`} />
                              <input
                                type="text"
                                placeholder="ابحث عن ولايتك..."
                                value={searchTerm}
                                onChange={(e) => {
                                  setSearchTerm(e.target.value);
                                  setShowCityDropdown(true);
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                className="flex-1 py-2 px-2 text-sm bg-transparent outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCityDropdown(!showCityDropdown)}
                                className={`p-1 ${i18n.language === 'ar' ? 'ml-1' : 'mr-1'}`}
                              >
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                            
                            {showCityDropdown && (
                              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredCities.length > 0 ? (
                                  filteredCities.map(city => (
                                    <button
                                      key={city}
                                      type="button"
                                      onClick={() => selectLocation(city)}
                                      className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between
                                        ${formData.location === city ? 'bg-primary-50 dark:bg-gray-700 text-primary-600' : 'text-gray-700 dark:text-gray-200'}`}
                                    >
                                      <span>{city}</span>
                                      {formData.location === city && (
                                        <CheckCircle className="w-4 h-4 text-primary-600" />
                                      )}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-500">لا توجد نتائج</div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-gray-500 mt-1">اختر ولايتك التي تعمل/تسكن فيها</p>
                        </div>

                        {/* Client Section */}
                        {formData.role === 'client' && (
                          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 text-center">
                            <User className="w-12 h-12 mx-auto text-primary-600 dark:text-primary-400 mb-2" />
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                              {t('register.welcomeClient')}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {t('register.clientContinue')}
                            </p>
                          </div>
                        )}

                        {/* Artisan Section */}
                        {formData.role === 'artisan' && (
                          <div className="space-y-3">
                            {/* Craft Selection */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('fields.selectCraft')} *
                              </label>
                              
                              <div className="grid grid-cols-3 gap-1">
                                {displayedCrafts.map((craft) => {
                                  const Icon = craft.icon;
                                  const isSelected = formData.craft === craft.id;
                                  
                                  return (
                                    <button
                                      key={craft.id}
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, craft: craft.id }))}
                                      className={`p-1.5 rounded border text-[10px] flex flex-col items-center transition-all
                                        ${isSelected 
                                          ? 'border-primary-600 bg-primary-50 dark:bg-gray-700 text-primary-600'
                                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                        }`}
                                    >
                                      <Icon className="w-3 h-3 mb-0.5" />
                                      <span className="truncate w-full text-center">{craft.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {!showAllCrafts && crafts.length > 12 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllCrafts(true)}
                                  className="w-full mt-2 py-1 text-xs text-primary-600 border border-dashed border-primary-300 rounded-lg hover:bg-primary-50"
                                >
                                  + عرض {crafts.length - 12} حرفة إضافية
                                </button>
                              )}
                            </div>

                            {/* Experience */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('fields.experience')} *
                              </label>
                              <div className="grid grid-cols-5 gap-1">
                                {experienceOptions.map((exp) => (
                                  <button
                                    key={exp.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, experience: exp.value }))}
                                    className={`py-1 px-1 rounded text-[9px] font-medium
                                      ${formData.experience === exp.value
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                      }`}
                                  >
                                    {exp.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Worker Section */}
                        {formData.role === 'worker' && (
                          <div className="space-y-3">
                            {/* Daily Rate */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('fields.dailyRate')} *
                              </label>
                              <div className="relative">
                                <DollarSign className={`absolute ${i18n.language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400`} />
                                <input
                                  type="number"
                                  name="dailyRate"
                                  value={formData.dailyRate}
                                  onChange={handleChange}
                                  className={`w-full ${i18n.language === 'ar' ? 'pl-8' : 'pr-8'} py-1.5 px-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none`}
                                  placeholder="السعر اليومي"
                                />
                              </div>
                            </div>

                            {/* Skills */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('fields.skills')} *
                              </label>
                              <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto scrollbar-hide">
                                {workerSkills.map((skill) => (
                                  <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleMultiSelect('skills', skill)}
                                    className={`py-1 px-1.5 rounded text-[10px] font-medium truncate
                                      ${formData.skills.includes(skill)
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                      }`}
                                  >
                                    {skill}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Availability */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('fields.availability')}
                              </label>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-1.5">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <select className="flex-1 bg-transparent outline-none text-xs">
                                  <option>كل الأيام</option>
                                  <option>أيام العمل</option>
                                  <option>نهاية الأسبوع</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 5: Confirmation */}
                    {step === 5 && (
                      <div className="space-y-3">
                        <div className="text-center mb-2">
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {t('steps.confirmation')}
                          </h2>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('register.confirmationDesc')}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('fields.fullName')}</p>
                              <p className="font-medium truncate">{formData.name}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('fields.email')}</p>
                              <p className="font-medium truncate">{formData.email}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('fields.phone')}</p>
                              <p className="font-medium">{formData.phone}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">الولاية</p>
                              <p className="font-medium truncate">{formData.location || 'لم يتم التحديد'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('fields.accountType')}</p>
                              <p className="font-medium truncate">
                                {roleOptions.find(r => r.value === formData.role)?.label}
                              </p>
                            </div>
                          </div>
                        </div>

                        <label className={`flex items-start ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} space-x-2 rtl:space-x-reverse`}>
                          <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            className="mt-0.5 w-3 h-3"
                          />
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">
                            {t('register.agreeTo')}{' '}
                            <Link to="/terms" className="text-primary-600 hover:underline">الشروط</Link>
                            {' '}{t('common.and')}{' '}
                            <Link to="/privacy" className="text-primary-600 hover:underline">الخصوصية</Link>
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className={`flex ${step > 1 ? 'space-x-2' : ''} rtl:space-x-reverse pt-2`}>
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium flex items-center justify-center space-x-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>{t('buttons.previous')}</span>
                        </button>
                      )}
                      
                      {step < 5 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          disabled={!validateStep()}
                          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          <span>{t('buttons.next')}</span>
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{t('buttons.creating')}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>{t('buttons.createAccount')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>

              {/* Login Link */}
              <div className="text-center mt-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('register.haveAccount')}{' '}
                  <Link to="/login" className="text-primary-600 hover:underline font-medium">
                    {t('buttons.login')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Animation */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float animation-delay-2000" />
          </div>

          <div className="relative z-10 w-full max-w-sm px-4">
            <Lottie 
              animationData={registrationAnimation}
              loop={true}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;