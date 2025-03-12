import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pill, ArrowRight, ArrowLeft, AlertTriangle, Clock, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../styles/colors';
import { apiService } from '../../services/api/apiService';
import type { Medication } from '../../types/generalHealth';
import { AnalyticsList, AnalyticsListItem } from "../common/ui/AnalyticsList";
import { useAnalytics } from "../../hooks/useAnalytics";

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
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackPageView, trackClick } = useAnalytics(); // Add analytics hook
  
    useEffect(() => {
      trackPageView("Medications", "/medications");
    }, [trackPageView]);
  // Fetch medications data from API
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMedications(type);
        
        if (response.success && response.data) {
          setMedications(response.data);
        } else {
          setError(t('medications.errors.loadFailed'));
        }
      } catch (err) {
        console.error('Error fetching medications:', err);
        setError(t('medications.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedications();
  }, [type, t]);
  
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
  
  return (
    <div className={`${colors.background.primary} rounded-lg shadow-sm p-6`}>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-full hover:${colors.background.tertiary} transition-colors mr-2`}
          aria-label={t("actions.back")}
        >
          {isRTL ? (
            <ArrowRight size={20} className={colors.text.primary} />
          ) : (
            <ArrowLeft size={20} className={colors.text.primary} />
          )}
        </button>
        <h2 className={`text-xl font-bold ${colors.text.primary}`}>
          {t(`medications.types.${type}.title`)}
        </h2>
      </div>

      {loading ? (
        <div className={`${colors.background.secondary} rounded-lg p-6 mb-6 flex justify-center items-center min-h-[200px]`}>
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin dark:border-blue-800 dark:border-t-blue-400"></div>
        </div>
      ) : error ? (
        <div className={`${colors.background.secondary} rounded-lg p-6 mb-6 text-center`}>
          <AlertTriangle size={32} className="mx-auto mb-4 text-red-500" />
          <p className={colors.text.secondary}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center mx-auto"
          >
            <RotateCcw size={16} className="mr-2" />
            {t('common.retry')}
          </button>
        </div>
      ) : medications.length === 0 ? (
        <div className={`text-center py-10 ${colors.background.secondary} rounded-lg`}>
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
                    <Clock size={12} className={isRTL ? "ml-1" : "mr-1"} />
                    {t("medications.status.active")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { key: "dose", value: med.dose },
                  {
                    key: "frequency",
                    value: t(`medications.frequency.${med.frequency}`)
                  },
                  { key: "startDate", value: formatDate(med.startDate) },
                  {
                    key: isCurrentType ? "duration" : "endDate",
                    value: isCurrentType
                      ? t('medications.duration.days', { count: med.duration })
                      : formatDate(med.endDate || '')
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
                  {med.prescribedBy || med.doctor}
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
                    className={`${colors.status.warning.text} ${isRTL ? "ml-2" : "mr-2"} mt-0.5`}
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