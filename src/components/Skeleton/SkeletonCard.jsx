import React from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = ({ height = '200px' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cover Image Skeleton */}
      <ShimmerBox height={height} />
      
      {/* Content Skeleton */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ShimmerBox height="20px" width="70%" />
        <ShimmerBox height="16px" width="50%" />
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <ShimmerBox height="14px" width="60px" />
          <ShimmerBox height="14px" width="80px" />
        </div>
        <ShimmerBox height="14px" width="100%" />
        <ShimmerBox height="14px" width="85%" />
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px' }}>
          <ShimmerBox height="40px" width="100%" />
          <ShimmerBox height="40px" width="100%" />
        </div>
      </div>
    </motion.div>
  );
};

const ShimmerBox = ({ height, width = '100%' }) => {
  return (
    <motion.div
      animate={{
        background: [
          'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)',
          'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 100%)',
          'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        height,
        width,
        borderRadius: '6px',
        background: 'rgba(255, 255, 255, 0.05)',
      }}
    />
  );
};

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonCard;

