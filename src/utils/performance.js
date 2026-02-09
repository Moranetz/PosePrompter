/**
 * Performance Monitoring Utilities
 * 
 * Provides utilities for measuring and monitoring performance
 */

import { logger } from './logger.js';

/**
 * Measure performance of a function
 */
export function measurePerformance(name, fn) {
  if (typeof fn !== 'function') {
    throw new Error('Second argument must be a function');
  }

  return async (...args) => {
    const start = performance.now();
    let result;
    let error;

    try {
      result = await fn(...args);
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const end = performance.now();
      const duration = end - start;

      if (import.meta.env.DEV) {
        logger.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }

      // In production, you could send to analytics
      // trackPerformanceMetric(name, duration, { error: !!error });
    }

    return result;
  };
}

/**
 * Measure render performance
 */
export function measureRender(componentName, renderFn) {
  const start = performance.now();
  const result = renderFn();
  const end = performance.now();
  const duration = end - start;

  if (import.meta.env.DEV && duration > 16) {
    // Warn if render takes longer than one frame (16ms at 60fps)
    logger.warn(`[Performance] Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Track Web Vitals
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (import.meta.env.DEV) {
          logger.log('[Web Vitals] LCP:', lastEntry.renderTime || lastEntry.loadTime);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      logger.error('[Performance] Error tracking LCP:', error);
    }
  }

  // Track First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (import.meta.env.DEV) {
            logger.log('[Web Vitals] FID:', entry.processingStart - entry.startTime);
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      logger.error('[Performance] Error tracking FID:', error);
    }
  }
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

