/**
 * Input Validation Utilities
 * 
 * Provides validation functions for user inputs
 * Can be enhanced with zod or yup later
 */

/**
 * Validates package data
 */
export function validatePackage(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Package name is required');
  } else if (data.name.length > 100) {
    errors.push('Package name must be 100 characters or less');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Description must be 500 characters or less');
  }

  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price < 0) {
      errors.push('Price must be a non-negative number');
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return true;
}

/**
 * Validates prompt text
 */
export function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Prompt is required');
  }

  if (prompt.length > 10000) {
    throw new Error('Prompt must be 10,000 characters or less');
  }

  return true;
}

/**
 * Validates email
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  return true;
}

/**
 * Validates URL
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required');
  }

  try {
    new URL(url);
    return true;
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitizes filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  
  // Remove invalid characters
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Ensure not empty
  if (sanitized.length === 0) {
    sanitized = 'file';
  }

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  return sanitized;
}

/**
 * Validates file size
 */
export function validateFileSize(file, maxSizeMB = 5) {
  if (!file) {
    throw new Error('File is required');
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size must be ${maxSizeMB}MB or less`);
  }

  return true;
}

/**
 * Validates file type
 */
export function validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) {
  if (!file) {
    throw new Error('File is required');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return true;
}

