import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('i18nextLng') || i18n.language || 'ar';
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = async (lang) => {
    if (['ar', 'en', 'fr'].includes(lang)) {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      localStorage.setItem('i18nextLng', lang);
    }
  };

  const value = {
    language,
    changeLanguage,
    t,
    dir: language === 'ar' ? 'rtl' : 'ltr',
    isRTL: language === 'ar',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};