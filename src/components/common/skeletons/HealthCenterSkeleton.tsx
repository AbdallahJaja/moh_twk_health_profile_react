import React from 'react';
import { Skeleton } from './Skeleton';

export const HealthCenterSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-24 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
};