// frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// استيراد ملفات الترجمة
import commonAR from './locales/ar/common.json';
import commonEN from './locales/en/common.json';
import commonFR from './locales/fr/common.json';
import loginAR from './locales/ar/login.json';
import loginEN from './locales/en/login.json';
import loginFR from './locales/fr/login.json';
import registerAR from './locales/ar/register.json';
import registerEN from './locales/en/register.json';
import registerFR from './locales/fr/register.json';
import profileAR from './locales/ar/profile.json';
import profileEN from './locales/en/profile.json';
import profileFR from './locales/fr/profile.json';
import resetAR from './locales/ar/reset.json';
import resetEN from './locales/en/reset.json';
import resetFR from './locales/fr/reset.json';
import craftsAR from './locales/ar/crafts.json';
import craftsEN from './locales/en/crafts.json';
import craftsFR from './locales/fr/crafts.json';
import notificationsAR from './locales/ar/notifications.json';
import notificationsEN from './locales/en/notifications.json';
import notificationsFR from './locales/fr/notifications.json';
import messagesAR from './locales/ar/messages.json';
import messagesEN from './locales/en/messages.json';
import messagesFR from './locales/fr/messages.json';
import homeAR from './locales/ar/home.json';
import homeEN from './locales/en/home.json';
import homeFR from './locales/fr/home.json';
import searchAR from './locales/ar/search.json';
import searchEN from './locales/en/search.json';
import searchFR from './locales/fr/search.json';
import createPostAR from './locales/ar/createPost.json';
import createPostEN from './locales/en/createPost.json';
import createPostFR from './locales/fr/createPost.json';
// ⭐ إضافة ملفات settings
import settingsAR from './locales/ar/settings.json';
import settingsEN from './locales/en/settings.json';
import settingsFR from './locales/fr/settings.json';
// ⭐ إضافة ملفات saved
import savedAR from './locales/ar/saved.json';
import savedEN from './locales/en/saved.json';
import savedFR from './locales/fr/saved.json';

// دمج الترجمات
const resources = {
  ar: {
    translation: {
      ...commonAR,
      ...loginAR,
      ...registerAR,
      ...profileAR,
      ...resetAR,
      ...craftsAR,
      ...notificationsAR,
      ...messagesAR,
      ...homeAR,
      ...searchAR,
      ...createPostAR,
      ...settingsAR,
      ...savedAR
    }
  },
  en: {
    translation: {
      ...commonEN,
      ...loginEN,
      ...registerEN,
      ...profileEN,
      ...resetEN,
      ...craftsEN,
      ...notificationsEN,
      ...messagesEN,
      ...homeEN,
      ...searchEN,
      ...createPostEN,
      ...settingsEN,
      ...savedEN
    }
  },
  fr: {
    translation: {
      ...commonFR,
      ...loginFR,
      ...registerFR,
      ...profileFR,
      ...resetFR,
      ...craftsFR,
      ...notificationsFR,
      ...messagesFR,
      ...homeFR,
      ...searchFR,
      ...createPostFR,
      ...settingsFR,
      ...savedFR
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;