// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string, 
  initialValue: T, 
  expiryInMinutes: number = 60
): [T, (value: T) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or if none return initialValue
      if (item) {
        const data = JSON.parse(item);
        
        // Check if the data has expired
        if (data.expiry && new Date().getTime() > data.expiry) {
          // Data has expired, remove it and return initial value
          window.localStorage.removeItem(key);
          return initialValue;
        }
        
        return data.value;
      }
      
      return initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Save to state
      setStoredValue(value);
      
      // Save to local storage with expiry
      const expiry = new Date().getTime() + expiryInMinutes * 60 * 1000;
      window.localStorage.setItem(
        key, 
        JSON.stringify({
          value,
          expiry
        })
      );
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  // Function to remove item from localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  return [storedValue, setValue, removeValue];
}