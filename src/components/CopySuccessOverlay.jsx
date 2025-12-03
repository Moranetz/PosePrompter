import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clipboard } from 'lucide-react';

/**
 * CopySuccessOverlay - Celebratory feedback when prompt is copied
 * 
 * This is the KEY moment of delight:
 * - They've made their choices (felt in control)
 * - They clicked copy (took action)
 * - Now we celebrate their success (validation)
 * 
 * The message reinforces: "You did it. Now go create."
 */

const successMessages = [
  "Ready to paste. Go create something.",
  "Your vision, captured. Now bring it to life.",
  "Prompt locked in. The hard part's done.",
  "Copied. You know exactly what you want.",
];

const CopySuccessOverlay = ({ show, categoryCount = 0 }) => {
  const [message] = React.useState(() => 
    successMessages[Math.floor(Math.random() * successMessages.length)]
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #0f1a0f 0%, #1a2e1a 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(34, 197, 94, 0.1)',
            zIndex: 9999,
            maxWidth: '90vw'
          }}
        >
          {/* Success icon with animation */}
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
              width: '44px',
              height: '44px',
              background: 'rgba(34, 197, 94, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 500 }}
            >
              <Check size={24} color="#22c55e" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Message */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#ffffff',
                margin: 0,
                marginBottom: '4px'
              }}
            >
              Prompt copied
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: '13px',
                color: 'rgba(34, 197, 94, 0.8)',
                margin: 0
              }}
            >
              {message}
            </motion.p>
          </div>

          {/* Particle effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 1, 
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{ 
                opacity: 0, 
                scale: 1,
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 60 - 30
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.1 + i * 0.05,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                left: '40px',
                top: '50%',
                width: '6px',
                height: '6px',
                background: '#22c55e',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CopySuccessOverlay;

