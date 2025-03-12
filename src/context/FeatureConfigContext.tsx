import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { apiService } from "../services/api/apiService";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Define the structure of our feature configuration
export interface FeatureConfig {
  allowAllActions: boolean;
}

export interface AppConfig {
  features: FeatureConfig;
}

// Default configuration values
const DEFAULT_CONFIG: AppConfig = {
  features: {
    allowAllActions: false,
  }
};

// Context type definition
interface FeatureConfigContextType {
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  canPerformAction: (
    action: "add" | "edit" | "delete",
    entityType?: string
  ) => boolean;
}

// Create the context
const FeatureConfigContext = createContext<
  FeatureConfigContextType | undefined
>(undefined);

// Props for provider component
interface FeatureConfigProviderProps {
  children: ReactNode;
}

// Create the provider component
export const FeatureConfigProvider: React.FC<FeatureConfigProviderProps> = ({
  children,
}) => {
  const [configData, setConfigData] = useLocalStorage<AppConfig>(
    "app-config",
    DEFAULT_CONFIG
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    refreshConfig();
  }, []);

  // Function to fetch configuration from API
  const refreshConfig = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getConfig();

      if (response.success && response.data) {
        setConfigData(response.data);
      } else {
        // If API fails but we have cached config, continue using it
        console.warn("Using cached config due to API failure");
        setError("Failed to fetch latest configuration");
      }
    } catch (err) {
      console.error("Error fetching configuration:", err);
      setError("Failed to fetch configuration");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if a specific action is allowed
  const canPerformAction = (
    action: "add" | "edit" | "delete",
  ): boolean => {
    // Check if all actions are allowed via the feature flag
    if (configData.features.allowAllActions) {
      return true;
    }
    // Default permissions - enable only add and edit, but not delete
    return action === "add" || action === "edit";
  };

  return (
    <FeatureConfigContext.Provider
      value={{
        config: configData,
        isLoading,
        error,
        refreshConfig,
        canPerformAction,
      }}
    >
      {children}
    </FeatureConfigContext.Provider>
  );
};

// Custom hook to use the feature config context
export const useFeatureConfig = (): FeatureConfigContextType => {
  const context = useContext(FeatureConfigContext);
  if (context === undefined) {
    throw new Error(
      "useFeatureConfig must be used within a FeatureConfigProvider"
    );
  }
  return context;
};
