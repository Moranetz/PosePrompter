# Quick Fix: "The requested action is invalid" Error

## 🚨 Immediate Fix (2 minutes)

This error usually means your domain isn't authorized or API key restrictions are blocking localhost.

### Fix 1: Add localhost to API Key Restrictions (MOST COMMON FIX)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your Browser API key and click **Edit**
5. Under **"Application restrictions"** → **"HTTP referrers"**, add these:
   ```
   http://localhost:*
   https://localhost:*
   http://127.0.0.1:*
   https://127.0.0.1:*
   ```
6. Click **Save**
7. Wait 1 minute, then try signing in again

### Fix 2: Add localhost to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to **"Authorized domains"**
5. If `localhost` is NOT listed, click **"Add domain"**
6. Enter: `localhost`
7. Click **"Add"**
8. Wait 1 minute, then try again

### Fix 3: Temporarily Remove API Key Restrictions (For Testing)

If you need to test immediately:

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your API key
3. Under "Application restrictions", select **"None"**
4. Click **Save**
5. Test authentication
6. **Then add restrictions back** with localhost included

---

## Why This Happened

When you restricted your API key, you probably only added production domains and forgot `localhost` for local development.

---

## After Fixing

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart your dev server**:
   ```bash
   npm run dev
   ```
3. **Try signing in again**

---

## Still Not Working?

See `AUTH_TROUBLESHOOTING.md` for more detailed troubleshooting.

