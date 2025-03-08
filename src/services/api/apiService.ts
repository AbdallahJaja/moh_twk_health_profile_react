import { dashboardSections, userProfile } from '../../data/mockData';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';
import { CacheAxiosResponse, setupCache } from 'axios-cache-interceptor';
import { buildStorage } from "axios-cache-interceptor";
import { setupMockInterceptor } from './mockInterceptor';
import { env } from '../../config/env';

const cacheStorage = buildStorage({
  set: async (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  find: async (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  remove: async (key) => localStorage.removeItem(key),
  clear: async () => localStorage.clear()
});


const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup mock interceptor before cache
if (env.USE_MOCK) {
  setupMockInterceptor(axiosInstance);
}

// Add caching
const api = setupCache(axiosInstance, {
  ttl: API_CONFIG.cacheTime,
  storage: cacheStorage
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response: CacheAxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number, _retryAuth?: boolean };
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Retry on network errors or 5xx server errors
    if (
      (error.response?.status === 500 || !error.response) &&
      (originalRequest._retry || 0) < API_CONFIG.retryAttempts
    ) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;
      
      await new Promise(resolve => 
        setTimeout(resolve, API_CONFIG.retryDelay * (originalRequest._retry ?? 0))
      );
      
      return api(originalRequest);
    }

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retryAuth) {
      originalRequest._retryAuth = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Handle authentication failure
        window.dispatchEvent(new CustomEvent('auth:required'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Base URL for MOH API
// const BASE_URL = 'https://api.moh.gov.sa/twk/v1';

// Type definitions for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

// Mock server-side data store
let serverMockData = {
  userProfile: { ...userProfile },
  dashboardSections: JSON.parse(JSON.stringify(dashboardSections))
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic fetch function with error handling
const fetchFromApi = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> => {
  try {
    // Log the API call for debugging
    console.log(`API ${method} call to ${endpoint}`, body || '');

    // In a real implementation, this would be a fetch call
    // const response = await fetch(`${BASE_URL}${endpoint}`, {
    //   method,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${await TWK.generateToken()}`
    //   },
    //   body: body ? JSON.stringify(body) : undefined
    // });
    
    // Simulate API delay
    await delay(500);
    
    // Mock API response based on endpoint and method
    return mockApiResponse<T>(endpoint, method, body);
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500
    };
  }
};

// Mock API response handler
const mockApiResponse = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<ApiResponse<T>> => {
  // Dashboard data endpoint
  if (endpoint === '/dashboard' && method === 'GET') {
    return {
      success: true,
      data: {
        userProfile: serverMockData.userProfile,
        sections: serverMockData.dashboardSections
      } as unknown as T,
      code: 200
    };
  }
  
  // User profile endpoint
  if (endpoint === '/user/profile' && method === 'GET') {
    return {
      success: true,
      data: serverMockData.userProfile as unknown as T,
      code: 200
    };
  }
  
  // Update endpoints
  if (endpoint.startsWith('/update/') && method === 'POST' && body) {
    const [, , category, type] = endpoint.split('/');
    
    // Handle different update types
    if (category && type) {
      // For allergies
      if (category === 'allergies') {
        const sectionIndex = serverMockData.dashboardSections.findIndex((s: { id: string }) => s.id === 'allergies');
        if (sectionIndex >= 0) {
          const itemIndex = serverMockData.dashboardSections[sectionIndex].items.findIndex((i: { type: string }) => i.type === type);
          if (itemIndex >= 0) {
            // Update count based on array length
            if (Array.isArray(body.data)) {
              serverMockData.dashboardSections[sectionIndex].items[itemIndex].count = body.data.length;
            }
          }
        }
      }
      
      // For vitals
      if (category === 'vitals') {
        const sectionIndex = serverMockData.dashboardSections.findIndex((s: { id: string }) => s.id === 'vitals');
        if (sectionIndex >= 0) {
          const itemIndex = serverMockData.dashboardSections[sectionIndex].items.findIndex((i: { type: string }) => i.type === type);
          if (itemIndex >= 0 && body.data?.value !== undefined) {
            // Update value
            serverMockData.dashboardSections[sectionIndex].items[itemIndex].value = 
              type === 'blood-pressure' && body.data.value.systolic && body.data.value.diastolic
                ? `${body.data.value.systolic}/${body.data.value.diastolic}`
                : body.data.value;
          }
        }
      }
      
      // For general health
      if (category === 'general') {
        const sectionIndex = serverMockData.dashboardSections.findIndex((s: { id: string }) => s.id === 'general');
        if (sectionIndex >= 0) {
          const itemIndex = serverMockData.dashboardSections[sectionIndex].items.findIndex((i: { type: string }) => i.type === type);
          if (itemIndex >= 0) {
            if (type === 'blood-type' && body.data) {
              // Update blood type value
              serverMockData.dashboardSections[sectionIndex].items[itemIndex].value = body.data;
            } else if ((type === 'health-conditions' || type === 'family-history') && Array.isArray(body.data)) {
              // Update count based on array length
              serverMockData.dashboardSections[sectionIndex].items[itemIndex].count = body.data.length;
            }
          }
        }
      }
      
      // For medications
      if (category === 'medications') {
        const sectionIndex = serverMockData.dashboardSections.findIndex((s: { id: string }) => s.id === 'medications');
        if (sectionIndex >= 0) {
          const itemIndex = serverMockData.dashboardSections[sectionIndex].items.findIndex((i: { type: string }) => i.type === type);
          if (itemIndex >= 0 && Array.isArray(body.data)) {
            // Update count based on array length
            serverMockData.dashboardSections[sectionIndex].items[itemIndex].count = body.data.length;
          }
        }
      }
      
      return {
        success: true,
        data: { message: 'Data updated successfully' } as unknown as T,
        code: 200
      };
    }
  }
  
  // If no matching endpoint
  return {
    success: false,
    error: 'Not found',
    code: 404
  };
};

// API service functions
export const apiService = {
  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  
  // Get user profile
  getUserProfile: async () => {
    return fetchFromApi<typeof userProfile>('/user/profile');
  },
  
  // Update allergies
  updateAllergies: async (type: string, data: any[]) => {
    return fetchFromApi<{ message: string }>(
      `/update/allergies/${type}`,
      'POST',
      { data }
    );
  },
  
  // Update vitals
  updateVitals: async (type: string, data: { value: any; history: any[] }) => {
    const response = await api.post(`/vitals/${type}`, data);
    return response.data;
  },
  
  // Update blood type
  updateBloodType: async (value: string) => {
    return fetchFromApi<{ message: string }>(
      `/update/general/blood-type`,
      'POST',
      { data: value }
    );
  },
  
  // Update health conditions
  updateHealthConditions: async (data: any[]) => {
    return fetchFromApi<{ message: string }>(
      `/update/general/health-conditions`,
      'POST',
      { data }
    );
  },
  
  // Update family history
  updateFamilyHistory: async (data: any[]) => {
    return fetchFromApi<{ message: string }>(
      `/update/general/family-history`,
      'POST',
      { data }
    );
  },
  
  // Update medications
  updateMedications: async (type: 'current' | 'previous', data: any[]) => {
    return fetchFromApi<{ message: string }>(
      `/update/medications/${type}`,
      'POST',
      { data }
    );
  }
};


export const processVitalsData = (vitalsData: any) => {
  const processedData: any = {};
  
  // Process each vital type
  Object.keys(vitalsData).forEach(key => {
    const data = vitalsData[key];
    
    if (!data || (!data.value && (!data.history || data.history.length === 0))) {
      processedData[key] = { value: null, history: [] };
      return;
    }
    
    // Ensure history is an array
    const history = Array.isArray(data.history) ? data.history : [];
    
    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Set value from history if not available
    const value = data.value !== undefined ? data.value : 
                 (sortedHistory.length > 0 ? sortedHistory[0].value : null);
    
    processedData[key] = {
      value,
      history: sortedHistory
    };
  });
  
  return processedData;
};

function refreshToken() {
  throw new Error('Function not implemented.');
}
