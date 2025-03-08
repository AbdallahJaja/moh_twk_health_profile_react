import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" data-testid="dashboard-skeleton">
      {/* Actions skeleton */}
      <div className="flex justify-end space-x-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
      </div>

      {/* Profile skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Sections skeleton */}
      {[1, 2, 3].map((section) => (
        <div
          key={section}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};