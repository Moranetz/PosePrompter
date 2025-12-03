import React from 'react';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';

const CategoryItem = ({
  category,
  displayName,
  categoryColor,
  isActive,
  isLocked,
  isIncluded,
  currentIndex,
  totalOptions,
  onSelect,
  onToggleLock,
  onToggleInclude
}) => {
  return (
    <div
      onClick={() => onSelect(category)}
      style={{
        padding: '16px 20px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isActive ? `${categoryColor}10` : 'transparent',
        borderLeft: isActive ? `4px solid ${categoryColor}` : '4px solid transparent',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = `${categoryColor}08`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        {/* Category Color Indicator */}
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: categoryColor,
            flexShrink: 0,
            opacity: isIncluded ? 1 : 0.4
          }}
        />

        {/* Category Name */}
        <span
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: isActive ? '#2c2c2c' : '#3d3d3d',
            opacity: isIncluded ? 1 : 0.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {displayName}
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Option Counter */}
        <span
          style={{
            fontSize: '12px',
            color: '#6b6b6b',
            fontWeight: '500',
            opacity: isIncluded ? 1 : 0.4
          }}
        >
          {currentIndex + 1}/{totalOptions}
        </span>

        {/* Include/Exclude Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleInclude(category);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: isIncluded ? categoryColor : '#9ca3af',
            transition: 'all 0.2s',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${categoryColor}15`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label={isIncluded ? "Exclude from prompt" : "Include in prompt"}
          title={isIncluded ? "Exclude from prompt" : "Include in prompt"}
        >
          {isIncluded ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        {/* Lock/Unlock Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(category);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: isLocked ? '#fbbf24' : '#9ca3af',
            transition: 'all 0.2s',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isLocked ? '#fbbf2415' : `${categoryColor}15`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label={isLocked ? "Unlock (will randomize)" : "Lock (won't randomize)"}
          title={isLocked ? "Unlock (won't randomize)" : "Lock (won't randomize)"}
        >
          {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
        </button>
      </div>
    </div>
  );
};

export default CategoryItem;

