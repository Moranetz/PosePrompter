import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NatureFrame = ({ isVisible }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="nature-frame"
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
            initial={{ x: '-120%', rotate: -5 }}
            animate={{ x: '0%', rotate: 0 }}
            exit={{ x: '120%', rotate: 5 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 25
            }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              pointerEvents: 'none'
            }}
          >
            {/* Sun */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4, type: 'spring' }}
              style={{
                position: 'absolute',
                top: '8%',
                right: '12%',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FFD93D 0%, #FF9A3D 70%, transparent 100%)',
                boxShadow: '0 0 40px 15px rgba(255, 217, 61, 0.4), 0 0 80px 30px rgba(255, 154, 61, 0.2)',
                zIndex: 10
              }}
            />

            {/* Sun rays */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                position: 'absolute',
                top: '3%',
                right: '7%',
                width: '70px',
                height: '70px',
                background: 'conic-gradient(from 0deg, transparent, rgba(255, 217, 61, 0.3), transparent, rgba(255, 217, 61, 0.3), transparent, rgba(255, 217, 61, 0.3), transparent, rgba(255, 217, 61, 0.3), transparent)',
                borderRadius: '50%',
                zIndex: 9
              }}
            />

            {/* Left tree group */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: '5%',
                zIndex: 20
              }}
            >
              {/* Tree 1 - tall pine */}
              <svg width="60" height="140" viewBox="0 0 60 140" style={{ position: 'absolute', bottom: 0, left: 0 }}>
                {/* Trunk */}
                <rect x="25" y="90" width="10" height="50" fill="#5D4037" />
                {/* Foliage layers */}
                <polygon points="30,5 5,50 55,50" fill="#2E7D32" />
                <polygon points="30,25 0,75 60,75" fill="#388E3C" />
                <polygon points="30,50 -5,100 65,100" fill="#43A047" />
              </svg>
              
              {/* Tree 2 - smaller pine */}
              <svg width="45" height="100" viewBox="0 0 45 100" style={{ position: 'absolute', bottom: 0, left: '40px' }}>
                <rect x="18" y="65" width="8" height="35" fill="#5D4037" />
                <polygon points="22,5 2,40 42,40" fill="#1B5E20" />
                <polygon points="22,20 -2,60 46,60" fill="#2E7D32" />
                <polygon points="22,40 -5,75 49,75" fill="#388E3C" />
              </svg>
            </motion.div>

            {/* Right tree group */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4, type: 'spring' }}
              style={{
                position: 'absolute',
                bottom: 0,
                right: '5%',
                zIndex: 20
              }}
            >
              {/* Tree 3 - medium pine */}
              <svg width="50" height="120" viewBox="0 0 50 120" style={{ position: 'absolute', bottom: 0, right: '30px' }}>
                <rect x="21" y="80" width="8" height="40" fill="#5D4037" />
                <polygon points="25,5 3,45 47,45" fill="#2E7D32" />
                <polygon points="25,25 0,70 50,70" fill="#388E3C" />
                <polygon points="25,45 -3,90 53,90" fill="#43A047" />
              </svg>
              
              {/* Tree 4 - tall pine */}
              <svg width="55" height="130" viewBox="0 0 55 130" style={{ position: 'absolute', bottom: 0, right: 0 }}>
                <rect x="23" y="85" width="9" height="45" fill="#5D4037" />
                <polygon points="27,5 5,50 50,50" fill="#1B5E20" />
                <polygon points="27,25 0,75 55,75" fill="#2E7D32" />
                <polygon points="27,50 -5,95 60,95" fill="#388E3C" />
              </svg>
            </motion.div>

            {/* Ground/grass at bottom */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '25px',
                background: 'linear-gradient(to top, #2E7D32 0%, #43A047 60%, transparent 100%)',
                transformOrigin: 'bottom',
                zIndex: 15
              }}
            />

            {/* Grass blades - left */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '15%',
                transformOrigin: 'bottom',
                zIndex: 21
              }}
            >
              <svg width="30" height="25" viewBox="0 0 30 25">
                <path d="M5,25 Q6,10 3,0" stroke="#4CAF50" strokeWidth="2" fill="none" />
                <path d="M10,25 Q11,8 8,0" stroke="#66BB6A" strokeWidth="2" fill="none" />
                <path d="M15,25 Q14,10 17,0" stroke="#4CAF50" strokeWidth="2" fill="none" />
                <path d="M20,25 Q19,12 22,0" stroke="#81C784" strokeWidth="2" fill="none" />
                <path d="M25,25 Q26,8 24,0" stroke="#4CAF50" strokeWidth="2" fill="none" />
              </svg>
            </motion.div>

            {/* Grass blades - right */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '15%',
                transformOrigin: 'bottom',
                zIndex: 21
              }}
            >
              <svg width="30" height="25" viewBox="0 0 30 25">
                <path d="M5,25 Q4,10 7,0" stroke="#4CAF50" strokeWidth="2" fill="none" />
                <path d="M10,25 Q11,8 8,0" stroke="#81C784" strokeWidth="2" fill="none" />
                <path d="M15,25 Q16,10 13,0" stroke="#66BB6A" strokeWidth="2" fill="none" />
                <path d="M20,25 Q21,12 18,0" stroke="#4CAF50" strokeWidth="2" fill="none" />
                <path d="M25,25 Q24,8 27,0" stroke="#66BB6A" strokeWidth="2" fill="none" />
              </svg>
            </motion.div>

            {/* Small bush - left side */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.3, type: 'spring' }}
              style={{
                position: 'absolute',
                bottom: '15px',
                left: '25%',
                zIndex: 18
              }}
            >
              <svg width="35" height="25" viewBox="0 0 35 25">
                <ellipse cx="10" cy="18" rx="10" ry="8" fill="#388E3C" />
                <ellipse cx="20" cy="15" rx="12" ry="10" fill="#43A047" />
                <ellipse cx="28" cy="18" rx="8" ry="7" fill="#388E3C" />
              </svg>
            </motion.div>

            {/* Small bush - right side */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3, type: 'spring' }}
              style={{
                position: 'absolute',
                bottom: '15px',
                right: '25%',
                zIndex: 18
              }}
            >
              <svg width="30" height="22" viewBox="0 0 30 22">
                <ellipse cx="8" cy="15" rx="8" ry="7" fill="#43A047" />
                <ellipse cx="18" cy="13" rx="10" ry="9" fill="#4CAF50" />
                <ellipse cx="25" cy="16" rx="6" ry="6" fill="#43A047" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NatureFrame;

