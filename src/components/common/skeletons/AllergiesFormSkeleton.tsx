import React from 'react';
import { Skeleton } from './Skeleton';

export const AllergiesFormSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-24" />
    </div>

    {/* Allergies List */}
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);