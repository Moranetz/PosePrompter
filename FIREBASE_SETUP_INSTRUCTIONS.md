# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter a project name
   - (Optional) Enable Google Analytics
   - Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Pose Prompter")
3. (Optional) Check "Also set up Firebase Hosting"
4. Click **"Register app"**

## Step 3: Get Your Firebase Configuration

After registering, you'll see a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 4: Enable Required Firebase Services

### Enable Authentication:
1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable the authentication providers you want (e.g., Email/Password, Google)

### Enable Firestore Database:
1. Go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development) or **"Start in production mode"**
4. Select a location for your database
5. Click **"Enable"**

### Enable Storage:
1. Go to **Build** → **Storage**
2. Click **"Get started"**
3. Start in test mode (for development) or set up security rules
4. Choose a location (same as Firestore is recommended)
5. Click **"Done"**

## Step 5: Add Configuration to .env.local

Create a `.env.local` file in your project root (if it doesn't exist) and add your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your-api-key-from-firebase-config
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id-from-firebase-config
VITE_FIREBASE_APP_ID=your-app-id-from-firebase-config
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id-from-firebase-config
```

**Important:** 
- Replace all placeholder values with the actual values from your Firebase config object.
- Note: This project uses Vite, which requires the `VITE_` prefix for environment variables (not `REACT_APP_`).

## Step 6: Install Dependencies

Run the following command to install Firebase:

```bash
npm install
```

## Step 7: Verify Setup

After completing the above steps, you can import and use Firebase in your React components:

```javascript
import { auth, db, storage } from './firebase-config';
```

## Security Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- For production, set up proper Firestore Security Rules and Storage Rules
- Consider using Firebase App Check for additional security

