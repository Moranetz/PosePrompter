import React, { useRef, useEffect } from 'react';
import WordButton from './WordButton';

const WordButtonBar = ({ 
  category, 
  options, 
  currentIndex, 
  categoryColor, 
  isIncluded,
  onSelect,
  categoryDisplayName,
  favorites,
  onToggleFavorite,
  isLoggedIn
}) => {
  const scrollContainerRef = useRef(null);
  const selectedButtonRef = useRef(null);

  // Scroll to selected button when category changes
  useEffect(() => {
    if (selectedButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = selectedButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      const scrollLeft = buttonRect.left - containerRect.left + container.scrollLeft - (containerRect.width / 2) + (buttonRect.width / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, category]);

  const getButtonText = (option, index) => {
    if (typeof option === 'string') {
      // Truncate long strings
      return option.length > 30 ? option.substring(0, 30) + '...' : option;
    }
    return option.title || `Option ${index + 1}`;
  };

  return (
    <div
      className="word-button-bar"
      style={{
        background: 'rgba(18, 18, 26, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '14px 18px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Category Label */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: isIncluded ? 1 : 0.4
          }}
        >
          {categoryDisplayName}
        </div>

        {/* Scrollable Button Container */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x proximity',
            scrollPadding: '0 24px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: `${categoryColor}40 transparent`,
            paddingBottom: '4px'
          }}
        >
          {options.map((option, index) => {
            const isSelected = index === currentIndex;
            const buttonText = getButtonText(option, index);
            
            return (
              <div
                key={index}
                ref={isSelected ? selectedButtonRef : null}
                style={{
                  scrollSnapAlign: 'start',
                  flexShrink: 0
                }}
              >
                <WordButton
                  text={buttonText}
                  categoryColor={categoryColor}
                  isSelected={isSelected}
                  isDisabled={!isIncluded}
                  onClick={() => onSelect(index)}
                  index={index}
                  packageName={option.packageName}
                  packageId={option.packageId}
                  isFavorite={favorites?.[category]?.includes(option.id || index)}
                  onToggleFavorite={() => onToggleFavorite?.(category, option.id || index)}
                  showFavoriteButton={isLoggedIn}
                />
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar {
          height: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
};

export default WordButtonBar;

