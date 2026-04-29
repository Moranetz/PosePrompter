/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at startup
 * Provides type-safe access to environment variables
 */

import { logger } from '../utils/logger.js';

/**
 * Environment variable schema
 * Uses simple validation (can be enhanced with zod later)
 */
const ENV_SCHEMA = {
  // Firebase (required)
  VITE_FIREBASE_API_KEY: { required: true, type: 'string', minLength: 20 },
  VITE_FIREBASE_AUTH_DOMAIN: { required: true, type: 'string', minLength: 1 },
  VITE_FIREBASE_PROJECT_ID: { required: true, type: 'string', minLength: 1 },
  VITE_FIREBASE_STORAGE_BUCKET: { required: true, type: 'string', minLength: 1 },
  VITE_FIREBASE_MESSAGING_SENDER_ID: { required: true, type: 'string', minLength: 1 },
  VITE_FIREBASE_APP_ID: { required: true, type: 'string', minLength: 1 },
  
  // Optional Firebase
  VITE_FIREBASE_MEASUREMENT_ID: { required: false, type: 'string' },
  
  // API URL (optional, defaults to current origin)
  VITE_API_URL: { required: false, type: 'string' },
};

/**
 * Validates a single environment variable
 */
function validateEnvVar(key, config, value) {
  if (config.required && (!value || value.trim() === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (value && config.type === 'string' && config.minLength) {
    if (value.length < config.minLength) {
      throw new Error(`Environment variable ${key} is too short (minimum ${config.minLength} characters)`);
    }
  }

  return value;
}

/**
 * Validates all environment variables
 */
function validateEnvironment() {
  const errors = [];
  const validated = {};

  for (const [key, config] of Object.entries(ENV_SCHEMA)) {
    try {
      const value = import.meta.env[key];
      const validatedValue = validateEnvVar(key, config, value);
      
      if (validatedValue !== undefined) {
        validated[key] = validatedValue;
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    const errorMessage = `Environment variable validation failed:\n${errors.join('\n')}`;
    logger.error('[Env]', errorMessage);
    
    if (import.meta.env.DEV) {
      // In development, log warning but don't throw
      console.warn('[Env]', errorMessage);
      console.warn('[Env]', 'Please check your .env.local file');
    } else {
      // In production, throw to prevent app from running with invalid config
      throw new Error(errorMessage);
    }
  }

  return validated;
}

/**
 * Get validated environment variables
 */
const env = validateEnvironment();

/**
 * Get API base URL (with fallback)
 */
export const getApiUrl = () => {
  return env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;
};

/**
 * Get Firebase config
 */
export const getFirebaseConfig = () => {
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  };
};

// Export validated env object
export default env;

