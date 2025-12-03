import React from 'react';

const ShimmerEffect = ({ duration = 2000 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        animation: `shimmer ${duration}ms infinite`,
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ShimmerEffect;

