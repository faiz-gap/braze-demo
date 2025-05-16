import React, { useState, useEffect, useRef } from 'react';
import NotificationOptInPopup from './NotificationOptInPopup'; // Make sure path is correct

// --- SVG Icons ---
const LogoIcon = () => <svg className="w-8 h-8 mr-2 stroke-brand-green fill-none" viewBox="0 0 32 32" strokeWidth="2"><circle cx="16" cy="16" r="14" /><path d="M8 16h16 M16 8c0 16 0 16 0 16" strokeLinejoin="round" strokeLinecap="round" /></svg>;
const ClockIcon = () => <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
const BellIconSvg = () => <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const MoonIcon = () => <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
// --- End SVG Icons ---

const Header = ({
  userInitials,
  onLogout,
  onBellClick,
  hasUnreadNotification,
  onToggleMobileSidebar,
  // Props for NotificationOptInPopup
  isNotificationPopupVisible,
  onNotificationClose,
  onNotificationSignUp,
  onNotificationAskLater
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellWrapperRef = useRef(null); // Using this ref for better alignment

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      // Note: NotificationOptInPopup has its own click-outside logic
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-brand-gray-dark px-4 sm:px-6 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-30 shadow-header h-[60px]">
      <div className="flex items-center">
        <button onClick={onToggleMobileSidebar} className="md:hidden text-brand-gray-textLight hover:text-brand-green mr-3">
            <MenuIcon />
        </button>
        <div className="flex items-center text-lg font-semibold text-brand-gray-text">
          <LogoIcon />
          <span>hosting.com</span>
        </div>
      </div>

      <div className="flex items-center pr-1">
        {/* Icon toolbar with unified gray background */}
        <div className="flex items-center bg-gray-50 rounded-lg px-1 mr-2">
          <button className="flex items-center justify-center w-8 h-8 text-brand-gray-textLight hover:text-brand-green transition-colors">
            <ClockIcon />
          </button>
          
          <button className="flex items-center justify-center w-8 h-8 text-brand-gray-textLight hover:text-brand-green transition-colors">
            <MoonIcon />
          </button>
          
          {/* Bell icon with notification popup */}
          <div className="relative" ref={bellWrapperRef}>
            <button
              id="notificationBellIcon"
              onClick={onBellClick}
              className="flex items-center justify-center w-8 h-8 text-brand-gray-textLight hover:text-brand-green transition-colors relative"
            >
              <BellIconSvg />
              {hasUnreadNotification && (
                <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-notification-dot rounded-full border border-white pointer-events-none"></span>
              )}
            </button>
            <NotificationOptInPopup
              isVisible={isNotificationPopupVisible}
              onClose={onNotificationClose}
              onSignUp={onNotificationSignUp}
              onAskLater={onNotificationAskLater}
            />
          </div>
        </div>
        
        {/* User initials button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-brand-lime text-brand-green px-3 py-1.5 rounded-md font-semibold text-sm uppercase transition-all hover:bg-brand-lime-hover hover:-translate-y-px focus:outline-none min-w-[40px] text-center"
          >
            {userInitials}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-brand-gray-dark rounded-md shadow-dropdown z-40 overflow-hidden py-1">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onLogout(); setDropdownOpen(false); }}
                className="block px-4 py-2 text-sm text-brand-gray-text hover:bg-brand-gray hover:text-brand-green whitespace-nowrap"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;