import React, { useRef, useEffect } from 'react';
import { Lock, Unlock, Eye, EyeOff, Plus } from 'lucide-react';

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
  onToggleInclude,
  isLoggedIn,
  manageMenuOpen,
  onManageMenuToggle,
  onHideOption,
  onShowHiddenOptions,
  onAddCustomOption,
  onResetCategory
}) => {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (manageMenuOpen === category) {
          onManageMenuToggle(null);
        }
      }
    };

    if (manageMenuOpen === category) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [manageMenuOpen, category, onManageMenuToggle]);
  return (
    <div
      onClick={() => onSelect(category)}
      style={{
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isActive ? `${categoryColor}20` : 'transparent',
        borderLeft: isActive ? `3px solid ${categoryColor}` : '3px solid transparent',
        marginBottom: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* Category Color Indicator */}
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: categoryColor,
            flexShrink: 0,
            opacity: isIncluded ? 1 : 0.4,
            boxShadow: isActive ? `0 0 8px ${categoryColor}40` : 'none'
          }}
        />

        {/* Category Name */}
        <span
        style={{
          fontSize: '13px',
          fontWeight: '500',
          color: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.65)',
          opacity: isIncluded ? 1 : 0.4,
          whiteSpace: 'nowrap',
          overflow: 'visible',
          textOverflow: 'clip',
          wordBreak: 'break-word',
          flex: 1,
          minWidth: 0,
          lineHeight: '1.4'
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
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontWeight: '500',
            opacity: isIncluded ? 1 : 0.3
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

        {/* Add Custom Button (only when logged in) */}
        {isLoggedIn && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManageMenuToggle(manageMenuOpen === category ? null : category);
              }}
              style={{
                background: manageMenuOpen === category ? 'rgba(220, 220, 220, 0.9)' : 'rgba(200, 200, 200, 0.25)',
                border: '1px solid rgba(200, 200, 200, 0.5)',
                cursor: 'pointer',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: manageMenuOpen === category ? '#1a1a1a' : 'rgba(220, 220, 220, 0.9)',
                transition: 'all 0.2s',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220, 220, 220, 0.9)';
                e.currentTarget.style.color = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = manageMenuOpen === category ? 'rgba(220, 220, 220, 0.9)' : 'rgba(200, 200, 200, 0.25)';
                e.currentTarget.style.color = manageMenuOpen === category ? '#1a1a1a' : 'rgba(220, 220, 220, 0.9)';
              }}
              aria-label="Add custom option"
              title="Add custom option"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>

            {/* Dropdown Menu */}
            {manageMenuOpen === category && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  background: '#1e1e2a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  zIndex: 1000,
                  minWidth: '180px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(12px)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onHideOption(category, currentIndex);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Hide Selected Option
                </button>
                <button
                  onClick={() => onShowHiddenOptions(category)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Show Hidden Options
                </button>
                <button
                  onClick={() => onAddCustomOption(category)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Add Custom Option
                </button>
                <div
                  style={{
                    height: '1px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    margin: '6px 0'
                  }}
                />
                <button
                  onClick={() => onResetCategory(category)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#ef4444',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Reset to Defaults
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryItem;

