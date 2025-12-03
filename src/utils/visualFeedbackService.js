/**
 * Visual Feedback Service - Enhanced Micro-Interactions
 * 
 * Provides satisfying, rewarding visual feedback for user actions
 * to create positive reinforcement loops without manipulation.
 */

import { logger } from './logger.js';

/**
 * Visual feedback types
 */
export const FEEDBACK_TYPES = {
  SELECTION: 'selection',
  COPY: 'copy',
  RANDOMIZE: 'randomize',
  SAVE: 'save',
  LOCK: 'lock',
  UNLOCK: 'unlock',
  FAVORITE: 'favorite',
  CATEGORY_SWITCH: 'category_switch',
  MILESTONE: 'milestone',
  STREAK: 'streak',
};

/**
 * Trigger a visual feedback event
 * This can be used to trigger animations, haptics, or other feedback
 */
export const triggerFeedback = (type, options = {}) => {
  const {
    intensity = 'medium', // 'subtle', 'medium', 'strong'
    category = null,
    message = null,
    duration = null,
  } = options;

  // Dispatch custom event for components to listen to
  const event = new CustomEvent('visualFeedback', {
    detail: {
      type,
      intensity,
      category,
      message,
      duration,
      timestamp: Date.now(),
    },
  });

  window.dispatchEvent(event);
  logger.log(`[visualFeedback] Triggered: ${type} (${intensity})`);
};

/**
 * Get feedback configuration for a specific action
 */
export const getFeedbackConfig = (type, options = {}) => {
  const configs = {
    [FEEDBACK_TYPES.SELECTION]: {
      animation: 'bounce',
      duration: 300,
      sound: null,
      haptic: 'light',
      color: options.category || '#14b8a6',
    },
    [FEEDBACK_TYPES.COPY]: {
      animation: 'success',
      duration: 2000,
      sound: null,
      haptic: 'medium',
      color: '#22c55e',
    },
    [FEEDBACK_TYPES.RANDOMIZE]: {
      animation: 'shuffle',
      duration: 600,
      sound: null,
      haptic: 'medium',
      color: '#8b5cf6',
    },
    [FEEDBACK_TYPES.SAVE]: {
      animation: 'checkmark',
      duration: 1500,
      sound: null,
      haptic: 'light',
      color: '#3b82f6',
    },
    [FEEDBACK_TYPES.LOCK]: {
      animation: 'lock',
      duration: 400,
      sound: null,
      haptic: 'light',
      color: '#fbbf24',
    },
    [FEEDBACK_TYPES.UNLOCK]: {
      animation: 'unlock',
      duration: 400,
      sound: null,
      haptic: 'light',
      color: '#fbbf24',
    },
    [FEEDBACK_TYPES.FAVORITE]: {
      animation: 'heart',
      duration: 500,
      sound: null,
      haptic: 'light',
      color: '#f43f5e',
    },
    [FEEDBACK_TYPES.CATEGORY_SWITCH]: {
      animation: 'slide',
      duration: 250,
      sound: null,
      haptic: null,
      color: options.category || '#8b5cf6',
    },
    [FEEDBACK_TYPES.MILESTONE]: {
      animation: 'celebration',
      duration: 3000,
      sound: null,
      haptic: 'strong',
      color: '#fbbf24',
    },
    [FEEDBACK_TYPES.STREAK]: {
      animation: 'sparkle',
      duration: 2000,
      sound: null,
      haptic: 'medium',
      color: '#f59e0b',
    },
  };

  return configs[type] || configs[FEEDBACK_TYPES.SELECTION];
};

/**
 * Trigger haptic feedback (if supported)
 */
export const triggerHaptic = (intensity = 'medium') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      strong: [20, 10, 20],
    };

    const pattern = patterns[intensity] || patterns.medium;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Haptic feedback not supported or failed
    }
  }
};

/**
 * Create a progress indicator for multi-step actions
 */
export const createProgressIndicator = (steps, currentStep) => {
  return {
    total: steps,
    current: currentStep,
    percentage: Math.round((currentStep / steps) * 100),
    isComplete: currentStep >= steps,
  };
};

/**
 * Calculate satisfaction score based on user actions
 * Used for adaptive feedback intensity
 */
export const calculateSatisfactionScore = (actions) => {
  // Simple scoring: more actions = higher engagement
  // This can be enhanced with more sophisticated metrics
  const baseScore = Math.min(actions.length * 10, 100);
  return baseScore;
};

