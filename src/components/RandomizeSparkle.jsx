import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RandomizeSparkle - Celebratory micro-interaction after "I'm Feeling Lucky"
 *
 * Psychology: Variable Ratio Reinforcement (Skinner)
 * The randomize button is the app's core "slot machine" moment. Adding
 * a brief sparkle cascade creates the dopamine-release pattern that
 * sustains engagement. The occasional bonus message ("Great combo!")
 * uses variable reward scheduling — unpredictable rewards are more
 * engaging than predictable ones.
 */

const sparkleMessages = [
  null, null, null, null, // 60% chance of no message
  'Nice combo',
  'Interesting mix',
  'Try this one',
];

const RandomizeSparkle = ({ trigger, containerRef }) => {
  const [sparkles, setSparkles] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!trigger) return;

    // Generate sparkle particles
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.3,
      duration: 0.5 + Math.random() * 0.4,
      color: ['#14b8a6', '#eab308', '#f4f4f5', '#a78bfa'][Math.floor(Math.random() * 4)],
    }));

    setSparkles(newSparkles);

    // Variable reward message
    const msg = sparkleMessages[Math.floor(Math.random() * sparkleMessages.length)];
    if (msg) {
      setMessage(msg);
      setTimeout(() => setMessage(null), 1800);
    }

    // Cleanup sparkles
    const timer = setTimeout(() => setSparkles([]), 1200);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <>
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            initial={{
              opacity: 1,
              scale: 0,
              x: `${s.x}%`,
              y: `${s.y}%`,
            }}
            animate={{
              opacity: 0,
              scale: 1.5,
              y: `${s.y - 15 - Math.random() * 20}%`,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: s.color,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '4px 10px',
              background: 'rgba(20, 184, 166, 0.15)',
              border: '1px solid rgba(20, 184, 166, 0.25)',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 500,
              color: 'rgba(20, 184, 166, 0.9)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RandomizeSparkle;
