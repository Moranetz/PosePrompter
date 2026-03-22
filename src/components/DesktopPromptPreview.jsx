import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Sparkles } from 'lucide-react';

const DesktopPromptPreview = ({
  selections,
  mergedCategories: categories,
  includedCategories,
  autoExcludedCategories = [],
  categoryColors,
  categoryDisplayNames,
  onCopy,
  copied,
}) => {
  // Build prompt segments with category color info
  const promptSegments = useMemo(() => {
    if (!selections || Object.keys(selections).length === 0) return [];

    return Object.entries(selections)
      .filter(([category]) => {
        if (!includedCategories[category]) return false;
        if (autoExcludedCategories.includes(category)) return false;
        return true;
      })
      .map(([category, index]) => {
        const item = categories[category]?.[index];
        if (!item) return null;
        const text = typeof item === 'string' ? item : item.prompt;
        if (!text || !text.trim()) return null;
        return {
          category,
          text: text.trim(),
          color: categoryColors[category] || '#8b5cf6',
          displayName: categoryDisplayNames[category] || category,
        };
      })
      .filter(Boolean);
  }, [selections, categories, includedCategories, autoExcludedCategories, categoryColors, categoryDisplayNames]);

  const fullText = promptSegments.map(s => s.text).join(' ');
  const wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = fullText.length;
  const isEmpty = promptSegments.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '16px 20px',
        margin: '0 auto',
        maxWidth: '840px',
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isEmpty ? '0' : '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Sparkles size={13} color="rgba(255, 255, 255, 0.5)" />
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}>
            Generated Prompt
          </span>
        </div>

        {!isEmpty && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.3)',
              fontFeatureSettings: '"tnum"',
            }}>
              {wordCount} words &middot; {charCount} chars
            </span>
            <button
              onClick={onCopy}
              style={{
                padding: '5px 10px',
                background: copied
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'rgba(255, 255, 255, 0.06)',
                border: copied
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                color: copied ? '#4ade80' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* Prompt Body */}
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.25)',
              fontStyle: 'italic',
              lineHeight: '1.6',
            }}
          >
            Select categories or hit Randomize to build your prompt...
          </motion.p>
        ) : (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: '13px',
              lineHeight: '1.7',
              color: '#f4f4f5',
              wordBreak: 'break-word',
              maxHeight: '100px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            }}
          >
            {promptSegments.map((segment, i) => (
              <span key={segment.category}>
                <span
                  style={{
                    color: segment.color,
                    opacity: 0.9,
                    transition: 'opacity 0.2s',
                  }}
                  title={segment.displayName}
                >
                  {segment.text}
                </span>
                {i < promptSegments.length - 1 && (
                  <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>{' '}</span>
                )}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DesktopPromptPreview;
