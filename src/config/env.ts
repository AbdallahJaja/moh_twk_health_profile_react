export const env = {
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true',
  USE_TWK_MOCK: import.meta.env.VITE_USE_TWK_MOCK === 'true',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  NODE_ENV: import.meta.env.MODE
};