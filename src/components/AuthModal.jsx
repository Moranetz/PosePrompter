import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, isEmbeddedBrowser } from '../firebase-config';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { getErrorMessage } from '../utils/errorHandler';
import { checkStorageAvailability, getStorageErrorMessage, logStorageIssue } from '../utils/storageCheck';
import { logAuthEvent } from '../utils/authDebugger';
import StorageIssueModal from './StorageIssueModal';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [storageIssue, setStorageIssue] = useState(null);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);

  // CRITICAL: Check storage availability and embedded browser on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      // Check if running in embedded browser (like Cursor)
      const embedded = isEmbeddedBrowser();
      setIsEmbedded(embedded);
      if (embedded) {
        console.log('[AuthModal] Running in embedded browser - Google popup auth may not work');
      }
      
      const storageCheck = checkStorageAvailability();
      logStorageIssue(storageCheck, 'AuthModal opened');
      
      if (!storageCheck.allAvailable) {
        const errorInfo = getStorageErrorMessage(storageCheck);
        setStorageIssue(errorInfo);
        // Don't show modal immediately - only show if user tries to use Google sign-in
      } else {
        setStorageIssue(null);
      }
    }
  }, [isOpen]);

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up form state
  const [signUpDisplayName, setSignUpDisplayName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // Reset form states
  const resetForms = () => {
    setSignInEmail('');
    setSignInPassword('');
    setShowSignInPassword(false);
    setSignUpDisplayName('');
    setSignUpEmail('');
    setSignUpPassword('');
    setShowSignUpPassword(false);
    setSignUpConfirmPassword('');
    setShowSignUpConfirmPassword(false);
    setError('');
    setSuccessMessage('');
  };

  // Handle modal close
  const handleClose = () => {
    resetForms();
    onClose();
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForms();
  };

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!signInEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!signInPassword) {
      setError('Please enter your password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signInEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!auth) {
      setError('Firebase authentication is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      console.log('[AuthModal] Attempting sign in for:', signInEmail);
      await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      console.log('[AuthModal] Sign in successful');
      setSuccessMessage('Successfully signed in!');
      // CRITICAL FIX: Don't close modal manually - let auth state update handle it
      // The modal will close automatically when UserContext's onAuthStateChanged fires
      // and App.jsx detects user is logged in. This prevents blank screen race condition.
      console.log('[AuthModal] Waiting for auth state to update...');
      setLoading(false);
      // Modal will close automatically when App.jsx detects user is logged in
    } catch (err) {
      console.error('[AuthModal] Sign in error:', err);
      console.error('[AuthModal] Error code:', err.code);
      console.error('[AuthModal] Error message:', err.message);
      const errorMsg = getErrorMessage(err);
      console.error('[AuthModal] User-friendly error:', errorMsg);
      setError(errorMsg);
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    console.log('[AuthModal] ===== SIGN-UP FORM SUBMITTED =====');
    console.log('[AuthModal] Submitting sign-up form with email=', signUpEmail, ', password length=', signUpPassword.length);
    
    setError('');
    setSuccessMessage('');

    // Validation
    if (!signUpEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!signUpPassword) {
      setError('Please enter a password');
      return;
    }

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    if (!auth) {
      console.error('[AuthModal] Sign-up error: Firebase auth is not initialized');
      setError('Firebase authentication is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      console.log('[AuthModal] Calling createUserWithEmailAndPassword...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );
      console.log('[AuthModal] ===== SIGN-UP SUCCESS =====');
      console.log('[AuthModal] Sign-up success, user.uid=', userCredential.user.uid);
      console.log('[AuthModal] User email:', userCredential.user.email);
      console.log('[AuthModal] User object:', userCredential.user);
      
      // Update display name if provided
      if (signUpDisplayName && userCredential.user) {
        // Note: To update displayName, you'd need to use updateProfile
        // For now, we'll just sign them up
      }
      
      setSuccessMessage('Account created successfully!');
      // CRITICAL FIX: Don't close modal manually - let auth state update handle it
      // The modal will close automatically when UserContext's onAuthStateChanged fires
      // and App.jsx detects user is logged in. This prevents blank screen race condition.
      console.log('[AuthModal] Sign-up complete, waiting for auth state to update...');
      console.log('[AuthModal] Modal will close automatically when UserContext updates');
      setLoading(false);
      // Modal will close automatically when App.jsx detects user is logged in
    } catch (err) {
      console.error('[AuthModal] ===== SIGN-UP ERROR =====');
      console.error('[AuthModal] Sign-up error: code=', err.code, ', message=', err.message);
      console.error('[AuthModal] Full error object:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In/Sign Up
  // Note: Firebase's signInWithPopup automatically handles both sign-in and sign-up
  // If the user doesn't exist, it creates an account. If they do, it signs them in.
  const handleGoogleSignIn = async () => {
    if (loading) return; // Prevent double-clicks
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!auth) {
      setError('Firebase authentication is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    // CRITICAL: Detect embedded browser and warn user
    if (isEmbedded) {
      logAuthEvent('EMBEDDED_BROWSER_DETECTED', { type: 'WARNING' });
      console.log('[AuthModal] Embedded browser detected - attempting Google sign-in with redirect fallback');
    }

    try {
      logAuthEvent('GOOGLE_SIGNIN_START', { type: 'START', isEmbedded });
      console.log('[AuthModal] ===== GOOGLE SIGN-IN STARTED =====');
      
      // CRITICAL: Check storage availability before attempting sign-in
      const storageCheck = checkStorageAvailability();
      logStorageIssue(storageCheck, 'Google sign-in attempt');
      logAuthEvent('STORAGE_CHECK', { type: 'INFO', ...storageCheck });
      
      if (!storageCheck.allAvailable) {
        logAuthEvent('STORAGE_BLOCKED', { type: 'ERROR', ...storageCheck });
        const errorInfo = getStorageErrorMessage(storageCheck);
        setStorageIssue(errorInfo);
        setShowStorageModal(true);
        setLoading(false);
        return;
      }
      
      // CRITICAL FIX: Configure Google provider with proper scopes
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      logAuthEvent('POPUP_OPENING', { type: 'INFO', isEmbedded });
      
      let result;
      try {
        // Try popup first
        result = await signInWithPopup(auth, provider);
      } catch (popupError) {
        logAuthEvent('POPUP_ERROR', { 
          type: 'ERROR', 
          code: popupError.code, 
          message: popupError.message,
          isEmbedded
        });
        
        // In embedded browsers, popup often fails - try redirect as fallback
        if (isEmbedded && (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.message?.includes('cross-origin') ||
          popupError.message?.includes('popup')
        )) {
          console.log('[AuthModal] Popup failed in embedded browser, trying redirect...');
          logAuthEvent('TRYING_REDIRECT_FALLBACK', { type: 'INFO' });
          
          try {
            // Use redirect as fallback for embedded browsers
            await signInWithRedirect(auth, provider);
            // Note: This will redirect, so we won't reach here
            return;
          } catch (redirectError) {
            logAuthEvent('REDIRECT_ALSO_FAILED', { 
              type: 'ERROR', 
              code: redirectError.code, 
              message: redirectError.message 
            });
            // If redirect also fails, show embedded browser error
            setError('Google sign-in is not available in this browser. Please use email/password sign-in, or open this site in Chrome or Edge.');
            setLoading(false);
            return;
          }
        }
        
        if (popupError.message?.includes('missing initial state')) {
          const errorInfo = getStorageErrorMessage(storageCheck);
          setStorageIssue(errorInfo);
          setShowStorageModal(true);
          setLoading(false);
          return;
        }
        throw popupError;
      }
      
      logAuthEvent('GOOGLE_SIGNIN_SUCCESS', { 
        type: 'SUCCESS', 
        uid: result.user.uid, 
        email: result.user.email 
      });
      console.log('[AuthModal] ===== GOOGLE SIGN-IN SUCCESS =====');
      console.log('[AuthModal] User uid:', result.user.uid);
      
      // Check if this is a new user (first time signing in)
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      if (isNewUser) {
        console.log('[AuthModal] New user created via Google sign-in');
        setSuccessMessage('Account created and signed in with Google!');
      } else {
        console.log('[AuthModal] Existing user signed in via Google');
        setSuccessMessage('Successfully signed in with Google!');
      }
      
      // CRITICAL FIX: Don't close modal manually - let auth state update handle it
      // The modal will close automatically when UserContext's onAuthStateChanged fires
      // and App.jsx detects user is logged in. This prevents blank screen race condition.
      console.log('[AuthModal] Google sign-in complete, waiting for auth state to update...');
      console.log('[AuthModal] Modal will close automatically when UserContext updates');
      
      // Set loading to false so UI isn't stuck, but don't close modal
      // App.jsx will hide modal when it detects user is logged in
      setLoading(false);
      
    } catch (err) {
      console.error('[AuthModal] ===== GOOGLE SIGN-IN ERROR =====');
      console.error('[AuthModal] Google authentication error:', err);
      console.error('[AuthModal] Error code:', err.code);
      console.error('[AuthModal] Error message:', err.message);
      
      // Handle specific error cases
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log('[AuthModal] User cancelled popup - not showing error');
        // In embedded browser, show helpful message
        if (isEmbedded) {
          setError('Google sign-in popup was closed. In this browser, please use email/password sign-in instead, or open this site in Chrome.');
        }
        // Don't show error for normal user cancellation
      } else if (err.code === 'auth/popup-blocked') {
        if (isEmbedded) {
          setError('Google sign-in is not fully supported in this embedded browser. Please use email/password sign-in, or open this site in Chrome or Edge.');
        } else {
          setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
        }
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.message && err.message.includes('missing initial state')) {
        // CRITICAL FIX: Handle storage-partitioned browser or sessionStorage issues
        console.error('[AuthModal] Storage issue detected - sessionStorage may be blocked');
        const storageCheck = checkStorageAvailability();
        const errorInfo = getStorageErrorMessage(storageCheck);
        setStorageIssue(errorInfo);
        setShowStorageModal(true);
        // Don't set error message - modal will show instead
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please contact support.');
      } else {
        setError(getErrorMessage(err));
      }
      setLoading(false);
    }
    // NOTE: Don't set loading to false on success - let auth state update handle it
    // This prevents race condition where modal closes before user state updates
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return; // Prevent double-clicks
    
    if (!signInEmail.trim()) {
      setError('Please enter your email address first');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signInEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!auth) {
      setError('Firebase authentication is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      console.log('[AuthModal] Sending password reset email to:', signInEmail);
      await sendPasswordResetEmail(auth, signInEmail);
      console.log('[AuthModal] Password reset email sent');
      setSuccessMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      console.error('[AuthModal] Password reset error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Show configuration error if Firebase auth is not initialized
  if (!auth) {
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
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      >
        <div
          className="modal-content"
          style={{
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '24px' }}>
            Configuration Required
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px', lineHeight: '1.6' }}>
            Firebase authentication is not configured. Please check your <code style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code> file and ensure all Firebase environment variables are set.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '24px' }}>
            See <code style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>GET_FIREBASE_CONFIG.md</code> for instructions.
          </p>
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
              transition: 'all 0.2s ease'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

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
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleClose}
    >
      <div
        className="modal-content"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          borderRadius: '20px',
          padding: '0',
          maxWidth: '450px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
          position: 'relative',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
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
            transition: 'all 0.2s ease',
            zIndex: 10
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

        {/* Header - Continues the emotional journey */}
        <div style={{ padding: '32px 32px 24px' }}>
          {/* Value reminder */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '100px',
              fontSize: '12px',
              color: 'rgba(34, 197, 94, 0.9)'
            }}>
              <span style={{ fontSize: '14px' }}>✓</span>
              30+ categories ready to use
            </div>
          </div>
          
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}
          >
            You're one click away
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center',
              lineHeight: '1.5'
            }}
          >
            Save your setups. Build your library. Never start from scratch.
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
            padding: '0 32px'
          }}
        >
          <button
            onClick={() => handleTabChange('signin')}
            style={{
              flex: 1,
              padding: '14px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'signin' ? '2px solid #22c55e' : '2px solid transparent',
              color: activeTab === 'signin' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              fontWeight: activeTab === 'signin' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Welcome back
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            style={{
              flex: 1,
              padding: '14px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'signup' ? '2px solid #22c55e' : '2px solid transparent',
              color: activeTab === 'signup' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              fontWeight: activeTab === 'signup' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            I'm new here
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '14px',
                marginBottom: '20px'
              }}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '8px',
                color: '#86efac',
                fontSize: '14px',
                marginBottom: '20px'
              }}
            >
              {successMessage}
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn}>
              {/* Email Input */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}
                  />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    disabled={loading}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255, 255, 255, 0.5)',
                      transition: 'color 0.2s ease',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div style={{ marginBottom: '24px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8b5cf6',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.color = '#a78bfa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#8b5cf6';
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading
                    ? 'rgba(139, 92, 246, 0.5)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: loading
                    ? 'none'
                    : '0 4px 12px rgba(139, 92, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Getting you in...
                  </>
                ) : (
                  'Let me in'
                )}
              </button>

              {/* Or divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '16px 0'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Embedded browser warning */}
              {isEmbedded && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: 'rgba(251, 191, 36, 0.9)',
                  lineHeight: '1.4'
                }}>
                  You're using an embedded browser. Google sign-in may not work - use email/password instead, or open in Chrome.
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.5 : 1
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  style={{ marginRight: '4px' }}
                >
                  <path
                    fill="#ffffff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#ffffff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google (fastest)
              </button>
              
              {/* Reassurance */}
              <p style={{
                margin: '16px 0 0',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.35)',
                textAlign: 'center'
              }}>
                Free forever. No credit card needed.
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp}>
              {/* Display Name Input */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Display Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}
                  />
                  <input
                    type="text"
                    value={signUpDisplayName}
                    onChange={(e) => setSignUpDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}
                  />
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    disabled={loading}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255, 255, 255, 0.5)',
                      transition: 'color 0.2s ease',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}
                >
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                  <input
                    type={showSignUpConfirmPassword ? 'text' : 'password'}
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                    disabled={loading}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255, 255, 255, 0.5)',
                      transition: 'color 0.2s ease',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    {showSignUpConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading
                    ? 'rgba(139, 92, 246, 0.5)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: loading
                    ? 'none'
                    : '0 4px 12px rgba(139, 92, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Setting you up...
                  </>
                ) : (
                  'Start creating'
                )}
              </button>

              {/* Or divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '16px 0'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Embedded browser warning */}
              {isEmbedded && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: 'rgba(251, 191, 36, 0.9)',
                  lineHeight: '1.4'
                }}>
                  You're using an embedded browser. Google sign-in may not work - use email/password instead, or open in Chrome.
                </div>
              )}

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.5 : 1
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  style={{ marginRight: '4px' }}
                >
                  <path
                    fill="#ffffff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#ffffff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google (fastest)
              </button>
              
              {/* Reassurance */}
              <p style={{
                margin: '16px 0 0',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.35)',
                textAlign: 'center'
              }}>
                Free forever. No credit card needed.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Storage Issue Modal */}
      <StorageIssueModal
        isOpen={showStorageModal}
        onClose={() => {
          setShowStorageModal(false);
          setLoading(false);
        }}
        errorInfo={storageIssue}
      />
    </div>
  );
};

export default AuthModal;

