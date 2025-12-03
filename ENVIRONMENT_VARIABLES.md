# Environment Variables Guide

This document explains all environment variables required for PosePrompt Studio.

## Required Variables

All environment variables must be prefixed with `VITE_` for Vite to expose them to the client-side code.

### Firebase Configuration

These variables are required for Firebase to work. Get them from your Firebase project settings.

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | `your-project-id.firebaseapp.com` | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | `your-project-id.appspot.com` | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789012` | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123456789012:web:abcdef1234567890` | Yes |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID | `G-XXXXXXXXXX` | No (optional) |

## Environment Files

### Development (`.env.local`)

Create a `.env.local` file in the project root for local development:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Important:**
- `.env.local` is already in `.gitignore` and should never be committed
- This file is for local development only
- Restart the dev server after changing this file

### Production (`.env.production`)

For production builds, create a `.env.production` file:

```env
VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Note:** For production, you can use the same Firebase project or a separate production project. Using the same project is simpler for most cases.

## How to Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **"Project settings"**
5. Scroll down to **"Your apps"** section
6. Click on your web app (or add one if you haven't)
7. You'll see the configuration object with all values

Alternatively, when you first register your web app, Firebase shows the configuration object immediately.

## Security Notes

### Public vs Private Keys

**Safe to expose (these are public):**
- All Firebase configuration values (API key, project ID, etc.)
- These are meant to be public and are safe in client-side code
- Firebase Security Rules protect your data, not these keys

**Never expose:**
- Firebase Admin SDK private keys
- Service account keys
- Any server-side secrets

### Best Practices

1. **Use different Firebase projects for development and production** (optional but recommended)
   - Development project: For testing and development
   - Production project: For live users

2. **Restrict Firebase API keys** (optional but recommended)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** → **Credentials**
   - Find your Firebase API key
   - Click **"Restrict key"**
   - Add HTTP referrer restrictions for your domains

3. **Never commit `.env` files**
   - `.env.local` and `.env.production` should be in `.gitignore`
   - Use `.env.example` as a template (without real values)

4. **Use environment-specific values**
   - Development: Use test Firebase project
   - Production: Use production Firebase project

## Vite Environment Variable Behavior

Vite exposes environment variables differently than Create React App:

- **Prefix required**: Must use `VITE_` prefix
- **Build-time**: Variables are embedded at build time
- **Access**: Use `import.meta.env.VITE_FIREBASE_API_KEY` in code
- **Type**: All values are strings (convert if needed)

### Example Usage in Code

```javascript
// In firebase-config.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... etc
};
```

## Troubleshooting

### Variables not loading

1. **Check prefix**: Must use `VITE_` prefix
2. **Restart dev server**: Changes to `.env.local` require restart
3. **Check file location**: `.env.local` must be in project root
4. **Check syntax**: No spaces around `=` sign

### Wrong values in production

1. **Check `.env.production`**: Ensure it exists and has correct values
2. **Rebuild**: Run `npm run build` again after changing `.env.production`
3. **Verify build**: Check `dist` folder to see embedded values (they're public anyway)

### Missing variables error

If you see errors about missing environment variables:

1. Check that `.env.local` exists
2. Verify all required variables are present
3. Check for typos in variable names
4. Ensure no extra spaces or quotes around values

## Example `.env.local` Template

Create a `.env.local` file with this template (replace with your actual values):

```env
# Firebase Configuration
# Get these from Firebase Console → Project Settings → Your apps

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Configuration](https://firebase.google.com/docs/web/setup)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

