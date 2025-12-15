/**
 * Error Handler Utility
 * 
 * Converts Firebase and other errors into user-friendly messages
 */

/**
 * Sanitizes error messages to remove Request IDs and other sensitive information
 * @param {string} message - The error message to sanitize
 * @returns {string} Sanitized error message safe for user display
 */
const sanitizeErrorMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return message;
  }
  
  // Remove Request ID patterns from error message
  // Pattern: "Request ID: <uuid>" or "request_id: <uuid>" or just the UUID pattern
  const requestIdPatterns = [
    /Request ID:\s*[a-f0-9-]{36}/gi,
    /request_id:\s*[a-f0-9-]{36}/gi,
    /requestId:\s*[a-f0-9-]{36}/gi,
    /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi,
  ];
  
  let sanitized = message;
  requestIdPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '').trim();
  });
  
  // Clean up any double spaces or trailing punctuation
  sanitized = sanitized.replace(/\s+/g, ' ').replace(/[.,;:]\s*$/, '').trim();
  
  return sanitized;
};

/**
 * Gets a user-friendly error message from various error types
 * @param {Error|string|Object} error - The error object, message, or code
 * @returns {string} User-friendly error message
 */
import { logger } from './logger.js';

export const getErrorMessage = (error) => {
  logger.log('[ErrorHandler] Processing error:', error);

  // Handle string errors
  if (typeof error === 'string') {
    return sanitizeErrorMessage(error);
  }

  // Handle error objects
  if (error && typeof error === 'object') {
    // Log Request ID server-side only (if present) for debugging
    if (error.request_id || error.headers?.['x-request-id']) {
      logger.error('[ErrorHandler] Request ID detected (server-side only):', {
        requestId: error.request_id || error.headers?.['x-request-id'],
        message: error.message,
      });
    }
    
    const errorCode = error.code || error.message || '';
    const errorMessage = error.message || '';

    // Firebase Auth errors
    if (errorCode.startsWith('auth/')) {
      return getAuthErrorMessage(errorCode);
    }

    // Firebase Firestore errors
    if (errorCode.startsWith('firestore/') || errorCode.includes('permission-denied')) {
      return getFirestoreErrorMessage(errorCode, errorMessage);
    }

    // Firebase Storage errors
    if (errorCode.startsWith('storage/')) {
      return getStorageErrorMessage(errorCode, errorMessage);
    }

    // API configuration errors (check before network errors)
    if (
      errorMessage.includes('API not configured') ||
      errorMessage.includes('not configured') ||
      errorMessage.includes('API key') ||
      errorMessage.includes('REPLICATE_API_TOKEN') ||
      errorMessage.includes('OPENAI_API_KEY')
    ) {
      return errorMessage || 'AI service API is not configured. Please configure the API keys in the server settings.';
    }

    // Network errors
    if (
      errorCode.includes('network') ||
      errorCode.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError')
    ) {
      return 'Check your connection';
    }

    // Permission errors
    if (
      errorCode.includes('permission') ||
      errorCode.includes('unauthorized') ||
      errorMessage.includes('permission') ||
      errorMessage.includes('unauthorized')
    ) {
      return 'Please sign in to do that';
    }

    // Not found errors
    if (
      errorCode.includes('not-found') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('does not exist')
    ) {
      return 'Package not found';
    }

    // Invalid data errors
    if (
      errorCode.includes('invalid') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('Invalid')
    ) {
      return 'Please check your input';
    }

    // Return the sanitized error message if available
    if (errorMessage && errorMessage !== errorCode) {
      return sanitizeErrorMessage(errorMessage);
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Gets user-friendly messages for Firebase Auth errors
 */
const getAuthErrorMessage = (errorCode) => {
  const authErrors = {
    'auth/user-not-found': 'No account found with this email address',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/invalid-login-credentials': 'Invalid email or password. Please check your credentials and try again.',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password is too weak',
    'auth/invalid-email': 'Invalid email address',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Sign-in was cancelled',
    'auth/network-request-failed': 'Check your connection',
    'auth/requires-recent-login': 'Please sign in again to continue',
    'auth/operation-not-allowed': 'This operation is not allowed. Check Firebase Console → Authentication → Sign-in method and enable this provider.',
    'auth/user-disabled': 'This account has been disabled',
    'auth/unauthorized-domain': 'This domain is not authorized. Add it in Firebase Console → Project Settings → Authorized domains',
    'auth/api-key-not-valid': 'API key is invalid. Check your .env.local file and API key restrictions in Google Cloud Console.',
    'auth/invalid-api-key': 'API key is invalid or restricted. Check Google Cloud Console → APIs & Services → Credentials.',
    'auth/configuration-not-found': 'Firebase configuration error. Check your .env.local file.',
    'auth/domain-config-required': 'Domain configuration required. Check Firebase Console → Project Settings → Authorized domains.',
  };

  // In development, include the error code for debugging
  const baseMessage = authErrors[errorCode] || 'An authentication error occurred. Please try again.';
  if (import.meta.env.DEV && errorCode) {
    return `${baseMessage} (Error: ${errorCode})`;
  }
  return baseMessage;
};

/**
 * Gets user-friendly messages for Firestore errors
 */
const getFirestoreErrorMessage = (errorCode, errorMessage) => {
  if (errorCode.includes('permission-denied') || errorMessage.includes('permission')) {
    return 'Please sign in to do that';
  }

  if (errorCode.includes('not-found') || errorMessage.includes('not found')) {
    return 'Package not found';
  }

  if (errorCode.includes('unavailable') || errorMessage.includes('unavailable')) {
    return 'Check your connection';
  }

  if (errorCode.includes('deadline-exceeded') || errorMessage.includes('deadline')) {
    return 'Request timed out. Please try again.';
  }

  if (errorCode.includes('invalid-argument') || errorMessage.includes('invalid')) {
    return 'Please check your input';
  }

  if (errorCode.includes('already-exists') || errorMessage.includes('already exists')) {
    return 'This item already exists';
  }

  if (errorCode.includes('failed-precondition') || errorMessage.includes('precondition')) {
    return 'Please try again';
  }

  if (errorCode.includes('out-of-range') || errorMessage.includes('out of range')) {
    return 'Please check your input';
  }

  if (errorCode.includes('unimplemented') || errorMessage.includes('unimplemented')) {
    return 'This feature is not available yet';
  }

  if (errorCode.includes('internal') || errorMessage.includes('internal')) {
    return 'An internal error occurred. Please try again.';
  }

  return 'A database error occurred. Please try again.';
};

/**
 * Gets user-friendly messages for Storage errors
 */
const getStorageErrorMessage = (errorCode, errorMessage) => {
  if (errorCode.includes('unauthorized') || errorMessage.includes('unauthorized')) {
    return 'Please sign in to do that';
  }

  if (errorCode.includes('canceled') || errorMessage.includes('canceled')) {
    return 'Upload was cancelled';
  }

  if (errorCode.includes('unknown') || errorMessage.includes('unknown')) {
    return 'An unknown error occurred during upload';
  }

  if (errorCode.includes('invalid-argument') || errorMessage.includes('invalid')) {
    return 'Please check your input';
  }

  if (errorCode.includes('not-found') || errorMessage.includes('not found')) {
    return 'File not found';
  }

  if (errorCode.includes('quota-exceeded') || errorMessage.includes('quota')) {
    return 'Storage quota exceeded. Please delete some files.';
  }

  if (errorCode.includes('unauthenticated') || errorMessage.includes('unauthenticated')) {
    return 'Please sign in to do that';
  }

  return 'Failed to upload image. Please try again.';
};

/**
 * Wraps an async function with error handling
 * @param {Function} fn - The async function to wrap
 * @param {string} context - Context for logging (e.g., 'saveCustomOption')
 * @returns {Function} Wrapped function that returns user-friendly errors
 */
export const withErrorHandling = (fn, context) => {
  return async (...args) => {
    try {
      logger.log(`[${context}] Starting operation with args:`, args);
      const result = await fn(...args);
      logger.log(`[${context}] Operation completed successfully`);
      return result;
    } catch (error) {
      logger.error(`[${context}] Error occurred:`, error);
      const friendlyMessage = getErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  };
};

