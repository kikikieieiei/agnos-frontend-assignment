"use client";

import { useEffect, useState } from "react";
import { getAblyClient } from "@/lib/ably";

export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupConnection = async () => {
      try {
        const ably = getAblyClient();

        ably.connection.on("connected", () => {
          if (mounted) {
            setIsConnected(true);
            setError(null);
          }
        });

        ably.connection.on("disconnected", () => {
          if (mounted) {
            setIsConnected(false);
          }
        });

        ably.connection.on("failed", () => {
          if (mounted) {
            setIsConnected(false);
            setError("Connection failed. Please check your API key.");
          }
        });

        ably.connection.on("suspended", () => {
          if (mounted) {
            setIsConnected(false);
          }
        });

        // Initial connection check
        if (ably.connection.state === "connected") {
          setIsConnected(true);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to setup connection"
          );
        }
      }
    };

    setupConnection();

    return () => {
      mounted = false;
    };
  }, []);

  return { isConnected, error };
}
