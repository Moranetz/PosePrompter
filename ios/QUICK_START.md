# PosePromptStudio iOS — Quick Start Guide

Welcome! You're about to set up the iOS version of PosePrompter.
This guide will get you from zero to a running app in about 5 minutes.

---

## Your App at a Glance

```
ios/
|
+-- .gitignore                    <-- Keeps secrets out of git
+-- QUICK_START.md                <-- You are here!
+-- XCODE_SETUP_CHECKLIST.md      <-- Detailed setup reference
|
+-- PosePromptStudio/
    |
    +-- App/
    |   +-- PosePromptStudioApp.swift       Entry point, Firebase init
    |
    +-- Core/Config/
    |   +-- Config.swift                    API URLs, Stripe keys
    |   +-- Config.swift.template           Template (not compiled)
    |
    +-- Models/                             Data structures
    |   +-- Categories.swift                30 prompt categories + groups
    |   +-- Prompt.swift                    Saved prompts, presets, custom options
    |   +-- User.swift                      User profile model
    |   +-- Subscription.swift              Subscription/plan model
    |
    +-- Services/                           Backend communication
    |   +-- APIService.swift                REST client (GET/POST/PUT/DELETE)
    |   +-- FirebaseService.swift           Auth + Firestore operations
    |   +-- NetworkMonitor.swift            Connectivity detection
    |
    +-- ViewModels/                         Business logic (MVVM)
    |   +-- AuthViewModel.swift             Sign in/up/out, validation
    |   +-- PromptBuilderViewModel.swift    Category selection, prompt assembly
    |
    +-- Views/                              SwiftUI screens
        +-- ContentView.swift               Root (auth routing + network banner)
        +-- Auth/
        |   +-- LoginView.swift             Login screen
        |   +-- SignUpView.swift            Registration screen
        |   +-- ForgotPasswordView.swift    Password reset
        +-- Main/
            +-- MainTabView.swift           4-tab layout (Home/Library/Create/Profile)
            +-- PromptBuilderView.swift     Build prompts from 30 categories
            +-- PromptLibraryView.swift     Browse saved/preset/package prompts
```

**18 Swift files | ~3,300 lines of code | MVVM architecture**

---

## 5-Minute Quick Start

### Step 1: Open Xcode and Create a Project (1 min)

1. Open **Xcode**
2. **File > New > Project > iOS > App**
3. Set:
   - Product Name: `PosePromptStudio`
   - Interface: **SwiftUI**
   - Language: **Swift**
4. Save it inside `~/Documents/PosePrompter/ios/`
5. **Delete** the auto-generated `ContentView.swift` and `PosePromptStudioApp.swift`

### Step 2: Add Your Files (1 min)

1. In the Project Navigator, right-click `PosePromptStudio`
2. **Add Files to "PosePromptStudio"...**
3. Select all folders: `App/`, `Core/`, `Models/`, `Services/`, `ViewModels/`, `Views/`
4. Make sure:
   - "Copy items if needed" is **unchecked**
   - "Create groups" is **selected**
   - Target `PosePromptStudio` is **checked**
5. Click **Add**

### Step 3: Add Firebase Package (1 min)

1. **File > Add Package Dependencies...**
2. Paste: `https://github.com/firebase/firebase-ios-sdk`
3. Click **Add Package** (use default version rules)
4. Select these libraries:
   - `FirebaseAuth`
   - `FirebaseFirestore`
   - `FirebaseStorage`
   - `FirebaseAnalytics`
5. Click **Add Package**

### Step 4: Add Firebase Config (1 min)

1. Go to [Firebase Console](https://console.firebase.google.com) > Your Project > Project Settings
2. Add an iOS app with bundle ID `com.poseprompt.studio`
3. Download `GoogleService-Info.plist`
4. Drag it into Xcode's project navigator (check "Copy items if needed")

### Step 5: Allow Local Networking & Build (1 min)

1. Select the project > target `PosePromptStudio` > **Info** tab
2. Add key: `App Transport Security Settings`
3. Inside it, add: `Allow Arbitrary Loads` = `YES`
4. Select **iPhone 15 Pro** simulator
5. Press **Cmd+R** to build and run!

---

## How to Verify It's Working

After the app launches in the simulator, check these:

```
Login Screen
  [x] See "PosePrompt Studio" title with figure.walk icon
  [x] Email and password fields appear
  [x] "Sign In" button is gray (disabled) until valid input
  [x] "Forgot Password?" and "Sign Up" links work

After Sign Up / Login
  [x] Main tab bar appears with 4 tabs: Home, Library, Create, Profile
  [x] Home tab shows welcome message with 3 feature cards
  [x] Create tab shows the Prompt Builder with category groups
  [x] Library tab shows Saved/Presets/Packages tabs
  [x] Profile tab shows user info and sign out button

Prompt Builder
  [x] Tapping shuffle icon randomizes all categories
  [x] Category groups expand/collapse
  [x] Prompt preview updates at top
  [x] Copy button copies prompt to clipboard

Network
  [x] Turn off Wi-Fi: red "No Internet Connection" banner appears
  [x] Turn Wi-Fi back on: banner disappears
```

---

## Common Issues & Solutions

### "No such module 'FirebaseCore'"

The Firebase package is still downloading.
**Fix**: File > Packages > Resolve Package Versions. Wait 1-2 minutes.

### App crashes on launch

Most likely `GoogleService-Info.plist` is missing or has wrong bundle ID.
**Fix**: Re-download from Firebase Console with matching bundle ID.

### "Connection refused" errors

The backend server isn't running.
**Fix**: Open Terminal and run:
```bash
cd ~/Documents/PosePrompter && npm run dev:server
```

### Categories are empty (no options to select)

Category data hasn't been imported yet — that's expected!
The Swift files define the category *structure* (30 categories, 6 groups).
The actual prompt options need to be loaded from the web app's JS data files.

### Build errors about @MainActor / concurrency

**Fix**: Build Settings > search "Strict Concurrency" > set to **Minimal**.

### Physical device can't reach the server

`localhost` only works in the simulator.
**Fix**: In `Config.swift`, change the API URL to your Mac's IP:
```swift
return "http://192.168.1.XXX:3001"
```
Find your IP: System Settings > Wi-Fi > Details > IP Address

---

## What You Have vs. What's Next

### Already Built

| Feature | Status |
|---------|--------|
| App entry point + Firebase init | Ready |
| User authentication (login/signup/reset) | Ready |
| Network connectivity monitoring | Ready |
| MVVM architecture with ViewModels | Ready |
| 30-category system with groups/colors/icons | Ready |
| Prompt builder with randomize/undo/redo | Ready |
| Prompt assembly with comprehensive overrides | Ready |
| Save/load prompt sets | Ready |
| Preset cycling (prev/next) | Ready |
| Library with search, sort, 3 tabs | Ready |
| Profile with subscription display | Ready |
| API client with retry logic | Ready |
| Clipboard copy | Ready |

### Next Steps (in recommended order)

1. **Import category data** — Convert the JS arrays from `src/data/categories/*.js`
   into Swift `[CategoryOption]` arrays and load them into the ViewModel

2. **Import presets** — Convert `src/data/presets.js` into `[Preset]` and load them

3. **Connect Firestore sync** — Save/load prompt sets to the user's Firestore document
   using the existing `FirebaseService` methods

4. **Add AI image generation** — Create a view that calls `/api/generate-image`
   with the assembled prompt

5. **Add community packages** — Implement the Packages tab with browsing/installing

6. **Polish the UI** — Dark theme, hypnotic background, animations matching the web app

7. **Prepare for App Store** — Remove ATS exceptions, add app icons, write description

---

## Architecture Overview

```
    +------------------+
    |   SwiftUI Views  |     What the user sees
    +--------+---------+
             |
    +--------v---------+
    |   ViewModels     |     Business logic, state management
    +--------+---------+
             |
    +--------v---------+
    |   Services       |     Firebase Auth, Firestore, REST API
    +--------+---------+
             |
    +--------v---------+
    |   Models         |     Category, Prompt, User, Subscription
    +------------------+
```

The app follows **MVVM** (Model-View-ViewModel):
- **Views** observe ViewModels via `@StateObject` / `@EnvironmentObject`
- **ViewModels** contain `@Published` properties that trigger UI updates
- **Services** handle external communication (Firebase, REST API)
- **Models** are plain `Codable` structs shared across all layers

---

You're all set! If you run into anything not covered here,
check `XCODE_SETUP_CHECKLIST.md` for the detailed version.

Happy building!
