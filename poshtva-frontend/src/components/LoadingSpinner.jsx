import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-4 border-forest-200 border-t-forest-500 rounded-full animate-spin`} />
      {text && <p className="text-gray-500 text-sm animate-pulse">{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

export default LoadingSpinner;
