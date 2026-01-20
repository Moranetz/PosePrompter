import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * Animated button that flies from source position to target position
 *
 * Security: Uses direct DOM node attachment instead of dangerouslySetInnerHTML
 * to eliminate XSS vulnerabilities while preserving visual appearance.
 */
const TrashAnimation = ({
  startX,
  startY,
  endX,
  endY,
  onComplete,
  buttonElement,
  buttonText
}) => {
  const controls = useAnimation();
  const [clonedElement, setClonedElement] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Extract and sanitize button element if provided
    if (buttonElement) {
      const cloned = buttonElement.cloneNode(true);

      // Security: Sanitize the cloned element
      // Remove interactive elements and potential XSS vectors
      cloned.style.pointerEvents = 'none';
      cloned.style.cursor = 'default';

      // Remove any buttons inside (like trash/favorite buttons)
      const innerButtons = cloned.querySelectorAll('button');
      innerButtons.forEach(btn => btn.remove());

      // Remove script tags
      const scripts = cloned.querySelectorAll('script');
      scripts.forEach(script => script.remove());

      // Remove all event handlers (onclick, onerror, etc.)
      const allElements = cloned.querySelectorAll('*');
      allElements.forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
        });
      });

      // Preserve all styles but remove transforms that might interfere
      cloned.style.transform = 'none';
      cloned.style.transition = 'none';
      cloned.style.position = 'relative';

      // Add shadow for visibility
      cloned.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.6)';
      cloned.style.filter = 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))';

      // Sanitize: remove any javascript: URLs and data URIs that aren't images
      const links = cloned.querySelectorAll('a[href]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('javascript:') || (href.startsWith('data:') && !href.startsWith('data:image/')))) {
          link.removeAttribute('href');
        }
      });

      setClonedElement(cloned);
    }
  }, [buttonElement]);

  // Attach the cloned DOM element to the container ref
  useEffect(() => {
    if (containerRef.current && clonedElement) {
      // Clear any existing content
      containerRef.current.innerHTML = '';
      // Directly append the sanitized DOM node (no HTML parsing)
      containerRef.current.appendChild(clonedElement);
    }
  }, [clonedElement]);

  useEffect(() => {
    const animate = async () => {
      // Animate in stages: move first while staying visible, then shrink at the end
      await controls.start({
        x: endX - startX,
        y: endY - startY,
        scale: [1, 1, 0.8, 0.5, 0.3],
        opacity: [1, 1, 1, 0.8, 0],
        transition: {
          duration: 1.2,
          ease: [0.25, 0.46, 0.45, 0.94],
          times: [0, 0.3, 0.6, 0.85, 1],
        },
      });
      
      if (onComplete) {
        onComplete();
      }
    };

    animate();
  }, [controls, startX, startY, endX, endY, onComplete]);

  // Render button content
  const renderButton = () => {
    if (clonedElement) {
      // Security: Use ref to attach DOM node directly instead of dangerouslySetInnerHTML
      // This eliminates XSS risk while preserving the visual appearance
      return (
        <div
          ref={containerRef}
          style={{
            pointerEvents: 'none',
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
          }}
        />
      );
    }

    // Fallback: render a simple button with text
    return (
      <div
        style={{
          minHeight: '40px',
          padding: '10px 18px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '400',
          letterSpacing: '-0.01em',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)',
          color: '#a1a1aa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {buttonText || 'Option'}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={controls}
      style={{
        position: 'fixed',
        left: startX,
        top: startY,
        zIndex: 10000,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, opacity',
      }}
    >
      {renderButton()}
    </motion.div>
  );
};

export default TrashAnimation;

