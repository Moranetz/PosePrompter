# Manual Security Steps - Quick Guide

These steps require manual action in Google Cloud Console and Firebase Console. Follow this guide to complete them.

## 🔴 CRITICAL: Restrict Firebase API Key (15 minutes)

### Why This Matters
Without this, anyone can use your Firebase API key on their own website, potentially abusing your Firebase quotas and costing you money.

### Step-by-Step Instructions

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Make sure you're logged in with the same account that owns your Firebase project

2. **Select Your Firebase Project**
   - Click the project dropdown at the top
   - Select your Firebase project (the one you're using for Pose Prompter)

3. **Navigate to API Credentials**
   - In the left sidebar, click **"APIs & Services"**
   - Click **"Credentials"** (or go directly to: https://console.cloud.google.com/apis/credentials)

4. **Find Your Browser API Key**
   - Look for a key with type **"Browser key"** or **"API key"**
   - It should start with `AIza...`
   - The name might be something like "Browser key" or your project name
   - **Note**: There might be multiple keys - you want the one that matches your Firebase web app

5. **Edit the API Key**
   - Click the **pencil icon** (Edit) next to your API key
   - Or click on the key name to open the edit page

6. **Set Application Restrictions**
   - Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
   - Click **"Add an item"** for each domain you want to allow

7. **Add Your Domains**
   Add these referrers (replace `your-project-id` with your actual Firebase project ID):
   ```
   http://localhost:*
   https://localhost:*
   http://127.0.0.1:*
   https://127.0.0.1:*
   https://your-project-id.web.app/*
   https://your-project-id.firebaseapp.com/*
   ```
   
   **CRITICAL**: You MUST include `localhost` patterns if you're testing locally!
   
   If you have a custom domain, also add:
   ```
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   ```

8. **Set API Restrictions (Optional but Recommended)**
   - Under **"API restrictions"**, select **"Restrict key"**
   - Select these APIs:
     - Firebase Installations API
     - Firebase Remote Config API
     - Identity Toolkit API
     - Cloud Firestore API
     - Cloud Storage JSON API
     - Firebase Authentication API
   - This limits what the key can access

9. **Save**
   - Click **"Save"** at the bottom
   - Wait for the changes to propagate (usually instant, but can take a few minutes)

10. **Test It**
    - Try accessing your Firebase from a different domain - it should fail
    - Your app should still work normally on your allowed domains

### How to Find Your Firebase Project ID

If you're not sure what your project ID is:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project ID is shown in the project name or URL
3. Or check your `.env.local` file - look for `VITE_FIREBASE_PROJECT_ID`

---

## 🟡 RECOMMENDED: Enable Firebase App Check (30 minutes)

### Why This Matters
App Check helps protect your backend resources from abuse, bot traffic, and unauthorized access.

### Step-by-Step Instructions

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your project

2. **Navigate to App Check**
   - In the left sidebar, click **"App Check"**
   - If you don't see it, click the **"Build"** section to expand it

3. **Get Started**
   - Click **"Get started"** (if this is your first time)
   - Or click **"Register app"** if you've used App Check before

4. **Register Your Web App**
   - Find your web app in the list
   - Click **"Register"** next to it

5. **Choose Provider**
   - Select **"reCAPTCHA v3"** (this is the free option)
   - Click **"Next"**

6. **Get reCAPTCHA Keys** (If prompted for secret key)
   
   If Firebase asks for a reCAPTCHA secret key, you need to create one first:
   
   **Step 6a: Create reCAPTCHA Site**
   1. Open a new tab and go to: https://www.google.com/recaptcha/admin/create
   2. Log in with the same Google account you use for Firebase
   3. Fill in the form:
      - **Label**: "Pose Prompter" (or your app name)
      - **reCAPTCHA type**: Select **"reCAPTCHA v3"**
      - **Domains**: Add your domains (one per line):
        ```
        your-project-id.web.app
        your-project-id.firebaseapp.com
        localhost
        ```
        (Replace `your-project-id` with your actual Firebase project ID)
        (Add `localhost` for local testing)
      - **Owners**: Your email (should be pre-filled)
   4. Accept the reCAPTCHA Terms of Service
   5. Click **"Submit"**
   
   **Step 6b: Get Your Keys**
   1. After creating the site, you'll see two keys:
      - **Site Key** (starts with `6L...`) - This is public, safe to expose
      - **Secret Key** (starts with `6L...`) - This is private, keep it secret
   2. **Copy the Secret Key** - You'll need this for Firebase
   3. Keep this page open or note down both keys

   **Step 6c: Enter Keys in Firebase**
   1. Go back to the Firebase App Check setup page
   2. Paste the **Secret Key** into the "reCAPTCHA secret key" field
   3. Set **Token time to live** to `1` day (default is fine)
   4. Click **"Save"** or **"Register"**

7. **Alternative: Let Firebase Handle It Automatically**
   
   **Note**: Some Firebase projects can use reCAPTCHA automatically without manual setup. If you see an option like "Use Firebase-managed reCAPTCHA" or "Automatic setup", you can use that instead and skip steps 6a-6c above.

8. **Configure Domains** (If not already done)
   - Make sure your domains are added:
     - `your-project-id.web.app`
     - `your-project-id.firebaseapp.com`
     - Your custom domain (if you have one)
   - Click **"Save"**

7. **Enable Enforcement (Optional)**
   - After registration, you can enable enforcement for specific services
   - For now, just having it registered is good
   - You can enable enforcement later if needed

8. **Update Your Code (Optional)**
   - App Check works automatically for most Firebase services
   - You can optionally add App Check tokens to your Security Rules for extra protection
   - This is advanced and not required for basic protection

### Note
App Check requires reCAPTCHA v3, which Google provides for free. It runs in the background and doesn't show any CAPTCHA to users.

---

## ✅ Verification Checklist

After completing the steps above, verify:

- [ ] API key is restricted to your domains
- [ ] App Check is registered for your web app
- [ ] Your app still works normally on your allowed domains
- [ ] Firebase access is blocked from other domains (test this)

---

## 🆘 Troubleshooting

### "API key not valid" error after restricting
- Make sure you added the correct domains
- Check for typos in the domain URLs
- Make sure you included the `/*` wildcard
- Wait a few minutes for changes to propagate

### App Check not working
- Make sure you registered the correct app
- Check that reCAPTCHA is properly configured
- Verify your domain is added to the allowed list

### Can't find API key
- Make sure you're in the correct Google Cloud project
- Check that you're looking at "Browser keys" or "API keys"
- The key should match the one in your `.env.local` file

---

## 📞 Need More Help?

- **Google Cloud Console Help**: https://cloud.google.com/docs
- **Firebase App Check Docs**: https://firebase.google.com/docs/app-check
- **API Key Restrictions Guide**: https://cloud.google.com/docs/authentication/api-keys#restricting_apis

---

**Time Estimate**: 
- API Key Restriction: ~15 minutes
- App Check Setup: ~30 minutes
- **Total: ~45 minutes**

**Priority**: 
- API Key Restriction: 🔴 **CRITICAL** - Do before launch
- App Check: 🟡 **RECOMMENDED** - Can do after launch but better before

