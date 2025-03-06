// src/context/LanguageContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import i18n from 'i18next';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(i18n.language as Language || 'ar');
  const [direction, setDirection] = useState<Direction>(language === 'ar' ? 'rtl' : 'ltr');

  // Apply direction changes to document
  useEffect(() => {
    // Set direction attribute
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    // Add direction-specific class for CSS targeting
    if (direction === 'rtl') {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
    
    // Store in localStorage
    localStorage.setItem('language', language);
  }, [language, direction]);
  
  // Listen for i18next language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(lng as Language);
      setDirection(lng === 'ar' ? 'rtl' : 'ltr');
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'ar' ? 'en' : 'ar';
    const newDirection: Direction = newLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Set direction immediately
    document.documentElement.dir = newDirection;
    if (newDirection === 'rtl') {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
    
    // Change language in i18n
    i18n.changeLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};