import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const handleLinkClick = (e, route) => {
    e.preventDefault();
    window.location.hash = route;
  };

  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: 'var(--footer-height)',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        zIndex: 100,
        flexShrink: 0
      }}
    >
      <p
        style={{
          fontSize: '11px',
          color: '#52525b',
          margin: 0,
          letterSpacing: '0.02em'
        }}
      >
        Click. Create. Copy.
      </p>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: '#71717a',
          }}
        >
          © {currentYear} Pose Prompter. All rights reserved.
        </span>
        <a
          href="#terms"
          onClick={(e) => handleLinkClick(e, '#terms')}
          style={{
            fontSize: '10px',
            color: '#71717a',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#a1a1aa'}
          onMouseLeave={(e) => e.target.style.color = '#71717a'}
        >
          Terms of Service
        </a>
        <span style={{ fontSize: '10px', color: '#71717a' }}>•</span>
        <a
          href="#privacy"
          onClick={(e) => handleLinkClick(e, '#privacy')}
          style={{
            fontSize: '10px',
            color: '#71717a',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#a1a1aa'}
          onMouseLeave={(e) => e.target.style.color = '#71717a'}
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};

export default Footer;
