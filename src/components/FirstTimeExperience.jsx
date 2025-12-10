import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer, Sparkles, Check, ArrowRight, Zap, Copy, X } from 'lucide-react';

/**
 * FirstTimeExperience - Onboarding overlay for new users
 * 
 * Psychological hooks implemented:
 * 1. Immediate "first hit of delight" - shows them success within 10 seconds
 * 2. Perceived control - they click, something happens immediately
 * 3. Identity shift - positions them as "director" not "user"
 * 4. Reduces anxiety - shows how simple the tool is
 */

const ONBOARDING_KEY = 'poseprompt_onboarding_complete';

// Quick demo options for the onboarding
const quickMoods = [
  { id: 'confident', label: 'Confident', color: '#f59e0b' },
  { id: 'mysterious', label: 'Mysterious', color: '#8b5cf6' },
  { id: 'playful', label: 'Playful', color: '#ec4899' },
];

const FirstTimeExperience = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [copied, setCopied] = useState(false);
  const skipButtonRef = useRef(null);
  const firstMoodButtonRef = useRef(null);

  // Check if user has already completed onboarding
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (completed === 'true') {
      onComplete?.();
    }
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
      // Tab navigation for mood buttons
      if (!selectedMood && e.key === 'Enter' && document.activeElement?.closest('[data-mood-button]')) {
        const activeButton = document.activeElement.closest('[data-mood-button]');
        if (activeButton) {
          const moodId = activeButton.getAttribute('data-mood-id');
          const mood = quickMoods.find(m => m.id === moodId);
          if (mood) handleMoodSelect(mood);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMood]);

  // Auto-focus first mood button for keyboard users
  useEffect(() => {
    if (!selectedMood && firstMoodButtonRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        firstMoodButtonRef.current?.focus();
      }, 100);
    }
  }, [selectedMood]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    // Delay to show the selection, then reveal result
    setTimeout(() => {
      setShowResult(true);
    }, 400);
  };

  const handleCopyPrompt = async () => {
    const promptText = moodPrompts[selectedMood.id];
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleComplete = () => {
    setIsExiting(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setTimeout(() => {
      onComplete?.();
    }, 500);
  };

  const handleSkip = () => {
    setIsExiting(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setTimeout(() => {
      onSkip?.();
    }, 300);
  };

  const moodPrompts = {
    confident: "Direct gaze, chin slightly raised, shoulders back, commanding presence with subtle power stance...",
    mysterious: "Averted gaze, face partially in shadow, enigmatic half-smile, contemplative stillness...",
    playful: "Genuine laugh caught mid-moment, relaxed shoulders, dynamic movement, infectious energy...",
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
              borderRadius: '20px',
              padding: 'clamp(32px, 6vw, 48px)',
              maxWidth: '520px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Skip button */}
            <button
              ref={skipButtonRef}
              onClick={handleSkip}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSkip();
                }
              }}
              aria-label="Skip introduction"
              style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
              onFocus={(e) => {
                e.target.style.color = 'rgba(255,255,255,0.7)';
                e.target.style.outline = '2px solid rgba(255,255,255,0.3)';
                e.target.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.target.style.color = 'rgba(255,255,255,0.4)';
                e.target.style.outline = 'none';
              }}
            >
              <X size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
              Skip
            </button>

            {/* Step 1: The hook */}
            {!selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <MousePointer size={26} color="#f59e0b" />
                </div>

                {/* Headline - speaks to their frustration */}
                <h2 style={{
                  fontSize: 'clamp(22px, 5vw, 28px)',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px',
                  lineHeight: '1.2'
                }}>
                  Stop typing. Start creating.
                </h2>

                <p style={{
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '32px',
                  lineHeight: '1.6'
                }}>
                  Generate perfect prompts with one click. Try it now—pick a mood:
                </p>

                {/* Quick selection buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '24px',
                  flexWrap: 'wrap'
                }}>
                  {quickMoods.map((mood, index) => (
                    <motion.button
                      key={mood.id}
                      ref={index === 0 ? firstMoodButtonRef : null}
                      data-mood-button
                      data-mood-id={mood.id}
                      onClick={() => handleMoodSelect(mood)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleMoodSelect(mood);
                        }
                      }}
                      aria-label={`Select ${mood.label} mood`}
                      style={{
                        flex: '1 1 0',
                        minWidth: '120px',
                        padding: '16px 20px',
                        background: `${mood.color}15`,
                        border: `1px solid ${mood.color}40`,
                        borderRadius: '12px',
                        color: mood.color,
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = `2px solid ${mood.color}`;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${mood.color}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = `1px solid ${mood.color}40`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {mood.label}
                    </motion.button>
                  ))}
                </div>

                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.4)',
                  textAlign: 'center',
                  marginBottom: '0'
                }}>
                  One click. That's it.
                </p>
              </motion.div>
            )}

            {/* Step 2: The payoff - show them immediate value */}
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                aria-live="polite"
                aria-atomic="true"
              >
                {/* Success indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                  >
                    <Check size={28} color="#22c55e" strokeWidth={3} />
                  </motion.div>
                </motion.div>

                <h2 style={{
                  fontSize: 'clamp(20px, 4vw, 24px)',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '8px',
                  letterSpacing: '-0.5px'
                }}>
                  That's your prompt.
                </h2>

                <p style={{
                  fontSize: 'clamp(13px, 2.5vw, 15px)',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '24px'
                }}>
                  Copy it and paste into your AI image generator.
                </p>

                {/* The generated prompt preview */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px',
                        border: `1px solid ${selectedMood.color}30`,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Sparkles size={14} color={selectedMood.color} />
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: selectedMood.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {selectedMood.label.toUpperCase()} MOOD
                          </span>
                        </div>
                        <motion.button
                          onClick={handleCopyPrompt}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCopyPrompt();
                            }
                          }}
                          aria-label={copied ? "Prompt copied" : "Copy prompt"}
                          style={{
                            padding: '6px 12px',
                            background: copied 
                              ? `linear-gradient(135deg, ${selectedMood.color} 0%, ${selectedMood.color}dd 100%)`
                              : 'rgba(255, 255, 255, 0.08)',
                            border: copied ? 'none' : `1px solid ${selectedMood.color}40`,
                            borderRadius: '8px',
                            color: copied ? '#ffffff' : selectedMood.color,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${selectedMood.color}30`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {copied ? (
                            <>
                              <Check size={12} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              Copy
                            </>
                          )}
                        </motion.button>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.9)',
                        lineHeight: '1.7',
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        margin: 0,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        userSelect: 'text'
                      }}>
                        "{moodPrompts[selectedMood.id]}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* The identity shift message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <Zap size={18} color="#a78bfa" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: '1.6',
                      margin: 0,
                      marginBottom: '8px',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>30+ categories</strong> to explore. Mix lighting, poses, styles, moods, and more.
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: '1.5',
                      margin: 0
                    }}>
                      <span style={{ color: '#a78bfa', fontWeight: '500' }}>You direct. It describes.</span> No more guessing what to type.
                    </p>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.button
                  onClick={handleComplete}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleComplete();
                    }
                  }}
                  aria-label="Start creating prompts"
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#0a0a0f',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  Start creating
                  <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            )}

            {/* Background glow */}
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '300px',
                  height: '300px',
                  background: `radial-gradient(circle, ${selectedMood.color}15 0%, transparent 70%)`,
                  borderRadius: '50%',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                  zIndex: -1
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirstTimeExperience;

