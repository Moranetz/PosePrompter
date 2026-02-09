/**
 * Centralized API Client
 * 
 * Provides a unified interface for all API calls with:
 * - Automatic authentication token injection
 * - Request/response interceptors
 * - Retry logic for transient failures
 * - Request cancellation support
 * - Consistent error handling
 * - Request/response logging
 */

import { logger } from '../utils/logger.js';
import { getErrorMessage } from '../utils/errorHandler.js';
import { getApiUrl } from '../config/env.js';

// Base URL for API (uses validated env config)
const API_BASE_URL = getApiUrl();

// Default timeout for requests (30 seconds)
const DEFAULT_TIMEOUT = 30000;

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  backoff: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['network', 'timeout', 'ECONNRESET', 'ETIMEDOUT'],
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Checks if an error is retryable
 */
const isRetryableError = (error) => {
  if (!error) return false;
  
  // Check status code
  if (error.status && RETRY_CONFIG.retryableStatusCodes.includes(error.status)) {
    return true;
  }
  
  // Check error message
  const errorMessage = error.message?.toLowerCase() || '';
  return RETRY_CONFIG.retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError.toLowerCase())
  );
};

/**
 * Gets authentication token from Firebase Auth
 */
const getAuthToken = async () => {
  try {
    const { auth } = await import('../firebase-config.js');
    const { onAuthStateChanged } = await import('firebase/auth');
    
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          user.getIdToken().then(resolve).catch(() => resolve(null));
        } else {
          resolve(null);
        }
      });
      
      // Timeout after 2 seconds
      setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 2000);
    });
  } catch (error) {
    logger.error('[ApiClient] Error getting auth token:', error);
    return null;
  }
};

/**
 * Creates an AbortController with timeout
 */
const createTimeoutController = (timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
};

/**
 * Main API Client Class
 */
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: [],
      error: [],
    };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor) {
    this.interceptors.error.push(interceptor);
  }

  /**
   * Apply request interceptors
   */
  async applyRequestInterceptors(config) {
    let processedConfig = { ...config };
    
    for (const interceptor of this.interceptors.request) {
      processedConfig = await interceptor(processedConfig);
    }
    
    return processedConfig;
  }

  /**
   * Apply response interceptors
   */
  async applyResponseInterceptors(response) {
    let processedResponse = response;
    
    for (const interceptor of this.interceptors.response) {
      processedResponse = await interceptor(processedResponse);
    }
    
    return processedResponse;
  }

  /**
   * Apply error interceptors
   */
  async applyErrorInterceptors(error) {
    let processedError = error;
    
    for (const interceptor of this.interceptors.error) {
      processedError = await interceptor(processedError);
    }
    
    return processedError;
  }

  /**
   * Make HTTP request with retry logic
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = DEFAULT_TIMEOUT,
      retry = true,
      retryConfig = RETRY_CONFIG,
      signal: externalSignal,
      ...restOptions
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    // Prepare initial config
    let config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...restOptions,
    };

    // Add body if present
    if (body) {
      if (body instanceof FormData) {
        // Don't set Content-Type for FormData (browser will set it with boundary)
        delete config.headers['Content-Type'];
        config.body = body;
      } else if (typeof body === 'object') {
        config.body = JSON.stringify(body);
      } else {
        config.body = body;
      }
    }

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

    // Create timeout controller
    const { controller: timeoutController, timeoutId } = createTimeoutController(timeout);
    
    // Combine signals if external signal provided
    const abortController = new AbortController();
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => abortController.abort());
    }
    timeoutController.signal.addEventListener('abort', () => abortController.abort());
    config.signal = abortController.signal;

    // Retry logic
    let lastError;
    const maxRetries = retry ? retryConfig.maxRetries : 0;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = retryConfig.initialDelay * Math.pow(retryConfig.backoff, attempt - 1);
          logger.log(`[ApiClient] Retrying request (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms`);
          await sleep(delay);
        }

        logger.log(`[ApiClient] ${method} ${url}`, { attempt: attempt + 1, body: config.body });

        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          const error = {
            status: response.status,
            statusText: response.statusText,
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            data: errorData,
            response,
          };

          // Check if retryable
          if (attempt < maxRetries && isRetryableError(error)) {
            lastError = error;
            continue;
          }

          // Apply error interceptors
          const processedError = await this.applyErrorInterceptors(error);
          throw processedError;
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else if (contentType?.includes('text/')) {
          data = await response.text();
        } else {
          data = await response.blob();
        }

        const processedResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data,
          response,
        };

        // Apply response interceptors
        return await this.applyResponseInterceptors(processedResponse);
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        // Check if retryable
        if (attempt < maxRetries && isRetryableError(error)) {
          continue;
        }

        // Handle abort errors
        if (error.name === 'AbortError') {
          const abortError = new Error('Request timeout or cancelled');
          abortError.name = 'AbortError';
          abortError.isTimeout = true;
          throw abortError;
        }

        // Apply error interceptors
        const processedError = await this.applyErrorInterceptors(error);
        throw processedError;
      }
    }

    // If we get here, all retries failed
    throw lastError;
  }

  /**
   * Parse error response
   */
  async parseErrorResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        return { message: text || response.statusText };
      }
    } catch (error) {
      return { message: response.statusText || 'Unknown error' };
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create default instance
const apiClient = new ApiClient();

// Add default request interceptor for auth token
apiClient.addRequestInterceptor(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Add default error interceptor for user-friendly messages
apiClient.addErrorInterceptor(async (error) => {
  const userFriendlyMessage = getErrorMessage(error);
  error.userMessage = userFriendlyMessage;
  return error;
});

// Export both the class and default instance
export { ApiClient };
export default apiClient;

