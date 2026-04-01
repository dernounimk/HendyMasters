// components/LoadingScreen.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-flex p-4 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-4"
        >
          <Loader className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </motion.div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          HandyMasters
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          جاري التحميل...
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;