/**
 * Image Generation Service - Unified API for Multiple AI Providers
 * 
 * This service provides a unified interface for generating images using multiple AI providers:
 * - Replicate (Flux Pro, SDXL)
 * - OpenAI (DALL-E 3)
 * 
 * Features:
 * - Credit checking and deduction
 * - Image storage in Firebase Storage
 * - Generation queue management
 * - Error handling and retries
 * - Generation history tracking
 */

import Replicate from 'replicate';
import OpenAI from 'openai';
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

// Initialize API clients (lazy initialization)
let replicateClient = null;
let openaiClient = null;

/**
 * Initialize Replicate client
 */
const getReplicateClient = () => {
  if (!replicateClient) {
    const apiToken = import.meta.env.VITE_REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN is not configured. Please add VITE_REPLICATE_API_TOKEN to your .env.local file.');
    }
    replicateClient = new Replicate({
      auth: apiToken,
    });
  }
  return replicateClient;
};

/**
 * Initialize OpenAI client
 */
const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured. Please add VITE_OPENAI_API_KEY to your .env.local file.');
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
};

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
 * Generate image with Flux Pro (Replicate)
 * 
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {number} [options.width=1024] - Image width
 * @param {number} [options.height=1024] - Image height
 * @param {number} [options.num_outputs=1] - Number of outputs
 * @returns {Promise<string>} Image URL
 */
const generateWithFlux = async (prompt, options = {}) => {
  const replicate = getReplicateClient();

  const {
    width = 1024,
    height = 1024,
    num_outputs = 1,
  } = options;

  try {
    logger.log('[imageGenerationService] Generating with Flux Pro...');
    
    const output = await replicate.run(
      "black-forest-labs/flux-pro",
      {
        input: {
          prompt: prompt,
          width: width,
          height: height,
          num_outputs: num_outputs,
        }
      }
    );

    // Replicate returns an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from Flux Pro');
    }

    logger.log('[imageGenerationService] Flux Pro generation successful');
    return imageUrl;
  } catch (error) {
    logger.error('[imageGenerationService] Flux Pro generation error:', error);
    
    // Handle specific error types
    if (error.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.message?.includes('invalid')) {
      throw new Error('Invalid prompt. Please try a different prompt.');
    } else if (error.message?.includes('quota') || error.message?.includes('billing')) {
      throw new Error('Service quota exceeded. Please contact support.');
    }
    
    throw new Error(`Flux Pro generation failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Generate image with SDXL (Replicate)
 * 
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {number} [options.width=1024] - Image width
 * @param {number} [options.height=1024] - Image height
 * @param {number} [options.num_outputs=1] - Number of outputs
 * @returns {Promise<string>} Image URL
 */
const generateWithSDXL = async (prompt, options = {}) => {
  const replicate = getReplicateClient();

  const {
    width = 1024,
    height = 1024,
    num_outputs = 1,
  } = options;

  try {
    logger.log('[imageGenerationService] Generating with SDXL...');
    
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          width: width,
          height: height,
          num_outputs: num_outputs,
        }
      }
    );

    // Replicate returns an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from SDXL');
    }

    logger.log('[imageGenerationService] SDXL generation successful');
    return imageUrl;
  } catch (error) {
    logger.error('[imageGenerationService] SDXL generation error:', error);
    
    // Handle specific error types
    if (error.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.message?.includes('invalid')) {
      throw new Error('Invalid prompt. Please try a different prompt.');
    } else if (error.message?.includes('quota') || error.message?.includes('billing')) {
      throw new Error('Service quota exceeded. Please contact support.');
    }
    
    throw new Error(`SDXL generation failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Generate image with DALL-E 3 (OpenAI)
 * 
 * @param {string} prompt - Full prompt text
 * @param {Object} options - Generation options
 * @param {string} [options.size='1024x1024'] - Image size (1024x1024, 1792x1024, 1024x1792)
 * @param {string} [options.quality='hd'] - Image quality (standard, hd)
 * @returns {Promise<string>} Image URL
 */
const generateWithDALLE3 = async (prompt, options = {}, userId = null) => {
  const openai = getOpenAIClient();

  const {
    size = '1024x1024',
    quality = 'hd',
  } = options;

  try {
    logger.log('[imageGenerationService] Generating with DALL-E 3...');
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: size,
      quality: quality,
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E 3');
    }

    logger.log('[imageGenerationService] DALL-E 3 generation successful');
    return imageUrl;
  } catch (error) {
    logger.error('[imageGenerationService] DALL-E 3 generation error:', error);
    
    // Report error to user's account for debugging
    if (userId) {
      try {
        const { reportError } = await import('./errorReportingService.js');
        await reportError(userId, error, {
          component: 'imageGenerationService',
          action: 'generateWithDALLE3',
          metadata: { provider: 'dalle3' },
        });
      } catch (reportErr) {
        // Don't break on reporting errors
        logger.warn('[imageGenerationService] Failed to report error:', reportErr);
      }
    }
    
    // Handle specific error types
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.status === 400) {
      throw new Error('Invalid prompt. DALL-E 3 has content policy restrictions.');
    } else if (error.status === 402) {
      throw new Error('Insufficient API credits. Please contact support.');
    }
    
    // Sanitize error message to remove Request IDs
    const sanitizedMessage = sanitizeErrorMessage(error);
    throw new Error(`DALL-E 3 generation failed: ${sanitizedMessage}`);
  }
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
  try {
    logger.log('[imageGenerationService] Generating with Nano Banana Pro...');
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    // Get auth token
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider: 'nanobanana',
        prompt: prompt,
        options: options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new Error('No image URL returned from Nano Banana Pro');
    }

    logger.log('[imageGenerationService] Nano Banana Pro generation successful');
    return data.imageUrl;
  } catch (error) {
    logger.error('[imageGenerationService] Nano Banana Pro generation error:', error);
    throw new Error(`Nano Banana Pro generation failed: ${error.message || 'Unknown error'}`);
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
  let imageUrl = null;
  let creditsDeducted = false;

  try {
    // Call provider-specific function
    switch (provider) {
      case PROVIDERS.FLUX:
        imageUrl = await generateWithFlux(prompt, options);
        break;
      case PROVIDERS.SDXL:
        imageUrl = await generateWithSDXL(prompt, options);
        break;
      case PROVIDERS.DALLE3:
        imageUrl = await generateWithDALLE3(prompt, options, userId);
        break;
      case PROVIDERS.NANOBANANA:
        // Nano Banana Pro uses backend API
        imageUrl = await generateWithNanoBanana(prompt, options, userId);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Upload to Firebase Storage
    const imageId = `img_${Date.now()}_${userId}`;
    const firebaseUrl = await uploadToFirebaseStorage(userId, imageUrl, imageId);

    // Deduct credits after successful generation
    const deductionResult = await deductCredits(userId, provider, firebaseUrl, prompt);
    creditsDeducted = true;

    return {
      imageUrl: firebaseUrl,
      provider,
      cost: CREDIT_COSTS[provider],
      metadata: {
        originalUrl: imageUrl,
        imageId,
        transactionId: deductionResult.transactionId,
        newBalance: deductionResult.newBalance,
        options,
      },
    };
  } catch (error) {
    // Refund credits if generation failed but credits were deducted
    if (creditsDeducted) {
      await refundCredits(userId, provider, CREDIT_COSTS[provider]);
    }

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
export const isProviderAvailable = (provider) => {
  switch (provider) {
    case PROVIDERS.FLUX:
    case PROVIDERS.SDXL:
      return !!import.meta.env.VITE_REPLICATE_API_TOKEN;
    case PROVIDERS.DALLE3:
      return !!import.meta.env.VITE_OPENAI_API_KEY;
    case PROVIDERS.NANOBANANA:
      // Nano Banana Pro uses backend API, so check if backend is available
      return !!import.meta.env.VITE_API_BASE_URL;
    default:
      return false;
  }
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

