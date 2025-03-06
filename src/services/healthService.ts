// Health Service - For interacting with Tawakkalna health APIs
import { apiService } from './apiService';


// // Utility function to create a document reference number
// const generateReferenceNumber = () => {
//   return `health_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
// };

/**
 * Fetch health data from Tawakkalna
 * @returns {Promise<Object>} Health data object
 */
export const fetchHealthData = async () => {
  try {
    const response = await apiService.getDashboard();
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch health data');
    }
    
    // Transform API data to the expected format for HealthDataContext
    // This is a mock transformation - adjust based on your actual API response
    const healthData = {
      allergies: {
        medicine: [], // Placeholder - would be populated from API
        food: [],
        material: [],
        doctor: []
      },
      vitals: {
        bmi: { value: null, history: [] },
        bloodPressure: { value: null, history: [] },
        bloodGlucose: { value: null, history: [] },
        waist: { value: null, history: [] },
        weight: { value: null, history: [] },
        height: { value: null, history: [] }
      },
      general: {
        bloodType: null,
        healthConditions: [],
        familyHistory: []
      },
      lastUpdated: {}
    };
    
    // Return mock data for now
    // In a real implementation, we would transform the API response to match this format
    return healthData;
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error;
  }
};

/**
 * Update health data via API
 */
export const updateHealthData = async (category: string, type: string, value: any) => {
  try {
    let response;
    
    switch (category) {
      case 'allergies':
        response = await apiService.updateAllergies(type, value);
        break;
      case 'vitals':
        response = await apiService.updateVitals(type, value);
        break;
      case 'general':
        if (type === 'bloodType') {
          response = await apiService.updateBloodType(value);
        } else if (type === 'healthConditions') {
          response = await apiService.updateHealthConditions(value);
        } else if (type === 'familyHistory') {
          response = await apiService.updateFamilyHistory(value);
        } else {
          throw new Error(`Unsupported general health type: ${type}`);
        }
        break;
      case 'medications':
        response = await apiService.updateMedications(type as 'current' | 'previous', value);
        break;
      default:
        throw new Error(`Unsupported category: ${category}`);
    }
    
    return response.success;
  } catch (error) {
    console.error(`Error updating ${category}.${type}:`, error);
    return false;
  }
};

/**
 * Calculate BMI based on weight and height
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMI value
 */
export const calculateBMI = (weight: number, height: number): number | null => {
  if (!weight || !height) return null;

  // Convert height from cm to m
  const heightInMeters = height / 100;

  // Calculate BMI: weight(kg) / height²(m)
  const bmi = weight / (heightInMeters * heightInMeters);

  // Round to 1 decimal place
  return Math.round(bmi * 10) / 10;
};

/**
 * Get BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {Object} BMI category details
 */
export const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) {
    return {
      category: "نقص في الوزن",
      color: "blue",
      description: "مؤشر كتلة الجسم أقل من الطبيعي",
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      category: "وزن طبيعي",
      color: "green",
      description: "مؤشر كتلة الجسم ضمن المعدل الطبيعي",
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      category: "زيادة في الوزن",
      color: "yellow",
      description: "مؤشر كتلة الجسم أعلى من الطبيعي",
    };
  } else if (bmi >= 30 && bmi < 35) {
    return {
      category: "سمنة درجة أولى",
      color: "orange",
      description: "سمنة ذات خطورة معتدلة",
    };
  } else if (bmi >= 35 && bmi < 40) {
    return {
      category: "سمنة درجة ثانية",
      color: "orange-dark",
      description: "سمنة ذات خطورة عالية",
    };
  } else {
    return {
      category: "سمنة درجة ثالثة",
      color: "red",
      description: "سمنة ذات خطورة شديدة",
    };
  }
};

/**
 * Get blood pressure category
 * @param {Object} bp - Blood pressure object with systolic and diastolic values
 * @returns {Object} Blood pressure category details
 */
interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export const getBloodPressureCategory = (bp: BloodPressure) => {
  const { systolic, diastolic } = bp;

  if (systolic < 120 && diastolic < 80) {
    return {
      category: "طبيعي",
      color: "green",
      description: "ضغط الدم ضمن المعدل الطبيعي",
    };
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: "مرتفع",
      color: "yellow",
      description: "ارتفاع طفيف في ضغط الدم",
    };
  } else if (
    (systolic >= 130 && systolic <= 139) ||
    (diastolic >= 80 && diastolic <= 89)
  ) {
    return {
      category: "ارتفاع المرحلة الأولى",
      color: "orange",
      description: "ارتفاع في ضغط الدم (المرحلة الأولى)",
    };
  } else if (
    (systolic >= 140 && systolic <= 180) ||
    (diastolic >= 90 && diastolic <= 120)
  ) {
    return {
      category: "ارتفاع المرحلة الثانية",
      color: "red",
      description: "ارتفاع في ضغط الدم (المرحلة الثانية)",
    };
  } else if (systolic > 180 || diastolic > 120) {
    return {
      category: "أزمة ارتفاع ضغط الدم",
      color: "dark-red",
      description: "حالة طارئة - يرجى مراجعة الطبيب فوراً",
    };
  }

  return {
    category: "غير محدد",
    color: "gray",
    description: "لا يمكن تحديد الفئة بناءً على القيم المدخلة",
  };
};

/**
 * Get blood glucose category
 * @param {number} value - Blood glucose value
 * @param {boolean} isFasting - Whether the reading is fasting or not
 * @returns {Object} Blood glucose category details
 */
export const getBloodGlucoseCategory = (value: number, isFasting = true) => {
  if (isFasting) {
    if (value < 70) {
      return {
        category: "انخفاض سكر الدم",
        color: "blue",
        description: "مستوى سكر الدم منخفض",
      };
    } else if (value >= 70 && value <= 99) {
      return {
        category: "طبيعي",
        color: "green",
        description: "مستوى سكر الدم ضمن المعدل الطبيعي",
      };
    } else if (value >= 100 && value <= 125) {
      return {
        category: "مقدمات السكري",
        color: "yellow",
        description: "مستوى سكر الدم مرتفع قليلاً - مقدمات السكري",
      };
    } else {
      return {
        category: "مرتفع",
        color: "red",
        description: "مستوى سكر الدم مرتفع - يشير إلى مرض السكري",
      };
    }
  } else {
    // For non-fasting / random readings
    if (value < 70) {
      return {
        category: "انخفاض سكر الدم",
        color: "blue",
        description: "مستوى سكر الدم منخفض",
      };
    } else if (value >= 70 && value <= 139) {
      return {
        category: "طبيعي",
        color: "green",
        description: "مستوى سكر الدم ضمن المعدل الطبيعي",
      };
    } else if (value >= 140 && value <= 199) {
      return {
        category: "مقدمات السكري",
        color: "yellow",
        description: "مستوى سكر الدم مرتفع قليلاً - مقدمات السكري",
      };
    } else {
      return {
        category: "مرتفع",
        color: "red",
        description: "مستوى سكر الدم مرتفع - يشير إلى مرض السكري",
      };
    }
  }
};
