// frontend/src/pages/CreatePost.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import {
  Briefcase, Wrench, DollarSign, MapPin, Clock,
  Image, X, Plus, Trash2, Send, Loader, Upload,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Award, Star, Sparkles, FileText, User, Info
} from 'lucide-react';

const CreatePost = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, createPost } = useStore();
  
  // تحديد نوع البوست الأولي بناءً على نوع المستخدم
  const getInitialPostType = () => {
    if (!user) return 'service_request';
    
    switch(user.role) {
      case 'client':
        return 'service_request'; // عميل -> طلب خدمة
      case 'artisan':
        return 'job_opportunity'; // حرفي -> فرصة عمل
      case 'both':
        return 'service_request'; // كليهما -> افتراضي طلب خدمة
      default:
        return 'service_request';
    }
  };
  
  const [postType, setPostType] = useState(getInitialPostType);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    duration: 'one_day',
    customDuration: '',
    location: user?.location || '',
    requiredSkills: []
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  // التحقق مما إذا كان المستخدم يمكنه تغيير نوع البوست
  const canChangePostType = () => {
    return user?.role === 'both';
  };
  
  const categories = {
    service_request: [
      { value: 'construction', label: 'بناء وتشطيب', icon: '🏗️', color: 'bg-orange-100 text-orange-700' },
      { value: 'plumbing', label: 'سباكة', icon: '🚰', color: 'bg-blue-100 text-blue-700' },
      { value: 'electrical', label: 'كهرباء', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'painting', label: 'دهان', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
      { value: 'carpentry', label: 'نجارة', icon: '🪵', color: 'bg-amber-100 text-amber-700' },
      { value: 'ac_maintenance', label: 'تكييف وتبريد', icon: '❄️', color: 'bg-cyan-100 text-cyan-700' },
      { value: 'cleaning', label: 'تنظيف', icon: '🧹', color: 'bg-emerald-100 text-emerald-700' },
      { value: 'gardening', label: 'حدائق', icon: '🌿', color: 'bg-green-100 text-green-700' },
      { value: 'moving', label: 'نقل أثاث', icon: '🚚', color: 'bg-indigo-100 text-indigo-700' },
      { value: 'other', label: 'أخرى', icon: '📦', color: 'bg-gray-100 text-gray-700' }
    ],
    job_opportunity: [
      { value: 'construction_worker', label: 'عامل بناء', icon: '👷', color: 'bg-orange-100 text-orange-700' },
      { value: 'painter', label: 'دهان', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
      { value: 'plumber_assistant', label: 'مساعد سباك', icon: '🔧', color: 'bg-blue-100 text-blue-700' },
      { value: 'electrician_assistant', label: 'مساعد كهربائي', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'cleaner', label: 'عامل نظافة', icon: '🧼', color: 'bg-emerald-100 text-emerald-700' },
      { value: 'gardener', label: 'بستاني', icon: '🌱', color: 'bg-green-100 text-green-700' },
      { value: 'mover', label: 'عامل نقل', icon: '📦', color: 'bg-indigo-100 text-indigo-700' },
      { value: 'general_labor', label: 'عامل عام', icon: '🛠️', color: 'bg-gray-100 text-gray-700' },
      { value: 'other', label: 'أخرى', icon: '📌', color: 'bg-gray-100 text-gray-700' }
    ]
  };
  
  const durations = [
    { value: 'one_day', label: 'يوم واحد', icon: '☀️' },
    { value: 'one_week', label: 'أسبوع', icon: '📅' },
    { value: 'one_month', label: 'شهر', icon: '📆' },
    { value: 'custom', label: 'مدة مخصصة', icon: '⚙️' }
  ];
  
  // تحديث الموقع تلقائياً من بيانات المستخدم
  useEffect(() => {
    if (user?.location && !formData.location) {
      setFormData(prev => ({ ...prev, location: user.location }));
    }
  }, [user]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [formData.description]);
  
  const validateStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'العنوان مطلوب';
      } else if (formData.title.length < 5) {
        newErrors.title = 'العنوان يجب أن يكون 5 أحرف على الأقل';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'الوصف مطلوب';
      } else if (formData.description.length < 20) {
        newErrors.description = 'الوصف يجب أن يكون 20 حرفاً على الأقل';
      }
    }
    
    if (currentStep === 2) {
      if (!formData.category) {
        newErrors.category = 'الرجاء اختيار الفئة';
      }
      
      if (!formData.budget || parseFloat(formData.budget) <= 0) {
        newErrors.budget = 'الميزانية غير صالحة';
      } else if (parseFloat(formData.budget) < 1000) {
        newErrors.budget = 'الميزانية يجب أن تكون 1000 دج على الأقل';
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'الموقع مطلوب';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  };
  
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 5) {
      toast.error('يمكنك رفع 5 صور كحد أقصى');
      return;
    }
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملفات صور فقط');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً. الحد الأقصى 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
        setImageFiles(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };
  
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!validateStep()) {
      setCurrentStep(2);
      toast.error('يرجى إكمال جميع الحقول المطلوبة');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const postData = {
        ...formData,
        budget: parseFloat(formData.budget),
        type: postType
      };
      
      const result = await createPost(postData, imageFiles);
      
      if (result.success) {
        toast.success('تم إنشاء البوست بنجاح!');
        navigate(`/post/${result.data._id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'فشل إنشاء البوست');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getCategoryIcon = (categoryValue) => {
    const allCategories = [...categories.service_request, ...categories.job_opportunity];
    const cat = allCategories.find(c => c.value === categoryValue);
    return cat?.icon || '📌';
  };
  
  const getUserRoleText = () => {
    switch(user?.role) {
      case 'client':
        return 'عميل';
      case 'artisan':
        return 'حرفي';
      case 'both':
        return 'عميل وحرفي';
      default:
        return '';
    }
  };
  
  const getPostTypeInfo = () => {
    if (postType === 'service_request') {
      return {
        title: 'طلب خدمة',
        description: 'أنت تبحث عن حرفي لتنفيذ خدمة معينة',
        icon: Briefcase,
        color: 'text-primary-600'
      };
    } else {
      return {
        title: 'فرصة عمل',
        description: 'أنت تبحث عن عمال أو مساعدين للعمل معك',
        icon: Wrench,
        color: 'text-primary-600'
      };
    }
  };
  
  const postTypeInfo = getPostTypeInfo();
  const PostTypeIcon = postTypeInfo.icon;
  
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-600" />
          إنشاء بوست جديد
        </h1>
        <div className="mt-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              أنت تقوم بالنشر كـ: 
              <span className="font-semibold text-primary-600 mx-1">{getUserRoleText()}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role === 'client' && 'يمكنك فقط إنشاء طلبات خدمة'}
              {user?.role === 'artisan' && 'يمكنك فقط إنشاء فرص عمل'}
              {user?.role === 'both' && 'يمكنك إنشاء طلبات خدمة وفرص عمل'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 relative">
              <div className="flex items-center justify-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
              </div>
              <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                {step < 3 && (
                  <div className={`h-full transition-all duration-300 ${
                    currentStep > step 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">المعلومات الأساسية</span>
          <span className="text-gray-600 dark:text-gray-400">تفاصيل العمل</span>
          <span className="text-gray-600 dark:text-gray-400">الصور والمهارات</span>
        </div>
      </div>
      
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Type Selection - Only show if user can change post type */}
        {canChangePostType() && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              اختر نوع البوست
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setPostType('service_request')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  postType === 'service_request'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span>طلب خدمة</span>
              </button>
              <button
                onClick={() => setPostType('job_opportunity')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  postType === 'job_opportunity'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <Wrench className="w-5 h-5" />
                <span>فرصة عمل</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Show post type indicator if user cannot change type */}
        {!canChangePostType() && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <PostTypeIcon className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {postTypeInfo.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {postTypeInfo.description}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان البوست *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={postType === 'service_request' 
                  ? 'مثال: أحتاج كهربائي لتركيب أسلاك المنزل'
                  : 'مثال: مطلوب عمال مساعدين لمشروع بناء'}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all ${
                  errors.title 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف العمل *
              </label>
              <textarea
                ref={textareaRef}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="صف العمل المطلوب بالتفصيل... (الموقع، الوقت، المتطلبات)"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-all ${
                  errors.description 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length} / 2000 حرف
              </p>
            </div>
          </div>
        )}
        
        {/* Step 2: Job Details */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الفئة *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {categories[postType].map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, category: cat.value }));
                        setErrors(prev => ({ ...prev, category: '' }));
                      }}
                      className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        formData.category === cat.value
                          ? `${cat.color} ring-2 ring-primary-500 scale-105`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>
              
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  الميزانية (دج) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="المبلغ بالدينار الجزائري"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.budget ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-500">{errors.budget}</p>
                )}
              </div>
              
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline ml-1" />
                  المدة *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {durations.map(dur => (
                    <button
                      key={dur.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration: dur.value }))}
                      className={`p-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                        formData.duration === dur.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>{dur.icon}</span>
                      <span>{dur.label}</span>
                    </button>
                  ))}
                </div>
                
                {formData.duration === 'custom' && (
                  <input
                    type="text"
                    name="customDuration"
                    value={formData.customDuration}
                    onChange={handleInputChange}
                    placeholder="مثال: 3 أيام، أسبوعين..."
                    className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                )}
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  الموقع *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="الولاية أو المدينة"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Images & Skills */}
        {currentStep === 3 && (
          <div className="p-6 space-y-6">
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Award className="w-4 h-4 inline ml-1" />
                المهارات المطلوبة
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">(اختياري)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="أضف مهارة مطلوبة"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.requiredSkills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-500 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Image className="w-4 h-4 inline ml-1" />
                الصور
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">(اختياري)</span>
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  images.length > 0 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Upload className={`w-12 h-12 mx-auto mb-3 ${
                  images.length > 0 ? 'text-primary-500' : 'text-gray-400'
                }`} />
                <p className="text-gray-600 dark:text-gray-400">
                  {images.length > 0 ? `${images.length} صورة مرفوعة` : 'انقر لرفع الصور أو اسحبها هنا'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  يمكنك رفع 5 صور كحد أقصى، حجم كل صورة لا يتجاوز 5MB
                </p>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              السابق
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              التالي
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>نشر البوست</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Preview Card */}
      {formData.title && formData.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            معاينة البوست
          </h3>
          <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-2 mb-3">
              <img
                src={user?.profileImage || 'https://via.placeholder.com/40'}
                alt={user?.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('ar-DZ')}</p>
              </div>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{formData.title}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{formData.description}</p>
            {formData.category && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(formData.category)}</span>
                <span className="text-xs text-gray-500">{formData.category}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CreatePost;