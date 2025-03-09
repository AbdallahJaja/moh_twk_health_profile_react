import { env } from '../../config/env';
import mockData from '../../data/twkMock.json';
import { TWKDeviceInfo, TWKResponse } from '../../types/twk';

interface TWKLocation {
  latitude: number;
  longitude: number;
}

interface TWKResponse<T> {
  success: boolean;
  result: {
    data: T;
  };
}

interface TWKUserName {
  full_name_ar: string;
  full_name_en: string;
}

interface TWKBirthDate {
  birth_date: string;
}

class TWKService {
  private getMockData<T>(path: string): T | null {
    const endpoint = mockData.mock_endpoints.find(e => e.path === path);
    return (endpoint?.return as T) || null;
  }

  async getUserLocation(): Promise<TWKLocation> {
    try {
      if (env.USE_TWK_MOCK) {
        const mockResponse = this.getMockData<TWKLocation>('/user_data/user_location');
        return mockResponse || { latitude: 24.7136, longitude: 46.6753 };
      }

      const response = await window.TWK?.getUserLocation();
      if (!response?.success) {
        throw new Error('Failed to get location from TWK');
      }
      
      return response.result.data;
    } catch (error) {
      console.error('Error getting user location:', error);
      throw error;
    }
  }

  async getUserId(): Promise<string> {
    try {
      if (env.USE_TWK_MOCK) {
        const mockResponse = this.getMockData<string>('/user_data/user_id');
        return mockResponse || '1000000000';
      }

      const response = await window.TWK?.getUserId();
      if (!response?.success) {
        throw new Error('Failed to get user ID from TWK');
      }

      return response.result.data;
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
  }

  async getUserFullName(): Promise<TWKUserName> {
    try {
      if (env.USE_TWK_MOCK) {
        const mockResponse = this.getMockData<TWKUserName>('v2/user_data/full_name');
        return mockResponse || {
          full_name_ar: 'عبدالله خليل محمد الجاجة',
          full_name_en: 'Mohammad Abdalziz'
        };
      }

      const response = await window.TWK?.getUserFullName();
      if (!response?.success) {
        throw new Error('Failed to get user name from TWK');
      }

      return response.result.data;
    } catch (error) {
      console.error('Error getting user name:', error);
      throw error;
    }
  }

  async openUrl(url: string, urlType: number): Promise<boolean> {
    try {
      if (env.USE_TWK_MOCK) {
        // In mock mode, just open in new tab
        window.open(url, '_blank');
        return true;
      }

      const response = await window.TWK?.openUrl(url, urlType);
      return response?.success || false;
    } catch (error) {
      console.error('Error opening URL:', error);
      return false;
    }
  }

  async getUserBloodType(): Promise<string> {
    try {
      if (env.USE_TWK_MOCK) {
        const mockResponse = this.getMockData<string>('/user_data/blood_type');
        return mockResponse || 'O+';
      }

      const response = await window.TWK?.getUserBloodType();
      if (!response?.success) {
        throw new Error('Failed to get blood type from TWK');
      }

      return response.result.data;
    } catch (error) {
      console.error('Error getting blood type:', error);
      throw error;
    }
  }

  async getDeviceInfo(): Promise<TWKDeviceInfo> {
    try {
      if (env.USE_TWK_MOCK) {
        const mockResponse = this.getMockData<TWKDeviceInfo>('/device_info');
        return mockResponse || {
          language: 'ar',
          theme: 'light',
          deviceType: 'mobile',
          locale: 'ar-SA',
          platform: 'ios'
        };
      }

      const response = await window.TWK?.getDeviceInfo();
      if (!response?.success) {
        throw new Error('Failed to get device info from TWK');
      }

      return response.result.data;
    } catch (error) {
      console.error('Error getting device info:', error);
      throw error;
    }
  }

  async getUserBirthDate(): Promise<string> {
    try {
      if (env.USE_TWK_MOCK) {
        const mockResponse = this.getMockData<TWKBirthDate>('/user_data/birth_date');
        return mockResponse?.birth_date || '1990-01-01';
      }

      const response = await window.TWK?.getUserBirthDate();
      if (!response?.success) {
        throw new Error('Failed to get birth date from TWK');
      }

      return response.result.data.birth_date;
    } catch (error) {
      console.error('Error getting birth date:', error);
      throw error;
    }
  }
}

export const twkService = new TWKService();