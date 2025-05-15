import React from 'react';
import PromoCardSlot from './PromoCardSlot';

const PromoCardGrid = ({ slotConfigs, brazeCards, brazeInitialized }) => {
  if (!slotConfigs || slotConfigs.length === 0) {
    return <div className="promo-cards-grid">No promo slots configured.</div>;
  }

  return (
    <div className="promo-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
      {slotConfigs.map(config => (
        <PromoCardSlot
          key={config.slotTargetKey || config.htmlElementId} // Use a unique key
          slotTargetKey={config.slotTargetKey}
          defaultCardData={config.defaultCard}
          brazeCards={brazeCards}
          brazeInitialized={brazeInitialized}
          htmlElementId={config.htmlElementId} // Pass this down
        />
      ))}
    </div>
  );
};
export default PromoCardGrid;