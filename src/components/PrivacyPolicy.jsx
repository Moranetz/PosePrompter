import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
        Privacy Policy
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>1. Introduction</h2>
          <p style={{ marginBottom: '12px' }}>
            Pose Prompter ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>2. Information We Collect</h2>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', marginTop: '16px' }}>2.1 Information You Provide</h3>
          <p style={{ marginBottom: '12px' }}>
            We collect information that you provide directly to us, including:
          </p>
          <ul style={{ marginLeft: '24px', marginBottom: '12px' }}>
            <li>Account information (email address, display name, profile picture)</li>
            <li>User-generated content (prompts, packages, saved configurations)</li>
            <li>Communication data when you contact us</li>
          </ul>

          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', marginTop: '16px' }}>2.2 Automatically Collected Information</h3>
          <p style={{ marginBottom: '12px' }}>
            We automatically collect certain information when you use the Service:
          </p>
          <ul style={{ marginLeft: '24px', marginBottom: '12px' }}>
            <li>Usage data and analytics</li>
            <li>Device information</li>
            <li>Browser type and version</li>
            <li>IP address (anonymized where possible)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>3. How We Use Your Information</h2>
          <p style={{ marginBottom: '12px' }}>We use the information we collect to:</p>
          <ul style={{ marginLeft: '24px', marginBottom: '12px' }}>
            <li>Provide, maintain, and improve the Service</li>
            <li>Process transactions and manage your account</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze usage patterns</li>
            <li>Detect, prevent, and address technical issues</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>4. Data Storage</h2>
          <p style={{ marginBottom: '12px' }}>
            Your data is stored securely using Firebase (Google Cloud Platform). We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>5. Data Sharing</h2>
          <p style={{ marginBottom: '12px' }}>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul style={{ marginLeft: '24px', marginBottom: '12px' }}>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist in operating the Service (e.g., Firebase/Google)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>6. Public Content</h2>
          <p style={{ marginBottom: '12px' }}>
            When you publish packages or share content publicly through the Service, that content becomes publicly accessible. Please be mindful of the information you choose to make public.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>7. Your Rights</h2>
          <p style={{ marginBottom: '12px' }}>You have the right to:</p>
          <ul style={{ marginLeft: '24px', marginBottom: '12px' }}>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Opt-out of certain data collection (where applicable)</li>
          </ul>
          <p style={{ marginBottom: '12px' }}>
            To exercise these rights, please contact us through the Service.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>8. Cookies and Tracking</h2>
          <p style={{ marginBottom: '12px' }}>
            We use cookies and similar tracking technologies to track activity on the Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>9. Children's Privacy</h2>
          <p style={{ marginBottom: '12px' }}>
            Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>10. Changes to This Privacy Policy</h2>
          <p style={{ marginBottom: '12px' }}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>11. Contact Us</h2>
          <p style={{ marginBottom: '12px' }}>
            If you have any questions about this Privacy Policy, please contact us through the Service.
          </p>
        </section>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;

