// src/services/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics, Analytics, isSupported, setUserId, setUserProperties } from 'firebase/analytics';
import { env } from '../../config/env';

// Firebase configuration
const firebaseConfig = {
  apiKey: env.firebaseConfig.apiKey,
  authDomain: env.firebaseConfig.authDomain,
  projectId: env.firebaseConfig.projectId,
  storageBucket: env.firebaseConfig.storageBucket,
  messagingSenderId:
    env.firebaseConfig.messagingSenderId,
  appId: env.firebaseConfig.appId,
  measurementId: env.firebaseConfig.measurementId ,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a placeholder for analytics
let analytics: Analytics | null = null;

// Initialize analytics asynchronously
const initializeAnalytics = async () => {
  try {
    if (env.ENABLE_ANALYTICS) {
      const isAnalyticsSupported = await isSupported();
      
      if (isAnalyticsSupported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized successfully');
      } else {
        console.log('Firebase Analytics not supported in this environment');
      }
    } else {
      console.log('Analytics disabled by environment configuration');
    }
  } catch (error) {
    console.error('Error initializing Firebase Analytics:', error);
  }
};

// Set user ID for analytics
export const setAnalyticsUserId = (userId: string) => {
  if (analytics && userId) {
    setUserId(analytics, userId);
  }
};

// Set user properties for better segmentation
export const setAnalyticsUserProperties = (properties: Record<string, string>) => {
  if (analytics) {
    setUserProperties(analytics, properties);
  }
};

// Initialize analytics
initializeAnalytics();

export { app, analytics };