// src/components/forms/VitalsForm.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHealthData } from "../../context/HealthDataContext";
import { useFeatureConfig } from "../../context/FeatureConfigContext";
import {
  Activity,
  ArrowRight,
  Check,
  Info,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { calculateBMI } from "../../services/healthService";
import { getBMICategory } from "../../services/healthService";
import { getBloodPressureCategory } from "../../services/healthService";
import { VitalsFormSkeleton } from "../common/skeletons";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { colors } from "../../styles/colors";
import { SectionHeader } from "../common/ui/SectionHeader";
import { StatusIndicator } from "../common/ui/StatusIndicator";
import { Alert } from "../common/ui/Alert";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useAnalytics } from "../../hooks/useAnalytics";
interface VitalsFormProps {
  type?: string;
  title?: string;
}

const VitalsForm: React.FC<VitalsFormProps> = ({
  type: propType,
  title: propTitle,
}) => {
  const params = useParams<{ type?: string }>();
  const { healthData, updateData, isLoading } = useHealthData();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { canPerformAction } = useFeatureConfig();
  const direction = language === "ar" ? "rtl" : "ltr";

  // Use prop type or param type
  const type = propType || params.type;
  // Use prop title or generate from type
  const title = propTitle || t(`vitals.types.${type || "default"}`);

  // Check permissions based on feature flags
  const canAdd = canPerformAction("add", `vitals.${type}`);
  const canEdit = canPerformAction("edit", `vitals.${type}`);
  const canDelete = canPerformAction("delete", `vitals.${type}`);

  // Form states
  const [mode, setMode] = useState<"view" | "add" | "history">("view");
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [vitalData, setVitalData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  type StatusSeverity = keyof typeof colors.status;
  const [statusInfo, setStatusInfo] = useState<{
    severity: StatusSeverity;
    category: string;
  } | null>(null);
  const [isFasting, setIsFasting] = useState(true); // For blood glucose
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    itemId: number | null;
  }>({
    isOpen: false,
    itemId: null,
  });
const { trackPageView, trackClick } = useAnalytics(); // Add analytics hook

  useEffect(() => {
    trackPageView(`Vitals Form - ${type}`, `/vitals/${type}/edit`); // Track page view
  }, [trackPageView, type]);
  // Initialize vital data from context
  useEffect(() => {
    if (healthData && healthData.vitals && type) {
      let data = null;
      let history: any[] = [];

      switch (type) {
        case "bmi":
          data = healthData.vitals.bmi?.value;
          history = healthData.vitals.bmi?.history || [];
          break;
        case "blood-pressure":
          data = healthData.vitals.bloodPressure?.value;
          history = healthData.vitals.bloodPressure?.history || [];
          break;
        case "blood-glucose":
          data = healthData.vitals.bloodGlucose?.value;
          history = healthData.vitals.bloodGlucose?.history || [];
          break;
        case "waist":
          data = healthData.vitals.waist?.value;
          history = healthData.vitals.waist?.history || [];
          break;
        case "weight":
          data = healthData.vitals.weight?.value;
          history = healthData.vitals.weight?.history || [];
          break;
        case "height":
          data = healthData.vitals.height?.value;
          history = healthData.vitals.height?.history || [];
          break;
      }

      setVitalData(data);
      setHistoryData(history);

      // Set status information based on type
      if (data) {
        updateStatusInfo(data);
      }
    }
  }, [healthData, type]);

  // Get form title based on type
  function getFormTitle(formType?: string): string {
    return t(`vitals.types.${formType || "default"}`);
  }

  // Update status information based on vital data
  const mapSeverityToStatus = (severity: string): StatusSeverity => {
    switch (severity) {
      case "normal":
        return "success";
      case "warning":
        return "warning";
      case "danger":
        return "error";
      default:
        return "info";
    }
  };

  const updateStatusInfo = (data: any) => {
    switch (type) {
      case "bmi": {
        const bmiStatus = getBMICategory(data);
        setStatusInfo({
          severity: mapSeverityToStatus(bmiStatus.color),
          category: bmiStatus.category,
        });
        break;
      }
      case "blood-pressure": {
        const bpCategory = getBloodPressureCategory(data);
        setStatusInfo({
          severity: mapSeverityToStatus(bpCategory.color),
          category: bpCategory.category,
        });
        break;
      }
      default:
        setStatusInfo(null);
    }
  };

  // Format date to local format
  const formatDate = (dateString: string) => {
    if (!dateString) return t("common.notAvailable");

    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      calendar: "gregory",
    }).format(date);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };

  // Handle deleting a history item
  const handleDeleteClick = (index: number) => {
    if (!canDelete) return;

    setDeleteConfirm({
      isOpen: true,
      itemId: index,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.itemId === null || !canDelete || historyData.length === 0)
      return;

    // Create a copy of history data without the deleted item
    const newHistory = [...historyData];
    newHistory.splice(deleteConfirm.itemId, 1);

    // If we're deleting the latest/current record, update the current value
    const newValue = newHistory.length > 0 ? newHistory[0].value : null;

    // Prepare data for update
    const updatedVital = {
      value: newValue,
      history: newHistory,
    };

    // Map type to context property
    const vitalTypeMap: Record<string, string> = {
      bmi: "bmi",
      "blood-pressure": "bloodPressure",
      "blood-glucose": "bloodGlucose",
      waist: "waist",
      weight: "weight",
      height: "height",
    };

    if (!type) {
      setDeleteConfirm({ isOpen: false, itemId: null });
      return;
    }

    // Update context data
    const success = await updateData(
      "vitals",
      vitalTypeMap[type],
      updatedVital
    );

    if (success) {
      setVitalData(newValue);
      setHistoryData(newHistory);
      if (newValue) {
        updateStatusInfo(newValue);
      }
      setFormSuccess(t("vitals.success.dataDeleted"));
      sessionStorage.removeItem("dashboardData"); // Clear cached data

      setTimeout(() => {
          // Fade out animation for success message
          const successElement = document.querySelector(".success-alert");
          if (successElement) {
            successElement.classList.add("opacity-0");
          }
      // Clear success message after delay
      setTimeout(() => {
        setFormSuccess(null);
      }, 300);
      }, 1500);
    }

    setDeleteConfirm({ isOpen: false, itemId: null });
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Validate form based on type
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // Clear errors
    setFormError(null);

    let newValue: any = null;
    let newHistory = [...historyData];

    // Prepare data based on type
    switch (type) {
      case "bmi":
        // BMI is calculated from weight and height
        if (!formValues.weight || !formValues.height) {
          setFormError("vitals.errors.weightHeightRequired");
          setIsSubmitting(false);
          return;
        }

        const bmiValue = calculateBMI(
          parseFloat(formValues.weight),
          parseFloat(formValues.height)
        );

        // Also update weight and height immediately
        const weightDate =
          formValues.date || new Date().toISOString().split("T")[0];
        const heightDate =
          formValues.date || new Date().toISOString().split("T")[0];

        // Create weight data
        const weightVital = {
          value: parseFloat(formValues.weight),
          history: [
            {
              date: weightDate,
              value: parseFloat(formValues.weight),
            },
            ...(healthData.vitals.weight?.history || []).slice(0, 9),
          ],
        };

        // Create height data
        const heightVital = {
          value: parseFloat(formValues.height),
          history: [
            {
              date: heightDate,
              value: parseFloat(formValues.height),
            },
            ...(healthData.vitals.height?.history || []).slice(0, 9),
          ],
        };

        // Update weight and height asynchronously
        await Promise.all([
          updateData("vitals", "weight", weightVital),
          updateData("vitals", "height", heightVital),
        ]);

        newValue = bmiValue;
        newHistory.unshift({
          date: formValues.date || new Date().toISOString().split("T")[0],
          value: bmiValue,
        });
        break;

      case "blood-pressure":
        if (!formValues.systolic || !formValues.diastolic) {
          setFormError("vitals.errors.bloodPressureRequired");
          setIsSubmitting(false);
          return;
        }

        newValue = {
          systolic: parseInt(formValues.systolic),
          diastolic: parseInt(formValues.diastolic),
        };

        newHistory.unshift({
          date: formValues.date || new Date().toISOString().split("T")[0],
          value: newValue,
        });
        break;

      default:
        if (!formValues.value) {
          setFormError("vitals.errors.valueRequired");
          setIsSubmitting(false);
          return;
        }

        newValue = parseFloat(formValues.value);
        newHistory.unshift({
          date: formValues.date || new Date().toISOString().split("T")[0],
          value: newValue,
        });
    }

    // Keep only the most recent 10 entries
    if (newHistory.length > 10) {
      newHistory = newHistory.slice(0, 10);
    }

    // Prepare data for update
    const updatedVital = {
      value: newValue,
      history: newHistory,
    };

    // Map type to context property
    const vitalTypeMap: Record<string, string> = {
      bmi: "bmi",
      "blood-pressure": "bloodPressure",
      "blood-glucose": "bloodGlucose",
      waist: "waist",
      weight: "weight",
      height: "height",
    };

    if (!type) {
      setFormError("vitals.errors.typeNotSpecified");
      setIsSubmitting(false);
      return;
    }

    // Update context data
    const success = await updateData(
      "vitals",
      vitalTypeMap[type],
      updatedVital
    );

    if (success) {
      sessionStorage.removeItem("dashboardData"); // Clear cached data

      // If type is BMI, also update weight and height
      if (type === "bmi" && formValues.weight && formValues.height) {
        // Update weight
        const weightVital = {
          value: parseFloat(formValues.weight),
          history: [
            {
              date: formValues.date || new Date().toISOString().split("T")[0],
              value: parseFloat(formValues.weight),
            },
            ...(healthData.vitals.weight?.history || []).slice(0, 9),
          ],
        };
        await updateData("vitals", "weight", weightVital);

        // Update height
        const heightVital = {
          value: parseFloat(formValues.height),
          history: [
            {
              date: formValues.date || new Date().toISOString().split("T")[0],
              value: parseFloat(formValues.height),
            },
            ...(healthData.vitals.height?.history || []).slice(0, 9),
          ],
        };
        await updateData("vitals", "height", heightVital);
      }

      setVitalData(newValue);
      setHistoryData(newHistory);
      updateStatusInfo(newValue);
      setFormSuccess(t("vitals.success.dataUpdated"));

      // Reset form
      setFormValues({});

      setTimeout(() => {
          // Fade out animation for success message
          const successElement = document.querySelector(".success-alert");
          if (successElement) {
            successElement.classList.add("opacity-0");
          }
      // Switch back to view mode after a delay
      setTimeout(() => {
        setMode("view");
        setFormSuccess(null);
      }, 300);
      }, 1500);
    }

    setIsSubmitting(false);
  };

  // Validate form based on type
  const validateForm = (): boolean => {
    setFormError(null);

    switch (type) {
      case "bmi":
        if (!formValues.weight) {
          setFormError("vitals.validation.required.weight");
          return false;
        }
        if (!formValues.height) {
          setFormError("vitals.validation.required.height");
          return false;
        }

        const weight = parseFloat(formValues.weight);
        const height = parseFloat(formValues.height);

        if (isNaN(weight) || weight <= 0 || weight > 500) {
          setFormError("vitals.validation.range.weight");
          return false;
        }

        if (isNaN(height) || height <= 0 || height > 300) {
          setFormError("vitals.validation.range.height");
          return false;
        }
        break;

      case "blood-pressure":
        if (!formValues.systolic) {
          setFormError("vitals.validation.required.systolic");
          return false;
        }
        if (!formValues.diastolic) {
          setFormError("vitals.validation.required.diastolic");
          return false;
        }

        const systolic = parseInt(formValues.systolic);
        const diastolic = parseInt(formValues.diastolic);

        if (isNaN(systolic) || systolic < 70 || systolic > 250) {
          setFormError("vitals.validation.range.systolic");
          return false;
        }

        if (isNaN(diastolic) || diastolic < 40 || diastolic > 150) {
          setFormError("vitals.validation.range.diastolic");
          return false;
        }

        if (diastolic >= systolic) {
          setFormError("vitals.validation.comparison.bloodPressure");
          return false;
        }
        break;

      case "blood-glucose":
        if (!formValues.value) {
          setFormError("vitals.validation.required.glucose");
          return false;
        }

        const glucose = parseFloat(formValues.value);

        if (isNaN(glucose) || glucose < 20 || glucose > 600) {
          setFormError("vitals.validation.range.glucose");
          return false;
        }
        break;

      case "waist":
      case "weight":
      case "height":
        if (!formValues.value) {
          setFormError(`vitals.validation.required.${type}`);
          return false;
        }

        const value = parseFloat(formValues.value);

        if (isNaN(value) || value <= 0) {
          setFormError(`vitals.validation.range.${type}`);
          return false;
        }
        break;
    }

    return true;
  };

  // Get measurement unit based on type
  const getMeasurementUnit = (): string => {
    return t(`vitals.units.${type}`);
  };

  if (isLoading) {
    return <VitalsFormSkeleton />;
  }

  // Update success message
  const renderSuccess = () =>
    formSuccess && <Alert type="success" message={formSuccess} />;

  // Update error message
  const renderError = () =>
    formError && <Alert type="error" message={t(formError)} />;

  // Render view mode
  const renderViewMode = () => (
    <div>
      <SectionHeader
        title={t(`vitals.types.${type}`)}
        action={
          canAdd && (
            <button
              onClick={() => setMode("add")}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md 
                       flex items-center transition-colors"
            >
              <Plus size={16} className="rtl:ml-2 ltr:mr-2" />
              {t("vitals.form.addMeasurement")}
            </button>
          )
        }
      />
      {renderSuccess()}

      {/* Current Value Section */}
      {renderCurrentValue()}

      {/* Additional information based on type */}
      {type === "bmi" && renderBMIInfo()}

      {type === "blood-pressure" && (
        <div className={`${colors.background.secondary} rounded-lg p-6`}>
          <h3 className={`text-lg font-medium mb-4 ${colors.text.primary}`}>
            {t("vitals.form.additionalInfo")}
          </h3>
          <p className={colors.text.secondary}>
            {t("vitals.bloodPressure.info.description")}
          </p>
          <div className="mt-4 space-y-2">
            {Object.entries(
              t("vitals.bloodPressure.info.categories", {
                returnObjects: true,
              })
            ).map(([key, value]) => (
              <div key={key} className={`text-sm ${colors.text.secondary}`}>
                {value}
              </div>
            ))}
          </div>
        </div>
      )}

      {type === "blood-glucose" && (
        <div className={`${colors.background.secondary} rounded-lg p-6`}>
          <h3 className={`text-lg font-medium mb-4 ${colors.text.primary}`}>
            {t("vitals.form.additionalInfo")}
          </h3>
          <p className={colors.text.secondary}>
            {t("vitals.bloodGlucose.info.description")}
          </p>
          <div className="mt-4 space-y-2">
            {Object.entries(
              t("vitals.bloodGlucose.info.categories", { returnObjects: true })
            ).map(([key, value]) => (
              <div key={key} className={`text-sm ${colors.text.secondary}`}>
                {value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render add form
  const renderAddForm = () => (
    <div>
      <SectionHeader
        title={
          vitalData
            ? t("vitals.form.editTitle", { type: t(`vitals.types.${type}`) })
            : t("vitals.form.addTitle", { type: t(`vitals.types.${type}`) })
        }
        back={() => {
          setMode("view");
          setFormValues({});
          setFormError(null);
        }}
      />

      {renderError()}

      {/* BMI Form Fields */}
      {type === "bmi" && (
        <div className="space-y-6">
          <Input
            label={t("vitals.bmi.weight.label")}
            type="number"
            value={formValues.weight || ""}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            placeholder={t("vitals.bmi.weight.placeholder")}
            min="1"
            max="500"
            step="0.1"
          />

          <Input
            label={t("vitals.bmi.height.label")}
            type="number"
            value={formValues.height || ""}
            onChange={(e) => handleInputChange("height", e.target.value)}
            placeholder={t("vitals.bmi.height.placeholder")}
            min="1"
            max="300"
            step="0.1"
          />
        </div>
      )}

      {/* Blood Pressure Form Fields */}
      {type === "blood-pressure" && (
        <div className="space-y-6">
          <Input
            label={t("vitals.bloodPressure.systolic.label")}
            type="number"
            value={formValues.systolic || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("systolic", e.target.value)
            }
            placeholder={t("vitals.bloodPressure.systolic.placeholder")}
            min="60"
            max="250"
          />

          <Input
            label={t("vitals.bloodPressure.diastolic.label")}
            type="number"
            value={formValues.diastolic || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("diastolic", e.target.value)
            }
            placeholder={t("vitals.bloodPressure.diastolic.placeholder")}
            min="40"
            max="150"
          />
        </div>
      )}

      {/* Blood Glucose Form Fields */}
      {type === "blood-glucose" && (
        <div className="space-y-6">
          <Input
            label={t("vitals.blood-glucose.value.label")}
            type="number"
            value={formValues.value || ""}
            onChange={(e) => handleInputChange("value", e.target.value)}
            placeholder={t("vitals.blood-glucose.value.placeholder")}
            min="20"
            max="600"
            step="1"
          />

          <div>
            <label
              className={`block text-sm font-medium ${colors.text.secondary} mb-2`}
            >
              {t("vitals.blood-glucose.measurementType")}
            </label>
            <div className="flex">
              <button
                type="button"
                className={`flex-1 py-2 ${
                  isFasting
                    ? "bg-blue-500 text-white"
                    : `${colors.background.secondary} ${colors.text.secondary}`
                } rounded-r-md transition-colors`}
                onClick={() => setIsFasting(true)}
              >
                {t("vitals.blood-glucose.fasting")}
              </button>
              <button
                type="button"
                className={`flex-1 py-2 ${
                  !isFasting
                    ? "bg-blue-500 text-white"
                    : `${colors.background.secondary} ${colors.text.secondary}`
                } rounded-l-md transition-colors`}
                onClick={() => setIsFasting(false)}
              >
                {t("vitals.blood-glucose.random")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waist Form Fields */}
      {type === "waist" && (
        <div className="space-y-6">
          <Input
            label={t("vitals.waist.label")}
            type="number"
            value={formValues.value || ""}
            onChange={(e) => handleInputChange("value", e.target.value)}
            placeholder={t("vitals.waist.placeholder")}
            min="30"
            max="200"
            step="0.1"
          />
        </div>
      )}

      {/* Weight Form Fields */}
      {type === "weight" && (
        <div className="space-y-6">
          <Input
            label={t("vitals.bmi.weight.label")}
            type="number"
            value={formValues.value || ""}
            onChange={(e) => handleInputChange("value", e.target.value)}
            placeholder={t("vitals.bmi.weight.placeholder")}
            min="1"
            max="500"
            step="0.1"
          />
        </div>
      )}

      {/* Height Form Fields */}
      {type === "height" && (
        <div className="space-y-6">
          <Input
            label={t("vitals.bmi.height.label")}
            type="number"
            value={formValues.value || ""}
            onChange={(e) => handleInputChange("value", e.target.value)}
            placeholder={t("vitals.bmi.height.placeholder")}
            min="1"
            max="300"
            step="0.1"
          />
        </div>
      )}

      {/* Date field for all forms */}
      <div className="mt-6">
        <Input
          label={t("vitals.form.measurementDate")}
          type="date"
          value={formValues.date || new Date().toISOString().split("T")[0]}
          onChange={(e) => handleInputChange("date", e.target.value)}
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md
                   transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t("actions.saving")
            : vitalData
            ? t("actions.update")
            : t("actions.add")}
        </button>
      </div>
    </div>
  );

  // Render history view
  const renderHistoryView = () => (
    <div className={colors.background.primary}>
      <SectionHeader
        title={t("vitals.history.title")}
        back={() => setMode("view")}
      />

      {historyData.length === 0 ? (
        <div
          className={`
          text-center py-10 ${colors.background.secondary} rounded-lg
        `}
        >
          <Activity
            size={40}
            className={`mx-auto ${colors.text.tertiary} mb-3`}
          />
          <p className={colors.text.secondary}>{t("vitals.history.noData")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyData.map((item, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-lg shadow-sm border
                ${colors.background.primary}
                ${colors.border.primary}
                transition-all duration-200
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className={colors.text.tertiary}>
                    {formatDate(item.date)}
                  </p>
                  <h3 className={`font-medium mt-1 ${colors.text.primary}`}>
                    {type === "blood-pressure"
                      ? `${item.value.systolic}/${item.value.diastolic} ${t(
                          `vitals.units.${type}`
                        )}`
                      : `${item.value} ${t(`vitals.units.${type}`)}`}
                  </h3>
                </div>
                <div className="flex items-center">
                  {index === 0 && (
                    <StatusIndicator
                      status="info"
                      label={t("vitals.history.latestMeasurement")}
                    />
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteClick(index)}
                      className={`ms-2 p-2 hover:${colors.background.tertiary} text-red-500 transition-colors rounded-full`}
                      aria-label={t("actions.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Move renderBMIInfo inside component
  const renderBMIInfo = () => (
    <Card>
      <h3 className={`font-medium ${colors.text.primary} mb-4`}>
        {t("vitals.form.additionalInfo")}
      </h3>
      <p className={`${colors.text.secondary} mb-4`}>
        {t("vitals.bmi.info.description")}
      </p>
      <div className="space-y-3">
        {[
          { key: "normal", color: "success" as const },
          { key: "overweight", color: "warning" as const },
          { key: "underweight", color: "info" as const },
          { key: "obese", color: "error" as const },
        ].map(({ key, color }) => (
          <div
            key={key}
            className={`
            p-3 rounded-md transition-colors duration-200
            ${colors.status[color].bg} 
            ${colors.status[color].text}
            ${colors.status[color].border}
            border
          `}
          >
            {t(`vitals.bmi.info.categories.${key}`)}
          </div>
        ))}
      </div>
    </Card>
  );

  // Add renderCurrentValue function
  const renderCurrentValue = () => (
    <div
      className={`mb-6 p-6 ${colors.background.secondary} rounded-lg shadow-sm`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${colors.text.primary}`}>
          {t("vitals.form.currentValue")}
        </h3>
        {vitalData && (
          <span className={colors.text.tertiary}>
            {t("vitals.form.lastUpdate")}: {formatDate(historyData[0]?.date)}
          </span>
        )}
      </div>

      {!vitalData ? (
        <p className={colors.text.secondary}>{t("vitals.form.noValue")}</p>
      ) : (
        <div>
          <div className={`text-3xl font-bold mb-2 ${colors.text.primary}`}>
            {type === "blood-pressure"
              ? `${vitalData.systolic}/${vitalData.diastolic}`
              : type === "bmi"
              ? vitalData.toFixed(1)
              : vitalData}
            <span
              className={`text-base font-normal ${colors.text.tertiary} rtl:mr-2 ltr:ml-2`}
            >
              {t(`vitals.units.${type}`)}
            </span>
          </div>

          {statusInfo && (
            <div
              className={`
              mt-4 p-3 rounded-md border
              ${colors.status[statusInfo.severity].bg}
              ${colors.status[statusInfo.severity].text}
              ${colors.status[statusInfo.severity].border}
              transition-all duration-200
            `}
            >
              <div className="flex items-center gap-2">
                <Info size={16} />
                <div>
                  <div className="font-medium">
                    {t(`vitals.status.${type}.${statusInfo.category}`)}
                  </div>
                  <div className="text-sm">
                    {t(
                      `vitals.status.${type}.${statusInfo.category}.description`
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {mode === "view"
        ? renderViewMode()
        : mode === "add"
        ? renderAddForm()
        : renderHistoryView()}
    </div>
  );
};

// Update the card styling
const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    className={`
    ${colors.background.primary} 
    ${colors.border.primary}
    border rounded-lg shadow-sm p-6 transition-colors duration-200
  `}
  >
    {children}
  </div>
);

// Update form inputs
const Input = ({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="mb-4">
    <label
      className={`block text-sm font-medium ${colors.text.secondary} mb-1`}
    >
      {label}
    </label>
    <input
      className={`
        w-full px-3 py-2 rounded-md
        ${colors.background.primary}
        ${colors.text.primary}
        ${colors.border.primary}
        border focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        transition-colors duration-200
      `}
      {...props}
    />
  </div>
);

export default VitalsForm;
