// src/context/HealthDataContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { updateHealthData } from '../services/healthService';
import { apiService } from '../services/api/apiService';
import { Section } from '../data/mockData';
// import { useLocalStorage } from '../hooks/useLocalStorage';

// Health data type definitions
interface HealthData {
  allergies: {
    medicine: any[];
    food: any[];
    material: any[];
    doctor: any[];
  };
  vitals: {
    bmi: { value: number | null; history: any[] };
    bloodPressure: { value: any | null; history: any[] };
    bloodGlucose: { value: number | null; history: any[] };
    waist: { value: number | null; history: any[] };
    weight: { value: number | null; history: any[] };
    height: { value: number | null; history: any[] };
  };
  general: {
    bloodType: string | null;
    healthConditions: any[];
    familyHistory: any[];
  };
  lastUpdated: Record<string, string>;
}

interface HealthDataContextType {
  healthData: HealthData;
  updateData: (category: string, type: string, value: any) => Promise<boolean>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

// Define a custom hook for localStorage with expiration
function useLocalStorageWithExpiry(key: string, initialValue: any, expirationInMinutes: number = 30) {
  // Implementation of the localStorage hook with expiry...
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const data = JSON.parse(item);
        const now = new Date();
        if (data.expiry && now.getTime() > data.expiry) {
          // Item has expired, remove it
          window.localStorage.removeItem(key);
          return initialValue;
        }
        return data.value;
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const now = new Date();
      const item = {
        value,
        expiry: now.getTime() + expirationInMinutes * 60 * 1000
      };
      window.localStorage.setItem(key, JSON.stringify(item));
      setStoredValue(value);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export const HealthDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [healthData, setHealthData] = useLocalStorageWithExpiry('healthData', {
    allergies: {
      medicine: [],
      food: [],
      material: [],
      doctor: []
    },
    vitals: {
      bmi: { value: null, history: [] },
      bloodPressure: { value: null, history: [] },
      bloodGlucose: { value: null, history: [] },
      waist: { value: null, history: [] },
      weight: { value: null, history: [] },
      height: { value: null, history: [] }
    },
    general: {
      bloodType: null,
      healthConditions: [],
      familyHistory: []
    },
    lastUpdated: {}
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  // Initialize health data from API/Mock
  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard data from API
      const response = await apiService.getDashboard();
      
      if (response.success && response.data) {
        // Transform dashboard data to HealthData format
        const dashboardData = response.data;
        const newHealthData = { ...healthData };
        
        // Extract values from dashboard sections
        dashboardData.sections.forEach((section: Section) => {
          if (section.id === 'vitals') {
            section.items.forEach(item => {
              if (item.type === 'bmi' && item.value !== undefined) {
              } else if (item.type === 'blood-pressure' && item.value) {
                const [systolic, diastolic] = String(item.value).split('/').map(Number);
                newHealthData.vitals.bloodPressure.value = { systolic, diastolic };
              } else if (item.type === 'blood-glucose' && item.value !== undefined) {
                newHealthData.vitals.bloodGlucose.value = Number(item.value);
              } else if (item.type === 'waist' && item.value !== undefined) {
                newHealthData.vitals.waist.value = Number(item.value);
              } else if (item.type === 'weight' && item.value !== undefined) {
                newHealthData.vitals.weight.value = Number(item.value);
              } else if (item.type === 'height' && item.value !== undefined) {
                newHealthData.vitals.height.value = Number(item.value);
              }
            });
          } else if (section.id === 'general') {
            section.items.forEach(item => {
              if (item.type === 'blood-type' && item.value) {
                newHealthData.general.bloodType = String(item.value);
              }
            });
          }
        });
        
        setHealthData(newHealthData);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch health data');
      }
    } catch (err) {
      console.error('Error loading health data:', err);
      setError('فشل في تحميل البيانات الصحية');
    } finally {
      setIsLoading(false);
    }
  };

  // Update specific health data
  const updateData = async (category: string, type: string, value: any) => {
    try {
      setIsLoading(true);
      
      // Create a deep copy of the current health data
      const updatedData = JSON.parse(JSON.stringify(healthData));
      
      // Update the specific section based on category and type
      if (category === 'allergies') {
        updatedData.allergies[type] = value;
      } else if (category === 'vitals') {
        updatedData.vitals[type] = value;
        
        // Special case for BMI: also update weight and height
        if (type === 'bmi' && value.value !== null) {
          // If weight and height were used to calculate BMI, also update those
          if (updatedData.vitals.weight.value === null && value.calculatedFrom?.weight) {
            updatedData.vitals.weight = {
              value: value.calculatedFrom.weight,
              history: [...(updatedData.vitals.weight.history || []), {
                date: new Date().toISOString().split('T')[0],
                value: value.calculatedFrom.weight
              }].slice(0, 10)
            };
          }
          
          if (updatedData.vitals.height.value === null && value.calculatedFrom?.height) {
            updatedData.vitals.height = {
              value: value.calculatedFrom.height,
              history: [...(updatedData.vitals.height.history || []), {
                date: new Date().toISOString().split('T')[0],
                value: value.calculatedFrom.height
              }].slice(0, 10)
            };
          }
        }
      } else if (category === 'general') {
        updatedData.general[type] = value;
      }
      
      // Update last updated timestamp
      const now = new Date().toISOString();
      updatedData.lastUpdated[`${category}.${type}`] = now;
      
      // Call API to update data
      const apiResult = await updateHealthData(category, type, value);
      
      if (apiResult) {
        // Update local state
        setHealthData(updatedData);
        // Increment data version to trigger a refresh
        setDataVersion(prev => prev + 1);
        setError(null);
        return true;
      } else {
        throw new Error('Failed to update data via API');
      }
    } catch (err) {
      console.error('Error updating health data:', err);
      setError('فشل في تحديث البيانات الصحية');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Force refresh data from API
  const refreshData = async () => {
    await loadHealthData();
  };

  return (
    <HealthDataContext.Provider 
      value={{ 
        healthData, 
        updateData,
        refreshData,
        isLoading, 
        error 
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = (): HealthDataContextType => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};