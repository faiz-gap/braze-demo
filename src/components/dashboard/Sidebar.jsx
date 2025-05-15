import React from 'react';

// --- SVG Icons ---
const HomeIcon = () => <svg className="w-5 h-5" fill="none" strokeWidth="2" viewBox="0 0 20 20"><path d="M3 9l7-7 7 7v9a1 1 0 0 1-1 1h-4v-5h-4v5H4a1 1 0 0 1-1-1V9z" strokeLinejoin="round" strokeLinecap="round"/></svg>;
const ProductsIcon = () => <svg className="w-5 h-5" fill="none" strokeWidth="2" viewBox="0 0 20 20"><rect x="2" y="6" width="16" height="12" rx="1" /><path d="M6 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinejoin="round" strokeLinecap="round"/></svg>;
const BillingIcon = () => <svg className="w-5 h-5" fill="none" strokeWidth="2" viewBox="0 0 20 20"><rect x="2" y="5" width="16" height="10" rx="2" /><path d="M6 10h8" strokeLinejoin="round" strokeLinecap="round"/></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20"><path d="M10 5v10m-5-5h10" strokeLinejoin="round" strokeLinecap="round"/></svg>;
// --- End SVG Icons ---

const NavItem = ({ icon, text, isActive, hasArrow, onClick }) => (
  <div
    onClick={onClick}
    className={`group flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg transition-all duration-200 mb-1
    ${isActive 
      ? 'bg-brand-gray text-brand-green transform translate-x-1 font-medium' 
      : 'text-brand-gray-textLight hover:bg-brand-gray-light hover:text-brand-gray-text hover:translate-x-1'}`}
  >
    <span className={`transition-colors ${isActive ? 'stroke-brand-green' : 'stroke-current group-hover:stroke-brand-green'}`}>
      {icon}
    </span>
    <span className="flex-1 text-[15px]">{text}</span>
    {hasArrow && <span className={`text-gray-400 text-xl transition-transform duration-200 ${isActive ? 'transform translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>›</span>}
  </div>
);

const Sidebar = ({ isMobileOpen, toggleMobileSidebar }) => {
  // Add active state management if navigation is implemented
  const [activeItem, setActiveItem] = React.useState('Home');

  const navItems = [
    { id: 'Home', icon: <HomeIcon />, text: 'Home' },
    { id: 'Products', icon: <ProductsIcon />, text: 'Products', hasArrow: true },
    { id: 'Billing', icon: <BillingIcon />, text: 'Billing', hasArrow: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}
      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-[60px] md:top-auto left-0 h-[calc(100vh-60px)] md:h-auto 
                   w-64 sm:w-72 bg-white border-r border-brand-gray-dark p-5 overflow-y-auto z-20
                   transform transition-transform duration-300 ease-in-out md:translate-x-0
                   ${isMobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
      >
        <button className="w-full bg-brand-lime text-brand-green font-semibold px-5 py-3.5 rounded-lg flex items-center justify-center gap-2 text-base mb-6
                         transition-all duration-300 ease-in-out shadow-btn-new-order hover:bg-brand-lime-hover hover:-translate-y-0.5 hover:shadow-btn-new-order-hover 
                         active:translate-y-0 active:shadow-btn-new-order focus:outline-none focus:ring-2 focus:ring-brand-lime-hover focus:ring-opacity-50">
          <PlusIcon />
          <span>Place new order</span>
        </button>
        <nav>
          {navItems.map(item => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              text={item.text} 
              isActive={activeItem === item.id} 
              hasArrow={item.hasArrow}
              onClick={() => {
                setActiveItem(item.id);
                if(isMobileOpen) toggleMobileSidebar(); // Close sidebar on mobile nav click
                // Handle actual navigation if these link to different views/routes
              }}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};
export default Sidebar;