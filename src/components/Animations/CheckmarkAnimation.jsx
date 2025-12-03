import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const CheckmarkAnimation = ({ size = 48, color = '#22c55e' }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          delay: 0.1,
        }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `rgba(34, 197, 94, 0.2)`,
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.3,
          }}
        >
          <Check size={size * 0.6} color={color} strokeWidth={3} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CheckmarkAnimation;

