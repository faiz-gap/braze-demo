import React, { useState } from 'react';

const TabItem = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-4 cursor-pointer border-b-[3px] transition-all duration-200 
                text-sm sm:text-[15px] font-medium focus:outline-none
                ${isActive 
                  ? 'text-brand-gray-text border-brand-lime' 
                  : 'text-brand-gray-textLight border-transparent hover:bg-brand-gray-light hover:text-brand-gray-text'}`}
  >
    {label}
  </button>
);

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('Active');
  const tabLabels = ['Active', 'Cancelled', 'All'];

  return (
    <div className="border-b border-brand-gray-dark">
      <div className="flex px-2">
        {tabLabels.map(label => (
          <TabItem 
            key={label}
            label={label}
            isActive={activeTab === label}
            onClick={() => setActiveTab(label)}
          />
        ))}
      </div>
    </div>
  );
};

export default Tabs;