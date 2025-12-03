import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';

/**
 * AchievementNotification - Shows when user unlocks achievements
 * 
 * Ethical engagement: Celebrates user progress and milestones
 * without manipulation. Users feel accomplished, not trapped.
 */

const AchievementNotification = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // Play achievement sound
      try {
        // Try to play the sound file from public folder
        const audio = new Audio('/achievement-sound.mp3');
        audio.volume = 0.5; // Set volume to 50% to avoid being too loud
        audio.play().catch(error => {
          // Silently fail if audio can't play (e.g., user hasn't interacted with page yet)
          console.log('Could not play achievement sound:', error);
        });
        audioRef.current = audio;
      } catch (error) {
        console.log('Error loading achievement sound:', error);
      }
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, 5000);
      return () => {
        clearTimeout(timer);
        // Clean up audio if component unmounts
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [achievement, onClose]);

  if (!achievement || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 25 
        }}
        style={{
          position: 'fixed',
          top: '32px',
          right: '32px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(251, 191, 36, 0.1)',
          zIndex: 10000,
          maxWidth: '360px',
          minWidth: '300px',
        }}
      >
        {/* Close button */}
        <motion.button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'color 200ms',
          }}
          onHoverStart={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
          onHoverEnd={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
        >
          <X size={16} />
        </motion.button>

        {/* Trophy icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 15,
            delay: 0.1 
          }}
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            border: '2px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
          >
            <Trophy size={28} color="#fbbf24" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        {/* Achievement text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h3
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#ffffff',
              margin: 0,
              marginBottom: '6px',
              letterSpacing: '-0.3px',
            }}
          >
            Achievement Unlocked!
          </motion.h3>
          <motion.p
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#fbbf24',
              margin: 0,
              marginBottom: '8px',
            }}
          >
            {achievement.name}
          </motion.p>
          <motion.p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: 0,
              lineHeight: '1.5',
            }}
          >
            {achievement.description}
          </motion.p>
        </motion.div>

        {/* Sparkle effects */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              scale: 0,
              x: '50%',
              y: '50%',
            }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.5, 0],
              x: '50%' + (Math.random() - 0.5) * 200,
              y: '50%' + (Math.random() - 0.5) * 200,
            }}
            transition={{ 
              duration: 1.5, 
              delay: 0.3 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '4px',
              height: '4px',
              background: '#fbbf24',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementNotification;

