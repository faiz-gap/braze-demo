/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#0a3d2c',
        'brand-green-darker': '#083325',
        'brand-lime': '#aafa47',
        'brand-lime-hover': '#98e63f', // For user-badge hover, new-order-btn hover
        'brand-gray': {
          light: '#f8f9fa', // body bg, content bg
          DEFAULT: '#f0f0f0', // dropdown item hover, table row hover (fafafa is close)
          dark: '#e0e0e0', // borders
          medium: '#ced4da', // braze slot dashed border
          text: '#333',
          textMedium: '#555',
          textLight: '#666',
          textLighter: '#999',
          textPlaceholder: '#6c757d', // braze slot placeholder text
        },
        'banner-gradient-from': '#2e4a45',
        'banner-gradient-to': '#314945',
        'feedback-bg': '#e6f9f0',
        'hosting-card-gradient-from': '#aafa47',
        'hosting-card-gradient-to': '#94f3d1',
        'notification-dot': '#fa3e3e',
        'status-active-bg': '#fff3cd',
        'status-active-text': '#856404',
        'popup-header-text': '#111',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'header': '0 1px 3px rgba(0,0,0,0.05)',
        'dropdown': '0 4px 12px rgba(0,0,0,0.1)',
        'card': '0 2px 5px rgba(0,0,0,0.08)',
        'card-hover': '0 5px 12px rgba(0,0,0,0.12)',
        'btn-new-order': '0 2px 4px rgba(10,61,44,0.1)',
        'btn-new-order-hover': '0 4px 8px rgba(10,61,44,0.15)',
        'feature-card': '0 1px 3px rgba(0,0,0,0.05)',
        'feature-card-hover': '0 4px 8px rgba(0,0,0,0.1)',
        'chat-button': '0 4px 12px rgba(0,0,0,0.15)',
        'chat-button-hover': '0 6px 16px rgba(0,0,0,0.2)',
        'native-popup': '0 6px 16px rgba(0, 0, 0, 0.12)',
        'hosting-card': '0 4px 12px rgba(0,0,0,0.08)',
        'hosting-card-hover': '0 6px 16px rgba(0,0,0,0.12)',
      },
      spacing: { // For specific padding/margin from original CSS if needed
        '4.5': '1.125rem', // 18px
        '5.5': '1.375rem', // 22px
      },
      borderRadius: {
        '4xl': '2rem', // For chat button
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // Add this line
  ],
}