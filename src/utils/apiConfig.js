/**
 * Secure API configuration
 *
 * This module provides a secure way to get the API base URL that:
 * - Uses environment variable if set
 * - In development: falls back to http://localhost:3001
 * - In production: uses relative URLs (same origin) if env var not set
 * - Never exposes insecure HTTP URLs in production
 */

/**
 * Get the API base URL securely
 * @returns {string} The API base URL
 */
export const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In development mode, allow localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }

  // In production without env var, use relative URLs (same origin)
  // This makes API calls go to the same domain the app is hosted on
  // e.g., if app is at https://example.com, API calls go to https://example.com/api/...
  return '';
};

/**
 * Validate that API configuration is secure
 * @returns {boolean} Whether the configuration is valid
 */
export const validateApiConfig = () => {
  const apiUrl = getApiBaseUrl();

  // In production, ensure we're not using HTTP (unless it's empty/relative)
  if (import.meta.env.PROD && apiUrl && apiUrl.startsWith('http://')) {
    console.error(
      '[Security] Insecure API configuration detected! ' +
      'Using HTTP in production is not allowed. ' +
      'Please set VITE_API_BASE_URL to an HTTPS URL.'
    );
    return false;
  }

  return true;
};

// Validate on module load
if (import.meta.env.PROD) {
  validateApiConfig();
}
