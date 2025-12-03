import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Confetti = ({ onComplete }) => {
  const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#e9d5ff', '#f3e8ff'];
  const confettiCount = 50;

  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => onComplete(), 3000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10001,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: confettiCount }).map((_, i) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomDuration = 2 + Math.random() * 1;
        const randomRotation = Math.random() * 360;

        return (
          <motion.div
            key={i}
            initial={{
              x: `${randomX}%`,
              y: '-10%',
              rotate: randomRotation,
              opacity: 1,
            }}
            animate={{
              y: '110%',
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
            }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;

