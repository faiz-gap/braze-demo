// src/components/dashboard/NotificationOptInPopup.jsx
import React, { useEffect, useRef } from 'react';

const NotificationOptInPopup = ({ isVisible, onClose, onSignUp, onAskLater }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;
    const handleClickOutside = (event) => {
      const bellButton = document.getElementById('notificationBellIcon');
      if (popupRef.current && !popupRef.current.contains(event.target) &&
          (!bellButton || !bellButton.contains(event.target))) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: '-29px', // Fixed position based on screenshot
        width: '330px',
        maxWidth: 'calc(100vw - 40px)',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
        border: '1px solid #e0e0e0',
        zIndex: 50,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 150ms ease-out, opacity 150ms ease-out',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {/* Custom arrow pointing to bell icon */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          right: '35px', // Position arrow directly under bell
          width: '16px',
          height: '16px',
          backgroundColor: 'white',
          transform: 'rotate(45deg)',
          borderTop: '1px solid #e0e0e0',
          borderLeft: '1px solid #e0e0e0',
          zIndex: 1,
        }}
      />

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
          By clicking "Sign me up" you consent to receive promotional messages. You can manage your preferences at any time.
        </p>
      </div>
    </div>
  );
};

export default NotificationOptInPopup;