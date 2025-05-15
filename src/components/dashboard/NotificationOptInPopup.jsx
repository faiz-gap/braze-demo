import React, { useEffect, useRef } from 'react';

const NotificationOptInPopup = ({ isVisible, onClose, onSignUp, onAskLater }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Check if click is on bell icon; if so, parent handles toggle
        const bellIcon = document.getElementById('notificationBellIcon'); // Assuming this ID exists
        if (bellIcon && bellIcon.contains(event.target)) {
          return;
        }
        onClose(); // Otherwise, close if click is outside popup
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
        ref={popupRef}
        // Mobile: Fixed, centered, slightly offset from top
        // MD and up: Absolute, positioned relative to bell icon (this needs parent to be relative)
        // The positioning logic from original CSS is complex for pure Tailwind.
        // This version simplifies for fixed on mobile, absolute on desktop near where bell would be.
        // Header needs to be `relative` for the `md:absolute` to work as intended IF this popup is INSIDE the header.
        // If it's a global popup in DashboardPage, then positioning is relative to DashboardPage.
        className={`
            bg-white border border-brand-gray-dark rounded-lg shadow-native-popup 
            w-[330px] max-w-[calc(100vw-40px)] text-left transform transition-all duration-150 ease-out
            fixed top-16 left-1/2 -translate-x-1/2 z-50 
            md:absolute md:top-full md:right-[-20px] md:left-auto md:translate-x-0 md:mt-3 md:origin-top-right
            ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}
        `}
        // Add 'data-testid="notification-popup"' for easier testing
    >
        {/* Arrow for desktop (complex with pure Tailwind, often done with custom CSS or SVG) */}
        <div className="hidden md:block absolute top-[-10px] right-[22px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white z-[1]"></div>
        <div className="hidden md:block absolute top-[-11px] right-[21px] w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-b-[11px] border-b-brand-gray-dark z-[0]"></div>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-brand-gray-textLighter hover:text-brand-gray-text text-2xl leading-none p-1 z-10"
      >
        ×
      </button>
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-popup-header-text">Notifications</h3>
        </div>
        <h4 className="text-base font-medium text-popup-header-text mb-2 leading-snug">
          Stay connected with the latest from hosting.com!
        </h4>
        <p className="text-sm text-brand-gray-textMedium leading-relaxed mb-5">
          I want to receive emails and in-app messages for personalized offers, product updates, renewals and promotions.
        </p>
        <div className="flex flex-col gap-3 mt-5 mb-4">
          <button
            onClick={onSignUp}
            className="w-full px-4 py-3 rounded-md text-sm font-medium bg-popup-header-text text-white hover:bg-gray-700 transition-colors border border-transparent"
          >
            Sign me up
          </button>
          <button
            onClick={onAskLater}
            className="w-full px-4 py-2 rounded-md text-sm font-medium bg-white text-brand-gray-textMedium hover:bg-brand-gray-light hover:text-popup-header-text transition-colors border border-white"
          >
            Ask me later
          </button>
        </div>
        <p className="text-xs text-brand-gray-textPlaceholder mt-4 mb-0 leading-normal">
          By clicking “Sign me up” you consent to receive promotional messages. You can manage your preferences at any time.
        </p>
      </div>
    </div>
  );
};

export default NotificationOptInPopup;