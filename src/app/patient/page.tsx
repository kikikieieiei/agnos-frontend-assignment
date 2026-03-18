"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef, useCallback } from "react";
import { z } from "zod";
import { PatientFormData } from "@/types/patient";
import { getAblyClient } from "@/lib/ably";

// Zod validation schema
const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name is too long"),
  middleName: z.string().max(100, "Middle name is too long").optional(),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dob <= today;
    }, { message: "Date of birth cannot be in the future" }),
  gender: z.string().min(1, "Gender is required"),
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .refine((phone) => {
      const cleaned = phone.replace(/[\s\-\(\)]/g, "");
      return /^[+]?[0-9]{7,15}$/.test(cleaned);
    }, { message: "Please enter a valid phone number (7-15 digits)" }),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  address: z.string().min(1, "Address is required").max(500, "Address is too long"),
  preferredLanguage: z.string().min(1, "Preferred language is required").max(100, "Too long"),
  nationality: z.string().min(1, "Nationality is required").max(100, "Too long"),
  emergencyContactName: z.string().max(100, "Contact name is too long").optional(),
  emergencyContactRelationship: z.string().max(100, "Relationship is too long").optional(),
  religion: z.string().max(100, "Religion is too long").optional(),
});

export default function PatientPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof getAblyClient>["channels"]["get"]> | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    mode: "onChange",
  });

  // Watch form values for real-time sync
  const formValues = watch();

  useEffect(() => {
    const ably = getAblyClient();
    const channel = ably.channels.get("patient-form");
    channelRef.current = channel;

    ably.connection.on("connected", () => {
      setIsConnected(true);
    });

    ably.connection.on("disconnected", () => {
      setIsConnected(false);
    });

    // Check if already connected
    if (ably.connection.state === "connected") {
      setIsConnected(true);
    }

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Publish form updates in real-time (debounced 500ms)
  const broadcastFormData = useCallback((data: typeof formValues) => {
    if (channelRef.current && isConnected && !isSubmitted) {
      channelRef.current.publish("form-update", data);
    }
  }, [isConnected, isSubmitted]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      broadcastFormData(formValues);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formValues, broadcastFormData]);

  const onSubmit = (data: PatientFormData) => {
    if (channelRef.current) {
      const submittedData = {
        ...data,
        submittedAt: new Date().toISOString(),
      };
      channelRef.current.publish("form-submitted", submittedData);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Patient Registration Form</h1>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{isConnected ? "🟢" : "🔴"}</span>
              <span className="text-sm font-medium text-gray-600">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Form Submitted Successfully!</h2>
              <p className="text-green-700">Thank you for completing the registration.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("firstName")}
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <input
                      {...register("middleName")}
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("lastName")}
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("dateOfBirth")}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("gender")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("phoneNumber")}
                      placeholder="+1 234 567 8900"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("address")}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Language <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("preferredLanguage")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Select language</option>
                      <option value="Thai">Thai</option>
                      <option value="English">English</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.preferredLanguage && (
                      <p className="text-red-500 text-xs mt-1">{errors.preferredLanguage.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("nationality")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Select nationality</option>
                      <option value="Thai">Thai</option>
                      <option value="American">American</option>
                      <option value="British">British</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.nationality && (
                      <p className="text-red-500 text-xs mt-1">{errors.nationality.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                    <select
                      {...register("religion")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Select religion</option>
                      <option value="Buddhism">Buddhism</option>
                      <option value="Christianity">Christianity</option>
                      <option value="Islam">Islam</option>
                      <option value="Hinduism">Hinduism</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Emergency Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      {...register("emergencyContactName")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      {...register("emergencyContactRelationship")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-[1.02]"
              >
                Submit Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
