// Entity: user_type
export interface UserType {
    user_type: number;
}
export const user_type: UserType = {
    user_type: 1,
};

// Entity: marital_status
export interface MaritalStatus {
    marital_status: string;
}
export const marital_status: MaritalStatus = {
    marital_status: "single",
};

// Entity: health_status
export interface HealthStatus {
    health_status: string;
}
export const health_status: HealthStatus = {
    health_status: "healthy",
};

// Entity: user_id
export interface UserId {
    user_id: number;
}
export const user_id: UserId = {
    user_id: 1000101111,
};

// Entity: id_expiry_date
export interface IdExpiryDate {
    user_id: number;
    id_expiry_date_hijri: string;
    id_expiry_date_gregorian: string;
}
export const id_expiry_date: IdExpiryDate = {
    user_id: 2139826875,
    id_expiry_date_hijri: "1449/06/16",
    id_expiry_date_gregorian: "2027/11/15",
};

// Entity: iqama_type
export interface IqamaType {
    id_type: number;
    id_type_description_ar: string;
    id_type_description_en: string;
}
export const iqama_type: IqamaType = {
    id_type: 0,
    id_type_description_ar: "مقيم",
    id_type_description_en: "residency",
};

// Entity: user_document_number
export interface UserDocumentNumber {
    document_type: number;
    document_number: string;
}
export const user_document_number: UserDocumentNumber = {
    document_type: 2,
    document_number: "255732849",
};

// Entity: full_name  
// (merging the two endpoints: "/user_data/full_name" and "v2/user_data/full_name")
export interface FullName {
    full_name?: string;
    full_name_ar?: string;
    full_name_en?: string;
}
export const full_name: FullName = {
    full_name: "Ù…Ø­Ù…Ø¯ Ø¹Ø¨Ø¯Ø§Ù„Ø¹Ø²ÙŠØ²",
    full_name_ar: "عبدالله خليل محمد الجاجة",
    full_name_en: "Mohammad Abdalziz",
};

// Entity: blood_type
export interface BloodType {
    blood_type: number;
}
export const blood_type: BloodType = {
    blood_type: 1,
};

// Entity: degree_type
export interface DegreeType {
    degree_type: string;
}
export const degree_type: DegreeType = {
    degree_type: "ØªØ¹Ù„ÙŠÙ… Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠ",
};

// Entity: user_location
export interface UserLocation {
    location: {
        latitude: number;
        longitude: number;
    };
}
export const user_location: UserLocation = {
    location: {
        latitude: 24.7136,
        longitude: 46.6753,
    },
};

// Entity: national_address
export interface NationalAddress {
    national_addresses: Array<{
        details: {
            additional_no: string;
            building_no: string;
            city: string;
            district_name: string;
            section_type: string;
            short_address: string;
            street_name: string;
            zip_code: string;
        };
        is_primary_address: boolean;
        summary: {
            address_counter: string;
            section_type: string;
            address_en: string;
            address_ar: string;
            latitude: number;
            longitude: number;
        };
    }>;
}
export const national_address: NationalAddress = {
    national_addresses: [
        {
            details: {
                additional_no: "7559",
                building_no: "3693",
                city: "RIYADH",
                district_name: "Al Muruj Dist.",
                section_type: "9",
                short_address: "RHGA3693",
                street_name: "Bani Qais",
                zip_code: "12284",
            },
            is_primary_address: true,
            summary: {
                address_counter: "Address 1",
                section_type: "10",
                address_en: "RHGA3693, 3693, Al Muruj Dist., 7559, Bani Qais, RIYADH",
                address_ar: "RHGA3693, 3693, Ø­ÙŠ Ø§Ù„Ù…Ø±ÙˆØ¬, 7559, Ø¨Ù†ÙŠ Ù‚ÙŠØ³, Ø§Ù„Ø±ÙŠØ§Ø¶",
                latitude: 24.7326068545263,
                longitude: 46.5989362244768,
            },
        },
    ],
};

// Entity: nationality_name  
// (merging the endpoints: "/user_data/nationality_name" and "v2/user_data/nationality_name")
export interface NationalityName {
    nationality_name?: string;
    nationality_code?: number;
    nationality_name_ar?: string;
    nationality_name_en?: string;
}
export const nationality_name: NationalityName = {
    nationality_name: "Kingdom of Saudi Arabia",
    nationality_code: 113,
    nationality_name_ar: "الأردنية",
    nationality_name_en: "Kingdom of saudi arabia",
};

// Entity: nationality_iso
export interface NationalityISO {
    nationality_iso: string;
}
export const nationality_iso: NationalityISO = {
    nationality_iso: "SA",
};

// Entity: occupation
export interface Occupation {
    occupation: string;
}
export const occupation: Occupation = {
    occupation: "programmer",
};

// Entity: mobile_number
export interface MobileNumber {
    mobile_number: string;
}
export const mobile_number: MobileNumber = {
    mobile_number: "+966123456789",
};