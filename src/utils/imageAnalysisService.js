/**
 * Image Analysis Service
 *
 * Sends an image to the backend for AI vision analysis and returns
 * a detailed prompt describing the image. The backend should implement
 * a POST /analyze-image endpoint that accepts an image (URL or base64)
 * and returns a structured prompt.
 *
 * Expected backend contract:
 *   POST /analyze-image
 *   Body: { imageData: string (base64), mimeType: string }
 *   Response: { prompt: string, title: string, tags?: string[] }
 */

import apiClient from '../api/client.js';
import { logger } from './logger.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate an image file before sending for analysis.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Please use JPG, PNG, or WebP.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File is too large. Maximum size is 5 MB.' };
  }
  return { valid: true };
}

/**
 * Convert a File to a base64 data string.
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<mime>;base64,<data>" — extract the data portion
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Send an image to the backend for analysis and receive a detailed prompt.
 *
 * @param {File} file - The image file to analyze
 * @param {Object} [options]
 * @param {string} [options.category] - Hint about which category the prompt is for
 * @param {AbortSignal} [options.signal] - Optional abort signal
 * @returns {Promise<{ prompt: string, title: string }>}
 */
export async function analyzeImage(file, options = {}) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  logger.log('[ImageAnalysis] Analyzing image:', file.name, file.type, file.size);

  const base64 = await fileToBase64(file);

  const response = await apiClient.post(
    '/analyze-image',
    {
      imageData: base64,
      mimeType: file.type,
      category: options.category || null,
    },
    {
      timeout: 60000, // Vision analysis can take longer
      signal: options.signal,
    }
  );

  const { prompt, title } = response.data;

  if (!prompt) {
    throw new Error('No prompt was generated. Please try a different image.');
  }

  return {
    prompt: prompt.trim(),
    title: (title || '').trim() || 'Analyzed Image',
  };
}
