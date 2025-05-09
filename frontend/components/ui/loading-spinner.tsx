import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-t-transparent border-solid border-purple-600`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-white font-medium">Loading your inbox...</p>
      </div>
    </div>
  );
}
