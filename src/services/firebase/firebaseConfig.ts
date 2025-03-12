// src/services/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { env } from '../../config/env';

// Your web app's Firebase configuration
// Replace with your actual Firebase config from the Firebase console
const firebaseConfig = {
  apiKey: env.firebaseConfig.apiKey || "your-api-key",
  authDomain: env.firebaseConfig.authDomain || "your-auth-domain",
  projectId: env.firebaseConfig.projectId || "mohtwk-ebf40",
  storageBucket: env.firebaseConfig.storageBucket || "your-storage-bucket",
  messagingSenderId:
    env.firebaseConfig.messagingSenderId || "your-messaging-sender-id",
  appId: env.firebaseConfig.appId || "your-app-id",
  measurementId: env.firebaseConfig.measurementId || "your-measurement-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics with null as placeholder
let analytics = null;

// Conditionally initialize analytics
const initializeAnalytics = async () => {
  try {
    // Check if analytics is supported in current environment
    const isAnalyticsSupported = await isSupported();
    
    if (isAnalyticsSupported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized');
    } else {
      console.log('Firebase Analytics not supported in this environment');
    }
  } catch (error) {
    console.error('Error initializing Firebase Analytics:', error);
  }
};

// Run initialization
initializeAnalytics();

export { app, analytics };