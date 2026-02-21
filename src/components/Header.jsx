import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Gem, Settings } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { resetUserAccountData, getUserProfile } from '../firestoreService';
import AuthModal from './AuthModal';
import CreditBalance from './CreditBalance';

const Header = ({ onOpenVisibilitySettings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartConfirmStep, setRestartConfirmStep] = useState(0); // 0=idle, 1=confirm, 2=confirmed
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [credits, setCredits] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const userMenuRef = useRef(null);
  const { user, signOut } = useAuth();

  // Reset confirmation when menu closes
  useEffect(() => {
    if (!userMenuOpen && !mobileMenuOpen) {
      setRestartConfirmStep(0);
    }
  }, [userMenuOpen, mobileMenuOpen]);

  const handleRestartAccount = async (onComplete) => {
    if (!user || !user.uid || isRestarting) return;

    // Two-step confirmation: first click shows warning, second click confirms
    if (restartConfirmStep === 0) {
      setRestartConfirmStep(1);
      return;
    }
    if (restartConfirmStep < 2) return; // Wait for second confirmation

    setIsRestarting(true);

    try {
      // Clear user data stored in Firestore (favorites, custom options, etc.)
      await resetUserAccountData(user.uid);

      // Clear local/browser storage used by the app
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('Could not clear localStorage during account restart:', e);
      }

      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear sessionStorage during account restart:', e);
      }

      // Best-effort IndexedDB cleanup (Firebase may use it for persistence)
      try {
        if ('indexedDB' in window && indexedDB.databases) {
          indexedDB.databases().then((databases) => {
            databases.forEach((db) => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          });
        }
      } catch (e) {
        console.warn('Could not clear IndexedDB during account restart:', e);
      }

      // Sign out and optionally close menus
      await signOut();
      if (typeof onComplete === 'function') {
        onComplete();
      }

      // Force a clean reload so all state is reset
      window.location.reload();
    } catch (error) {
      console.error('Error restarting account:', error);
      alert('Something went wrong while restarting your account. Please try again.');
      setIsRestarting(false);
    }
  };

  // Fetch user credits when user changes or menu opens
  // CRITICAL: Must use same logic as BuyCreditsModal for accuracy
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.uid) {
        setCredits(null);
        setCreditsLoading(false);
        return;
      }

      try {
        setCreditsLoading(true);
        const profile = await getUserProfile(user.uid);
        
        // CRITICAL: Use EXACT same logic as server's getUserCredits function
        // Server code: return userData.gems || userData.credits || 0;
        // This ensures 100% accuracy - we read exactly what the server would read
        let userCredits = profile?.gems ?? profile?.credits ?? 0;
        
        // Validate that credits is a valid number (same validation as server)
        if (typeof userCredits !== 'number' || isNaN(userCredits)) {
          console.warn('[Header] Invalid credits value from profile, defaulting to 0:', {
            gems: profile?.gems,
            credits: profile?.credits,
            typeGems: typeof profile?.gems,
            typeCredits: typeof profile?.credits,
          });
          userCredits = 0;
        }
        
        // Ensure credits is a non-negative integer (server stores as number)
        userCredits = Math.max(0, Math.floor(Number(userCredits)));
        
        setCredits(userCredits);
        
        // Detailed logging for verification
        console.log('[Header] Credits fetched and validated:', {
          userId: user.uid,
          rawGems: profile?.gems,
          rawCredits: profile?.credits,
          typeGems: typeof profile?.gems,
          typeCredits: typeof profile?.credits,
          selectedField: profile?.gems !== undefined ? 'gems' : (profile?.credits !== undefined ? 'credits' : 'default'),
          finalValue: userCredits,
          verification: `Server would read: ${profile?.gems ?? profile?.credits ?? 0} = ${userCredits} ✓`,
        });
      } catch (error) {
        console.error('[Header] Error fetching credits:', error);
        setCredits(0);
      } finally {
        setCreditsLoading(false);
      }
    };

    if (user && (userMenuOpen || mobileMenuOpen)) {
      fetchCredits();
    }
  }, [user, userMenuOpen, mobileMenuOpen]);

  // Also refresh credits periodically when menu is open to ensure accuracy
  useEffect(() => {
    if (!user?.uid || (!userMenuOpen && !mobileMenuOpen)) {
      return;
    }

    const refreshCredits = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        // Use exact same logic as initial fetch for consistency
        let userCredits = profile?.gems ?? profile?.credits ?? 0;
        
        if (typeof userCredits !== 'number' || isNaN(userCredits)) {
          userCredits = 0;
        }
        userCredits = Math.max(0, Math.floor(Number(userCredits)));
        
        // Only update if value changed to avoid unnecessary re-renders
        setCredits(prev => {
          if (prev !== userCredits) {
            console.log('[Header] Credits refreshed:', { 
              previous: prev, 
              new: userCredits,
              source: profile?.gems !== undefined ? 'gems' : (profile?.credits !== undefined ? 'credits' : 'default'),
            });
            return userCredits;
          }
          return prev;
        });
      } catch (error) {
        console.error('[Header] Error refreshing credits:', error);
      }
    };

    // Refresh every 5 seconds when menu is open to catch any updates
    const interval = setInterval(refreshCredits, 5000);
    return () => clearInterval(interval);
  }, [user, userMenuOpen, mobileMenuOpen]);

  // Listen for credit updates from BuyCreditsModal or other sources
  useEffect(() => {
    const handleCreditUpdate = (event) => {
      if (event.detail && typeof event.detail.credits === 'number') {
        const newCredits = Math.max(0, Math.floor(Number(event.detail.credits)));
        console.log('[Header] Credits updated via event:', {
          received: event.detail.credits,
          validated: newCredits,
          source: 'BuyCreditsModal',
        });
        setCredits(newCredits);
        
        // Also trigger a fresh fetch to verify accuracy
        // This ensures we have the absolute latest from the server
        setTimeout(async () => {
          try {
            if (user?.uid) {
              const profile = await getUserProfile(user.uid);
              const serverCredits = profile?.gems ?? profile?.credits ?? 0;
              const validatedCredits = Math.max(0, Math.floor(Number(serverCredits)));
              
              if (validatedCredits !== newCredits) {
                console.warn('[Header] Event credits differ from server, using server value:', {
                  eventValue: newCredits,
                  serverValue: validatedCredits,
                  using: validatedCredits,
                });
                setCredits(validatedCredits);
              } else {
                console.log('[Header] Event credits verified against server:', validatedCredits);
              }
            }
          } catch (error) {
            console.error('[Header] Error verifying event credits:', error);
          }
        }, 3000); // Wait 3 seconds for webhook to process
      }
    };

    window.addEventListener('creditsUpdated', handleCreditUpdate);
    return () => {
      window.removeEventListener('creditsUpdated', handleCreditUpdate);
    };
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <>
      <header
        style={{
          height: 'var(--header-height)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          zIndex: 1000,
          flexShrink: 0,
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '500',
              color: '#f4f4f5',
              letterSpacing: '-0.02em'
            }}
          >
            Pose Prompter
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav 
          className="header-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          {user ? (
            <CreditBalance />
          ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#pricing';
            }}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            }}
          >
            <Gem size={16} style={{ color: '#fbbf24' }} />
            Get gems
          </button>
          )}
          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              Sign In
            </button>
          )}
          {user && (
            <div 
              ref={userMenuRef}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                position: 'relative'
              }}
            >
              <span 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {user.email}
              </span>
              
              {/* Visibility Settings Button */}
              {onOpenVisibilitySettings && (
                <button
                  data-trash-icon
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVisibilitySettings();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.6)',
                    transition: 'all 0.2s ease',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  title="Visibility Settings"
                >
                  <Settings size={14} />
                </button>
              )}
              
              {/* User Menu Dropdown */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#12121a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    minWidth: '160px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                    zIndex: 1001
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Credit Balance Display */}
                    {credits !== null && (
                      <div
                        style={{
                          padding: '10px 12px',
                          background: 'rgba(251, 191, 36, 0.1)',
                          border: '1px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Gem size={14} style={{ color: '#fbbf24' }} />
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                            Credits:
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#fbbf24',
                            opacity: creditsLoading ? 0.6 : 1,
                            transition: 'opacity 0.2s ease'
                          }}
                        >
                          {creditsLoading ? '...' : credits.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        window.location.hash = '#error-reports';
                        setUserMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      }}
                    >
                      Error Reports
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      }}
                    >
                      Sign out
                    </button>

                    {/* Two-step restart: first click reveals warning, second confirms */}
                    {restartConfirmStep === 0 ? (
                      <button
                        onClick={() => setRestartConfirmStep(1)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--text-faint, #52525b)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'rgba(248, 113, 113, 0.7)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-faint, #52525b)';
                        }}
                      >
                        Restart account...
                      </button>
                    ) : (
                      <div style={{
                        padding: '8px',
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                      }}>
                        <p style={{
                          margin: '0 0 8px',
                          fontSize: '11px',
                          color: 'rgba(248, 113, 113, 0.9)',
                          lineHeight: 1.4,
                        }}>
                          This clears favorites, customizations, and local data. Credits are kept.
                        </p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setRestartConfirmStep(0)}
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              color: 'var(--text-secondary, #a1a1aa)',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setRestartConfirmStep(2);
                              handleRestartAccount(() => setUserMenuOpen(false));
                            }}
                            disabled={isRestarting}
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              borderRadius: '4px',
                              color: '#fca5a5',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: isRestarting ? 'default' : 'pointer',
                              opacity: isRestarting ? 0.6 : 1,
                            }}
                          >
                            {isRestarting ? 'Restarting...' : 'Yes, restart'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Hamburger Menu Button - Mobile only */}
        <button
          className="hamburger-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X size={22} color="rgba(255, 255, 255, 0.8)" />
          ) : (
            <Menu size={22} color="rgba(255, 255, 255, 0.8)" />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        style={{
          position: 'fixed',
          top: 'var(--header-height)',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: mobileMenuOpen ? 'block' : 'none'
        }}
      >
        <div
          className="mobile-menu-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#12121a',
            width: '80%',
            maxWidth: '280px',
            height: '100%',
            padding: '24px 20px',
            overflowY: 'auto',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          {user && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ 
                fontSize: '12px', 
                color: 'rgba(255, 255, 255, 0.4)',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Signed in as
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                wordBreak: 'break-all'
              }}>
                {user.email}
              </p>
            </div>
          )}
          
          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: user ? '20px' : '0' }}>
              {user ? (
                <div style={{ padding: '12px 16px' }}>
                  <CreditBalance />
                </div>
              ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#pricing';
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <Gem size={16} style={{ color: '#fbbf24' }} />
                Get gems
              </button>
              )}
              {!user && (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
            {user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Credit Balance Display - Mobile */}
                {credits !== null && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gem size={16} style={{ color: '#fbbf24' }} />
                      <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Credits:
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#fbbf24',
                        opacity: creditsLoading ? 0.6 : 1,
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      {creditsLoading ? '...' : credits.toLocaleString()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    window.location.hash = '#error-reports';
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Error Reports
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Sign out
                </button>

                {/* Two-step restart: first click reveals warning, second confirms */}
                {restartConfirmStep === 0 ? (
                  <button
                    onClick={() => setRestartConfirmStep(1)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'var(--text-faint, #52525b)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Restart account...
                  </button>
                ) : (
                  <div style={{
                    padding: '10px 12px',
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                  }}>
                    <p style={{
                      margin: '0 0 10px',
                      fontSize: '12px',
                      color: 'rgba(248, 113, 113, 0.9)',
                      lineHeight: 1.4,
                    }}>
                      This clears favorites, customizations, and local data. Credits are kept.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setRestartConfirmStep(0)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: 'var(--text-secondary, #a1a1aa)',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setRestartConfirmStep(2);
                          handleRestartAccount(() => setMobileMenuOpen(false));
                        }}
                        disabled={isRestarting}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '6px',
                          color: '#fca5a5',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: isRestarting ? 'default' : 'pointer',
                          opacity: isRestarting ? 0.6 : 1,
                        }}
                      >
                        {isRestarting ? 'Restarting...' : 'Yes, restart'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Header;
