/**
 * AI Image Generation Service
 * 
 * This service handles AI image generation using face photos and prompts.
 * Uses the backend API endpoint for face photo generation.
 */

import { getAuth } from 'firebase/auth';
import { logger } from './logger.js';

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

    // Use centralized API client
    const apiClient = (await import('../api/client.js')).default;
    
    // Call backend API with face photo using centralized client
    // Use InstantID for dedicated face-preserving generation
    const response = await apiClient.post('/generate-image', {
      provider: 'instantid',
      prompt: prompt,
      facePhotoUrl: facePhotoUrl,
      options: {
        face_strength: 0.8,
        pose_strength: 0.8,
        steps: 30,
        guidance: 5,
      },
    });

    // Check if response has data property (from axios/fetch wrapper)
    let data;
    if (response.data) {
      data = response.data;
    } else {
      // Fallback: try to parse as JSON
      data = await response.json();
    }

    if (!data || !data.imageUrl) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}` || 'No image URL returned from server';
      
      logger.error('[aiImageService] Generation failed:', errorMessage);
      return {
        success: false,
        error: errorMessage
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

