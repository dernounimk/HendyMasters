// frontend/src/pages/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Key, Loader } from 'lucide-react';
import { useStore } from '../store';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { requestResetCode, isLoading } = useStore();
  
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError(t('forgotPassword.errors.emailRequired'));
      return;
    }
    
    if (!validateEmail(email)) {
      setError(t('forgotPassword.errors.invalidEmail'));
      return;
    }
    
    setIsSubmitting(true);
    const result = await requestResetCode(email);
    setIsSubmitting(false);
    
    if (result.success) {
      setSuccess(true);
      // تخزين البريد الإلكتروني في localStorage للاستخدام في صفحة إعادة التعيين
      localStorage.setItem('resetEmail', email);
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
    } else {
      setError(result.error || t('forgotPassword.errors.general'));
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <Link to="/login" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('forgotPassword.backToLogin')}
        </Link>
        
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-4"
          >
            <Key className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('forgotPassword.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('forgotPassword.subtitle')}
          </p>
        </div>
        
        {success ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('forgotPassword.successTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('forgotPassword.successMessage', { email })}
            </p>
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forgotPassword.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </motion.p>
              )}
            </div>
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  <span>{t('forgotPassword.sending')}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  <span>{t('forgotPassword.sendResetLink')}</span>
                </>
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;