import { env } from '../../config/env';

export const API_CONFIG = {
  baseUrl: env.API_URL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  mockDelay: 500 // Delay for mock responses
};