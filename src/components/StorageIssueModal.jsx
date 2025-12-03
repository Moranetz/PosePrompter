import React from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

const StorageIssueModal = ({ isOpen, onClose, errorInfo }) => {
  if (!isOpen || !errorInfo) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <AlertTriangle
            size={64}
            style={{
              color: '#fbbf24',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '16px',
            textAlign: 'center'
          }}
        >
          {errorInfo.title || 'Browser Settings Required'}
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '24px',
            lineHeight: '1.6',
            textAlign: 'center'
          }}
        >
          {errorInfo.message || 'Your browser settings are preventing secure sign-in.'}
        </p>

        {/* Instructions */}
        {errorInfo.instructions && errorInfo.instructions.length > 0 && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '12px'
              }}
            >
              How to fix:
            </h3>
            <ol
              style={{
                margin: 0,
                paddingLeft: '20px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.8'
              }}
            >
              {errorInfo.instructions.map((instruction, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Browser-specific help */}
        <div
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              lineHeight: '1.6'
            }}
          >
            <strong style={{ color: '#ffffff' }}>Tip:</strong> If you're using Safari, try Chrome or
            Firefox for better compatibility. These browsers handle authentication more reliably.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
            }}
          >
            I'll Fix My Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageIssueModal;

