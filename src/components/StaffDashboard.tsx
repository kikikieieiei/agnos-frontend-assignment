"use client";

import { useEffect, useState } from "react";
import { getAblyClient, PATIENT_CHANNEL } from "@/lib/ably";
import type { PatientSession } from "@/types/patient";

export default function StaffDashboard() {
  const [sessions, setSessions] = useState<Map<string, PatientSession>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    let channel: any;
    let inactivityCheckInterval: NodeJS.Timeout;

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

        // Listen for patient updates
        channel.subscribe("patient-update", (message: any) => {
          const data = message.data as PatientSession;

          setSessions((prev) => {
            const updated = new Map(prev);
            updated.set(data.sessionId, data);
            return updated;
          });
        });

        // Listen for heartbeats to update activity
        channel.subscribe("patient-heartbeat", (message: any) => {
          const { sessionId, lastActivity } = message.data;

          setSessions((prev) => {
            const updated = new Map(prev);
            const existing = updated.get(sessionId);

            if (existing) {
              updated.set(sessionId, {
                ...existing,
                lastActivity,
              });
            }

            return updated;
          });
        });

        // Check for inactive sessions every 10 seconds
        inactivityCheckInterval = setInterval(() => {
          const now = Date.now();
          const INACTIVITY_THRESHOLD = 15000; // 15 seconds

          setSessions((prev) => {
            const updated = new Map(prev);
            let hasChanges = false;

            updated.forEach((session, sessionId) => {
              if (
                session.status === "filling" &&
                now - session.lastActivity > INACTIVITY_THRESHOLD
              ) {
                updated.set(sessionId, {
                  ...session,
                  status: "inactive",
                });
                hasChanges = true;
              }
            });

            return hasChanges ? updated : prev;
          });
        }, 10000);
      } catch (error) {
        console.error("Ably setup error:", error);
      }
    };

    setupRealtime();

    return () => {
      if (inactivityCheckInterval) clearInterval(inactivityCheckInterval);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const activeSessions = Array.from(sessions.values()).sort(
    (a, b) => b.lastActivity - a.lastActivity
  );

  const getStatusBadge = (status: PatientSession["status"]) => {
    switch (status) {
      case "filling":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <span className="w-2 h-2 mr-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Actively Filling
          </span>
        );
      case "submitted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1.5 rounded-full bg-green-400" />
            Submitted
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <span className="w-2 h-2 mr-1.5 rounded-full bg-gray-400" />
            Inactive
          </span>
        );
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const selectedSessionData = selectedSession
    ? sessions.get(selectedSession)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Staff Dashboard</h1>
                <p className="text-indigo-100 mt-1">
                  Real-time patient form monitoring
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span className="text-sm">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-600">
                Active Sessions
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {
                  activeSessions.filter((s) => s.status === "filling").length
                }
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-600">
                Submitted Forms
              </div>
              <div className="text-2xl font-bold text-green-600">
                {
                  activeSessions.filter((s) => s.status === "submitted")
                    .length
                }
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-600">
                Total Sessions
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                {activeSessions.length}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* Sessions List */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Patient Sessions
              </h2>

              {activeSessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="mt-2">No active patient sessions</p>
                  <p className="text-sm">
                    Sessions will appear here when patients start filling forms
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {activeSessions.map((session) => (
                    <div
                      key={session.sessionId}
                      onClick={() => setSelectedSession(session.sessionId)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedSession === session.sessionId
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {session.formData.firstName || "New"}{" "}
                          {session.formData.lastName || "Patient"}
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>
                          Session: {session.sessionId.slice(0, 20)}...
                        </div>
                        <div>
                          Last activity: {formatTimestamp(session.lastActivity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Details */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Form Details
              </h2>

              {selectedSessionData ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      Status
                    </div>
                    <div>{getStatusBadge(selectedSessionData.status)}</div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">
                      Personal Information
                    </h3>

                    <DetailField
                      label="First Name"
                      value={selectedSessionData.formData.firstName}
                    />
                    <DetailField
                      label="Middle Name"
                      value={selectedSessionData.formData.middleName}
                    />
                    <DetailField
                      label="Last Name"
                      value={selectedSessionData.formData.lastName}
                    />
                    <DetailField
                      label="Date of Birth"
                      value={selectedSessionData.formData.dateOfBirth}
                    />
                    <DetailField
                      label="Gender"
                      value={selectedSessionData.formData.gender}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">
                      Contact Information
                    </h3>

                    <DetailField
                      label="Phone Number"
                      value={selectedSessionData.formData.phone}
                    />
                    <DetailField
                      label="Email"
                      value={selectedSessionData.formData.email}
                    />
                    <DetailField
                      label="Address"
                      value={selectedSessionData.formData.address}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">
                      Additional Information
                    </h3>

                    <DetailField
                      label="Preferred Language"
                      value={selectedSessionData.formData.preferredLanguage}
                    />
                    <DetailField
                      label="Nationality"
                      value={selectedSessionData.formData.nationality}
                    />
                    <DetailField
                      label="Religion"
                      value={selectedSessionData.formData.religion}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">
                      Emergency Contact
                    </h3>

                    <DetailField
                      label="Contact Name"
                      value={selectedSessionData.formData.emergencyContactName}
                    />
                    <DetailField
                      label="Relationship"
                      value={
                        selectedSessionData.formData.emergencyContactRelationship
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">Select a session to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="bg-white p-3 rounded border border-gray-200">
      <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-sm text-gray-900">
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-gray-400 italic">Not provided</span>
        )}
      </div>
    </div>
  );
}
