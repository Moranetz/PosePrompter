/**
 * UX Mobile - Mobile-specific optimizations
 * 
 * Based on Fitts's Law, thumb zone research, and mobile interaction patterns.
 */

import { TOUCH_TARGETS } from './uxConstants';

// ============================================
// Thumb Zone Heat Map (Fitts's Law)
// ============================================
export const THUMB_ZONES = {
  natural: {
    // Easiest reach - place primary actions here
    area: 'bottom-center to bottom-right',
    coordinates: { x: '50-100%', y: '75-100%' },
    effort: 'zero-strain'
  },
  
  stretch: {
    // Requires thumb extension - secondary actions
    area: 'middle-right',
    coordinates: { x: '70-100%', y: '40-75%' },
    effort: 'slight-strain'
  },
  
  awkward: {
    // Requires hand repositioning - avoid or use for dangerous actions
    area: 'top-left',
    coordinates: { x: '0-30%', y: '0-25%' },
    effort: 'reposition-required'
  }
};

// ============================================
// Button Sizing Guidelines (Fitts's Law)
// ============================================
export const BUTTON_SIZES = {
  // Primary action (used every session)
  primary: {
    width: 88,  // Double minimum
    height: 55, // Golden ratio
    placement: THUMB_ZONES.natural
  },
  
  // Secondary action (used sometimes)
  secondary: {
    width: 55,
    height: TOUCH_TARGETS.MEDIUM,
    placement: THUMB_ZONES.stretch
  },
  
  // Destructive action (use rarely)
  destructive: {
    width: TOUCH_TARGETS.MEDIUM,
    height: TOUCH_TARGETS.MEDIUM,
    placement: THUMB_ZONES.awkward // Make harder to hit
  }
};

// ============================================
// Minimum Touch Target
// ============================================
export const MIN_TOUCH_TARGET = TOUCH_TARGETS.MEDIUM; // 44pt × 44pt

// ============================================
// Gesture Shortcuts
// ============================================
export const GESTURE_SHORTCUTS = {
  delete: 'swipe-left',     // Faster than tap-menu-tap-confirm
  archive: 'swipe-right',
  refresh: 'pull-down',
  dismiss: 'swipe-down'
};

// ============================================
// Screen Priorities (Hick's Law)
// ============================================
export const SCREEN_PRIORITIES = {
  // Only ONE can be "hero" size
  primaryAction: {
    size: 'large',        // 80% of screen real estate
    text: 'Continue Your Streak', // Action-oriented
    placement: 'center-top'
  },
  
  // Max TWO secondary options
  secondaryActions: {
    size: 'small',        // 10% each
    text: ['Browse', 'Settings'],
    placement: 'bottom'
  },
  
  // Everything else: hidden in navigation
  tertiaryActions: {
    location: 'hamburger-menu' // Not visible by default
  }
};

// ============================================
// Core User Journey (One-Handed Mode Test)
// ============================================
export const coreUserJourney = [
  'Open app',
  'Navigate to main feature',
  'Complete primary action',
  'View result',
  'Exit'
];

// All these actions should be in thumb zone
