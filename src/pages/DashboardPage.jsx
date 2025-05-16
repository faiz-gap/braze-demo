import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react'; // Added useMemo
import { AuthContext } from '../App';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import PromoCardGrid from '../components/dashboard/PromoCardGrid';
import PromoCardSlot from '../components/dashboard/PromoCardSlot';
import ProductListingSection from '../components/dashboard/ProductListing/ProductListingSection';
import AdditionalCardsGrid from '../components/dashboard/AdditionalCardsGrid';
import ChatButton from '../components/dashboard/ChatButton';
import BrazeService from '../services/braze-service';

const defaultPromoCardsData = [
    { id: 'default-email-hosting', imageUrl: '/images/email-office.png', title: 'Professional Email Hosting', description: 'Boost your brand with secure, custom email addresses.', currentPrice: '$5.99/mo', originalPrice: '$9.99/mo', ctaText: 'Explore Email Plans', ctaUrl: '#email-plans' },
    { id: 'default-ssl-certs', imageUrl: '/images/ssl-placeholder.png', title: 'SSL Certificates', description: 'Secure your website and build visitor trust.', currentPrice: '$49.99/yr', originalPrice: '$79.99/yr', ctaText: 'Get SSL Security', ctaUrl: '#ssl-certificates' },
    { id: 'default-ai-builder', imageUrl: '/images/ai-website-builder.png', title: 'AI Website Builder', description: 'Launch a stunning website in minutes, no coding needed.', currentPrice: 'Free Plan Available', ctaText: 'Build Your Site', ctaUrl: '#ai-website-builder' }
];

// MODIFIED: Only 3 configs for the main grid
const threePromoCardSlotConfigs = [
    { slotTargetKey: 'before-products-promo-col-1', defaultCard: defaultPromoCardsData[0], htmlElementId: 'braze-slot-before-products-promo-col-1' },
    { slotTargetKey: 'before-products-promo-col-2', defaultCard: defaultPromoCardsData[1], htmlElementId: 'braze-slot-before-products-promo-col-2' },
    { slotTargetKey: 'before-products-promo-col-3', defaultCard: defaultPromoCardsData[2], htmlElementId: 'braze-slot-before-products-promo-col-3' },
];

const DashboardPage = () => {
  const { logout } = useContext(AuthContext);
  // Use useMemo for localStorage derived values if they are in useEffect deps and don't change often
  const uEmail = useMemo(() => localStorage.getItem('userEmail') || '', []);
  const uFirstName = useMemo(() => localStorage.getItem('userFirstName'), []);
  const uLastName = useMemo(() => localStorage.getItem('userLastName'), []);

  const [userInfo, setUserInfo] = useState({ name: 'User', initials: 'XX', email: '' });
  const [brazeInitialized, setBrazeInitialized] = useState(BrazeService.isInitialized);
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
        setIsNotificationPopupVisible(false);
        updateBellIconDotState();
        return;
      }
    }
    setIsNotificationPopupVisible(true);
    updateBellIconDotState();
  }, [updateBellIconDotState]);

  useEffect(() => {
    let name = "User";
    let initials = "XX";

    if (uFirstName) {
      name = uFirstName;
      initials = uFirstName.substring(0, 1).toUpperCase();
      if (uLastName) initials += uLastName.substring(0, 1).toUpperCase();
      else if (uFirstName.length > 1) initials = uFirstName.substring(0, 2).toUpperCase();
    } else if (uEmail) {
      name = uEmail.split('@')[0];
      if (name && name.length > 1) initials = name.substring(0, 2).toUpperCase();
      else if (name && name.length === 1) initials = name.substring(0, 1).toUpperCase();
    }
    setUserInfo({ name, initials, email: uEmail });

    const initBrazeAndContent = async () => {
        let currentBrazeInitialized = BrazeService.isInitialized;
        if (!currentBrazeInitialized) {
            console.log("Dashboard: Attempting to initialize BrazeService (NPM package)...");
            try {
                const success = await BrazeService.initialize();
                setBrazeInitialized(success);
                currentBrazeInitialized = success;
                if (!success) console.warn("Dashboard: BrazeService initialization failed (NPM package).");
            } catch (error) {
                console.error("Dashboard: Error during BrazeService.initialize() (NPM package)", error);
                setBrazeInitialized(false);
                currentBrazeInitialized = false;
            }
        } else {
            setBrazeInitialized(true);
        }

        if (currentBrazeInitialized) {
            const actorId = localStorage.getItem('actor_id') || uEmail; // Use uEmail from useMemo
            if (actorId) {
                const brazeUserAttributes = { email: uEmail }; // Use uEmail from useMemo
                if (uFirstName) brazeUserAttributes.firstName = uFirstName; // Use uFirstName from useMemo
                if (uLastName) brazeUserAttributes.lastName = uLastName;   // Use uLastName from useMemo
                Object.keys(brazeUserAttributes).forEach(key => (brazeUserAttributes[key] == null) && delete brazeUserAttributes[key]);
                
                BrazeService.changeUser(actorId, brazeUserAttributes);
                console.log(`Dashboard: Braze user changed to: ${actorId}`);

                const unsubscribe = BrazeService.subscribeToContentCardsUpdates(function(contentCardsObject) {
                    console.log("Dashboard: Braze Content Cards Update Received", contentCardsObject.cards ? JSON.parse(JSON.stringify(contentCardsObject.cards)) : "No cards");
                    setAllBrazeCards(contentCardsObject.cards || []);
                });
                BrazeService.requestContentCardsRefresh();
                console.log("Dashboard: Requested Braze Content Cards refresh.");
                return () => {
                    if (typeof unsubscribe === 'function') {
                        unsubscribe();
                        console.log("Dashboard: Unsubscribed from Content Cards updates.");
                    }
                };
            } else {
                console.warn("Dashboard: No actorId or userEmail for Braze. Content cards may be anonymous.");
                BrazeService.requestContentCardsRefresh();
            }
        } else {
             console.log("Dashboard: Braze not initialized, skipping user change and content card subscription.");
        }
    };
    
    let cleanupFunction = () => {};
    initBrazeAndContent().then(returnedCleanup => {
        if (typeof returnedCleanup === 'function') {
            cleanupFunction = returnedCleanup;
        }
    });
    updateBellIconDotState();

    if (document.readyState === 'complete') {
        checkAndShowNotificationPopup(false);
    } else {
        window.addEventListener('load', () => checkAndShowNotificationPopup(false), { once: true });
    }

    return () => {
        cleanupFunction();
        window.removeEventListener('load', () => checkAndShowNotificationPopup(false));
    };

  }, [checkAndShowNotificationPopup, updateBellIconDotState, uEmail, uFirstName, uLastName ]);


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
    } else {
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
            if (isNotificationPopupVisible) setIsNotificationPopupVisible(false);
            else checkAndShowNotificationPopup(true);
        }}
        hasUnreadNotification={hasUnreadNotification}
        onToggleMobileSidebar={toggleMobileSidebar}
        isNotificationPopupVisible={isNotificationPopupVisible}
        onNotificationClose={() => handleNotificationOptInResponse(false)}
        onNotificationSignUp={() => handleNotificationOptInResponse(true)}
        onNotificationAskLater={() => handleNotificationOptInResponse(false)}
      />
      <div className="flex flex-1 pt-[60px]">
        <Sidebar isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar}/>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <WelcomeBanner userName={userInfo.name} userInitials={userInfo.initials} />
          
          <PromoCardGrid
            slotConfigs={threePromoCardSlotConfigs} // MODIFIED
            brazeCards={allBrazeCards}
            brazeInitialized={brazeInitialized}
          />
          
          <ProductListingSection />
          
          <div className="my-8">
            <PromoCardSlot
                key="after-products-slot"
                slotTargetKey="after-products" // This key needs to be configured in Braze if you want a card here
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