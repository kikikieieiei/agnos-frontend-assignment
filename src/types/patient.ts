export interface PatientFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
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
