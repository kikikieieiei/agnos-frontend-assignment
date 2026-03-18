"use client";

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      isConnected
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-700 border-red-200"
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
      <span>{isConnected ? "Connected" : "Disconnected"}</span>
    </div>
  );
}
