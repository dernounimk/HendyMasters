// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Key, AlertCircle, CheckCircle, ArrowLeft, Loader } from 'lucide-react';
import { useStore } from '../store';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { verifyResetCode, resetPasswordWithCode } = useStore();
  
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const isVerifyingRef = useRef(false);
  const stepRef = useRef(step);
  
  // تحديث الـ ref عند تغير step
  useEffect(() => {
    stepRef.current = step;
    console.log('📊 Step changed to:', step);
  }, [step]);
  
  // استرجاع البريد الإلكتروني
  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      console.log('📧 Email:', savedEmail);
    } else {
      navigate('/forgot-password');
    }
  }, [navigate]);
  
  // التحقق من الرمز
  const handleVerifyCode = useCallback(async (otpCode) => {
    if (otpCode.length !== 6) return;
    if (isVerifyingRef.current) return;
    
    console.log('🔐 Verifying code:', otpCode);
    setCodeError('');
    isVerifyingRef.current = true;
    setIsVerifying(true);
    
    try {
      const result = await verifyResetCode(email, otpCode);
      console.log('✅ Verification result:', result);
      
      if (result.valid && stepRef.current === 1) {
        console.log('✅ Moving to step 2');
        setCode(otpCode);
        setStep(2);
      } else if (!result.valid) {
        setCodeError(result.error || 'الرمز غير صحيح');
        setOtpValues(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Verification error:', err);
      setCodeError('حدث خطأ في التحقق');
    } finally {
      setIsVerifying(false);
      isVerifyingRef.current = false;
    }
  }, [email, verifyResetCode]);
  
  // معالجة تغيير OTP
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      console.log('✅ OTP completed:', fullCode);
      handleVerifyCode(fullCode);
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split('');
    for (let i = 0; i < 6; i++) {
      newOtp[i] = newOtp[i] || '';
    }
    setOtpValues(newOtp.slice(0, 6));
    
    const fullCode = newOtp.slice(0, 6).join('');
    if (fullCode.length === 6) {
      handleVerifyCode(fullCode);
    }
    
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('كلمة المرور مطلوبة');
      return;
    }
    
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    
    setIsResetting(true);
    const result = await resetPasswordWithCode(email, code, password);
    setIsResetting(false);
    
    if (result.success) {
      setSuccess(true);
      localStorage.removeItem('resetEmail');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.error || 'حدث خطأ');
    }
  };
  
  const handleResendCode = () => {
    navigate('/forgot-password');
  };
  
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            تم تغيير كلمة المرور!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            جاري التحويل إلى صفحة تسجيل الدخول...
          </p>
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <Link to="/login" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة إلى تسجيل الدخول
        </Link>
        
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-4"
          >
            <Key className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 1 ? 'أدخل رمز التحقق' : 'كلمة المرور الجديدة'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 1 
              ? `تم إرسال رمز إلى ${email}`
              : 'أدخل كلمة المرور الجديدة'}
          </p>
        </div>
        
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                أدخل الرمز المكون من 6 أرقام
              </label>
              <div className="flex justify-center gap-3">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={isVerifying}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                ))}
              </div>
              {codeError && (
                <p className="text-red-500 text-sm mt-3 text-center flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {codeError}
                </p>
              )}
              {isVerifying && (
                <div className="flex justify-center mt-4">
                  <Loader className="w-6 h-6 text-primary-600 animate-spin" />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <button 
                onClick={handleResendCode}
                className="text-primary-600 hover:underline text-sm"
              >
                لم يصلك الرمز؟ طلب رمز جديد
              </button>
              <p className="text-xs text-gray-400 mt-2">
                الرمز صالح لمدة 10 دقائق
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                  placeholder="********"
                  disabled={isResetting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                  placeholder="********"
                  disabled={isResetting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
            
            <button
              type="submit"
              disabled={isResetting}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {isResetting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  <span>جاري إعادة التعيين...</span>
                </>
              ) : (
                <>
                  <Key className="w-5 h-5 mr-2" />
                  <span>إعادة تعيين كلمة المرور</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;