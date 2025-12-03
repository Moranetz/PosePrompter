import React from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, ArrowLeft, Gem } from 'lucide-react';
import Header from './Header';

const PricingPage = ({ onClose }) => {
  const gemPackages = [
    { gems: 50, price: 6, bonus: null },
    { gems: 100, price: 12, bonus: null },
    { gems: 200, price: 24, bonus: null, popular: true },
    { gems: 420, price: 48, bonus: { total: 400, bonus: 20 } },
    { gems: 1100, price: 120, bonus: { total: 1000, bonus: 100 } },
    { gems: 2300, price: 240, bonus: { total: 2000, bonus: 300 } },
  ];

  const handleGetGems = (packageData) => {
    // TODO: Implement payment processing
    alert(`Purchase ${packageData.gems} gems for $${packageData.price}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
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
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header Section */}
        <div style={{ marginBottom: '48px' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '700',
              marginBottom: '12px',
              color: '#ffffff',
              letterSpacing: '-1px'
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
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.6)',
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
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Get gems
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PricingPage;

