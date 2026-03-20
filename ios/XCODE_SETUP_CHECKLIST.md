# PosePromptStudio iOS — Xcode Setup Checklist

## Prerequisites

- macOS 14.0+ (Sonoma or later)
- Xcode 15.0+ (download from Mac App Store)
- Apple Developer account (free for simulator testing, paid for device deployment)
- Your PosePrompter backend server running (for API calls)
- Firebase project already configured (from your web app)

---

## Step 1: Create the Xcode Project

1. Open Xcode
2. **File > New > Project**
3. Select **iOS > App**
4. Configure:
   - **Product Name**: `PosePromptStudio`
   - **Team**: Select your Apple Developer team
   - **Organization Identifier**: `com.poseprompt` (or your own)
   - **Interface**: SwiftUI
   - **Language**: Swift
   - **Storage**: None
   - Uncheck "Include Tests" for now (add later)
5. Save inside: `~/Documents/PosePrompter/ios/`
   - Xcode will create `PosePromptStudio.xcodeproj`

---

## Step 2: Add Swift Source Files

### Delete Xcode's auto-generated files

Xcode creates default `ContentView.swift` and `PosePromptStudioApp.swift` in the project. Delete them from the Xcode navigator (Move to Trash).

### Add the project files

1. In Xcode's Project Navigator, right-click the `PosePromptStudio` group
2. Select **Add Files to "PosePromptStudio"...**
3. Navigate to `ios/PosePromptStudio/` and select ALL folders:
   - `App/`
   - `Core/`
   - `Models/`
   - `Services/`
   - `ViewModels/`
   - `Views/`
4. Ensure these options are checked:
   - **Copy items if needed**: Unchecked (files are already in place)
   - **Create groups**: Selected (not "Create folder references")
   - **Add to targets**: `PosePromptStudio` checked
5. Click **Add**

### Verify file structure in Xcode

Your navigator should show:

```
PosePromptStudio/
├── App/
│   └── PosePromptStudioApp.swift
├── Core/
│   └── Config/
│       ├── Config.swift
│       └── Config.swift.template (exclude from target)
├── Models/
│   ├── Categories.swift
│   ├── Prompt.swift
│   ├── Subscription.swift
│   └── User.swift
├── Services/
│   ├── APIService.swift
│   ├── FirebaseService.swift
│   └── NetworkMonitor.swift
├── ViewModels/
│   ├── AuthViewModel.swift
│   └── PromptBuilderViewModel.swift
└── Views/
    ├── ContentView.swift
    ├── Auth/
    │   ├── ForgotPasswordView.swift
    │   ├── LoginView.swift
    │   └── SignUpView.swift
    └── Main/
        ├── MainTabView.swift
        ├── PromptBuilderView.swift
        └── PromptLibraryView.swift
```

**Important**: Select `Config.swift.template` in the navigator, then in the File Inspector (right panel), uncheck "Target Membership" so it's not compiled.

---

## Step 3: Add Swift Package Dependencies

1. In Xcode: **File > Add Package Dependencies...**
2. Add each package by URL:

### Firebase iOS SDK
- URL: `https://github.com/firebase/firebase-ios-sdk`
- Version: **Up to Next Major** from `11.0.0`
- Add these libraries to your target:
  - `FirebaseAuth`
  - `FirebaseFirestore`
  - `FirebaseStorage`
  - `FirebaseAnalytics`

### Stripe iOS SDK (optional — for future payment integration)
- URL: `https://github.com/stripe/stripe-ios`
- Version: **Up to Next Major** from `23.0.0`
- Add: `StripePaymentSheet`

3. Wait for packages to resolve (may take a few minutes)

---

## Step 4: Configure Firebase

### Get GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your PosePrompter project
3. Click the gear icon > **Project settings**
4. Under "Your apps", click **Add app > iOS**
5. Enter your Bundle ID: `com.poseprompt.studio` (must match Xcode)
6. Download `GoogleService-Info.plist`
7. Drag it into the Xcode project root (alongside your Swift files)
   - Check "Copy items if needed"
   - Check "Add to targets: PosePromptStudio"

### Verify Firebase initializes

`PosePromptStudioApp.swift` already calls `FirebaseApp.configure()` in its `init()`. This reads from `GoogleService-Info.plist` automatically.

---

## Step 5: Update Config.swift

Open `Core/Config/Config.swift` and update:

### API Base URL

```swift
// For iOS Simulator — use localhost
return "http://localhost:3001"

// For physical device — use your Mac's local IP:
// return "http://192.168.x.x:3001"
```

Find your Mac's IP: **System Settings > Wi-Fi > Details > IP Address**

### Stripe Keys (when ready)

Replace `pk_test_YOUR_TEST_KEY_HERE` with your actual Stripe test publishable key from https://dashboard.stripe.com/apikeys

---

## Step 6: Configure Info.plist for Local Networking

To allow HTTP connections to localhost during development:

1. Select your project in the navigator
2. Select the **PosePromptStudio** target
3. Go to the **Info** tab
4. Add a new key: `App Transport Security Settings` (NSAppTransportSecurity)
5. Inside it, add: `Allow Arbitrary Loads` = `YES`

**Or** for more restrictive (recommended):

Add an exception domain for localhost:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

> **Important**: Remove `Allow Arbitrary Loads` before submitting to the App Store. Use only specific exception domains or HTTPS in production.

---

## Step 7: Build and Run

### Simulator

1. Select an iPhone simulator (e.g., iPhone 15 Pro) from the device dropdown
2. Press **Cmd+R** or click the Play button
3. The app should build and launch in the simulator

### Physical Device

1. Connect your iPhone via USB or select it from the device dropdown
2. You may need to trust the developer certificate on the device:
   **Settings > General > VPN & Device Management**
3. Update `Config.swift` to use your Mac's IP instead of localhost
4. Press **Cmd+R**

### Start the backend

In a terminal, start the PosePrompter backend:

```bash
cd ~/Documents/PosePrompter
npm run dev:server
```

The iOS app connects to this server for API calls.

---

## Step 8: Verify Everything Works

### Authentication
- [ ] App launches to login screen
- [ ] Can create a new account
- [ ] Can sign in with email/password
- [ ] Can sign out
- [ ] Forgot password sends reset email
- [ ] Network offline banner appears when disconnected

### Prompt Builder
- [ ] Category groups expand/collapse
- [ ] Randomize single category works
- [ ] Randomize all works
- [ ] Prompt preview updates in real-time
- [ ] Copy to clipboard works
- [ ] Undo/redo works
- [ ] Save prompt set works
- [ ] View full prompt detail works

### Library
- [ ] Saved tab shows saved prompt sets
- [ ] Search filters results
- [ ] Sort options work (newest/oldest/A-Z)
- [ ] Delete prompt set works
- [ ] Presets tab displays presets
- [ ] Packages tab shows placeholder

### Profile
- [ ] Shows user info
- [ ] Shows subscription status
- [ ] Sign out works

---

## Troubleshooting

### "No such module 'FirebaseCore'"
Packages haven't resolved yet. **File > Packages > Resolve Package Versions**, then wait.

### "Connection refused" on API calls
Make sure the backend is running (`npm run dev:server`) and `Config.swift` has the right URL. For physical devices, use your Mac's IP, not `localhost`.

### Firebase crash on launch
Missing or misconfigured `GoogleService-Info.plist`. Verify the Bundle ID in Firebase Console matches your Xcode project.

### Build errors about concurrency
Set **Build Settings > Strict Concurrency Checking** to `Minimal` to suppress warnings during development.

---

## Next Steps

After the app is running:

1. **Load category data** — Import the 30 category arrays from the web app's JS files into the iOS `categoryOptions` dictionary
2. **Load presets** — Convert `presets.js` data into `[Preset]` array
3. **Sync with Firestore** — Connect saved prompt sets to the user's Firestore document
4. **Add AI image generation** — Connect the Generate Image API endpoint
5. **Add packages/marketplace** — Implement community package browsing and installation
6. **Polish UI** — Add the hypnotic background, animations, and dark theme matching the web app
