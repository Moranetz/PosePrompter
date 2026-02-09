/**
 * Firebase Configuration and Initialization
 * 
 * SINGLETON PATTERN: This module guarantees exactly one Firebase instance
 * is created and shared app-wide, preventing circular dependency issues
 * and initialization race conditions.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

/**
 * Detect if running in an embedded browser (like Cursor's browser)
 * Embedded browsers often have issues with popup-based auth
 */
export const isEmbeddedBrowser = () => {
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for common embedded browser indicators
  const isElectron = ua.includes('electron');
  const isCursor = ua.includes('cursor') || (window.process && window.process.versions?.electron);
  const isWebView = ua.includes('wv') || ua.includes('webview');
  
  // Check if window.opener behavior suggests embedded context
  // In embedded browsers, popups often can't communicate back properly
  const hasRestrictedOpener = !window.opener && window.parent === window;
  
  // Check for restricted storage (common in embedded browsers)
  let hasRestrictedStorage = false;
  try {
    const testKey = '__embedded_test__';
    sessionStorage.setItem(testKey, '1');
    sessionStorage.removeItem(testKey);
  } catch {
    hasRestrictedStorage = true;
  }
  
  return isElectron || isCursor || isWebView || hasRestrictedStorage;
};

// Firebase configuration object
// These values come from your Firebase project settings (stored in .env.local)
// Note: Vite requires VITE_ prefix for environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase config in development
if (import.meta.env.DEV) {
  console.log('Firebase Config Check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'MISSING',
    projectId: firebaseConfig.projectId || 'MISSING'
  });
}

// Check if config is valid
const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isConfigValid) {
  console.error('Firebase configuration is missing. Please check your .env.local file.');
  console.error('Make sure the dev server was restarted after creating .env.local');
}

/**
 * SINGLETON INITIALIZATION PATTERN
 * 
 * Uses getApps() to check if Firebase is already initialized.
 * This prevents duplicate initialization during HMR (Hot Module Replacement)
 * and ensures exactly one instance exists across all modules.
 */
function initializeFirebaseApp() {
  // Check if an app already exists (prevents HMR duplication)
  const existingApps = getApps();
  
  if (existingApps.length > 0) {
    // Return existing app instance
    return getApp();
  }
  
  // Only initialize if config is valid
  if (!isConfigValid) {
    console.warn('Firebase configuration is incomplete. Skipping initialization.');
    return null;
  }
  
  try {
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
}

// Initialize Firebase app (singleton)
const app = initializeFirebaseApp();

/**
 * Initialize Firebase services with null-safe pattern
 * Each service getter handles missing app gracefully
 */
async function initializeAuthAsync(firebaseApp) {
  if (!firebaseApp) return null;
  try {
    const authInstance = getAuth(firebaseApp);
    
    // CRITICAL FIX: Set explicit persistence for embedded browsers
    // This helps prevent "missing initial state" errors
    try {
      await setPersistence(authInstance, browserLocalPersistence);
      console.log('[Firebase] Auth persistence set to browserLocalPersistence');
    } catch (persistError) {
      console.warn('[Firebase] Could not set persistence, using default:', persistError.message);
    }
    
    return authInstance;
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    return null;
  }
}

// Synchronous auth getter for immediate use
function initializeAuth(firebaseApp) {
  if (!firebaseApp) return null;
  try {
    return getAuth(firebaseApp);
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    return null;
  }
}

function initializeFirestore(firebaseApp) {
  if (!firebaseApp) return null;
  try {
    return getFirestore(firebaseApp);
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    return null;
  }
}

function initializeStorage(firebaseApp) {
  if (!firebaseApp) return null;
  try {
    return getStorage(firebaseApp);
  } catch (error) {
    console.error('Error initializing Firebase Storage:', error);
    return null;
  }
}

async function initializeAnalyticsAsync(firebaseApp) {
  if (!firebaseApp || typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(firebaseApp);
    }
    return null;
  } catch (error) {
    console.error('Error initializing Firebase Analytics:', error);
    return null;
  }
}

// Initialize services (these are synchronous singleton getters)
const auth = initializeAuth(app);
const db = initializeFirestore(app);
const storage = initializeStorage(app);

// Debug: Log Firebase initialization status
if (import.meta.env.DEV) {
  console.log('[Firebase] Initialization status:', {
    app: app ? 'initialized' : 'null (config missing)',
    auth: auth ? 'initialized' : 'null',
    db: db ? 'initialized' : 'null',
    storage: storage ? 'initialized' : 'null',
    configValid: isConfigValid
  });
  
  if (!isConfigValid) {
    console.warn('[Firebase] ⚠️  Firebase config is missing or invalid.');
    console.warn('[Firebase] Please check your .env.local file and ensure all VITE_FIREBASE_* variables are set.');
    console.warn('[Firebase] The app may not work correctly without Firebase configuration.');
  }
}

// Set up auth persistence asynchronously (improves embedded browser support)
if (app) {
  initializeAuthAsync(app).then(() => {
    console.log('[Firebase] Auth fully initialized with persistence');
  }).catch(err => {
    console.warn('[Firebase] Auth persistence setup failed:', err);
  });
}

// Analytics is async - initialize lazily
let analyticsInstance = null;
const getAnalyticsInstance = async () => {
  if (analyticsInstance === null && app) {
    analyticsInstance = await initializeAnalyticsAsync(app);
  }
  return analyticsInstance;
};

// For backwards compatibility, expose a sync analytics reference
// (will be null until getAnalyticsInstance is called)
const analytics = null;

// Named exports for tree-shaking optimization
// Note: isEmbeddedBrowser is already exported at definition
export { auth, db, storage, analytics, getAnalyticsInstance };

// Default export for the app instance
export default app;
