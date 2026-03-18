export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem("patientSessionId");

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("patientSessionId", sessionId);
  }

  return sessionId;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
