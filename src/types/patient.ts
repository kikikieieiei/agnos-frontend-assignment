import { z } from "zod";

// Validation schema
export const patientFormSchema = z.object({
  // Required fields with proper length limits
  firstName: z.string().min(1, "First name is required").max(100, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dob <= today;
    }, { message: "Date of birth cannot be in the future" }),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine((phone) => {
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      return /^[+]?[0-9]{7,15}$/.test(cleaned);
    }, { message: "Please enter a valid phone number (7-15 digits)" }),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  address: z.string().min(1, "Address is required").max(500, "Address is too long"),
  preferredLanguage: z.string().min(1, "Preferred language is required").max(100, "Too long"),
  nationality: z.string().min(1, "Nationality is required").max(100, "Too long"),

  // Optional fields with length limits
  middleName: z.string().max(100, "Middle name is too long").optional(),
  emergencyContactName: z.string().max(100, "Contact name is too long").optional(),
  emergencyContactRelationship: z.string().max(100, "Relationship is too long").optional(),
  religion: z.string().max(100, "Religion is too long").optional(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

// Patient session type for real-time tracking
export interface PatientSession {
  sessionId: string;
  formData: Partial<PatientFormData>;
  status: "filling" | "submitted" | "inactive";
  lastActivity: number;
}
