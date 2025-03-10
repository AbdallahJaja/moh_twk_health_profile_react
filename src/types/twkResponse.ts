// Enums and Mapping Functions

export enum TWKBloodType {
  O_POSITIVE = 1,
  O_NEGATIVE,
  A_POSITIVE,
  A_NEGATIVE,
  B_POSITIVE,
  B_NEGATIVE,
  AB_POSITIVE,
  AB_NEGATIVE,
}

export const getBloodTypeDescription = (type: number): string => {
  const bloodTypes: Record<number, string> = {
    1: "O+",
    2: "O-",
    3: "A+",
    4: "A-",
    5: "B+",
    6: "B-",
    7: "AB+",
    8: "AB-",
  };
  return bloodTypes[type] || "Unknown";
};

export enum TWKIqamaTypeEnum {
  NORMAL = 1,
  SPECIAL = 2,
  DIPLOMATIC = 3,
}

export const getIqamaTypeDescription = (type: number): string => {
  const iqamaTypes: Record<number, string> = {
    1: "Normal",
    2: "Special",
    3: "Diplomatic",
  };
  return iqamaTypes[type] || "Unknown";
};

// Interfaces for returned types
export interface TWKFullName {
  full_name_ar: string;
  full_name_en: string;
}

export interface TWKExpiryDate {
  id_expiry_date_hijri: string;
  id_expiry_date_gregorian: string;
}

export interface TWKNationality {
  nationality_code: number;
  nationality_name_ar: string;
  nationality_name_en: string;
}

export interface TWKLocation {
  latitude: number;
  longitude: number;
}

export interface TWKNationalAddress {
  short_address: string;
  city: string;
  district_name: string;
  street_name: string;
  zip_code: string;
}

export interface TWKDependent {
  user_id: number;
  full_name: string;
  user_photo: {
    type: string;
    mime_type: string;
    data: string;
  };
}

export interface TWKFamilyMember {
  national_id: number;
  id_expiry_date_hijri: string;
  id_expiry_date_gregorian: string;
  name_ar: string;
  name_en: string;
  gender: number;
  details: {
    nationality: string;
    relation: string;
    passport_number: string;
    date_of_birth: string;
    birth_city: string;
  };
}

export interface TWKSponsor extends TWKFamilyMember {}

export interface TWKVehicle {
  plate_number: string;
  registration_type: string;
  major_color: string;
  model: string;
  status: string;
  model_year: string;
  manufacturer: string;
}

export interface TWKViolation {
  violation_number: string;
  violation_status: string;
  violation_type: string;
  total_fine_amount: string;
  violation_city: string;
  violation_date_time: string;
}

export interface TWKPassport {
  name_ar: string;
  name_en: string;
  national_id: number;
  birth_date: string;
  expiry_date: string;
  passport_number: string;
  passport_type_ar: string;
  passport_type_en: string;
}
export interface TWKDeviceInfo {
  language: string;
  theme: "light" | "dark";
  deviceType: "mobile" | "tablet";
  locale: string;
  platform: string;
}

export {};
