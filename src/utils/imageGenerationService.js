/**
 * Image Generation Service - Unified API for Multiple AI Providers
 * 
 * This service provides a unified interface for generating images using multiple AI providers:
 * - Replicate (Flux Pro, SDXL)
 * - OpenAI (GPT Image 2 Medium)
 * 
 * Features:
 * - Credit checking and deduction
 * - Image storage in Firebase Storage
 * - Generation queue management
 * - Error handling and retries
 * - Generation history tracking
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  increment, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { storage, db } from '../firebase-config';
import { logger } from './logger.js';
import { getGemBalance } from './paymentService.js';

/**
 * Sanitizes error messages to remove Request IDs and other sensitive information
 * @param {Error|string|Object} error - The error object, message, or code
 * @returns {string} Sanitized error message safe for user display
 */
const sanitizeErrorMessage = (error) => {
  let errorMessage = '';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    // Extract message from error object
    errorMessage = error.message || error.error?.message || JSON.stringify(error);
  }
  
  // Remove Request ID patterns from error message
  // Pattern: "Request ID: <uuid>" or "request_id: <uuid>" or just the UUID pattern
  const requestIdPatterns = [
    /Request ID:\s*[a-f0-9-]{36}/gi,
    /request_id:\s*[a-f0-9-]{36}/gi,
    /requestId:\s*[a-f0-9-]{36}/gi,
    /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi,
  ];
  
  let sanitized = errorMessage;
  requestIdPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '').trim();
  });
  
  // Clean up any double spaces or trailing punctuation
  sanitized = sanitized.replace(/\s+/g, ' ').replace(/[.,;:]\s*$/, '').trim();
  
  // If message is empty after sanitization, provide a generic message
  if (!sanitized) {
    sanitized = 'An error occurred. Please try again.';
  }
  
  return sanitized;
};

// Provider names
export const PROVIDERS = {
  FLUX: 'flux',
  SDXL: 'sdxl',
  DALLE3: 'dalle3',
  NANOBANANA: 'nanobanana' // Nano Banana Pro (Gemini)
};

// Credit costs per provider (in gems)
const CREDIT_COSTS = {
  [PROVIDERS.FLUX]: 10,
  [PROVIDERS.SDXL]: 8,
  [PROVIDERS.DALLE3]: 12,
  [PROVIDERS.NANOBANANA]: 15 // Nano Banana Pro - premium quality
};

// Collection names
const USERS_COLLECTION = 'users';
const GENERATION_HISTORY_COLLECTION = 'generationHistory';
const GENERATION_QUEUE_COLLECTION = 'generationQueue';

// All image generation now goes through the backend API
// This ensures API keys stay secure on the server

/**
 * Check if user has enough credits for a generation
 * 
 * @param {string} userId - User ID
 * @param {string} provider - Provider name (flux, sdxl, dalle3)
 * @returns {Promise<{hasCredits: boolean, remainingCredits: number, requiredCredits: number}>}
 */
export const checkCredits = async (userId, provider) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized');
  }

  const requiredCredits = CREDIT_COSTS[provider];
  if (!requiredCredits) {
    throw new Error(`Invalid provider: ${provider}`);
  }

  try {
    const currentBalance = await getGemBalance(userId);
    const hasCredits = currentBalance >= requiredCredits;

    return {
      hasCredits,
      remainingCredits: currentBalance,
      requiredCredits,
    };
  } catch (error) {
    logger.error('[imageGenerationService] Error checking credits:', error);
    throw error;
  }
};

/**
 * Deduct credits after successful generation
 * 
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {string} imageUrl - Generated image URL
 * @param {string} prompt - Prompt used
 * @returns {Promise<{newBalance: number, transactionId: string}>}
 */
export const deductCredits = async (userId, provider, imageUrl, prompt) => {
  if (!userId || !provider || !imageUrl) {
    throw new Error('User ID, provider, and image URL are required');
  }

  if (!db) {
    throw new Error('Firestore database is not initialized');
  }

  const cost = CREDIT_COSTS[provider];
  if (!cost) {
    throw new Error(`Invalid provider: ${provider}`);
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User profile does not exist');
    }

    const userData = userSnap.data();
    const currentBalance = userData.gems || 0;

    if (currentBalance < cost) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await updateDoc(userRef, {
      gems: increment(-cost),
      updatedAt: serverTimestamp(),
    });

    const newBalance = currentBalance - cost;
    const transactionId = `img_${Date.now()}_${userId}`;

    // Log to generation history
    await addDoc(collection(db, GENERATION_HISTORY_COLLECTION), {
      userId,
      provider,
      imageUrl,
      prompt: prompt.substring(0, 500), // Limit prompt length
      cost,
      transactionId,
      createdAt: serverTimestamp(),
    });

    logger.log('[imageGenerationService] Credits deducted:', {
      userId,
      provider,
      cost,
      newBalance,
      transactionId,
    });

    return {
      newBalance,
      transactionId,
    };
  } catch (error) {
    logger.error('[imageGenerationService] Error deducting credits:', error);
    throw error;
  }
};

/**
 * Refund credits if generation fails
 * 
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {number} amount - Amount to refund
 * @returns {Promise<void>}
 */
const refundCredits = async (userId, provider, amount) => {
  if (!userId || !amount) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      gems: increment(amount),
      updatedAt: serverTimestamp(),
    });

    logger.log('[imageGenerationService] Credits refunded:', {
      userId,
      provider,
      amount,
    });
  } catch (error) {
    logger.error('[imageGenerationService] Error refunding credits:', error);
  }
};

/**
 * Upload image to Firebase Storage
 * 
 * @param {string} userId - User ID
 * @param {string|Blob} imageData - Image URL or Blob
 * @param {string} imageId - Unique image ID
 * @returns {Promise<string>} Firebase Storage URL
 */
const uploadToFirebaseStorage = async (userId, imageData, imageId) => {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    let blob;
    
    // If imageData is a URL, fetch it first
    if (typeof imageData === 'string') {
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      blob = await response.blob();
    } else {
      blob = imageData;
    }

    // Upload to Firebase Storage
    const fileName = `users/${userId}/generations/${imageId}.png`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, blob, {
      contentType: 'image/png',
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    logger.log('[imageGenerationService] Image uploaded to Firebase Storage:', fileName);
    
    return downloadURL;
  } catch (error) {
    logger.error('[imageGenerationService] Error uploading to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Generate image with Flux Pro via backend API
 * 
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Backend response with imageUrl, cost, newBalance, etc.
 */
const generateWithFlux = async (prompt, options = {}, userId = null) => {
  return generateViaBackend('flux', prompt, options, userId);
};

/**
 * Generate image with SDXL via backend API
 * 
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {string} userId - User ID
 * @returns {Promise<string>} Image URL
 */
const generateWithSDXL = async (prompt, options = {}, userId = null) => {
  return generateViaBackend('sdxl', prompt, options, userId);
};

/**
 * Generate image with OpenAI GPT Image 2 Medium via backend API
 * 
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {string} userId - User ID
 * @returns {Promise<string>} Image URL
 */
const generateWithDALLE3 = async (prompt, options = {}, userId = null) => {
  return generateViaBackend('dalle3', prompt, options, userId);
};

/**
 * Generate image with Nano Banana Pro (Gemini) via backend API
 * 
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {string} userId - User ID
 * @returns {Promise<string>} Image URL
 */
const generateWithNanoBanana = async (prompt, options = {}, userId = null) => {
  return generateViaBackend('nanobanana', prompt, options, userId);
};

/**
 * Unified backend API call for all image generation providers
 * 
 * @param {string} provider - Provider name (flux, sdxl, dalle3, nanobanana)
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {string} userId - User ID
 * @returns {Promise<string>} Image URL
 */
const generateViaBackend = async (provider, prompt, options = {}, userId = null) => {
  try {
    logger.log(`[imageGenerationService] Generating with ${provider} via backend...`);
    
    // Use centralized API client
    const apiClient = (await import('../api/client.js')).default;
    
    // Call backend API using centralized client
    const response = await apiClient.post('/generate-image', {
      provider: provider,
      prompt: prompt,
      options: options,
    });

    const data = response.data;
    
    if (!data.imageUrl) {
      throw new Error(`No image URL returned from ${provider}`);
    }

    logger.log(`[imageGenerationService] ${provider} generation successful`, {
      imageUrl: data.imageUrl,
      cost: data.cost,
      newBalance: data.newBalance,
      numOutputs: data.numOutputs,
    });
    
    // Backend already handled:
    // - Credit deduction (data.newBalance is updated)
    // - Firebase Storage upload (data.imageUrl is Firebase URL)
    // - Generation history logging (data.generationId)
    
    // Return the full response data so caller can access cost, newBalance, etc.
    return {
      imageUrl: data.imageUrl,
      cost: data.cost || CREDIT_COSTS[provider],
      newBalance: data.newBalance,
      generationId: data.generationId,
      metadata: data.metadata || {},
    };
  } catch (error) {
    // Report error to user's account for debugging
    if (userId) {
      try {
        const { reportError } = await import('./errorReportingService.js');
        await reportError(userId, error, {
          component: 'imageGenerationService',
          action: 'generateViaBackend',
          metadata: { provider, status: error.status },
        });
      } catch (reportErr) {
        // Don't break on reporting errors
        logger.warn('[imageGenerationService] Failed to report error:', reportErr);
      }
    }
    
    logger.error(`[imageGenerationService] ${provider} generation error:`, error);
    throw error;
  }
};

/**
 * Add job to generation queue
 * 
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {string} prompt - Prompt text
 * @param {Object} options - Generation options
 * @returns {Promise<{queueId: string, position: number}>}
 */
const addToQueue = async (userId, provider, prompt, options) => {
  if (!db) {
    throw new Error('Firestore database is not initialized');
  }

  try {
    // Get current queue length
    const queueQuery = query(
      collection(db, GENERATION_QUEUE_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    const queueSnapshot = await getDocs(queueQuery);
    const position = queueSnapshot.size + 1;

    // Add to queue
    const queueDoc = await addDoc(collection(db, GENERATION_QUEUE_COLLECTION), {
      userId,
      provider,
      prompt: prompt.substring(0, 500),
      options,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return {
      queueId: queueDoc.id,
      position,
    };
  } catch (error) {
    logger.error('[imageGenerationService] Error adding to queue:', error);
    throw error;
  }
};

/**
 * Get queue position for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<{position: number, estimatedWaitTime: number}>}
 */
export const getQueuePosition = async (userId) => {
  if (!db || !userId) {
    return { position: 0, estimatedWaitTime: 0 };
  }

  try {
    // Get user's pending jobs
    const userQueueQuery = query(
      collection(db, GENERATION_QUEUE_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc'),
      limit(1)
    );
    const userQueueSnapshot = await getDocs(userQueueQuery);

    if (userQueueSnapshot.empty) {
      return { position: 0, estimatedWaitTime: 0 };
    }

    const userJob = userQueueSnapshot.docs[0];
    const userJobTime = userJob.data().createdAt?.toMillis() || Date.now();

    // Get all pending jobs before this one
    const allPendingQuery = query(
      collection(db, GENERATION_QUEUE_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    const allPendingSnapshot = await getDocs(allPendingQuery);

    let position = 0;
    allPendingSnapshot.docs.forEach((doc, index) => {
      if (doc.id === userJob.id) {
        position = index + 1;
      }
    });

    // Estimate wait time (assume 30 seconds per generation)
    const estimatedWaitTime = (position - 1) * 30;

    return {
      position,
      estimatedWaitTime,
    };
  } catch (error) {
    logger.error('[imageGenerationService] Error getting queue position:', error);
    return { position: 0, estimatedWaitTime: 0 };
  }
};

/**
 * Main image generation function
 * 
 * @param {string} provider - Provider name (flux, sdxl, dalle3)
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {string} userId - User ID (required for credit deduction)
 * @param {boolean} [useQueue=false] - Whether to use queue system
 * @returns {Promise<{imageUrl: string, provider: string, cost: number, metadata: Object}>}
 */
export const generateImage = async (provider, prompt, options = {}, userId = null, useQueue = false) => {
  if (!provider || !prompt) {
    throw new Error('Provider and prompt are required');
  }

  if (!userId) {
    throw new Error('User ID is required for credit checking');
  }

  // Validate provider
  if (!Object.values(PROVIDERS).includes(provider)) {
    throw new Error(`Invalid provider: ${provider}. Must be one of: ${Object.values(PROVIDERS).join(', ')}`);
  }

  // Check credits before generation
  const creditCheck = await checkCredits(userId, provider);
  if (!creditCheck.hasCredits) {
    throw new Error(
      `Insufficient credits. Required: ${creditCheck.requiredCredits}, Available: ${creditCheck.remainingCredits}`
    );
  }

  // If using queue, add to queue and return queue info
  if (useQueue) {
    const queueInfo = await addToQueue(userId, provider, prompt, options);
    return {
      queued: true,
      queueId: queueInfo.queueId,
      position: queueInfo.position,
      message: `Image generation queued. Position: ${queueInfo.position}`,
    };
  }

  // Generate image directly
  // NOTE: All providers now go through backend API which handles:
  // - Credit deduction (atomic, prevents race conditions)
  // - Firebase Storage upload
  // - Generation history logging
  // Frontend should NOT duplicate these operations
  
  try {
    let backendResponse = null;
    
    // Call provider-specific function (all go through backend API)
    // Backend handles: credit deduction, storage upload, history logging
    switch (provider) {
      case PROVIDERS.FLUX:
        backendResponse = await generateWithFlux(prompt, options, userId);
        break;
      case PROVIDERS.SDXL:
        backendResponse = await generateWithSDXL(prompt, options, userId);
        break;
      case PROVIDERS.DALLE3:
        backendResponse = await generateWithDALLE3(prompt, options, userId);
        break;
      case PROVIDERS.NANOBANANA:
        // Nano Banana Pro uses backend API
        backendResponse = await generateWithNanoBanana(prompt, options, userId);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Backend already:
    // 1. Uploaded image to Firebase Storage
    // 2. Deducted credits atomically (prevents race conditions)
    // 3. Logged to generation history
    // 4. Returned imageUrl, cost, newBalance, generationId, etc.
    
    // Handle both old format (just imageUrl string) and new format (object with full data)
    const imageUrl = typeof backendResponse === 'string' 
      ? backendResponse 
      : backendResponse.imageUrl;
    
    const cost = typeof backendResponse === 'object' && backendResponse.cost
      ? backendResponse.cost
      : CREDIT_COSTS[provider];
    
    const newBalance = typeof backendResponse === 'object' && backendResponse.newBalance
      ? backendResponse.newBalance
      : null;

    return {
      imageUrl: imageUrl, // Already in Firebase Storage from backend
      provider,
      cost: cost, // Actual cost from backend (baseCost * numOutputs)
      metadata: {
        originalUrl: imageUrl,
        options,
        newBalance: newBalance,
        generationId: typeof backendResponse === 'object' ? backendResponse.generationId : null,
      },
    };
  } catch (error) {
    // Backend handles all refunds automatically if generation fails
    // No need for frontend refund logic

    // Report error to user's account for debugging
    if (userId) {
      try {
        const { reportError } = await import('./errorReportingService.js');
        await reportError(userId, error, {
          component: 'imageGenerationService',
          action: 'generateImage',
          metadata: { provider, prompt: prompt.substring(0, 100) },
        });
      } catch (reportErr) {
        // Don't break on reporting errors
        logger.warn('[imageGenerationService] Failed to report error:', reportErr);
      }
    }

    logger.error('[imageGenerationService] Generation error:', error);
    throw error;
  }
};

/**
 * Get generation history for a user
 * 
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Generation history
 */
export const getGenerationHistory = async (userId, limitCount = 50) => {
  if (!db || !userId) {
    return [];
  }

  try {
    const historyQuery = query(
      collection(db, GENERATION_HISTORY_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(historyQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    logger.error('[imageGenerationService] Error getting generation history:', error);
    return [];
  }
};

/**
 * Check if a provider is available (API key configured)
 * 
 * @param {string} provider - Provider name
 * @returns {boolean}
 */
// Cache for provider availability
let availabilityCache = null;
let availabilityCacheTime = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Check if a provider is available (synchronous check with cached backend health)
 * 
 * @param {string} provider - Provider name
 * @returns {boolean}
 */
export const isProviderAvailable = (provider) => {
  // All providers now use backend API, so check if backend URL is configured
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  
  if (!API_BASE_URL) {
    return false;
  }
  
  // For now, assume all providers are available if backend is configured
  // The actual availability will be checked when generating
  // This allows the UI to show all options, and errors will be handled during generation
  return true;
};

/**
 * Check provider availability from backend (async, for more accurate checks)
 * 
 * @param {string} provider - Provider name
 * @returns {Promise<boolean>}
 */
export const checkProviderAvailability = async (provider) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  
  if (!API_BASE_URL) {
    return false;
  }
  
  // Use cache if available and fresh
  const now = Date.now();
  if (availabilityCache && (now - availabilityCacheTime) < CACHE_DURATION) {
    return availabilityCache[provider] || false;
  }
  
  // Fetch fresh availability from backend
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (response.ok) {
      const health = await response.json();
      availabilityCache = {
        [PROVIDERS.FLUX]: health.replicate === true,
        [PROVIDERS.SDXL]: health.replicate === true,
        [PROVIDERS.DALLE3]: health.openai === true,
        [PROVIDERS.NANOBANANA]: health.gemini === true,
      };
      availabilityCacheTime = now;
      return availabilityCache[provider] || false;
    }
  } catch (error) {
    logger.warn('[imageGenerationService] Could not check provider availability:', error);
  }
  
  // Fallback: assume available if backend URL is configured
  return true;
};

/**
 * Get credit cost for a provider
 * 
 * @param {string} provider - Provider name
 * @returns {number} Credit cost
 */
export const getProviderCost = (provider) => {
  return CREDIT_COSTS[provider] || 0;
};
