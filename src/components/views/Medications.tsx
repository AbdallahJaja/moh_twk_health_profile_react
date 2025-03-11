import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pill, ArrowRight, ArrowLeft, AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../styles/colors';

interface MedicationsProps {
  type?: 'current' | 'previous';
}

const Medications: React.FC<MedicationsProps> = ({ type: propType }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const params = useParams<{ type?: string }>();
  
  const type = propType || params.type as 'current' | 'previous';
  const isCurrentType = type === 'current';
  const isRTL = language === 'ar';
  
  // Sample data for medications
  const [currentMedications] = useState([
    {
      id: 1,
      name: t('medications.names.paracetamol'),
      dose: '500mg',
      frequency: 'thrice', // Using key instead of hardcoded Arabic
      startDate: '2025-01-15',
      duration: t('medications.duration.days', { count: 10 }), // Using i18n interpolation
      doctor: 'Dr. Ahmad Saeed',
      notes: t('medications.notes.afterMeal')
    },
    {
      id: 2,
      name: 'أموكسيسيلين',
      dose: '250 ملغ',
      frequency: 'مرتين يومياً',
      startDate: '2025-02-10',
      duration: '7 أيام',
      doctor: 'د. خالد محمد',
      notes: 'يؤخذ قبل الطعام بساعة'
    }
  ]);
  
  const [previousMedications] = useState([
    {
      id: 1,
      name: 'إيبوبروفين',
      dose: '400 ملغ',
      frequency: 'عند الحاجة',
      startDate: '2024-12-05',
      endDate: '2024-12-15',
      doctor: 'د. سارة العلي',
      notes: 'لتسكين الآلام'
    },
    {
      id: 2,
      name: 'كلاريثروميسين',
      dose: '500 ملغ',
      frequency: 'مرتين يومياً',
      startDate: '2024-11-20',
      endDate: '2024-11-30',
      doctor: 'د. محمد العمر',
      notes: 'للالتهاب الرئوي'
    },
    {
      id: 3,
      name: 'لوراتادين',
      dose: '10 ملغ',
      frequency: 'مرة واحدة يومياً',
      startDate: '2024-10-15',
      endDate: '2024-11-15',
      doctor: 'د. أحمد سعيد',
      notes: 'للحساسية الموسمية'
    }
  ]);
  
  // Format date using the current language
  const formatDate = (dateString: string) => {
    if (!dateString) return t('common.notAvailable');
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'gregory'
    }).format(date);
  };

  const medications = isCurrentType ? currentMedications : previousMedications;
  
  return (
    <div className={`${colors.background.primary} rounded-lg shadow-sm p-6`}>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mx-2 transition-colors"
          aria-label={t("actions.back")}
        >
          {isRTL ? (
            <ArrowRight
              size={20}
              className="text-gray-700 dark:text-gray-200"
            />
          ) : (
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
          )}
        </button>
        <h2
          className={`text-xl font-bold rtl:mr-2 ltr:ml-2 ${colors.text.primary}`}
        >
          {t(`medications.types.${type}.title`)}
        </h2>
      </div>

      {medications.length === 0 ? (
        <div
          className={`
          text-center py-10 ${colors.background.secondary} rounded-lg
        `}
        >
          <Pill size={40} className={`mx-auto ${colors.text.tertiary} mb-3`} />
          <p className={colors.text.secondary}>
            {t(`medications.types.${type}.empty`)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`
                ${colors.background.primary} 
                ${colors.border.primary}
                border rounded-lg p-4
              `}
            >
              <div className="flex justify-between items-start">
                <h3 className={`font-medium ${colors.text.primary}`}>
                  {med.name}
                </h3>
                {isCurrentType && (
                  <span
                    className={`
                    ${colors.status.info.bg} ${colors.status.info.text}
                    text-xs px-2 py-1 rounded-full flex items-center
                  `}
                  >
                    <Clock size={12} className="rtl:ml-1 ltr:mr-1" />
                    {t("medications.types.current.status")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { key: "dose", value: med.dose },
                  {
                    key: "frequency",
                    value: t(`medications.frequency.${med.frequency}`),
                  },
                  { key: "startDate", value: formatDate(med.startDate) },
                  {
                    key: isCurrentType ? "duration" : "endDate",
                    value: isCurrentType
                      ? med.duration
                      : formatDate(med.endDate),
                  },
                ].map(({ key, value }) => (
                  <div key={key}>
                    <span className={`text-xs ${colors.text.tertiary}`}>
                      {t(`medications.details.${key}`)}:
                    </span>
                    <p className={`text-sm ${colors.text.secondary}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <span className={`text-xs ${colors.text.tertiary}`}>
                  {t("medications.details.doctor")}:
                </span>
                <p className={`text-sm ${colors.text.secondary}`}>
                  {med.doctor}
                </p>
              </div>

              {med.notes && (
                <div
                  className={`
                  mt-3 ${colors.status.warning.bg} p-2 rounded-md 
                  text-sm flex items-start
                `}
                >
                  <AlertTriangle
                    size={16}
                    className={`${colors.status.warning.text} rtl:ml-2 ltr:mr-2 mt-0.5`}
                  />
                  <div>
                    <span
                      className={`text-xs font-medium ${colors.status.warning.text}`}
                    >
                      {t("medications.details.notes")}:
                    </span>
                    <p className={colors.status.warning.text}>{med.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medications;