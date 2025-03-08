import React from 'react';
import { Skeleton } from './Skeleton';

export const GeneralHealthFormSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>

    {/* Health Status Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);