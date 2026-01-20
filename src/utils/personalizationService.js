/**
 * Personalization Service - Adapt Interface to User Preferences
 * 
 * Tracks user behavior and adapts the interface to their preferences
 * for a more personalized, efficient experience.
 */

import { updateDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { logger } from './logger.js';

const USERS_COLLECTION = 'users';

/**
 * User preference structure:
 * {
 *   preferences: {
 *     favoriteCategories: string[], // Most frequently used categories
 *     defaultExpandedGroups: number[], // Category groups to auto-expand
 *     preferredLayout: 'sidebar' | 'horizontal',
 *     autoSave: boolean,
 *     showSuggestions: boolean,
 *     categoryOrder: string[], // Custom category ordering
 *     quickAccess: string[], // Categories to show in quick access
 *     lastUsedCategories: string[], // Recently used categories
 *   },
 *   usage: {
 *     categoryUsageCount: { [category]: number },
 *     categoryLastUsed: { [category]: Timestamp },
 *     totalSessions: number,
 *     averageSessionDuration: number,
 *     mostActiveTimeOfDay: string,
 *   }
 * }
 */

/**
 * Track category usage
 */
export const trackCategoryUsage = async (userId, categoryName) => {
  if (!userId || !categoryName || !db) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const usage = data.usage || {};
    const categoryUsageCount = usage.categoryUsageCount || {};
    const categoryLastUsed = usage.categoryLastUsed || {};

    // Increment usage count
    categoryUsageCount[categoryName] = (categoryUsageCount[categoryName] || 0) + 1;
    categoryLastUsed[categoryName] = serverTimestamp();

    await updateDoc(userRef, {
      'usage.categoryUsageCount': categoryUsageCount,
      'usage.categoryLastUsed': categoryLastUsed,
      'usage.lastUpdated': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    logger.log(`[personalization] Tracked category usage: ${categoryName}`);
  } catch (error) {
    logger.error('[personalization] Error tracking category usage:', error);
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (userId) => {
  if (!userId || !db) return null;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const data = userSnap.data();
    return {
      preferences: data.preferences || {},
      usage: data.usage || {},
    };
  } catch (error) {
    logger.error('[personalization] Error getting preferences:', error);
    return null;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (userId, preferences) => {
  if (!userId || !db) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create user document if it doesn't exist - CRITICAL FIX: use setDoc instead of updateDoc
      await setDoc(userRef, {
        preferences: preferences,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      logger.log('[personalization] User document created with preferences');
      return;
    }

    const currentData = userSnap.data();
    const currentPreferences = currentData.preferences || {};

    await updateDoc(userRef, {
      preferences: {
        ...currentPreferences,
        ...preferences,
      },
      updatedAt: serverTimestamp(),
    });

    logger.log('[personalization] Preferences updated');
  } catch (error) {
    logger.error('[personalization] Error updating preferences:', error);
    // Re-throw error so callers can handle it
    throw error;
  }
};

/**
 * Get favorite categories (most used)
 */
export const getFavoriteCategories = async (userId, limit = 5) => {
  const prefs = await getUserPreferences(userId);
  if (!prefs || !prefs.usage) return [];

  const categoryUsageCount = prefs.usage.categoryUsageCount || {};
  
  // Sort by usage count
  const sorted = Object.entries(categoryUsageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category]) => category);

  return sorted;
};

/**
 * Get recently used categories
 */
export const getRecentlyUsedCategories = async (userId, limit = 5) => {
  const prefs = await getUserPreferences(userId);
  if (!prefs || !prefs.usage) return [];

  const categoryLastUsed = prefs.usage.categoryLastUsed || {};
  
  // Sort by last used timestamp
  const sorted = Object.entries(categoryLastUsed)
    .sort((a, b) => {
      const aTime = a[1]?.toMillis?.() || 0;
      const bTime = b[1]?.toMillis?.() || 0;
      return bTime - aTime;
    })
    .slice(0, limit)
    .map(([category]) => category);

  return sorted;
};

/**
 * Get suggested categories based on usage patterns
 */
export const getSuggestedCategories = async (userId, currentCategory, allCategories) => {
  const prefs = await getUserPreferences(userId);
  if (!prefs || !prefs.usage) return [];

  const categoryUsageCount = prefs.usage.categoryUsageCount || {};
  const currentUsage = categoryUsageCount[currentCategory] || 0;

  // Find categories that are:
  // 1. Not the current category
  // 2. Used less frequently (to encourage exploration)
  // 3. But still exist in the system
  const suggestions = allCategories
    .filter(cat => cat !== currentCategory)
    .map(cat => ({
      category: cat,
      usage: categoryUsageCount[cat] || 0,
    }))
    .sort((a, b) => {
      // Prefer categories with some usage but less than current
      if (a.usage < currentUsage && b.usage >= currentUsage) return -1;
      if (a.usage >= currentUsage && b.usage < currentUsage) return 1;
      return a.usage - b.usage;
    })
    .slice(0, 3)
    .map(item => item.category);

  return suggestions;
};

/**
 * Get default expanded groups based on usage
 */
export const getDefaultExpandedGroups = async (userId, defaultGroups = [2]) => {
  const prefs = await getUserPreferences(userId);
  if (!prefs || !prefs.preferences) return defaultGroups;

  return prefs.preferences.defaultExpandedGroups || defaultGroups;
};

/**
 * Get category order preference
 */
export const getCategoryOrder = async (userId, defaultOrder) => {
  const prefs = await getUserPreferences(userId);
  if (!prefs || !prefs.preferences) return defaultOrder;

  const customOrder = prefs.preferences.categoryOrder;
  if (!customOrder || customOrder.length === 0) return defaultOrder;

  // Merge custom order with default (in case new categories were added)
  const ordered = [...customOrder];
  defaultOrder.forEach(cat => {
    if (!ordered.includes(cat)) {
      ordered.push(cat);
    }
  });

  return ordered;
};

/**
 * Track session duration
 */
export const trackSessionDuration = async (userId, duration) => {
  if (!userId || !db) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const usage = data.usage || {};
    const totalSessions = (usage.totalSessions || 0) + 1;
    const previousAvg = usage.averageSessionDuration || 0;
    
    // Calculate running average
    const averageSessionDuration = previousAvg === 0
      ? duration
      : (previousAvg * (totalSessions - 1) + duration) / totalSessions;

    await updateDoc(userRef, {
      'usage.totalSessions': totalSessions,
      'usage.averageSessionDuration': averageSessionDuration,
      'usage.lastSessionEnd': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    logger.log(`[personalization] Tracked session: ${duration}s`);
  } catch (error) {
    logger.error('[personalization] Error tracking session:', error);
  }
};

/**
 * Get enabled clothing categories for user
 * Returns array of category keys that should be shown in "Clothes & Styling" section
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<string[]>} Array of enabled clothing category keys
 */
export const getEnabledClothingCategories = async (userId) => {
  if (!userId || !db) return [];

  try {
    const prefs = await getUserPreferences(userId);
    if (!prefs || !prefs.preferences) return [];

    // If the field exists but is undefined, return empty array
    // If the field doesn't exist, return empty array  
    // If the field exists and is an array (even if empty), return it
    const categories = prefs.preferences.enabledClothingCategories;
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    logger.error('[personalization] Error getting enabled clothing categories:', error);
    return [];
  }
};

/**
 * Update enabled clothing categories for user
 * 
 * @param {string} userId - The user's unique ID
 * @param {string[]} categories - Array of category keys to enable
 * @returns {Promise<void>}
 */
export const updateEnabledClothingCategories = async (userId, categories) => {
  if (!userId || !db) return;

  try {
    // Explicitly save the array, even if empty (Firestore supports empty arrays)
    const categoriesToSave = Array.isArray(categories) ? categories : [];
    await updateUserPreferences(userId, {
      enabledClothingCategories: categoriesToSave,
    });
    logger.log('[personalization] Enabled clothing categories updated:', categoriesToSave);
  } catch (error) {
    logger.error('[personalization] Error updating enabled clothing categories:', error);
    throw error;
  }
};

/**
 * Get hidden category groups for user
 * Returns array of group titles that should be hidden
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<string[]>} Array of hidden category group titles
 */
export const getHiddenCategoryGroups = async (userId) => {
  if (!userId || !db) return [];

  try {
    const prefs = await getUserPreferences(userId);
    if (!prefs || !prefs.preferences) return [];
    return prefs.preferences.hiddenCategoryGroups || [];
  } catch (error) {
    logger.error('[personalization] Error getting hidden category groups:', error);
    return [];
  }
};

/**
 * Update hidden category groups for user
 * 
 * @param {string} userId - The user's unique ID
 * @param {string[]} groupTitles - Array of category group titles to hide
 * @returns {Promise<void>}
 */
export const updateHiddenCategoryGroups = async (userId, groupTitles) => {
  if (!userId || !db) return;

  try {
    await updateUserPreferences(userId, {
      hiddenCategoryGroups: groupTitles || [],
    });
    logger.log('[personalization] Hidden category groups updated');
  } catch (error) {
    logger.error('[personalization] Error updating hidden category groups:', error);
    throw error;
  }
};

/**
 * Get enabled Face & Head categories for user
 * Returns array of category keys that should be shown in "Face & Head" section
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<string[]>} Array of enabled Face & Head category keys
 */
export const getEnabledFaceHeadCategories = async (userId) => {
  if (!userId || !db) return [];

  try {
    const prefs = await getUserPreferences(userId);
    if (!prefs || !prefs.preferences) return [];

    // If the field exists but is undefined, return empty array
    // If the field doesn't exist, return empty array
    // If the field exists and is an array (even if empty), return it
    const categories = prefs.preferences.enabledFaceHeadCategories;
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    logger.error('[personalization] Error getting enabled Face & Head categories:', error);
    return [];
  }
};

/**
 * Update enabled Face & Head categories for user
 * 
 * @param {string} userId - The user's unique ID
 * @param {string[]} categories - Array of category keys to enable
 * @returns {Promise<void>}
 */
export const updateEnabledFaceHeadCategories = async (userId, categories) => {
  if (!userId || !db) return;

  try {
    // Explicitly save the array, even if empty (Firestore supports empty arrays)
    const categoriesToSave = Array.isArray(categories) ? categories : [];
    await updateUserPreferences(userId, {
      enabledFaceHeadCategories: categoriesToSave,
    });
    logger.log('[personalization] Enabled Face & Head categories updated:', categoriesToSave);
  } catch (error) {
    logger.error('[personalization] Error updating enabled Face & Head categories:', error);
    throw error;
  }
};

/**
 * Get enabled Aesthetic & Style categories for user
 * Returns array of category keys that should be shown in "Aesthetic & Style" section
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<string[]>} Array of enabled Aesthetic & Style category keys
 */
export const getEnabledAestheticStyleCategories = async (userId) => {
  if (!userId || !db) return [];

  try {
    const prefs = await getUserPreferences(userId);
    if (!prefs || !prefs.preferences) return [];

    // If the field exists but is undefined, return empty array
    // If the field doesn't exist, return empty array
    // If the field exists and is an array (even if empty), return it
    const categories = prefs.preferences.enabledAestheticStyleCategories;
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    logger.error('[personalization] Error getting enabled Aesthetic & Style categories:', error);
    return [];
  }
};

/**
 * Update enabled Aesthetic & Style categories for user
 * 
 * @param {string} userId - The user's unique ID
 * @param {string[]} categories - Array of category keys to enable
 * @returns {Promise<void>}
 */
export const updateEnabledAestheticStyleCategories = async (userId, categories) => {
  if (!userId || !db) return;

  try {
    // Explicitly save the array, even if empty (Firestore supports empty arrays)
    const categoriesToSave = Array.isArray(categories) ? categories : [];
    await updateUserPreferences(userId, {
      enabledAestheticStyleCategories: categoriesToSave,
    });
    logger.log('[personalization] Enabled Aesthetic & Style categories updated:', categoriesToSave);
  } catch (error) {
    logger.error('[personalization] Error updating enabled Aesthetic & Style categories:', error);
    throw error;
  }
};

/**
 * Get enabled Framing & Composition categories for user
 * Returns array of category keys that should be shown in "Framing & Composition" section
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<string[]>} Array of enabled Framing & Composition category keys
 */
export const getEnabledFramingCompositionCategories = async (userId) => {
  if (!userId || !db) return [];

  try {
    const prefs = await getUserPreferences(userId);
    if (!prefs || !prefs.preferences) return [];

    // If the field exists but is undefined, return empty array
    // If the field doesn't exist, return empty array
    // If the field exists and is an array (even if empty), return it
    const categories = prefs.preferences.enabledFramingCompositionCategories;
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    logger.error('[personalization] Error getting enabled Framing & Composition categories:', error);
    return [];
  }
};

/**
 * Update enabled Framing & Composition categories for user
 * 
 * @param {string} userId - The user's unique ID
 * @param {string[]} categories - Array of category keys to enable
 * @returns {Promise<void>}
 */
export const updateEnabledFramingCompositionCategories = async (userId, categories) => {
  if (!userId || !db) return;

  try {
    // Explicitly save the array, even if empty (Firestore supports empty arrays)
    const categoriesToSave = Array.isArray(categories) ? categories : [];
    await updateUserPreferences(userId, {
      enabledFramingCompositionCategories: categoriesToSave,
    });
    logger.log('[personalization] Enabled Framing & Composition categories updated:', categoriesToSave);
  } catch (error) {
    logger.error('[personalization] Error updating enabled Framing & Composition categories:', error);
    throw error;
  }
};

/**
 * Get enabled Background & Environment categories for user
 * Returns array of category keys that should be shown in "Background & Environment" section
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<string[]>} Array of enabled Background & Environment category keys
 */
export const getEnabledBackgroundEnvironmentCategories = async (userId) => {
  if (!userId || !db) return [];

  try {
    const prefs = await getUserPreferences(userId);
    if (!prefs || !prefs.preferences) return [];

    // If the field exists but is undefined, return empty array
    // If the field doesn't exist, return empty array
    // If the field exists and is an array (even if empty), return it
    const categories = prefs.preferences.enabledBackgroundEnvironmentCategories;
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    logger.error('[personalization] Error getting enabled Background & Environment categories:', error);
    return [];
  }
};

/**
 * Update enabled Background & Environment categories for user
 * 
 * @param {string} userId - The user's unique ID
 * @param {string[]} categories - Array of category keys to enable
 * @returns {Promise<void>}
 */
export const updateEnabledBackgroundEnvironmentCategories = async (userId, categories) => {
  if (!userId || !db) return;

  try {
    // Explicitly save the array, even if empty (Firestore supports empty arrays)
    const categoriesToSave = Array.isArray(categories) ? categories : [];
    await updateUserPreferences(userId, {
      enabledBackgroundEnvironmentCategories: categoriesToSave,
    });
    logger.log('[personalization] Enabled Background & Environment categories updated:', categoriesToSave);
  } catch (error) {
    logger.error('[personalization] Error updating enabled Background & Environment categories:', error);
    throw error;
  }
};

/**
 * Get enabled Body & Pose categories for user
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<string[]>} Array of enabled Body & Pose category keys
 */
export const getEnabledBodyPoseCategories = async (userId) => {
  if (!userId || !db) return [];

  try {
    const prefs = await getUserPreferences(userId);
    if (!prefs || !prefs.preferences) return [];

    // If the field exists but is undefined, return empty array
    // If the field doesn't exist, return empty array
    // If the field exists and is an array (even if empty), return it
    const categories = prefs.preferences.enabledBodyPoseCategories;
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    logger.error('[personalization] Error getting enabled Body & Pose categories:', error);
    return [];
  }
};

/**
 * Update enabled Body & Pose categories for user
 * 
 * @param {string} userId - The user's unique ID
 * @param {string[]} categories - Array of category keys to enable
 * @returns {Promise<void>}
 */
export const updateEnabledBodyPoseCategories = async (userId, categories) => {
  if (!userId || !db) return;

  try {
    // Explicitly save the array, even if empty (Firestore supports empty arrays)
    const categoriesToSave = Array.isArray(categories) ? categories : [];
    await updateUserPreferences(userId, {
      enabledBodyPoseCategories: categoriesToSave,
    });
    logger.log('[personalization] Enabled Body & Pose categories updated:', categoriesToSave);
  } catch (error) {
    logger.error('[personalization] Error updating enabled Body & Pose categories:', error);
    throw error;
  }
};

/**
 * PERFORMANCE OPTIMIZATION: Get all enabled category preferences in a single query
 * This replaces 6+ separate getUserPreferences() calls with one batch fetch
 *
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Object>} Object containing all category preferences
 */
export const getAllCategoryPreferences = async (userId) => {
  if (!userId || !db) {
    return {
      clothing: [],
      faceHead: [],
      aestheticStyle: [],
      framingComposition: [],
      backgroundEnvironment: [],
      bodyPose: []
    };
  }

  try {
    const prefs = await getUserPreferences(userId);
    if (!prefs || !prefs.preferences) {
      return {
        clothing: [],
        faceHead: [],
        aestheticStyle: [],
        framingComposition: [],
        backgroundEnvironment: [],
        bodyPose: []
      };
    }

    const preferences = prefs.preferences;
    return {
      clothing: Array.isArray(preferences.enabledClothingCategories)
        ? preferences.enabledClothingCategories : [],
      faceHead: Array.isArray(preferences.enabledFaceHeadCategories)
        ? preferences.enabledFaceHeadCategories : [],
      aestheticStyle: Array.isArray(preferences.enabledAestheticStyleCategories)
        ? preferences.enabledAestheticStyleCategories : [],
      framingComposition: Array.isArray(preferences.enabledFramingCompositionCategories)
        ? preferences.enabledFramingCompositionCategories : [],
      backgroundEnvironment: Array.isArray(preferences.enabledBackgroundEnvironmentCategories)
        ? preferences.enabledBackgroundEnvironmentCategories : [],
      bodyPose: Array.isArray(preferences.enabledBodyPoseCategories)
        ? preferences.enabledBodyPoseCategories : []
    };
  } catch (error) {
    logger.error('[personalization] Error getting all category preferences:', error);
    return {
      clothing: [],
      faceHead: [],
      aestheticStyle: [],
      framingComposition: [],
      backgroundEnvironment: [],
      bodyPose: []
    };
  }
};

