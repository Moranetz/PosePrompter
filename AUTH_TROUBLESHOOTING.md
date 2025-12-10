# Authentication Troubleshooting Guide

## Error: "The requested action is invalid"

This error typically means your domain isn't authorized for Firebase Authentication, or API key restrictions are blocking the request.

---

## Quick Fixes (Try These First)

### 1. Check Authorized Domains in Firebase Console ⚠️ CRITICAL

**This is the most common cause!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** ⚙️ next to "Project Overview"
4. Select **"Project settings"**
5. Scroll down to **"Authorized domains"** section
6. Make sure these domains are listed:
   - `localhost` (for local development)
   - `your-project-id.web.app`
   - `your-project-id.firebaseapp.com`
   - Your custom domain (if you have one)

7. **If your domain is missing:**
   - Click **"Add domain"**
   - Enter your domain (e.g., `localhost` or your production domain)
   - Click **"Add"**

8. **Wait 1-2 minutes** for changes to propagate

### 2. Check API Key Restrictions

If you just restricted your API key, make sure you included all necessary domains:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your Browser API key and click **Edit**
5. Under **"Application restrictions"** → **"HTTP referrers"**, make sure you have:
   ```
   http://localhost:*
   https://localhost:*
   https://your-project-id.web.app/*
   https://your-project-id.firebaseapp.com/*
   ```
   (Replace `your-project-id` with your actual project ID)

6. **Important**: If you're testing locally, you MUST include `localhost` patterns!

### 3. Check Firebase Authentication Providers

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **"Authentication"** in the left sidebar
4. Click **"Sign-in method"** tab
5. Make sure **"Google"** is enabled:
   - Click on **"Google"**
   - Toggle it to **"Enabled"** if it's disabled
   - Make sure **"Project support email"** is set
   - Click **"Save"**

6. Also check **"Email/Password"** is enabled if you're using that method

### 4. Check OAuth Consent Screen (For Google Sign-In)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Make sure:
   - **User Type** is set (usually "External" for public apps)
   - **App name** is filled in
   - **User support email** is set
   - **Developer contact information** is set
   - **Scopes** include at least:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`

5. If you see any warnings (yellow triangles), fix them

### 5. Temporarily Disable App Check Enforcement

If you just enabled App Check with enforcement, it might be blocking requests:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **App Check**
4. For each service (Firestore, Storage, etc.), make sure **"Enforce"** is **OFF** (for now)
5. You can enable enforcement later after everything works

---

## Step-by-Step Recovery

### Step 1: Verify Local Development Works

1. **Clear browser cache and cookies** for localhost
2. **Restart your dev server**:
   ```bash
   npm run dev
   ```
3. **Try signing in with email/password first** (simpler, less likely to have issues)
4. If email/password works, the issue is likely with Google OAuth configuration

### Step 2: Fix Google Sign-In

If email/password works but Google doesn't:

1. **Check Authorized Domains** (see section 1 above)
2. **Check OAuth Consent Screen** (see section 4 above)
3. **Try in an incognito/private window** (rules out cache issues)
4. **Check browser console** for specific error messages

### Step 3: Test API Key Restrictions

If you just restricted your API key:

1. **Temporarily remove restrictions** to test:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your API key
   - Under "Application restrictions", select **"None"**
   - Click **Save**
   - Try signing in again

2. **If it works without restrictions**, then add restrictions back one by one:
   - Add `localhost` patterns first
   - Test
   - Add production domains
   - Test

### Step 4: Check Browser Console

Open browser DevTools (F12) and check the Console tab for specific error messages:

- Look for errors starting with `auth/`
- Common errors:
  - `auth/unauthorized-domain` → Domain not authorized
  - `auth/operation-not-allowed` → Sign-in method not enabled
  - `auth/api-key-not-valid` → API key issue
  - `auth/invalid-api-key` → API key configuration issue

---

## Common Scenarios

### Scenario 1: "Worked before, broke after API key restriction"

**Solution**: Your API key restrictions are too strict or missing localhost.

1. Check API key restrictions include `localhost` patterns
2. Make sure you're using the correct API key (check `.env.local`)

### Scenario 2: "Google sign-in doesn't work, email/password does"

**Solution**: OAuth configuration issue.

1. Check OAuth consent screen is configured
2. Check Google sign-in method is enabled in Firebase
3. Check authorized domains include your domain

### Scenario 3: "Nothing works after App Check setup"

**Solution**: App Check enforcement is blocking requests.

1. Disable App Check enforcement temporarily
2. Test authentication
3. Re-enable enforcement after auth works

### Scenario 4: "Works locally but not in production"

**Solution**: Production domain not authorized.

1. Add your production domain to Firebase authorized domains
2. Add production domain to API key restrictions
3. Wait 2-3 minutes for changes to propagate

---

## Verification Checklist

After making changes, verify:

- [ ] Authorized domains include `localhost` (for dev) and production domain
- [ ] Google sign-in method is enabled in Firebase
- [ ] OAuth consent screen is configured
- [ ] API key restrictions include necessary domains
- [ ] App Check enforcement is disabled (for testing)
- [ ] Browser cache is cleared
- [ ] Dev server is restarted

---

## Still Not Working?

### Get More Information

1. **Open browser console** (F12)
2. **Try signing in**
3. **Copy all error messages** from console
4. **Check Network tab** for failed requests
5. **Look for specific error codes** (they start with `auth/`)

### Common Error Codes

- `auth/unauthorized-domain` → Add domain to authorized domains
- `auth/operation-not-allowed` → Enable sign-in method in Firebase
- `auth/api-key-not-valid` → Check API key in `.env.local`
- `auth/invalid-api-key` → Verify API key restrictions
- `auth/network-request-failed` → Network/connectivity issue
- `auth/popup-blocked` → Browser blocked popup (use redirect instead)

---

## Quick Test Commands

### Test Firebase Connection

Open browser console and run:
```javascript
// Check if Firebase is initialized
console.log('Firebase Auth:', window.firebase || 'Not found');

// Check current user
import { auth } from './firebase-config';
console.log('Current user:', auth?.currentUser);
```

### Test API Key

Check your `.env.local` file has:
```
VITE_FIREBASE_API_KEY=your-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

---

## Emergency: Reset Everything

If nothing works, you can temporarily:

1. **Remove API key restrictions** (set to "None")
2. **Disable App Check enforcement**
3. **Add all domains to authorized domains**
4. **Test authentication**
5. **Re-enable restrictions one by one** after it works

---

## Need More Help?

- **Firebase Auth Docs**: https://firebase.google.com/docs/auth
- **Troubleshooting Guide**: https://firebase.google.com/docs/auth/web/troubleshooting
- **Firebase Support**: https://firebase.google.com/support

---

**Most Common Fix**: Add `localhost` to authorized domains and API key restrictions!

