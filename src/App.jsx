import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProvider, useAuth } from './contexts/UserContext.jsx';
import LandingPage from './components/LandingPage.jsx';
import ToastProvider from './components/Toast/ToastContainer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AuthDebugPanel from './components/AuthDebugPanel.jsx';

// Lazy load the main component for better initial load performance
const PhotoElementRandomizer = lazy(() => import('./PhotoElementRandomizer.jsx'));

// Inner component that uses the auth context
const AppContent = () => {
  const { user, loading, isLoggedIn, authError, printDebugReport } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = React.useState(false);

  // Debug logging for auth state
  React.useEffect(() => {
    console.log('[AppContent] ===== AUTH STATE IN APP =====');
    console.log('[AppContent] loading:', loading);
    console.log('[AppContent] user:', user ? `exists (uid: ${user?.uid})` : 'null');
    console.log('[AppContent] isLoggedIn:', isLoggedIn);
    console.log('[AppContent] authError:', authError);
  }, [user, loading, isLoggedIn, authError]);

  // CRITICAL: Show warning if loading takes too long
  React.useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTooLong(true);
        console.warn('[AppContent] Loading has taken more than 5 seconds');
        if (printDebugReport) {
          printDebugReport();
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTooLong(false);
    }
  }, [loading, printDebugReport]);

  // CRITICAL FIX: Show loading spinner ONLY during initial auth check
  if (loading) {
    return (
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
    );
  }

  // Show landing page when user is not logged in (after loading is complete)
  if (!user || !user?.uid) {
    return (
      <LandingPage
        onAuthSuccess={() => {}}
      />
    );
  }

  return (
    <motion.div
      className="app-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Suspense
        fallback={
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
        }
      >
        <PhotoElementRandomizer />
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

// Main App component wrapped with UserProvider, ToastProvider, and ErrorBoundary
const App = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <ToastProvider>
          <AppWithDebug />
        </ToastProvider>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;

