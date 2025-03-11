import React from 'react';
import { AlertTriangle, Check, Info } from 'lucide-react';
import { colors } from '../../../styles/colors';

type AlertType = 'success' | 'error' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const icons = {
    success: <Check size={16} />,
    error: <AlertTriangle size={16} />,
    info: <Info size={16} />
  };

  return (
    <div className={`
      mb-4 p-3 rounded-md flex items-center gap-2
      ${colors.status[type].bg}
      ${colors.status[type].text}
      ${colors.status[type].border}
      border transition-all duration-200
    `}>
      {icons[type]}
      {message}
    </div>
  );
};