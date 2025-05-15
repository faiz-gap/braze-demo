import React from 'react';

const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20"><path d="M10 5v10m-5-5h10" strokeLinejoin="round" strokeLinecap="round"/></svg>;

const WelcomeBanner = ({ userName, userInitials }) => {
  return (
    <div className="bg-gradient-to-r from-banner-gradient-from to-banner-gradient-to text-white 
                    flex flex-col md:flex-row items-center justify-between 
                    py-5 px-6 md:py-0 md:h-32
                    -mx-4 sm:-mx-6 lg:-mx-8 mb-8 
                    w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] 
                    shadow-md relative z-[5]">
      <div className="text-center md:text-left mb-4 md:mb-0 flex-1">
        <h1 className="text-2xl md:text-[28px] font-light">
          Welcome, {userName}
          <span className="bg-brand-lime text-brand-green px-3 py-1 rounded-md font-semibold text-lg ml-3 align-middle">
            {userInitials}
          </span>
        </h1>
      </div>
      <button className="bg-brand-lime text-brand-green font-semibold px-4.5 py-2.5 rounded-md flex items-center justify-center gap-2 text-[15px]
                         transition-colors hover:bg-brand-lime-hover md:w-auto md:m-0 z-[1] focus:outline-none focus:ring-2 focus:ring-brand-lime-hover focus:ring-opacity-50">
        <PlusIcon />
        <span>Place new order</span>
      </button>
    </div>
  );
};

export default WelcomeBanner;