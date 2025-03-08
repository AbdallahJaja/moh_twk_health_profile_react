import { useState, useCallback } from 'react';
import type { ApiResponse } from '../services/api/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResponse<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiResponse<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiCall(...args);
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Unknown error' 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'An unexpected error occurred' 
      }));
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}