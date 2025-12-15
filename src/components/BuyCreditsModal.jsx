/**
 * BuyCreditsModal - Modal for purchasing credits with Stripe
 * 
 * Displays credit packages and handles Stripe payment form submission.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X, Gem, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { getUserProfile } from '../firestoreService';
import { getErrorMessage } from '../utils/errorHandler';
import Confetti from './Animations/Confetti';

// Load Stripe for nested Elements
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Credit packages configuration (must match server)
const CREDIT_PACKAGES = [
  { id: '50', credits: 50, price: 6, label: 'Perfect for trying it out' },
  { id: '100', credits: 100, price: 12, label: 'Build your first gallery' },
  { id: '200', credits: 200, price: 24, label: 'Most creators choose this', popular: true },
  { id: '420', credits: 420, price: 48, label: 'Never run out mid-project', bonus: { total: 400, bonus: 20 } },
  { id: '1100', credits: 1100, price: 120, label: 'Stop counting credits, start creating', bonus: { total: 1000, bonus: 100 } },
  { id: '2300', credits: 2300, price: 240, label: 'For serious creators', bonus: { total: 2000, bonus: 300 } },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Payment form component that uses PaymentElement (needs clientSecret)
const PaymentForm = ({ selectedPackage, clientSecret, paymentIntentId, onSuccess, onClose, onError, isProcessing, setIsProcessing, oldCredits, onShowConfetti }) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [newCredits, setNewCredits] = useState(null);
  const timeoutRef = React.useRef(null);

  // Play purchase sound when payment succeeds
  const playPurchaseSound = () => {
    try {
      const audio = new Audio('/cha-ching-money.mp3');
      audio.volume = 0.6; // Set volume to 60% to avoid being too loud
      audio.play().catch(error => {
        // Silently fail if audio can't play (e.g., user hasn't interacted with page yet)
        console.log('Could not play purchase sound:', error);
      });
    } catch (error) {
      console.log('Error loading purchase sound:', error);
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !user || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    if (onError) onError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Only proceed if we have a valid payment intent with succeeded status
      if (!paymentIntent) {
        throw new Error('Payment confirmation failed');
      }

      // If payment succeeded, webhook will handle credit addition
      // We just show success and refresh credits after a delay
      if (paymentIntent.status === 'succeeded') {
        // Play success sound ONLY on successful payment
        playPurchaseSound();
        
        // Show success and confetti immediately
        setSuccess(true);
        
        // Show confetti immediately
        if (onShowConfetti) {
          onShowConfetti();
        }
        
        // Calculate expected new balance (old + package credits)
        // CRITICAL: Ensure we use the correct oldCredits value and add the full package credits
        const previousBalance = oldCredits !== null ? oldCredits : 0;
        const creditsToAdd = selectedPackage.credits || 0;
        const expectedNewBalance = previousBalance + creditsToAdd;
        
        // Validate calculation
        if (isNaN(expectedNewBalance) || expectedNewBalance < previousBalance) {
          console.error('[BuyCreditsModal] Invalid credit calculation:', {
            previousBalance,
            creditsToAdd,
            expectedNewBalance,
          });
        }
        
        console.log('[BuyCreditsModal] Credit calculation:', {
          previousBalance,
          creditsToAdd,
          expectedNewBalance,
          packageId: selectedPackage.id,
        });
        
        setNewCredits(expectedNewBalance);
        
        // Dispatch event immediately with expected balance so Header can update
        window.dispatchEvent(new CustomEvent('creditsUpdated', {
          detail: { credits: expectedNewBalance }
        }));
        
        // Fetch actual balance in background (non-blocking, after webhook processes)
        // Use multiple retries to ensure we get the updated balance after webhook processes
        let retryCount = 0;
        const maxRetries = 5;
        const fetchActualBalance = async () => {
          try {
            if (user?.uid) {
              const profile = await getUserProfile(user.uid);
              const actualCredits = profile?.gems || profile?.credits || 0;
              
              // Validate that actual balance matches or exceeds expected
              if (actualCredits >= expectedNewBalance) {
                // Update with actual balance from server (should match or exceed expected)
                setNewCredits(actualCredits);
                console.log('[BuyCreditsModal] Balance updated from server:', {
                  expected: expectedNewBalance,
                  actual: actualCredits,
                  match: actualCredits === expectedNewBalance,
                });
                
                // Dispatch event to notify other components (like Header) of credit update
                window.dispatchEvent(new CustomEvent('creditsUpdated', {
                  detail: { credits: actualCredits }
                }));
              } else if (retryCount < maxRetries) {
                // Balance not updated yet, retry after delay
                retryCount++;
                console.log(`[BuyCreditsModal] Balance not updated yet (attempt ${retryCount}/${maxRetries}), retrying...`, {
                  expected: expectedNewBalance,
                  actual: actualCredits,
                });
                setTimeout(fetchActualBalance, 1000);
              } else {
                // Max retries reached, use expected balance
                console.warn('[BuyCreditsModal] Max retries reached, using expected balance:', expectedNewBalance);
                setNewCredits(expectedNewBalance);
                
                // Dispatch event with expected balance
                window.dispatchEvent(new CustomEvent('creditsUpdated', {
                  detail: { credits: expectedNewBalance }
                }));
              }
            }
          } catch (err) {
            console.error('[BuyCreditsModal] Error fetching updated credits:', err);
            // Keep the calculated balance if fetch fails
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(fetchActualBalance, 1000);
            }
          }
        };
        
        // Start fetching after initial delay to allow webhook to process
        setTimeout(fetchActualBalance, 2000);

        // Call success callback after a delay to allow webhook to process
        // Don't auto-close - let user close by clicking outside
        timeoutRef.current = setTimeout(() => {
          // Webhook handles credit addition, so we just refresh the balance
          if (onSuccess) {
            onSuccess({ creditBalance: newCredits || null }); // Let parent component refresh
          }
          // Modal stays open until user clicks outside
        }, 1500);
      } else {
        // Payment did not succeed - don't play sound
        throw new Error(`Payment status: ${paymentIntent.status}. Payment was not successful.`);
      }
    } catch (err) {
      console.error('[BuyCreditsModal] Payment error:', err);
      const errorMsg = getErrorMessage(err) || 'Payment failed. Please try again.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Package:
            </span>
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
              {selectedPackage.credits} Credits
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Total:
            </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#fbbf24',
              }}
            >
              ${selectedPackage.price}
            </span>
          </div>
        </div>

        <PaymentElement />
      </div>

      {error && (
        <div
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
        </div>
      )}

      {success && (
        <div
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
            Payment Successful!
          </h3>
          {oldCredits !== null && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Previous Balance:
                </span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                  {oldCredits.toLocaleString()} credits
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Credits Added:
                </span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>
                  +{selectedPackage.credits.toLocaleString()}
                  {selectedPackage.bonus && ` (${selectedPackage.bonus.total} + ${selectedPackage.bonus.bonus} bonus)`}
                </span>
              </div>
              {newCredits !== null && (() => {
                // CRITICAL: Always calculate the expected balance to ensure accuracy
                // This is a safety check in case newCredits was set incorrectly
                const previousBalance = oldCredits !== null ? oldCredits : 0;
                const creditsToAdd = selectedPackage.credits || 0;
                const calculatedBalance = previousBalance + creditsToAdd;
                
                // Use the higher of the two values (calculated or fetched) to ensure we never show less than expected
                const displayBalance = Math.max(newCredits, calculatedBalance);
                
                // Log if there's a discrepancy
                if (newCredits !== calculatedBalance && newCredits < calculatedBalance) {
                  console.warn('[BuyCreditsModal] Balance discrepancy detected:', {
                    calculated: calculatedBalance,
                    fetched: newCredits,
                    using: displayBalance,
                  });
                }
                
                return (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                      New Balance:
                    </span>
                    <span
                      style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#fbbf24',
                      }}
                    >
                      {displayBalance.toLocaleString()} credits
                    </span>
                  </div>
                );
              })()}
            </div>
          )}
          {oldCredits === null && (
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                marginTop: '8px',
              }}
            >
              Your credits have been added to your account.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || success}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: isProcessing || success
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(139, 92, 246, 0.8)',
          border: 'none',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isProcessing || !stripe || success ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isProcessing || !stripe || success ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isProcessing && stripe && !success) {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isProcessing && stripe && !success) {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.8)';
          }
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Processing...
          </>
        ) : success ? (
          <>
            <Check size={18} />
            Success!
          </>
        ) : (
          `Pay $${selectedPackage.price}`
        )}
      </button>
    </form>
  );
};

// Main modal component
const BuyCreditsModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [oldCredits, setOldCredits] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Debug: Log when confetti state changes
  React.useEffect(() => {
    if (showConfetti) {
      console.log('[BuyCreditsModal] Confetti is now showing!', { isOpen, showConfetti });
    }
  }, [showConfetti, isOpen]);

  // Add/remove body class to hide word-button-bar when modal is open
  // Do this immediately and synchronously to prevent any flash
  React.useLayoutEffect(() => {
    if (isOpen) {
      document.body.classList.add('buy-credits-modal-open');
    } else {
      document.body.classList.remove('buy-credits-modal-open');
    }
    return () => {
      // Always remove class on cleanup to prevent WordButtonBar from reappearing
      document.body.classList.remove('buy-credits-modal-open');
    };
  }, [isOpen]);

  // Additional cleanup on unmount to ensure class is always removed
  React.useEffect(() => {
    return () => {
      document.body.classList.remove('buy-credits-modal-open');
    };
  }, []);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedPackage(null);
      setClientSecret(null);
      setPaymentIntentId(null);
      setError(null);
      setSuccess(false);
      setIsProcessing(false);
      setOldCredits(null);
      setShowConfetti(false);
    }
  }, [isOpen]);

  // Handle package selection
  const handleSelectPackage = async (pkg) => {
    if (!user) {
      setError('Please sign in to purchase credits');
      return;
    }

    setSelectedPackage(pkg);
    setError(null);
    setIsProcessing(true);

    // Get old credit balance before payment
    // CRITICAL: This must be accurate for correct balance calculation
    try {
      if (user?.uid) {
        const profile = await getUserProfile(user.uid);
        const currentCredits = profile?.gems || profile?.credits || 0;
        
        // Validate credits is a number
        if (isNaN(currentCredits)) {
          console.warn('[BuyCreditsModal] Invalid current credits, defaulting to 0');
          setOldCredits(0);
        } else {
          setOldCredits(currentCredits);
          console.log('[BuyCreditsModal] Fetched current credits:', currentCredits);
        }
      }
    } catch (err) {
      console.error('[BuyCreditsModal] Error fetching current credits:', err);
      // Set to 0 if fetch fails to ensure calculation still works
      setOldCredits(0);
    }

    try {
      // Create payment intent on backend
      const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: pkg.price * 100, // Convert to cents
          creditPackage: pkg.id,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err) {
      console.error('[BuyCreditsModal] Error creating payment intent:', err);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to initialize payment';
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSelectedPackage(null);
    } finally {
      setIsProcessing(false);
    }
  };

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
        {/* Confetti rendered via portal to ensure it covers entire viewport */}
        {showConfetti && typeof document !== 'undefined' && document.body && createPortal(
          <Confetti zIndex={10003} />,
          document.body
        )}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
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
            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: 0,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Gem size={28} style={{ color: '#fbbf24' }} />
                Buy Credits
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                }}
              >
                One-time purchase. No subscriptions.
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
                  marginBottom: '24px',
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

            {/* Package selection or payment form */}
            {!selectedPackage ? (
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '20px',
                  }}
                >
                  Select a credit package:
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {CREDIT_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      disabled={isProcessing}
                      style={{
                        background: pkg.popular
                          ? 'rgba(139, 92, 246, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: pkg.popular
                          ? '2px solid rgba(139, 92, 246, 0.5)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease', // Only animate transform/shadow, colors change instantly
                        opacity: isProcessing ? 0.6 : 1,
                        textAlign: 'left',
                        willChange: 'background-color, border-color, transform', // Hint for GPU acceleration
                        transform: 'translateZ(0)', // Force GPU layer
                      }}
                      onMouseEnter={(e) => {
                        if (!isProcessing) {
                          // Instant color change - no transition on colors
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isProcessing) {
                          // Instant color change
                          e.currentTarget.style.background = pkg.popular
                            ? 'rgba(139, 92, 246, 0.1)'
                            : 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = pkg.popular
                            ? 'rgba(139, 92, 246, 0.5)'
                            : 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#ffffff',
                          marginBottom: '4px',
                        }}
                      >
                        {pkg.credits}
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#fbbf24',
                          marginBottom: '4px',
                        }}
                      >
                        ${pkg.price}
                      </div>
                      {pkg.bonus && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            marginTop: '4px',
                          }}
                        >
                          +{pkg.bonus.bonus} bonus
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#8b5cf6',
                      colorBackground: '#12121a',
                      colorText: '#ffffff',
                      colorDanger: '#ef4444',
                      fontFamily: 'system-ui, sans-serif',
                      spacingUnit: '4px',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PaymentForm
                  selectedPackage={selectedPackage}
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  onSuccess={onSuccess}
                  onClose={onClose}
                  onError={setError}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  oldCredits={oldCredits}
                  onShowConfetti={() => {
                    console.log('[BuyCreditsModal] Setting showConfetti to true');
                    // Use functional update to ensure state is set immediately
                    setShowConfetti(prev => {
                      console.log('[BuyCreditsModal] showConfetti was:', prev, 'setting to true');
                      return true;
                    });
                  }}
                />
              </Elements>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Loader2
                  size={32}
                  style={{
                    animation: 'spin 1s linear infinite',
                    color: '#8b5cf6',
                    marginBottom: '16px',
                  }}
                />
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                  Initializing payment...
                </p>
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

export default BuyCreditsModal;
