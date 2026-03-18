import { z } from "zod";

export const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().regex(/^[+]?[\d\s\-\(\)]{7,15}$/, "Invalid phone number format"),
  phoneNumber: z.string().regex(/^[+]?[\d\s\-\(\)]{7,15}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  preferredLanguage: z.string().min(1, "Preferred language is required"),
  nationality: z.string().min(1, "Nationality is required"),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  religion: z.string().optional(),
});

// Step-by-step validation schemas
export const StepSchemas = {
  1: z.object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
  }),
  2: z.object({
    phone: z.string().regex(/^[+]?[\d\s\-\(\)]{7,15}$/, "Invalid phone number format"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
  }),
  3: z.object({
    preferredLanguage: z.string().min(1, "Preferred language is required"),
    nationality: z.string().min(1, "Nationality is required"),
    religion: z.string().optional(),
  }),
  4: z.object({
    emergencyContactName: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
  }),
};

export interface PatientFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  preferredLanguage: string;
  nationality: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  religion?: string;
  submittedAt?: string;
}

export interface PatientSession {
  sessionId: string;
  formData: Partial<PatientFormData>;
  status: "filling" | "submitted" | "inactive";
  lastActivity: number;
}
