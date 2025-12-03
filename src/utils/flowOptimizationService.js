/**
 * Flow State Optimization Service
 * 
 * Reduces friction and maintains momentum in user workflows
 * through keyboard shortcuts, quick actions, and smart suggestions.
 */

import { logger } from './logger.js';

/**
 * Keyboard shortcut mappings
 */
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  NEXT_CATEGORY: 'ArrowRight',
  PREV_CATEGORY: 'ArrowLeft',
  NEXT_OPTION: 'ArrowDown',
  PREV_OPTION: 'ArrowUp',
  
  // Actions
  COPY_PROMPT: 'c',
  RANDOMIZE: 'r',
  RANDOMIZE_ALL: 'shift+r',
  SAVE_SET: 'ctrl+s',
  SAVE_SET_MAC: 'meta+s',
  
  // Category controls
  TOGGLE_LOCK: 'l',
  TOGGLE_INCLUDE: 'i',
  TOGGLE_FAVORITE: 'f',
  
  // Quick access
  FOCUS_SEARCH: '/',
  ESCAPE: 'Escape',
  
  // Navigation helpers
  FIRST_CATEGORY: 'home',
  LAST_CATEGORY: 'end',
};

/**
 * Check if a keyboard event matches a shortcut
 */
export const matchesShortcut = (event, shortcut) => {
  const key = event.key;
  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;
  const alt = event.altKey;

  switch (shortcut) {
    case KEYBOARD_SHORTCUTS.COPY_PROMPT:
      return key.toLowerCase() === 'c' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.RANDOMIZE:
      return key.toLowerCase() === 'r' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.RANDOMIZE_ALL:
      return key.toLowerCase() === 'r' && shift && !ctrl && !alt;
    case KEYBOARD_SHORTCUTS.SAVE_SET:
      return key.toLowerCase() === 's' && ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.SAVE_SET_MAC:
      return key.toLowerCase() === 's' && event.metaKey && !shift && !alt;
    case KEYBOARD_SHORTCUTS.TOGGLE_LOCK:
      return key.toLowerCase() === 'l' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.TOGGLE_INCLUDE:
      return key.toLowerCase() === 'i' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.TOGGLE_FAVORITE:
      return key.toLowerCase() === 'f' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.FOCUS_SEARCH:
      return key === '/' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.ESCAPE:
      return key === 'Escape';
    case KEYBOARD_SHORTCUTS.NEXT_CATEGORY:
      return key === 'ArrowRight' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.PREV_CATEGORY:
      return key === 'ArrowLeft' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.NEXT_OPTION:
      return key === 'ArrowDown' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.PREV_OPTION:
      return key === 'ArrowUp' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.FIRST_CATEGORY:
      return key === 'Home' && !ctrl && !shift && !alt;
    case KEYBOARD_SHORTCUTS.LAST_CATEGORY:
      return key === 'End' && !ctrl && !shift && !alt;
    default:
      return false;
  }
};

/**
 * Get human-readable shortcut description
 */
export const getShortcutDescription = (shortcut) => {
  const descriptions = {
    [KEYBOARD_SHORTCUTS.COPY_PROMPT]: 'C',
    [KEYBOARD_SHORTCUTS.RANDOMIZE]: 'R',
    [KEYBOARD_SHORTCUTS.RANDOMIZE_ALL]: 'Shift+R',
    [KEYBOARD_SHORTCUTS.SAVE_SET]: 'Ctrl+S',
    [KEYBOARD_SHORTCUTS.SAVE_SET_MAC]: 'Cmd+S',
    [KEYBOARD_SHORTCUTS.TOGGLE_LOCK]: 'L',
    [KEYBOARD_SHORTCUTS.TOGGLE_INCLUDE]: 'I',
    [KEYBOARD_SHORTCUTS.TOGGLE_FAVORITE]: 'F',
    [KEYBOARD_SHORTCUTS.FOCUS_SEARCH]: '/',
    [KEYBOARD_SHORTCUTS.NEXT_CATEGORY]: '→',
    [KEYBOARD_SHORTCUTS.PREV_CATEGORY]: '←',
    [KEYBOARD_SHORTCUTS.NEXT_OPTION]: '↓',
    [KEYBOARD_SHORTCUTS.PREV_OPTION]: '↑',
    [KEYBOARD_SHORTCUTS.FIRST_CATEGORY]: 'Home',
    [KEYBOARD_SHORTCUTS.LAST_CATEGORY]: 'End',
  };

  return descriptions[shortcut] || shortcut;
};

/**
 * Smart suggestions based on context
 */
export const getContextualSuggestions = (context) => {
  const { currentCategory, selections, lockedCategories, includedCategories } = context;
  
  const suggestions = [];

  // Suggest unlocking if many categories are locked
  const lockedCount = Object.values(lockedCategories).filter(Boolean).length;
  if (lockedCount > 5) {
    suggestions.push({
      type: 'unlock',
      message: `You have ${lockedCount} categories locked. Consider unlocking some to explore more variations.`,
      action: 'unlock_some',
    });
  }

  // Suggest including excluded categories
  const excludedCount = Object.values(includedCategories).filter(v => !v).length;
  if (excludedCount > 3) {
    suggestions.push({
      type: 'include',
      message: `${excludedCount} categories are excluded. Include them to add more detail to your prompts.`,
      action: 'include_some',
    });
  }

  // Suggest exploring new categories
  const usedCategories = Object.keys(selections).filter(cat => selections[cat] !== 0);
  if (usedCategories.length < 5) {
    suggestions.push({
      type: 'explore',
      message: 'Try exploring more categories to create richer prompts.',
      action: 'explore',
    });
  }

  return suggestions;
};

/**
 * Calculate workflow efficiency score
 */
export const calculateEfficiencyScore = (actions, timeSpent) => {
  // Simple efficiency metric: actions per minute
  const actionsPerMinute = (actions.length / timeSpent) * 60;
  return Math.min(actionsPerMinute * 10, 100); // Scale to 0-100
};

/**
 * Detect friction points in workflow
 */
export const detectFrictionPoints = (actionHistory) => {
  const frictionPoints = [];

  // Detect repeated undo/redo patterns (indicates uncertainty)
  let undoCount = 0;
  actionHistory.forEach((action, index) => {
    if (action.type === 'undo' || action.type === 'revert') {
      undoCount++;
      if (undoCount > 3 && index < actionHistory.length - 5) {
        frictionPoints.push({
          type: 'uncertainty',
          message: 'Frequent changes detected. Consider using the lock feature to preserve choices you like.',
          severity: 'medium',
        });
      }
    }
  });

  // Detect long pauses (indicates confusion or distraction)
  const pauses = actionHistory
    .map((action, index) => {
      if (index === 0) return null;
      return action.timestamp - actionHistory[index - 1].timestamp;
    })
    .filter(Boolean);

  const longPauses = pauses.filter(pause => pause > 30000); // 30 seconds
  if (longPauses.length > 2) {
    frictionPoints.push({
      type: 'confusion',
      message: 'Consider using keyboard shortcuts for faster navigation (press ? for help).',
      severity: 'low',
    });
  }

  return frictionPoints;
};

/**
 * Create quick action suggestions
 */
export const getQuickActions = (context) => {
  const { currentCategory, selections, lockedCategories } = context;
  
  const quickActions = [];

  // Quick randomize current category
  if (currentCategory && !lockedCategories[currentCategory]) {
    quickActions.push({
      id: 'randomize_current',
      label: 'Randomize Current Category',
      shortcut: 'R',
      action: 'randomize_current',
    });
  }

  // Quick copy
  quickActions.push({
    id: 'copy',
    label: 'Copy Prompt',
    shortcut: 'C',
    action: 'copy',
  });

  // Quick save
  quickActions.push({
    id: 'save',
    label: 'Save Set',
    shortcut: 'Ctrl+S',
    action: 'save',
  });

  return quickActions;
};

