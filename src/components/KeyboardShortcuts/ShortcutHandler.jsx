import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { matchesShortcut, KEYBOARD_SHORTCUTS, getShortcutDescription } from '../../utils/flowOptimizationService';

/**
 * Keyboard Shortcut Handler
 * 
 * Provides keyboard navigation and shortcuts for faster workflow
 */
const ShortcutHandler = ({
  onNextCategory,
  onPrevCategory,
  onNextOption,
  onPrevOption,
  onCopy,
  onRandomize,
  onRandomizeAll,
  onSave,
  onToggleLock,
  onToggleInclude,
  onToggleFavorite,
  onEscape,
  enabled = true,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        // Allow some shortcuts even in inputs
        if (matchesShortcut(event, KEYBOARD_SHORTCUTS.ESCAPE)) {
          onEscape?.();
        }
        return;
      }

      // Help dialog
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        setShowHelp(true);
        return;
      }

      // Navigation
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.NEXT_CATEGORY)) {
        event.preventDefault();
        onNextCategory?.();
        return;
      }

      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.PREV_CATEGORY)) {
        event.preventDefault();
        onPrevCategory?.();
        return;
      }

      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.NEXT_OPTION)) {
        event.preventDefault();
        onNextOption?.();
        return;
      }

      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.PREV_OPTION)) {
        event.preventDefault();
        onPrevOption?.();
        return;
      }

      // Actions
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.COPY_PROMPT)) {
        event.preventDefault();
        onCopy?.();
        return;
      }

      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.RANDOMIZE)) {
        event.preventDefault();
        onRandomize?.();
        return;
      }

      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.RANDOMIZE_ALL)) {
        event.preventDefault();
        onRandomizeAll?.();
        return;
      }

      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.SAVE_SET) || 
          matchesShortcut(event, KEYBOARD_SHORTCUTS.SAVE_SET_MAC)) {
        event.preventDefault();
        onSave?.();
        return;
      }

      // Category controls
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.TOGGLE_LOCK)) {
        event.preventDefault();
        onToggleLock?.();
        return;
      }

      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.TOGGLE_INCLUDE)) {
        event.preventDefault();
        onToggleInclude?.();
        return;
      }

      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.TOGGLE_FAVORITE)) {
        event.preventDefault();
        onToggleFavorite?.();
        return;
      }

      // Escape
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.ESCAPE)) {
        event.preventDefault();
        onEscape?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onNextCategory,
    onPrevCategory,
    onNextOption,
    onPrevOption,
    onCopy,
    onRandomize,
    onRandomizeAll,
    onSave,
    onToggleLock,
    onToggleInclude,
    onToggleFavorite,
    onEscape,
  ]);

  const shortcuts = [
    { label: 'Copy Prompt', shortcut: KEYBOARD_SHORTCUTS.COPY_PROMPT },
    { label: 'Randomize Current', shortcut: KEYBOARD_SHORTCUTS.RANDOMIZE },
    { label: 'Randomize All', shortcut: KEYBOARD_SHORTCUTS.RANDOMIZE_ALL },
    { label: 'Save Set', shortcut: KEYBOARD_SHORTCUTS.SAVE_SET },
    { label: 'Toggle Lock', shortcut: KEYBOARD_SHORTCUTS.TOGGLE_LOCK },
    { label: 'Toggle Include', shortcut: KEYBOARD_SHORTCUTS.TOGGLE_INCLUDE },
    { label: 'Toggle Favorite', shortcut: KEYBOARD_SHORTCUTS.TOGGLE_FAVORITE },
    { label: 'Next Category', shortcut: KEYBOARD_SHORTCUTS.NEXT_CATEGORY },
    { label: 'Previous Category', shortcut: KEYBOARD_SHORTCUTS.PREV_CATEGORY },
    { label: 'Next Option', shortcut: KEYBOARD_SHORTCUTS.NEXT_OPTION },
    { label: 'Previous Option', shortcut: KEYBOARD_SHORTCUTS.PREV_OPTION },
  ];

  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowHelp(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowHelp(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Keyboard size={24} color="#8b5cf6" />
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Keyboard Shortcuts
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shortcuts.map((item) => (
                <div
                  key={item.shortcut}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    {item.label}
                  </span>
                  <kbd
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#a78bfa',
                      fontFamily: 'monospace',
                    }}
                  >
                    {getShortcutDescription(item.shortcut)}
                  </kbd>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '24px',
                padding: '12px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Press <kbd style={{ padding: '2px 6px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '4px' }}>?</kbd> anytime to see this help
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShortcutHandler;

