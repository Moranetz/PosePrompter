import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer, Zap, Shuffle, ArrowRight, X, RefreshCw, Check, Sparkles } from 'lucide-react';
import AuthModal from './AuthModal';

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
    if (selectedMood !== 0 || selectedLighting !== 0) {
      setShowResult(true);
    }
  }, [selectedMood, selectedLighting]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f1419 50%, #0a0a0f 100%)',
      color: '#ffffff',
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
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '-0.3px'
        }}>
          Pose Prompter
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: '8px 20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.4)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'rgba(255,255,255,0.8)';
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
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 32px 80px'
      }}>

        {/* SECTION 1: The Pain - Frustration Acknowledgment */}
        <section style={{ marginBottom: '80px', textAlign: 'center' }}>
          
          {/* Pain point ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '100px',
              marginBottom: '32px'
            }}
          >
            <RefreshCw size={14} color="#ef4444" style={{ opacity: 0.7 }} />
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPainPoint}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: '13px',
                  color: 'rgba(239, 68, 68, 0.9)',
                  fontWeight: '500'
                }}
              >
                {painPoints[currentPainPoint]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Main headline - speaks to the frustration */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: '700',
              lineHeight: '1.15',
              letterSpacing: '-1.5px',
              marginBottom: '20px',
              color: '#ffffff'
            }}
          >
            Stop describing.<br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Start directing.</span>
          </motion.h1>

          {/* Subhead - the promise */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '520px',
              margin: '0 auto 40px',
              lineHeight: '1.6'
            }}
          >
            Click what you see in your head. Get prompts that actually work.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>No more prompt engineering. No more wasted credits.</span>
          </motion.p>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: '16px 36px',
              background: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              color: '#0a0a0f',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 30px rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Try It Free
            <ArrowRight size={18} />
          </motion.button>
        </section>


        {/* SECTION 2: The Interactive Demo - Show, Don't Tell */}
        <section style={{ marginBottom: '100px' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '40px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Demo header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '40px',
              position: 'relative',
              zIndex: 2
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px'
              }}>
                See It In Action
              </span>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#ffffff',
                marginTop: '8px',
                letterSpacing: '-0.5px'
              }}>
                Click. Don't type.
              </h2>
            </div>

            {/* Interactive demo area */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
              position: 'relative',
              zIndex: 2
            }}>
              
              {/* Mood Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '12px'
                }}>
                  Mood
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {demoCategories.map((cat, i) => (
                    <motion.button
                      key={cat.name}
                      onClick={() => setSelectedMood(i)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '10px 18px',
                        background: selectedMood === i ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedMood === i ? cat.color : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: selectedMood === i ? cat.color : 'rgba(255,255,255,0.6)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {selectedMood === i && <Check size={14} />}
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Lighting Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '12px'
                }}>
                  Lighting
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {demoLighting.map((light, i) => (
                    <motion.button
                      key={light.name}
                      onClick={() => setSelectedLighting(i)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '10px 18px',
                        background: selectedLighting === i ? `${light.color}20` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedLighting === i ? light.color : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: selectedLighting === i ? light.color : 'rgba(255,255,255,0.6)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {selectedLighting === i && <Check size={14} />}
                      {light.name}
                    </motion.button>
                  ))}
                </div>
              </div>
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
                    marginTop: '32px',
                    padding: '20px 24px',
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
                    gap: '12px'
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
                        fontSize: '13px',
                        color: 'rgba(34, 197, 94, 0.9)',
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        Prompt generated instantly
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: '1.6',
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace'
                      }}>
                        "{demoCategories[selectedMood].name} pose with {demoLighting[selectedLighting].name.toLowerCase()} lighting, 
                        {selectedMood === 0 ? ' direct eye contact, strong posture, chin slightly raised' : 
                         selectedMood === 1 ? ' averted gaze, subtle shadows, enigmatic expression' :
                         selectedMood === 2 ? ' genuine smile, dynamic movement, relaxed shoulders' :
                         ' soft focus, peaceful expression, natural breathing'}..."
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.3)',
                        marginTop: '12px'
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


        {/* SECTION 3: The Transformation - Before/After */}
        <section style={{ marginBottom: '100px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              From prompt-beggar to art director
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
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
                  padding: '28px',
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
                  marginBottom: '20px'
                }}>
                  <item.icon size={20} color={item.color} />
                </div>
                
                {/* Before */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  <X size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: '1.5',
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
                  gap: '10px'
                }}>
                  <Check size={16} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: '1.5',
                    fontWeight: '500'
                  }}>
                    {item.after}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* SECTION 4: The Identity Hook - You're the Curator */}
        <section style={{ marginBottom: '100px' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              borderRadius: '16px',
              padding: '48px 40px',
              textAlign: 'center'
            }}
          >
            <h2 style={{
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '-0.5px'
            }}>
              Your vision. Your choices. Your gallery.
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '480px',
              margin: '0 auto 32px',
              lineHeight: '1.6'
            }}>
              You don't get one result. You get options.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                You select. You curate. You're the creative director.
              </span>
            </p>

            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 24px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 24px rgba(139, 92, 246, 0.3)';
              }}
            >
              Start Creating
              <ArrowRight size={18} />
            </button>

            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.3)',
              marginTop: '16px'
            }}>
              Free to start. No credit card required.
            </p>
          </motion.div>
        </section>


        {/* SECTION 5: Quick Stats / Trust */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '48px',
            flexWrap: 'wrap',
            paddingBottom: '40px'
          }}
        >
          {[
            { value: '30+', label: 'Visual categories' },
            { value: '0', label: 'Prompts to type' },
            { value: '100%', label: 'Usable outputs' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '4px',
                letterSpacing: '-1px'
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: '500'
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
        padding: '24px 32px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)'
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
