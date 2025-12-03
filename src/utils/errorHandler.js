/**
 * Error Handler Utility
 * 
 * Converts Firebase and other errors into user-friendly messages
 */

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
    return error;
  }

  // Handle error objects
  if (error && typeof error === 'object') {
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

    // Return the error message if available
    if (errorMessage && errorMessage !== errorCode) {
      return errorMessage;
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
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password is too weak',
    'auth/invalid-email': 'Invalid email address',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Sign-in was cancelled',
    'auth/network-request-failed': 'Check your connection',
    'auth/requires-recent-login': 'Please sign in again to continue',
    'auth/operation-not-allowed': 'This operation is not allowed',
    'auth/user-disabled': 'This account has been disabled',
  };

  return authErrors[errorCode] || 'An authentication error occurred. Please try again.';
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

