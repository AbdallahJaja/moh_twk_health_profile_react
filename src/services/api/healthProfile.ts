import api from './apiService';
import { API_ENDPOINTS } from './config';

import type { VitalUpdateDto, ApiResponse, DashboardData } from './types';
import axios from 'axios';

export class HealthProfileService {
  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await api.get(API_ENDPOINTS.dashboard);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateVitals(
    type: string,
    data: VitalUpdateDto
  ): Promise<ApiResponse> {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.vitals}/${type}`,
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private static handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || 'Network error occurred',
        code: error.response?.status
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
      code: 500
    };
  }
}