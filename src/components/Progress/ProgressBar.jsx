import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress = 0, label = 'Installing...' }) => {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>{label}</span>
        <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>{Math.round(progress)}%</span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

