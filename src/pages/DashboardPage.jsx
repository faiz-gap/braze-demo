import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../App'; // Assuming App.jsx is in src/
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import PromoCardGrid from '../components/dashboard/PromoCardGrid';
import ProductListingSection from '../components/dashboard/ProductListing/ProductListingSection';
import AdditionalCardsGrid from '../components/dashboard/AdditionalCardsGrid';
import ChatButton from '../components/dashboard/ChatButton';
import NotificationOptInPopup from '../components/dashboard/NotificationOptInPopup';
import BrazeService from '../services/braze-service'; // Ensure path is correct

// Default data from original dashboard.html (or fetch from an API)
const defaultPromoCardsData = [
    { id: 'default-email-hosting', imageUrl: '/images/email-office.png', title: 'Professional Email Hosting', description: 'Boost your brand with secure, custom email addresses.', currentPrice: '$5.99/mo', originalPrice: '$9.99/mo', ctaText: 'Explore Email Plans', ctaUrl: '#email-plans' },
    { id: 'default-ssl-certs', imageUrl: '/images/ssl-placeholder.png', title: 'SSL Certificates', description: 'Secure your website and build visitor trust.', currentPrice: '$49.99/yr', originalPrice: '$79.99/yr', ctaText: 'Get SSL Security', ctaUrl: '#ssl-certificates' },
    { id: 'default-ai-builder', imageUrl: '/images/ai-website-builder.png', title: 'AI Website Builder', description: 'Launch a stunning website in minutes, no coding needed.', currentPrice: 'Free Plan Available', ctaText: 'Build Your Site', ctaUrl: '#ai-website-builder' }
];

// Configuration for your promo card slots
const promoCardSlotConfigs = [
    { slotTargetKey: 'before-products-promo-col-1', defaultCard: defaultPromoCardsData[0], htmlElementId: 'braze-slot-before-products-promo-col-1' },
    { slotTargetKey: 'before-products-promo-col-2', defaultCard: defaultPromoCardsData[1], htmlElementId: 'braze-slot-before-products-promo-col-2' },
    { slotTargetKey: 'before-products-promo-col-3', defaultCard: defaultPromoCardsData[2], htmlElementId: 'braze-slot-before-products-promo-col-3' },
    // Add more slot configs here if needed, e.g., for 'braze-slot-after-products'
    // { slotTargetKey: 'after-products', defaultCard: null, htmlElementId: 'braze-slot-after-products'}
];

const DashboardPage = () => {
  const { logout } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({ name: 'User', initials: 'XX', email: '' });
  const [brazeInitialized, setBrazeInitialized] = useState(BrazeService.isInitialized); // Check initial state
  const [allBrazeCards, setAllBrazeCards] = useState([]);
  const [isNotificationPopupVisible, setIsNotificationPopupVisible] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const updateBellIconDotState = useCallback(() => {
    const optInStatus = localStorage.getItem('notification_opt_in_status');
    setHasUnreadNotification(optInStatus !== 'subscribed');
  }, []);


  const checkAndShowNotificationPopup = useCallback((isBellClick = false) => {
    const optInStatus = localStorage.getItem('notification_opt_in_status');
    if (optInStatus === 'subscribed') {
      setIsNotificationPopupVisible(false);
      updateBellIconDotState();
      return;
    }

    if (!isBellClick) {
      const dismissedTimestamp = localStorage.getItem('notification_opt_in_dismissed_timestamp');
      const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
      if (dismissedTimestamp && (Date.now() - parseInt(dismissedTimestamp) < sevenDaysInMillis)) {
        setIsNotificationPopupVisible(false); // Don't show automatically if recently dismissed
        updateBellIconDotState();
        return;
      }
    }
    // If it's a bell click OR not recently dismissed, show it
    setIsNotificationPopupVisible(true);
    updateBellIconDotState();
  }, [updateBellIconDotState]);

  useEffect(() => {
    const uEmail = localStorage.getItem('userEmail') || '';
    const uFirstName = localStorage.getItem('userFirstName');
    const uLastName = localStorage.getItem('userLastName');
    let name = "User";
    let initials = "XX";

    if (uFirstName) {
      name = uFirstName;
      initials = uFirstName.substring(0, 1).toUpperCase();
      if (uLastName) initials += uLastName.substring(0, 1).toUpperCase();
      else if (uFirstName.length > 1) initials = uFirstName.substring(0, 2).toUpperCase();
    } else if (uEmail) {
      name = uEmail.split('@')[0];
      if (name.length > 1) initials = name.substring(0, 2).toUpperCase();
      else if (name.length === 1) initials = name.substring(0, 1).toUpperCase();
    }
    setUserInfo({ name, initials, email: uEmail });

    const initBrazeAndContent = async () => {
      let currentBrazeInitialized = BrazeService.isInitialized;
      if (!currentBrazeInitialized) {
        console.log("Dashboard: Attempting to initialize BrazeService...");
        try {
          const success = await BrazeService.initialize();
          setBrazeInitialized(success); // Update state after initialization attempt
          currentBrazeInitialized = success; // Use the result for immediate logic
          if (!success) console.warn("Dashboard: BrazeService initialization failed.");
        } catch (error) {
          console.error("Dashboard: Error during BrazeService.initialize()", error);
          setBrazeInitialized(false);
          currentBrazeInitialized = false;
        }
      } else {
         setBrazeInitialized(true); // Already initialized, ensure state reflects this
      }

      // This block runs after Braze initialization attempt
      if (currentBrazeInitialized) {
        const actorId = localStorage.getItem('actor_id') || uEmail;
        if (actorId) {
          const brazeUserAttributes = { email: uEmail };
          if (uFirstName) brazeUserAttributes.firstName = uFirstName;
          if (uLastName) brazeUserAttributes.lastName = uLastName;
          Object.keys(brazeUserAttributes).forEach(key => (brazeUserAttributes[key] == null) && delete brazeUserAttributes[key]);
          
          BrazeService.changeUser(actorId, brazeUserAttributes);
          console.log(`Dashboard: Braze user changed to: ${actorId}`);

          window.braze.subscribeToContentCardsUpdates(function(contentCardsObject) {
            console.log("Dashboard: Braze Content Cards Update Received", JSON.parse(JSON.stringify(contentCardsObject)));
            setAllBrazeCards(contentCardsObject.cards || []);
          });
          window.braze.requestContentCardsRefresh();
          console.log("Dashboard: Requested Braze Content Cards refresh.");
        } else {
          console.warn("Dashboard: No actorId or userEmail for Braze. Content cards may be anonymous.");
           window.braze.requestContentCardsRefresh(); // Still request for anonymous user
        }
      }
      // Show popup after Braze setup attempt, regardless of success, using initial state
      if (document.readyState === 'complete') {
         checkAndShowNotificationPopup(false);
      } else {
        window.addEventListener('load', () => checkAndShowNotificationPopup(false), { once: true });
      }
    };
    
    initBrazeAndContent();
    updateBellIconDotState();

    // Cleanup event listener if component unmounts before load
    return () => {
      window.removeEventListener('load', () => checkAndShowNotificationPopup(false));
    };

  }, [checkAndShowNotificationPopup, updateBellIconDotState]);


  const handleNotificationOptInResponse = (subscribed) => {
    const actorId = localStorage.getItem('actor_id') || userInfo.email;
    if (BrazeService.isInitialized && actorId) {
      if (subscribed) {
        BrazeService.logCustomEvent('notification_subscribed');
        BrazeService.changeUser(actorId, { marketing_notifications_opt_in: true });
        localStorage.setItem('notification_opt_in_status', 'subscribed');
      } else {
        BrazeService.logCustomEvent('notification_opt_in_dismissed');
        localStorage.setItem('notification_opt_in_dismissed_timestamp', Date.now().toString());
      }
    } else { // Fallback if Braze fails or no actorId
        if (subscribed) localStorage.setItem('notification_opt_in_status', 'subscribed');
        else localStorage.setItem('notification_opt_in_dismissed_timestamp', Date.now().toString());
        console.warn("Dashboard: Braze not initialized or no actor ID for notification opt-in logging. Stored preference locally.");
    }
    setIsNotificationPopupVisible(false);
    updateBellIconDotState();
  };
  
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-light">
      <Header
        userInitials={userInfo.initials}
        onLogout={logout}
        onBellClick={() => {
            if (isNotificationPopupVisible) setIsNotificationPopupVisible(false); // Toggle if already visible
            else checkAndShowNotificationPopup(true);
        }}
        hasUnreadNotification={hasUnreadNotification}
        onToggleMobileSidebar={toggleMobileSidebar}
      />
      <div className="flex flex-1 pt-[60px] md:pt-0"> {/* Header is fixed, so content starts below it */}
        <Sidebar isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar}/>
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${isMobileSidebarOpen ? 'md:ml-0' : 'md:ml-0'} md:pt-[60px]`}> {/* md:ml-72 if sidebar is not overlay on md */}
          {/* Notification Popup - ensure it's placed appropriately for z-index */}
          <NotificationOptInPopup
            isVisible={isNotificationPopupVisible}
            onClose={() => handleNotificationOptInResponse(false)} // Dismiss on close button
            onSignUp={() => handleNotificationOptInResponse(true)}
            onAskLater={() => handleNotificationOptInResponse(false)} // Dismiss on ask later
          />
          <WelcomeBanner userName={userInfo.name} userInitials={userInfo.initials} />
          
          <PromoCardGrid
            slotConfigs={promoCardSlotConfigs}
            brazeCards={allBrazeCards}
            brazeInitialized={brazeInitialized}
          />
          
          <ProductListingSection />
          
          {/* Example for a single slot after products, can be managed by PromoCardSlot directly or via PromoCardGrid */}
          <div className="my-8">
            <PromoCardSlot
                key="after-products-slot"
                slotTargetKey="after-products" // Make sure this matches Braze campaign 'slot_target'
                defaultCardData={null} // Or provide a default if you have one
                brazeCards={allBrazeCards}
                brazeInitialized={brazeInitialized}
                htmlElementId="braze-slot-after-products"
            />
          </div>

          <AdditionalCardsGrid />
        </main>
      </div>
      <ChatButton />
    </div>
  );
};

export default DashboardPage;