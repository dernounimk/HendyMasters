import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// استيراد ملفات الترجمة مباشرة (بدون Backend)
import commonAR from './locales/ar/common.json';
import commonFR from './locales/fr/common.json';
import commonEN from './locales/en/common.json';
import loginAR from './locales/ar/login.json';
import loginFR from './locales/fr/login.json';
import loginEN from './locales/en/login.json';
import registerAR from './locales/ar/register.json';
import registerFR from './locales/fr/register.json';
import registerEN from './locales/en/register.json';

// دمج الترجمات
const resources = {
  ar: {
    translation: {
      ...commonAR,
      ...loginAR,
      ...registerAR
    }
  },
  fr: {
    translation: {
      ...commonFR,
      ...loginFR,
      ...registerFR
    }
  },
  en: {
    translation: {
      ...commonEN,
      ...loginEN,
      ...registerEN
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true, // شغّل هذا مؤقتاً للتشخيص
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;