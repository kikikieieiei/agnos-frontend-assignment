interface DataFieldProps {
  label: string;
  value: string | null | undefined;
}

export function DataField({ label, value }: DataFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      {value ? (
        <span className="text-base text-gray-900">{value}</span>
      ) : (
        <span className="text-base text-gray-400 italic">Not provided</span>
      )}
    </div>
  );
}
