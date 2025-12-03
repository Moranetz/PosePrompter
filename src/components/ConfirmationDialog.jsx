import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' or 'warning'
  loading = false,
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div
      className="modal-overlay"
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
        zIndex: 2000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
          position: 'relative',
          border: `1px solid ${isDanger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
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
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#ffffff',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }
          }}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <AlertTriangle
            size={48}
            style={{
              color: isDanger ? '#ef4444' : '#f59e0b',
            }}
          />
        </div>

        {/* Title */}
        <h2
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '12px',
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          style={{
            margin: 0,
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = '#8b5cf6';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: loading
                ? 'rgba(239, 68, 68, 0.5)'
                : isDanger
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading
                ? 'none'
                : isDanger
                ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                : '0 4px 12px rgba(245, 158, 11, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = isDanger
                  ? '0 6px 16px rgba(239, 68, 68, 0.5)'
                  : '0 6px 16px rgba(245, 158, 11, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = isDanger
                  ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                  : '0 4px 12px rgba(245, 158, 11, 0.4)';
              }
            }}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

