import React, { useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A simplified, single-row category selector
 * Philosophy: Show everything at once, let users scan quickly
 * The Pragmatic Visionary wants to feel IN CONTROL - no hidden menus
 */
const CategoryChips = ({
  categoryDisplayNames,
  categoryColors,
  categories,
  selections,
  lockedCategories,
  includedCategories,
  activeCategory,
  onCategorySelect,
  onToggleLock,
  onToggleInclude
}) => {
  const activeButtonRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to active category
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      // Center the active button
      const scrollLeft = buttonRect.left - containerRect.left + container.scrollLeft - (containerRect.width / 2) + (buttonRect.width / 2);
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, [activeCategory]);

  const allCategories = Object.keys(categoryDisplayNames);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {allCategories.map((category, index) => {
        const isActive = activeCategory === category;
        const isLocked = lockedCategories[category] || false;
        const isIncluded = includedCategories[category] !== false;
        const color = categoryColors[category] || '#8b5cf6';
        const options = categories[category] || [];
        const currentIndex = selections[category] || 0;
        const hasOptions = options.length > 0;

        return (
          <motion.div
            key={category}
            ref={isActive ? activeButtonRef : null}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02, duration: 0.2 }}
            style={{
              position: 'relative',
              flexShrink: 0
            }}
          >
            <motion.button
              onClick={() => onCategorySelect(category)}
              onDoubleClick={(e) => {
                e.preventDefault();
                onToggleLock(category);
              }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: isActive ? '8px 16px' : '7px 13px',
                background: isActive
                  ? 'rgba(139, 92, 246, 0.15)'
                  : isIncluded
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(255, 255, 255, 0.01)',
                border: isActive
                  ? '1px solid rgba(139, 92, 246, 0.4)'
                  : isIncluded
                  ? '1px solid rgba(255, 255, 255, 0.07)'
                  : '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '8px',
                color: isActive
                  ? '#e4dbfa'
                  : isIncluded
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(255, 255, 255, 0.25)',
                fontSize: '12.5px',
                fontWeight: isActive ? '550' : '450',
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isActive
                  ? '0 0 12px rgba(139, 92, 246, 0.15)'
                  : 'none',
                textDecoration: isIncluded ? 'none' : 'line-through',
                textDecorationColor: 'rgba(255,255,255,0.15)'
              }}
              title={`${categoryDisplayNames[category]} (${currentIndex + 1}/${options.length})${isLocked ? ' - Locked' : ''}${!isIncluded ? ' - Excluded' : ''}\nDouble-click to ${isLocked ? 'unlock' : 'lock'}`}
            >
              {/* Category name */}
              <span>{categoryDisplayNames[category]}</span>
              
              {/* Count badge */}
              {hasOptions && (
                <span style={{
                  fontSize: '10px',
                  color: isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255, 255, 255, 0.35)',
                  fontWeight: '500',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {currentIndex + 1}/{options.length}
                </span>
              )}
            </motion.button>

            {/* Lock indicator */}
            {isLocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.5)',
                  cursor: 'pointer',
                  zIndex: 2
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock(category);
                }}
                title="Click to unlock"
              >
                <Lock size={9} color="#0a0a0f" strokeWidth={2.5} />
              </motion.div>
            )}

            {/* Excluded indicator */}
            {!isIncluded && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '-5px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                  cursor: 'pointer',
                  zIndex: 2
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleInclude(category);
                }}
                title="Click to include"
              >
                <EyeOff size={9} color="#ffffff" strokeWidth={2.5} />
              </motion.div>
            )}
          </motion.div>
        );
      })}

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryChips;

