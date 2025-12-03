import React, { useState } from 'react';
import { Check, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

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
  showFavoriteButton
}) => {
  const [ripple, setRipple] = useState(null);

  const handleClick = (e) => {
    if (isDisabled) return;
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 300);
    
    onClick && onClick();
  };

  const baseStyle = {
    minHeight: '48px',
    padding: '14px 26px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    border: isSelected 
      ? '2px solid rgba(255, 255, 255, 0.3)' 
      : '1px solid rgba(255, 255, 255, 0.1)',
    background: isSelected
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(255, 255, 255, 0.04)',
    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isSelected
      ? '0 4px 16px rgba(0, 0, 0, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.2)',
    opacity: isDisabled ? 0.3 : 1,
    filter: isDisabled ? 'grayscale(50%)' : 'none',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    whiteSpace: 'nowrap',
    transform: 'translateY(0) scale(1)'
  };

  const hoverStyle = !isDisabled ? {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
    background: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)'
  } : {};

  return (
    <motion.button
      onClick={handleClick}
      disabled={isDisabled}
      style={baseStyle}
      whileHover={!isDisabled ? { y: -2, scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      animate={{
        boxShadow: isSelected
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0,0,0,0.2)',
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: isSelected ? Infinity : 0,
          repeatType: 'reverse',
        },
      }}
      aria-label={text}
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
            fontSize: '10px',
            padding: '2px 6px',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '4px',
            color: '#a78bfa',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            flexShrink: 0,
          }}
          title={`From package: ${packageName}`}
        >
          {packageName.substring(0, 8)}
        </span>
      )}

      {/* Favorite Button */}
      {showFavoriteButton && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite && onToggleFavorite();
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorite ? '#f43f5e' : 'rgba(255, 255, 255, 0.4)',
            transition: 'color 0.2s',
            flexShrink: 0,
            marginLeft: 'auto'
          }}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            size={16} 
            fill={isFavorite ? '#f43f5e' : 'transparent'} 
            strokeWidth={2}
          />
        </motion.button>
      )}

    </motion.button>
  );
};

export default WordButton;

