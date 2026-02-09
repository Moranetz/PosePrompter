/**
 * UX Constants - Core design tokens based on UX Laws
 * 
 * This file contains the fundamental constants that implement
 * the 19 Laws of UX across the application.
 * 
 * Laws Applied:
 * - Fitts's Law: Minimum touch target sizes
 * - Doherty Threshold: Response time targets
 * - Miller's Law: Information chunking limits
 * - Law of Proximity: Spacing relationships
 * - Law of Prägnanz: Typography simplicity
 * - Von Restorff Effect: Visual hierarchy
 * - Postel's Law: Form robustness
 */

// ============================================
// Fitts's Law - Touch Target Sizes
// ============================================
export const TOUCH_TARGETS = {
  // Mobile minimum (Apple HIG, Android Material)
  MOBILE_MIN: 44, // pixels
  
  // Desktop minimum
  DESKTOP_MIN: 24, // pixels
  
  // Recommended sizes
  SMALL: 36,   // Secondary actions, icons
  MEDIUM: 44,  // Primary actions, buttons
  LARGE: 48,   // Critical CTAs, important buttons
  XLARGE: 56,  // Hero CTAs, major actions
};

// ============================================
// Doherty Threshold - Response Times
// ============================================
export const RESPONSE_TIMES = {
  INSTANT: 0,        // Immediate feedback (hover states)
  FAST: 100,         // Button press feedback
  IDEAL: 400,        // Maximum for "addictive" feel
  ACCEPTABLE: 1000,  // Loading states should show
  SLOW: 2000,        // Progress indicators required
};

// ============================================
// Miller's Law - Information Chunking
// ============================================
export const CHUNK_LIMITS = {
  NAVIGATION_MAX: 7,        // Max nav items before submenus
  OPTIONS_PER_GROUP: 7,     // Max options before categorization
  FORM_FIELDS_PER_STEP: 7,  // Max fields before multi-step
  LIST_ITEMS_BEFORE_PAGINATION: 9, // Max items before pagination
};

// ============================================
// Base Grid Unit (8px - Law of Proximity)
// ============================================
export const BASE = 8; // Base unit for 8px grid system

// ============================================
// Spacing System (8px grid - Law of Proximity)
// ============================================
export const SPACING = {
  // Base grid multiples (8px system)
  1: `${BASE}px`,      // 8px
  2: `${BASE * 2}px`,  // 16px
  3: `${BASE * 3}px`,  // 24px
  4: `${BASE * 4}px`,  // 32px
  5: `${BASE * 5}px`,  // 40px
  6: `${BASE * 6}px`,  // 48px
  8: `${BASE * 8}px`,  // 64px
  10: `${BASE * 10}px`, // 80px
  12: `${BASE * 12}px`, // 96px
  
  // Semantic names (within-group spacing - related items)
  XS: '4px',   // Tight grouping (form labels to fields)
  SM: '8px',   // Standard grouping (1x base)
  MD: '12px',  // Comfortable grouping
  LG: '16px',  // Loose grouping (2x base)
  
  // Between-group spacing (unrelated items)
  XL: '24px',  // Section separation (3x base)
  '2XL': '32px', // Major section separation (4x base)
  '3XL': '48px', // Page-level separation (6x base)
  '4XL': '64px', // Hero section separation (8x base)
  '5XL': '80px', // Large page separation (10x base)
};

// ============================================
// Typography Scale (Law of Prägnanz - Simplicity)
// ============================================
export const TYPOGRAPHY = {
  // Font sizes (matches component usage)
  XS: '10px',   // Labels, captions
  SM: '12px',   // Small text, helper text (matches TYPE.xs)
  BASE: '14px', // Body text (matches TYPE.sm)
  MD: '16px',   // Subheadings (matches TYPE.base)
  LG: '18px',   // Section headings (matches TYPE.lg)
  XL: '24px',   // Page headings (matches TYPE.xl)
  '2XL': '32px', // Hero headings (matches TYPE['2xl'])
  '3XL': 'clamp(32px, 5vw, 48px)', // H1 mobile (matches TYPE['3xl'])
  '4XL': 'clamp(48px, 6vw, 72px)', // H1 desktop (matches TYPE['4xl'])
  
  // Font weights (max 2-3 weights for simplicity)
  NORMAL: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
  
  // Line heights
  TIGHT: 1.1,   // Headlines
  NORMAL: 1.5,  // Body text
  RELAXED: 1.6, // Comfortable reading
  
  // Max line width for readability
  MAX_LINE_WIDTH: '60-80ch',
};

// ============================================
// Visual Hierarchy (Von Restorff Effect)
// ============================================
export const HIERARCHY = {
  // Z-index layers
  Z_BASE: 1,
  Z_DROPDOWN: 100,
  Z_MODAL: 1000,
  Z_TOAST: 10000,
  
  // Opacity levels
  DISABLED: 0.3,
  MUTED: 0.5,
  SUBTLE: 0.7,
  NORMAL: 1.0,
};

// ============================================
// Form Elements (Postel's Law - Robustness)
// ============================================
export const FORM = {
  INPUT_PADDING: `${SPACING.MD} ${SPACING.MD}`,
  INPUT_MIN_HEIGHT: TOUCH_TARGETS.MEDIUM,
  INPUT_BORDER_RADIUS: '8px',
  LABEL_MARGIN_BOTTOM: SPACING.SM,
  FIELD_GAP: SPACING.MD,
  GROUP_GAP: SPACING.XL,
};

// ============================================
// Icon Sizes (Fitts's Law)
// ============================================
export const ICON_SIZES = {
  XS: 12,   // Inline with small text
  SM: 16,   // Standard icon
  MD: 20,   // Medium icon
  LG: 24,   // Large icon
  XL: 32,   // Extra large icon
  '2XL': 48, // Hero icons
};

// ============================================
// Color System (60-30-10 Rule - Von Restorff Effect)
// ============================================
export const COLORS = {
  // 60% - Neutrals (background, surfaces, text)
  NEUTRAL: {
    BG: '#0a0a0f',           // Main background
    SURFACE: '#0f1419',      // Card/surface background
    TEXT: 'rgba(255,255,255,0.9)', // Primary text
    MUTED: 'rgba(255,255,255,0.5)', // Secondary text
    SUBTLE: 'rgba(255,255,255,0.3)', // Tertiary text
  },
  
  // 30% - Brand (purple - used in sections, backgrounds, icons)
  BRAND: {
    PRIMARY: '#8b5cf6',      // Main brand color
    LIGHT: 'rgba(139, 92, 246, 0.2)', // Light variant
    DARK: '#6d28d9',         // Dark variant
  },
  
  // 10% - Accent (orange - CTA ONLY, creates focus)
  ACCENT: {
    CTA: '#f59e0b',          // Primary CTA color
    CTA_HOVER: '#d97706',    // CTA hover state
  },
  
  // Semantic colors
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
};

// ============================================
// Common Patterns
// ============================================
export const PATTERNS = {
  // Card/Container
  CARD_PADDING: SPACING.XL,
  CARD_BORDER_RADIUS: '12px',
  CARD_GAP: SPACING.MD,
  
  // Modal
  MODAL_PADDING: SPACING['2XL'],
  MODAL_BORDER_RADIUS: '16px',
  MODAL_MAX_WIDTH: '600px',
  
  // Section
  SECTION_GAP: SPACING['2XL'],
  SECTION_PADDING: `${SPACING['3XL']} ${SPACING.XL}`,
  
  // Border radius scale
  RADIUS: {
    SM: '4px',
    MD: '8px',
    LG: '12px',
    XL: '16px',
    FULL: '999px',
  },
};

// ============================================
// Accessibility
// ============================================
export const A11Y = {
  FOCUS_RING: '0 0 0 2px rgba(245, 158, 11, 0.4)', // Orange focus ring
  FOCUS_RING_OFFSET: '2px',
  MIN_CONTRAST_RATIO: 4.5, // WCAG AA
  LARGE_TEXT_CONTRAST: 3.0, // WCAG AA for large text
};

// ============================================
// Button Styles (Law of Similarity)
// ============================================
export const getButtonStyles = () => ({
  PRIMARY: {
    minHeight: TOUCH_TARGETS.MEDIUM,
    padding: `${SPACING.MD} ${SPACING.XL}`,
    fontSize: TYPOGRAPHY.BASE,
    fontWeight: TYPOGRAPHY.SEMIBOLD,
  },
  SECONDARY: {
    minHeight: TOUCH_TARGETS.MEDIUM,
    padding: `${SPACING.MD} ${SPACING.XL}`,
    fontSize: TYPOGRAPHY.BASE,
    fontWeight: TYPOGRAPHY.MEDIUM,
  },
  TERTIARY: {
    minHeight: TOUCH_TARGETS.SMALL,
    padding: `${SPACING.MD} ${SPACING.XL}`,
    fontSize: TYPOGRAPHY.SM,
    fontWeight: TYPOGRAPHY.MEDIUM,
  },
  ICON_ONLY: {
    minWidth: TOUCH_TARGETS.MEDIUM,
    minHeight: TOUCH_TARGETS.MEDIUM,
    padding: SPACING.SM,
  },
});
