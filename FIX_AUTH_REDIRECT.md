# Fix: Authentication Redirect Issue

Based on the URL you shared, I can see:
- **Your project**: `pose-prompter`
- **Redirect URL**: `https://pose-prompter.web.app/`
- **API Key**: Get from Firebase Console (starts with `AIzaSy...`)

The popup is opening, but authentication is failing. Here's how to fix it:

---

## Fix 1: Add Authorized Domains (MOST LIKELY FIX)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pose-prompter**
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to **"Authorized domains"** section
5. Make sure these are listed:
   - ✅ `pose-prompter.web.app`
   - ✅ `pose-prompter.firebaseapp.com`
   - ✅ `localhost` (for local dev)
   - ✅ Your custom domain (if you have one)

6. **If any are missing**, click **"Add domain"** and add them
7. **Wait 1-2 minutes** for changes to propagate

---

## Fix 2: Check API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **APIs & Services** → **Credentials**
4. Find your API key (starts with `AIzaSy...`)
5. Click **Edit**
6. Under **"Application restrictions"** → **"HTTP referrers"**, make sure you have:
   ```
   http://localhost:*
   https://localhost:*
   https://pose-prompter.web.app/*
   https://pose-prompter.firebaseapp.com/*
   ```
7. Click **Save**
8. **Wait 1-2 minutes**

---

## Fix 3: Check OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Make sure:
   - **User Type**: Set (usually "External")
   - **App name**: Filled in
   - **User support email**: Set
   - **Developer contact information**: Set
   - **Scopes**: Should include `.../auth/userinfo.email` and `.../auth/userinfo.profile`
5. If you see warnings (yellow triangles), fix them
6. If status is "Testing", you may need to add test users or publish it

---

## Fix 4: Check Sign-In Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **"Google"**
5. Make sure:
   - **Enable** toggle is ON (green)
   - **Project support email** is set
6. Click **Save**

---

## Fix 5: Check App Check (If Enabled)

If you enabled App Check:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **App Check**
4. **Temporarily disable enforcement** for all services:
   - Firestore: Set to "Unenforced"
   - Storage: Set to "Unenforced"
   - Functions: Set to "Unenforced"
5. Try signing in again
6. If it works, App Check was the issue - you can re-enable it later with proper configuration

---

## Quick Test

After making changes:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Close all browser tabs** with your app
3. **Open a new tab** and go to `https://pose-prompter.web.app/`
4. **Try signing in again**

---

## What to Check in Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Try signing in
4. Look for errors - they should now show specific error codes like:
   - `auth/unauthorized-domain` → Fix 1
   - `auth/operation-not-allowed` → Fix 4
   - `auth/api-key-not-valid` → Fix 2
   - `auth/configuration-not-found` → Check .env.local

---

## Most Common Issue

**90% of the time**, it's **Fix 1** - the authorized domains. Make sure `pose-prompter.web.app` and `pose-prompter.firebaseapp.com` are both in the authorized domains list.

---

## Still Not Working?

Share:
1. **The exact error code** from browser console
2. **Which fix you tried**
3. **What happens** when you try to sign in (popup opens? closes? shows error?)

