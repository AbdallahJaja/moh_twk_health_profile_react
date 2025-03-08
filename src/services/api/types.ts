export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

// Dashboard data structure
export interface DashboardData {
    vitals: {
        bloodPressure?: VitalReading;
        heartRate?: VitalReading;
        bloodSugar?: VitalReading;
        temperature?: VitalReading;
        weight?: VitalReading;
        height?: VitalReading;
    };
    lastUpdated?: string;
}

// Common structure for vital readings
interface VitalReading {
    value: number;
    unit: string;
    timestamp: string;
    status?: 'normal' | 'warning' | 'critical';
}

// DTO for updating vitals
export interface VitalUpdateDto {
    value: number;
    unit: string;
    timestamp?: string;
    notes?: string;
}