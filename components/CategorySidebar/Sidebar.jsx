import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  onToggleInclude
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        width: isCollapsed ? '60px' : '280px',
        background: 'linear-gradient(to bottom, #fefefe 0%, #f8f6f2 100%)',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'relative',
        boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
        flexShrink: 0,
        zIndex: 10
      }}
      className="sidebar-container"
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: '16px',
          right: isCollapsed ? '12px' : '-12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight size={14} color="#3d3d3d" />
        ) : (
          <ChevronLeft size={14} color="#3d3d3d" />
        )}
      </button>

      {/* Header */}
      {!isCollapsed && (
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#2c2c2c',
              marginBottom: '4px'
            }}
          >
            Pose Prompter
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: '#6b6b6b',
              fontStyle: 'italic'
            }}
          >
            Your creative workspace
          </p>
        </div>
      )}

      {/* Category Groups */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent'
        }}
      >
        {categoryGroups.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(groupIndex);
          
          return (
            <div key={groupIndex} style={{ marginBottom: '16px' }}>
              {/* Group Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(groupIndex)}
                  style={{
                    width: '100%',
                    padding: '12px 8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c2c2c',
                        marginBottom: '2px'
                      }}
                    >
                      {group.title}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6b6b6b',
                        fontStyle: 'italic'
                      }}
                    >
                      {group.description}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronLeft size={16} color="#6b6b6b" style={{ transform: 'rotate(-90deg)' }} />
                  ) : (
                    <ChevronRight size={16} color="#6b6b6b" style={{ transform: 'rotate(-90deg)' }} />
                  )}
                </button>
              )}

              {/* Category Items */}
              {isExpanded && (
                <div style={{ marginTop: '8px', paddingLeft: isCollapsed ? '0' : '8px' }}>
                  {group.categories.map((category) => {
                    const options = categories[category] || [];
                    const currentIndex = selections[category] || 0;
                    const isActive = activeCategory === category;
                    const isLocked = lockedCategories[category] || false;
                    const isIncluded = includedCategories[category] !== false;
                    const categoryColor = categoryColors[category] || '#b39ddb';

                    if (isCollapsed) {
                      // Icon-only view
                      return (
                        <div
                          key={category}
                          onClick={() => onCategorySelect(category)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: isActive ? `${categoryColor}20` : 'transparent',
                            border: isActive ? `2px solid ${categoryColor}` : '2px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginBottom: '4px',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = `${categoryColor}15`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                          title={categoryDisplayNames[category]}
                        >
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: categoryColor,
                              opacity: isIncluded ? 1 : 0.4
                            }}
                          />
                        </div>
                      );
                    }

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
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

