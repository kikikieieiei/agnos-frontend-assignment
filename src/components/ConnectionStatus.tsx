"use client";

import { useEffect, useState } from "react";

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export default function ConnectionStatus({
  isConnected,
  className = "",
}: ConnectionStatusProps) {
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        setShowReconnecting(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowReconnecting(false);
    }
  }, [isConnected]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`h-3 w-3 rounded-full transition-colors ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm text-gray-600">
        {isConnected ? (
          "Connected"
        ) : showReconnecting ? (
          <span className="text-yellow-600">Reconnecting...</span>
        ) : (
          "Disconnected"
        )}
      </span>
    </div>
  );
}
