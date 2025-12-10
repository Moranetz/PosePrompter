# Step-by-Step Firebase Debugging Guide

This guide will help you identify and fix Firebase configuration issues in your local development environment.

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js installed (you have v22.19.0)
- ✅ npm installed
- ✅ A Firebase project created at https://console.firebase.google.com

---

## Step 1: Check Your Environment Variables

### 1.1 Check if `.env.local` exists

Open your terminal in the project root and run:

```bash
# Windows PowerShell
Test-Path .env.local

# Or check manually - look for .env.local in the root folder
```

**Expected result:** Should return `True` or the file should exist.

**If it doesn't exist:** You need to create it (see Step 2).

### 1.2 Check what environment variables are loaded

Open your browser console (F12) and run:

```javascript
// Check if env vars are accessible
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
```

**Expected result:** Should show your actual Firebase values (not `undefined`).

**If you see `undefined`:** 
- The `.env.local` file doesn't exist or is in the wrong location
- The dev server wasn't restarted after creating `.env.local`
- Variable names are incorrect (must start with `VITE_`)

---

## Step 2: Create `.env.local` File

### 2.1 Get Your Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll to **"Your apps"** section
5. Click on your web app (or create one if needed)
6. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX" // Optional
};
```

### 2.2 Create `.env.local` File

In your project root (same folder as `package.json`), create a file named `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...your-actual-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important:**
- Replace all values with your actual Firebase config values
- No quotes around values
- No spaces around the `=` sign
- Each variable on its own line

### 2.3 Verify File Location

The `.env.local` file must be in the project root:

```
Pose Prompter/
├── .env.local          ← HERE (same level as package.json)
├── package.json
├── vite.config.js
├── src/
│   ├── firebase-config.js
│   └── ...
```

---

## Step 3: Restart Your Dev Server

**CRITICAL:** Vite only loads environment variables when the dev server starts. You MUST restart after creating or modifying `.env.local`.

### 3.1 Stop the current dev server

Press `Ctrl+C` in the terminal where `npm run dev` is running.

### 3.2 Start it again

```bash
npm run dev
```

### 3.3 Check the console output

Look for any errors in the terminal. You should see:
- ✅ Vite dev server starting
- ✅ No Firebase-related errors
- ✅ Server running on http://localhost:5173 (or your configured port)

---

## Step 4: Check Browser Console

### 4.1 Open your app in the browser

Navigate to `http://localhost:5173` (or your dev server URL).

### 4.2 Open DevTools Console

Press `F12` or right-click → Inspect → Console tab.

### 4.3 Look for Firebase Config Check

You should see a log message like:

```
Firebase Config Check: {
  hasApiKey: true,
  hasProjectId: true,
  apiKey: "AIzaSy...",
  projectId: "your-project-id"
}
```

**If you see `hasApiKey: false` or `hasProjectId: false`:**
- Environment variables are not loading
- Go back to Step 2 and verify `.env.local` file

### 4.4 Check for Errors

Look for any red error messages. Common errors:

**Error: "Firebase configuration is missing"**
- Solution: Check Step 2 - `.env.local` file and values

**Error: "Firebase app is not initialized"**
- Solution: Check that all required env vars are set correctly

**Error: "Firestore database is not initialized"**
- Solution: Usually means Firebase app didn't initialize (check above)

---

## Step 5: Run Diagnostic Script

### 5.1 Import and run the diagnostic

In your browser console, run:

```javascript
// Import the diagnostic function
import('./src/utils/diagnose-firebase.js').then(module => {
  module.diagnoseFirebase();
});
```

Or if you've added it to your app, just run:

```javascript
diagnoseFirebase();
```

### 5.2 Review the output

The diagnostic will show:
- ✅ Which environment variables are loaded
- ✅ Which Firebase services are initialized
- ❌ Any issues found
- 💡 Suggested next steps

---

## Step 6: Test Firebase Connection

### 6.1 Test Authentication

Try to sign in or sign up. If you see:
- ✅ Auth modal appears
- ✅ No "Firebase authentication is not configured" error
- ✅ Can attempt to sign in

Then Firebase Auth is working!

### 6.2 Test Firestore

If you can access user profile or other Firestore features:
- ✅ Firestore is working

---

## Common Issues and Solutions

### Issue 1: "Firebase configuration is missing" in console

**Cause:** Environment variables not loaded

**Solutions:**
1. Verify `.env.local` exists in project root
2. Check variable names start with `VITE_`
3. Restart dev server
4. Check for typos in variable names

### Issue 2: Blank screen or infinite loading

**Cause:** App waiting for Firebase to initialize, but it never does

**Solutions:**
1. Check browser console for errors
2. Verify all required env vars are set
3. Check `firebase-config.js` console logs
4. Ensure Firebase project is active in Firebase Console

### Issue 3: "Cannot read property 'uid' of null"

**Cause:** User context trying to access user before auth initializes

**Solutions:**
1. This is usually a symptom, not the root cause
2. Fix Firebase initialization first (Steps 1-4)
3. The UserContext should handle null users gracefully

### Issue 4: Environment variables show as `undefined` in browser

**Cause:** Vite not loading env vars

**Solutions:**
1. Verify file is named `.env.local` (not `.env` or `.env.local.txt`)
2. Check file is in project root (same folder as `package.json`)
3. Restart dev server
4. Check `vite.config.js` has `envPrefix: 'VITE_'`

### Issue 5: Dev server won't start

**Cause:** Syntax error in `.env.local` or other config issue

**Solutions:**
1. Check `.env.local` syntax (no quotes, no spaces around `=`)
2. Check `vite.config.js` for errors
3. Check `package.json` for errors
4. Try deleting `node_modules` and `package-lock.json`, then `npm install`

---

## Verification Checklist

Before asking for help, verify:

- [ ] `.env.local` file exists in project root
- [ ] All required env vars are set (no empty values)
- [ ] Variable names start with `VITE_`
- [ ] Dev server was restarted after creating/modifying `.env.local`
- [ ] Browser console shows Firebase Config Check with `hasApiKey: true`
- [ ] No red errors in browser console
- [ ] Firebase project is active in Firebase Console
- [ ] Firebase project has Authentication enabled
- [ ] Firebase project has Firestore enabled
- [ ] Firebase project has Storage enabled

---

## Still Having Issues?

If you've completed all steps and still have issues:

1. **Share your console errors:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Copy ALL error messages (including stack traces)
   - Share them

2. **Share your terminal output:**
   - Copy the output from `npm run dev`
   - Include any errors or warnings

3. **Check your `.env.local` (redact sensitive values):**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...XXX (first 10 chars)
   VITE_FIREBASE_PROJECT_ID=your-project-id
   # etc (show structure, not full values)
   ```

4. **Run the diagnostic:**
   - Share the output from `diagnoseFirebase()`

---

## Quick Test: Minimal Firebase Setup

If you want to test if Firebase works at all, create a minimal test:

1. Create `test-firebase.html` in project root
2. Add your Firebase config directly (for testing only)
3. Try to initialize Firebase
4. If this works, the issue is with environment variables
5. If this doesn't work, the issue is with Firebase project setup

---

## Next Steps After Fixing

Once Firebase is working:

1. ✅ Test authentication (sign in/sign up)
2. ✅ Test Firestore (create/read user profile)
3. ✅ Test Storage (upload avatar)
4. ✅ Test package creation
5. ✅ Test all app features

Good luck! 🚀

