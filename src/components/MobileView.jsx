import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, Lock, Unlock, Dice5, X, Copy, Check, Bookmark } from 'lucide-react';
import categories from '../data/categories';
import presets from '../data/presets';
import { categoryDisplayNames, categoryColors, categoryGroupDefinitions } from '../data/categoryRegistry';

/*
 * MobileView — exact replica of the iOS PosePrompter Builder tab.
 *
 * Layout (top → bottom):
 *   Title "Pose Prompter"
 *   Preset cycling bar  < Custom >
 *   Prompt preview card
 *   Randomize All / Clear buttons
 *   Collapsible category groups (Body, Face, Style, Outfit, Camera, Scene)
 *   Word button bar (fixed at bottom, shows when a category is active)
 */

// ─── Theme — exact iOS colors ───────────────────────────────────────────────
const T = {
  bg: '#000000',
  card: 'rgba(23,23,23,1)',       // white 0.09
  cardBorder: 'rgba(41,41,41,1)', // white 0.16
  accent: '#E87461',              // coral
  textPrimary: 'rgba(235,235,235,1)',   // white 0.92
  textSecondary: 'rgba(140,140,140,1)', // white 0.55
  textTertiary: 'rgba(82,82,82,1)',     // white 0.32
  // Group colors
  body:   '#E87461',
  face:   '#D98D6B',
  style:  '#C7857A',
  outfit: '#B87A70',
  camera: '#A68580',
  scene:  '#998F85',
};

const groupMeta = [
  { key: 'body',   label: 'Body',   icon: '🧍', color: T.body },
  { key: 'face',   label: 'Face',   icon: '😊', color: T.face },
  { key: 'style',  label: 'Style',  icon: '🎨', color: T.style },
  { key: 'outfit', label: 'Outfit', icon: '👕', color: T.outfit },
  { key: 'camera', label: 'Camera', icon: '📷', color: T.camera },
  { key: 'scene',  label: 'Scene',  icon: '🖼️', color: T.scene },
];

// Map group keys to their category arrays
const groupCategories = {
  body:   ['BodyPose','Torso','Arms','Hands','Legs','Feet','BodySize'],
  face:   ['HeadPosition','FacialExpression','Eyes','Mouth','Hair'],
  style:  ['Aesthetic','Lighting','ColorPalette','Texture','Mood','PhotoStyle'],
  outfit: ['Outfit','OutfitTop','OutfitBottom','Shoes','Jewelry','HairAccessories','Bags','BrandDesigner'],
  camera: ['Framing','Perspective','CameraAngle','CameraType'],
  scene:  ['Background','Props'],
};

// ─── Card wrapper ───────────────────────────────────────────────────────────
const Card = ({ children, style, radius = 16 }) => (
  <div style={{
    background: T.card,
    borderRadius: radius,
    border: `0.5px solid ${T.cardBorder}`,
    ...style,
  }}>
    {children}
  </div>
);

// ─── MobileView ─────────────────────────────────────────────────────────────
const MobileView = ({
  selections,
  lockedCategories,
  onSelectOption,
  onRandomizeAll,
  onRandomizeCategory,
  onToggleLock,
  onClearAll,
  onClearCategory,
  mergedCategories,
  activePresetIndex,
  presetCount,
  activePresetTitle,
  onCyclePreset,
}) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set(['body']));
  const [activeCategory, setActiveCategory] = useState(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const wordBarRef = useRef(null);

  // Build generated prompt
  const generatedPrompt = useMemo(() => {
    const allCatKeys = Object.keys(mergedCategories);
    const parts = [];
    for (const key of allCatKeys) {
      const options = mergedCategories[key];
      const idx = selections[key];
      if (idx !== undefined && idx !== null && options && options[idx]) {
        parts.push(options[idx].prompt || options[idx].title);
      }
    }
    return parts.join(' ');
  }, [selections, mergedCategories]);

  const selectedCategoryCount = useMemo(() => {
    return Object.keys(selections).filter(k => selections[k] !== undefined && selections[k] !== null).length;
  }, [selections]);

  // Copy prompt
  const copyPrompt = () => {
    navigator.clipboard?.writeText(generatedPrompt);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 1500);
  };

  // Toggle group expansion
  const toggleGroup = (key) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Get selected option for a category
  const getSelected = (catKey) => {
    const idx = selections[catKey];
    if (idx === undefined || idx === null) return null;
    const options = mergedCategories[catKey];
    if (!options || !options[idx]) return null;
    return options[idx];
  };

  return (
    <div style={{
      background: T.bg,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      color: T.textPrimary,
      paddingBottom: activeCategory ? 120 : 40,
      overflowX: 'hidden',
    }}>
      {/* ─── Title ─── */}
      <div style={{ padding: '16px 16px 0' }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: -0.5,
          margin: 0,
          color: T.textPrimary,
        }}>Pose Prompter</h1>
      </div>

      {/* ─── Preset Cycling Bar ─── */}
      <div style={{ padding: '12px 16px' }}>
        <Card style={{ display: 'flex', alignItems: 'center', padding: '8px 12px' }} radius={14}>
          <button onClick={() => onCyclePreset?.(-1)} style={btnCircle}>
            <ChevronLeft size={14} color={T.textTertiary} />
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            {activePresetIndex >= 0 ? (
              <>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.accent, fontFeatureSettings: '"tnum"' }}>
                  {activePresetIndex + 1}/{presetCount}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activePresetTitle}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 11, fontWeight: 500, color: T.textTertiary }}>Custom</div>
            )}
          </div>
          <button onClick={() => onCyclePreset?.(1)} style={btnCircle}>
            <ChevronRight size={14} color={T.textTertiary} />
          </button>
        </Card>
      </div>

      {/* ─── Prompt Preview Card ─── */}
      <div style={{ padding: '0 16px' }}>
        <Card style={{ padding: 16 }} radius={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ color: T.accent, fontSize: 16 }}>❝</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Generated Prompt</span>
            <div style={{ flex: 1 }} />
            {selectedCategoryCount > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 500, color: T.accent,
                background: `${T.accent}26`, padding: '2px 8px', borderRadius: 99,
              }}>
                {selectedCategoryCount} active
              </span>
            )}
          </div>

          {!generatedPrompt ? (
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
              Tap categories below or hit Randomize to build your prompt...
            </p>
          ) : (
            <>
              <p style={{
                fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {generatedPrompt}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button onClick={copyPrompt} style={{
                  ...btnSmall,
                  border: `1px solid ${copiedFeedback ? '#22c55e50' : `${T.accent}50`}`,
                  color: copiedFeedback ? '#22c55e' : T.accent,
                }}>
                  {copiedFeedback ? <Check size={12} /> : <Copy size={12} />}
                  {copiedFeedback ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ─── Action Bar ─── */}
      <div style={{ display: 'flex', gap: 12, padding: '12px 16px' }}>
        <button onClick={onRandomizeAll} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: T.accent, color: '#fff', border: 'none', borderRadius: 12,
          padding: '12px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          <Dice5 size={16} /> Randomize All
        </button>
        <button onClick={() => { onClearAll?.(); setActiveCategory(null); }} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: 'transparent', color: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
          padding: '12px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>
          <X size={14} /> Clear
        </button>
      </div>

      {/* ─── Category Groups ─── */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groupMeta.map(group => {
          const isExpanded = expandedGroups.has(group.key);
          const cats = groupCategories[group.key] || [];
          const activeCount = cats.filter(k => getSelected(k)).length;

          return (
            <Card key={group.key} radius={16}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', color: T.textPrimary,
                }}
              >
                <span style={{ fontSize: 18 }}>{group.icon}</span>
                <span style={{ fontSize: 16, fontWeight: 700, flex: 1, textAlign: 'left' }}>{group.label}</span>
                {activeCount > 0 && (
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: group.color,
                    background: `${group.color}26`, padding: '2px 7px', borderRadius: 99,
                  }}>
                    {activeCount}/{cats.length}
                  </span>
                )}
                <ChevronDown
                  size={12}
                  color={T.textTertiary}
                  style={{ transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}
                />
              </button>

              {/* Category Rows */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {cats.map(catKey => {
                      const selected = getSelected(catKey);
                      const isLocked = lockedCategories[catKey];
                      const isActive = activeCategory === catKey;
                      const displayName = categoryDisplayNames[catKey] || catKey;

                      return (
                        <button
                          key={catKey}
                          onClick={() => setActiveCategory(isActive ? null : catKey)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: '10px 16px', background: isActive ? `${group.color}1a` : selected ? `${group.color}0f` : 'transparent',
                            border: 'none', cursor: 'pointer', color: T.textPrimary, textAlign: 'left',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: isActive ? group.color : T.textPrimary }}>
                              {displayName}
                            </div>
                            <div style={{ fontSize: 12, color: selected ? group.color : T.textTertiary, marginTop: 1 }}>
                              {selected ? (selected.title || 'Selected') : 'None'}
                            </div>
                          </div>

                          {/* Lock */}
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleLock?.(catKey); }}
                            style={{ ...btnIcon, color: isLocked ? '#eab308' : T.textTertiary }}
                          >
                            {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                          </button>

                          {/* Randomize */}
                          <button
                            onClick={(e) => { e.stopPropagation(); onRandomizeCategory?.(catKey); }}
                            style={{ ...btnIcon, color: 'rgba(255,255,255,0.5)' }}
                          >
                            <Dice5 size={12} />
                          </button>

                          <ChevronDown
                            size={10}
                            color={isActive ? group.color : T.textTertiary}
                            style={{ transform: isActive ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
                          />
                        </button>
                      );
                    })}
                    <div style={{ height: 8 }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* ─── Word Button Bar (fixed at bottom) ─── */}
      <AnimatePresence>
        {activeCategory && mergedCategories[activeCategory] && (
          <motion.div
            ref={wordBarRef}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
              background: 'rgba(15,15,18,0.95)', backdropFilter: 'blur(20px)',
              borderTop: `0.5px solid ${categoryColors[activeCategory] || T.accent}33`,
            }}
          >
            {/* Bar Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 6px' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                {categoryDisplayNames[activeCategory] || activeCategory}
              </span>
              <div style={{ flex: 1 }} />
              <button onClick={() => onClearCategory?.(activeCategory)} style={btnIcon}>
                <X size={12} color="rgba(255,255,255,0.4)" />
              </button>
              <button onClick={() => onRandomizeCategory?.(activeCategory)} style={btnIcon}>
                <Dice5 size={12} color={categoryColors[activeCategory] || T.accent} />
              </button>
              <button onClick={() => setActiveCategory(null)} style={btnIcon}>
                <X size={12} color="rgba(255,255,255,0.5)" strokeWidth={3} />
              </button>
            </div>

            {/* Scrolling Word Buttons */}
            <div style={{
              display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 12px',
              WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
            }}>
              {mergedCategories[activeCategory].map((option, index) => {
                const isSelected = selections[activeCategory] === index;
                const color = categoryColors[activeCategory] || T.accent;

                return (
                  <button
                    key={option.id || index}
                    onClick={() => {
                      if (isSelected) onClearCategory?.(activeCategory);
                      else onSelectOption?.(activeCategory, index);
                    }}
                    style={{
                      flexShrink: 0, padding: '10px 14px', borderRadius: 99,
                      fontSize: 12, fontWeight: isSelected ? 600 : 400, cursor: 'pointer',
                      background: isSelected ? `${color}4d` : 'rgba(255,255,255,0.06)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
                      border: `1px solid ${isSelected ? `${color}80` : 'rgba(255,255,255,0.08)'}`,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {option.title}
                  </button>
                );
              })}
            </div>

            {/* Safe area spacer for iPhone notch */}
            <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Tiny helper styles ─────────────────────────────────────────────────────
const btnCircle = {
  width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const btnSmall = {
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px',
  fontSize: 12, fontWeight: 500, borderRadius: 8, background: 'transparent', cursor: 'pointer',
};

const btnIcon = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default MobileView;
