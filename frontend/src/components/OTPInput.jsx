// frontend/src/components/OTPInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const OTPInput = ({ length = 6, onComplete, onChange, value, disabled = false }) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(value || new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      setOtp(value);
    }
  }, [value]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    const otpString = newOtp.join('');
    
    if (onChange) onChange(otpString);

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if all fields are filled
    if (otpString.length === length) {
      if (onComplete) {
        onComplete(otpString);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      if (onChange) onChange(newOtp.join(''));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    if (!/^\d+$/.test(pastedData)) {
      // Show error toast if needed
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const otpString = newOtp.join('');
    if (onChange) onChange(otpString);

    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
    if (lastFilledIndex >= 0 && lastFilledIndex < length - 1) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    }

    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  // Get placeholder text for screen readers
  const getPlaceholderText = () => {
    return t('otp.inputPlaceholder', { length });
  };

  return (
    <div className="flex justify-center gap-3 rtl:gap-3">
      {otp.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`${t('otp.digitLabel')} ${index + 1} ${t('otp.of')} ${length}`}
          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold rounded-2xl border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        />
      ))}
    </div>
  );
};

export default OTPInput;