import React from 'react';

const PageButton = ({ children, isDisabled, isCurrent }) => (
  <button
    disabled={isDisabled}
    className={`w-8 h-8 border border-brand-gray-dark bg-white rounded-md 
                cursor-pointer flex items-center justify-center transition-all duration-200 
                text-brand-gray-textMedium text-base
                ${isCurrent ? 'bg-brand-lime border-brand-lime text-brand-green font-semibold' : ''}
                ${!isDisabled && !isCurrent ? 'hover:bg-gray-100 hover:border-gray-400' : ''}
                ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
  >
    {children}
  </button>
);

const Pagination = () => {
  // Add state for current page, rows per page, total items etc.
  return (
    <div className="px-6 py-5 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-sm text-brand-gray-textLight gap-4 md:gap-0">
      <div className="flex items-center gap-2">
        <label htmlFor="rowsPerPage">Rows per page</label>
        <select id="rowsPerPage" className="px-3 py-2 pr-8 border border-brand-gray-dark rounded-md bg-white cursor-pointer focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime">
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select>
      </div>
      <div className="page-info text-center md:text-left">Page 1 of 1</div>
      <div className="flex items-center gap-1.5">
        <PageButton isDisabled>«</PageButton>
        <PageButton isDisabled>‹</PageButton>
        {/* Example page numbers - make dynamic */}
        {/* <PageButton isCurrent>1</PageButton> */}
        <PageButton isDisabled>›</PageButton>
        <PageButton isDisabled>»</PageButton>
      </div>
    </div>
  );
};

export default Pagination;