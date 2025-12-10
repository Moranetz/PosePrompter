# Complete Domain Authorization Checklist

The "This domain is not authorized" error means the domain needs to be added in multiple places. Let's check ALL of them.

---

## ✅ Checklist - Check Each One

### 1. Firebase Authorized Domains ⚠️ CRITICAL

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project: **pose-prompter**
3. ⚙️ Settings → **Project settings**
4. Scroll to **"Authorized domains"**
5. **Verify these are listed:**
   - `localhost`
   - `pose-prompter.web.app`
   - `pose-prompter.firebaseapp.com`
   - `poseprompter.com` ← **Must be here**
   - `www.poseprompter.com` ← **Must be here**

6. **If missing, add them:**
   - Click "Add domain"
   - Enter domain
   - Click "Add"
   - **Wait 2-3 minutes** after adding

---

### 2. OAuth Consent Screen Authorized Domains ⚠️ CRITICAL

This is often missed!

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Scroll to **"Authorized domains"** section (near the bottom)
5. **Click "Add Domain"**
6. Enter: `poseprompter.com`
7. Click **"Add"**
8. **Add www version too:**
   - Click "Add Domain" again
   - Enter: `www.poseprompter.com`
   - Click "Add"

**Important**: This is different from OAuth Client IDs!

---

### 3. OAuth 2.0 Client ID - Authorized JavaScript Origins

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (not the API key - this is different)
   - It might be named "Web client" or "Web application"
   - Or look for one with type "OAuth 2.0 Client ID"
5. Click **Edit** (pencil icon)
6. Under **"Authorized JavaScript origins"**, add:
   ```
   https://poseprompter.com
   https://www.poseprompter.com
   ```
   (No trailing slash, no wildcards)
7. Under **"Authorized redirect URIs"**, add:
   ```
   https://poseprompter.com/__/auth/handler
   https://www.poseprompter.com/__/auth/handler
   ```
8. Click **Save**

---

### 4. API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **Browser API key** (starts with `AIzaSy...`)
5. Click **Edit**
6. Under **"Application restrictions"** → **"HTTP referrers"**, verify you have:
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

### 5. Clear Cache and Wait

After making changes:

1. **Wait 5-10 minutes** for all changes to propagate
2. **Clear browser cache completely:**
   - Press Ctrl+Shift+Delete
   - Select "All time"
   - Check "Cached images and files"
   - Click "Clear data"
3. **Close ALL browser tabs** with your site
4. **Open incognito/private window**
5. Go to `https://poseprompter.com`
6. Try signing in

---

## Most Common Issue: OAuth Consent Screen

**90% of the time**, the issue is #2 - OAuth Consent Screen Authorized Domains. This is different from OAuth Client IDs and is often missed!

---

## Verify Everything is Set

### Firebase Console:
- [ ] `poseprompter.com` in Authorized domains
- [ ] `www.poseprompter.com` in Authorized domains

### Google Cloud Console - OAuth Consent Screen:
- [ ] `poseprompter.com` in Authorized domains
- [ ] `www.poseprompter.com` in Authorized domains

### Google Cloud Console - OAuth 2.0 Client ID:
- [ ] `https://poseprompter.com` in Authorized JavaScript origins
- [ ] `https://www.poseprompter.com` in Authorized JavaScript origins
- [ ] `https://poseprompter.com/__/auth/handler` in Authorized redirect URIs
- [ ] `https://www.poseprompter.com/__/auth/handler` in Authorized redirect URIs

### Google Cloud Console - API Key:
- [ ] `https://poseprompter.com/*` in HTTP referrers
- [ ] `https://www.poseprompter.com/*` in HTTP referrers

---

## Still Not Working?

### Check Browser Console for Exact Error

1. Open DevTools (F12)
2. Go to **Console** tab
3. Try signing in
4. Look for error code - should show something like:
   - `auth/unauthorized-domain`
   - `auth/configuration-not-found`
   - Or another specific code

### Test in Different Browser

Try in:
- Chrome incognito
- Firefox private window
- Different device

### Check Domain Status

1. Go to Firebase Console → Hosting
2. Check if `poseprompter.com` shows as "Connected" (green checkmark)
3. If it shows "Pending" or error, DNS might not be fully propagated

---

## Quick Test

After making all changes, wait 10 minutes, then:

1. Open incognito window
2. Go to `https://poseprompter.com`
3. Open browser console (F12)
4. Try signing in
5. Check console for exact error message

---

**The OAuth Consent Screen Authorized Domains (#2) is the most commonly missed step!**

