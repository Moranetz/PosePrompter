import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Confetti = ({ onComplete, zIndex = 10001 }) => {
  const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#e9d5ff', '#f3e8ff', '#fbbf24', '#22c55e', '#ef4444'];
  const confettiCount = 100;

  useEffect(() => {
    if (onComplete) {
      // Wait for all confetti to finish (max delay + max duration = 3 + 6 = 9 seconds)
      const timer = setTimeout(() => onComplete(), 9000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: zIndex,
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      {Array.from({ length: confettiCount }).map((_, i) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomX = Math.random() * 100; // 0-100% of viewport width
        const randomDelay = Math.random() * 3; // Stagger over 3 seconds
        const randomDuration = 4 + Math.random() * 2; // 4-6 seconds duration
        const randomRotation = Math.random() * 360;

        return (
          <motion.div
            key={i}
            initial={{
              x: `${randomX}vw`, // Use vw units for viewport-relative positioning
              y: '-10vh',
              rotate: randomRotation,
              opacity: 1,
            }}
            animate={{
              y: '110vh', // Use vh units for viewport-relative positioning
              rotate: randomRotation + 360,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              background: randomColor,
              borderRadius: '2px',
              boxShadow: `0 0 8px ${randomColor}`,
              left: 0, // Reset left to use x transform
              top: 0, // Reset top to use y transform
            }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;

