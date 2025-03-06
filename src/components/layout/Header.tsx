// src/components/layout/Header.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const isRootPath = location.pathname === '/';
  const isRTL = i18n.language === 'ar';
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {!isRootPath && (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mx-2 transition-colors"
              aria-label={t('actions.back')}
            >
              {isRTL ? <ArrowRight size={20} className="dark:text-white" /> : <ArrowLeft size={20} className="dark:text-white" />}
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">{t('appName')}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;