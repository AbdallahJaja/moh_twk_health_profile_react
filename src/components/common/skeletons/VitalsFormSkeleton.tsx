import React from 'react';
import { Skeleton } from './Skeleton';

export const VitalsFormSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-24" />
    </div>

    {/* Form Fields Skeleton */}
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>

    {/* Chart Skeleton if applicable */}
    <Skeleton className="h-64 w-full" />
  </div>
);