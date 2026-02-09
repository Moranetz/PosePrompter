/**
 * UX Animations - Motion design constants and timing
 * 
 * Based on Apple's Human Interface Guidelines and research on
 * perceived performance and natural motion.
 */

import { TOUCH_TARGETS } from './uxConstants';

// ============================================
// Animation Timing Curves (Cubic Bézier)
// ============================================
export const EASING = {
  // Default curve (ease-in-out)
  DEFAULT: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
  
  // Entering elements (ease-out heavy)
  EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
  
  // Exiting elements (ease-in heavy)
  EASE_IN: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  
  // Sharp snap (system actions)
  SHARP: 'cubic-bezier(0.4, 0.0, 0.6, 1.0)',
  
  // Emphasized (important actions)
  EMPHASIZED: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
};

// ============================================
// Spring Physics (Alternative to Bézier)
// ============================================
export const SPRINGS = {
  // Quick response (buttons)
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.5
  },
  
  // Smooth (default)
  smooth: {
    damping: 30,
    stiffness: 300,
    mass: 1
  },
  
  // Bouncy (playful)
  bouncy: {
    damping: 15,
    stiffness: 150,
    mass: 1
  },
  
  // Heavy (large modals)
  heavy: {
    damping: 25,
    stiffness: 200,
    mass: 2
  }
};

// ============================================
// Timing Thresholds (Human Perception)
// ============================================
export const TIMINGS = {
  immediate: 100,     // Feels instant
  responsive: 200,    // Feels quick
  acceptable: 300,    // Feels smooth
  noticeable: 500,    // Feels slow
  frustrating: 1000   // Feels broken
};

// ============================================
// Animation Durations
// ============================================
export const DURATIONS = {
  microInteraction: 150,   // Button press
  transition: 300,         // Screen change
  reveal: 400,             // Content fade-in
  emphasis: 500            // Celebration moment
};

// ============================================
// Duration Calculation (Distance-Based)
// ============================================
export const calculateDuration = (distancePx) => {
  const baseSpeed = 500; // px per second
  const minDuration = 200; // ms
  const maxDuration = 600; // ms
  
  const calculated = (distancePx / baseSpeed) * 1000;
  return Math.max(minDuration, Math.min(maxDuration, calculated));
};

// ============================================
// Haptic Feedback Rules
// ============================================
export const HAPTIC_RULES = {
  // Touch DOWN (not up)
  buttonPress: { type: 'impactMedium', timing: 'onPressIn' },
  
  // State change moment
  toggle: { type: 'selection', timing: 'onChange' },
  
  // Threshold crossing
  pullToRefresh: { 
    type: 'impactHeavy', 
    timing: 'onThresholdCross',
    threshold: 88 // Golden ratio * base
  },
  
  // Completion moment
  taskComplete: { 
    type: 'notificationSuccess',
    timing: 'afterAPIConfirm',
    delay: 200
  },
  
  // Scroll snap points
  scrollSnap: {
    type: 'impactLight',
    timing: 'onSnapAlign',
    throttle: 100
  }
};

// ============================================
// Haptic Intensity by Element Size
// ============================================
export const getHapticStyle = (elementSize) => {
  if (elementSize < TOUCH_TARGETS.MEDIUM) return 'impactLight';
  if (elementSize < 88) return 'impactMedium';
  return 'impactHeavy';
};

// ============================================
// Audio Specifications
// ============================================
export const SOUND_SPECS = {
  success: {
    frequency1: 880,      // A5 note
    frequency2: 1320,     // E6 note (harmonic)
    duration: 150,
    envelope: 'ADSR(5, 20, 0.6, 125)'
  },
  
  tap: {
    frequency: 1300,
    duration: 10,
    envelope: 'ADSR(1, 3, 0, 6)'
  },
  
  error: {
    frequency: 250,
    duration: 200,
    envelope: 'ADSR(5, 40, 0.4, 155)'
  }
};

// ============================================
// Volume Calibration
// ============================================
export const calibrateVolume = (systemVolume) => {
  const targetDB = -20;  // 20 dB below system
  return systemVolume * Math.pow(10, targetDB / 20);
};

// ============================================
// Musical Ratios (Harmonics)
// ============================================
export const HARMONIOUS_RATIOS = {
  octave: 2/1,        // 440 Hz → 880 Hz
  perfectFifth: 3/2,  // 440 Hz → 660 Hz
  perfectFourth: 4/3, // 440 Hz → 587 Hz
  majorThird: 5/4,    // 440 Hz → 550 Hz
};

// ============================================
// Size-Weight-Timing Correlations
// ============================================
export const getAnimationParams = (elementSize) => {
  const area = elementSize.width * elementSize.height;
  const mass = Math.sqrt(area) / 100;
  
  return {
    damping: 20 + (mass * 2),
    stiffness: 300 - (mass * 20),
    mass: mass,
    duration: 200 + (mass * 30)
  };
};
