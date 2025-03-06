// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Mock TWK implementation for development
if (!window.TWK) {
  window.TWK = {
    getUserId: () => Promise.resolve({ success: true, result: { data: "1234567890" } }),
    getUserFullName: () => Promise.resolve({ success: true, result: { data: "عبدالله خليل محمد" } }),
    getUserGender: () => Promise.resolve({ success: true, result: { data: "male" } }),
    getUserBirthDate: () => Promise.resolve({ success: true, result: { data: "1986-08-17" } }),
    getUserBloodType: () => Promise.resolve({ success: true, result: { data: "AB+" } }),
    getUserLocation: () => Promise.resolve({ success: true, result: { data: { latitude: 24.7136, longitude: 46.6753 } } }),
    getDeviceInfo: () => Promise.resolve({ 
      success: true, 
      result: { 
        data: { 
          language: "ar-SA", 
          deviceModel: "iPhone", 
          osVersion: "14.0" 
        } 
      } 
    })
  };
}
import "./locales/i18n";

// Define TWK types
declare global {
  interface Window {
    TWK: any;
    TWKAPIBASE: string;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)