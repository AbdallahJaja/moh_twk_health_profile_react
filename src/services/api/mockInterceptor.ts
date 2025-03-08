import { AxiosInstance } from 'axios';
import { dashboardSections, userProfile, Section } from '../../data/mockData';
import { API_CONFIG } from './config';

// Mock data store with initial data from mockData.ts
let mockStore = {
  userProfile: { ...userProfile },
  dashboardSections: JSON.parse(JSON.stringify(dashboardSections))
};

export const setupMockInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(async (config) => {
    if (process.env.REACT_APP_USE_MOCK !== 'true') {
      return config;
    }

    // Simulate network delay
    await new Promise(resolve => 
      setTimeout(resolve, API_CONFIG.mockDelay || 500)
    );

    return config;
  });

  axiosInstance.interceptors.response.use(
    async (config) => {
      if (process.env.REACT_APP_USE_MOCK !== 'true') {
        return config;
      }

      const { method, url } = config.config;
      
      // Mock responses based on endpoint
      switch (true) {
        case url?.endsWith('/dashboard'):
          config.data = {
            success: true,
            data: {
              userProfile: mockStore.userProfile,
              sections: mockStore.dashboardSections
            }
          };
          break;

        case url?.includes('/vitals/'):
          if (method === 'post' && url) {
            const type = url.split('/').pop();
            const data = JSON.parse(config.config.data);
            updateMockVitals(type as string, data);
          }
          config.data = { success: true, message: 'Vitals updated' };
          break;

        // Add other mock endpoints as needed
      }

      return config;
    }
  );
};

// Helper function to update mock vitals
function updateMockVitals(type: string, data: any) {
const vitalsSection = mockStore.dashboardSections.find((s: Section) => s.id === 'vitals');
  if (vitalsSection) {
    const vitalItem = vitalsSection.items.find((i: { type: string }) => i.type === type);
    if (vitalItem) {
      vitalItem.value = data.value;
    }
  }
}