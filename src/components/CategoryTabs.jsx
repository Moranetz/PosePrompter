import React, { useRef, useEffect, useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, ChevronRight, Zap, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryTabs = ({
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
  onAddCustomOption,
  onExpandedGroupChange
}) => {
  const [expandedGroup, setExpandedGroup] = useState(2); // Start with "Aesthetic & Style" (most used)
  const activeButtonRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to active category
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      const scrollLeft = buttonRect.left - containerRect.left + container.scrollLeft - 20;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  // Find which group the active category belongs to and notify parent
  useEffect(() => {
    let newGroupIndex = expandedGroup;
    categoryGroups.forEach((group, index) => {
      if (group.categories.includes(activeCategory)) {
        newGroupIndex = index;
      }
    });
    
    if (newGroupIndex !== expandedGroup) {
      setExpandedGroup(newGroupIndex);
    }
    
    // Always notify parent of current expanded group
    if (onExpandedGroupChange) {
      onExpandedGroupChange(newGroupIndex);
    }
  }, [activeCategory, categoryGroups, onExpandedGroupChange]);

  const activeGroup = categoryGroups[expandedGroup];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '100%'
    }}>
      {/* Group Selector - Compact horizontal tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {categoryGroups.map((group, index) => {
          const isExpanded = expandedGroup === index;
          const groupColor = categoryColors[group.categories[0]] || '#8b5cf6';
          const activeCategoryInGroup = group.categories.find(cat => cat === activeCategory);
          
          return (
            <motion.button
              key={index}
              onClick={() => {
                setExpandedGroup(index);
                if (onExpandedGroupChange) {
                  onExpandedGroupChange(index);
                }
                // Select the first category in the group to keep state in sync
                if (group.categories.length > 0) {
                  onCategorySelect(group.categories[0]);
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '8px 14px',
                background: isExpanded 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : activeCategoryInGroup
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isExpanded 
                  ? '1.5px solid rgba(255, 255, 255, 0.25)'
                  : activeCategoryInGroup
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: isExpanded ? '#ffffff' : activeCategoryInGroup ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
                fontWeight: isExpanded ? '600' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                position: 'relative'
              }}
            >
              {group.title.replace(/Part \d+: /, '')}
            </motion.button>
          );
        })}
      </div>

      {/* Active Group Categories - Only show categories from the selected group */}
      <AnimatePresence mode="wait">
        <motion.div
          key={expandedGroup}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '6px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
          }}
        >
          {activeGroup?.categories.map((category) => {
            const isActive = activeCategory === category;
            const isLocked = lockedCategories[category] || false;
            const isIncluded = includedCategories[category] !== false;
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
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flexShrink: 0
                }}
              >
                {/* Main Category Button */}
                <motion.button
                  onClick={() => onCategorySelect(category)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '10px 16px',
                    background: isActive 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isActive 
                      ? '1.5px solid rgba(255, 255, 255, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isIncluded ? 1 : 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: '40px',
                    boxShadow: isActive 
                      ? '0 2px 8px rgba(0,0,0,0.3)'
                      : '0 1px 4px rgba(0,0,0,0.2)',
                    position: 'relative'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap' }}>{categoryDisplayNames[category]}</span>
                  
                  {hasSelection && (
                    <span style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontWeight: '500',
                      marginLeft: 'auto',
                      flexShrink: 0
                    }}>
                      {currentIndex + 1}/{options.length}
                    </span>
                  )}

                  {isLocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)'
                      }}
                    >
                      <Lock size={8} color="#0a0a0f" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Quick Actions - Only show on hover or when active */}
                <AnimatePresence>
                  {(isActive || isLocked || !isIncluded) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: 'flex',
                        gap: '4px',
                        justifyContent: 'center'
                      }}
                    >
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
          })}
        </motion.div>
      </AnimatePresence>

      <style>{`
        div::-webkit-scrollbar {
          height: 4px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default CategoryTabs;
