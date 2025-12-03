/**
 * Auth Debugger - Comprehensive logging and diagnostics for Firebase auth
 * Helps identify exactly where the auth flow breaks
 */

// Track auth flow events
const authEvents = [];
const MAX_EVENTS = 100;

export const logAuthEvent = (event, data = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    data,
    stack: new Error().stack?.split('\n').slice(2, 5).join('\n')
  };
  
  authEvents.push(entry);
  if (authEvents.length > MAX_EVENTS) {
    authEvents.shift();
  }
  
  // Log to console with color coding
  const colors = {
    START: 'color: #3b82f6; font-weight: bold',
    SUCCESS: 'color: #22c55e; font-weight: bold',
    ERROR: 'color: #ef4444; font-weight: bold',
    WARNING: 'color: #f59e0b; font-weight: bold',
    INFO: 'color: #8b5cf6; font-weight: bold',
    STATE_CHANGE: 'color: #06b6d4; font-weight: bold'
  };
  
  const style = colors[entry.data.type] || colors.INFO;
  console.log(`%c[AuthDebug] ${event}`, style, data);
  
  return entry;
};

export const getAuthEvents = () => [...authEvents];

export const clearAuthEvents = () => {
  authEvents.length = 0;
};

// Diagnose current auth state
export const diagnoseAuthState = (auth, user, loading) => {
  const diagnosis = {
    timestamp: new Date().toISOString(),
    firebase: {
      authInitialized: !!auth,
      currentUser: auth?.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified
      } : null
    },
    react: {
      userState: user ? { uid: user.uid, email: user.email } : null,
      loadingState: loading
    },
    storage: {
      sessionStorage: checkStorage('session'),
      localStorage: checkStorage('local'),
      cookies: navigator.cookieEnabled
    },
    browser: {
      userAgent: navigator.userAgent,
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      isFirefox: navigator.userAgent.includes('Firefox'),
      isChrome: navigator.userAgent.includes('Chrome')
    },
    issues: []
  };
  
  // Detect issues
  if (!diagnosis.firebase.authInitialized) {
    diagnosis.issues.push('Firebase auth not initialized - check config');
  }
  
  if (diagnosis.firebase.currentUser && !diagnosis.react.userState) {
    diagnosis.issues.push('Firebase has user but React state is null - onAuthStateChanged may not have fired');
  }
  
  if (!diagnosis.firebase.currentUser && diagnosis.react.userState) {
    diagnosis.issues.push('React has user but Firebase does not - stale state');
  }
  
  if (diagnosis.react.loadingState && diagnosis.firebase.authInitialized) {
    diagnosis.issues.push('Loading stuck at true - onAuthStateChanged may not have completed');
  }
  
  if (!diagnosis.storage.sessionStorage) {
    diagnosis.issues.push('sessionStorage blocked - will cause auth issues');
  }
  
  if (!diagnosis.storage.cookies) {
    diagnosis.issues.push('Cookies disabled - will cause auth issues');
  }
  
  if (diagnosis.browser.isSafari) {
    diagnosis.issues.push('Safari detected - may have ITP storage partitioning issues');
  }
  
  return diagnosis;
};

const checkStorage = (type) => {
  try {
    const storage = type === 'session' ? sessionStorage : localStorage;
    const key = `__test_${type}__`;
    storage.setItem(key, 'test');
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

// Print diagnostic report to console
export const printDiagnosticReport = (auth, user, loading) => {
  const diagnosis = diagnoseAuthState(auth, user, loading);
  
  console.log('%c========== AUTH DIAGNOSTIC REPORT ==========', 'color: #8b5cf6; font-weight: bold; font-size: 14px');
  console.log('Timestamp:', diagnosis.timestamp);
  console.log('\n%cFirebase State:', 'font-weight: bold');
  console.table(diagnosis.firebase);
  console.log('\n%cReact State:', 'font-weight: bold');
  console.table(diagnosis.react);
  console.log('\n%cStorage Status:', 'font-weight: bold');
  console.table(diagnosis.storage);
  console.log('\n%cBrowser Info:', 'font-weight: bold');
  console.table(diagnosis.browser);
  
  if (diagnosis.issues.length > 0) {
    console.log('\n%c⚠️ ISSUES DETECTED:', 'color: #ef4444; font-weight: bold');
    diagnosis.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  } else {
    console.log('\n%c✅ No obvious issues detected', 'color: #22c55e; font-weight: bold');
  }
  
  console.log('\n%cRecent Auth Events:', 'font-weight: bold');
  console.table(authEvents.slice(-10));
  console.log('%c=============================================', 'color: #8b5cf6; font-weight: bold; font-size: 14px');
  
  return diagnosis;
};

// Expose globally for debugging in console
if (typeof window !== 'undefined') {
  window.__authDebug = {
    getEvents: getAuthEvents,
    clearEvents: clearAuthEvents,
    printReport: printDiagnosticReport,
    diagnose: diagnoseAuthState
  };
}

