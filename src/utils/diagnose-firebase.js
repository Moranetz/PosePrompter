/**
 * Firebase Configuration Diagnostic Tool
 * 
 * Run this in the browser console to diagnose Firebase setup issues.
 * 
 * Usage:
 * 1. Open your app in the browser
 * 2. Open DevTools Console (F12)
 * 3. Copy and paste this entire script
 * 4. Or import it: import { diagnoseFirebase } from './utils/diagnose-firebase.js'
 */

export const diagnoseFirebase = () => {
  console.log('%c🔍 Firebase Configuration Diagnostic', 'font-size: 18px; font-weight: bold; color: #8b5cf6;');
  console.log('='.repeat(60));
  
  const results = {
    envVars: {},
    firebaseConfig: null,
    firebaseInitialized: false,
    services: {},
    issues: []
  };

  // Check environment variables
  console.log('\n📋 Step 1: Checking Environment Variables');
  console.log('-'.repeat(60));
  
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const optionalVars = ['VITE_FIREBASE_MEASUREMENT_ID'];
  
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    results.envVars[varName] = value;
    
    if (!value || value === 'undefined' || value === '') {
      results.issues.push(`❌ Missing required env var: ${varName}`);
      console.error(`  ❌ ${varName}: MISSING or empty`);
    } else {
      const preview = value.length > 20 ? value.substring(0, 20) + '...' : value;
      console.log(`  ✅ ${varName}: ${preview}`);
    }
  });
  
  optionalVars.forEach(varName => {
    const value = import.meta.env[varName];
    results.envVars[varName] = value;
    if (value) {
      console.log(`  ⚠️  ${varName}: ${value.substring(0, 20)}... (optional)`);
    } else {
      console.log(`  ⚠️  ${varName}: not set (optional)`);
    }
  });

  // Check if Firebase config module is accessible
  console.log('\n📦 Step 2: Checking Firebase Module');
  console.log('-'.repeat(60));
  
  try {
    // Try to import Firebase config
    import('../firebase-config.js').then(module => {
      const { auth, db, storage, default: app } = module;
      
      results.firebaseConfig = {
        app: app ? 'initialized' : 'null',
        auth: auth ? 'initialized' : 'null',
        db: db ? 'initialized' : 'null',
        storage: storage ? 'initialized' : 'null'
      };
      
      results.firebaseInitialized = !!app;
      results.services = {
        auth: !!auth,
        db: !!db,
        storage: !!storage
      };
      
      if (app) {
        console.log('  ✅ Firebase app: initialized');
        results.firebaseInitialized = true;
      } else {
        console.error('  ❌ Firebase app: NOT initialized');
        results.issues.push('Firebase app is not initialized');
      }
      
      if (auth) {
        console.log('  ✅ Firebase Auth: initialized');
      } else {
        console.error('  ❌ Firebase Auth: NOT initialized');
        results.issues.push('Firebase Auth is not initialized');
      }
      
      if (db) {
        console.log('  ✅ Firestore: initialized');
      } else {
        console.error('  ❌ Firestore: NOT initialized');
        results.issues.push('Firestore is not initialized');
      }
      
      if (storage) {
        console.log('  ✅ Firebase Storage: initialized');
      } else {
        console.error('  ❌ Firebase Storage: NOT initialized');
        results.issues.push('Firebase Storage is not initialized');
      }
      
      // Final summary
      console.log('\n📊 Summary');
      console.log('='.repeat(60));
      
      if (results.issues.length === 0) {
        console.log('%c✅ All checks passed! Firebase is properly configured.', 'color: #22c55e; font-weight: bold;');
      } else {
        console.log('%c❌ Issues found:', 'color: #ef4444; font-weight: bold;');
        results.issues.forEach(issue => console.error(`  ${issue}`));
        
        console.log('\n💡 Next Steps:');
        console.log('1. Check if .env.local exists in project root');
        console.log('2. Verify all VITE_FIREBASE_* variables are set');
        console.log('3. Restart the dev server after creating/modifying .env.local');
        console.log('4. Check browser console for Firebase initialization errors');
      }
      
      return results;
    }).catch(err => {
      console.error('  ❌ Error importing firebase-config:', err);
      results.issues.push(`Error importing firebase-config: ${err.message}`);
      return results;
    });
  } catch (err) {
    console.error('  ❌ Error checking Firebase module:', err);
    results.issues.push(`Error checking Firebase module: ${err.message}`);
    return results;
  }
  
  return results;
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  window.diagnoseFirebase = diagnoseFirebase;
  console.log('💡 Run diagnoseFirebase() in the console to check your Firebase setup');
}

