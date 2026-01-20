/**
 * AI Image Generation Service
 * 
 * This service handles AI image generation using face photos and prompts.
 * Uses the backend API endpoint for face photo generation.
 */

import { getAuth } from 'firebase/auth';
import { logger } from './logger.js';
import { getApiBaseUrl } from './apiConfig.js';

/**
 * Generate an AI image using a face photo and prompt
 * 
 * @param {Object} params
 * @param {string} params.facePhotoUrl - URL of the uploaded face photo
 * @param {string} params.prompt - The prompt text to use for generation
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export const generateAIImage = async ({ facePhotoUrl, prompt }) => {
  try {
    if (!facePhotoUrl || !prompt) {
      return {
        success: false,
        error: 'Face photo URL and prompt are required'
      };
    }

    logger.log('[aiImageService] Generating image with face photo:', {
      facePhotoUrl: facePhotoUrl.substring(0, 100) + '...',
      prompt: prompt.substring(0, 100) + '...'
    });

    const API_BASE_URL = getApiBaseUrl();
    
    // Get auth token
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }
    const token = await user.getIdToken();
    
    // Call backend API with face photo
    const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider: 'flux', // Use Flux for face photo generation
        prompt: prompt,
        facePhotoUrl: facePhotoUrl,
        options: {
          width: 1024,
          height: 1024,
          num_outputs: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      
      logger.error('[aiImageService] Generation failed:', errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      return {
        success: false,
        error: 'No image URL returned from server'
      };
    }

    logger.log('[aiImageService] Generation successful');
    return {
      success: true,
      imageUrl: data.imageUrl
    };
    
  } catch (error) {
    logger.error('[aiImageService] Error generating AI image:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image. Please try again.'
    };
  }
};

/**
 * Check if AI image generation is available
 * @returns {boolean}
 */
export const isAIGenerationAvailable = () => {
  // Face photo generation is available if backend API is accessible
  // The backend will check if Replicate API is configured
  return true;
};

