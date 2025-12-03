import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        height: 'var(--footer-height)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
    </footer>
  );
};

export default Footer;
