import React from 'react';
import { colors } from '../../../styles/colors';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  back?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className={`text-xl font-bold ${colors.text.primary}`}>
      {title}
    </h2>
    {action}
  </div>
);