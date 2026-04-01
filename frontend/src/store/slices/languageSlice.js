// store/slices/languageSlice.js
import i18n from '../../i18n/config'; // ✅ تعديل المسار لاستخدام config.js

export const createLanguageSlice = (set, get) => ({
  currentLanguage: localStorage.getItem('i18nextLng') || 'en',
  isRTL: localStorage.getItem('i18nextLng') === 'ar',
  isTransitioning: false,
  direction: 1,

  changeLanguage: (lng) => {
    const currentLang = get().currentLanguage;
    if (lng === currentLang) return;
    
    set({ isTransitioning: true });
    
    const langOrder = ['ar', 'fr', 'en'];
    const currentIndex = langOrder.indexOf(currentLang);
    const newIndex = langOrder.indexOf(lng);
    
    set({ direction: newIndex > currentIndex ? 1 : -1 });
    
    setTimeout(() => {
      i18n.changeLanguage(lng);
      localStorage.setItem('i18nextLng', lng);
      
      set({
        currentLanguage: lng,
        isRTL: lng === 'ar',
        isTransitioning: false
      });
      
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
    }, 50);
  },

  getCurrentLanguage: () => {
    const code = get().currentLanguage;
    const languages = {
      en: { code: 'en', name: 'English', flag: '🇬🇧' },
      fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
      ar: { code: 'ar', name: 'العربية', flag: '🇸🇦' }
    };
    return languages[code] || languages.en;
  }
});