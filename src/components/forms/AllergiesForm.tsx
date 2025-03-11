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
  AlertTriangle,
  Search,
  Info
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { AllergiesFormSkeleton } from '../common/skeletons';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { SectionHeader } from '../common/ui/SectionHeader';
import { Alert } from '../common/ui/Alert';
import { colors } from '../../styles/colors';

interface AllergiesFormProps {
  type?: string;
  title?: string;
}

// Replace with a type-safe constant
const SEVERITY_LEVELS = ['mild', 'moderate', 'severe'] as const;
type SeverityLevel = typeof SEVERITY_LEVELS[number];

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
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      return [];
    }
  };

  const handleSuggestionFilter = (value: string) => {
    const allSuggestions = getSuggestions();
    const filtered = allSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
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
        setFormError(t('validation.required.allergyType'));
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
        setFormError(t('validation.required.allergyType'));
        return;
      }

      if (!type) {
        setFormError(t('validation.required.allergyType'));
        return;
      }
  
      if (!type) return false;
      const success = await updateData("allergies", type, updatedAllergies);
  
      if (success) {
        setAllergies(updatedAllergies);
        setFormSuccess(t("allergies.success.add"));
        sessionStorage.removeItem("dashboardData"); // Clear cached data
        // Don't clear form immediately
        setTimeout(() => {
          // Fade out animation for success message
          const successElement = document.querySelector(".success-alert");
          if (successElement) {
            successElement.classList.add("opacity-0");
          }
          setTimeout(() => {
            setMode("list");
            setFormSuccess(null);
            // Reset form after transition
            setAllergyName("");
            setSeverity("");
          }, 300);
        }, 1500); // Display duration
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
      setFormError(t('validation.required.allergyType'));
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
      setFormError(t('validation.required.allergyType'));
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

      setTimeout(() => {
          // Fade out animation for success message
          const successElement = document.querySelector(".success-alert");
          if (successElement) {
            successElement.classList.add("opacity-0");
          }
      // Switch back to list mode after a delay
      setTimeout(() => {
        setMode("list");
        setFormSuccess(null);
      }, 300);
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
          // Fade out animation for success message
          const successElement = document.querySelector(".success-alert");
          if (successElement) {
            successElement.classList.add("opacity-0");
          }
      setTimeout(() => {
        setFormSuccess(null);
      }, 300);
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
      <SectionHeader 
        title={t(`allergies.types.${type}.title`)}
        action={
          <button
            onClick={() => setMode("add")}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
                     rounded-md flex items-center transition-colors 
                     disabled:opacity-50"
            disabled={type === "doctor"}
          >
            <Plus size={16} className="rtl:ml-2 ltr:mr-2" />
            {t('allergies.actions.add')}
          </button>
        }
      />

      {formSuccess && (
        <Alert type="success" message={formSuccess} />
      )}

      {allergies.length === 0 ? (
        <div className={`
          text-center py-10 ${colors.background.secondary} rounded-lg
        `}>
          <Search size={40} className={`mx-auto ${colors.text.tertiary} mb-3`} />
          <p className={colors.text.secondary}>
            {t('allergies.list.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allergies.map((allergy) => (
            <div
              key={allergy.id}
              className={`
                p-4 rounded-lg shadow-sm border
                ${colors.background.primary}
                ${colors.border.primary}
                transition-all duration-200
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-medium ${colors.text.primary}`}>
                    {allergy.name}
                  </h3>
                  <p className={`mt-1 ${colors.text.secondary}`}>
                    {t(`allergies.severity.${allergy.severity}`)}
                  </p>
                  <p className={`text-sm ${colors.text.tertiary}`}>
                    {formatDate(allergy.date)}
                  </p>
                </div>
                {type !== "doctor" && (
                  <button
                    onClick={() => handleEditAllergy(allergy)}
                    className={`p-2 rounded-full hover:${colors.background.tertiary} 
                             ${colors.text.tertiary} transition-colors`}
                  >
                    <Info size={16} />
                  </button>
                )}
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
      <SectionHeader 
        title={mode === "add" 
          ? t('allergies.form.addTitle') 
          : t('allergies.form.editTitle')}
        back={() => {
          setMode("list");
          setSelectedAllergy(null);
          setAllergyName("");
          setSeverity("");
          setFormError(null);
        }}
      />

      {formError && (
        <Alert type="error" message={formError} />
      )}

      <div className="space-y-6">
        <div>
          <label className={`block text-sm font-medium ${colors.text.secondary} mb-1`}>
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
              className={`
                w-full px-3 py-2 rounded-md
                ${colors.background.primary}
                ${colors.text.primary}
                ${colors.border.primary}
                border focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                transition-colors duration-200
              `}
              placeholder={t(`allergies.types.${type}.placeholder`)}
            />
            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className={`
                absolute z-50 w-full mt-1 rounded-md shadow-lg
                ${colors.background.primary}
                ${colors.border.primary}
                border max-h-60 overflow-auto
              `}>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={`
                      w-full px-4 py-2 text-left
                      ${colors.text.primary}
                      hover:${colors.background.secondary}
                      focus:${colors.background.secondary}
                      focus:outline-none
                      transition-colors duration-200
                    `}
                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium ${colors.text.secondary} mb-1`}>
            {t('allergies.form.severityLabel')}
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
            className={`
              w-full px-3 py-2 rounded-md
              ${colors.background.primary}
              ${colors.text.primary}
              ${colors.border.primary}
              border focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              transition-colors duration-200
            `}
          >
            <option value="">{t('allergies.form.selectSeverity')}</option>
            {SEVERITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {t(`allergies.severity.${level}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4 rtl:space-x-reverse">
          <button
            onClick={mode === "add" ? handleAddAllergy : handleUpdateAllergy}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
                     rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting 
              ? t('actions.saving') 
              : mode === "add" 
                ? t('actions.add') 
                : t('actions.update')}
          </button>
        </div>
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
