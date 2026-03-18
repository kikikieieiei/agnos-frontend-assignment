"use client";

import { useEffect, useState, useRef } from "react";
import { User, Phone, Globe, AlertCircle, Eye, CheckCircle } from "lucide-react";
import { PatientFormData } from "@/types/patient";
import { getAblyClient } from "@/lib/ably";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { SectionCard } from "@/components/ui/SectionCard";
import { DataField } from "@/components/ui/DataField";

type Status = "not_started" | "actively_filling" | "inactive" | "submitted";

export default function StaffPage() {
  const [patientData, setPatientData] = useState<Partial<PatientFormData>>({});
  const [status, setStatus] = useState<Status>("not_started");
  const [isConnected, setIsConnected] = useState(false);
  const lastUpdateTimeRef = useRef<number>(0);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef<Status>("not_started");

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
      setPatientData(message.data.formData);
      lastUpdateTimeRef.current = Date.now();
      if (statusRef.current !== "submitted") {
        statusRef.current = "actively_filling";
        setStatus("actively_filling");
      }
    });

    // Subscribe to form submission
    channel.subscribe("form-submitted", (message) => {
      setPatientData(message.data.formData);
      statusRef.current = "submitted";
      setStatus("submitted");
    });

    // Status update interval
    statusIntervalRef.current = setInterval(() => {
      if (statusRef.current === "submitted") return;

      if (lastUpdateTimeRef.current === 0) {
        statusRef.current = "not_started";
        setStatus("not_started");
        return;
      }

      const timeSinceLastUpdate = (Date.now() - lastUpdateTimeRef.current) / 1000;

      if (timeSinceLastUpdate < 5) {
        statusRef.current = "actively_filling";
        setStatus("actively_filling");
      } else {
        statusRef.current = "inactive";
        setStatus("inactive");
      }
    }, 1000);

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Staff Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time Patient Registration Monitor</p>
            </div>
            <ConnectionStatus isConnected={isConnected} />
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Form Status:</span>
              <StatusIndicator status={status} />
            </div>
          </div>
        </div>

        {/* Patient Data */}
        {status === "not_started" ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for Patient</h3>
              <p className="text-sm text-gray-600">
                Patient data will appear here in real-time once they start filling the form
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Submission Confirmation Banner */}
            {status === "submitted" && patientData.submittedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 mb-1">Form Submitted Successfully</h4>
                    <p className="text-sm text-green-700">
                      Submitted at: {new Date(patientData.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <SectionCard icon={<User className="w-5 h-5" />} title="Personal Information">
                <DataField label="First Name" value={patientData.firstName} />
                <DataField label="Last Name" value={patientData.lastName} />
                <DataField label="Date of Birth" value={patientData.dateOfBirth} />
                <DataField label="Gender" value={patientData.gender} />
              </SectionCard>

              {/* Contact Information */}
              <SectionCard icon={<Phone className="w-5 h-5" />} title="Contact Information">
                <DataField label="Email" value={patientData.email} />
                <DataField label="Phone Number" value={patientData.phone} />
                <DataField label="Address" value={patientData.address} />
                <DataField label="City" value={patientData.city} />
                <DataField label="State" value={patientData.state} />
                <DataField label="ZIP Code" value={patientData.zipCode} />
              </SectionCard>

              {/* Additional Information */}
              <SectionCard icon={<Globe className="w-5 h-5" />} title="Additional Information">
                <DataField label="Preferred Language" value={patientData.preferredLanguage} />
                <DataField label="Nationality" value={patientData.nationality} />
                <DataField label="Religion" value={patientData.religion} />
              </SectionCard>

              {/* Emergency Contact */}
              <SectionCard icon={<AlertCircle className="w-5 h-5" />} title="Emergency Contact">
                <DataField label="Contact Name" value={patientData.emergencyContactName} />
                <DataField label="Contact Phone" value={patientData.emergencyContactPhone} />
                <DataField label="Relationship" value={patientData.emergencyContactRelationship} />
              </SectionCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
