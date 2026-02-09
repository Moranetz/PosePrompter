/**
 * UX Design System - Main entry point
 * 
 * This file re-exports all UX constants and helpers from organized modules.
 * Import from here for convenience, or import directly from specific modules.
 * 
 * Usage:
 *   import { TOUCH_TARGETS, SPACING, getProgressPercent } from './config/uxDesignSystem';
 * 
 * Or import from specific modules:
 *   import { SPRINGS, EASING } from './config/uxAnimations';
 *   import { THUMB_ZONES } from './config/uxMobile';
 */

// Core Constants
export {
  BASE,
  TOUCH_TARGETS,
  RESPONSE_TIMES,
  CHUNK_LIMITS,
  SPACING,
  TYPOGRAPHY,
  ICON_SIZES,
  COLORS,
  HIERARCHY,
  FORM,
  PATTERNS,
  A11Y,
  getButtonStyles
} from './uxConstants';

// Animations & Motion
export {
  EASING,
  SPRINGS,
  TIMINGS,
  DURATIONS,
  calculateDuration,
  HAPTIC_RULES,
  getHapticStyle,
  SOUND_SPECS,
  calibrateVolume,
  HARMONIOUS_RATIOS,
  getAnimationParams
} from './uxAnimations';

// Mobile Optimizations
export {
  THUMB_ZONES,
  BUTTON_SIZES,
  MIN_TOUCH_TARGET,
  GESTURE_SHORTCUTS,
  SCREEN_PRIORITIES,
  coreUserJourney
} from './uxMobile';

// Progress Indicators
export {
  PROGRESS,
  PROGRESS_MESSAGING,
  PROGRESS_LAYERS,
  PROGRESS_FORMATS,
  THRESHOLD_RULES,
  NOTIFICATION_TRIGGERS
} from './uxProgress';

// Emotional Design
export {
  CORE_EMOTION,
  EMOTIONAL_DESIGN,
  ONBOARDING_EMOTION_SEQUENCE,
  EMOTIONAL_FEEDBACK,
  AUDIO_IDENTITY,
  emotionalAudit
} from './uxEmotional';

// Social Proof
export {
  SOCIAL_PROOF_DISPLAYS,
  PROOF_TYPES
} from './uxSocial';

// Layout Patterns
export {
  VERTICAL_RHYTHM,
  OPTICAL_GUIDE,
  CONTAINER_WIDTHS,
  BREAKPOINTS
} from './uxLayout';

// Helper Functions
export {
  getProgressPercent,
  shouldShowProgress,
  getChunkedItems,
  getScrollPhysics,
  getTouchFeedback,
  spacing,
  withOpacity,
  responsiveFontSize
} from './uxHelpers';
