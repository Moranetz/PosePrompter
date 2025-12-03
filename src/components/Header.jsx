import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Gem } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';
import { resetUserAccountData } from '../firestoreService';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const userMenuRef = useRef(null);
  const { user, signOut } = useAuth();

  const handleRestartAccount = async (onComplete) => {
    if (!user || !user.uid || isRestarting) return;

    const confirmed = window.confirm(
      'Restart your account?\n\nThis will clear your favorites, customizations, and local cache, then sign you out so you can start fresh.'
    );
    if (!confirmed) return;

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
          zIndex: 100,
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
            PosePrompt Studio
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
                    zIndex: 1000
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

                    <button
                      onClick={() => handleRestartAccount(() => setUserMenuOpen(false))}
                      disabled={isRestarting}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '6px',
                        color: 'rgba(248, 113, 113, 0.9)',
                        fontSize: '12px',
                        cursor: isRestarting ? 'default' : 'pointer',
                        opacity: isRestarting ? 0.6 : 0.9,
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (isRestarting) return;
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                        e.currentTarget.style.color = '#fecaca';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(248, 113, 113, 0.9)';
                      }}
                    >
                      {isRestarting ? 'Restarting…' : 'Restart account'}
                    </button>
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
            </div>
            {user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

                <button
                  onClick={() =>
                    handleRestartAccount(() => {
                      setMobileMenuOpen(false);
                    })
                  }
                  disabled={isRestarting}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '8px',
                    color: 'rgba(248, 113, 113, 0.9)',
                    fontSize: '13px',
                    cursor: isRestarting ? 'default' : 'pointer',
                    textAlign: 'left',
                    opacity: isRestarting ? 0.6 : 0.9,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isRestarting ? 'Restarting…' : 'Restart account'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
