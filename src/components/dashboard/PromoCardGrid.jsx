// src/components/dashboard/PromoCardGrid.jsx
import React from 'react';
import PromoCardSlot from './PromoCardSlot';

const PromoCardGrid = ({ slotConfigs, brazeCards, brazeInitialized }) => {
  if (!slotConfigs || slotConfigs.length === 0) {
    return <div className="promo-cards-grid">No promo slots configured.</div>;
  }

  return (
    // Reduced margin-bottom from mb-10 to mb-3 for a very tight spacing
    <div className="promo-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0 items-stretch">
      {slotConfigs.map(config => (
        <PromoCardSlot
          key={config.slotTargetKey || config.htmlElementId}
          slotTargetKey={config.slotTargetKey}
          defaultCardData={config.defaultCard}
          brazeCards={brazeCards}
          brazeInitialized={brazeInitialized}
          htmlElementId={config.htmlElementId}
        />
      ))}
    </div>
  );
};
export default PromoCardGrid;