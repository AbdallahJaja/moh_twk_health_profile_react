import { dashboardSections, userProfile } from "../../data/mockData";
import axios from "axios";
import { API_CONFIG } from "./config";
import { setupCache, buildStorage } from "axios-cache-interceptor";
import { env } from "../../config/env";
import type { ApiResponse } from "./types";
import {
  GeneralHealthData,
  Allergy,
  Medication,
} from "../../types/generalHealth";

// Add types for health conditions
interface HealthCondition {
  id: number;
  name: string;
  date: string;
}

interface FamilyHistory {
  id: number;
  name: string;
  relation: string;
  date: string;
}

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
  generalHealth: {
    bloodType: "O+",
    allergies: [] as Allergy[],
    medications: [] as Medication[],
    conditions: [],
    surgeries: [],
    healthConditions: [] as HealthCondition[],
    familyHistory: [] as FamilyHistory[],
  },
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
      return {
        success: true,
        data: {
          id: 1,
          name: "Mock Health Center",
          distance: "2.5km",
          address: "123 Healthcare St.",
          coordinates: {
            latitude: location.latitude + 0.01,
            longitude: location.longitude + 0.01,
          },
        },
      };
    }
    const response = await api.get("/health-centers/nearest", {
      params: location,
    });
    return response.data;
  },
};

export default api;
