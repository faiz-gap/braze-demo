import React from 'react';

const ArrowRightBtn = () => (
  <button className="ml-auto bg-white border border-brand-gray-dark w-8 h-8 rounded-full 
                     cursor-pointer shadow-sm flex items-center justify-center text-lg text-brand-gray-text 
                     transition-all duration-200 flex-shrink-0
                     hover:translate-x-0.5 hover:scale-105 hover:shadow-md hover:bg-gray-50">
    →
  </button>
);

const FeatureCard = ({ icon, iconBgClass, title, description }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-feature-card 
                    transition-all duration-200 cursor-pointer 
                    flex items-center gap-4 
                    hover:-translate-y-0.5 hover:shadow-feature-card-hover">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg text-brand-gray-text mb-1 font-semibold">{title}</h3>
        <p className="text-brand-gray-textLight leading-normal text-sm">{description}</p>
      </div>
      <ArrowRightBtn />
    </div>
  );
};

export default FeatureCard;