/**
 * Payment Service - Handles gem purchases and transactions
 * 
 * This service manages the payment flow, updates user gem balance,
 * and handles transaction records.
 */

import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { logger } from './logger.js';

const USERS_COLLECTION = 'users';

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

