// src/components/common/ui/Alert.tsx
// Add transition classes

import { AlertTriangle, Check } from "lucide-react";

interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

export const Alert = ({ type, message }: AlertProps) => (
  <div
    className={`
      success-alert p-4 mb-4 rounded-md transition-opacity duration-300
      ${
        type === "success"
          ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
          : ""
      }
      ${
        type === "error"
          ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
          : ""
      }
    `}
  >
    {/* Alert content */}
    <div className="flex">
      {type === "success" && (
        <Check size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
      )}
      {type === "error" && (
        <AlertTriangle size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
      )}
      <span>{message}</span>
    </div>
  </div>
);
