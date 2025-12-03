# How to Get Your Firebase Config Values

## Quick Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/pose-prompter/settings/general

2. **Scroll down to "Your apps" section**

3. **Click on your web app** (or click the gear icon next to it)

4. **You'll see a config object** that looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "pose-prompter.firebaseapp.com",
     projectId: "pose-prompter",
     storageBucket: "pose-prompter.appspot.com",
     messagingSenderId: "409645485574",
     appId: "1:409645485574:web:da7261ae39b5172754bd87"
   };
   ```

5. **Copy each value** into your `.env.production` file

## Your App ID (already found):
- App ID: `1:409645485574:web:da7261ae39b5172754bd87`
- Project ID: `pose-prompter`
- Messaging Sender ID: `409645485574`

You still need to get:
- API Key
- Measurement ID (optional, for Analytics)

