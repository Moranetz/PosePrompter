# reCAPTCHA v3 Setup Guide for Firebase App Check

You're at the step where Firebase App Check needs a reCAPTCHA secret key. Here's exactly how to get it:

## Quick Steps

### 1. Create reCAPTCHA Site (5 minutes)

1. **Open Google reCAPTCHA Admin Console**
   - Go to: https://www.google.com/recaptcha/admin/create
   - Make sure you're logged in with the **same Google account** you use for Firebase

2. **Fill Out the Form**
   
   **Label**: 
   ```
   Pose Prompter
   ```
   (Or whatever name you want - this is just for your reference)
   
   **reCAPTCHA type**: 
   - Select **"reCAPTCHA v3"** (this is the invisible one that doesn't show CAPTCHAs to users)
   
   **Domains**: 
   Add your domains, one per line:
   ```
   your-project-id.web.app
   your-project-id.firebaseapp.com
   localhost
   ```
   
   **Important**: 
   - Replace `your-project-id` with your actual Firebase project ID
   - You can find your project ID in Firebase Console or in your `.env.local` file as `VITE_FIREBASE_PROJECT_ID`
   - Add `localhost` so you can test locally
   - If you have a custom domain, add that too (e.g., `yourdomain.com`)
   
   **Owners**: 
   - Your email should be pre-filled
   - You can add additional owners if needed

3. **Accept Terms**
   - Check the box to accept reCAPTCHA Terms of Service
   - Click **"Submit"**

### 2. Get Your Keys (1 minute)

After submitting, you'll see a page with two keys:

1. **Site Key** (starts with `6L...`)
   - This is PUBLIC - safe to expose in your frontend code
   - You might need this later if you want to add reCAPTCHA to your website directly
   - **For Firebase App Check, you mainly need the Secret Key**

2. **Secret Key** (starts with `6L...`)
   - This is PRIVATE - keep it secret
   - **This is what Firebase App Check needs**
   - Copy this key now

### 3. Enter Secret Key in Firebase (1 minute)

1. **Go back to Firebase App Check setup**
   - You should still have the Firebase Console open with the App Check registration form

2. **Paste the Secret Key**
   - In the "reCAPTCHA secret key" field, paste the **Secret Key** you just copied
   - Make sure there are no extra spaces before or after

3. **Set Token Time to Live**
   - Leave it at `1` day (default is fine)
   - This is how long the reCAPTCHA token is valid

4. **Click "Save" or "Register"**
   - Firebase will verify the key
   - If successful, your app will be registered for App Check

### 4. Verify Setup

After saving, you should see:
- ✅ Your web app listed in App Check
- ✅ Status showing as "Registered" or "Active"
- ✅ reCAPTCHA v3 provider listed

## Troubleshooting

### "Invalid secret key" error
- Make sure you copied the **Secret Key**, not the Site Key
- Check for extra spaces before/after the key
- Make sure you're using reCAPTCHA v3 (not v2)

### "Domain not authorized" error
- Go back to reCAPTCHA admin console
- Make sure you added all your domains:
  - `your-project-id.web.app`
  - `your-project-id.firebaseapp.com`
  - `localhost` (for testing)
  - Your custom domain (if you have one)

### Can't find my project ID
- Go to Firebase Console: https://console.firebase.google.com/
- Your project ID is shown in the project name or URL
- Or check your `.env.local` file - look for `VITE_FIREBASE_PROJECT_ID`

### reCAPTCHA site not showing up
- Make sure you're logged into the same Google account
- Check your reCAPTCHA admin console: https://www.google.com/recaptcha/admin
- You should see your site listed there

## What Happens Next?

After setting up App Check:

1. **Automatic Protection**
   - App Check will automatically protect your Firebase services
   - No code changes needed for basic protection
   - reCAPTCHA v3 runs invisibly in the background

2. **Optional: Add to Code**
   - You can optionally add App Check SDK to your code for extra features
   - This is not required for basic protection
   - See Firebase App Check documentation if you want to do this

3. **Enable Enforcement (Later)**
   - After registration, you can enable enforcement for specific services
   - This makes App Check required for those services
   - You can do this later - just having it registered is good for now

## Quick Reference

- **reCAPTCHA Admin**: https://www.google.com/recaptcha/admin
- **Firebase App Check Docs**: https://firebase.google.com/docs/app-check
- **Your Firebase Console**: https://console.firebase.google.com/

## Summary

1. ✅ Create reCAPTCHA v3 site at https://www.google.com/recaptcha/admin/create
2. ✅ Add your domains (web.app, firebaseapp.com, localhost)
3. ✅ Copy the Secret Key
4. ✅ Paste Secret Key into Firebase App Check setup
5. ✅ Save and verify

**Total time**: ~7 minutes

---

**Note**: reCAPTCHA v3 is free and invisible to users. It runs in the background to verify that requests are coming from real users, not bots.

