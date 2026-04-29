/**
 * Custom Hook: useImageGeneration
 * 
 * Encapsulates image generation business logic
 * Provides loading state, error handling, and generation function
 */

import { useState, useCallback } from 'react';
import { logger } from '../utils/logger.js';
import apiClient from '../api/client.js';
import { useAuth } from '../contexts/UserContext.jsx';
import { trackEvent } from '../posthog.js';

export function useImageGeneration() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generationHistory, setGenerationHistory] = useState([]);

  /**
   * Generate image(s) using the backend API
   */
  const generateImage = useCallback(async (params) => {
    if (!user) {
      throw new Error('User must be authenticated to generate images');
    }

    setLoading(true);
    setError(null);

    try {
      const {
        prompt,
        model = 'flux',
        numVariations = 1,
        advancedOptions = {},
        facePhotoUrl = null,
      } = params;

      if (!prompt || prompt.trim() === '') {
        throw new Error('Prompt is required');
      }

      logger.log('[useImageGeneration] Generating image:', { model, numVariations, promptLength: prompt.length });

      // Call backend API
      const response = await apiClient.post('/generate-image', {
        prompt,
        model,
        numVariations,
        ...advancedOptions,
        facePhotoUrl,
      });

      const { imageUrl, images, cost, newBalance } = response.data;

      // Update state
      const newImages = images || (imageUrl ? [imageUrl] : []);
      setGeneratedImages(prev => [...newImages, ...prev]);
      
      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        prompt,
        model,
        images: newImages,
        cost,
        newBalance,
        timestamp: new Date(),
      };
      setGenerationHistory(prev => [historyEntry, ...prev]);

      logger.log('[useImageGeneration] Image generated successfully:', { cost, newBalance });

      trackEvent('image_generated', {
        model,
        num_variations: numVariations,
        prompt_length: prompt.length,
        cost,
        new_balance: newBalance,
        has_face_photo: !!facePhotoUrl,
      });

      return {
        images: newImages,
        cost,
        newBalance,
        historyEntry,
      };
    } catch (err) {
      const errorMessage = err.userMessage || err.message || 'Failed to generate image';
      setError(errorMessage);
      logger.error('[useImageGeneration] Error:', err);

      trackEvent('image_generation_failed', {
        model,
        error: errorMessage,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Clear generated images
   */
  const clearImages = useCallback(() => {
    setGeneratedImages([]);
    setError(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateImage,
    loading,
    error,
    generatedImages,
    generationHistory,
    clearImages,
    clearError,
  };
}

