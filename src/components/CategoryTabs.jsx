import React, { useRef, useEffect, useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, ChevronRight, Zap, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryTabs = ({
  categoryGroups,
  categoryDisplayNames,
  categoryColors,
  categories,
  selections,
  lockedCategories,
  includedCategories,
  autoExcludedCategories = [],
  activeCategory,
  onCategorySelect,
  onToggleLock,
  onToggleInclude,
  isLoggedIn,
  onAddCustomOption,
  onExpandedGroupChange,
  expandedGroup: expandedGroupProp,
  getCategoryFilteredCount
}) => {
  // Use prop if provided, otherwise use internal state
  const [internalExpandedGroup, setInternalExpandedGroup] = useState(2); // Start with "Aesthetic & Style" (most used)
  const expandedGroup = expandedGroupProp !== undefined ? expandedGroupProp : internalExpandedGroup;
  const activeButtonRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to active category (vertical scrolling)
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      const scrollTop = buttonRect.top - containerRect.top + container.scrollTop - 20;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [activeCategory]);

  // Find which group the active category belongs to and notify parent
  useEffect(() => {
    let newGroupIndex = expandedGroup;
    let foundGroup = false;
    
    categoryGroups.forEach((group, index) => {
      if (group.categories && group.categories.length > 0 && group.categories.includes(activeCategory)) {
        newGroupIndex = index;
        foundGroup = true;
      }
    });
    
    // Only auto-switch groups if the active category exists in a different group
    // Don't auto-switch if the category doesn't exist in any group (e.g., all categories unchecked)
    if (foundGroup && newGroupIndex !== expandedGroup) {
      if (expandedGroupProp === undefined) {
        setInternalExpandedGroup(newGroupIndex);
      }
      // Always notify parent of current expanded group
      if (onExpandedGroupChange) {
        onExpandedGroupChange(newGroupIndex);
      }
    }
  }, [activeCategory, categoryGroups, onExpandedGroupChange, expandedGroup, expandedGroupProp]);

  const activeGroup = categoryGroups[expandedGroup];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%'
    }}>
      {/* Group Selector - Vertical tabs */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingBottom: '8px'
        }}
      >
        {categoryGroups.map((group, index) => {
          const isExpanded = expandedGroup === index;
          const activeCategoryInGroup = group.categories.find(cat => cat === activeCategory);
          
          return (
            <motion.button
              key={index}
              onClick={() => {
                if (expandedGroupProp === undefined) {
                  setInternalExpandedGroup(index);
                }
                if (onExpandedGroupChange) {
                  onExpandedGroupChange(index);
                }
                // Only auto-select first category if there are categories available
                // If empty, clear activeCategory so user can navigate freely
                if (group.categories && group.categories.length > 0) {
                  onCategorySelect(group.categories[0]);
                } else {
                  // Clear active category when switching to empty group
                  // This allows free navigation between tabs
                  onCategorySelect(null);
                }
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                padding: '10px 14px',
                width: '100%',
                background: isExpanded
                  ? 'rgba(24, 24, 28, 0.9)'
                  : 'transparent',
                border: 'none',
                borderLeft: isExpanded
                  ? '3px solid #14b8a6'
                  : '3px solid transparent',
                borderRadius: '6px',
                color: isExpanded
                  ? '#f4f4f5'
                  : activeCategoryInGroup
                    ? '#e5e5e5'
                    : '#a1a1aa',
                fontSize: '13px',
                fontWeight: isExpanded ? '600' : '500',
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isExpanded
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : 'none'
              }}
            >
              {group.title.replace(/Part \d+: /, '')}
            </motion.button>
          );
        })}
      </div>

      {/* Active Group Categories - Vertical scrollable list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={expandedGroup}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          ref={scrollContainerRef}
          className="category-chips-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
          }}
        >
          {activeGroup?.categories && activeGroup.categories.length > 0 ? (
            activeGroup.categories.map((category) => {
            const isActive = activeCategory === category;
            const isLocked = lockedCategories[category] || false;
            const isIncluded = includedCategories[category] !== false;
            const isAutoExcluded = autoExcludedCategories.includes(category);
            const color = categoryColors[category] || '#8b5cf6';
            const options = categories[category] || [];
            const currentIndex = selections[category] || 0;
            const hasSelection = options.length > 0;

            return (
              <motion.div
                key={category}
                ref={isActive ? activeButtonRef : null}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: categoryGroups[expandedGroup].categories.indexOf(category) * 0.03 }}
                className="category-chip-wrapper"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* Main Category Button - Professional styling */}
                <motion.button
                  onClick={() => onCategorySelect(category)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    padding: '10px 16px',
                    background: isActive
                      ? 'rgba(20, 184, 166, 0.2)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isActive
                      ? '1px solid rgba(20, 184, 166, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '999px',
                    color: isActive ? '#f4f4f5' : '#d4d4d8',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: (!isIncluded || isAutoExcluded) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: '40px',
                    boxShadow: isActive
                      ? '0 4px 14px rgba(0,0,0,0.45)'
                      : 'none',
                    position: 'relative'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap' }}>{categoryDisplayNames[category]}</span>
                  
                  {hasSelection && (
                    <span style={{
                      fontSize: '10px',
                      color: '#71717a',
                      fontWeight: '400',
                      fontFeatureSettings: '"tnum"',
                      marginLeft: 'auto',
                      flexShrink: 0
                    }}>
                      {currentIndex + 1}/{getCategoryFilteredCount ? getCategoryFilteredCount(category) : options.length}
                    </span>
                  )}

                  {isLocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#eab308',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(234, 179, 8, 0.3)'
                      }}
                    >
                      <Lock size={7} color="#09090b" />
                    </motion.div>
                  )}

                  {isAutoExcluded && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      title="Covered by current Aesthetic — not included in prompt"
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#a855f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(168, 85, 247, 0.4)'
                      }}
                    >
                      <Sparkles size={7} color="#ffffff" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Quick Actions - Only show on hover or when active */}
                <AnimatePresence>
                  {(isActive || isLocked || !isIncluded || isAutoExcluded) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'center',
                        marginTop: '2px'
                      }}
                    >
                      {isAutoExcluded && (
                        <span style={{
                          fontSize: '9px',
                          color: '#a855f7',
                          fontWeight: '500',
                          padding: '3px 6px',
                          background: 'rgba(168, 85, 247, 0.1)',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }}>
                          Covered by Aesthetic
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleInclude(category);
                        }}
                        style={{
                          padding: '4px 8px',
                          background: isIncluded ? `${color}20` : 'rgba(255,255,255,0.04)',
                          border: 'none',
                          borderRadius: '6px',
                          color: isIncluded ? color : 'rgba(255,255,255,0.3)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '10px',
                          transition: 'all 0.2s'
                        }}
                        title={isIncluded ? "Exclude from prompt" : "Include in prompt"}
                      >
                        {isIncluded ? <Eye size={10} /> : <EyeOff size={10} />}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(category);
                        }}
                        style={{
                          padding: '4px 8px',
                          background: isLocked ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.04)',
                          border: 'none',
                          borderRadius: '6px',
                          color: isLocked ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '10px',
                          transition: 'all 0.2s'
                        }}
                        title={isLocked ? "Unlock" : "Lock"}
                      >
                        {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                      </button>

                      {/* Add Custom Option Button - Only when logged in */}
                      {isLoggedIn && onAddCustomOption && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddCustomOption(category);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: 'rgba(200, 200, 200, 0.25)',
                            border: '1px solid rgba(200, 200, 200, 0.5)',
                            borderRadius: '6px',
                            color: 'rgba(220, 220, 220, 0.9)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '10px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 220, 220, 0.9)';
                            e.currentTarget.style.color = '#1a1a1a';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(200, 200, 200, 0.25)';
                            e.currentTarget.style.color = 'rgba(220, 220, 220, 0.9)';
                          }}
                          title="Add your own custom option"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
          ) : (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px'
            }}>
              <p style={{ margin: '0 0 8px 0' }}>No categories enabled</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                Configure this group in Packages to enable categories
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .category-chips-container::-webkit-scrollbar {
          width: 6px;
        }
        .category-chips-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .category-chips-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .category-chips-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CategoryTabs;
