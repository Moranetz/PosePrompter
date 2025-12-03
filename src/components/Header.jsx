import React, { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/UserContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, signOut } = useAuth();

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
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          zIndex: 100,
          flexShrink: 0,
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '-0.3px'
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
            {user && (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
