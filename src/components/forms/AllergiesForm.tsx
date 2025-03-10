// src/components/forms/AllergiesForm.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHealthData } from "../../context/HealthDataContext";
import { 
  Heart, 
  Plus, 
  ArrowLeft,
  ArrowRight, 
  Check, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronRight, 
  AlertTriangle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { AllergiesFormSkeleton } from '../common/skeletons';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AllergiesFormProps {
  type?: string;
  title?: string;
}

const severityOptions = [
  { id: "mild", labelKey: "allergies.severity.mild", color: "yellow" },
  { id: "moderate", labelKey: "allergies.severity.moderate", color: "orange" },
  { id: "severe", labelKey: "allergies.severity.severe", color: "red" },
];

const getSeverityStyles = (severity: string): string => {
  switch (severity) {
    case 'mild':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    case 'moderate':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    case 'severe':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  }
};

const AllergiesForm: React.FC<AllergiesFormProps> = ({
  type: propType,
  title: propTitle,
}) => {
  const { t } = useTranslation();
  const params = useParams<{ type?: string }>();
  const { healthData, updateData, isLoading } = useHealthData();
  const { language } = useLanguage();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  // Use prop type or param type
  const type = propType || params.type;
  // Use prop title or generate from type
  const title = propTitle || getFormTitle(type);

  // Form states
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [allergies, setAllergies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAllergy, setSelectedAllergy] = useState<any>(null);
  const [allergyName, setAllergyName] = useState("");
  const [severity, setSeverity] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    itemId: number | null;
  }>({
    isOpen: false,
    itemId: null
  });

  // Add state for filtered suggestions
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get form title based on type
  function getFormTitle(formType?: string): string {
    return t(`allergies.types.${formType || 'default'}.title`);
  }

  // Suggestions based on type
  const getSuggestions = (): string[] => {
    try {
      const suggestions = t(`allergies.suggestions.${type}`, { returnObjects: true });
      return Array.isArray(suggestions)
        ? suggestions.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  };

  // Add handleSuggestionFilter function
  const handleSuggestionFilter = (value: string) => {
    const allSuggestions = getSuggestions();
    const filtered = allSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
  };

  // Add handleSuggestionSelect function
  const handleSuggestionSelect = (suggestion: string) => {
    setAllergyName(suggestion);
    setShowSuggestions(false);
  };

  // Initialize allergies from context
  useEffect(() => {
    if (healthData && healthData.allergies && type) {
      switch (type) {
        case "medicine":
          setAllergies(healthData.allergies.medicine || []);
          break;
        case "food":
          setAllergies(healthData.allergies.food || []);
          break;
        case "material":
          setAllergies(healthData.allergies.material || []);
          break;
        case "doctor":
          setAllergies(healthData.allergies.doctor || []);
          break;
        default:
          setAllergies([]);
      }
    }
  }, [healthData, type]);

  // Handle adding a new allergy
  const handleAddAllergy = async () => {
    try {
      setIsSubmitting(true);
      // Validate form
      if (!allergyName.trim()) {
        setFormError(t('validation.required.name'));
        return;
      }

      if (!severity) {
        setFormError(t('validation.required.severity'));
        return;
      }

      if (!type) {
        setFormError(t('validation.required.type'));
        return;
      }

      // Clear errors
      setFormError(null);

      // Create new allergy object
      const newAllergy = {
        id: Date.now(),
        name: allergyName.trim(),
        severity,
        date: new Date().toISOString().split("T")[0],
      };

      // Add to allergies list
      const updatedAllergies = [...allergies, newAllergy];

      // Update context data
      if (!type) {
        setFormError("نوع الحساسية غير محدد");
        return;
      }

      if (!type) {
        setFormError("نوع الحساسية غير محدد");
        return;
      }
  
      if (!type) return false;
      const success = await updateData("allergies", type, updatedAllergies);
  
      if (success) {
        setAllergies(updatedAllergies);
        setFormSuccess(t('allergies.success.add'));
        sessionStorage.removeItem("dashboardData"); // Clear cached data
        // Don't clear form immediately
        setTimeout(() => {
          setMode("list");
          setFormSuccess(null);
          // Reset form after transition
          setAllergyName("");
          setSeverity("");
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating an existing allergy
  const handleUpdateAllergy = async () => {
    if (!selectedAllergy) return;

    // Validate form
    if (!allergyName.trim()) {
      setFormError(t('validation.required.name'));
      return;
    }

    if (!severity) {
      setFormError(t('validation.required.severity'));
      return;
    }

    if (!type) {
      setFormError(t('validation.required.type'));
      return;
    }

    // Clear errors
    setFormError(null);

    // Update allergy object
    const updatedAllergy = {
      ...selectedAllergy,
      name: allergyName.trim(),
      severity,
      date: new Date().toISOString().split("T")[0], // Update date to today
    };

    // Update allergies list
    const updatedAllergies = allergies.map((allergy) =>
      allergy.id === selectedAllergy.id ? updatedAllergy : allergy
    );

    // Update context data
    if (!type) {
      setFormError("نوع الحساسية غير محدد");
      return;
    }

    const success = await updateData("allergies", type, updatedAllergies);

    if (success) {
      setAllergies(updatedAllergies);
      setFormSuccess(t('allergies.success.update'));
      sessionStorage.removeItem("dashboardData"); // Clear cached data

      // Reset form
      setSelectedAllergy(null);
      setAllergyName("");
      setSeverity("");

      // Switch back to list mode after a delay
      setTimeout(() => {
        setMode("list");
        setFormSuccess(null);
      }, 1500);
    }
  };

  // Handle deleting an allergy
  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({
      isOpen: true,
      itemId: id
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.itemId === null) return;
  
    const updatedAllergies = allergies.filter(
      (allergy) => allergy.id !== deleteConfirm.itemId
    );
    if (!type) return;
    const success = await updateData("allergies", type, updatedAllergies);
  
    if (success) {
      setAllergies(updatedAllergies);
      setFormSuccess(t('allergies.success.delete'));
      sessionStorage.removeItem("dashboardData");
  
      setTimeout(() => {
        setFormSuccess(null);
      }, 1500);
    }
  
    setDeleteConfirm({ isOpen: false, itemId: null });
  };

  // Handle selecting an allergy for editing
  const handleEditAllergy = (allergy: any) => {
    setSelectedAllergy(allergy);
    setAllergyName(allergy.name);
    setSeverity(allergy.severity);
    setMode("edit");
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setAllergyName(suggestion);
    setSearchTerm("");
  };

  // Format date to local format
  const formatDate = (dateString: string) => {
    if (!dateString) return t('common.notAvailable');

    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      calendar: "gregory"
    }).format(date);
  };

  // Render list view
  const renderListView = () => (
    <div>
      {/* Header with add button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t(`allergies.types.${type}.title`)}
        </h2>
        <button
          onClick={() => setMode("add")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md 
                   flex items-center transition-colors disabled:opacity-50"
          disabled={type === "doctor"}
        >
          <Plus size={16} className="rtl:ml-2 ltr:mr-2" />
          {t('allergies.actions.add')}
        </button>
      </div>

      {/* Success message */}
      {formSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 
                      dark:text-green-300 rounded-md flex items-center">
          <Check size={16} className="rtl:ml-2 ltr:mr-2" />
          {formSuccess}
        </div>
      )}

      {/* Empty state */}
      {allergies.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Heart size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {t('allergies.noData')}
          </p>
          {type !== "doctor" && (
            <button
              onClick={() => setMode("add")}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
                       rounded-md inline-flex items-center transition-colors"
            >
              <Plus size={16} className="rtl:ml-2 ltr:mr-2" />
              {t('allergies.actions.add')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {allergies.map((allergy) => (
            <div
              key={allergy.id}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm 
                       border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {allergy.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('allergies.dateRecorded')}: {formatDate(allergy.date)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`
                    px-2 py-1 text-xs rounded-full rtl:ml-2 ltr:mr-2
                    ${getSeverityStyles(allergy.severity)}
                  `}>
                    {t(`allergies.severity.${allergy.severity}`)}
                  </span>

                  {type !== "doctor" && (
                    <div className="flex rtl:space-x-reverse space-x-2">
                      <button
                        onClick={() => handleEditAllergy(allergy)}
                        className="p-1 text-blue-500 hover:text-blue-700 
                                 dark:text-blue-400 dark:hover:text-blue-300
                                 transition-colors"
                      >
                        <Edit2 size={16} />
                        <span className="sr-only">{t('actions.edit')}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(allergy.id)}
                        className="p-1 text-red-500 hover:text-red-700
                                 dark:text-red-400 dark:hover:text-red-300
                                 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">{t('actions.delete')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render add/edit form
  const renderForm = () => (
    <div>
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => {
            setMode("list");
            setSelectedAllergy(null);
            setAllergyName("");
            setSeverity("");
            setFormError(null);
          }}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                   text-gray-400 dark:text-gray-200 transition-colors"
        >
          {direction === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white rtl:mr-2 ltr:ml-2">
          {mode === "add" 
            ? t('allergies.form.addTitle') 
            : t('allergies.form.editTitle')}
        </h2>
      </div>

      {/* Error message */}
      {formError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 
                       dark:text-red-300 rounded-md flex items-center">
          <AlertTriangle size={16} className="rtl:ml-2 ltr:mr-2" />
          {t(`validation.${formError}`)}
        </div>
      )}

      {/* Search box with suggestions */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('allergies.form.nameLabel')}
        </label>
        <div className="relative">
          <input
            type="text"
            value={allergyName}
            onChange={(e) => {
              setAllergyName(e.target.value);
              handleSuggestionFilter(e.target.value);
            }}
            onFocus={() => handleSuggestionFilter(allergyName)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking them
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                       rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder={t(`allergies.types.${type}.placeholder`)}
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 
                           border border-gray-200 dark:border-gray-600 rounded-md 
                           shadow-lg max-h-60 overflow-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-left text-gray-900 dark:text-white 
                           hover:bg-gray-100 dark:hover:bg-gray-600 
                           focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600"
                  onMouseDown={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Severity selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('allergies.severity.label')}
        </label>
        <div className="space-y-2">
          {severityOptions.map((option) => (
            <div
              key={option.id}
              className={`
                p-3 border rounded-md cursor-pointer flex items-center
                transition-colors
                ${
                  severity === option.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }
              `}
              onClick={() => setSeverity(option.id)}
            >
              <div
                className={`
                w-5 h-5 rounded-full flex items-center justify-center 
                transition-colors
                ${
                  severity === option.id
                    ? "bg-blue-500 dark:bg-blue-400"
                    : "border border-gray-300 dark:border-gray-500"
                }
              `}
              >
                {severity === option.id && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              <span className="rtl:mr-2 ltr:ml-2 text-gray-900 dark:text-white">
                {t(option.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          onClick={mode === "add" ? handleAddAllergy : handleUpdateAllergy}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md
                     transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading 
            ? t('actions.saving') 
            : mode === "add" 
              ? t('actions.add') 
              : t('actions.update')}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return <AllergiesFormSkeleton />;
  }

  // Main render
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, itemId: null })}
        onConfirm={handleDeleteConfirm}
        title={t('allergies.confirm.delete.title')}
        message={t('allergies.confirm.delete.message')}
      />
      {mode === "list" ? renderListView() : renderForm()}
    </div>
  );
};

export default AllergiesForm;
