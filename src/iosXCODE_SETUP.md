# Xcode Project Setup Instructions

## Creating Your Xcode Project

### 1. Open Xcode

Launch Xcode 15.0 or later

### 2. Create New Project

**File → New → Project** or press `Cmd + Shift + N`

### 3. Choose Template

- Select **iOS** platform
- Choose **App** template
- Click **Next**

### 4. Configure Project

Fill in these details:

| Field | Value |
|-------|-------|
| **Product Name** | `PosePromptStudio` |
| **Team** | Select your Apple Developer team |
| **Organization Identifier** | `com.yourcompany` (reverse domain) |
| **Bundle Identifier** | `com.yourcompany.PosePromptStudio` |
| **Interface** | **SwiftUI** ⚠️ Important! |
| **Language** | **Swift** ⚠️ Important! |
| **Storage** | None |
| **Include Tests** | ✅ Checked |

⚠️ **Important:** Make sure you select **SwiftUI** and **Swift**!

### 5. Save Location

- Navigate to your project's `ios/` directory
- Click **Create**

---

## Adding Dependencies (Swift Package Manager)

### 1. Open Package Dependencies

**File → Add Package Dependencies...** or press `Cmd + Shift + 0`

### 2. Add Firebase SDK

#### Step 1: Enter Firebase URL
```
https://github.com/firebase/firebase-ios-sdk
```

#### Step 2: Choose Version
- **Dependency Rule:** Up to Next Major Version
- **Version:** 10.13.0 (or latest)

#### Step 3: Select Products
✅ **FirebaseAuth** - For authentication
✅ **FirebaseFirestore** - For database
✅ **FirebaseStorage** - For file storage
☐ FirebaseAnalytics - Optional
☐ FirebaseCrashlytics - Optional (add later)

Click **Add Package**

### 3. Add Stripe iOS SDK

#### Step 1: Enter Stripe URL
```
https://github.com/stripe/stripe-ios
```

#### Step 2: Choose Version
- **Dependency Rule:** Up to Next Major Version
- **Version:** Latest

#### Step 3: Select Products
✅ **StripePaymentSheet** - For payment UI

Click **Add Package**

---

## Organizing Files in Xcode

### 1. Delete Default Files

Xcode creates some default files. You can delete these:
- ❌ `ContentView.swift` (we have our own)
- ❌ `PosePromptStudioApp.swift` (we have our own)

**Right-click → Delete → Move to Trash**

### 2. Create Folder Structure

Create these groups (folders) in Xcode:

```
PosePromptStudio/
├── App/
├── Core/
│   └── Config/
├── Models/
├── Services/
├── ViewModels/
└── Views/
    ├── Auth/
    ├── Main/
    └── Components/
```

**To create a group:**
1. Right-click on `PosePromptStudio`
2. Select **New Group**
3. Name it

### 3. Add Files to Xcode

**Method 1: Drag and Drop**
1. Open Finder to `/ios/PosePromptStudio/`
2. Drag each `.swift` file into its corresponding folder in Xcode
3. ✅ Check **"Copy items if needed"**
4. ✅ Check **"Add to targets: PosePromptStudio"**
5. Click **Finish**

**Method 2: Add Files**
1. Right-click on folder in Xcode
2. Select **Add Files to "PosePromptStudio"...**
3. Navigate to file
4. ✅ Check **"Copy items if needed"**
5. Click **Add**

### File Organization Checklist

- [ ] **App/**
  - [ ] `PosePromptStudioApp.swift`

- [ ] **Core/Config/**
  - [ ] `Config.swift` (from template)

- [ ] **Models/**
  - [ ] `User.swift`
  - [ ] `Subscription.swift`

- [ ] **Services/**
  - [ ] `FirebaseService.swift`
  - [ ] `APIService.swift`
  - [ ] `NetworkMonitor.swift`

- [ ] **ViewModels/**
  - [ ] `AuthViewModel.swift`

- [ ] **Views/**
  - [ ] `ContentView.swift`

- [ ] **Views/Auth/**
  - [ ] `LoginView.swift`
  - [ ] `SignUpView.swift`
  - [ ] `ForgotPasswordView.swift`

- [ ] **Views/Main/**
  - [ ] `MainTabView.swift`

---

## Adding Firebase Configuration

### 1. Get GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ **Project Settings**
4. Scroll to **Your apps**
5. If no iOS app exists:
   - Click **Add app** → **iOS**
   - Enter bundle ID: `com.yourcompany.PosePromptStudio`
   - Click **Register app**
6. Download `GoogleService-Info.plist`

### 2. Add to Xcode

1. Drag `GoogleService-Info.plist` to Xcode project navigator
2. Drop it at the **root level** (next to `PosePromptStudioApp.swift`)
3. ✅ Check **"Copy items if needed"**
4. ✅ Check **"Add to targets: PosePromptStudio"**
5. Click **Finish**

⚠️ **Verify:** File should be in the root of your project, not in a subfolder

---

## Configuring Info.plist

### 1. Open Info.plist

- In Project Navigator, find `Info.plist`
- Click to open

### 2. Add Required Entries

#### Allow Local Networking (for backend connection)

**Right-click in Info.plist → Add Row**

```xml
Key: App Transport Security Settings
Type: Dictionary

  Key: NSAllowsLocalNetworking
  Type: Boolean
  Value: YES

  Key: NSExceptionDomains
  Type: Dictionary

    Key: localhost
    Type: Dictionary

      Key: NSExceptionAllowsInsecureHTTPLoads
      Type: Boolean
      Value: YES
```

#### Camera Access (if you'll use camera)

**Add these if needed:**

| Key | Type | Value |
|-----|------|-------|
| Privacy - Camera Usage Description | String | "We need access to your camera to capture pose references" |
| Privacy - Photo Library Usage Description | String | "We need access to your photos to save and manage your pose library" |

### 3. Info.plist Visual Mode

In Xcode, Info.plist might show as source code or visual editor.

**To switch to source code:**
- Right-click `Info.plist` → **Open As** → **Source Code**

**Example complete Info.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Existing entries... -->
    
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsLocalNetworking</key>
        <true/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>localhost</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <true/>
            </dict>
        </dict>
    </dict>
    
    <key>NSCameraUsageDescription</key>
    <string>We need access to your camera to capture pose references</string>
    
    <key>NSPhotoLibraryUsageDescription</key>
    <string>We need access to your photos to save and manage poses</string>
</dict>
</plist>
```

---

## Project Settings

### 1. Select Project

Click on the project (blue icon) in the navigator

### 2. General Tab

Verify these settings:

| Setting | Value |
|---------|-------|
| **Display Name** | PosePrompt Studio |
| **Bundle Identifier** | com.yourcompany.PosePromptStudio |
| **Version** | 1.0.0 |
| **Build** | 1 |
| **Deployment Target** | iOS 17.0 |
| **Devices** | iPhone |
| **Supports multiple windows** | Unchecked |

### 3. Signing & Capabilities

#### Automatic Signing (Recommended for development)

- ✅ **Automatically manage signing**
- **Team:** Select your Apple Developer team
- **Bundle Identifier:** com.yourcompany.PosePromptStudio

#### Manual Signing (For production)

If you have provisioning profiles:
- ☐ Automatically manage signing
- **Provisioning Profile:** Select your profile
- **Signing Certificate:** Select your certificate

---

## Build Settings (Advanced)

Usually defaults are fine, but verify:

### 1. Build Settings Tab

**Filter:** "swift language version"

- **Swift Language Version:** Swift 5

**Filter:** "ios deployment target"

- **iOS Deployment Target:** iOS 17.0

---

## Verify Setup

### 1. Clean Build

**Product → Clean Build Folder** (`Cmd + Shift + K`)

### 2. Build

**Product → Build** (`Cmd + B`)

**Expected:** Build succeeds with 0 errors

### 3. Fix Common Errors

#### "Cannot find 'FirebaseApp' in scope"

**Solution:** Make sure Firebase packages are added:
1. File → Package Dependencies
2. Verify firebase-ios-sdk is listed
3. If not, re-add it

#### "No such module 'Firebase'"

**Solution:**
1. Select your project
2. Target → General → Frameworks, Libraries, and Embedded Content
3. Verify FirebaseAuth, FirebaseFirestore are listed
4. If not, re-add packages

#### "GoogleService-Info.plist not found"

**Solution:**
1. Verify file is in project root
2. Check target membership (select file → File Inspector → Target Membership)
3. Ensure "PosePromptStudio" is checked

---

## Running the App

### 1. Select Simulator

Top toolbar: Select a simulator

**Recommended:**
- iPhone 15 Pro
- iPhone 15 Pro Max
- iPad Pro 12.9"

### 2. Run

**Product → Run** (`Cmd + R`)

**Expected:**
- Simulator launches
- App installs
- App opens to login screen

### 3. First Run Checklist

- [ ] App launches without crash
- [ ] Login screen displays
- [ ] No compiler warnings
- [ ] Firebase initializes (check console)
- [ ] Network monitor shows connection status

---

## Troubleshooting

### App Crashes on Launch

**Check:**
1. Console output in Xcode
2. Firebase initialization errors
3. Missing GoogleService-Info.plist

### White/Blank Screen

**Check:**
1. ContentView is set as root in App file
2. Environment objects are properly injected

### Build Errors

**Try:**
1. Clean build folder: `Cmd + Shift + K`
2. Delete derived data: **Xcode → Preferences → Locations → Derived Data** (click arrow, move to trash)
3. Restart Xcode
4. Delete app from simulator, rebuild

---

## Next Steps

✅ **Project is set up!**

Now:
1. Update `Config.swift` with your backend URL
2. Add Stripe keys
3. Start backend server: `npm start`
4. Run app: `Cmd + R`
5. Test login flow

Proceed to **QUICK_REFERENCE.md** for development patterns!

---

## Quick Reference Commands

```
Clean Build:     Cmd + Shift + K
Build:           Cmd + B
Run:             Cmd + R
Stop:            Cmd + .
Preview:         Cmd + Option + Enter
Find:            Cmd + F
Find in Project: Cmd + Shift + F
```

---

**Your Xcode project is ready! Happy coding! 🚀**
