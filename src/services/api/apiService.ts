import axios from "axios";
import { API_CONFIG } from "./config";
import { setupCache, buildStorage } from "axios-cache-interceptor";
import { env } from "../../config/env";
import type { ApiResponse } from "./types";
import { AppConfig } from "../../context/FeatureConfigContext";
import {
  GeneralHealthData,
  Allergy,
  Medication,
  HealthCondition,
  FamilyHistory
} from "../../types/generalHealth";
import { 
  dashboardSections, 
  userProfile, 
  mockConfig,
  mockHealthCenters,
  mockMedications // Import the medications mock data
} from "../../data/mockData";

// Cache storage configuration
const cacheStorage = buildStorage({
  set: async (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  find: async (key) => JSON.parse(localStorage.getItem(key) || "null"),
  remove: async (key) => localStorage.removeItem(key),
  clear: async () => localStorage.clear(),
});

// Mock data store
const mockStore = {
  userProfile: { ...userProfile },
  sections: JSON.parse(JSON.stringify(dashboardSections)),
  config: { ...mockConfig },
  generalHealth: {
    bloodType: "O+",
    allergies: [] as Allergy[],
    medications: [] as Medication[],
    conditions: [],
    surgeries: [],
    healthConditions: [] as HealthCondition[],
    familyHistory: [] as FamilyHistory[],
  },
  healthCenters: [...mockHealthCenters],
  medications: {
    current: [...mockMedications.current],
    previous: [...mockMedications.previous]
  }
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add caching
const api = setupCache(axiosInstance, {
  ttl: API_CONFIG.cacheTime,
  storage: cacheStorage,
});

// Helper for mock delay
const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 500));

// API service
export const apiService = {
  // New method to get application configuration
  getConfig: async (): Promise<ApiResponse<AppConfig>> => {
    if (env.USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          ...mockStore.config,
          features: {
            ...mockStore.config.features,
            // Override with env variable
            allowAllActions:
              env.ALLOW_ALL_ACTIONS ||
              mockStore.config.features.allowAllActions,
          },
        },
      };
    }
    const response = await api.get("/config");
    return response.data;
  },

  getDashboard: async () => {
    if (env.USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          userProfile: mockStore.userProfile,
          sections: mockStore.sections,
        },
      };
    }
    const response = await api.get("/dashboard");
    return response.data;
  },

  updateVitals: async (type: string, data: { value: any; history: any[] }) => {
    if (env.USE_MOCK) {
      await mockDelay();
      const sectionIndex = mockStore.sections.findIndex(
        (s: { id: string }) => s.id === "vitals"
      );
      if (sectionIndex >= 0) {
        const itemIndex = mockStore.sections[sectionIndex].items.findIndex(
          (i: { type: string }) => i.type === type
        );
        if (itemIndex >= 0) {
          mockStore.sections[sectionIndex].items[itemIndex].value = data.value;
        }
      }
      return { success: true, message: "Vitals updated successfully" };
    }
    const response = await api.post(`/vitals/${type}`, data);
    return response.data;
  },

  updateMedicationsByType: async (
    type: "current" | "previous",
    data: any[]
  ) => {
    if (env.USE_MOCK) {
      await mockDelay();
      return { success: true, message: "Medications updated successfully" };
    }
    const response = await api.post(`/medications/${type}`, { data });
    return response.data;
  },

  getGeneralHealth: async (): Promise<ApiResponse<GeneralHealthData>> => {
    if (env.USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: mockStore.generalHealth,
      };
    }
    const response = await api.get("/general-health");
    return response.data;
  },

  updateBloodType: async (bloodType: string): Promise<ApiResponse> => {
    if (env.USE_MOCK) {
      await mockDelay();
      mockStore.generalHealth.bloodType = bloodType;
      return {
        success: true,
        message: "Blood type updated successfully",
      };
    }
    const response = await api.put("/general-health/blood-type", { bloodType });
    return response.data;
  },

  updateAllergies: async (allergies: Allergy[]): Promise<ApiResponse> => {
    if (env.USE_MOCK) {
      await mockDelay();
      mockStore.generalHealth.allergies = allergies;
      return {
        success: true,
        message: "Allergies updated successfully",
      };
    }
    const response = await api.put("/general-health/allergies", { allergies });
    return response.data;
  },

  updateMedications: async (
    medications: Medication[]
  ): Promise<ApiResponse> => {
    if (env.USE_MOCK) {
      await mockDelay();
      mockStore.generalHealth.medications = medications;
      return {
        success: true,
        message: "Medications updated successfully",
      };
    }
    const response = await api.put("/general-health/medications", {
      medications,
    });
    return response.data;
  },

  updateHealthConditions: async (
    data: HealthCondition[]
  ): Promise<ApiResponse> => {
    if (env.USE_MOCK) {
      await mockDelay();
      mockStore.generalHealth.healthConditions = data;
      return {
        success: true,
        message: "Health conditions updated successfully",
      };
    }
    const response = await api.put("/general-health/conditions", { data });
    return response.data;
  },

  updateFamilyHistory: async (data: FamilyHistory[]): Promise<ApiResponse> => {
    if (env.USE_MOCK) {
      await mockDelay();
      mockStore.generalHealth.familyHistory = data;
      return {
        success: true,
        message: "Family history updated successfully",
      };
    }
    const response = await api.put("/general-health/family-history", { data });
    return response.data;
  },
  getNearestHealthCenter: async (location: {
    latitude: number;
    longitude: number;
  }): Promise<ApiResponse> => {
    if (env.USE_MOCK) {
      await mockDelay();
      
      // Get centers from mock store
      const centers = mockStore.healthCenters;
      
      if (!centers || centers.length === 0) {
        return {
          success: false,
          message: "No health centers found"
        };
      }
      
      // Calculate distances to find nearest center
      // Using Haversine formula would be ideal, but for mock data we'll use a simpler approach
      const findNearest = (centers: any[], location: { latitude: number; longitude: number }) => {
        // Simple distance calculation for mock data
        return centers.map(center => {
          const latDiff = Math.abs(center.location.latitude - location.latitude);
          const lngDiff = Math.abs(center.location.longitude - location.longitude);
          // Crude distance calculation, just for mock data
          const calculatedDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Approx km
          return {
            ...center,
            distance: Number(calculatedDistance.toFixed(1))
          };
        }).sort((a, b) => a.distance - b.distance)[0];
      };
      
      const nearestCenter = findNearest(centers, location);
      
      return {
        success: true,
        data: nearestCenter
      };
    }
    
    const response = await api.get("/health-centers/nearest", {
      params: location,
    });
    return response.data;
  },
  getMedications: async (type: 'current' | 'previous'): Promise<ApiResponse> => {
    if (env.USE_MOCK) {
      await mockDelay();
      
      return {
        success: true,
        data: mockStore.medications[type]
      };
    }
    
    const response = await api.get(`/medications/${type}`);
    return response.data;
  },
};

export default api;
