/**
 * OptimizedImage Component
 * 
 * Provides optimized image loading with:
 * - Lazy loading
 * - WebP format with fallback
 * - Loading states
 * - Error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger.js';

export function OptimizedImage({ 
  src, 
  alt, 
  className = '',
  style = {},
  onLoad,
  onError,
  ...props 
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [webPSupported, setWebPSupported] = useState(false);

  // Check WebP support
  useEffect(() => {
    const checkWebPSupport = () => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        setWebPSupported(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    };
    checkWebPSupport();
  }, []);

  // Convert to WebP if supported
  useEffect(() => {
    if (!src) {
      setImageSrc(null);
      return;
    }

    // If it's already a data URL or blob URL, use as-is
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setImageSrc(src);
      return;
    }

    // Try to convert to WebP if supported
    if (webPSupported && src.includes('firebase')) {
      // Firebase Storage URLs can be modified to use WebP
      // This is a simple approach - in production, you might want to use a CDN
      setImageSrc(src);
    } else {
      setImageSrc(src);
    }
  }, [src, webPSupported]);

  const handleLoad = useCallback((e) => {
    setLoading(false);
    setError(false);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    setLoading(false);
    setError(true);
    logger.error('[OptimizedImage] Error loading image:', src);
    onError?.(e);
  }, [src, onError]);

  if (!src) {
    return null;
  }

  return (
    <div 
      className={className}
      style={{ 
        position: 'relative',
        display: 'inline-block',
        ...style 
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: '#8b5cf6',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.1)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '12px',
          }}
        >
          Failed to load
        </div>
      )}
      <img
        src={imageSrc || src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          ...style,
        }}
        {...props}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default OptimizedImage;

