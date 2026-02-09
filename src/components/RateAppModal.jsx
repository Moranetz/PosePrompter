/**
 * RateAppModal - Modal prompting users to rate the app for credits
 * 
 * Shows after image download and rewards credits when user rates the app.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { logger } from '../utils/logger';

// App store URLs - configure these based on your app
// TODO: Replace these with your actual app store URLs
const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/app/your-app-id', // Replace with your iOS app URL (e.g., https://apps.apple.com/app/id123456789)
  android: 'https://play.google.com/store/apps/details?id=your.package.name', // Replace with your Android app URL (e.g., https://play.google.com/store/apps/details?id=com.yourcompany.appname)
  web: 'https://apps.apple.com/app/your-app-id', // Default fallback (can be iOS or Android URL)
};

// Credits to reward for rating
const RATING_REWARD_CREDITS = 50;

/**
 * Detect if user is on mobile device
 */
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detect if user is on iOS
 */
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Get appropriate app store URL based on device
 */
const getAppStoreUrl = () => {
  if (isIOS()) {
    return APP_STORE_URLS.ios;
  } else if (isMobileDevice()) {
    return APP_STORE_URLS.android;
  }
  return APP_STORE_URLS.web; // Default fallback
};

const RateAppModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [creditsAdded, setCreditsAdded] = useState(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
      setCreditsAdded(null);
    }
  }, [isOpen]);

  /**
   * Handle rating submission
   * Opens app store and rewards credits
   */
  const handleRateApp = async () => {
    if (!user) {
      setError('Please sign in to receive credits');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use centralized API client
      const apiClient = (await import('../api/client.js')).default;

      // Call backend to reward credits
      const response = await apiClient.post('/api/reward-rating', {
        userId: user.uid,
      });

      const data = response.data;

      if (data.success) {
        setSuccess(true);
        const creditsRewarded = data.creditsAdded || 0;
        setCreditsAdded(creditsRewarded);

        // Mark user as having rated in localStorage (prevents showing modal again)
        // Only mark if credits were actually added (not already rewarded)
        if (creditsRewarded > 0) {
          localStorage.setItem('hasRatedApp', 'true');
        }

        // Dispatch event to update credits in Header
        window.dispatchEvent(new CustomEvent('creditsUpdated', {
          detail: { credits: data.creditBalance }
        }));

        // Open app store in new tab (always open, even if already rewarded)
        const appStoreUrl = getAppStoreUrl();
        window.open(appStoreUrl, '_blank', 'noopener,noreferrer');

        // Call success callback
        if (onSuccess) {
          onSuccess({ creditBalance: data.creditBalance, creditsAdded: creditsRewarded });
        }

        // Auto-close after showing success message
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to reward credits');
      }
    } catch (err) {
      logger.error('[RateAppModal] Error rewarding credits:', err);
      setError(err.message || 'Failed to process rating. Please try again.');
      setIsSubmitting(false);
    }
  };

  /**
   * Handle "Maybe Later" - just close without rewarding
   */
  const handleMaybeLater = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              // Only close if clicking the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 10002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#12121a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.2s ease',
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                }}
              >
                <X size={18} />
              </button>

              <div style={{ padding: '32px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(251, 191, 36, 0.1)',
                      marginBottom: '16px',
                    }}
                  >
                    <Star size={32} style={{ color: '#fbbf24' }} fill="#fbbf24" />
                  </div>
                  <h2
                    style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#ffffff',
                      margin: 0,
                      marginBottom: '8px',
                    }}
                  >
                    Love the app?
                  </h2>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      margin: 0,
                    }}
                  >
                    Rate us on the App Store and get {RATING_REWARD_CREDITS} free credits!
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <AlertCircle size={20} color="#ef4444" />
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#ffffff',
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {error}
                    </p>
                  </motion.div>
                )}

                {/* Success message */}
                    {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <Check size={48} color="#22c55e" style={{ marginBottom: '16px' }} />
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#ffffff',
                        margin: 0,
                        marginBottom: '8px',
                      }}
                    >
                      {creditsAdded > 0 ? 'Credits Added!' : 'Thank You!'}
                    </h3>
                    {creditsAdded > 0 && (
                      <p
                        style={{
                          fontSize: '16px',
                          color: '#22c55e',
                          margin: 0,
                          fontWeight: '600',
                        }}
                      >
                        +{creditsAdded} credits added to your account
                      </p>
                    )}
                    {creditsAdded === 0 && (
                      <p
                        style={{
                          fontSize: '14px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          margin: '8px 0 0 0',
                        }}
                      >
                        You've already received credits for rating. Thank you for your continued support!
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: '8px 0 0 0',
                      }}
                    >
                      {creditsAdded > 0 ? 'Thank you for your support!' : 'App Store opened in a new tab.'}
                    </p>
                  </motion.div>
                )}

                {/* Action buttons */}
                {!success && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <button
                      onClick={handleRateApp}
                      disabled={isSubmitting || !user}
                      style={{
                        width: '100%',
                        padding: '14px 24px',
                        background: isSubmitting || !user
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(251, 191, 36, 0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSubmitting || !user ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isSubmitting || !user ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting && user) {
                          e.currentTarget.style.background = 'rgba(251, 191, 36, 1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting && user) {
                          e.currentTarget.style.background = 'rgba(251, 191, 36, 0.8)';
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Star size={18} fill="#ffffff" />
                          Rate on App Store
                          <ExternalLink size={16} />
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleMaybeLater}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '12px 24px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isSubmitting ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                        }
                      }}
                    >
                      Maybe Later
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default RateAppModal;
