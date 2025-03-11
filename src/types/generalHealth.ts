export interface GeneralHealthData {
  bloodType: BloodType | null;
  allergies: Allergy[];
  medications: Medication[];
  conditions: Condition[];
  surgeries: Surgery[];
}

export interface Allergy {
  id: string;
  type: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  dateIdentified: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
}

export interface Condition {
  id: string;
  name: string;
  diagnosisDate: string;
  status: 'active' | 'managed' | 'resolved';
  notes?: string;
}

export interface Surgery {
  id: string;
  procedure: string;
  date: string;
  hospital: string;
  notes?: string;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';

export type FamilyRelation = 
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'grandfather'
  | 'grandmother'
  | 'uncle'
  | 'aunt'
  | 'cousin'
  | 'other';

export type HealthStatus = 'active' | 'resolved' | 'unknown';

export interface HealthCondition {
  id: number;
  name: string;
  status: HealthStatus;
  date: string;
  notes?: string;
}

export interface FamilyHistory {
  id: number;
  name: string;
  relation: FamilyRelation;
  date: string;
  notes?: string;
}

export type GeneralHealthType = 'bloodType' | 'healthConditions' | 'familyHistory';