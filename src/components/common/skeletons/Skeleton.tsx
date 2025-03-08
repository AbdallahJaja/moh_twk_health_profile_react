import React from 'react';
import type { SkeletonProps } from './types';

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  count = 1 
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
        />
      ))}
    </>
  );
};