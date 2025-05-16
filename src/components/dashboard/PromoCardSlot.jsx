// src/components/dashboard/PromoCardSlot.jsx
import React, { useState, useEffect, useRef } from 'react';
import PromoCard from './PromoCard';
import SkeletonCard from './SkeletonCard';
import BrazeService from '../../services/braze-service';

const BRAZE_DATA_TIMEOUT_MS = 3000;

const PromoCardSlot = ({ slotTargetKey, defaultCardData, brazeCards, brazeInitialized, htmlElementId }) => {
  const [status, setStatus] = useState('loading');
  const [cardData, setCardData] = useState(null);
  const dataFetchTimeoutRef = useRef(null);
  const hasLoggedImpressionRef = useRef(false);

  useEffect(() => {
    setStatus('loading'); // Always start as loading
    setCardData(null);
    hasLoggedImpressionRef.current = false;

    if (dataFetchTimeoutRef.current) clearTimeout(dataFetchTimeoutRef.current);

    if (!brazeInitialized) {
      console.log(`Slot ${slotTargetKey} (${htmlElementId}): Braze not initialized. Setting to default/empty after a brief loading state for skeleton.`);
      // Minimal delay to ensure 'loading' status is rendered once before switching
      // This helps if the skeleton itself needs a frame to appear correctly,
      // otherwise, if state changes too fast, it might not render.
      const timer = setTimeout(() => {
        setCardData(defaultCardData);
        setStatus(defaultCardData ? 'default' : 'empty');
      }, 50); // A very short delay
      return () => clearTimeout(timer);
    }

    console.log(`Slot ${slotTargetKey} (${htmlElementId}): Braze IS initialized. Looking for card.`);
    const cardFromProps = (brazeCards || []).find(
      bc => bc.extras?.slot_target === slotTargetKey
    );

    if (cardFromProps) {
      console.log(`Slot ${slotTargetKey} (${htmlElementId}): Found Braze card ID: ${cardFromProps.id} from props.`);
      setCardData(cardFromProps);
      setStatus('braze');
    } else {
      console.log(`Slot ${slotTargetKey} (${htmlElementId}): No Braze card in props. Starting ${BRAZE_DATA_TIMEOUT_MS}ms timeout to check cache.`);
      // setStatus('loading'); // Already loading from start of effect
      dataFetchTimeoutRef.current = setTimeout(() => {
        console.log(`Slot ${slotTargetKey} (${htmlElementId}): Timeout reached. Checking Braze cache.`);
        const cachedCards = BrazeService.getCachedContentCards();
        const cardFromCache = (cachedCards.cards || []).find(bc => bc.extras?.slot_target === slotTargetKey);

        if (cardFromCache) {
            console.log(`Slot ${slotTargetKey} (${htmlElementId}): Braze card ID: ${cardFromCache.id} found in cache.`);
            setCardData(cardFromCache);
            setStatus('braze');
        } else {
            console.log(`Slot ${slotTargetKey} (${htmlElementId}): No Braze card in cache. Using default card.`);
            setCardData(defaultCardData);
            setStatus(defaultCardData ? 'default' : 'empty');
        }
      }, BRAZE_DATA_TIMEOUT_MS);
    }
    
    return () => {
        if (dataFetchTimeoutRef.current) clearTimeout(dataFetchTimeoutRef.current);
    };

  }, [slotTargetKey, defaultCardData, brazeCards, brazeInitialized, htmlElementId]);

  useEffect(() => {
    if (status === 'braze' && cardData && !hasLoggedImpressionRef.current) {
      BrazeService.logContentCardImpression(cardData);
      hasLoggedImpressionRef.current = true;
    }
  }, [status, cardData]);

  let slotClass = 'braze-content-card-slot';
  // If loading, or populated with Braze/default card, treat as "populated" to remove default styles
  if (status === 'loading' || (status === 'braze' && cardData) || (status === 'default' && cardData)) {
    slotClass += ' populated'; // Use 'populated' to get the clean slate style for the wrapper
  }
  // If it's truly empty (no default card and Braze failed or had no card), it will use the default .braze-content-card-slot styles.
  // Or, if you never want the dotted border even for an empty slot after loading:
  // if (status !== 'empty-and-show-dotted-border') { // hypothetical state
  //   slotClass += ' populated';
  // }


  return (
    // The `htmlElementId` is for Braze to target, the styling is handled by slotClass
    <div id={htmlElementId} className={slotClass}>
      {status === 'loading' && <SkeletonCard />}
      {status === 'braze' && cardData && <PromoCard card={cardData} isBrazeSourced={true} />}
      {status === 'default' && cardData && <PromoCard card={cardData} isBrazeSourced={false} />}
      
      {/* Fallback for when no card is available AND status is 'empty' 
          This part ensures the slot doesn't collapse if it's truly empty after all checks.
          The SkeletonCard and PromoCard define their own heights.
          If this slot is truly empty (no default, no Braze card), and you don't want the dotted border,
          the slotClass logic above should already handle it by applying 'populated'.
          If you *do* want a specific empty state different from Skeleton/PromoCard:
      */}
      {status === 'empty' && (
        <div className="flex items-center justify-center h-[420px] w-full text-sm text-gray-400 p-4 rounded-xl bg-gray-50">
           {/* This could be an alternative placeholder if you want it different from the dotted one */}
           {/* e.g., "No promotion available." */}
        </div>
      )}
    </div>
  );
};

export default PromoCardSlot;