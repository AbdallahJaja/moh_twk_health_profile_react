// @refresh reset// src/context/ThemeContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { twkService } from '../services/twk/twkService';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    initializeTheme();
  }, []);

  const initializeTheme = async () => {
    try {
      const deviceInfo = await twkService.getDeviceInfo();
      updateTheme(deviceInfo.theme);
    } catch (error) {
      console.error('Error initializing theme:', error);
      const storedTheme = localStorage.getItem('theme') as Theme || 'light';
      updateTheme(storedTheme);
    }
  };

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};