import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, ArrowLeft, Gem, Check, Loader2, X } from 'lucide-react';
import Header from './Header';
import { useAuth } from '../contexts/UserContext';
import { purchaseGems } from '../utils/paymentService';
import { getErrorMessage } from '../utils/errorHandler';

const PricingPage = ({ onClose }) => {
  const { user } = useAuth();
  const [loadingPackage, setLoadingPackage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const gemPackages = [
    { gems: 50, price: 6, bonus: null },
    { gems: 100, price: 12, bonus: null },
    { gems: 200, price: 24, bonus: null, popular: true },
    { gems: 420, price: 48, bonus: { total: 400, bonus: 20 } },
    { gems: 1100, price: 120, bonus: { total: 1000, bonus: 100 } },
    { gems: 2300, price: 240, bonus: { total: 2000, bonus: 300 } },
  ];

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

  const handleGetGems = async (packageData) => {
    // Check if user is logged in
    if (!user) {
      setError('Please sign in to purchase gems');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Prevent double-clicks
    if (loadingPackage) return;

    setLoadingPackage(packageData.gems);
    setError(null);
    setSuccessMessage(null);

    try {
      // Process payment and update gem balance
      const result = await purchaseGems(user.uid, packageData);

      if (result.success) {
        // Play success sound
        playPurchaseSound();

        // Show success message
        const totalGems = packageData.gems + (packageData.bonus?.bonus || 0);
        setSuccessMessage({
          gems: totalGems,
          balance: result.gemBalance,
        });

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('[PricingPage] Error purchasing gems:', err);
      setError(getErrorMessage(err) || 'Failed to process purchase. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: '#ffffff',
      position: 'relative'
    }}>
      <Header />
      
      <main style={{
        padding: '40px 32px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Back button */}
        <button
          onClick={() => {
            window.location.hash = '';
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '450',
            letterSpacing: '-0.01em',
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(139, 92, 246, 0.08)';
            e.target.style.color = '#e4dbfa';
            e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'var(--text-muted)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.07)';
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Header Section */}
        <div style={{ marginBottom: '48px' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: '650',
              marginBottom: '12px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em'
            }}
          >
            Stop wasting credits.<br />
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Start getting results.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}
          >
            One-time purchase. No subscriptions. No regrets.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '40px'
            }}
          >
            <p style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.7',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              Every gem unlocks premium status. That means:
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                'Full access to all AI tools without watermarks',
                'No more wasted credits on outputs that miss the vibe',
                'Professional results you can actually use',
                'Your vision, your choices, your gallery'
              ].map((benefit, i) => (
                <li key={i} style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  lineHeight: '1.6'
                }}>
                  <span style={{
                    color: '#22c55e',
                    marginTop: '4px',
                    flexShrink: 0
                  }}>✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Gem Packages Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '40px'
        }}>
          {gemPackages.map((pkg, index) => (
            <motion.div
              key={pkg.gems}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Star background decoration */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />

              {/* Popular badge */}
              {pkg.popular && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: '500'
                }}>
                  Most Popular
                </div>
              )}

              {/* Gem count */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: 0,
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Gem 
                    size={28} 
                    style={{ 
                      color: '#fbbf24',
                      flexShrink: 0
                    }} 
                  />
                  <span>{pkg.gems.toLocaleString()} Gems</span>
                </h3>
                {/* Value proposition based on package size */}
                {pkg.gems === 50 && (
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '4px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    Perfect for trying it out
                  </p>
                )}
                {pkg.gems === 100 && (
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '4px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    Build your first gallery
                  </p>
                )}
                {pkg.gems === 200 && (
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '4px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    Most creators choose this
                  </p>
                )}
                {pkg.gems === 420 && (
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '4px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    Never run out mid-project
                  </p>
                )}
                {pkg.gems === 1100 && (
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '4px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    Stop counting credits, start creating
                  </p>
                )}
                {pkg.gems === 2300 && (
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '4px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    For serious creators
                  </p>
                )}
                {pkg.bonus && (
                  <p style={{
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Total {pkg.bonus.total.toLocaleString()} +
                    </span>
                    <span style={{
                      color: '#fbbf24',
                      fontWeight: '600'
                    }}>
                      🎁 {pkg.bonus.bonus} Bonus
                    </span>
                  </p>
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#ffffff'
                }}>
                  ${pkg.price}
                </span>
                {pkg.gems === 420 && (
                  <p style={{
                    fontSize: '11px',
                    color: 'rgba(34, 197, 94, 0.8)',
                    margin: '4px 0 0 0',
                    fontWeight: '500'
                  }}>
                    Extra gems to finish strong
                  </p>
                )}
                {pkg.gems === 1100 && (
                  <p style={{
                    fontSize: '11px',
                    color: 'rgba(34, 197, 94, 0.8)',
                    margin: '4px 0 0 0',
                    fontWeight: '500'
                  }}>
                    Most gems per dollar
                  </p>
                )}
                {pkg.gems === 2300 && (
                  <p style={{
                    fontSize: '11px',
                    color: 'rgba(34, 197, 94, 0.8)',
                    margin: '4px 0 0 0',
                    fontWeight: '500'
                  }}>
                    Best value per gem
                  </p>
                )}
              </div>

              {/* Get gems button */}
              <button
                onClick={() => handleGetGems(pkg)}
                disabled={loadingPackage === pkg.gems}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: loadingPackage === pkg.gems 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loadingPackage === pkg.gems ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loadingPackage === pkg.gems ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (loadingPackage !== pkg.gems) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (loadingPackage !== pkg.gems) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loadingPackage === pkg.gems ? (
                  <>
                    <Loader2 
                      size={16} 
                      style={{ 
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block'
                      }} 
                    />
                    Processing...
                  </>
                ) : (
                  'Get gems'
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Success Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'fixed',
              top: '32px',
              right: '32px',
              background: 'linear-gradient(135deg, #0f1a0f 0%, #1a2e1a 100%)',
              border: '2px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(34, 197, 94, 0.1)',
              zIndex: 10001,
              maxWidth: '360px',
              minWidth: '300px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                width: '44px',
                height: '44px',
                background: 'rgba(34, 197, 94, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Check size={24} color="#22c55e" strokeWidth={3} />
            </motion.div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#ffffff',
                margin: 0,
                marginBottom: '4px'
              }}>
                Purchase Successful!
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                marginBottom: '4px'
              }}>
                +{successMessage.gems.toLocaleString()} gems added
              </p>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: 0
              }}>
                New balance: {successMessage.balance.toLocaleString()} gems
              </p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'color 200ms'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'fixed',
              top: '32px',
              right: '32px',
              background: 'linear-gradient(135deg, #1a0f0f 0%, #2e1a1a 100%)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(239, 68, 68, 0.1)',
              zIndex: 10001,
              maxWidth: '360px',
              minWidth: '300px'
            }}
          >
            <p style={{
              fontSize: '14px',
              color: '#ffffff',
              margin: 0
            }}>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingPage;

