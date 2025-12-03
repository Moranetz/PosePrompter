import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PolaroidFrame = ({ isVisible, showFilter = false, isFraming = false }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        // Animated wrapper - must be motion component for AnimatePresence exit to work
        <motion.div
          key="polaroid-frame"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 100,
            overflow: 'hidden'
          }}
        >
          {/* Animated container - handles the swipe animation */}
          <motion.div
            initial={{ x: '-150%', rotate: -8 }}
            animate={isFraming 
              ? { 
                  x: '0%', 
                  rotate: [-2, 2, -2]
                }
              : { x: '0%', rotate: -2 }
            }
            exit={{ x: '150%', rotate: 8 }}
            transition={isFraming 
              ? {
                  x: {
                    type: 'spring',
                    stiffness: 180,
                    damping: 20
                  },
                  rotate: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
                  }
                }
              : {
                  type: 'spring',
                  stiffness: 180,
                  damping: 20
                }
            }
            style={{
              width: '55%',
              height: '75%',
              maxWidth: '280px',
              maxHeight: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            {/* Polaroid Frame - white border with transparent center */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                borderRadius: '6px',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
                pointerEvents: 'none'
              }}
            >
              {/* Classic photography filter overlay - only for Aesthetic & Style */}
              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    key="filter-overlay"
                    initial={{ x: '-150%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '150%', opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 180,
                      damping: 20
                    }}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    right: '14px',
                    bottom: '56px',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
                  {/* Subtle warm tone overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255, 235, 205, 0.08) 0%, rgba(255, 225, 190, 0.05) 100%)',
                      mixBlendMode: 'soft-light'
                    }}
                  />
                  
                  {/* Very subtle film grain texture */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px),
                        repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px)
                      `,
                      opacity: 0.3,
                      mixBlendMode: 'overlay'
                    }}
                  />
                  
                  {/* Subtle light leak effect */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10%',
                      right: '5%',
                      width: '30%',
                      height: '60%',
                      background: 'linear-gradient(135deg, transparent 0%, rgba(255, 200, 100, 0.06) 50%, transparent 100%)',
                      transform: 'rotate(-15deg)',
                      mixBlendMode: 'screen',
                      opacity: 0.5
                    }}
                  />

                  {/* Glare from bottom */}
                  <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5, type: 'spring' }}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                      background: 'linear-gradient(to top, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 70%)',
                      mixBlendMode: 'screen',
                      pointerEvents: 'none'
                    }}
                  />
                </motion.div>
                )}
              </AnimatePresence>
              {/* Top border */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '14px',
                  background: '#f8f8f8',
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)'
                }}
              />
              
              {/* Left border */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '14px',
                  background: '#f8f8f8',
                  borderTopLeftRadius: '6px',
                  borderBottomLeftRadius: '6px'
                }}
              />
              
              {/* Right border */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '14px',
                  background: '#f8f8f8',
                  borderTopRightRadius: '6px',
                  borderBottomRightRadius: '6px'
                }}
              />
              
              {/* Bottom label area - thicker like a real polaroid */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '56px',
                  background: 'linear-gradient(to bottom, #f8f8f8 0%, #f0f0f0 100%)',
                  borderBottomLeftRadius: '6px',
                  borderBottomRightRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)'
                }}
              >
                {/* Subtle line where you'd write */}
                <div
                  style={{
                    width: '60%',
                    height: '1px',
                    background: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '1px'
                  }}
                />
              </div>

              {/* Inner shadow to give depth */}
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  right: '14px',
                  bottom: '56px',
                  boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.15)',
                  borderRadius: '2px',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PolaroidFrame;
