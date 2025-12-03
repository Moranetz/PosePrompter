import React, { useState } from 'react';
import { Check } from 'lucide-react';

const WordButton = ({ 
  text, 
  categoryColor, 
  isSelected, 
  isDisabled, 
  onClick,
  index 
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
    minHeight: '44px',
    padding: '12px 24px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '500',
    border: isSelected 
      ? `2px solid ${categoryColor}` 
      : `1.5px solid ${categoryColor}40`,
    background: isSelected
      ? `${categoryColor}40`
      : `${categoryColor}15`,
    color: categoryColor,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isSelected
      ? `0 4px 12px ${categoryColor}30, 0 2px 8px rgba(0,0,0,0.08)`
      : '0 2px 8px rgba(0,0,0,0.08)',
    opacity: isDisabled ? 0.4 : 1,
    filter: isDisabled ? 'grayscale(50%)' : 'none',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    transform: 'translateY(0) scale(1)',
    animation: isSelected ? 'pulseGlow 2s ease-in-out infinite' : 'none'
  };

  const hoverStyle = !isDisabled ? {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: `0 4px 12px rgba(0,0,0,0.12), 0 0 0 4px ${categoryColor}20`,
    background: isSelected ? `${categoryColor}40` : `${categoryColor}25`
  } : {};

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          Object.assign(e.currentTarget.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = baseStyle.boxShadow;
          e.currentTarget.style.background = baseStyle.background;
        }
      }}
      aria-label={text}
    >
      {/* Ripple Effect */}
      {ripple && (
        <span
          style={{
            position: 'absolute',
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: categoryColor,
            opacity: 0.4,
            transform: 'scale(0)',
            animation: 'ripple 0.3s ease-out',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Checkmark for selected state */}
      {isSelected && (
        <Check 
          size={16} 
          style={{ 
            animation: 'checkmarkIn 0.3s ease-out',
            flexShrink: 0
          }} 
        />
      )}

      <span>{text}</span>

      <style>{`
        @keyframes ripple {
          to {
            transform: scale(10);
            opacity: 0;
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 4px 12px ${categoryColor}30, 0 2px 8px rgba(0,0,0,0.08);
          }
          50% {
            box-shadow: 0 4px 16px ${categoryColor}50, 0 2px 8px rgba(0,0,0,0.08);
          }
        }
        
        @keyframes checkmarkIn {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </button>
  );
};

export default WordButton;

