"use client";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

interface ProgressBarProps {
  currentStep: number;
  steps: Step[];
}

export function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full mb-8">
      <div className="relative flex justify-between items-start">
        {/* Background line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
        {/* Progress line */}
        <div
          className="absolute top-4 left-4 h-0.5 bg-blue-600 transition-all duration-300"
          style={{ width: `calc(${progress}% - 2rem)` }}
        />

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                isCompleted || isCurrent
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span className={`text-xs text-center hidden sm:block transition-colors ${
                isCurrent ? "font-medium text-blue-600" : isCompleted ? "text-gray-600" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
