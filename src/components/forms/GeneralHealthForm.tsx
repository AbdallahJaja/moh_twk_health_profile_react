// src/components/forms/GeneralHealthForm.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHealthData } from "../../context/HealthDataContext";
import { Users, Plus, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { GeneralHealthFormSkeleton } from "../common/skeletons";
import { apiService } from "../../services/api/apiService";
import { useTranslation } from "react-i18next";
import { FamilyRelation } from "../../types/generalHealth";

interface GeneralHealthFormProps {
  type?: string;
  title?: string;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const FAMILY_RELATIONS: FamilyRelation[] = [
  "father",
  "mother",
  "brother",
  "sister",
  "grandfather",
  "grandmother",
  "uncle",
  "aunt",
  "cousin",
  "other",
];

const GeneralHealthForm: React.FC<GeneralHealthFormProps> = ({
  type: propType,
  title: propTitle,
}) => {
  const { t } = useTranslation();
  const params = useParams<{ type?: string }>();
  const { healthData, updateData, isLoading } = useHealthData();

  // Use prop type or param type
  const type = propType || params.type;
  // Use prop title or generate from type
  const title = propTitle || getFormTitle(type);

  // Form states
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [generalData, setGeneralData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Get form title based on type
  function getFormTitle(formType?: string): string {
    switch (formType) {
      case "blood-type":
        return "فصيلة الدم";
      case "health-conditions":
        return "الحالات الصحية";
      case "family-history":
        return "التاريخ المرضي للعائلة";
      default:
        return "معلومات صحية عامة";
    }
  }

  // Initialize data from context
  useEffect(() => {
    if (healthData && healthData.general && type) {
      switch (type) {
        case "blood-type":
          setGeneralData(healthData.general.bloodType);
          break;
        case "health-conditions":
          setGeneralData(healthData.general.healthConditions || []);
          break;
        case "family-history":
          setGeneralData(healthData.general.familyHistory || []);
          break;
      }
    }
  }, [healthData, type]);

  // Format date to local format
  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متوفر";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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
    if (!validateForm()) {
      return;
    }

    setFormError(null);
    let newValue: any = null;

    try {
      switch (type) {
        case "blood-type":
          const bloodTypeResponse = await apiService.updateBloodType(
            formValues.bloodType
          );
          if (bloodTypeResponse.success) {
            newValue = formValues.bloodType;
          } else {
            setFormError(t("errors.updateFailed"));
            return;
          }
          break;

        case "health-conditions":
          if (mode === "add") {
            const newCondition = {
              id: Date.now(),
              name: formValues.name,
              date: new Date().toISOString().split("T")[0],
            };
            newValue = [...(generalData || []), newCondition];
            const conditionsResponse = await apiService.updateHealthConditions(
              newValue
            );
            if (!conditionsResponse.success) {
              setFormError(t("errors.updateFailed"));
              return;
            }
          }
          break;

        case "family-history":
          if (mode === "add") {
            const newHistory = {
              id: Date.now(),
              name: formValues.name,
              relation: formValues.relation,
              date: new Date().toISOString().split("T")[0],
            };
            newValue = [...(generalData || []), newHistory];
            const historyResponse = await apiService.updateFamilyHistory(
              newValue
            );
            if (!historyResponse.success) {
              setFormError(t("errors.updateFailed"));
              return;
            }
          }
          break;
      }

      setGeneralData(newValue);
      setFormSuccess(t("generalHealth.success.update"));
      sessionStorage.removeItem("dashboardData");

      setFormValues({});
      setSelectedItem(null);

      setTimeout(() => {
        setMode("view");
        setFormSuccess(null);
      }, 1500);
    } catch (error) {
      setFormError(t("errors.unexpected"));
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id: number) => {
    if (!type || (type !== "health-conditions" && type !== "family-history")) {
      return;
    }

    try {
      const updatedItems = (generalData as any[]).filter(
        (item) => item.id !== id
      );

      const response =
        type === "health-conditions"
          ? await apiService.updateHealthConditions(updatedItems)
          : await apiService.updateFamilyHistory(updatedItems);

      if (response.success) {
        setGeneralData(updatedItems);
        setFormSuccess(t("generalHealth.success.delete"));
        sessionStorage.removeItem("dashboardData");

        setTimeout(() => {
          setFormSuccess(null);
        }, 1500);
      } else {
        setFormError(t("errors.deleteFailed"));
      }
    } catch (error) {
      setFormError(t("errors.unexpected"));
    }
  };

  // Handle selecting an item for editing
  const handleEditItem = (item: any) => {
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
          setFormError("الرجاء اختيار فصيلة الدم");
          return false;
        }
        break;

      case "health-conditions":
        if (!formValues.name || !formValues.name.trim()) {
          setFormError("الرجاء إدخال اسم الحالة الصحية");
          return false;
        }
        break;

      case "family-history":
        if (!formValues.name?.trim()) {
          setFormError(t("validation.required.name"));
          return false;
        }
        if (!formValues.relation) {
          setFormError(t("validation.required.relation"));
          return false;
        }

        break;
    }

    return true;
  };

  const getTitle = () => {
    return t(`generalHealth.${type}.title`);
  };

  // Render view mode
  const renderViewMode = () => {
    if (type === "blood-type") {
      return (
        <div>
          {/* Header with edit button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-base-content">{getTitle()}</h2>
            <button
              onClick={() => {
                setMode("add");
                setFormValues({ bloodType: generalData || "" });
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                         transition-colors duration-200"
            >
              {t('actions.update')}
            </button>
          </div>

          {/* Success message */}
          {formSuccess && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 
                           text-green-700 dark:text-green-300 rounded-md 
                           flex items-center rtl-space">
              <Check size={16} />
              {formSuccess}
            </div>
          )}

          {/* Blood type display */}
          <div className="bg-base-content rounded-lg p-6">
            {generalData ? (
              <div className="text-center">
                <span className="text-4xl font-bold text-base-content">
                  {generalData}
                </span>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                {t('generalHealth.noData')}
              </div>
            )}
          </div>
        </div>
      );
    } else if (type === "health-conditions") {
      return (
        <div>
          {/* Header with add button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{getTitle()}</h2>
            <button
              onClick={() => {
                setMode("add");
                setFormValues({});
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
            >
              <Plus size={16} className="ml-1" />
              إضافة
            </button>
          </div>

          {/* Success message */}
          {formSuccess && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
              <Check size={16} className="ml-2" />
              {formSuccess}
            </div>
          )}

          {/* Items list */}
          {!Array.isArray(generalData) || generalData.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Users size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {t(`generalHealth.${type}.noData`)}
              </p>
              <button
                onClick={() => setMode("add")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md inline-flex 
                           items-center hover:bg-blue-600 transition-colors rtl-space"
              >
                <Plus size={16} className="rtl:ml-1 ltr:mr-1" />
                {t('actions.add')}
              </button>
            </div>
          ) : (
            renderHealthConditionsList()
          )}
        </div>
      );
    } else {
      // Family history
      return (
        <div>
          {/* Header with add button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{getTitle()}</h2>
            <button
              onClick={() => {
                setMode("add");
                setFormValues({});
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
            >
              <Plus size={16} className="ml-1" />
              إضافة
            </button>
          </div>

          {/* Success message */}
          {formSuccess && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
              <Check size={16} className="ml-2" />
              {formSuccess}
            </div>
          )}

          {/* Items list */}
          {!Array.isArray(generalData) || generalData.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Users size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {t(`generalHealth.${type}.noData`)}
              </p>
              <button
                onClick={() => setMode("add")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md inline-flex 
                           items-center hover:bg-blue-600 transition-colors rtl-space"
              >
                <Plus size={16} className="rtl:ml-1 ltr:mr-1" />
                {t('actions.add')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {generalData.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm 
                             border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      {type === "family-history" && item.relation && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('generalHealth.familyHistory.relation')}: {t(`generalHealth.familyHistory.relations.${item.relation}`)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('generalHealth.dateRecorded')}: {formatDate(item.date)}
                      </p>
                    </div>
                    <div className="flex items-center rtl-space">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 
                                 dark:hover:text-blue-300 transition-colors"
                      >
                        {t('actions.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 
                                 dark:hover:text-red-300 transition-colors"
                      >
                        {t('actions.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  // Render add/edit form for blood type
  const renderBloodTypeForm = () => (
    <div>
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => {
            setMode("view");
            setFormValues({});
            setFormError(null);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowRight size={20} />
        </button>
        <h2 className="text-xl font-bold mr-2">تحديد فصيلة الدم</h2>
      </div>

      {/* Error message */}
      {formError && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertTriangle size={16} className="ml-2" />
          {formError}
        </div>
      )}

      {/* Success message */}
      {formSuccess && (
        <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
          <Check size={16} className="ml-2" />
          {formSuccess}
        </div>
      )}

      {/* Blood type selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر فصيلة الدم
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bloodTypes.map((bloodType) => (
            <div
              key={bloodType}
              className={`
                p-3 border rounded-md cursor-pointer text-center
                ${
                  formValues.bloodType === bloodType
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }
              `}
              onClick={() => handleInputChange("bloodType", bloodType)}
            >
              <span className="text-lg font-medium">{bloodType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          disabled={isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );

  // Render add/edit form for health conditions or family history
  const renderItemForm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center rtl-space">
        <button
          onClick={() => setMode("view")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                     text-gray-500 dark:text-gray-400"
        >
          <ArrowRight size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white rtl:mr-2 ltr:ml-2">
          {mode === "add" 
            ? t(`generalHealth.${type}.addTitle`) 
            : t(`generalHealth.${type}.editTitle`)}
        </h2>
      </div>

      {/* Form inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t(`generalHealth.${type}.labels.name`)}
          </label>
          <input
            type="text"
            value={formValues.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="mt-1 w-full px-4 py-2 rounded-md 
                       border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700
                       text-gray-900 dark:text-white 
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder={t(`generalHealth.${type}.placeholders.name`)}
          />
        </div>

        {type === "family-history" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('generalHealth.familyHistory.labels.relation')}
            </label>
            <select
              value={formValues.relation || ""}
              onChange={(e) => handleInputChange("relation", e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-md
                         border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700
                         text-gray-900 dark:text-white"
            >
              <option value="">
                {t('generalHealth.familyHistory.placeholders.relation')}
              </option>
              {FAMILY_RELATIONS.map((relation) => (
                <option key={relation} value={relation}>
                  {t(`generalHealth.familyHistory.relations.${relation}`)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end rtl-space">
        <button
          onClick={() => setMode("view")}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-md 
                     hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {t('actions.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md 
                     hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? t('actions.saving') : t('actions.save')}
        </button>
      </div>
    </div>
  );

  const renderFamilyHistoryForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("generalHealth.familyHistory.labels.name")}
        </label>
        <input
          type="text"
          name="name"
          value={formValues.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t("generalHealth.familyHistory.placeholders.name")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("generalHealth.familyHistory.labels.relation")}
        </label>
        <select
          name="relation"
          value={formValues.relation || ""}
          onChange={(e) => handleInputChange("relation", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">
            {t("generalHealth.familyHistory.placeholders.relation")}
          </option>
          {FAMILY_RELATIONS.map((relation) => (
            <option key={relation} value={relation}>
              {t(`generalHealth.familyHistory.relations.${relation}`)}
            </option>
          ))}
        </select>
      </div>

      {formError && <p className="text-sm text-red-600 mt-1">{formError}</p>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => setMode("view")}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          {t("actions.cancel")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {t("actions.save")}
        </button>
      </div>
    </div>
  );

  const renderHealthConditionForm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center rtl-space">
        <button
          onClick={() => setMode("view")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                     text-gray-500 dark:text-gray-400 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white rtl:mr-2 ltr:ml-2">
          {mode === "add" 
            ? t('generalHealth.health-conditions.addTitle') 
            : t('generalHealth.health-conditions.editTitle')}
        </h2>
      </div>

      {/* Form inputs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('generalHealth.health-conditions.labels.name')}
        </label>
        <input
          type="text"
          value={formValues.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder={t('generalHealth.health-conditions.placeholders.name')}
          className="w-full px-4 py-2 rounded-md 
                     border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700
                     text-gray-900 dark:text-white 
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                     transition-colors"
        />
      </div>

      {/* Error message */}
      {formError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md 
                       text-red-700 dark:text-red-300 flex items-center rtl-space">
          <AlertTriangle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end rtl-space">
        <button
          onClick={() => setMode("view")}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-md 
                     hover:bg-gray-50 dark:hover:bg-gray-700
                     transition-colors"
        >
          {t('actions.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md 
                     hover:bg-blue-600 disabled:opacity-50
                     transition-colors"
        >
          {isLoading ? t('actions.saving') : t('actions.save')}
        </button>
      </div>
    </div>
  );

  // Update the renderViewMode function for health conditions list
  const renderHealthConditionsList = () => (
    <div className="space-y-4">
      {generalData.map((condition: any) => (
        <div 
          key={condition.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg
                     border border-gray-200 dark:border-gray-700
                     shadow-sm transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {condition.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('generalHealth.dateRecorded')}: {formatDate(condition.date)}
              </p>
            </div>
            <div className="flex items-center rtl-space">
              <button
                onClick={() => handleEditItem(condition)}
                className="p-2 text-blue-500 hover:text-blue-700 
                           dark:text-blue-400 dark:hover:text-blue-300
                           transition-colors"
              >
                {t('actions.edit')}
              </button>
              <button
                onClick={() => handleDeleteItem(condition.id)}
                className="p-2 text-red-500 hover:text-red-700
                           dark:text-red-400 dark:hover:text-red-300
                           transition-colors"
              >
                {t('actions.delete')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Main render
  if (isLoading) {
    return <GeneralHealthFormSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800  rounded-lg shadow-sm p-6">
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري معالجة البيانات...</p>
          </div>
        </div>
      )}

      {mode === "view"
        ? renderViewMode()
        : type === "blood-type"
        ? renderBloodTypeForm()
        : type === "health-conditions"
        ? renderHealthConditionForm()
        : renderItemForm()}
    </div>
  );
};

export default GeneralHealthForm;
