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

// إضافة CSS مخصص لصفحة إنشاء البوست
const createPostStyle = document.createElement('style');
createPostStyle.textContent = `
  /* ==================== الوضع الفاتح ==================== */
  .createpost-glass-card {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(12px);
    border-radius: 32px;
    border: 1px solid rgba(203, 213, 225, 0.5);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  }
  
  .createpost-preview-card {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(8px);
    border-radius: 28px;
    border: 1px solid rgba(203, 213, 225, 0.6);
    transition: all 0.3s ease;
  }
  
  .createpost-input {
    background: rgba(243, 244, 246, 0.8) !important;
    border: 1px solid rgba(203, 213, 225, 0.5);
    border-radius: 16px;
    transition: all 0.3s ease;
  }
  
  .createpost-input:focus {
    background: rgba(255, 255, 255, 1) !important;
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .createpost-upload-area {
    background: rgba(255, 255, 255, 0.7) !important;
    border: 2px dashed rgba(203, 213, 225, 0.6);
    border-radius: 20px;
    transition: all 0.3s ease;
  }
  
  .createpost-upload-area:hover {
    border-color: #2563eb !important;
    background: rgba(255, 255, 255, 0.9) !important;
  }
  
  .createpost-upload-area-active {
    border-color: #2563eb !important;
    background: rgba(37, 99, 235, 0.05) !important;
  }
  
  .createpost-step-circle {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(203, 213, 225, 0.5);
  }
  
  .createpost-step-circle-active {
    background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
    border: none;
  }
  
  .createpost-step-line {
    background: rgba(203, 213, 225, 0.5);
  }
  
  .createpost-step-line-active {
    background: linear-gradient(90deg, #2563eb, #3b82f6);
  }
  
  .createpost-info-badge {
    background: rgba(59, 130, 246, 0.1) !important;
    border-radius: 16px;
  }
  
  /* ==================== الوضع المظلم ==================== */
  .dark .createpost-glass-card {
    background: rgba(17, 24, 39, 0.75) !important;
    border-color: rgba(75, 85, 99, 0.4);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  .dark .createpost-preview-card {
    background: rgba(31, 41, 55, 0.7) !important;
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .dark .createpost-input {
    background: rgba(55, 65, 81, 0.8) !important;
    border-color: rgba(75, 85, 99, 0.5);
    color: #ffffff !important;
  }
  
  .dark .createpost-input:focus {
    background: rgba(55, 65, 81, 1) !important;
    border-color: #3b82f6 !important;
  }
  
  .dark .createpost-upload-area {
    background: rgba(31, 41, 55, 0.6) !important;
    border-color: rgba(75, 85, 99, 0.4);
  }
  
  .dark .createpost-upload-area:hover {
    background: rgba(31, 41, 55, 0.85) !important;
    border-color: #3b82f6 !important;
  }
  
  .dark .createpost-step-circle {
    background: rgba(31, 41, 55, 0.8) !important;
    border-color: rgba(75, 85, 99, 0.4);
    color: #ffffff !important;
  }
  
  .dark .createpost-info-badge {
    background: rgba(59, 130, 246, 0.15) !important;
  }
  
  /* النصوص */
  .createpost-glass-card *,
  .createpost-preview-card * {
    color: #000000 !important;
  }
  
  .dark .createpost-glass-card *,
  .dark .createpost-preview-card * {
    color: #ffffff !important;
  }
  
  .createpost-glass-card .text-gray-500,
  .createpost-glass-card .text-gray-400 {
    color: #6b7280 !important;
  }
  
  .dark .createpost-glass-card .text-gray-500,
  .dark .createpost-glass-card .text-gray-400 {
    color: #9ca3af !important;
  }
`;
document.head.appendChild(createPostStyle);

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
        newErrors.title = t('createPost.errors.titleRequired');
      } else if (formData.title.length < 5) {
        newErrors.title = t('createPost.errors.titleMinLength');
      }
      
      if (!formData.description.trim()) {
        newErrors.description = t('createPost.errors.descriptionRequired');
      } else if (formData.description.length < 20) {
        newErrors.description = t('createPost.errors.descriptionMinLength');
      }
    }
    
    if (currentStep === 2) {
      if (!formData.budget || parseFloat(formData.budget) <= 0) {
        newErrors.budget = t('createPost.errors.budgetInvalid');
      } else if (parseFloat(formData.budget) < 1000) {
        newErrors.budget = t('createPost.errors.budgetMin');
      }
      
      if (!formData.location.trim()) {
        newErrors.location = t('createPost.errors.locationRequired');
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
      toast.error(t('createPost.errors.invalidImageType'));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('createPost.errors.imageTooLarge'));
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
      toast.error(t('createPost.errors.fillAllFields'));
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
        toast.success(t('createPost.success'));
        navigate(`/post/${result.data._id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error.message || t('createPost.errors.failed'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const getUserRoleText = () => {
    switch(user?.role) {
      case 'client':
        return t('roles.client');
      case 'artisan':
        return t('roles.artisan');
      case 'both':
        return t('roles.both');
      default:
        return '';
    }
  };
  
  const getUserRoleDescription = () => {
    switch(user?.role) {
      case 'client':
        return t('createPost.roleDescription.client');
      case 'artisan':
        return t('createPost.roleDescription.artisan');
      case 'both':
        return t('createPost.roleDescription.both');
      default:
        return '';
    }
  };
  
  const getPostTypeInfo = () => {
    if (postType === 'service_request') {
      return {
        title: t('createPost.postTypes.serviceRequest'),
        description: t('createPost.postTypes.serviceRequestDesc'),
        icon: Briefcase,
        color: 'text-blue-600'
      };
    } else {
      return {
        title: t('createPost.postTypes.jobOpportunity'),
        description: t('createPost.postTypes.jobOpportunityDesc'),
        icon: Wrench,
        color: 'text-blue-600'
      };
    }
  };
  
  const postTypeInfo = getPostTypeInfo();
  
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      > 
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="createpost-info-badge p-4 rounded-2xl flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('createPost.postingAs')}: 
              <span className="font-semibold text-blue-600 dark:text-blue-400 mx-1">{getUserRoleText()}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {getUserRoleDescription()}
            </p>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 relative">
              <div className="flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: currentStep >= step ? 1 : 0.8 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step 
                      ? 'createpost-step-circle-active text-white shadow-lg' 
                      : 'createpost-step-circle text-gray-500'
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </motion.div>
              </div>
              <div className="absolute top-5 left-1/2 w-full -z-10">
                {step < 3 && (
                  <div className={`h-0.5 transition-all duration-300 ${
                    currentStep > step 
                      ? 'createpost-step-line-active' 
                      : 'createpost-step-line'
                  }`} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm px-4">
          <span className="text-gray-600 dark:text-gray-400">{t('createPost.steps.basicInfo')}</span>
          <span className="text-gray-600 dark:text-gray-400">{t('createPost.steps.jobDetails')}</span>
          <span className="text-gray-600 dark:text-gray-400">{t('createPost.steps.image')}</span>
        </div>
      </div>
      
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="createpost-glass-card overflow-hidden"
      >
        
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('createPost.title')} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={postType === 'service_request' 
                  ? t('createPost.placeholders.titleService')
                  : t('createPost.placeholders.titleJob')}
                className={`createpost-input w-full px-4 py-3 focus:outline-none transition-all ${
                  errors.title 
                    ? 'border-red-500 focus:ring-red-500' 
                    : ''
                }`}
              />
              {errors.title && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </motion.p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('createPost.description')} *
              </label>
              <textarea
                ref={textareaRef}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder={t('createPost.placeholders.description')}
                className={`createpost-input w-full px-4 py-3 focus:outline-none transition-all resize-none ${
                  errors.description 
                    ? 'border-red-500 focus:ring-red-500' 
                    : ''
                }`}
              />
              {errors.description && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </motion.p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length} / 2000
              </p>
            </div>
          </div>
        )}
        
        {/* Step 2: Job Details */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('createPost.budget')} (DZD) *
                </label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder={t('createPost.placeholders.budget')}
                  className={`createpost-input w-full px-4 py-3 focus:outline-none ${
                    errors.budget ? 'border-red-500' : ''
                  }`}
                />
                {errors.budget && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.budget}
                  </motion.p>
                )}
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  {t('createPost.location')} *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={t('createPost.placeholders.location')}
                  className={`createpost-input w-full px-4 py-3 focus:outline-none ${
                    errors.location ? 'border-red-500' : ''
                  }`}
                />
                {errors.location && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.location}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Image */}
        {currentStep === 3 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Image className="w-4 h-4 inline ml-1" />
                {t('createPost.image')}
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{t('createPost.optional')}</span>
              </label>
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className={`createpost-upload-area p-8 text-center cursor-pointer transition-all ${
                  image ? 'createpost-upload-area-active' : ''
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
                <Upload className={`w-14 h-14 mx-auto mb-3 transition-all ${
                  image ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {image ? t('createPost.imageUploaded') : t('createPost.clickToUpload')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {t('createPost.imageRequirements')}
                </p>
              </motion.div>
              
              {/* عرض الصورة المرفوعة */}
              {image && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                >
                  <div className="relative group inline-block">
                    <img
                      src={image}
                      alt={t('createPost.uploadedImageAlt')}
                      className="w-48 h-48 object-cover rounded-xl shadow-md border-2 border-blue-300 dark:border-blue-700"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
          {currentStep > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              {t('createStep.previous')}
            </motion.button>
          )}
          
          {currentStep < 3 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {t('createStep.next')}
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{t('createStep.posting')}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{t('createStep.publish')}</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
      
      {/* Preview Card */}
      {formData.title && formData.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 createpost-preview-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            {t('createPost.preview')}
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-700/30">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user?.profileImage || 'https://via.placeholder.com/40'}
                alt={user?.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 dark:border-blue-700"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('ar-DZ')}</p>
              </div>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{formData.title}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{formData.description}</p>
            {(formData.budget || formData.location) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.budget && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg">
                    💰 {parseInt(formData.budget).toLocaleString()} DZD
                  </span>
                )}
                {formData.location && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg">
                    📍 {formData.location}
                  </span>
                )}
              </div>
            )}
            {image && (
              <div className="mt-3">
                <img src={image} alt={t('createPost.previewAlt')} className="w-32 h-32 object-cover rounded-lg shadow-md" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CreatePost;