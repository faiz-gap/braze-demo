import React from 'react';

const SearchIconSvg = () => <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 stroke-brand-gray-textLighter fill-none" viewBox="0 0 18 18" strokeWidth="1.5"><circle cx="8" cy="8" r="7" /><path d="M12.5 12.5l4 4" strokeLinecap="round"/></svg>;
const FilterIconSvg = () => <svg className="w-4 h-4 stroke-brand-gray-textLight fill-none group-hover:stroke-brand-gray-text" viewBox="0 0 16 16" strokeWidth="2" strokeLinecap="round"><path d="M2 4h12M3 8h10M4 12h8" /></svg>;
const SortArrowIconSvg = () => <svg className="w-4 h-4 stroke-brand-gray-textLight fill-none group-hover:stroke-brand-gray-text" viewBox="0 0 16 16" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><path d="M4 6l4 4 4-4" /></svg>;

const FilterBar = () => {
  return (
    <div className="p-4 sm:p-6 border-b border-brand-gray-dark flex flex-col md:flex-row items-center gap-4">
      <div className="relative flex-1 w-full md:max-w-xs">
        <SearchIconSvg />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full pl-10 pr-4 py-2.5 border border-brand-gray-dark rounded-md text-sm 
                     transition-colors duration-200 bg-brand-gray-light
                     focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime focus:bg-white
                     placeholder-brand-gray-textLighter"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button className="group bg-white border border-brand-gray-dark px-4 py-2.5 rounded-md 
                         cursor-pointer flex items-center gap-2 text-sm text-brand-gray-text 
                         transition-all duration-200 hover:bg-brand-gray-light hover:border-gray-400">
          <FilterIconSvg />
          <span>Filter</span>
        </button>
        <button className="group bg-white border border-brand-gray-dark px-4 py-2.5 rounded-md 
                         cursor-pointer flex items-center gap-2 text-sm text-brand-gray-text 
                         transition-all duration-200 hover:bg-brand-gray-light hover:border-gray-400">
          <span>Sort</span>
          <SortArrowIconSvg />
        </button>
      </div>
    </div>
  );
};

export default FilterBar;