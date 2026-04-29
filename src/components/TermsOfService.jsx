import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  const handleBack = () => {
    window.location.hash = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      <button
        onClick={handleBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 14px',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '8px',
          color: 'var(--text-muted)',
          fontSize: '13px',
          fontWeight: '450',
          letterSpacing: '-0.01em',
          cursor: 'pointer',
          marginBottom: '24px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(139, 92, 246, 0.08)';
          e.target.style.color = '#e4dbfa';
          e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
          e.target.style.color = 'var(--text-muted)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.07)';
        }}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: '12px' }}>
            By accessing and using Pose Prompter ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>2. Use License</h2>
          <p style={{ marginBottom: '12px' }}>
            Permission is granted to temporarily use the Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul style={{ marginLeft: '24px', marginBottom: '12px' }}>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained in the Service</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>3. User Accounts</h2>
          <p style={{ marginBottom: '12px' }}>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>4. User Content</h2>
          <p style={{ marginBottom: '12px' }}>
            You retain ownership of any content you create, upload, or share through the Service. By uploading content, you grant us a license to use, store, and display that content as necessary to provide the Service.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>5. Prohibited Uses</h2>
          <p style={{ marginBottom: '12px' }}>You may not use the Service:</p>
          <ul style={{ marginLeft: '24px', marginBottom: '12px' }}>
            <li>In any way that violates any applicable law or regulation</li>
            <li>To transmit any malicious code or viruses</li>
            <li>To attempt to gain unauthorized access to any portion of the Service</li>
            <li>To interfere with or disrupt the Service or servers connected to the Service</li>
            <li>To copy, reproduce, or resell the Service without permission</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>6. Intellectual Property</h2>
          <p style={{ marginBottom: '12px' }}>
            The Service and its original content, features, and functionality are owned by Pose Prompter and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>7. Disclaimer</h2>
          <p style={{ marginBottom: '12px' }}>
            The materials on the Service are provided on an 'as is' basis. Pose Prompter makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>8. Limitations</h2>
          <p style={{ marginBottom: '12px' }}>
            In no event shall Pose Prompter or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>9. Revisions</h2>
          <p style={{ marginBottom: '12px' }}>
            Pose Prompter may revise these terms of service at any time without notice. By using this Service you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>10. Contact Information</h2>
          <p style={{ marginBottom: '12px' }}>
            If you have any questions about these Terms of Service, please contact us through the Service.
          </p>
        </section>
      </div>
    </motion.div>
  );
};

export default TermsOfService;

