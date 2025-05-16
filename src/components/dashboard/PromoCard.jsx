// src/components/dashboard/PromoCard.jsx
import React from 'react';
import BrazeService from '../../services/braze-service'; // Verify path

const ArrowRightIcon = () => (
  <svg className="w-4 h-4 ml-2 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 16 16">
    <path d="M1 8h12M9 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
); // <--- Added closing parenthesis here

const PromoCard = ({ card, isBrazeSourced }) => {
  const id = isBrazeSourced ? card.id : (card.id || `default-card-${Math.random().toString(36).substr(2, 9)}`);
  const imageUrl = isBrazeSourced ? (card.extras?.image_url || card.imageUrl || 'https://via.placeholder.com/400x225.png/CCCCCC/FFFFFF?Text=Service') : card.imageUrl;
  const title = isBrazeSourced ? (card.extras?.title_text || card.title || 'Exciting Offer') : card.title;
  const description = isBrazeSourced ? (card.extras?.description_text || card.description || 'Learn more about this great service.') : card.description;
  const currentPrice = isBrazeSourced ? card.extras?.current_price : card.currentPrice;
  const originalPrice = isBrazeSourced ? card.extras?.original_price : card.originalPrice;
  const ctaText = isBrazeSourced ? (card.extras?.cta_text || card.linkText || 'Learn More') : card.ctaText;
  const ctaUrl = isBrazeSourced ? (card.url || '#') : (card.ctaUrl || '#');
  const openInNewTab = isBrazeSourced ? card.openUrlInNewTab : false;


  const handleCtaClick = (e) => {
    if (isBrazeSourced && card) {
        BrazeService.logContentCardClick(card); 
    }
    if (ctaUrl === '#' || !ctaUrl) {
      e.preventDefault();
    }
  };

  // Consistent fixed height for the card
  const cardHeight = "h-[420px]"; // SAME AS SKELETON
  // Proportions for image and content areas
  const imageHeightProportion = "h-[40%]"; // SAME AS SKELETON
  const contentHeightProportion = "h-[60%]"; // SAME AS SKELETON

  return (
    <div
      id={id}
      className={`bg-white rounded-xl shadow-card overflow-hidden flex flex-col ${cardHeight} w-full transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-card-hover`}
    >
      {/* Image container: Fixed proportion of card height */}
      <div className={`${imageHeightProportion} w-full relative bg-gray-100 overflow-hidden rounded-t-xl`}>
        <img 
            src={imageUrl} 
            alt={title} 
            className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>

      {/* Content container: Fixed proportion, flex column for internal alignment */}
      <div className={`${contentHeightProportion} p-5 flex flex-col`}>
        <h3 className="text-lg font-semibold text-brand-gray-text mb-2 leading-tight line-clamp-2">
            {title}
        </h3>
        
        <p className="text-sm text-brand-gray-textMedium leading-relaxed mb-3 flex-grow line-clamp-3 md:line-clamp-4 overflow-hidden"> 
            {description}
        </p>
        
        {(currentPrice || originalPrice) && (
          <div className="mb-3 leading-none">
            {currentPrice && <span className="text-lg font-bold text-brand-green mr-2">{currentPrice}</span>}
            {originalPrice && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>}
          </div>
        )}

        <a
          href={ctaUrl || '#'}
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : ''}
          onClick={handleCtaClick}
          className="mt-auto inline-flex items-center text-brand-green font-semibold text-[15px] transition-colors hover:text-brand-lime-hover group"
        >
          {ctaText}
          <ArrowRightIcon />
        </a>
      </div>
    </div>
  );
};

export default PromoCard;