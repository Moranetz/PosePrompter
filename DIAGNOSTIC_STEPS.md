# Diagnostic Steps - Let's Find the Exact Problem

## Step 1: Check Browser Console for Exact Error

1. **Open your app** in the browser
2. **Press F12** to open DevTools
3. **Click the "Console" tab**
4. **Try to sign in** (Google or email/password)
5. **Look for red error messages**
6. **Copy the EXACT error message** - it should look like:
   - `auth/unauthorized-domain`
   - `auth/operation-not-allowed`
   - `auth/api-key-not-valid`
   - `auth/invalid-api-key`
   - Or something else

**What error code do you see?** (This will tell us exactly what's wrong)

---

## Step 2: Check Network Tab

1. **Open DevTools** (F12)
2. **Click "Network" tab**
3. **Clear the network log** (trash icon)
4. **Try to sign in**
5. **Look for failed requests** (they'll be red)
6. **Click on the failed request**
7. **Check the "Response" tab** - what does it say?

---

## Step 3: Verify Firebase Configuration

Open browser console and run this to check your Firebase config:

```javascript
// Check if Firebase is loaded
console.log('Firebase Auth:', typeof auth !== 'undefined' ? 'Loaded' : 'NOT LOADED');

// Check API key
console.log('API Key starts with:', import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10));

// Check auth domain
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
```

**Or check your `.env.local` file directly:**
- Does `VITE_FIREBASE_API_KEY` exist?
- Does `VITE_FIREBASE_AUTH_DOMAIN` exist?
- Are they the correct values?

---

## Step 4: Test Each Sign-In Method Separately

### Test Email/Password First (Simpler)
1. Try **email/password sign-up** (create new account)
2. Does it work?
3. If yes → Problem is with Google OAuth only
4. If no → Problem is with Firebase Auth in general

### Test Google Sign-In
1. Try **Google sign-in**
2. What happens?
   - Popup opens but shows error?
   - Popup doesn't open at all?
   - Error appears immediately?

---

## Step 5: Check Firebase Console Settings

### A. Authorized Domains
1. Firebase Console → Project Settings → Authorized domains
2. **List all domains shown** - do you see:
   - `localhost`
   - `your-project-id.web.app`
   - `your-project-id.firebaseapp.com`

### B. Sign-In Methods
1. Firebase Console → Authentication → Sign-in method
2. **Is "Google" enabled?** (should show green toggle)
3. **Is "Email/Password" enabled?** (should show green toggle)
4. **Click on "Google"** - is "Project support email" filled in?

### C. OAuth Consent Screen
1. Google Cloud Console → APIs & Services → OAuth consent screen
2. **What does it show?**
   - Is it "Published" or "Testing"?
   - Are there any warnings (yellow triangles)?
   - Is "App name" filled in?

---

## Step 6: Check API Key Restrictions

1. Google Cloud Console → APIs & Services → Credentials
2. **Find your Browser API key**
3. **Click Edit**
4. **Under "Application restrictions"** - what is selected?
   - "None" (no restrictions)
   - "HTTP referrers" (with domains listed)
   - Something else?

5. **If "HTTP referrers" is selected**, list all domains shown

---

## Step 7: Check App Check Status

1. Firebase Console → App Check
2. **Is your web app registered?**
3. **If yes, is enforcement enabled?** (for any services)
4. **If enforcement is ON**, try turning it OFF temporarily to test

---

## Step 8: Try Incognito/Private Window

1. **Open an incognito/private browser window**
2. **Go to your app**
3. **Try signing in**
4. **Does it work?**
   - If yes → Browser cache/cookies issue
   - If no → Configuration issue

---

## Step 9: Check What URL You're Using

**What URL are you accessing the app from?**
- `http://localhost:5173` (dev server)
- `https://your-project.web.app` (Firebase hosting)
- Something else?

**This matters because:**
- API key restrictions must match the exact URL
- Authorized domains must match

---

## Step 10: Restart Dev Server

Sometimes environment variables don't load properly:

1. **Stop your dev server** (Ctrl+C)
2. **Restart it:**
   ```bash
   npm run dev
   ```
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Try again**

---

## What to Report Back

Please tell me:

1. **Exact error code** from browser console (Step 1)
2. **Which sign-in method fails** (Google, email/password, or both)
3. **What URL you're using** (localhost:5173, etc.)
4. **Are authorized domains correct?** (Step 5A)
5. **Are sign-in methods enabled?** (Step 5B)
6. **What are your API key restrictions?** (Step 6)

With this information, I can give you the exact fix!

