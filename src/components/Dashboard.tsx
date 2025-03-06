// src/components/Dashboard.tsx (modified)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { ChevronRight, Moon, Sun, Languages } from "lucide-react";
import * as Icons from "lucide-react";
import { apiService } from "../services/apiService";

// Type for dynamic icon component
type IconName = keyof typeof Icons;

interface DashboardData {
  userProfile: {
    id: string;
    name: string;
    gender: string;
    birthDate: string;
    healthRecordId: string;
  };
  sections: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
    items: Array<{
      id: string;
      title: string;
      type: string;
      icon: string;
      count?: number;
      value?: string | number;
    }>;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { toggleLanguage } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await apiService.getDashboard();
        if (response.success && response.data) {
          setDashboardData(response.data);
          setError(null);
        } else {
          setError(response.error || "Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Error connecting to the server");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Calculate age based on birthDate
  const calculateAge = (birthDateStr: string) => {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return t("greeting.morning");
    } else if (hour >= 12 && hour < 17) {
      return t("greeting.afternoon");
    } else {
      return t("greeting.evening");
    }
  };

  // Navigation handlers
  const navigateToSection = (section: string, type: string = "") => {
    navigate(`/${section}${type ? "/" + type : ""}`);
  };

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    const RawIcon = Icons[iconName as IconName];
    if (!RawIcon) return null;

    // If the icon function expects more than one argument, then it's not a valid JSX component.
    // You might handle this case differently as needed.
    if (typeof RawIcon === "function" && RawIcon.length > 1) {
      return null;
    }

    const IconComponent = RawIcon as React.FC<React.SVGProps<SVGSVGElement>>;
    return <IconComponent width={20} height={20} />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <h3 className="font-bold mb-2">خطأ</h3>
        <p>{error}</p>
      </div>
    );
  }

  // No data
  if (!dashboardData) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
        <h3 className="font-bold mb-2">تنبيه</h3>
        <p>لا توجد بيانات متاحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action buttons section */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            toggleTheme();
            // Force refresh DOM to ensure theme changes are applied
            setTimeout(() => {
              const currentTheme = document.documentElement.classList.contains(
                "dark"
              )
                ? "dark"
                : "light";
              if (currentTheme !== theme) {
                if (currentTheme === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              }
            }, 10);
          }}
          className="p-2 bg-white dark:bg-gray-700 rounded-full shadow transition-colors ml-2"
          aria-label={
            theme === "dark" ? t("settings.lightMode") : t("settings.darkMode")
          }
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} />
          )}
        </button>
        <button
          onClick={toggleLanguage}
          className="p-2 bg-white dark:bg-gray-700 rounded-full shadow transition-colors"
          aria-label={t("settings.language")}
        >
          <Languages size={20} className="dark:text-gray-200" />
        </button>
      </div>

      {/* User profile section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden transition-colors">
            {/* User avatar placeholder */}
            <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-xl transition-colors">
              {dashboardData.userProfile.name?.charAt(0) || "ع"}
            </div>
          </div>
          <div className="mr-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
              {getGreeting()}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors">
              {dashboardData.userProfile.name}
              {dashboardData.userProfile.birthDate &&
                `, ${calculateAge(dashboardData.userProfile.birthDate)} ${t(
                  "profile.age"
                )}`}
            </p>

            {/* Health Record ID */}
            <div className="mt-2 flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 transition-colors">
                {t("profile.healthRecordId")}:
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors">
                {dashboardData.userProfile.healthRecordId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Render sections dynamically from dashboard data */}
      {dashboardData.sections.map((section) => (
        <div
          key={section.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors"
        >
          <div
            className={`bg-gradient-to-r from-${section.color}-50 to-white dark:from-${section.color}-900/20 dark:to-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 transition-colors`}
          >
            <div className="flex items-center">
              <div
                className={`p-2 bg-${section.color}-100 dark:bg-${section.color}-900/30 rounded-full transition-colors`}
              >
                {getIconComponent(section.icon)}
              </div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mr-3 transition-colors">
                {t(section.title)}
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
            {section.items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigateToSection(section.id, item.type)}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-900 dark:text-white transition-colors">
                    {t(item.title)}
                  </h3>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="mr-2 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                  {item.value !== undefined && (
                    <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                      {item.value}
                    </span>
                  )}
                </div>
                <ChevronRight
                  className="text-gray-400 dark:text-gray-500"
                  size={20}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
