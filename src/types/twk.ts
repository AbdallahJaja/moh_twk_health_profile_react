export interface TWKDeviceInfo {
  language: string;
  theme: 'light' | 'dark';
  deviceType: 'mobile' | 'tablet';
  locale: string;
  platform: string;
}

export interface TWKResponse<T> {
  success: boolean;
  result: {
    data: T;
  };
}