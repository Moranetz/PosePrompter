import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase-config';
import { logAuthEvent, printDiagnosticReport } from '../utils/authDebugger';
import { identifyUser, resetUser } from '../posthog.js';

// Create the context
const UserContext = createContext(null);

// CRITICAL: Maximum time to wait for auth state before showing UI
const AUTH_TIMEOUT_MS = 10000; // 10 seconds max

// UserProvider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const authListenerFired = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (import.meta.env.DEV) logAuthEvent('INIT_START', { type: 'START', authExists: !!auth });
    
    // CRITICAL FIX: Set a timeout to prevent infinite loading
    // If onAuthStateChanged doesn't fire within timeout, force loading to false
    timeoutRef.current = setTimeout(() => {
      // Double-check after timeout to prevent race condition
      if (!authListenerFired.current) {
        if (import.meta.env.DEV) logAuthEvent('AUTH_TIMEOUT', {
          type: 'WARNING',
          message: 'Auth listener did not fire within timeout, forcing loading=false'
        });
        console.warn('[UserContext] AUTH TIMEOUT: onAuthStateChanged did not fire within', AUTH_TIMEOUT_MS, 'ms');
        console.warn('[UserContext] Forcing loading=false to prevent infinite spinner');
        
        // Print diagnostic report
        try {
          printDiagnosticReport(auth, null, true);
        } catch (error) {
          console.error('[UserContext] Error in printDiagnosticReport:', error);
        }
        
        // Use functional update to ensure we have latest state
        setLoading(prev => {
          // Double-check one more time before updating
          if (!authListenerFired.current) {
            return false;
          }
          return prev;
        });
        // Don't set user - let Firebase's current state be the source of truth
        if (auth?.currentUser) {
          if (import.meta.env.DEV) logAuthEvent('TIMEOUT_RECOVERY', { type: 'INFO', uid: auth.currentUser.uid });
          setUser(auth.currentUser);
        }
      }
    }, AUTH_TIMEOUT_MS);
    
    // Check if auth is available before setting up listener
    if (!auth) {
      if (import.meta.env.DEV) logAuthEvent('AUTH_NOT_INITIALIZED', { type: 'ERROR' });
      console.warn('[UserContext] Firebase auth is not initialized. Please check your Firebase configuration.');
      setLoading(false);
      setUser(null);
      clearTimeout(timeoutRef.current);
      return;
    }

    // CRITICAL FIX: Handle redirect result if popup was blocked and Firebase fell back to redirect
    const handleRedirectResult = async () => {
      try {
        if (import.meta.env.DEV) logAuthEvent('REDIRECT_CHECK_START', { type: 'INFO' });
        const result = await getRedirectResult(auth);
        if (result) {
          if (import.meta.env.DEV) logAuthEvent('REDIRECT_RESULT_FOUND', { type: 'SUCCESS', uid: result.user.uid });
          // The onAuthStateChanged will fire automatically
        } else {
          if (import.meta.env.DEV) logAuthEvent('NO_REDIRECT_RESULT', { type: 'INFO' });
        }
      } catch (error) {
        if (import.meta.env.DEV) logAuthEvent('REDIRECT_ERROR', {
          type: 'ERROR',
          code: error.code,
          message: error.message,
          isMissingState: error.message?.includes('missing initial state')
        });
        
        if (error.message?.includes('missing initial state')) {
          setAuthError('storage_blocked');
        }
        // Don't block auth state listener if redirect check fails
      }
    };

    // Check for redirect result (don't await - let it run in background)
    handleRedirectResult();

    // Listen to Firebase auth state changes
    if (import.meta.env.DEV) logAuthEvent('LISTENER_SETUP', { type: 'INFO' });
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        // Mark that listener fired and clear timeout
        authListenerFired.current = true;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        if (import.meta.env.DEV) logAuthEvent('AUTH_STATE_CHANGED', {
          type: 'STATE_CHANGE',
          hasUser: !!currentUser,
          uid: currentUser?.uid,
          email: currentUser?.email
        });
        
        try {
          setUser(currentUser);
          setLoading(false);
          setAuthError(null);

          // Identify or reset PostHog user
          if (currentUser) {
            identifyUser(currentUser.uid, {
              email: currentUser.email,
              name: currentUser.displayName,
            });
          }

          if (import.meta.env.DEV) logAuthEvent('STATE_UPDATED', { type: 'SUCCESS', loading: false, hasUser: !!currentUser });
        } catch (error) {
          if (import.meta.env.DEV) logAuthEvent('STATE_UPDATE_ERROR', { type: 'ERROR', error: error.message });
          setLoading(false);
        }
      },
      (error) => {
        authListenerFired.current = true;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        if (import.meta.env.DEV) logAuthEvent('AUTH_LISTENER_ERROR', { type: 'ERROR', code: error.code, message: error.message });
        setLoading(false);
        setUser(null);
        setAuthError(error.message);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (import.meta.env.DEV) logAuthEvent('CLEANUP', { type: 'INFO' });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    if (!auth) {
      console.warn('[UserContext] Firebase auth is not initialized. Cannot sign out.');
      setUser(null);
      return;
    }
    try {
      resetUser();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
    isLoggedIn: !!user,
    authError,
    // Expose debug function
    printDebugReport: () => printDiagnosticReport(auth, user, loading)
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the auth context
// CRITICAL: This must be a named function for Fast Refresh compatibility
export function useAuth() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
}

// Default export for the context itself (rarely needed)
export default UserContext;
