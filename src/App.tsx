// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import components
import Dashboard from './components/Dashboard';
import VitalsForm from './components/forms/VitalsForm';
import AllergiesForm from './components/forms/AllergiesForm';
import GeneralHealthForm from './components/forms/GeneralHealthForm';
import Header from './components/layout/Header';

import Medications from './components/views/Medications';
import HealthCenters from './components/views/HealthCenters';
import './styles/direction.css';

// Context providers
import { HealthDataProvider } from './context/HealthDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Initialize i18n
import './locales/i18n';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <HealthDataProvider>
          <div className="min-h-screen bg-[#f9fafb] dark:bg-[#1f2937] font-sans transition-colors duration-200">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />

                {/* Allergies Routes */}
                <Route
                  path="/allergies/medicine"
                  element={<AllergiesForm type="medicine" />}
                />
                <Route
                  path="/allergies/food"
                  element={<AllergiesForm type="food" />}
                />
                <Route
                  path="/allergies/material"
                  element={<AllergiesForm type="material" />}
                />
                <Route
                  path="/allergies/doctor"
                  element={<AllergiesForm type="doctor" />}
                />

                {/* Vitals Routes */}
                <Route path="/vitals/bmi" element={<VitalsForm type="bmi" />} />
                <Route
                  path="/vitals/blood-pressure"
                  element={<VitalsForm type="blood-pressure" />}
                />
                <Route
                  path="/vitals/blood-glucose"
                  element={<VitalsForm type="blood-glucose" />}
                />
                <Route
                  path="/vitals/waist"
                  element={<VitalsForm type="waist" />}
                />
                <Route
                  path="/vitals/weight"
                  element={<VitalsForm type="weight" />}
                />
                <Route
                  path="/vitals/height"
                  element={<VitalsForm type="height" />}
                />

                {/* General Health Routes */}
                <Route
                  path="/general/blood-type"
                  element={<GeneralHealthForm type="blood-type" />}
                />
                <Route
                  path="/general/health-conditions"
                  element={<GeneralHealthForm type="health-conditions" />}
                />
                <Route
                  path="/general/family-history"
                  element={<GeneralHealthForm type="family-history" />}
                />
                <Route
                  path="/general/health-centers"
                  element={<HealthCenters />}
                />

                {/* Medication Routes */}
                <Route
                  path="/medications/current"
                  element={<Medications type="current" />}
                />
                <Route
                  path="/medications/previous"
                  element={<Medications type="previous" />}
                />
              </Routes>
            </main>
          </div>
        </HealthDataProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;