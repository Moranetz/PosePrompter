import React, { useRef, useEffect, useLayoutEffect } from 'react';
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
  const savedScrollPositionRef = useRef(null);
  const previousIndexRef = useRef(currentIndex);
  const previousCategoryRef = useRef(category);
  const previousFavoritesRef = useRef(JSON.stringify(favorites));
  const scrollBlockedRef = useRef(false);
  const isRestoringRef = useRef(false);

  // Wrap onToggleFavorite to preserve scroll position
  const handleToggleFavorite = (category, optionId) => {
    // Save current scroll position before state update
    if (scrollContainerRef.current) {
      const currentScroll = scrollContainerRef.current.scrollLeft;
      // Save the current scroll position
      // Note: We save even if it's 0, because the user might be at the beginning
      savedScrollPositionRef.current = currentScroll;
      scrollBlockedRef.current = true; // Block scroll-to-selected
      isRestoringRef.current = true; // Mark that we're restoring
      
      // Immediately prevent any scroll changes
      const container = scrollContainerRef.current;
      const savedPos = currentScroll;
      
      // Use requestAnimationFrame to restore immediately after any potential reset
      requestAnimationFrame(() => {
        if (container && savedScrollPositionRef.current === savedPos) {
          container.scrollLeft = savedPos;
        }
      });
    }
    
    // Call the original handler
    onToggleFavorite?.(category, optionId);
  };


  // Check if favorites changed (this indicates a favorite update, not a selection change)
  const favoritesChanged = JSON.stringify(favorites) !== previousFavoritesRef.current;
  
  // Restore scroll position when favorites change (but not selection)
  useLayoutEffect(() => {
    if (favoritesChanged && scrollContainerRef.current && savedScrollPositionRef.current !== null && isRestoringRef.current) {
      const container = scrollContainerRef.current;
      const savedPosition = savedScrollPositionRef.current;
      
      // Restore immediately (synchronous, before paint)
      container.scrollLeft = savedPosition;
      
      // Restore multiple times to catch any resets
      const restoreScroll = () => {
        if (container && savedScrollPositionRef.current !== null) {
          container.scrollLeft = savedScrollPositionRef.current;
        }
      };
      
      // Restore after microtask
      Promise.resolve().then(restoreScroll);
      
      // Restore after animation frames
      requestAnimationFrame(() => {
        restoreScroll();
        requestAnimationFrame(restoreScroll);
      });
      
      // Continuously restore scroll position while blocked (but less aggressively)
      const restoreInterval = setInterval(() => {
        if (scrollBlockedRef.current && container && savedScrollPositionRef.current !== null) {
          const currentScroll = container.scrollLeft;
          const savedPosition = savedScrollPositionRef.current;
          // Only restore if significantly different (more than 5px)
          if (Math.abs(currentScroll - savedPosition) > 5) {
            container.scrollLeft = savedPosition;
          }
        }
      }, 50); // Check every 50ms
      
      // Keep blocking scroll-to-selected for a bit
      const timeoutId = setTimeout(() => {
        clearInterval(restoreInterval);
        scrollBlockedRef.current = false;
        isRestoringRef.current = false;
        savedScrollPositionRef.current = null;
      }, 800);
      
      previousFavoritesRef.current = JSON.stringify(favorites);
      
      return () => {
        clearTimeout(timeoutId);
        clearInterval(restoreInterval);
      };
    } else if (!favoritesChanged) {
      // Favorites didn't change, so this might be a selection change
      previousFavoritesRef.current = JSON.stringify(favorites);
      isRestoringRef.current = false;
    }
  }, [favorites, favoritesChanged]);

  // Scroll to selected button when category or currentIndex changes (but NOT on favorite updates)
  useEffect(() => {
    // Block scroll-to-selected if we just updated favorites OR if favorites changed
    const favoritesJustChanged = JSON.stringify(favorites) !== previousFavoritesRef.current;
    if (scrollBlockedRef.current || favoritesJustChanged) {
      previousIndexRef.current = currentIndex;
      previousCategoryRef.current = category;
      return;
    }

    // Only scroll if index or category actually changed
    const indexChanged = previousIndexRef.current !== currentIndex;
    const categoryChanged = previousCategoryRef.current !== category;
    
    if ((indexChanged || categoryChanged) && selectedButtonRef.current && scrollContainerRef.current) {
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
    
    previousIndexRef.current = currentIndex;
    previousCategoryRef.current = category;
  }, [currentIndex, category, favorites]);

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
        background: 'rgba(15, 15, 18, 0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {/* Category Label */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: '500',
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            opacity: isIncluded ? 1 : 0.4
          }}
        >
          {categoryDisplayName}
        </div>

        {/* Scrollable Button Container */}
        <div
          ref={(el) => {
            scrollContainerRef.current = el;
            // If we're restoring and have a saved position, restore it immediately when element is set
            if (el && isRestoringRef.current && savedScrollPositionRef.current !== null) {
              el.scrollLeft = savedScrollPositionRef.current;
            }
          }}
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
            // Use a stable key based on option id if available, otherwise index
            const stableKey = option.id !== undefined ? `${category}-${option.id}` : `${category}-${index}`;
            
            return (
              <div
                key={stableKey}
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
                  onToggleFavorite={() => handleToggleFavorite(category, option.id || index)}
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

