import React from 'react';
import { motion } from 'framer-motion';

/**
 * HypnoticEffects - Subtle visual effects to enhance user experience
 * 
 * Effects included:
 * - Breathing radial gradient (4s cycle)
 * - Rotating spiral pattern (20s cycle) - for loading screens
 * - Gentle wave pattern (3s cycle)
 * - Floating particles (continuous)
 * - Pulsing border glow (2.5s cycle) - applied to container
 */

// Breathing Radial Gradient Component
export const BreathingGradient = ({ className = '' }) => {
  return (
    <motion.div
      className={`breathing-gradient ${className}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </motion.div>
  );
};

// Rotating Spiral Pattern Component (for loading screens)
export const RotatingSpiral = ({ className = '' }) => {
  return (
    <motion.div
      className={`rotating-spiral ${className}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        pointerEvents: 'none',
        zIndex: 1,
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(20, 184, 166, 0.3)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(20, 184, 166, 0.1)" />
          </linearGradient>
        </defs>
        {/* Spiral pattern using multiple arcs */}
        <path
          d="M 100 100 m -80 0 a 80 80 0 1 1 160 0 a 80 80 0 1 1 -160 0"
          fill="none"
          stroke="url(#spiralGradient)"
          strokeWidth="2"
          opacity="0.4"
        />
        <path
          d="M 100 100 m -60 0 a 60 60 0 1 1 120 0 a 60 60 0 1 1 -120 0"
          fill="none"
          stroke="url(#spiralGradient)"
          strokeWidth="1.5"
          opacity="0.3"
        />
        <path
          d="M 100 100 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0"
          fill="none"
          stroke="url(#spiralGradient)"
          strokeWidth="1"
          opacity="0.25"
        />
      </svg>
    </motion.div>
  );
};

// Gentle Wave Pattern Component
export const WavePattern = ({ className = '' }) => {
  return (
    <motion.div
      className={`wave-pattern ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        preserveAspectRatio="none"
        viewBox="0 0 1600 200"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(20, 184, 166, 0.08)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.06)" />
            <stop offset="100%" stopColor="rgba(20, 184, 166, 0.04)" />
          </linearGradient>
        </defs>
        {/* Multiple wave layers for depth - repeating pattern */}
        <path
          d="M 0 50 Q 200 30 400 50 T 800 50 T 1200 50 T 1600 50 L 1600 200 L 0 200 Z"
          fill="url(#waveGradient)"
          opacity="0.3"
        />
        <path
          d="M 0 100 Q 200 80 400 100 T 800 100 T 1200 100 T 1600 100 L 1600 200 L 0 200 Z"
          fill="url(#waveGradient)"
          opacity="0.2"
        />
        <path
          d="M 0 150 Q 200 130 400 150 T 800 150 T 1200 150 T 1600 150 L 1600 200 L 0 200 Z"
          fill="url(#waveGradient)"
          opacity="0.15"
        />
      </svg>
    </motion.div>
  );
};

// Floating Particles Component
export const FloatingParticles = ({ count = 15, className = '' }) => {
  const [screenHeight, setScreenHeight] = React.useState(1000);
  
  React.useEffect(() => {
    setScreenHeight(window.innerHeight);
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className={`floating-particles ${className}`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.left}%`,
            bottom: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(20, 184, 166, ${particle.opacity}) 0%, rgba(139, 92, 246, ${particle.opacity * 0.7}) 100%)`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(20, 184, 166, ${particle.opacity * 0.5})`,
          }}
          animate={{
            y: [0, -screenHeight - 100],
            x: [0, (Math.random() - 0.5) * 50],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
            scale: [1, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Pulsing Border Glow Component (wrapper for containers)
export const PulsingBorderGlow = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`pulsing-border-glow ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
      animate={{
        boxShadow: [
          '0 0 0px rgba(20, 184, 166, 0)',
          '0 0 20px rgba(20, 184, 166, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
          '0 0 0px rgba(20, 184, 166, 0)',
        ],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

// Combined Background Effects Component
export const HypnoticBackground = ({ showSpiral = false, className = '' }) => {
  return (
    <div
      className={`hypnotic-background ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <BreathingGradient />
      {showSpiral && <RotatingSpiral />}
      <WavePattern />
      <FloatingParticles count={15} />
    </div>
  );
};

// Loading Screen with Spiral
export const HypnoticLoadingScreen = ({ children }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <HypnoticBackground showSpiral={true} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default HypnoticBackground;

