import React from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Inbox, Sparkles } from 'lucide-react';

const EmptyState = ({ 
  icon = 'package', 
  title, 
  description, 
  actionLabel, 
  onAction,
  iconColor = '#8b5cf6'
}) => {
  const icons = {
    package: Package,
    search: Search,
    inbox: Inbox,
    sparkles: Sparkles,
  };

  const Icon = icons[icon] || Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        textAlign: 'center',
        padding: '60px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
        style={{
          display: 'inline-flex',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `rgba(139, 92, 246, 0.1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${iconColor}40`,
          }}
        >
          <Icon size={40} style={{ color: iconColor }} />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '12px',
        }}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: actionLabel ? '32px' : '0',
          maxWidth: '400px',
          margin: '0 auto',
          marginBottom: actionLabel ? '32px' : '0',
        }}
      >
        {description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onAction}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '24px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;

