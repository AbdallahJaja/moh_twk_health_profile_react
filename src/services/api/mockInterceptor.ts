import { AxiosInstance } from 'axios';
import { dashboardSections, userProfile } from '../../data/mockData';
import { env } from '../../config/env';

// Mock data store with initial data from mockData.ts
let mockStore = {
  userProfile: { ...userProfile },
  dashboardSections: JSON.parse(JSON.stringify(dashboardSections))
};

export const setupMockInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(async (config) => {
    if (!env.USE_MOCK) {
      return config;
    }

    // Simulate network delay
    await new Promise(resolve => 
      setTimeout(resolve, 500)
    );

    return config;
  });

  axiosInstance.interceptors.response.use(
    async (config) => {
      if (!env.USE_MOCK) {
        return config;
      }

      const { url } = config.config;
      
      // Mock responses based on endpoint
      if (url?.endsWith('/dashboard')) {
        config.data = {
          success: true,
          data: {
            userProfile: mockStore.userProfile,
            sections: mockStore.dashboardSections
          }
        };
      }

      return config;
    }
  );
};