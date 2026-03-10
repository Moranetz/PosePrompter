import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProvider, useAuth } from './contexts/UserContext.jsx';
import { logger } from './utils/logger.js';
import LandingPage from './components/LandingPage.jsx';
import PricingPage from './components/PricingPage.jsx';
import FacePhotosPage from './components/FacePhotosPage.jsx';
import AIImageGenerator from './components/AIImageGenerator.jsx';
import TermsOfService from './components/TermsOfService.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import ErrorReports from './components/ErrorReports.jsx';
import ToastProvider from './components/Toast/ToastContainer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AuthDebugPanel from './components/AuthDebugPanel.jsx';
import { HypnoticLoadingScreen, HypnoticBackground } from './components/HypnoticEffects.jsx';
import StripeProvider from './components/StripeProvider.jsx';

// Lazy load the main component for better initial load performance
const PhotoElementRandomizer = lazy(() => import('./PhotoElementRandomizer'));

// Inner component that uses the auth context
const AppContent = () => {
  const { user, loading, isLoggedIn, authError, printDebugReport } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState(() => window.location.hash);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // When auth succeeds from the landing page, send users into the main app
  const handleAuthSuccess = React.useCallback(() => {
    window.location.hash = '#app';
  }, []);

  // Handle hash-based routing with polling as fallback
  React.useEffect(() => {
    let lastHash = window.location.hash;
    
    const handleHashChange = () => {
      const newHash = window.location.hash;
      logger.log('[App.jsx] Hash changed to:', newHash);
      lastHash = newHash;
      setCurrentRoute(newHash);
      forceUpdate(); // Force re-render
    };
    
    // Set initial route
    const initialHash = window.location.hash;
    logger.log('[App.jsx] Initial hash:', initialHash);
    setCurrentRoute(initialHash);
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    
    // Poll for hash changes as fallback (in case hashchange doesn't fire)
    const pollInterval = setInterval(() => {
      const currentHash = window.location.hash;
      if (currentHash !== lastHash) {
        logger.log('[App.jsx] Hash detected via polling:', currentHash);
        lastHash = currentHash;
        setCurrentRoute(currentHash);
        forceUpdate();
      }
    }, 100);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Always read hash directly in render as fallback
  const actualRoute = window.location.hash || currentRoute;

  // Debug logging for auth state
  React.useEffect(() => {
    logger.log('[AppContent] ===== AUTH STATE IN APP =====');
    logger.log('[AppContent] loading:', loading);
    logger.log('[AppContent] user:', user ? `exists (uid: ${user?.uid})` : 'null');
    logger.log('[AppContent] isLoggedIn:', isLoggedIn);
    logger.log('[AppContent] authError:', authError);
  }, [user, loading, isLoggedIn, authError]);

  // CRITICAL: Show warning if loading takes too long
  React.useEffect(() => {
    if (loading) {
      let isMounted = true;
      const timer = setTimeout(() => {
        if (isMounted) {
          setLoadingTooLong(true);
          logger.warn('[AppContent] Loading has taken more than 5 seconds');
          if (printDebugReport && typeof printDebugReport === 'function') {
            try {
              printDebugReport();
            } catch (error) {
              logger.error('[AppContent] Error in printDebugReport:', error);
            }
          }
        }
      }, 5000);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      setLoadingTooLong(false);
      return undefined; // Explicit cleanup
    }
  }, [loading]); // Removed printDebugReport from deps to prevent unnecessary re-runs

  // CRITICAL FIX: Show loading spinner ONLY during initial auth check
  if (loading) {
    return (
      <ErrorBoundary>
        <HypnoticLoadingScreen>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
            zIndex: 9999
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              color: '#ffffff'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2
                size={48}
                style={{
                  color: '#8b5cf6'
                }}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '16px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0
              }}
            >
              {loadingTooLong ? 'Still loading... please wait' : 'Loading...'}
            </motion.p>
            {loadingTooLong && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  marginTop: '20px',
                  textAlign: 'center'
                }}
              >
                <p style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '12px'
                }}>
                  Taking longer than expected...
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Refresh Page
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </HypnoticLoadingScreen>
      </ErrorBoundary>
    );
  }


  // Show pricing page if route is #pricing
  if (actualRoute === '#pricing') {
    return <PricingPage />;
  }

  // Show face photos page if route is #face-photos
  if (actualRoute === '#face-photos') {
    return <FacePhotosPage />;
  }


  // Show AI image generator page if route is #ai-image-generator
  if (actualRoute === '#ai-image-generator') {
    logger.log('[App.jsx] Rendering AIImageGenerator component, actualRoute:', actualRoute);
    return <AIImageGenerator />;
  }

  // Show terms of service page if route is #terms
  if (actualRoute === '#terms') {
    return <TermsOfService />;
  }

  // Show privacy policy page if route is #privacy
  if (actualRoute === '#privacy') {
    return <PrivacyPolicy />;
  }

  // Show error reports page if route is #error-reports
  if (actualRoute === '#error-reports') {
    return <ErrorReports />;
  }

  // Show marketing landing page by default (no hash) or at #landing
  if (!actualRoute || actualRoute === '#landing') {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Show main app directly - no landing page gate
  // Users can try the product immediately, auth only required for saving/premium features
  return (
    <motion.div
      className="app-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'relative' }}
    >
      <HypnoticBackground />
      <Suspense
        fallback={
          <ErrorBoundary>
            <HypnoticLoadingScreen>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                  zIndex: 10000,
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    color: '#ffffff',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 size={48} style={{ color: '#8b5cf6' }} />
                  </motion.div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                    Loading...
                  </p>
                </motion.div>
              </div>
            </HypnoticLoadingScreen>
          </ErrorBoundary>
        }
      >
        <ErrorBoundary>
          <PhotoElementRandomizer />
        </ErrorBoundary>
      </Suspense>
    </motion.div>
  );
};

// Wrapper to access auth state for debug panel
const AppWithDebug = () => {
  const { user, loading } = useAuth();
  
  return (
    <>
      <AppContent />
      <AuthDebugPanel user={user} loading={loading} />
    </>
  );
};

// Main App component wrapped with UserProvider, ToastProvider, StripeProvider, and ErrorBoundary
const App = () => {
  // Check if Firebase is configured
  const firebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID;
  
  if (!firebaseConfigured) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        color: '#ffffff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#fbbf24' }}>⚠️ Firebase Configuration Required</h1>
          <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.9 }}>
            The app requires Firebase configuration to run. Please check your <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code> file.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'left', fontSize: '14px' }}>
            <p style={{ marginBottom: '12px' }}>Required environment variables:</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>• VITE_FIREBASE_API_KEY</li>
              <li style={{ marginBottom: '8px' }}>• VITE_FIREBASE_AUTH_DOMAIN</li>
              <li style={{ marginBottom: '8px' }}>• VITE_FIREBASE_PROJECT_ID</li>
              <li style={{ marginBottom: '8px' }}>• VITE_FIREBASE_STORAGE_BUCKET</li>
              <li style={{ marginBottom: '8px' }}>• VITE_FIREBASE_MESSAGING_SENDER_ID</li>
              <li style={{ marginBottom: '8px' }}>• VITE_FIREBASE_APP_ID</li>
            </ul>
            <p style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
              After adding these variables, restart the dev server.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <UserProvider>
        <StripeProvider>
          <ToastProvider>
            <AppWithDebug />
          </ToastProvider>
        </StripeProvider>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;

