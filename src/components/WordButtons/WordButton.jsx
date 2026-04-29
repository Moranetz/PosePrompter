import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Check, Heart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { logger } from '../../utils/logger.js';
import { TOUCH_TARGETS, SPACING, TYPOGRAPHY, PATTERNS } from '../../config/uxDesignSystem';

const WordButton = ({ 
  text, 
  categoryColor, 
  isSelected, 
  isDisabled, 
  onClick,
  index,
  packageName,
  packageId,
  isFavorite,
  onToggleFavorite,
  showFavoriteButton,
  onTrash,
  showTrashButton,
  isTrashing
}) => {
  const [ripple, setRipple] = useState(null);
  const trashButtonRef = useRef(null);
  const buttonRef = useRef(null);

  // Memoize click handler to prevent unnecessary re-renders
  const handleClick = useCallback((e) => {
    if (isDisabled) return;
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 300);
    
    onClick?.();
  }, [isDisabled, onClick]);

  // Memoize styles to avoid recreation on every render
  const baseStyle = useMemo(() => ({
    minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
    padding: `${SPACING.MD} ${SPACING.XL}`,
    borderRadius: PATTERNS.RADIUS.MD,
    fontSize: TYPOGRAPHY.SM,
    fontWeight: isSelected ? '500' : '400',
    letterSpacing: '-0.01em',
    border: isSelected
      ? '1px solid rgba(139, 92, 246, 0.35)'
      : '1px solid rgba(255, 255, 255, 0.06)',
    background: isSelected
      ? 'rgba(139, 92, 246, 0.12)'
      : 'rgba(255, 255, 255, 0.02)',
    color: isSelected ? '#ededef' : '#9898a0',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'none',
    opacity: isDisabled ? 0.3 : 1,
    filter: isDisabled ? 'grayscale(50%)' : 'none',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    transform: 'translateY(0) scale(1)',
    outline: 'none'
  }), [isSelected, isDisabled]);

  const hoverStyle = useMemo(() => !isDisabled ? {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
    background: isSelected ? 'rgba(139, 92, 246, 0.18)' : 'rgba(255, 255, 255, 0.05)'
  } : {}, [isDisabled, isSelected]);

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={isDisabled || isTrashing}
      style={baseStyle}
      animate={isTrashing ? {
        scale: 0,
        opacity: 0,
        x: 0,
        y: 0,
      } : {}}
      whileHover={!isDisabled && !isTrashing ? { y: -1, scale: 1.01 } : {}}
      whileTap={!isDisabled && !isTrashing ? { 
        scale: 0.95,
        y: 1,
        transition: { 
          type: "tween",
          duration: 0.1,
          ease: [0.4, 0, 0.2, 1]
        }
      } : {}}
      transition={isTrashing ? { duration: 0.3 } : { 
        type: "tween",
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }}
      aria-label={text}
      aria-pressed={isSelected}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 158, 11, 0.4)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Ripple Effect */}
      {ripple && (
        <motion.span
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 10, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Checkmark for selected state */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ flexShrink: 0 }}
        >
          <Check size={16} />
        </motion.div>
      )}

      <span>{text}</span>

      {/* Package Badge */}
      {packageName && (
        <span
          style={{
            fontSize: '9px',
            padding: '2px 5px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: PATTERNS.RADIUS.SM,
            color: '#818cf8',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
          title={`From package: ${packageName}`}
        >
          {packageName.substring(0, 8)}
        </span>
      )}

      {/* Action Buttons Container */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
        {/* Trash Button */}
        {showTrashButton && onTrash && (
          <motion.button
            ref={trashButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              logger.log('[WordButton] Trash button clicked, calling onTrash');
              if (onTrash && buttonRef.current) {
                // Pass the entire button element, not just the trash icon
                onTrash(buttonRef.current);
              } else {
                logger.error('[WordButton] onTrash is not a function or button ref missing:', typeof onTrash);
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent focus
            }}
            tabIndex={-1} // Prevent keyboard focus
            whileHover={{ scale: 1.2 }}
            whileTap={{ 
              scale: 0.6,
              rotate: [0, -15, 15, -15, 0],
              transition: {
                type: "tween",
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              minWidth: `${TOUCH_TARGETS.MEDIUM}px`,
              minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#71717a',
              transition: 'color 200ms',
              flexShrink: 0,
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#71717a';
            }}
            title="Trash this option"
            aria-label="Trash this option"
          >
            <Trash2 size={14} />
          </motion.button>
        )}

        {/* Favorite Button */}
        {showFavoriteButton && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleFavorite && onToggleFavorite();
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent focus
            }}
            tabIndex={-1} // Prevent keyboard focus
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              minWidth: `${TOUCH_TARGETS.MEDIUM}px`,
              minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFavorite ? '#f43f5e' : '#52525b',
              transition: 'color 200ms',
              flexShrink: 0,
              outline: 'none'
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
          >
            <Heart 
              size={14} 
              fill={isFavorite ? '#f43f5e' : 'transparent'} 
              strokeWidth={2}
            />
          </motion.button>
        )}
      </div>

    </motion.button>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(WordButton);

