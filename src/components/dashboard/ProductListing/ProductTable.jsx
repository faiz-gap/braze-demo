import React from 'react';

const StatusWarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
);

const productData = [ // Sample data, replace with actual data source
  { id: 1, mainTitle: 'Shared Web Hosting', name: 'PLUS [Shared Webhosting]', domain: 'anotherdomainn.com', domainIcon: 'M', dueDate: 'Jun 8, 2025', status: 'Active (Expires soon)', actions: ['Login to Control Panel', 'Manage'] },
  { id: 2, mainTitle: 'Hosting for WordPress', name: 'STARTER [Hosting for WordPress]', domain: 'anotherdomain.com', domainIcon: 'W', dueDate: 'May 28, 2025', status: 'Active (Expires soon)', actions: ['Manage'] },
  { id: 3, mainTitle: 'Shared Web Hosting', name: 'PLUS [Shared Webhosting]', domain: 'newdomainn.com', domainIcon: 'M', dueDate: 'Jun 2, 2025', status: 'Active (Expires soon)', actions: ['Login to Control Panel', 'Manage'] },
];

const TableHeader = () => (
  <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_2fr] md:grid-cols-[2.5fr_1.5fr_1.5fr_2fr] lg:grid-cols-[2.5fr_1.5fr_1.5fr_2fr] xl:grid-cols-[2.5fr_1.5fr_1.5fr_2fr] 
                  px-6 py-3 bg-brand-gray-light font-semibold text-[13px] text-brand-gray-textMedium capitalize">
    <div>Product name</div>
    <div className="hidden md:block">Next due date</div> {/* Hidden on smaller than md based on original CSS logic */}
    <div className="hidden lg:block">Status</div> {/* Hidden on smaller than lg based on original CSS logic */}
    <div className="invisible">Actions</div> {/* For spacing, actions not in header */}
  </div>
);

const TableRow = ({ product }) => (
  <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2.5fr_1.5fr_2fr] lg:grid-cols-[2.5fr_1.5fr_1.5fr_2fr] 
                  px-6 py-4 border-b border-gray-100 items-center transition-colors duration-200 hover:bg-gray-50 text-sm gap-2.5 md:gap-0">
    {/* Product Info */}
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-brand-gray-textLight">{product.mainTitle}</span>
      <span className="font-semibold text-brand-gray-text text-[15px]">{product.name}</span>
      <div className="text-sm text-brand-gray-textLight flex items-center gap-2 mt-1">
        {product.domain}
        <span className="w-4.5 h-4.5 bg-brand-lime text-brand-green rounded-full inline-flex items-center justify-center text-[10px] font-bold leading-none">
          {product.domainIcon}
        </span>
      </div>
    </div>

    {/* Due Date - hidden on small screens per original logic */}
    <div className="hidden md:block text-brand-gray-textMedium">{product.dueDate}</div>
    
    {/* Status - hidden on small & medium screens per original logic */}
    <div className="hidden lg:block">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-xs font-medium bg-status-active-bg text-status-active-text">
        <StatusWarningIcon />
        {product.status}
      </span>
    </div>
    
    {/* Action Buttons */}
    <div className="flex gap-3 items-center justify-start md:justify-end lg:justify-start">
      {product.actions.map(action => (
        <button 
          key={action}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-brand-gray-dark bg-gray-100 text-brand-gray-text 
                     cursor-pointer text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap
                     hover:bg-gray-200 hover:border-gray-400"
        >
          {action}
        </button>
      ))}
    </div>
  </div>
);

const ProductTable = () => {
  return (
    <div className="products-table">
      <TableHeader />
      {productData.map(product => (
        <TableRow key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductTable;