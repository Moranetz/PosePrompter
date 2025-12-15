/**
 * Engagement Service - Ethical UX Enhancement
 * 
 * Tracks user engagement metrics and provides positive reinforcement
 * through achievements, progress tracking, and personalized insights.
 * 
 * This service focuses on VALUE-DRIVEN engagement, not manipulation.
 */

import { updateDoc, doc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase-config';
import { logger } from './logger.js';

const USERS_COLLECTION = 'users';

/**
 * User engagement statistics structure:
 * {
 *   stats: {
 *     promptsGenerated: number,
 *     promptsCopied: number,
 *     categoriesExplored: Set<string>,
 *     customOptionsCreated: number,
 *     setsSaved: number,
 *     lastActiveDate: Timestamp,
 *     currentStreak: number,
 *     longestStreak: number,
 *     totalSessions: number,
 *     averageSessionDuration: number,
 *     favoriteCategories: { [category]: number }
 *   },
 *   achievements: {
 *     unlocked: string[],
 *     progress: { [achievementId]: number }
 *   }
 * }
 */

/**
 * Track a prompt generation event
 */
export const trackPromptGenerated = async (userId, categoryCount = 0) => {
  if (!userId || !db) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    const currentData = userSnap.data();
    const stats = currentData.stats || {};
    
    await updateDoc(userRef, {
      'stats.promptsGenerated': increment(1),
      'stats.lastActiveDate': serverTimestamp(),
      'stats.totalSessions': increment(1),
      updatedAt: serverTimestamp(),
    });

    // Check for achievements and return newly unlocked ones
    const newAchievements = await checkAchievements(userId, {
      ...stats,
      promptsGenerated: (stats.promptsGenerated || 0) + 1,
    });

    logger.log('[engagementService] Prompt generation tracked');
    return newAchievements || [];
  } catch (error) {
    logger.error('[engagementService] Error tracking prompt generation:', error);
    return [];
  }
};

/**
 * Track a prompt copy event
 */
export const trackPromptCopied = async (userId, categoryCount = 0) => {
  if (!userId || !db) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    const currentData = userSnap.data();
    const stats = currentData.stats || {};
    
    await updateDoc(userRef, {
      'stats.promptsCopied': increment(1),
      'stats.lastActiveDate': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Check for achievements and return newly unlocked ones
    const newAchievements = await checkAchievements(userId, {
      ...stats,
      promptsCopied: (stats.promptsCopied || 0) + 1,
    });

    logger.log('[engagementService] Prompt copy tracked');
    return newAchievements || [];
  } catch (error) {
    logger.error('[engagementService] Error tracking prompt copy:', error);
    return [];
  }
};

/**
 * Track category exploration
 */
export const trackCategoryExplored = async (userId, categoryName) => {
  if (!userId || !categoryName || !db) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    const currentData = userSnap.data();
    const stats = currentData.stats || {};
    const favoriteCategories = stats.favoriteCategories || {};
    
    // Increment category usage
    favoriteCategories[categoryName] = (favoriteCategories[categoryName] || 0) + 1;
    
    await updateDoc(userRef, {
      'stats.favoriteCategories': favoriteCategories,
      'stats.lastActiveDate': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    logger.log('[engagementService] Category exploration tracked:', categoryName);
  } catch (error) {
    logger.error('[engagementService] Error tracking category:', error);
  }
};

/**
 * Update user streak
 */
export const updateStreak = async (userId) => {
  if (!userId || !db) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    const currentData = userSnap.data();
    const stats = currentData.stats || {};
    const lastActiveDate = stats.lastActiveDate?.toDate?.() || null;
    const currentStreak = stats.currentStreak || 0;
    const longestStreak = stats.longestStreak || 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = currentStreak;
    
    if (lastActiveDate) {
      const lastDate = new Date(lastActiveDate);
      lastDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, maintain streak
        newStreak = currentStreak;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreak = currentStreak + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    } else {
      // First time, start streak
      newStreak = 1;
    }
    
    const newLongestStreak = Math.max(newStreak, longestStreak);
    
    await updateDoc(userRef, {
      'stats.currentStreak': newStreak,
      'stats.longestStreak': newLongestStreak,
      'stats.lastActiveDate': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Check for streak achievements
    const newAchievements = await checkAchievements(userId, {
      ...stats,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
    });

    logger.log('[engagementService] Streak updated:', newStreak);
    
    // Return both streak and newly unlocked achievements
    return { streak: newStreak, achievements: newAchievements || [] };
  } catch (error) {
    logger.error('[engagementService] Error updating streak:', error);
    return { streak: 0, achievements: [] };
  }
};

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS = {
  FIRST_PROMPT: {
    id: 'first_prompt',
    name: 'First Steps',
    description: 'Generated your first prompt',
    condition: (stats) => (stats.promptsGenerated || 0) >= 1,
  },
  PROMPT_MASTER: {
    id: 'prompt_master',
    name: 'Prompt Master',
    description: 'Generated 50 prompts',
    condition: (stats) => (stats.promptsGenerated || 0) >= 50,
  },
  PROMPT_LEGEND: {
    id: 'prompt_legend',
    name: 'Prompt Legend',
    description: 'Generated 500 prompts',
    condition: (stats) => (stats.promptsGenerated || 0) >= 500,
  },
  COPY_MASTER: {
    id: 'copy_master',
    name: 'Copy Master',
    description: 'Copied 100 prompts',
    condition: (stats) => (stats.promptsCopied || 0) >= 100,
  },
  STREAK_3: {
    id: 'streak_3',
    name: 'Getting Started',
    description: '3 day streak',
    condition: (stats) => (stats.currentStreak || 0) >= 3,
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7 day streak',
    condition: (stats) => (stats.currentStreak || 0) >= 7,
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30 day streak',
    condition: (stats) => (stats.currentStreak || 0) >= 30,
  },
  EXPLORER: {
    id: 'explorer',
    name: 'Explorer',
    description: 'Explored 10 different categories',
    condition: (stats) => {
      const categories = stats.favoriteCategories || {};
      return Object.keys(categories).length >= 10;
    },
  },
  FIRST_PACKAGE: {
    id: 'first_package',
    name: 'Creator',
    description: 'Published your first package',
    condition: (stats) => (stats.packagesPublished || 0) >= 1,
  },
  PACKAGE_POPULAR: {
    id: 'package_popular',
    name: 'Popular Creator',
    description: 'One of your packages was installed by someone',
    condition: (stats) => (stats.packageInstalls || 0) >= 1,
  },
  PACKAGE_STAR: {
    id: 'package_star',
    name: 'Rising Star',
    description: 'Your packages have been installed 10 times',
    condition: (stats) => (stats.packageInstalls || 0) >= 10,
  },
};

/**
 * Check and unlock achievements
 */
const checkAchievements = async (userId, stats) => {
  if (!userId || !db) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    const currentData = userSnap.data();
    const achievements = currentData.achievements || { unlocked: [], progress: {} };
    const unlocked = achievements.unlocked || [];
    const newlyUnlocked = [];

    // Check each achievement
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (!unlocked.includes(achievement.id)) {
        if (achievement.condition(stats)) {
          unlocked.push(achievement.id);
          newlyUnlocked.push(achievement);
        }
      }
    }

    // Update if new achievements unlocked
    if (newlyUnlocked.length > 0) {
      await updateDoc(userRef, {
        'achievements.unlocked': unlocked,
        updatedAt: serverTimestamp(),
      });

      logger.log('[engagementService] New achievements unlocked:', newlyUnlocked.map(a => a.name));
      return newlyUnlocked;
    }

    return [];
  } catch (error) {
    logger.error('[engagementService] Error checking achievements:', error);
    return [];
  }
};

/**
 * Track a package publication event
 */
export const trackPackagePublished = async (userId) => {
  if (!userId || !db) return [];

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return [];

    const currentData = userSnap.data();
    const stats = currentData.stats || {};
    const currentCount = stats.packagesPublished || 0;
    
    await updateDoc(userRef, {
      'stats.packagesPublished': increment(1),
      updatedAt: serverTimestamp(),
    });

    // Check for achievements
    const newAchievements = await checkAchievements(userId, {
      ...stats,
      packagesPublished: currentCount + 1,
    });

    logger.log('[engagementService] Package publication tracked');
    return newAchievements || [];
  } catch (error) {
    logger.error('[engagementService] Error tracking package publication:', error);
    return [];
  }
};

/**
 * Track when someone installs a creator's package
 */
export const trackPackageInstalled = async (creatorId) => {
  if (!creatorId || !db) return [];

  try {
    const userRef = doc(db, USERS_COLLECTION, creatorId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return [];

    const currentData = userSnap.data();
    const stats = currentData.stats || {};
    const currentCount = stats.packageInstalls || 0;
    
    await updateDoc(userRef, {
      'stats.packageInstalls': increment(1),
      updatedAt: serverTimestamp(),
    });

    // Check for achievements
    const newAchievements = await checkAchievements(userId, {
      ...stats,
      packageInstalls: currentCount + 1,
    });

    logger.log('[engagementService] Package installation tracked for creator:', creatorId);
    return newAchievements || [];
  } catch (error) {
    logger.error('[engagementService] Error tracking package installation:', error);
    return [];
  }
};

/**
 * Get user engagement stats
 */
export const getUserEngagementStats = async (userId) => {
  if (!userId || !db) return null;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return null;

    const data = userSnap.data();
    return {
      stats: data.stats || {},
      achievements: data.achievements || { unlocked: [], progress: {} },
    };
  } catch (error) {
    logger.error('[engagementService] Error getting engagement stats:', error);
    return null;
  }
};

/**
 * Get personalized suggestions based on usage
 */
export const getPersonalizedSuggestions = (stats) => {
  if (!stats) return null;

  const favoriteCategories = stats.favoriteCategories || {};
  const categories = Object.keys(favoriteCategories);
  
  if (categories.length === 0) return null;

  // Find least explored categories
  const sortedCategories = categories.sort((a, b) => 
    (favoriteCategories[a] || 0) - (favoriteCategories[b] || 0)
  );

  return {
    exploreCategory: sortedCategories[0],
    message: `You haven't explored "${sortedCategories[0]}" much yet. Try it out!`,
  };
};

/**
 * Get progress message for copy success overlay
 */
export const getProgressMessage = (stats) => {
  if (!stats) return null;

  const promptsGenerated = stats.promptsGenerated || 0;
  const promptsCopied = stats.promptsCopied || 0;
  const currentStreak = stats.currentStreak || 0;

  // Milestone messages
  if (promptsGenerated === 10) {
    return { type: 'milestone', message: '10 prompts generated! You\'re getting the hang of this.' };
  }
  if (promptsGenerated === 50) {
    return { type: 'milestone', message: '50 prompts! You\'re a prompt pro.' };
  }
  if (promptsGenerated === 100) {
    return { type: 'milestone', message: '100 prompts! You\'re unstoppable.' };
  }
  if (currentStreak >= 3 && currentStreak % 7 === 0) {
    return { type: 'streak', message: `${currentStreak} day streak! Keep it going.` };
  }
  if (promptsCopied === 25) {
    return { type: 'milestone', message: '25 prompts copied! Your workflow is getting smoother.' };
  }

  return null;
};

