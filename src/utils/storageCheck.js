/**
 * Storage availability checker
 * Detects if sessionStorage, localStorage, and cookies are accessible
 * Helps prevent "missing initial state" errors in Firebase auth
 */

// Detect browser type
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  return {
    isChrome: /Chrome/.test(ua) && !/Edg|Edge/.test(ua),
    isFirefox: /Firefox/.test(ua),
    isSafari: /^((?!chrome|android).)*safari/i.test(ua),
    isEdge: /Edg|Edge/.test(ua),
    isIncognito: false, // Will be detected separately
    userAgent: ua
  };
};

// Detect incognito/private browsing mode
export const detectIncognitoMode = async () => {
  // Chrome specific detection
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const { quota } = await navigator.storage.estimate();
      // In incognito, quota is typically much lower
      if (quota && quota < 120000000) {
        return true;
      }
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Firefox detection
  const db = indexedDB.open('test');
  return new Promise((resolve) => {
    db.onerror = () => resolve(true);
    db.onsuccess = () => {
      db.result.close();
      resolve(false);
    };
    setTimeout(() => resolve(false), 100);
  });
};

export const checkStorageAvailability = () => {
  const results = {
    sessionStorage: false,
    localStorage: false,
    cookies: false,
    indexedDB: false,
    allAvailable: false,
    errors: [],
    browser: getBrowserInfo(),
    warnings: []
  };

  // Check sessionStorage
  try {
    const testKey = '__storage_test_session__';
    sessionStorage.setItem(testKey, 'test');
    const value = sessionStorage.getItem(testKey);
    sessionStorage.removeItem(testKey);
    results.sessionStorage = value === 'test';
    if (!results.sessionStorage) {
      results.errors.push('sessionStorage: Value mismatch after write');
    }
  } catch (error) {
    results.errors.push(`sessionStorage: ${error.message}`);
  }

  // Check localStorage
  try {
    const testKey = '__storage_test_local__';
    localStorage.setItem(testKey, 'test');
    const value = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    results.localStorage = value === 'test';
    if (!results.localStorage) {
      results.errors.push('localStorage: Value mismatch after write');
    }
  } catch (error) {
    results.errors.push(`localStorage: ${error.message}`);
  }

  // Check cookies (basic check)
  try {
    if (navigator.cookieEnabled) {
      // Actually try to set a cookie
      document.cookie = '__test_cookie__=1; SameSite=Strict';
      const hasCookie = document.cookie.includes('__test_cookie__');
      document.cookie = '__test_cookie__=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
      results.cookies = hasCookie;
      if (!hasCookie) {
        results.errors.push('Cookies: Could not set test cookie');
      }
    } else {
      results.errors.push('Cookies are disabled in browser settings');
    }
  } catch (error) {
    results.errors.push(`Cookie check: ${error.message}`);
  }

  // Check IndexedDB (Firebase uses this for persistence)
  try {
    const testDB = indexedDB.open('__test_db__');
    testDB.onsuccess = () => {
      testDB.result.close();
      indexedDB.deleteDatabase('__test_db__');
    };
    results.indexedDB = true;
  } catch (error) {
    results.errors.push(`IndexedDB: ${error.message}`);
    results.indexedDB = false;
  }

  // Chrome-specific warnings
  if (results.browser.isChrome) {
    results.warnings.push('Chrome has strict third-party cookie policies');
    if (!results.cookies || !results.sessionStorage) {
      results.warnings.push('Chrome may be blocking storage due to privacy settings');
    }
  }

  results.allAvailable = results.sessionStorage && results.localStorage && results.cookies;

  return results;
};

/**
 * Get user-friendly error message for storage issues
 */
export const getStorageErrorMessage = (storageCheck) => {
  if (storageCheck.allAvailable) {
    return null;
  }

  const issues = [];
  if (!storageCheck.sessionStorage) {
    issues.push('session storage');
  }
  if (!storageCheck.localStorage) {
    issues.push('local storage');
  }
  if (!storageCheck.cookies) {
    issues.push('cookies');
  }

  // Browser-specific instructions
  let instructions = [];
  
  if (storageCheck.browser?.isChrome) {
    instructions = [
      'Click the lock icon in the address bar → Site settings',
      'Set "Cookies" to "Allow"',
      'Make sure "Block third-party cookies" is disabled in Chrome settings',
      'Try: chrome://settings/cookies and add this site to "Sites that can always use cookies"',
      'If in Incognito mode, try regular browsing mode'
    ];
  } else if (storageCheck.browser?.isSafari) {
    instructions = [
      'Go to Safari → Preferences → Privacy',
      'Uncheck "Prevent cross-site tracking"',
      'Uncheck "Block all cookies"',
      'Try using Chrome or Firefox instead'
    ];
  } else if (storageCheck.browser?.isFirefox) {
    instructions = [
      'Click the shield icon in the address bar',
      'Turn off Enhanced Tracking Protection for this site',
      'Or go to Settings → Privacy & Security → Cookies and Site Data'
    ];
  } else {
    instructions = [
      'Enable cookies and site data for this website',
      'Disable any ad blockers or privacy extensions',
      'Allow third-party cookies if prompted',
      'Try using a different browser'
    ];
  }

  return {
    title: 'Browser Storage Required',
    message: `Your browser is blocking ${issues.join(' and ')}. This is required for secure sign-in.`,
    instructions,
    browserInfo: storageCheck.browser
  };
};

/**
 * Log storage issues for monitoring
 */
export const logStorageIssue = (storageCheck, context = '') => {
  if (!storageCheck.allAvailable) {
    console.warn('[StorageCheck] Storage issues detected:', {
      context,
      sessionStorage: storageCheck.sessionStorage,
      localStorage: storageCheck.localStorage,
      cookies: storageCheck.cookies,
      errors: storageCheck.errors,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // In production, you could send this to analytics/error tracking
    // Example: analytics.track('storage_blocked', { ...storageCheck });
  }
};

