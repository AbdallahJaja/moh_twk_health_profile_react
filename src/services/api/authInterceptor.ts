import { AxiosInstance } from 'axios';
import { env } from '../../config/env';

export const setupAuthInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Skip auth for mock data
      if (env.USE_MOCK) {
        return config;
      }

      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Skip auth error handling for mock data
      if (env.USE_MOCK) {
        return Promise.reject(error);
      }

      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};