/**
 * Payment Service - Handles gem purchases and transactions
 * 
 * This service manages the payment flow, updates user gem balance,
 * and handles transaction records. Also awards complimentary gems
 * to package creators when users who have installed their packages
 * purchase gems.
 */

import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { logger } from './logger.js';
import { getUserProfile } from '../firestoreService';
import { getPackage } from '../packageService';

const USERS_COLLECTION = 'users';

// Creator compensation configuration
// When a user buys gems, creators of installed packages get a percentage as complimentary gems
const CREATOR_COMPENSATION_PERCENTAGE = 0.05; // 5% of purchased gems
const MIN_COMPENSATION_GEMS = 1; // Minimum gems to award (rounds up)

/**
 * Process a gem purchase
 * 
 * @param {string} userId - The user's unique ID
 * @param {Object} packageData - The gem package being purchased
 * @param {number} packageData.gems - Number of gems in the package
 * @param {number} packageData.price - Price in dollars
 * @param {Object} [packageData.bonus] - Bonus gems info
 * @returns {Promise<Object>} Purchase result with success status and new gem balance
 * @throws {Error} If purchase fails
 * 
 * @example
 * const result = await purchaseGems('user123', { gems: 200, price: 24 });
 * if (result.success) {
 *   console.log('Purchase successful! New balance:', result.gemBalance);
 * }
 */
export const purchaseGems = async (userId, packageData) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!packageData || !packageData.gems) {
    throw new Error('Package data with gems count is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User profile does not exist');
    }

    const userData = userSnap.data();
    const currentGems = userData.gems || 0;
    
    // Calculate total gems (base + bonus)
    const totalGems = packageData.gems + (packageData.bonus?.bonus || 0);
    
    // Update user's gem balance
    await updateDoc(userRef, {
      gems: increment(totalGems),
      updatedAt: serverTimestamp(),
    });

    // Award complimentary gems to creators of installed packages
    // This runs asynchronously and doesn't block the purchase
    awardCreatorCompensation(userId, totalGems).catch(error => {
      // Log error but don't fail the purchase
      logger.error('[paymentService] Error awarding creator compensation:', error);
    });

    // Log transaction (optional - you might want to create a transactions collection)
    logger.log('[paymentService] Gem purchase successful:', {
      userId,
      gemsPurchased: totalGems,
      price: packageData.price,
      newBalance: currentGems + totalGems,
    });

    return {
      success: true,
      gemBalance: currentGems + totalGems,
      gemsAdded: totalGems,
      transactionId: `txn_${Date.now()}_${userId}`,
    };
  } catch (error) {
    logger.error('[paymentService] Error processing gem purchase:', error);
    throw error;
  }
};

/**
 * Awards complimentary gems to creators of packages installed by the user
 * 
 * @param {string} userId - The user who purchased gems
 * @param {number} gemsPurchased - Total gems purchased (including bonus)
 * @returns {Promise<Object>} Summary of compensation awarded
 */
const awardCreatorCompensation = async (userId, gemsPurchased) => {
  if (!userId || !db || gemsPurchased <= 0) {
    return { creatorsAwarded: 0, totalGemsAwarded: 0 };
  }

  try {
    // Get user's installed packages
    const userProfile = await getUserProfile(userId);
    if (!userProfile || !userProfile.installedPackages || userProfile.installedPackages.length === 0) {
      logger.log('[paymentService] No installed packages found for creator compensation');
      return { creatorsAwarded: 0, totalGemsAwarded: 0 };
    }

    const installedPackageIds = userProfile.installedPackages;
    const creatorIds = new Set(); // Use Set to track unique creators

    // Get all installed packages and collect unique creator IDs
    for (const packageId of installedPackageIds) {
      try {
        const packageData = await getPackage(packageId);
        if (packageData && packageData.author && packageData.author.userId) {
          const creatorId = packageData.author.userId;
          // Don't award to the buyer themselves
          if (creatorId !== userId) {
            creatorIds.add(creatorId);
          }
        }
      } catch (error) {
        logger.warn(`[paymentService] Error getting package ${packageId} for compensation:`, error);
        // Continue with other packages
      }
    }

    if (creatorIds.size === 0) {
      logger.log('[paymentService] No unique creators found for compensation');
      return { creatorsAwarded: 0, totalGemsAwarded: 0 };
    }

    // Calculate compensation per creator
    const compensationPerCreator = Math.max(
      MIN_COMPENSATION_GEMS,
      Math.ceil(gemsPurchased * CREATOR_COMPENSATION_PERCENTAGE)
    );

    // Award gems to each creator
    const awardPromises = Array.from(creatorIds).map(async (creatorId) => {
      try {
        const creatorRef = doc(db, USERS_COLLECTION, creatorId);
        const creatorSnap = await getDoc(creatorRef);
        
        if (!creatorSnap.exists()) {
          logger.warn(`[paymentService] Creator profile not found: ${creatorId}`);
          return { creatorId, success: false };
        }

        await updateDoc(creatorRef, {
          gems: increment(compensationPerCreator),
          updatedAt: serverTimestamp(),
        });

        logger.log(`[paymentService] Awarded ${compensationPerCreator} gems to creator ${creatorId}`);
        return { creatorId, success: true, gemsAwarded: compensationPerCreator };
      } catch (error) {
        logger.error(`[paymentService] Error awarding gems to creator ${creatorId}:`, error);
        return { creatorId, success: false, error: error.message };
      }
    });

    const results = await Promise.all(awardPromises);
    const successfulAwards = results.filter(r => r.success);
    const totalGemsAwarded = successfulAwards.length * compensationPerCreator;

    logger.log('[paymentService] Creator compensation summary:', {
      totalCreators: creatorIds.size,
      successfulAwards: successfulAwards.length,
      gemsPerCreator: compensationPerCreator,
      totalGemsAwarded,
    });

    return {
      creatorsAwarded: successfulAwards.length,
      totalGemsAwarded,
      gemsPerCreator: compensationPerCreator,
    };
  } catch (error) {
    logger.error('[paymentService] Error in awardCreatorCompensation:', error);
    return { creatorsAwarded: 0, totalGemsAwarded: 0, error: error.message };
  }
};

/**
 * Get user's current gem balance
 * 
 * @param {string} userId - The user's unique ID
 * @returns {Promise<number>} Current gem balance
 */
export const getGemBalance = async (userId) => {
  if (!userId || !db) return 0;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return 0;
    
    const userData = userSnap.data();
    return userData.gems || 0;
  } catch (error) {
    logger.error('[paymentService] Error getting gem balance:', error);
    return 0;
  }
};

