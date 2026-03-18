"use client";
import { CheckCircle } from "lucide-react";

type Status = "not_started" | "actively_filling" | "inactive" | "submitted";

interface StatusIndicatorProps {
  status: Status;
  size?: "sm" | "md";
}

const config = {
  not_started: { dotClass: "bg-gray-400", label: "Not Started" },
  actively_filling: { dotClass: "bg-blue-500 animate-pulse", label: "Actively Filling" },
  inactive: { dotClass: "bg-amber-500", label: "Inactive" },
  submitted: { dotClass: "", label: "Submitted" },
};

export function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  const { dotClass, label } = config[status];
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      {status === "submitted" ? (
        <CheckCircle className={`${iconSize} text-green-600`} />
      ) : (
        <div className={`${dotSize} rounded-full ${dotClass} flex-shrink-0`} />
      )}
      <span className={`${textSize} font-medium text-gray-700`}>{label}</span>
    </div>
  );
}
