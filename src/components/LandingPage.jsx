import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer, Zap, Shuffle, ArrowRight, X, RefreshCw, Check, Sparkles, Star } from 'lucide-react';
import AuthModal from './AuthModal';
import { 
  SPACING, 
  TYPOGRAPHY, 
  COLORS, 
  TOUCH_TARGETS,
  getProgressPercent,
  OPTICAL_GUIDE,
  VERTICAL_RHYTHM
} from '../config/uxDesignSystem';

// Map design system constants for backward compatibility
const SPACE = SPACING;
const TYPE = {
  xs: TYPOGRAPHY.SM,
  sm: TYPOGRAPHY.BASE,
  base: TYPOGRAPHY.MD,
  lg: TYPOGRAPHY.LG,
  xl: TYPOGRAPHY.XL,
  '2xl': TYPOGRAPHY['2XL'],
  '3xl': TYPOGRAPHY['3XL'],
  '4xl': TYPOGRAPHY['4XL'],
};

// Pain points that resonate with the target audience
const painPoints = [
  "Typing 'cinematic lighting' for the 47th time...",
  "Getting weird hands and uncanny faces... again",
  "Regenerating, hoping this time it'll work",
  "20 minutes describing a pose you can see in your head",
  "Wasting credits on outputs that miss the vibe"
];

// Interactive demo categories
const demoCategories = [
  { name: 'Confident', color: '#f59e0b', selected: true },
  { name: 'Mysterious', color: '#8b5cf6', selected: false },
  { name: 'Playful', color: '#ec4899', selected: false },
  { name: 'Serene', color: '#06b6d4', selected: false },
];

const demoLighting = [
  { name: 'Golden Hour', color: '#f59e0b', selected: true },
  { name: 'Neon Glow', color: '#ec4899', selected: false },
  { name: 'Studio Soft', color: '#6b7280', selected: false },
];

const LandingPage = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentPainPoint, setCurrentPainPoint] = useState(0);
  const [selectedMood, setSelectedMood] = useState(0);
  const [selectedLighting, setSelectedLighting] = useState(0);
  const [hasSelectedMood, setHasSelectedMood] = useState(false);
  const [hasSelectedLighting, setHasSelectedLighting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Cycle through pain points
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPainPoint((prev) => (prev + 1) % painPoints.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show result after selections
  useEffect(() => {
    if (hasSelectedMood && hasSelectedLighting) {
      setShowResult(true);
    }
  }, [hasSelectedMood, hasSelectedLighting]);

  const completedSteps = Number(hasSelectedMood) + Number(hasSelectedLighting);
  const totalSteps = 2;
  const progressPercent = getProgressPercent(completedSteps, totalSteps);
  const currentStepLabel = Math.min(completedSteps + 1, totalSteps);

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.NEUTRAL.BG,
      color: COLORS.neutralText,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Header - minimal */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        padding: SPACE[3] + ' ' + SPACE[4],
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            fontSize: TYPE.base,
            fontWeight: 600,
            color: COLORS.NEUTRAL.MUTED,
            letterSpacing: '-0.3px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center'
          }}
          aria-label="Back to top"
        >
          Pose Prompter
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: SPACE[1] + ' ' + SPACE[3],
              minHeight: '44px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: COLORS.NEUTRAL.MUTED,
              fontSize: TYPE.sm,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.4)';
              e.target.style.color = COLORS.NEUTRAL.TEXT;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              e.target.style.color = COLORS.NEUTRAL.MUTED;
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: SPACE[10] + ' ' + SPACE[4] + ' ' + SPACE[12]
      }}>

        {/* HERO SECTION - 5 Elements Structure */}
        <section style={{ 
          marginBottom: SPACE[12],
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: SPACE[8],
          alignItems: 'center',
          minHeight: '80vh'
        }}>
          {/* Left: Text Content (Elements 1-4) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            {/* 1. KICKER - Social Proof Primer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: SPACE[1],
                marginBottom: SPACE[2],
                padding: SPACE[1] + ' ' + SPACE[2],
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '100px'
              }}
            >
              <Star size={12} color={COLORS.BRAND.PRIMARY} fill={COLORS.BRAND.PRIMARY} />
              <span style={{
                fontSize: TYPE.sm,
                fontWeight: 500,
                color: COLORS.BRAND.PRIMARY,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Trusted by 10,000+ Creators
              </span>
            </motion.div>

            {/* 2. HEADLINE - Value Proposition (H1) - Optical Guide: Longest line */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontSize: TYPE['4xl'],
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-2px',
                marginBottom: SPACE[3],
                color: COLORS.neutralText,
                maxWidth: '600px',
                textAlign: 'left'
              }}
            >
              Get AI prompts that actually work—without typing a single word
            </motion.h1>

            {/* 3. DESCRIPTION - Problem + Solution Detail - Optical Guide: Medium line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: TYPE.lg,
                lineHeight: 1.6,
                color: COLORS.NEUTRAL.MUTED,
                marginBottom: SPACE[4],
                maxWidth: '500px',
                textAlign: 'left'
              }}
            >
              Click what you see in your head. Get prompts that generate usable results every time. No more wasted credits or prompt engineering.
            </motion.p>

            {/* 4. CTA BUTTON(S) - Primary Action - Optical Guide: Shortest line (creates diagonal funnel) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                display: 'flex',
                gap: SPACE[2],
                flexWrap: 'wrap',
                alignItems: 'flex-start'
              }}
            >
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  padding: SPACE[2] + ' ' + SPACE[4],
                  minHeight: `${TOUCH_TARGETS.LARGE}px`,
                  background: COLORS.ACCENT.CTA,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: TYPE.lg,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: SPACE[1],
                  transition: 'all 150ms ease',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = COLORS.ACCENT.CTA_HOVER;
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = COLORS.ACCENT.CTA;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }}
              >
                Start Free Trial
                <ArrowRight size={18} />
              </button>
          <button
                onClick={() => {
                  document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
              padding: SPACE[2] + ' ' + SPACE[4],
              minHeight: '48px',
                  background: 'transparent',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: COLORS.neutralText,
                  fontSize: TYPE.lg,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.background = 'transparent';
                }}
              >
                See Demo
              </button>
            </motion.div>

            {/* Trust indicators below CTA */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                fontSize: TYPE.sm,
                color: COLORS.NEUTRAL.SUBTLE,
                marginTop: SPACE[2]
              }}
            >
              Free to start • No credit card required • Setup in 2 minutes
            </motion.p>
          </div>

          {/* Right: Key Visual (Element 5) - Placeholder for person/product visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '500px'
            }}
          >
            {/* Placeholder visual - Replace with actual person/product image */}
            <div style={{
              width: '100%',
              maxWidth: '500px',
              aspectRatio: '4/5',
                background: `linear-gradient(135deg, ${COLORS.BRAND.LIGHT} 0%, rgba(236, 72, 153, 0.1) 100%)`,
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Demo visualization */}
              <div style={{
                padding: SPACE[6],
                textAlign: 'center',
                color: COLORS.NEUTRAL.MUTED
              }}>
                <Sparkles size={64} color={COLORS.BRAND.PRIMARY} style={{ marginBottom: SPACE[3] }} />
                <p style={{ fontSize: TYPE.base, marginTop: SPACE[2] }}>
                  Key Visual Placeholder
                </p>
                <p style={{ fontSize: TYPE.sm, color: COLORS.neutralSubtle, marginTop: SPACE[1] }}>
                  Add person/product image here
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 2: Interactive Demo - Small Section (Vertical Rhythm) */}
        <section id="demo-section" style={{ marginBottom: SPACE[10] }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: SPACE[5],
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Demo header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: SPACE[5],
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: SPACE[1],
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: SPACE[2]
              }}>
                <span style={{
                  fontSize: TYPE.xs,
                  fontWeight: 600,
                  color: COLORS.NEUTRAL.SUBTLE,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Step {currentStepLabel} of {totalSteps}
                </span>
                <span style={{
                  fontSize: TYPE.xs,
                  color: COLORS.NEUTRAL.MUTED
                }}>
                  {completedSteps}/2 selections
                </span>
              </div>
              <span style={{
                fontSize: TYPE.xs,
                fontWeight: 600,
                color: COLORS.NEUTRAL.SUBTLE,
                textTransform: 'uppercase',
                letterSpacing: '1.5px'
              }}>
                See It In Action
              </span>
              <h2 style={{
                fontSize: TYPE.xl,
                fontWeight: 600,
                color: COLORS.neutralText,
                marginTop: SPACE[1],
                letterSpacing: '-0.5px'
              }}>
                Click. Don't type.
              </h2>
            </div>

            {/* Interactive demo area */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: SPACE[4],
              position: 'relative',
              zIndex: 2
            }}>
              
              {/* Mood Selection */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: SPACE[3]
              }}>
                <label style={{
                  display: 'block',
                  fontSize: TYPE.xs,
                  fontWeight: 600,
                  color: COLORS.NEUTRAL.SUBTLE,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: SPACE[2]
                }}>
                  Mood
                </label>
                <p style={{
                  fontSize: TYPE.xs,
                  color: COLORS.NEUTRAL.MUTED,
                  marginTop: '-6px',
                  marginBottom: SPACE[2]
                }}>
                  Pick the vibe you want to convey.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE[1] }}>
                  {demoCategories.map((cat, i) => (
                    <motion.button
                      key={cat.name}
                      onClick={() => {
                        setSelectedMood(i);
                        setHasSelectedMood(true);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: SPACE[1] + ' ' + SPACE[2],
                        minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
                        background: selectedMood === i ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedMood === i ? cat.color : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: selectedMood === i ? cat.color : COLORS.NEUTRAL.MUTED,
                        fontSize: TYPE.sm,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: SPACE[1]
                      }}
                      aria-pressed={selectedMood === i}
                    >
                      {selectedMood === i && <Check size={14} />}
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Lighting Selection */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: SPACE[3]
              }}>
                <label style={{
                  display: 'block',
                  fontSize: TYPE.xs,
                  fontWeight: 600,
                  color: COLORS.NEUTRAL.SUBTLE,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: SPACE[2]
                }}>
                  Lighting
                </label>
                <p style={{
                  fontSize: TYPE.xs,
                  color: COLORS.NEUTRAL.MUTED,
                  marginTop: '-6px',
                  marginBottom: SPACE[2]
                }}>
                  Choose the lighting style.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE[1] }}>
                  {demoLighting.map((light, i) => (
                    <motion.button
                      key={light.name}
                      onClick={() => {
                        setSelectedLighting(i);
                        setHasSelectedLighting(true);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: SPACE[1] + ' ' + SPACE[2],
                        minHeight: `${TOUCH_TARGETS.MEDIUM}px`,
                        background: selectedLighting === i ? `${light.color}20` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedLighting === i ? light.color : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: selectedLighting === i ? light.color : COLORS.NEUTRAL.MUTED,
                        fontSize: TYPE.sm,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: SPACE[1]
                      }}
                      aria-pressed={selectedLighting === i}
                    >
                      {selectedLighting === i && <Check size={14} />}
                      {light.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: SPACE[3],
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                height: '6px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: COLORS.ACCENT.CTA,
                  transition: 'width 200ms ease'
                }} />
              </div>
              <p style={{
                fontSize: TYPE.xs,
                color: COLORS.NEUTRAL.SUBTLE,
                marginTop: SPACE[1]
              }}>
                Instant preview updates as you choose.
              </p>
            </div>

            {/* Result preview */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    marginTop: SPACE[4],
                    padding: SPACE[3],
                    background: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '10px',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: SPACE[2]
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <Sparkles size={12} color="#22c55e" />
                    </div>
                    <div>
                      <p style={{
                        fontSize: TYPE.sm,
                        color: 'rgba(34, 197, 94, 0.9)',
                        fontWeight: 500,
                        marginBottom: SPACE[1]
                      }}>
                        Prompt generated instantly
                      </p>
                      <p style={{
                        fontSize: TYPE.sm,
                        color: COLORS.NEUTRAL.MUTED,
                        lineHeight: 1.6,
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace'
                      }}>
                        "{demoCategories[selectedMood].name} pose with {demoLighting[selectedLighting].name.toLowerCase()} lighting, 
                        {selectedMood === 0 ? ' direct eye contact, strong posture, chin slightly raised' : 
                         selectedMood === 1 ? ' averted gaze, subtle shadows, enigmatic expression' :
                         selectedMood === 2 ? ' genuine smile, dynamic movement, relaxed shoulders' :
                         ' soft focus, peaceful expression, natural breathing'}..."
                      </p>
                      <p style={{
                        fontSize: TYPE.xs,
                        color: COLORS.NEUTRAL.SUBTLE,
                        marginTop: SPACE[2]
                      }}>
                        2 clicks. Zero typing. Ready to paste.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Background glow */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: `radial-gradient(circle, ${demoCategories[selectedMood].color}10 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              transition: 'background 0.5s ease'
            }} />
          </motion.div>
        </section>


        {/* SECTION 3: The Transformation - Large Section (Vertical Rhythm) */}
        <section style={{ marginBottom: SPACE[12] }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: SPACE[6] }}
          >
            <h2 style={{
              fontSize: TYPE['2xl'],
              fontWeight: 600,
              color: COLORS.neutralText,
              letterSpacing: '-0.5px'
            }}>
              From prompt-beggar to art director
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: SPACE[3]
          }}>
            {[
              {
                before: "Type paragraphs hoping it understands",
                after: "Click buttons that speak your language",
                icon: MousePointer,
                color: '#f59e0b'
              },
              {
                before: "Regenerate and pray for better results",
                after: "Always get usable options to choose from",
                icon: Shuffle,
                color: '#22c55e'
              },
              {
                before: "Feel like you're fighting the machine",
                after: "Feel like you're directing the shoot",
                icon: Zap,
                color: '#8b5cf6'
              },
              {
                before: "Generic outputs that look like everyone else's",
                after: "Your taste, your curation, your unique gallery",
                icon: Sparkles,
                color: '#ec4899'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: SPACE[4],
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: `${item.color}15`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: SPACE[3]
                }}>
                  <item.icon size={20} color={item.color} />
                </div>
                
                {/* Before */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: SPACE[1],
                  marginBottom: SPACE[2]
                }}>
                  <X size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{
                    fontSize: TYPE.sm,
                    color: COLORS.NEUTRAL.SUBTLE,
                    lineHeight: 1.5,
                    textDecoration: 'line-through',
                    textDecorationColor: 'rgba(239, 68, 68, 0.3)'
                  }}>
                    {item.before}
                  </p>
                </div>

                {/* After */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: SPACE[1]
                }}>
                  <Check size={16} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{
                    fontSize: TYPE.sm,
                    color: COLORS.neutralText,
                    lineHeight: 1.5,
                    fontWeight: 500
                  }}>
                    {item.after}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* SECTION 4: The Identity Hook - Small Section (Vertical Rhythm) */}
        <section style={{ marginBottom: SPACE[12] }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: `linear-gradient(135deg, ${COLORS.brandLight} 0%, rgba(236, 72, 153, 0.08) 100%)`,
              border: `1px solid ${COLORS.BRAND.PRIMARY}20`,
              borderRadius: '16px',
              padding: SPACE[6] + ' ' + SPACE[5],
              textAlign: 'center'
            }}
          >
            <h2 style={{
              fontSize: TYPE.xl,
              fontWeight: 600,
              color: COLORS.neutralText,
              marginBottom: SPACE[2],
              letterSpacing: '-0.5px'
            }}>
              Your vision. Your choices. Your gallery.
            </h2>
            <p style={{
              fontSize: TYPE.base,
              color: COLORS.NEUTRAL.MUTED,
              maxWidth: '480px',
              margin: '0 auto ' + SPACE[4],
              lineHeight: 1.6
            }}>
              You don't get one result. You get options. You select. You curate. You're the creative director.
            </p>

            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: SPACE[2] + ' ' + SPACE[5],
                minHeight: `${TOUCH_TARGETS.LARGE}px`,
                background: COLORS.ACCENT.CTA,
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: TYPE.base,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: SPACE[1],
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
            >
              Start Creating
              <ArrowRight size={18} />
            </button>

            <p style={{
              fontSize: TYPE.sm,
              color: COLORS.NEUTRAL.SUBTLE,
              marginTop: SPACE[2]
            }}>
              Free to start. No credit card required.
            </p>
          </motion.div>
        </section>


        {/* SECTION 5: Quick Stats / Trust - Small Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: SPACE[6],
            flexWrap: 'wrap',
            paddingBottom: SPACE[5]
          }}
        >
          {[
            { value: '30+', label: 'Visual categories' },
            { value: '0', label: 'Prompts to type' },
            { value: '100%', label: 'Usable outputs' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: TYPE['2xl'],
                fontWeight: 700,
                color: COLORS.neutralText,
                marginBottom: SPACE[1],
                letterSpacing: '-1px'
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: TYPE.sm,
                color: COLORS.NEUTRAL.SUBTLE,
                fontWeight: 500
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.section>

      </main>

      {/* Footer - minimal */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: SPACE[3] + ' ' + SPACE[4],
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: TYPE.xs,
          color: COLORS.neutralSubtle
        }}>
          Pose Prompter
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;
