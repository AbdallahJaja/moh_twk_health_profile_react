export type HealthCenterService = 
  | 'emergency'
  | 'outpatient'
  | 'xray'
  | 'familyMedicine'
  | 'laboratory'
  | 'pharmacy';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface HealthCenter {
  id: string;
  name: string;
  address: string;
  location: Location;
  distance: number;
  phone: string;
  workingHours: string;
  services: string[];
}