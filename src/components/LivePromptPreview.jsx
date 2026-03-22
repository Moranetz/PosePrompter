import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

const LivePromptPreview = ({ generatedPrompt, onCopy, copied }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!generatedPrompt) return null;

  // Truncate prompt for compact view
  const truncatedPrompt = generatedPrompt.length > 150 
    ? generatedPrompt.substring(0, 150) + '...' 
    : generatedPrompt;

  return (
    <motion.div
      className="live-prompt-preview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(18, 18, 26, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '10px 12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        zIndex: 10,
        margin: '0 auto'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px'
          }}>
            <Sparkles size={12} color="rgba(255, 255, 255, 0.6)" />
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Prompt Preview
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={isExpanded ? 'expanded' : 'collapsed'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.75)',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                maxHeight: isExpanded ? '200px' : 'none',
                overflow: isExpanded ? 'auto' : 'hidden'
              }}
            >
              {isExpanded ? generatedPrompt : truncatedPrompt}
            </motion.p>
          </AnimatePresence>
          {generatedPrompt.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                marginTop: '6px',
                padding: '4px 8px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={12} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={12} />
                  Show full prompt
                </>
              )}
            </button>
          )}
        </div>
        <button
          onClick={onCopy}
          style={{
            padding: '8px 12px',
            background: copied 
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '8px',
            color: copied ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }
          }}
        >
          <Copy size={12} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </motion.div>
  );
};

export default LivePromptPreview;
