// src/config/env.ts

// Function to get boolean env variable
const getBooleanEnv = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return Boolean(value);
};

// Function to get string env variable
const getStringEnv = (key: string, defaultValue: string): string => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return String(value);
};

// Environment configuration
export const env = {
  NODE_ENV: getStringEnv("VITE_NODE_ENV", "development"),
  API_URL: getStringEnv("VITE_API_URL", "https://api.example.com"),
  USE_MOCK: getBooleanEnv("VITE_USE_MOCK", true),
  USE_TWK_MOCK: getBooleanEnv("VITE_USE_TWK_MOCK", true),
  ALLOW_ALL_ACTIONS: getBooleanEnv("VITE_ALLOW_ALL_ACTIONS", false),
  LOG_LEVEL: getStringEnv("VITE_LOG_LEVEL", "info"),
};

// export const env = {
//   USE_MOCK: import.meta.env.VITE_USE_MOCK === "true",
//   USE_TWK_MOCK: import.meta.env.VITE_USE_TWK_MOCK === "true",
//   API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
//   NODE_ENV: import.meta.env.MODE,
// };

// Add environment accessor
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
