"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useCallback } from "react";
import { patientFormSchema, type PatientFormData } from "@/types/patient";
import { getAblyClient, PATIENT_CHANNEL } from "@/lib/ably";
import { getSessionId } from "@/lib/utils";

export default function PatientForm() {
  const [sessionId, setSessionId] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    mode: "onBlur",
  });

  // Initialize session
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
  }, []);

  // Real-time form sync
  useEffect(() => {
    if (!sessionId) return;

    let channel: any;
    let activityInterval: NodeJS.Timeout;

    const setupRealtime = async () => {
      try {
        const ably = getAblyClient();

        ably.connection.on("connected", () => {
          setIsConnected(true);
        });

        ably.connection.on("disconnected", () => {
          setIsConnected(false);
        });

        channel = ably.channels.get(PATIENT_CHANNEL);

        // Send initial status
        await channel.publish("patient-update", {
          sessionId,
          formData: {},
          status: "filling",
          lastActivity: Date.now(),
        });

        // Keep session active with heartbeat
        activityInterval = setInterval(() => {
          if (!isSubmitted) {
            channel.publish("patient-heartbeat", {
              sessionId,
              lastActivity: Date.now(),
            });
          }
        }, 5000);
      } catch (error) {
        console.error("Ably setup error:", error);
      }
    };

    setupRealtime();

    return () => {
      if (activityInterval) clearInterval(activityInterval);
      if (channel) {
        channel.publish("patient-update", {
          sessionId,
          status: "inactive",
          lastActivity: Date.now(),
        });
      }
    };
  }, [sessionId, isSubmitted]);

  // Watch form changes and broadcast
  const formValues = watch();

  const broadcastFormData = useCallback(
    async (data: Partial<PatientFormData>) => {
      if (!sessionId) return;

      try {
        const ably = getAblyClient();
        const channel = ably.channels.get(PATIENT_CHANNEL);

        await channel.publish("patient-update", {
          sessionId,
          formData: data,
          status: "filling",
          lastActivity: Date.now(),
        });
      } catch (error) {
        console.error("Broadcast error:", error);
      }
    },
    [sessionId]
  );

  useEffect(() => {
    if (sessionId && !isSubmitted) {
      const timeoutId = setTimeout(() => {
        broadcastFormData(formValues);
      }, 500); // Debounce broadcasts

      return () => clearTimeout(timeoutId);
    }
  }, [formValues, sessionId, isSubmitted, broadcastFormData]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      const ably = getAblyClient();
      const channel = ably.channels.get(PATIENT_CHANNEL);

      await channel.publish("patient-update", {
        sessionId,
        formData: data,
        status: "submitted",
        lastActivity: Date.now(),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Form Submitted Successfully!
          </h2>
          <p className="text-green-700">
            Thank you for providing your information. Our staff has received your details.
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem("patientSessionId");
              window.location.reload();
            }}
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Submit Another Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Patient Information Form</h1>
          <p className="text-gray-600 mt-2">
            Please fill out all required fields marked with *
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...register("firstName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...register("middleName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.middleName && (
                  <p className="text-red-600 text-sm mt-1">{errors.middleName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...register("lastName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.dateOfBirth && (
                  <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  {...register("gender")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="text-red-600 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="john.doe@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                {...register("address")}
                rows={3}
                maxLength={500}
                placeholder="Street, City, State, ZIP"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Additional Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Language *
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...register("preferredLanguage")}
                  placeholder="e.g., English, Spanish"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.preferredLanguage && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.preferredLanguage.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality *
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...register("nationality")}
                  placeholder="e.g., American, Canadian"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.nationality && (
                  <p className="text-red-600 text-sm mt-1">{errors.nationality.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Religion
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...register("religion")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.religion && (
                  <p className="text-red-600 text-sm mt-1">{errors.religion.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Emergency Contact (Optional)
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...register("emergencyContactName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.emergencyContactName && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  maxLength={100}
                  {...register("emergencyContactRelationship")}
                  placeholder="e.g., Spouse, Parent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.emergencyContactRelationship && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.emergencyContactRelationship.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.location.href = "/"}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
