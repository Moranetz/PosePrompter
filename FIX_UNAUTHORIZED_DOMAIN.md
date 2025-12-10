# Fix: "This domain is not authorized" Error

## Quick Fix (2 minutes)

Your domain `poseprompter.com` needs to be added to Firebase's authorized domains list.

---

## Step 1: Add Domain to Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pose-prompter**
3. Click **⚙️ Settings** (gear icon) → **Project settings**
4. Scroll down to **"Authorized domains"** section
5. Click **"Add domain"** button
6. Enter: `poseprompter.com`
7. Click **"Add"**
8. **Also add www version:**
   - Click **"Add domain"** again
   - Enter: `www.poseprompter.com`
   - Click **"Add"**

---

## Step 2: Update API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **APIs & Services** → **Credentials**
4. Find your Browser API key (starts with `AIzaSy...`)
5. Click **Edit** (pencil icon)
6. Under **"Application restrictions"** → **"HTTP referrers"**, make sure you have:
   ```
   http://localhost:*
   https://localhost:*
   https://pose-prompter.web.app/*
   https://pose-prompter.firebaseapp.com/*
   https://poseprompter.com/*
   https://www.poseprompter.com/*
   ```
7. Click **Save**

---

## Step 3: Wait and Test

1. **Wait 1-2 minutes** for changes to propagate
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Close all tabs** with your site
4. **Open new tab** and go to `https://poseprompter.com`
5. **Try signing in again**

---

## Complete Authorized Domains List

After adding, your authorized domains should include:

- ✅ `localhost` (for local dev)
- ✅ `pose-prompter.web.app`
- ✅ `pose-prompter.firebaseapp.com`
- ✅ `poseprompter.com` ← **ADD THIS**
- ✅ `www.poseprompter.com` ← **ADD THIS**

---

## Still Not Working?

If it still doesn't work after 2 minutes:

1. **Check browser console** (F12) for exact error code
2. **Verify domains are listed** in Firebase Console
3. **Double-check API key restrictions** include the new domain
4. **Try incognito/private window** to rule out cache issues

---

**This should fix it! The domain just needs to be authorized for Firebase Authentication.**

