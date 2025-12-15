import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * Animated button that flies from source position to target position
 */
const ButtonFlyAnimation = ({ 
  startX, 
  startY, 
  endX, 
  endY, 
  onComplete,
  children,
  width,
  height
}) => {
  const controls = useAnimation();

  useEffect(() => {
    const animate = async () => {
      // First: Press animation (scale down then back up)
      await controls.start({
        scale: [1, 0.85, 1],
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1],
        },
      });
      
      // Then: Fly to trash icon
      await controls.start({
        x: endX - startX,
        y: endY - startY,
        scale: [1, 0.6, 0.2, 0],
        opacity: [1, 0.8, 0.4, 0],
        transition: {
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
        },
      });
      
      if (onComplete) {
        onComplete();
      }
    };

    animate();
  }, [controls, startX, startY, endX, endY, onComplete]);

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={controls}
      style={{
        position: 'fixed',
        left: startX - (width / 2 || 0),
        top: startY - (height / 2 || 0),
        zIndex: 10000,
        pointerEvents: 'none',
        width: width || 'auto',
        height: height || 'auto',
      }}
    >
      {children}
    </motion.div>
  );
};

export default ButtonFlyAnimation;

