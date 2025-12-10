# Quick Check - Get the Exact Error

## Do This Right Now (30 seconds)

1. **Open your app** in the browser
2. **Press F12** (opens DevTools)
3. **Click "Console" tab**
4. **Try to sign in** (any method)
5. **Look for RED error messages**
6. **Copy the EXACT error code** - it will look like:
   - `auth/unauthorized-domain`
   - `auth/operation-not-allowed`
   - `auth/api-key-not-valid`
   - `auth/invalid-api-key`
   - Or something else

**Paste the error code here and I'll give you the exact fix!**

---

## Common Error Codes & Quick Fixes

### `auth/unauthorized-domain`
**Fix**: Add your domain to Firebase Console → Project Settings → Authorized domains

### `auth/operation-not-allowed`
**Fix**: Enable the sign-in method in Firebase Console → Authentication → Sign-in method

### `auth/api-key-not-valid` or `auth/invalid-api-key`
**Fix**: 
1. Check your `.env.local` file has the correct API key
2. Check API key restrictions in Google Cloud Console include `localhost` patterns

### `auth/configuration-not-found`
**Fix**: Check your `.env.local` file exists and has all required variables

---

## If You Don't See Any Errors

1. **Check the Network tab** (in DevTools)
2. **Look for failed requests** (red)
3. **Click on them** and check the Response tab

---

## Still Nothing?

Try this in the browser console (F12 → Console tab):

```javascript
// Check Firebase config
console.log('API Key exists:', !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
```

**What do these show?** (Are they undefined or do they have values?)

---

**The error code will tell us exactly what's wrong!**

