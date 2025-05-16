// src/components/dashboard/SkeletonCard.jsx
import React from 'react';

const SkeletonCard = () => {
  // Fixed height for the card, same as PromoCard
  const cardHeight = "h-[420px]"; // Or your chosen consistent height

  // Proportions based on the original skeleton image
  // Image placeholder seems to be less than half, maybe 40-45%
  const imageHeightProportion = "h-[40%]"; // e.g., 40% of cardHeight
  const contentHeightProportion = "h-[60%]"; // e.g., 60% of cardHeight

  return (
    <div 
      className={`bg-white rounded-xl shadow-card overflow-hidden flex flex-col ${cardHeight} w-full animate-pulse`}
    >
      {/* Image Placeholder */}
      <div className={`${imageHeightProportion} w-full bg-gray-300 rounded-t-xl`}></div> 
      {/* Added rounded-t-xl if only top part of image placeholder is visible before content padding */}
      
      {/* Content Placeholder */}
      <div className={`${contentHeightProportion} p-5 flex flex-col justify-between`}>
        {/* Text lines group */}
        <div className="space-y-3"> {/* Increased spacing between lines */}
          {/* Line 1 (Title) - wider, slightly taller */}
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          {/* Line 2 (Description part 1) */}
          <div className="h-3.5 bg-gray-300 rounded w-full"></div>
          {/* Line 3 (Description part 2) */}
          <div className="h-3.5 bg-gray-300 rounded w-5/6"></div>
        </div>
        
        {/* Bottom elements group (Price/CTA) - Pushed to bottom by justify-between */}
        <div className="space-y-3 mt-4"> {/* Added mt-4 for some space from description */}
           {/* Line 4 (Price) - shorter width */}
           <div className="h-4 bg-gray-300 rounded w-1/2"></div>
           {/* Line 5 (CTA) - shorter width */}
           <div className="h-5 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;