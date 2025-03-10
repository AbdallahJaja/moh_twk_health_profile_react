import React from 'react';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';

interface VitalsFormBaseProps {
  type: 'bmi' | 'blood-pressure' | 'blood-glucose' | 'weight' | 'height' | 'waist';
  mode: 'view' | 'add' | 'history';
  title: string;
  onModeChange: (mode: 'view' | 'add' | 'history') => void;
  formError: string | null;
  formSuccess: string | null;
  isLoading: boolean;
  children: React.ReactNode;
  hasHistory?: boolean;
}

export const VitalsFormBase: React.FC<VitalsFormBaseProps> = ({
  type,
  mode,
  title,
  onModeChange,
  formError,
  formSuccess,
  isLoading,
  children,
  hasHistory
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const renderHeader = () => {
    if (mode === 'view') {
      return (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex space-x-2 rtl:space-x-reverse">
            {hasHistory && (
              <button
                onClick={() => onModeChange('history')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('vitals.history.viewHistory')}
              </button>
            )}
            <button
              onClick={() => onModeChange('add')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md 
                       hover:bg-blue-600 transition-colors flex items-center"
            >
              <span>{t('vitals.actions.addMeasurement')}</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center mb-6">
        <button
          onClick={() => onModeChange('view')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                   text-gray-600 dark:text-gray-400 transition-colors"
        >
          {direction === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white rtl:mr-3 ltr:ml-3">
          {mode === 'add' 
            ? t('vitals.form.addTitle', { type: t(`vitals.types.${type}`) })
            : t('vitals.history.title')}
        </h2>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {renderHeader()}

      {/* Messages */}
      {formError && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 
                     rounded-md flex items-center">
          <AlertTriangle size={16} className="rtl:ml-2 ltr:mr-2" />
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 
                     rounded-md flex items-center">
          <Check size={16} className="rtl:ml-2 ltr:mr-2" />
          {formSuccess}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Activity size={24} className="animate-spin text-blue-500" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};