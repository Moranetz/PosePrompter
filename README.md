# PosePrompt Studio

A creative tool for generating detailed photo prompts with an interactive articulated figure preview. Build, customize, and share prompt collections with a beautiful, intuitive interface.

## Features

### Core Functionality
- **Interactive Prompt Builder**: Select from 30+ categories including Aesthetic, Body Pose, Outfit, Lighting, Camera Angle, and more
- **Articulated Figure Preview**: Visual representation that updates in real-time as you make selections
- **Custom Options**: Add your own custom prompts to any category
- **Prompt Set Management**: Save, load, and manage multiple prompt configurations
- **Package Marketplace**: Create, publish, and share prompt collections as packages
- **Package Installation**: Install packages from other users to expand your prompt library
- **User Profiles**: Customize your profile with avatar, display name, and bio
- **Real-time Generation**: Instantly generate formatted prompts from your selections

### User Experience
- **Modern UI**: Dark theme with smooth animations and micro-interactions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Category Management**: Hide, show, and organize categories to your preference
- **Lock Categories**: Lock specific selections while randomizing others
- **Copy to Clipboard**: One-click copy of generated prompts
- **Toast Notifications**: User-friendly feedback for all actions

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Styling**: CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Prerequisites

- Node.js 16+ and npm
- Firebase account
- Git (optional, for version control)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "PosePrompt Studio"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

#### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter a project name
   - (Optional) Enable Google Analytics
   - Click **"Create project"**

#### Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "PosePrompt Studio")
3. (Optional) Check "Also set up Firebase Hosting"
4. Click **"Register app"**

#### Step 3: Enable Required Firebase Services

**Enable Authentication:**
1. Go to **Build** → **Authentication**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable **Email/Password** authentication (and any other providers you want)

**Enable Firestore Database:**
1. Go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll deploy security rules)
4. Select a location for your database (choose the closest to your users)
5. Click **"Enable"**

**Enable Storage:**
1. Go to **Build** → **Storage**
2. Click **"Get started"**
3. Start in production mode (we'll deploy security rules)
4. Choose a location (same as Firestore is recommended)
5. Click **"Done"**

#### Step 4: Get Your Firebase Configuration

After registering your app, you'll see a configuration object. Copy these values for the next step.

### 4. Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Important Notes:**
- Replace all placeholder values with actual values from your Firebase config
- The `.env.local` file is already in `.gitignore` and should never be committed
- For Vite, use `VITE_` prefix (not `REACT_APP_`)

### 5. Deploy Firebase Security Rules

Before running the app, deploy the security rules:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

See [FIREBASE_SETUP_INSTRUCTIONS.md](./FIREBASE_SETUP_INSTRUCTIONS.md) for detailed Firebase setup steps.

## Running Locally

### Development Mode

```bash
npm run dev
```

The app will start at `http://localhost:5173` (or the next available port).

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Deployment

### Firebase Hosting

#### Initial Setup

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: **Yes**
   - Don't overwrite `index.html`: **No**

#### Deploy

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

3. Your app will be available at: `https://your-project-id.web.app`

#### Deploy Everything (Rules + Hosting)

```bash
firebase deploy
```

This deploys Firestore rules, Storage rules, indexes, and hosting in one command.

### Custom Domain (Optional)

1. Go to Firebase Console → **Hosting**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions
4. Wait for SSL certificate provisioning (usually 24-48 hours)
5. Your app will be available at your custom domain

### Environment Variables for Production

For production deployment, you have two options:

**Option 1: Build-time Environment Variables**
- Create `.env.production` with production Firebase config
- Vite will use these during build
- Values are embedded in the build (safe for Firebase public config)

**Option 2: Runtime Configuration**
- Use Firebase Hosting environment variables (requires Cloud Functions)
- More complex but allows runtime configuration changes

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for a complete deployment checklist.

## Firebase Security Rules Setup

### Firestore Rules

The Firestore security rules are defined in `firestore.rules`. Key features:

- **Users**: Can only read/write their own user document
- **Packages**: Users can read all published packages, but only write packages they own
- **Reviews**: Can be read by anyone, written by logged-in users
- **Data Validation**: Validates data structure on all writes
- **Rate Limiting**: Basic rate limiting (consider Cloud Functions for advanced rate limiting)

To deploy:
```bash
firebase deploy --only firestore:rules
```

### Storage Rules

The Storage security rules are defined in `storage.rules`. Key features:

- **User Folders**: Users can only upload to their own folders (`avatars/{userId}/` and `package-covers/{userId}/`)
- **File Size Limit**: Maximum 5MB per file
- **File Type Restriction**: Only image files allowed
- **Public Read**: Images can be read by anyone (for displaying avatars and covers)

To deploy:
```bash
firebase deploy --only storage:rules
```

### Setting Up Rules in Firebase Console

If you prefer to set up rules manually in the Firebase Console:

1. **Firestore Rules:**
   - Go to **Firestore Database** → **Rules** tab
   - Copy contents from `firestore.rules`
   - Paste into the rules editor
   - Click **"Publish"**

2. **Storage Rules:**
   - Go to **Storage** → **Rules** tab
   - Copy contents from `storage.rules`
   - Paste into the rules editor
   - Click **"Publish"**

## Project Structure

```
PosePrompt Studio/
├── src/
│   ├── components/          # React components
│   │   ├── ArticulatedFigure/
│   │   ├── CategorySidebar/
│   │   ├── PreviewArea/
│   │   ├── WordButtons/
│   │   └── ...
│   ├── contexts/             # React contexts (UserContext)
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main app component
│   ├── PhotoElementRandomizer.jsx  # Main feature component
│   ├── firebase-config.js   # Firebase initialization
│   ├── firestoreService.js  # Firestore operations
│   ├── packageService.js    # Package marketplace operations
│   └── main.jsx             # Entry point
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── firestore.indexes.json   # Firestore indexes
├── firebase.json            # Firebase configuration
├── package.json             # Dependencies
└── vite.config.js           # Vite configuration
```

## Firebase Quota Limits

Be aware of Firebase free tier limits:

### Firestore
- 50,000 document reads/day
- 20,000 document writes/day
- 20,000 document deletes/day
- 1 GB storage

### Storage
- 5 GB storage
- 1 GB/day downloads
- 1 GB/day uploads

### Hosting
- 10 GB storage
- 360 MB/day data transfer

**Upgrade to Blaze plan** (pay-as-you-go) if you need higher limits or want to use Cloud Functions.

## Troubleshooting

### Common Issues

**"Firebase: Error (auth/configuration-not-found)"**
- Check that `.env.local` exists and has all required variables
- Verify variable names use `VITE_` prefix
- Restart the dev server after changing `.env.local`

**"Permission denied" errors**
- Ensure Firestore and Storage security rules are deployed
- Check that user is authenticated
- Verify rules match your data structure

**Build fails**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 16+)
- Clear Vite cache: `rm -rf node_modules/.vite`

**Firebase Hosting deployment fails**
- Ensure you're logged in: `firebase login`
- Verify project is initialized: `firebase projects:list`
- Check `firebase.json` configuration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

[Add your license here]

## Support

For issues and questions:
- Open an issue on GitHub
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment help
- Review [FIREBASE_SETUP_INSTRUCTIONS.md](./FIREBASE_SETUP_INSTRUCTIONS.md) for Firebase setup

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Framer Motion Documentation](https://www.framer.com/motion/)

