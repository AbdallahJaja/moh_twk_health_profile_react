// src/locales/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import translationAR from './ar/translation.json';
import translationEN from './en/translation.json';

// The translations
const resources = {
  ar: {
    translation: translationAR
  },
  en: {
    translation: translationEN
  }
};

// Initialize i18n without the language detector first
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    
    // Initial language - will be updated after TWK check
    lng: 'ar'
  });

// Function to detect language from TWK
const detectLanguageFromTWK = async () => {
  try {
    if (window.TWK && window.TWK.getDeviceInfo) {
      const deviceInfo = await window.TWK.getDeviceInfo();
      
      if (deviceInfo.success && deviceInfo.result && deviceInfo.result.data) {
        // Extract language from device info
        // Assuming the language code is in the format of 'ar', 'en', etc.
        const deviceLang = deviceInfo.result.data.language || 
                           deviceInfo.result.data.locale || 
                           deviceInfo.result.data.languageCode;
        
        if (deviceLang) {
          // Convert to standard format if needed (e.g., 'ar-SA' to 'ar')
          const langCode = deviceLang.split('-')[0].toLowerCase();
          
          // Only switch if it's a supported language
          if (resources[langCode as keyof typeof resources]) {
            // Change language
            await i18n.changeLanguage(langCode);
            
            // Update document direction
            document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
            
            // Store in localStorage for persistence
            localStorage.setItem('language', langCode);
            
            console.log(`Language set from TWK: ${langCode}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error detecting language from TWK:', error);
  }
  
  // Fallback to browser or localStorage if TWK fails
const storedLanguage = localStorage.getItem('language');
if (storedLanguage && storedLanguage in resources && i18n.language !== storedLanguage) {
  i18n.changeLanguage(storedLanguage);
  document.documentElement.dir = storedLanguage === 'ar' ? 'rtl' : 'ltr';
}
};

// Detect language on initialization
detectLanguageFromTWK();

// Export i18n instance
export default i18n;

// Export a function to manually trigger language detection
export const refreshLanguage = () => detectLanguageFromTWK();