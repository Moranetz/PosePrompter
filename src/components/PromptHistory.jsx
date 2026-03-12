import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Copy, Check, Trash2, X, ChevronDown } from 'lucide-react';

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

const PromptHistory = ({ history, onSelect, onRemove, onClear, isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const sortedHistory = useMemo(() => [...history].reverse(), [history]);

  const handleCopy = async (e, entry) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(entry.prompt);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = entry.prompt;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    onRemove?.(id);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '360px',
          maxWidth: '92vw',
          height: '100vh',
          background: 'linear-gradient(180deg, #0c0c14 0%, #09090f 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          zIndex: 10002,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: '-0.2px',
            }}>
              Prompt History
            </span>
            <span style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.25)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {history.length}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {history.length > 0 && (
              <button
                onClick={onClear}
                style={{
                  padding: '4px 10px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: '6px',
                  color: 'rgba(239,68,68,0.6)',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '6px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                display: 'flex',
                transition: 'all 0.2s',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
        }}>
          {sortedHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '13px',
              lineHeight: '1.6',
            }}>
              <Clock size={28} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p>No prompts yet.</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                Copy or randomize a prompt to start building history.
              </p>
            </div>
          ) : (
            sortedHistory.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isCopied = copiedId === entry.id;
              const selKeys = Object.keys(entry.selections || {});

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: '6px',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                  }}
                >
                  {/* Preview line */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}>
                    <p style={{
                      flex: 1,
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: '1.5',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? 20 : 2,
                      WebkitBoxOrient: 'vertical',
                      fontFamily: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
                    }}>
                      {entry.prompt}
                    </p>
                    <ChevronDown
                      size={12}
                      style={{
                        color: 'rgba(255,255,255,0.2)',
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    />
                  </div>

                  {/* Expanded: category chips */}
                  {isExpanded && selKeys.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginTop: '10px',
                    }}>
                      {selKeys.slice(0, 8).map(cat => (
                        <span
                          key={cat}
                          style={{
                            padding: '2px 8px',
                            background: 'rgba(168,85,247,0.08)',
                            border: '1px solid rgba(168,85,247,0.15)',
                            borderRadius: '4px',
                            fontSize: '10px',
                            color: 'rgba(168,85,247,0.6)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {entry.selections[cat]}
                        </span>
                      ))}
                      {selKeys.length > 8 && (
                        <span style={{
                          padding: '2px 8px',
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.25)',
                        }}>
                          +{selKeys.length - 8} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer: time + actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                  }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.2)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatTimeAgo(entry.timestamp)}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelect?.(entry); }}
                        style={{
                          padding: '3px 10px',
                          background: 'rgba(168,85,247,0.1)',
                          border: '1px solid rgba(168,85,247,0.2)',
                          borderRadius: '5px',
                          color: 'rgba(168,85,247,0.7)',
                          fontSize: '10px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        Reuse
                      </button>
                      <button
                        onClick={(e) => handleCopy(e, entry)}
                        style={{
                          padding: '3px 8px',
                          background: isCopied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isCopied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: '5px',
                          color: isCopied ? '#22c55e' : 'rgba(255,255,255,0.4)',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {isCopied ? <Check size={10} /> : <Copy size={10} />}
                      </button>
                      <button
                        onClick={(e) => handleRemove(e, entry.id)}
                        style={{
                          padding: '3px 6px',
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '5px',
                          color: 'rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          display: 'flex',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 10001,
        }}
      />
    </AnimatePresence>
  );
};

export default PromptHistory;
