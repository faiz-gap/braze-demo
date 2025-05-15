import React, { useState, useEffect, useRef } from 'react';
import PromoCard from './PromoCard';
import SkeletonCard from './SkeletonCard';
import BrazeService from '../../services/braze-service'; // Assuming BrazeService is correctly set up

const BRAZE_DATA_TIMEOUT_MS = 3000; // Wait 3 seconds for Braze

const PromoCardSlot = ({ slotTargetKey, defaultCardData, brazeCards, brazeInitialized, htmlElementId }) => {
  const [status, setStatus] = useState('loading'); // 'loading', 'braze', 'default', 'empty'
  const [cardData, setCardData] = useState(null);
  const timeoutRef = useRef(null);
  const hasLoggedImpressionRef = useRef(false);

  useEffect(() => {
    setStatus('loading'); // Reset on prop changes
    setCardData(null);
    hasLoggedImpressionRef.current = false; // Reset impression log status
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!brazeInitialized) {
      // If Braze isn't initialized, use default data immediately.
      console.log(`Slot ${slotTargetKey} (${htmlElementId}): Braze not initialized. Falling back to default.`);
      setCardData(defaultCardData);
      setStatus(defaultCardData ? 'default' : 'empty');
      return;
    }

    // Braze is initialized (or initialization was attempted)
    const brazeCardForThisSlot = (brazeCards || []).find(
      bc => bc.extras?.slot_target === slotTargetKey
    );

    if (brazeCardForThisSlot) {
      console.log(`Slot ${slotTargetKey} (${htmlElementId}): Found Braze card ID: ${brazeCardForThisSlot.id}`);
      setCardData(brazeCardForThisSlot);
      setStatus('braze');
    } else {
      // No immediate Braze card from the passed 'brazeCards' prop, set timeout for default
      // This happens if brazeCards is initially empty or doesn't contain the card for this slot
      console.log(`Slot ${slotTargetKey} (${htmlElementId}): No Braze card in current props. Starting timeout for default.`);
      timeoutRef.current = setTimeout(() => {
        // After timeout, check *again* if a Braze card became available (e.g., from a fresh fetch)
        // This relies on braze.getCachedContentCards being up-to-date if an update happened.
        const latestBrazeCards = BrazeService.isInitialized && window.braze && typeof window.braze.getCachedContentCards === 'function'
                                ? window.braze.getCachedContentCards().cards || []
                                : [];
        const currentBrazeCard = latestBrazeCards.find(bc => bc.extras?.slot_target === slotTargetKey);

        if (currentBrazeCard) {
            console.log(`Slot ${slotTargetKey} (${htmlElementId}): Braze card arrived during/after timeout. Using Braze card ID: ${currentBrazeCard.id}`);
            setCardData(currentBrazeCard);
            setStatus('braze');
        } else {
            console.log(`Slot ${slotTargetKey} (${htmlElementId}): Timeout reached. No Braze card. Using default card.`);
            setCardData(defaultCardData);
            setStatus(defaultCardData ? 'default' : 'empty');
        }
      }, BRAZE_DATA_TIMEOUT_MS);
    }
    
    return () => { // Cleanup
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

  }, [slotTargetKey, defaultCardData, brazeCards, brazeInitialized, htmlElementId]);

  // Effect for logging impression when Braze card is shown
  useEffect(() => {
    if (status === 'braze' && cardData && !hasLoggedImpressionRef.current) {
      if (window.braze && typeof window.braze.logContentCardImpression === 'function') {
        window.braze.logContentCardImpression(cardData); // Pass the actual card object
        console.log(`Logged impression for Braze card ${cardData.id} in slot ${slotTargetKey}`);
        hasLoggedImpressionRef.current = true;
      }
    }
  }, [status, cardData, slotTargetKey]);


  let slotClass = 'braze-content-card-slot';
  if (status === 'braze') slotClass += ' populated';
  else if (status === 'default') slotClass += ' default-populated';

  return (
    <div id={htmlElementId} className={slotClass}>
      {status === 'loading' && <SkeletonCard />}
      {status === 'braze' && cardData && <PromoCard card={cardData} isBrazeSourced={true} />}
      {status === 'default' && cardData && <PromoCard card={cardData} isBrazeSourced={false} />}
      {status === 'empty' && (
        <div className="flex items-center justify-center h-full text-sm text-gray-400">
          {/* Optional: "No promotion available." */}
        </div>
      )}
    </div>
  );
};

export default PromoCardSlot;