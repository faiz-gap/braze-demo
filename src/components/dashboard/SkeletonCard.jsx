import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col h-full animate-pulse">
      <div className="w-full h-[160px] sm:h-[180px] bg-gray-300"></div> {/* Aspect ratio placeholder */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-300 rounded w-full mb-1.5"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6 mb-4"></div>
        
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-5"></div>

        <div className="mt-auto h-5 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;