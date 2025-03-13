export interface MenuItem {
  id: string;
  title: string;
  type: string;
  icon: string;
  count?: number;
  value?: string | number;
  items?: MenuItem[];
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: MenuItem[];
}

export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  healthRecordId: string;
  avatarUrl?: string;
}

// Add HealthCenter interface for typing
export interface MockHealthCenter {
  id: number | string;
  name: string;
  distance: number | string;
  address: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
  services: string[];
  workingHours: string;
}

// Add mockMedications to your existing mockData.ts file

// Import the Medication type if not already imported
import { Medication } from '../types/generalHealth';

// Define the medications mock data
export const mockMedications = {
  current: [
    {
      id: 1,
      name: 'Paracetamol',
      dose: '500mg',
      frequency: 'thrice',
      startDate: '2025-01-15',
      duration: 10,
      prescribedBy: 'Dr. Ahmad Saeed',
      notes: 'Take after meals'
    },
    {
      id: 2,
      name: 'Amoxicillin',
      dose: '250mg',
      frequency: 'twice',
      startDate: '2025-02-10',
      duration: 7,
      prescribedBy: 'Dr. Khalid Mohammed',
      notes: 'Take 1 hour before meals'
    }
  ] as Medication[],
  previous: [
    {
      id: 1,
      name: 'Ibuprofen',
      dose: '400mg',
      frequency: 'asNeeded',
      startDate: '2024-12-05',
      endDate: '2024-12-15',
      prescribedBy: 'Dr. Sarah Ali',
      notes: 'For pain relief'
    },
    {
      id: 2,
      name: 'Clarithromycin',
      dose: '500mg',
      frequency: 'twice',
      startDate: '2024-11-20',
      endDate: '2024-11-30',
      prescribedBy: 'Dr. Mohammed Omar',
      notes: 'For pneumonia'
    },
    {
      id: 3,
      name: 'Loratadine',
      dose: '10mg',
      frequency: 'once',
      startDate: '2024-10-15',
      endDate: '2024-11-15',
      prescribedBy: 'Dr. Ahmad Saeed',
      notes: 'For seasonal allergies'
    }
  ] as Medication[]
};

// Add health centers to mock data exports
export const mockHealthCenters: MockHealthCenter[] = [
  {
    id: 1,
    name: "Al Habib Medical Center",
    distance: 2.5,
    address: "King Fahd Road, Al Olaya, Riyadh",
    phone: "0118324000",
    location: {
      latitude: 24.7136,
      longitude: 46.6753
    },
    services: ["emergency", "outpatient", "xray", "familyMedicine", "laboratory", "pharmacy"],
    workingHours: "24/7"
  },
  {
    id: 2,
    name: "King Faisal Specialist Hospital",
    distance: 4.2,
    address: "Zahrawi Street, Al Maather, Riyadh",
    phone: "0114647272",
    location: {
      latitude: 24.6911,
      longitude: 46.6740
    },
    services: ["emergency", "outpatient", "xray", "familyMedicine", "laboratory", "pharmacy", "specialized"],
    workingHours: "24/7"
  }
];

// Default mock config
export const mockConfig = {
  features: {
    // For Vite
    allowAllActions: 
      (import.meta && import.meta.env && import.meta.env.VITE_ALLOW_ALL_ACTIONS === "true") ||
      false,
    enableTwkIntegration: true,
  },
  version: "1.0.0",
  supportedLanguages: ["ar", "en"],
};

export const userProfile: UserProfile = {
  id: '2381026190',
  name: 'عبدالله',
  fullName: 'عبدالله خليل محمد',
  gender: 'male',
  birthDate: '1986-08-17',
  healthRecordId: 'MRN-10254367'
};

export const dashboardSections: Section[] = [
  {
    id: 'allergies',
    title: 'sections.allergies.title',
    icon: 'Heart',
    color: 'red',
    items: [
      {
        id: 'medicine',
        title: 'sections.allergies.medicine',
        type: 'medicine',
        icon: 'Pill',
        count: 2
      },
      {
        id: 'food',
        title: 'sections.allergies.food',
        type: 'food',
        icon: 'Coffee',
        count: 2
      },
      {
        id: 'material',
        title: 'sections.allergies.material',
        type: 'material',
        icon: 'Shirt',
        count: 0
      },
      {
        id: 'doctor',
        title: 'sections.allergies.doctor',
        type: 'doctor',
        icon: 'Stethoscope',
        count: 0
      }
    ]
  },
  {
    id: 'vitals',
    title: 'sections.vitals.title',
    icon: 'Activity',
    color: 'blue',
    items: [
      {
        id: 'bmi',
        title: 'sections.vitals.bmi',
        type: 'bmi',
        icon: 'Scale',
        value: 24.8
      },
      {
        id: 'blood-pressure',
        title: 'sections.vitals.bloodPressure',
        type: 'blood-pressure',
        icon: 'Heart',
        value: '120/80'
      },
      {
        id: 'blood-glucose',
        title: 'sections.vitals.bloodGlucose',
        type: 'blood-glucose',
        icon: 'Droplet',
        value: 95
      },
      {
        id: 'waist',
        title: 'sections.vitals.waist',
        type: 'waist',
        icon: 'Ruler',
        value: 82
      },
      {
        id: 'weight',
        title: 'sections.vitals.weight',
        type: 'weight',
        icon: 'Scale',
        value: 75
      },
      {
        id: 'height',
        title: 'sections.vitals.height',
        type: 'height',
        icon: 'Ruler',
        value: 174
      }
    ]
  },
  // {
  //   id: 'medications',
  //   title: 'sections.medications.title',
  //   icon: 'Pill',
  //   color: 'purple',
  //   items: [
  //     {
  //       id: 'current',
  //       title: 'sections.medications.current',
  //       type: 'current',
  //       icon: 'Clock',
  //       count: 2
  //     },
  //     {
  //       id: 'previous',
  //       title: 'sections.medications.previous',
  //       type: 'previous',
  //       icon: 'ClockRewind',
  //       count: 3
  //     }
  //   ]
  // },
  {
    id: 'general',
    title: 'sections.general.title',
    icon: 'Users',
    color: 'green',
    items: [
      {
        id: 'blood-type',
        title: 'sections.general.bloodType',
        type: 'blood-type',
        icon: 'Droplet',
        value: 'O+'
      },
      {
        id: 'health-conditions',
        title: 'sections.general.healthConditions',
        type: 'health-conditions',
        icon: 'ClipboardList',
        count: 1
      },
      {
        id: 'family-history',
        title: 'sections.general.familyHistory',
        type: 'family-history',
        icon: 'Users',
        count: 2
      },
      {
        id: 'health-centers',
        title: 'sections.general.healthCenters',
        type: 'health-centers',
        icon: 'Map',
        count: 1
      }
    ]
  }
];