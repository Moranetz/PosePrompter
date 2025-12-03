import React, { useState, useEffect } from 'react';

const RippleEffect = ({ color, duration = 300 }) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (x, y) => {
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, duration);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: color,
            opacity: 0.4,
            transform: 'scale(0)',
            animation: `ripple ${duration}ms ease-out`,
            pointerEvents: 'none'
          }}
        />
      ))}
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(10);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default RippleEffect;

