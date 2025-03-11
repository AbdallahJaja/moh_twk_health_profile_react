import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HealthRecord: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mx-2 transition-colors"
          aria-label={t("actions.back")}
        >
          {isRTL ? (
            <ArrowRight size={20} className="text-gray-700 dark:text-gray-200" />
          ) : (
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
          )}
        </button>
        <h2 className="text-xl font-bold mr-2">{t("healthRecord.title")}</h2>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <FileText size={40} className="text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-center mb-2">{t("healthRecord.subTitle")}</h3>
        <p className="text-gray-600 text-center">{t("healthRecord.description")}</p>

        <div className="mt-6 space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">{t("healthRecord.lastMedicalVisit")}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("healthRecord.medicalVisitLocation")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">15/02/2025</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">{t("healthRecord.lastPrescription")}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("healthRecord.prescriptionDetails")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">10/02/2025</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">{t("healthRecord.lastLabTest")}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("healthRecord.labTestDetails")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">05/02/2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecord;
