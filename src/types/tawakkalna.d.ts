declare global {
  interface Window {
    TWK: {
      // User Basic Information
      getUserId: () => Promise<{ success: boolean; result: { data: string } }>;
      getUserFullName: () => Promise<{ success: boolean; result: { data: TWKFullName } }>;
      getUserGender: () => Promise<{ success: boolean; result: { data: number } }>;
      getUserBirthDate: () => Promise<{ success: boolean; result: { data: Date } }>;
      getUserBloodType: () => Promise<{ success: boolean; result: { data: TWKBloodType } }>;

      // User Data Fetching Methods (V2 Overrides)
      getUserType: () => Promise<{ success: boolean; result: { data: number } }>;
      getMaritalStatus: () => Promise<{ success: boolean; result: { data: string } }>;
      getHealthStatus: () => Promise<{ success: boolean; result: { data: string } }>;
      getIdExpiryDate: () => Promise<{ success: boolean; result: { data: TWKExpiryDate } }>;
      getIqamaType: () => Promise<{ success: boolean; result: { data: TWKIqamaTypeEnum } }>;
      getNationality: () => Promise<{ success: boolean; result: { data: TWKNationality } }>;
      getDegreeType: () => Promise<{ success: boolean; result: { data: string } }>;

      // Contact Information
      getMobileNumber: () => Promise<{ success: boolean; result: { data: string } }>;
      getEmail: () => Promise<{ success: boolean; result: { data: string } }>;

      // User Address & Location
      getUserLocation: () => Promise<{ success: boolean; result: { data: TWKLocation } }>;
      getNationalAddress: () => Promise<{ success: boolean; result: { data: TWKNationalAddress } }>;

      // User Authentication (V2 Overrides)
      authenticateBiometric: () => Promise<{ success: boolean; result: { authorized: boolean } }>;
      generateToken: () => Promise<{ success: boolean; result: { token: string } }>;

      // Dependents & Family Members (V2 Overrides)
      getDependents: () => Promise<{ success: boolean; result: { dependents: TWKDependent[] } }>;
      getFamilyMembers: () => Promise<{ success: boolean; result: { family_members: TWKFamilyMember[] } }>;
      getSponsors: () => Promise<{ success: boolean; result: { sponsors: TWKSponsor[] } }>;

      // Vehicles
      getVehicles: () => Promise<{ success: boolean; result: { vehicles: TWKVehicle[] } }>;

      // Violations
      getUnpaidViolations: () => Promise<{ success: boolean; result: { violations: TWKViolation[] } }>;
      getPaidViolations: () => Promise<{ success: boolean; result: { violations: TWKViolation[] } }>;

      // Passport Information (V2 Overrides)
      getUserPassports: () => Promise<{ success: boolean; result: { user_passports: TWKPassport[] } }>;

      // Document Management
      addDocument: (name: string, content: string, reference: string, category: number) => Promise<{ success: boolean }>;
      updateDocument: (name: string, content: string, reference: string, category: number) => Promise<{ success: boolean }>;
      deleteDocument: (reference: string, category: number) => Promise<{ success: boolean }>;

      version: string;
      [key: string]: any;
    };
  }
}

// Enums and Mapping Functions

export enum TWKBloodType {
  O_POSITIVE = 1,
  O_NEGATIVE,
  A_POSITIVE,
  A_NEGATIVE,
  B_POSITIVE,
  B_NEGATIVE,
  AB_POSITIVE,
  AB_NEGATIVE
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
    8: "AB-"
  };
  return bloodTypes[type] || "Unknown";
};

export enum TWKIqamaTypeEnum {
  NORMAL = 1,
  SPECIAL = 2,
  DIPLOMATIC = 3
}

export const getIqamaTypeDescription = (type: number): string => {
  const iqamaTypes: Record<number, string> = {
    1: "Normal",
    2: "Special",
    3: "Diplomatic"
  };
  return iqamaTypes[type] || "Unknown";
};

// Interfaces for returned types
interface TWKFullName {
  full_name_ar: string;
  full_name_en: string;
}

interface TWKExpiryDate {
  id_expiry_date_hijri: string;
  id_expiry_date_gregorian: string;
}

interface TWKNationality {
  nationality_code: number;
  nationality_name_ar: string;
  nationality_name_en: string;
}

interface TWKLocation {
  latitude: number;
  longitude: number;
}

interface TWKNationalAddress {
  short_address: string;
  city: string;
  district_name: string;
  street_name: string;
  zip_code: string;
}

interface TWKDependent {
  user_id: number;
  full_name: string;
  user_photo: {
    type: string;
    mime_type: string;
    data: string;
  };
}

interface TWKFamilyMember {
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

interface TWKSponsor extends TWKFamilyMember {}

interface TWKVehicle {
  plate_number: string;
  registration_type: string;
  major_color: string;
  model: string;
  status: string;
  model_year: string;
  manufacturer: string;
}

interface TWKViolation {
  violation_number: string;
  violation_status: string;
  violation_type: string;
  total_fine_amount: string;
  violation_city: string;
  violation_date_time: string;
}

interface TWKPassport {
  name_ar: string;
  name_en: string;
  national_id: number;
  birth_date: string;
  expiry_date: string;
  passport_number: string;
  passport_type_ar: string;
  passport_type_en: string;
}

export {};