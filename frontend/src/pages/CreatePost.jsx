// frontend/src/pages/CreatePost.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import {
  Briefcase, Wrench, MapPin,
  Image, Trash2, Send, Loader, Upload,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Sparkles, FileText, User
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
        return 'service_request';
      case 'artisan':
        return 'job_opportunity';
      case 'both':
        return 'service_request';
      default:
        return 'service_request';
    }
  };
  
  const [postType, setPostType] = useState(getInitialPostType);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    location: user?.location || ''
  });
  
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
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
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة فقط');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  };
  
  const handleRemoveImage = () => {
    setImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        location: formData.location,
        type: postType
      };
      
      const result = await createPost(postData, imageFile);
      
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
          <span className="text-gray-600 dark:text-gray-400">الصورة</span>
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
                {formData.description.length} / 2000
              </p>
            </div>
          </div>
        )}
        
        {/* Step 2: Job Details - فقط الميزانية والموقع */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        
        {/* Step 3: Image فقط */}
        {currentStep === 3 && (
          <div className="p-6 space-y-6">
            {/* Image - صورة واحدة فقط */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Image className="w-4 h-4 inline ml-1" />
                الصورة
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">(اختياري)</span>
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  image 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Upload className={`w-12 h-12 mx-auto mb-3 ${
                  image ? 'text-primary-500' : 'text-gray-400'
                }`} />
                <p className="text-gray-600 dark:text-gray-400">
                  {image ? 'صورة مرفوعة' : 'انقر لرفع الصورة أو اسحبها هنا'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  يمكنك رفع صورة واحدة فقط، حجم الصورة لا يتجاوز 5MB
                </p>
              </div>
              
              {/* عرض الصورة المرفوعة */}
              {image && (
                <div className="mt-4">
                  <div className="relative group inline-block">
                    <img
                      src={image}
                      alt="Uploaded"
                      className="w-48 h-48 object-cover rounded-xl shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
            {image && (
              <div className="mt-3">
                <img src={image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CreatePost;