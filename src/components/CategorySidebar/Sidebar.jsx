import React, { useState } from 'react';
import CategoryItem from './CategoryItem';

const Sidebar = ({
  categoryGroups,
  categoryDisplayNames,
  categoryColors,
  categories,
  selections,
  lockedCategories,
  includedCategories,
  activeCategory,
  onCategorySelect,
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
  const [expandedGroups, setExpandedGroups] = useState(new Set(categoryGroups.map((_, i) => i)));

  const toggleGroup = (groupIndex) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupIndex)) {
        newSet.delete(groupIndex);
      } else {
        newSet.add(groupIndex);
      }
      return newSet;
    });
  };

  return (
    <div
      style={{
        width: '280px',
        minWidth: '280px',
        maxWidth: '280px',
        background: 'rgba(18, 18, 26, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        flexShrink: 0,
        zIndex: 10,
        alignSelf: 'flex-start',
        height: 'fit-content',
        minHeight: '100%'
      }}
      className="sidebar-container"
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          flexShrink: 0
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '4px'
          }}
        >
          Categories
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontStyle: 'italic'
          }}
        >
          Click to select
        </p>
      </div>

      {/* Category Groups */}
      <div
        style={{
          flex: '0 1 auto',
          padding: '12px 10px',
          overflow: 'visible',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        {categoryGroups.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(groupIndex);
          
          return (
            <div key={groupIndex} style={{ marginBottom: '12px' }}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupIndex)}
                style={{
                    width: '100%',
                    padding: '8px 6px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    minWidth: 0,
                    boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ flex: 1, minWidth: 0, overflow: 'visible' }}>
                  <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.85)',
                        marginBottom: '2px',
                        wordBreak: 'break-word',
                        overflow: 'visible',
                        whiteSpace: 'normal',
                        lineHeight: '1.3'
                      }}
                    >
                      {group.title}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontStyle: 'italic',
                        wordBreak: 'break-word',
                        overflow: 'visible',
                        whiteSpace: 'normal',
                        lineHeight: '1.3'
                      }}
                  >
                    {group.description}
                  </div>
                </div>
                {isExpanded ? (
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0, marginLeft: '8px' }}>▼</span>
                ) : (
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0, marginLeft: '8px' }}>▶</span>
                )}
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div style={{ marginTop: '6px', paddingLeft: '6px' }}>
                  {group.categories.map((category) => {
                    const options = categories[category] || [];
                    const currentIndex = selections[category] || 0;
                    const isActive = activeCategory === category;
                    const isLocked = lockedCategories[category] || false;
                    const isIncluded = includedCategories[category] !== false;
                    const categoryColor = categoryColors[category] || '#b39ddb';

                    return (
                      <CategoryItem
                        key={category}
                        category={category}
                        displayName={categoryDisplayNames[category]}
                        categoryColor={categoryColor}
                        isActive={isActive}
                        isLocked={isLocked}
                        isIncluded={isIncluded}
                        currentIndex={currentIndex}
                        totalOptions={options.length}
                        onSelect={onCategorySelect}
                        onToggleLock={onToggleLock}
                        onToggleInclude={onToggleInclude}
                        isLoggedIn={isLoggedIn}
                        manageMenuOpen={manageMenuOpen}
                        onManageMenuToggle={onManageMenuToggle}
                        onHideOption={onHideOption}
                        onShowHiddenOptions={onShowHiddenOptions}
                        onAddCustomOption={onAddCustomOption}
                        onResetCategory={onResetCategory}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

