import { ReactNode } from "react";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  onEdit?: () => void;
}

export function SectionCard({ icon, title, children, onEdit }: SectionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Edit
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
