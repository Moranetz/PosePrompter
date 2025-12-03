import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Lock, Unlock, Heart, Copy } from 'lucide-react';
import { triggerFeedback, getFeedbackConfig, FEEDBACK_TYPES } from '../../utils/visualFeedbackService';

/**
 * Visual Feedback Provider
 * 
 * Listens for feedback events and displays satisfying micro-interactions
 */
const FeedbackProvider = ({ children }) => {
  const [activeFeedback, setActiveFeedback] = useState(null);

  useEffect(() => {
    const handleFeedback = (event) => {
      const { type, intensity, category, message, duration } = event.detail;
      const config = getFeedbackConfig(type, { category });

      setActiveFeedback({
        type,
        intensity,
        category,
        message,
        config,
        duration: duration || config.duration,
      });

      // Auto-dismiss after duration
      setTimeout(() => {
        setActiveFeedback(null);
      }, duration || config.duration);
    };

    window.addEventListener('visualFeedback', handleFeedback);
    return () => window.removeEventListener('visualFeedback', handleFeedback);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case FEEDBACK_TYPES.SELECTION:
      case FEEDBACK_TYPES.SAVE:
        return <Check size={20} />;
      case FEEDBACK_TYPES.COPY:
        return <Copy size={20} />;
      case FEEDBACK_TYPES.RANDOMIZE:
        return <Zap size={20} />;
      case FEEDBACK_TYPES.LOCK:
        return <Lock size={20} />;
      case FEEDBACK_TYPES.UNLOCK:
        return <Unlock size={20} />;
      case FEEDBACK_TYPES.FAVORITE:
        return <Heart size={20} />;
      case FEEDBACK_TYPES.MILESTONE:
      case FEEDBACK_TYPES.STREAK:
        return <Sparkles size={20} />;
      default:
        return <Check size={20} />;
    }
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {activeFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '32px',
              background: `linear-gradient(135deg, ${activeFeedback.config.color}15 0%, ${activeFeedback.config.color}25 100%)`,
              border: `1px solid ${activeFeedback.config.color}40`,
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: `0 4px 20px ${activeFeedback.config.color}20`,
              zIndex: 10000,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
              }}
              style={{
                color: activeFeedback.config.color,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {getIcon(activeFeedback.type)}
            </motion.div>
            {activeFeedback.message && (
              <span
                style={{
                  fontSize: '13px',
                  color: '#ffffff',
                  fontWeight: '500',
                }}
              >
                {activeFeedback.message}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackProvider;

