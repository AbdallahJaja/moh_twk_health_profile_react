import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHealthData } from "../../context/HealthDataContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { useFeatureConfig } from "../../context/FeatureConfigContext";
import { Users, Plus, Edit2, Trash2, Info, AlertTriangle } from "lucide-react";
import { GeneralHealthFormSkeleton } from "../common/skeletons";
import { SectionHeader } from "../common/ui/SectionHeader";
import { StatusIndicator } from "../common/ui/StatusIndicator";
import { Alert } from "../common/ui/Alert";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { colors } from "../../styles/colors";
import { twkService } from "../../services/twk/twkService";
import { FamilyRelation } from "../../types/generalHealth";
import { useAnalytics } from "../../hooks/useAnalytics";
interface GeneralHealthFormProps {
  type?: string;
  title?: string;
}

const GeneralHealthForm: React.FC<GeneralHealthFormProps> = ({
  type: propType,
  title: propTitle,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const params = useParams<{ type?: string }>();
  const { healthData, updateData, isLoading } = useHealthData();
  const { canPerformAction } = useFeatureConfig();

  // Use prop type or param type
  const type = propType || params.type;
  // Use prop title or generate from type
  const title =
    propTitle || t(`generalHealth.types.${type || "default"}.title`);

  // Form states
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [generalData, setGeneralData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    itemId: number | null;
  }>({
    isOpen: false,
    itemId: null,
  });

  // Check permissions based on feature flags
  const canAdd = canPerformAction("add", `generalHealth.${type}`);
  const canEdit = canPerformAction("edit", `generalHealth.${type}`);
  const canDelete = canPerformAction("delete", `generalHealth.${type}`);

  // Blood types from config
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const { trackPageView, trackClick } = useAnalytics(); // Add analytics hook

  useEffect(() => {
    trackPageView("GeneralHealthForm", "/general-health-form");
  }, [trackPageView]);
  // Initialize data from context
  useEffect(() => {
    if (healthData && healthData.general && type) {
      let data = null;

      if (type === "blood-type") {
        data = healthData.general.bloodType;

        // If no blood type in healthData, try to get it from TWK
        if (!data) {
          const fetchBloodType = async () => {
            try {
              const bloodType = await twkService.getUserBloodType();
              setGeneralData(bloodType);
            } catch (error) {
              console.error("Error fetching blood type from TWK:", error);
            }
          };
          fetchBloodType();
        } else {
          setGeneralData(data);
        }
      } else if (type === "health-conditions") {
        data = healthData.general.healthConditions || [];
        setGeneralData(data);
      } else if (type === "family-history") {
        data = healthData.general.familyHistory || [];
        setGeneralData(data);
      }
    }
  }, [healthData, type]);

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

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form based on type
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Clear errors
    setFormError(null);

    let newValue: any = null;

    // Prepare data based on type
    switch (type) {
      case "blood-type":
        newValue = formValues.bloodType;
        break;

      case "health-conditions":
      case "family-history":
        if (mode === "add") {
          // Add new item
          const newItem = {
            id: Date.now(),
            name: formValues.name,
            date: new Date().toISOString().split("T")[0],
            ...(type === "family-history"
              ? { relation: formValues.relation }
              : {}),
          };

          newValue = [
            ...(Array.isArray(generalData) ? generalData : []),
            newItem,
          ];
        } else if (mode === "edit" && selectedItem) {
          // Update existing item
          const updatedItem = {
            ...selectedItem,
            name: formValues.name,
            ...(type === "family-history"
              ? { relation: formValues.relation }
              : {}),
          };

          newValue = (generalData as any[]).map((item) =>
            item.id === selectedItem.id ? updatedItem : item
          );
        }
        break;
    }

    // Map type to context property
    const generalTypeMap: Record<string, string> = {
      "blood-type": "bloodType",
      "health-conditions": "healthConditions",
      "family-history": "familyHistory",
    };

    if (!type) {
      setFormError(t("generalHealth.validation.required.type"));
      setIsSubmitting(false);
      return;
    }

    // Update context data
    const success = await updateData("general", generalTypeMap[type], newValue);

    if (success) {
      setGeneralData(newValue);
      setFormSuccess(t("generalHealth.success.update"));
      sessionStorage.removeItem("dashboardData");

      // Reset form
      setFormValues({});
      setSelectedItem(null);

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

  // Handle deleting an item
  const handleDeleteClick = (id: number) => {
    if (!canDelete) return;

    setDeleteConfirm({
      isOpen: true,
      itemId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.itemId === null || !canDelete) return;

    // Filter out the selected item
    const updatedItems = (generalData as any[]).filter(
      (item) => item.id !== deleteConfirm.itemId
    );

    // Map type to context property
    const generalTypeMap: Record<string, string> = {
      "health-conditions": "healthConditions",
      "family-history": "familyHistory",
    };

    if (!type || (type !== "health-conditions" && type !== "family-history")) {
      setDeleteConfirm({ isOpen: false, itemId: null });
      return;
    }

    // Update context data
    const success = await updateData(
      "general",
      generalTypeMap[type],
      updatedItems
    );

    if (success) {
      setGeneralData(updatedItems);
      setFormSuccess(t("generalHealth.success.delete"));
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

  // Handle selecting an item for editing
  const handleEditItem = (item: any) => {
    if (!canEdit) return;

    setSelectedItem(item);
    setFormValues({
      name: item.name,
      ...(type === "family-history" ? { relation: item.relation } : {}),
    });
    setMode("edit");
  };

  // Validate form based on type
  const validateForm = (): boolean => {
    setFormError(null);

    switch (type) {
      case "blood-type":
        if (!formValues.bloodType) {
          setFormError(t("generalHealth.validation.required.bloodType"));
          return false;
        }
        break;

      case "health-conditions":
        if (!formValues.name?.trim()) {
          setFormError(t("generalHealth.validation.required.condition"));
          return false;
        }
        break;

      case "family-history":
        if (!formValues.name?.trim()) {
          setFormError(t("generalHealth.validation.required.condition"));
          return false;
        }
        if (!formValues.relation) {
          setFormError(t("generalHealth.validation.required.relation"));
          return false;
        }
        break;
    }

    return true;
  };

  // Render blood type view
  const renderBloodTypeView = () => (
    <div>
      <SectionHeader
        title={t("generalHealth.types.bloodType.title")}
        action={
          canEdit || canAdd ? (
            <button
              onClick={() => {
                setMode("add");
                setFormValues({ bloodType: generalData || "" });
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center"
              disabled={!canEdit && generalData !== null}
            >
              {generalData ? t("actions.update") : t("actions.add")}
            </button>
          ) : null
        }
      />

      {formSuccess && <Alert type="success" message={formSuccess} />}

      <div className={`mb-6 p-6 ${colors.background.secondary} rounded-lg`}>
        {generalData ? (
          <div className="text-center">
            <span className={`text-4xl font-bold ${colors.text.primary}`}>
              {generalData}
            </span>
            <p className={`mt-4 ${colors.text.secondary}`}>
              {t("generalHealth.types.bloodType.description")}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users
              size={40}
              className={`mx-auto ${colors.text.tertiary} mb-3`}
            />
            <p className={colors.text.secondary}>
              {t("generalHealth.types.bloodType.empty")}
            </p>
            {canAdd && (
              <button
                onClick={() => setMode("add")}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                {t("generalHealth.types.bloodType.select")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Blood type information */}
      <div className={`p-6 ${colors.background.secondary} rounded-lg`}>
        <h3 className={`text-lg font-medium mb-4 ${colors.text.primary}`}>
          {t("generalHealth.types.bloodType.info.title")}
        </h3>
        <p className={colors.text.secondary}>
          {t("generalHealth.types.bloodType.info.description")}
        </p>
      </div>
    </div>
  );

  // Render health conditions or family history view
  const renderItemsListView = () => (
    <div>
      <SectionHeader
        title={t(`generalHealth.types.${type}.title`)}
        action={
          canAdd ? (
            <button
              onClick={() => {
                setMode("add");
                setFormValues({});
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center transition-colors"
            >
              <Plus size={16} className="rtl:ml-2 ltr:mr-2" />
              {t("actions.add")}
            </button>
          ) : null
        }
      />

      {formSuccess && <Alert type="success" message={formSuccess} />}

      {/* Items list */}
      {!Array.isArray(generalData) || generalData.length === 0 ? (
        <div
          className={`text-center py-10 ${colors.background.secondary} rounded-lg`}
        >
          <Users size={40} className={`mx-auto ${colors.text.tertiary} mb-3`} />
          <p className={colors.text.secondary}>
            {t(`generalHealth.types.${type}.empty`)}
          </p>
          {canAdd && (
            <button
              onClick={() => setMode("add")}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md inline-flex items-center transition-colors"
            >
              <Plus size={16} className="rtl:ml-2 ltr:mr-2" />
              {t("actions.add")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {generalData.map((item: any) => (
            <div
              key={item.id}
              className={`
                p-4 rounded-lg shadow-sm border
                ${colors.background.primary}
                ${colors.border.primary}
                transition-colors
              `}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className={`font-medium ${colors.text.primary}`}>
                    {item.name}
                  </h3>
                  {type === "family-history" && item.relation && (
                    <p className={`text-sm ${colors.text.secondary}`}>
                      {t("generalHealth.types.familyHistory.fields.relation")}:{" "}
                      {item.relation}
                    </p>
                  )}
                  <p className={`text-sm ${colors.text.tertiary}`}>
                    {t("generalHealth.form.recordDate")}:{" "}
                    {formatDate(item.date)}
                  </p>
                </div>
                <div className="flex items-center">
                  {canEdit && (
                    <button
                      onClick={() => handleEditItem(item)}
                      className={`p-2 hover:${colors.background.tertiary} ${colors.text.tertiary} transition-colors rounded-full`}
                      aria-label={t("actions.edit")}
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className={`p-2 hover:${colors.background.tertiary} text-red-500 transition-colors rounded-full`}
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

  // Render blood type form
  const renderBloodTypeForm = () => (
    <div>
      <SectionHeader
        title={t("generalHealth.types.bloodType.select")}
        back={() => {
          setMode("view");
          setFormValues({});
          setFormError(null);
        }}
      />

      {formError && <Alert type="error" message={formError} />}

      {formSuccess && <Alert type="success" message={formSuccess} />}

      {/* Blood type selection */}
      <div className="mb-6">
        <label
          className={`block text-sm font-medium ${colors.text.secondary} mb-2`}
        >
          {t("generalHealth.form.fields.selectBloodType")}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bloodTypes.map((bloodType) => (
            <div
              key={bloodType}
              className={`
                p-3 border rounded-md cursor-pointer text-center transition-colors
                ${
                  formValues.bloodType === bloodType
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                    : `${colors.border.primary} ${colors.background.primary}`
                }
              `}
              onClick={() => handleInputChange("bloodType", bloodType)}
            >
              <span
                className={`text-lg font-medium ${
                  formValues.bloodType === bloodType
                    ? "text-blue-700 dark:text-blue-300"
                    : colors.text.primary
                }`}
              >
                {bloodType}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("actions.saving") : t("actions.save")}
        </button>
      </div>
    </div>
  );

  // Render health condition or family history form
  const renderItemForm = () => (
    <div>
      <SectionHeader
        title={t(
          `generalHealth.types.${type}.${
            mode === "add" ? "addTitle" : "editTitle"
          }`
        )}
        back={() => {
          setMode("view");
          setFormValues({});
          setSelectedItem(null);
          setFormError(null);
        }}
      />

      {formError && <Alert type="error" message={formError} />}

      {formSuccess && <Alert type="success" message={formSuccess} />}

      <div className="space-y-6">
        {/* Name input */}
        <div>
          <label
            className={`block text-sm font-medium ${colors.text.secondary} mb-1`}
          >
            {t(`generalHealth.types.${type}.name`)}
          </label>
          <input
            type="text"
            value={formValues.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`
              w-full px-3 py-2 rounded-md
              ${colors.background.primary}
              ${colors.text.primary}
              ${colors.border.primary}
              border focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              transition-colors
            `}
            placeholder={t(`generalHealth.types.${type}.placeholder.name`)}
          />
        </div>

        {/* Relation input for family history */}
        {type === "family-history" && (
          <div>
            <label
              className={`block text-sm font-medium ${colors.text.secondary} mb-1`}
            >
              {t("generalHealth.types.familyHistory.relation")}
            </label>
            <input
              type="text"
              value={formValues.relation || ""}
              onChange={(e) => handleInputChange("relation", e.target.value)}
              className={`
                w-full px-3 py-2 rounded-md
                ${colors.background.primary}
                ${colors.text.primary}
                ${colors.border.primary}
                border focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                transition-colors
              `}
              placeholder={t(
                "generalHealth.types.familyHistory.placeholder.relation"
              )}
            />
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("actions.saving")
              : mode === "add"
              ? t("actions.add")
              : t("actions.update")}
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  if (isLoading) {
    return <GeneralHealthFormSkeleton />;
  }

  return (
    <div className={`${colors.background.primary} rounded-lg shadow-sm p-6`}>
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, itemId: null })}
        onConfirm={handleDeleteConfirm}
        title={t("generalHealth.confirm.delete.title")}
        message={t("generalHealth.confirm.delete.message")}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            className={`flex flex-col items-center ${colors.background.primary} p-6 rounded-lg`}
          >
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className={`mt-4 ${colors.text.secondary}`}>
              {t("generalHealth.form.loading")}
            </p>
          </div>
        </div>
      )}

      {mode === "view"
        ? type === "blood-type"
          ? renderBloodTypeView()
          : renderItemsListView()
        : type === "blood-type"
        ? renderBloodTypeForm()
        : renderItemForm()}
    </div>
  );
};

export default GeneralHealthForm;
