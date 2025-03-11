import React from 'react';
import { colors } from '../../../styles/colors';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info';
  label: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  return (
    <span className={`
      px-2.5 py-1 rounded-full text-sm font-medium
      ${colors.status[status].bg}
      ${colors.status[status].text}
      transition-colors duration-200
    `}>
      {label}
    </span>
  );
};