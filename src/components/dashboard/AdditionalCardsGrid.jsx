import React from 'react';
import FeatureCard from './FeatureCard';

// SVG Icons for Feature Cards (Ideally in a separate Icons.jsx)
const DnsIcon = () => <svg className="w-6 h-6 stroke-brand-green fill-none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const TurboIcon = () => <svg className="w-6 h-6 fill-yellow-500 stroke-none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.71 14.83c-.16.16-.38.24-.6.24-.22 0-.44-.08-.6-.24l-2.67-2.67-1.53 1.53c-.16.16-.38.24-.6.24s-.44-.08-.6-.24l-2.67-2.67-1.53 1.53c-.16.16-.38.24-.6.24s-.44-.08-.6-.24c-.32-.32-.32-.85 0-1.17l2.12-2.12-2.12-2.12c-.32-.32-.32-.85 0-1.17s.85-.32 1.17 0l1.53 1.53 2.67-2.67c.32-.32.85-.32 1.17 0s.32.85 0 1.17l-2.12 2.12 2.12 2.12c.32.32.32.85 0 1.17l-1.53 1.53 2.67 2.67c.35.35.35.89.03 1.2zM9.4 10.5l.89.89-2.08 2.08.89.89L12 11.59l2.89 2.89.89-.89-2.08-2.08.89-.89L15.47 12l-2.89-2.89-.89.89 2.08 2.08-.89.89L12 12.41l-2.6-2.6-.89.89 2.08 2.08z"/></svg>;
const ProfileIcon = () => <svg className="w-6 h-6 stroke-brand-gray-textLight fill-none" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const SupportIcon = () => <svg className="w-6 h-6 stroke-brand-green fill-none" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path><path d="M6.48 8.6A5.14 5.14 0 0 1 10 7.5a5.14 5.14 0 0 1 3.52 1.1"></path></svg>;

const featureCardsData = [
  { id: 'dns', icon: <DnsIcon />, iconBgClass: 'bg-green-100', title: 'DNS Manager', description: "Configure and manage your domain's DNS settings for seamless connectivity." },
  { id: 'turbo', icon: <TurboIcon />, iconBgClass: 'bg-yellow-100', title: 'TurboHub', description: 'Easily access and manage your high-performance hosting tools in TurboHub.' },
  { id: 'profile', icon: <ProfileIcon />, iconBgClass: 'bg-gray-200', title: 'Profile', description: 'Manage your account details, security settings, and preferences in one place.' },
  { id: 'support', icon: <SupportIcon />, iconBgClass: 'bg-green-100', title: 'Support', description: 'Get help with your services, access support resources, or contact our team.' },
];

const AdditionalCardsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6"> {/* Original had auto-fit, simpler for example */}
      {featureCardsData.map(card => (
        <FeatureCard 
          key={card.id}
          icon={card.icon}
          iconBgClass={card.iconBgClass}
          title={card.title}
          description={card.description}
        />
      ))}
    </div>
  );
};

export default AdditionalCardsGrid;