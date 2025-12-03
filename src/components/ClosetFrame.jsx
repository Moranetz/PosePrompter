import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ClosetFrame = ({ isVisible }) => {
  // T-shirt component
  const TShirt = ({ color, delay, left, scale = 1 }) => (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.35, type: 'spring', stiffness: 300 }}
      style={{
        position: 'absolute',
        top: '15%',
        left,
        zIndex: 15,
        transform: `scale(${scale})`
      }}
    >
      <svg width="50" height="70" viewBox="0 0 50 70">
        {/* Hanger hook */}
        <circle cx="25" cy="4" r="3" fill="#90A4AE" />
        <path d="M25 7 L25 12" stroke="#90A4AE" strokeWidth="2" />
        {/* Hanger bar */}
        <path d="M8 12 L42 12" stroke="#90A4AE" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* T-shirt body */}
        <path 
          d="M8 12 L2 22 L10 24 L10 65 Q25 68 40 65 L40 24 L48 22 L42 12 L35 14 Q25 18 15 14 L8 12" 
          fill={color}
          stroke={color}
          strokeWidth="1"
        />
        {/* Collar */}
        <path 
          d="M15 14 Q25 20 35 14" 
          fill="none" 
          stroke={`${color}99`}
          strokeWidth="2"
        />
        {/* Sleeve creases */}
        <path d="M10 18 L10 24" stroke={`${color}DD`} strokeWidth="1" opacity="0.5" />
        <path d="M40 18 L40 24" stroke={`${color}DD`} strokeWidth="1" opacity="0.5" />
      </svg>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="closet-frame"
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
          <motion.div
            initial={{ x: '-120%' }}
            animate={{ x: '0%' }}
            exit={{ x: '120%' }}
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
            {/* Left closet door frame */}
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{
                position: 'absolute',
                top: '5%',
                left: 0,
                width: '10%',
                height: '90%',
                background: 'linear-gradient(90deg, #3E2723 0%, #5D4037 100%)',
                borderRadius: '2px',
                boxShadow: '2px 0 15px rgba(0,0,0,0.4)',
                zIndex: 30
              }}
            >
              {/* Handle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '20%',
                width: '4px',
                height: '28px',
                background: 'linear-gradient(180deg, #E0E0E0 0%, #9E9E9E 50%, #E0E0E0 100%)',
                borderRadius: '2px',
                transform: 'translateY(-50%)',
                boxShadow: '1px 1px 3px rgba(0,0,0,0.3)'
              }} />
            </motion.div>

            {/* Right closet door frame */}
            <motion.div
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{
                position: 'absolute',
                top: '5%',
                right: 0,
                width: '10%',
                height: '90%',
                background: 'linear-gradient(270deg, #3E2723 0%, #5D4037 100%)',
                borderRadius: '2px',
                boxShadow: '-2px 0 15px rgba(0,0,0,0.4)',
                zIndex: 30
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '20%',
                width: '4px',
                height: '28px',
                background: 'linear-gradient(180deg, #E0E0E0 0%, #9E9E9E 50%, #E0E0E0 100%)',
                borderRadius: '2px',
                transform: 'translateY(-50%)',
                boxShadow: '-1px 1px 3px rgba(0,0,0,0.3)'
              }} />
            </motion.div>

            {/* Clothing rod */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{
                position: 'absolute',
                top: '12%',
                left: '6%',
                right: '6%',
                height: '4px',
                background: 'linear-gradient(180deg, #FAFAFA 0%, #BDBDBD 50%, #757575 100%)',
                borderRadius: '2px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                zIndex: 10
              }}
            />

            {/* Hanging T-shirts - positioned on sides to keep center clear */}
            <TShirt color="#1565C0" delay={0.4} left="8%" />
            <TShirt color="#C62828" delay={0.45} left="18%" />
            <TShirt color="#2E7D32" delay={0.5} left="28%" />
            <TShirt color="#F9A825" delay={0.6} left="62%" />
            <TShirt color="#6A1B9A" delay={0.65} left="72%" />
            <TShirt color="#37474F" delay={0.7} left="82%" />

            {/* Bottom shelf */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              style={{
                position: 'absolute',
                bottom: '12%',
                left: '6%',
                right: '6%',
                height: '6px',
                background: 'linear-gradient(180deg, #8D6E63 0%, #5D4037 100%)',
                borderRadius: '1px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                zIndex: 10
              }}
            />

            {/* Folded clothes on shelf - positioned on sides */}
            {[
              { left: '12%', colors: ['#1976D2', '#1565C0', '#0D47A1'], delay: 0.75 },
              { left: '25%', colors: ['#E0E0E0', '#BDBDBD', '#9E9E9E'], delay: 0.8 },
              { left: '65%', colors: ['#388E3C', '#2E7D32', '#1B5E20'], delay: 0.85 },
              { left: '78%', colors: ['#D32F2F', '#C62828', '#B71C1C'], delay: 0.9 },
            ].map((stack, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: stack.delay, duration: 0.25, type: 'spring' }}
                style={{
                  position: 'absolute',
                  bottom: '14%',
                  left: stack.left,
                  zIndex: 15,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                {/* Stack of folded shirts */}
                {stack.colors.map((color, j) => (
                  <div
                    key={j}
                    style={{
                      width: '28px',
                      height: '6px',
                      background: color,
                      borderRadius: '1px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
                    }}
                  />
                ))}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClosetFrame;
