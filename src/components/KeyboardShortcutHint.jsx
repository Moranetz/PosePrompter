import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const shortcuts = [
  { keys: '← →', label: 'Navigate categories' },
  { keys: '↑ ↓', label: 'Navigate options' },
  { keys: 'R', label: 'Randomize current' },
  { keys: 'Shift+R', label: 'Randomize all' },
  { keys: 'C', label: 'Copy prompt' },
  { keys: 'Ctrl+Z', label: 'Undo' },
  { keys: 'Ctrl+Y', label: 'Redo' },
];

const KeyboardShortcutHint = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Hide on mobile
  if (typeof window !== 'undefined' && window.innerWidth <= 900) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating ? button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
        }}
      >
        ?
      </motion.button>

      {/* Tooltip panel */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '0',
              background: 'rgba(18, 18, 26, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '12px 14px',
              minWidth: '200px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{
              fontSize: '10px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}>
              Keyboard Shortcuts
            </div>
            {shortcuts.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  gap: '16px',
                }}
              >
                <span style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.55)',
                }}>
                  {s.label}
                </span>
                <kbd style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  whiteSpace: 'nowrap',
                }}>
                  {s.keys}
                </kbd>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KeyboardShortcutHint;
