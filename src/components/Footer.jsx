import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        height: 'var(--footer-height)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 10, 15, 0.6)',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        zIndex: 100,
        flexShrink: 0
      }}
    >
      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.25)',
          margin: 0
        }}
      >
        Click. Create. Copy.
      </p>
    </footer>
  );
};

export default Footer;
