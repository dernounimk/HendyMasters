import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

// Lottie animations
import Lottie from 'lottie-react';
import artisanAnimation from '../assets/animations/artisan-animation.json';
import workshopAnimation from '../assets/animations/workshop-animation.json';
import toolsAnimation from '../assets/animations/tools-animation.json';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const { login } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: 'أحمد محمد',
      role: 'حرفي',
      content: 'منصة رائعة ساعدتني في عرض أعمالي والحصول على عملاء جدد',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      name: 'فاطمة علي',
      role: 'عميلة',
      content: 'وجدت أفضل الحرفيين في مكان واحد بجودة عالية وأسعار مناسبة',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      name: 'محمد حسن',
      role: 'حرفي',
      content: 'التواصل مع العملاء أصبح أسهل بكثير، أنصح الجميع بالتسجيل',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    }, 1500);
  };

  const features = [
    { icon: '🎨', text: 'آلاف الحرفيين الموثوقين' },
    { icon: '🛡️', text: 'ضمان الجودة 100%' },
    { icon: '💬', text: 'تواصل مباشر وآمن' },
    { icon: '💰', text: 'أسعار تنافسية' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Language Toggle Button */}
      <button
        onClick={toggleLanguage}
        className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800/80"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {language === 'ar' ? 'English' : 'العربية'}
        </span>
        <ArrowLeftIcon className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
          language === 'ar' ? 'rotate-0' : 'rotate-180'
        }`} />
      </button>

      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12"
        >
          <div className="w-full max-w-md">
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-l from-primary-600 to-primary-800 bg-clip-text text-transparent">
                HandyMasters
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('welcomeBack')}
              </p>
            </motion.div>

            {/* Form */}
            <motion.form 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('email')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('password')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-primary-500 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-primary-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('rememberMe')}
                  </span>
                </label>
                <Link 
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-l from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('loggingIn')}</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>{t('login')}</span>
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-l from-primary-700 to-primary-800"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.form>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600 dark:text-gray-400">
                {t('noAccount')}{' '}
                <Link 
                  to="/register" 
                  className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center space-x-1 group"
                >
                  <span>{t('createAccount')}</span>
                  <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-xl">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Animation & Content */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12 text-white">
            {/* Lottie Animation */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-96 h-96 mb-8"
            >
              <Lottie 
                animationData={artisanAnimation}
                loop={true}
                autoplay={true}
              />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-center mb-4"
            >
              {t('heroTitle')}
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-primary-100 mb-12 max-w-md"
            >
              {t('heroDescription')}
            </motion.p>

            {/* Testimonials Slider */}
            <div className="relative w-full max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={testimonials[activeTestimonial].avatar}
                      alt={testimonials[activeTestimonial].name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonials[activeTestimonial].name}</h4>
                      <p className="text-sm text-primary-200">{testimonials[activeTestimonial].role}</p>
                    </div>
                  </div>
                  <p className="text-primary-100">"{testimonials[activeTestimonial].content}"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeTestimonial 
                        ? 'w-8 bg-white' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              {[
                { value: '10k+', label: 'حرفي' },
                { value: '50k+', label: 'عميل' },
                { value: '100k+', label: 'خدمة' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-primary-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;