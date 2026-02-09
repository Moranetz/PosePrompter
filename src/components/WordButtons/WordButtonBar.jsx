import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  isLoggedIn,
  onTrash
}) => {
  const scrollContainerRef = useRef(null);
  const selectedButtonRef = useRef(null);
  const savedScrollPositionRef = useRef(null);
  const previousIndexRef = useRef(currentIndex);
  const previousCategoryRef = useRef(category);
  const [trashingIndex, setTrashingIndex] = useState(null);
  const previousFavoritesRef = useRef(JSON.stringify(favorites));
  const scrollBlockedRef = useRef(false);
  const isRestoringRef = useRef(false);
  const footerHeightRef = useRef(44); // Default to CSS variable value
  const barRef = useRef(null);
  
  // Initialize shouldHide based on current body class state and route
  const [shouldHide, setShouldHide] = React.useState(() => {
    if (typeof document !== 'undefined') {
      const isModalOpen = document.body.classList.contains('buy-credits-modal-open');
      const currentRoute = window.location.hash;
      // Only show on main workspace screen (empty hash or no hash)
      const isOnMainScreen = !currentRoute || currentRoute === '' || currentRoute === '#';
      return isModalOpen || !isOnMainScreen;
    }
    return false;
  });

  // CRITICAL: Synchronous check function that can be called at any time
  // This ensures we always have the latest state without waiting for React updates
  const shouldHideBar = React.useCallback(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return true; // Hide if we can't check
    }
    const isModalOpen = document.body.classList.contains('buy-credits-modal-open');
    const currentRoute = window.location.hash;
    const isOnMainScreen = !currentRoute || currentRoute === '' || currentRoute === '#';
    return isModalOpen || !isOnMainScreen;
  }, []);

  // Check if BuyCreditsModal is open (via body class) and hide WordButtonBar
  // Also check if we're on the correct screen (main workspace only)
  // Use useLayoutEffect to check synchronously before paint to prevent flash
  useLayoutEffect(() => {
    const checkModalState = () => {
      const newShouldHide = shouldHideBar();
      setShouldHide(newShouldHide);
    };

    // Initial check immediately (synchronous)
    checkModalState();

    // Watch for body class changes with more aggressive checking
    const observer = new MutationObserver(() => {
      // Check immediately (synchronous) for class changes
      checkModalState();
      // Also check after next frame as backup
      requestAnimationFrame(checkModalState);
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false
    });

    // More frequent interval check as a fallback (every frame ~16ms for 60fps)
    // This ensures we catch any missed updates immediately
    const intervalId = setInterval(checkModalState, 16);

    // Watch for route changes
    const handleHashChange = () => {
      checkModalState();
    };
    window.addEventListener('hashchange', handleHashChange);

    // Also watch for popstate (back/forward navigation)
    window.addEventListener('popstate', handleHashChange);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [shouldHideBar]);

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

  // Measure footer height to ensure WordButtonBar never overlaps it
  useEffect(() => {
    const updateFooterHeight = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const height = footer.offsetHeight;
        if (height > 0) {
          footerHeightRef.current = height;
          // Update the WordButtonBar position
          if (barRef.current) {
            barRef.current.style.bottom = `${height}px`;
          }
        }
      }
    };

    // Initial measurement - try multiple times in case footer hasn't rendered yet
    updateFooterHeight();
    const initialTimeout = setTimeout(updateFooterHeight, 100);
    const secondTimeout = setTimeout(updateFooterHeight, 500);

    // Watch for footer size changes (e.g., responsive breakpoints)
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(updateFooterHeight);
    });
    const footer = document.querySelector('footer');
    if (footer) {
      resizeObserver.observe(footer);
    }

    // Also listen to window resize
    window.addEventListener('resize', updateFooterHeight);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(secondTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateFooterHeight);
    };
  }, []);

  const getButtonText = (option, index) => {
    if (typeof option === 'string') {
      // Truncate long strings
      return option.length > 30 ? option.substring(0, 30) + '...' : option;
    }
    return option.title || `Option ${index + 1}`;
  };

  // CRITICAL: Multiple synchronous checks before render to prevent any glitch
  // Use the synchronous check function as the primary authority - this is the most reliable check
  // It checks both modal state and route synchronously on every render
  const finalShouldHide = shouldHideBar();
  
  // Additional redundant checks for maximum safety (defense in depth)
  // These provide extra layers of protection in case of any edge cases
  const isModalOpenDirect = typeof document !== 'undefined' && document.body.classList.contains('buy-credits-modal-open');
  const currentRoute = typeof window !== 'undefined' ? window.location.hash : '';
  const isOnMainScreen = !currentRoute || currentRoute === '' || currentRoute === '#';
  
  // If ANY check indicates we should hide, return null immediately
  // This ensures the component never renders when it shouldn't
  if (finalShouldHide || shouldHide || isModalOpenDirect || !isOnMainScreen) {
    return null;
  }

  // Hide if there are no options/categories available
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div
      ref={barRef}
      className="word-button-bar"
      data-visible="true"
      style={{
        position: 'fixed',
        bottom: `${footerHeightRef.current}px`,
        left: '220px',
        right: '140px',
        zIndex: finalShouldHide ? -1 : 9999,
        display: finalShouldHide ? 'none' : 'block',
        visibility: finalShouldHide ? 'hidden' : 'visible',
        opacity: finalShouldHide ? 0 : 1,
        pointerEvents: finalShouldHide ? 'none' : 'auto',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10px',
            fontWeight: '500',
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            opacity: isIncluded ? 1 : 0.4
          }}
        >
          <span>{categoryDisplayName}</span>
          <span style={{ color: '#52525b', fontWeight: 600 }}>
            {options.length} options
          </span>
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
            scrollPaddingLeft: '24px',
            scrollPaddingRight: '24px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: `${categoryColor}40 transparent`,
            paddingBottom: '4px',
            paddingLeft: '24px',
            paddingRight: '24px'
          }}
          role="listbox"
          aria-label={`${categoryDisplayName} options`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {options.map((option, index) => {
              const isSelected = index === currentIndex;
              const buttonText = getButtonText(option, index);
              // Use a stable key based on option id if available, otherwise index
              const stableKey = option.id !== undefined ? `${category}-${option.id}` : `${category}-${index}`;
              const isTrashing = trashingIndex === index;
              
              return (
                <motion.div
                  key={stableKey}
                  ref={isSelected ? selectedButtonRef : null}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ 
                    opacity: 0,
                    width: 0,
                    minWidth: 0,
                    maxWidth: 0,
                    marginRight: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    overflow: 'hidden',
                    transition: { 
                      width: { duration: 0 },
                      opacity: { duration: 0.1 }
                    }
                  }}
                  layout
                  transition={{
                    layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                  }}
                  style={{
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                    overflow: 'hidden',
                    ...(isTrashing ? {
                      position: 'absolute',
                      width: 0,
                      height: 0,
                      opacity: 0,
                      pointerEvents: 'none',
                      marginRight: 0,
                      paddingLeft: 0,
                      paddingRight: 0
                    } : {})
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
                    showFavoriteButton={true}
                    onTrash={(buttonElement) => {
                      console.log('[WordButtonBar] Trash clicked for option:', option, 'at index:', index);
                      // Set trashing state immediately so button hides and layout can shift
                      setTrashingIndex(index);
                      if (onTrash) {
                        onTrash(option, index, buttonElement).then(() => {
                          // Clear trashing state after animation completes
                          setTimeout(() => setTrashingIndex(null), 1200);
                        }).catch(() => {
                          setTrashingIndex(null);
                        });
                      } else {
                        console.error('[WordButtonBar] onTrash prop is not provided');
                        setTrashingIndex(null);
                      }
                    }}
                    showTrashButton={true}
                    isTrashing={isTrashing}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
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

