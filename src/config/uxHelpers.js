/**
 * UX Helpers - Utility functions for UX calculations
 */

import { CHUNK_LIMITS } from './uxConstants';

// ============================================
// Progress Calculation
// ============================================
export const getProgressPercent = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// ============================================
// Progress Visibility Check
// ============================================
export const shouldShowProgress = (items, maxItems = CHUNK_LIMITS.LIST_ITEMS_BEFORE_PAGINATION) => {
  return items.length > maxItems;
};

// ============================================
// Chunking Helper (Miller's Law)
// ============================================
export const getChunkedItems = (items, chunkSize = CHUNK_LIMITS.OPTIONS_PER_GROUP) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

// ============================================
// Scroll Physics Calculation
// ============================================
export const getScrollPhysics = (contentHeight) => {
  const viewportHeight = window.innerHeight;
  const scrollableDistance = contentHeight - viewportHeight;
  
  // Heavier content = slower scroll
  const mass = Math.min(scrollableDistance / 1000, 5);
  
  return {
    damping: 20 + (mass * 2),
    stiffness: 300 - (mass * 20),
    mass: mass
  };
};

// ============================================
// Touch Feedback Calculation
// ============================================
export const getTouchFeedback = (elementSize) => {
  if (elementSize < 44) return { haptic: 'light', scale: 0.95 };
  if (elementSize < 88) return { haptic: 'medium', scale: 0.98 };
  return { haptic: 'heavy', scale: 0.99 };
};

// ============================================
// Spacing Helper (8px grid)
// ============================================
export const spacing = (multiplier) => {
  const BASE = 8;
  return `${BASE * multiplier}px`;
};

// ============================================
// Color Opacity Helper
// ============================================
export const withOpacity = (color, opacity) => {
  // Convert hex to rgba
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Already rgba or other format
  return color;
};

// ============================================
// Responsive Typography Helper
// ============================================
export const responsiveFontSize = (minSize, maxSize, viewportWidth = '5vw') => {
  return `clamp(${minSize}px, ${viewportWidth}, ${maxSize}px)`;
};
