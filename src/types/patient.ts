import { z } from "zod";

// Phone validation regex (allows various formats)
const phoneRegex = /^[\d\s\-\+\(\)]+$/;

// Validation schema
export const patientFormSchema = z.object({
  // Required fields
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Invalid phone number format"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  address: z.string().min(1, "Address is required").max(200, "Address is too long"),
  preferredLanguage: z.string().min(1, "Preferred language is required"),
  nationality: z.string().min(1, "Nationality is required"),

  // Optional fields
  middleName: z.string().max(50, "Middle name is too long").optional(),
  emergencyContactName: z.string().max(100, "Contact name is too long").optional(),
  emergencyContactRelationship: z.string().max(50, "Relationship is too long").optional(),
  religion: z.string().max(50, "Religion is too long").optional(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

// Patient session type for real-time tracking
export interface PatientSession {
  sessionId: string;
  formData: Partial<PatientFormData>;
  status: "filling" | "submitted" | "inactive";
  lastActivity: number;
}
