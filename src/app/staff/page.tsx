"use client";

import { useEffect, useState, useRef } from "react";
import { PatientFormData } from "@/types/patient";
import { getAblyClient, destroyAblyClient } from "@/lib/ably";

type Status = "not-started" | "actively-filling" | "inactive" | "submitted";

export default function StaffPage() {
  const [patientData, setPatientData] = useState<Partial<PatientFormData>>({});
  const [status, setStatus] = useState<Status>("not-started");
  const [isConnected, setIsConnected] = useState(false);
  const lastUpdateTimeRef = useRef<number>(0);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const ably = getAblyClient();
    const channel = ably.channels.get("patient-form");

    ably.connection.on("connected", () => {
      setIsConnected(true);
    });

    ably.connection.on("disconnected", () => {
      setIsConnected(false);
    });

    // Subscribe to form updates
    channel.subscribe("form-update", (message) => {
      setPatientData(message.data);
      lastUpdateTimeRef.current = Date.now();

      // Don't change status if already submitted
      if (status !== "submitted") {
        setStatus("actively-filling");
      }
    });

    // Subscribe to form submission
    channel.subscribe("form-submitted", (message) => {
      setPatientData(message.data);
      setStatus("submitted");
    });

    // Status update interval
    statusIntervalRef.current = setInterval(() => {
      if (status === "submitted") return;

      if (lastUpdateTimeRef.current === 0) {
        setStatus("not-started");
        return;
      }

      const timeSinceLastUpdate = (Date.now() - lastUpdateTimeRef.current) / 1000;

      if (timeSinceLastUpdate < 5) {
        setStatus("actively-filling");
      } else if (timeSinceLastUpdate < 30) {
        setStatus("inactive");
      } else {
        setStatus("inactive");
      }
    }, 1000);

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      destroyAblyClient();
    };
  }, [status]);

  const getStatusDisplay = () => {
    switch (status) {
      case "not-started":
        return { icon: "⚪", text: "Not started", color: "text-gray-500" };
      case "actively-filling":
        return { icon: "🟢", text: "Actively filling", color: "text-green-600" };
      case "inactive":
        return { icon: "🟡", text: "Inactive", color: "text-yellow-600" };
      case "submitted":
        return { icon: "✅", text: "Submitted", color: "text-blue-600" };
    }
  };

  const statusDisplay = getStatusDisplay();

  const renderField = (label: string, value: any) => (
    <div className="border-b border-gray-200 py-3">
      <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-base text-gray-800">{value || "-"}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Staff Dashboard</h1>
                <p className="text-blue-100">Real-time Patient Registration Monitor</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{isConnected ? "🟢" : "🔴"}</span>
                  <span className="text-sm font-medium text-white">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{statusDisplay.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-500">Form Status</div>
                <div className={`text-lg font-bold ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Data */}
          <div className="p-6">
            {status === "not-started" ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👀</div>
                <p className="text-xl text-gray-600">Waiting for patient to start filling the form...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>👤</span> Personal Information
                  </h2>
                  {renderField("First Name", patientData.firstName)}
                  {renderField("Middle Name", patientData.middleName)}
                  {renderField("Last Name", patientData.lastName)}
                  {renderField("Date of Birth", patientData.dateOfBirth)}
                  {renderField("Gender", patientData.gender)}
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📞</span> Contact Information
                  </h2>
                  {renderField("Phone Number", patientData.phoneNumber)}
                  {renderField("Email", patientData.email)}
                  {renderField("Address", patientData.address)}
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🌍</span> Additional Information
                  </h2>
                  {renderField("Preferred Language", patientData.preferredLanguage)}
                  {renderField("Nationality", patientData.nationality)}
                  {renderField("Religion", patientData.religion)}
                </div>

                {/* Emergency Contact */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🚨</span> Emergency Contact
                  </h2>
                  {renderField("Contact Name", patientData.emergencyContactName)}
                  {renderField("Relationship", patientData.emergencyContactRelationship)}
                </div>
              </div>
            )}

            {status === "submitted" && patientData.submittedAt && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-semibold text-green-800">Form Submitted</div>
                    <div className="text-sm text-green-700">
                      Submitted at: {new Date(patientData.submittedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
