# iOS Setup Guide

## 🎯 Complete Setup Instructions

Follow these steps to get your iOS app running.

### Step 1: Create Xcode Project

1. **Open Xcode** (version 15.0 or later)
2. **File → New → Project**
3. Select **iOS → App**
4. Configure:
   - Product Name: `PosePromptStudio`
   - Team: Select your Apple Developer team
   - Organization Identifier: `com.yourcompany` (or your domain reversed)
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: None (we'll use Firebase)
5. Save in `/ios/` directory

### Step 2: Add Swift Package Dependencies

1. In Xcode, go to **File → Add Package Dependencies**
2. Add these packages:

#### Firebase SDK
```
https://github.com/firebase/firebase-ios-sdk
```
Select these products:
- FirebaseAuth
- FirebaseFirestore
- FirebaseStorage
- FirebaseAnalytics (optional)

Version: 10.13.0 or later

#### Stripe iOS SDK
```
https://github.com/stripe/stripe-ios
```
Select:
- StripePaymentSheet

Version: Latest

### Step 3: Copy Source Files

Copy all the Swift files I created into your Xcode project:

```
PosePromptStudio/
├── App/
│   └── PosePromptStudioApp.swift
├── Core/
│   └── Config/
│       └── Config.swift
├── Models/
│   ├── User.swift
│   └── Subscription.swift
├── Services/
│   ├── FirebaseService.swift
│   ├── APIService.swift
│   └── NetworkMonitor.swift
├── ViewModels/
│   └── AuthViewModel.swift
└── Views/
    ├── ContentView.swift
    ├── Auth/
    │   ├── LoginView.swift
    │   ├── SignUpView.swift
    │   └── ForgotPasswordView.swift
    └── Main/
        └── MainTabView.swift
```

### Step 4: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your existing project (the one used for web)
3. Click **Add app → iOS**
4. Register app with bundle identifier: `com.yourcompany.PosePromptStudio`
5. Download `GoogleService-Info.plist`
6. Drag `GoogleService-Info.plist` into Xcode project root
7. Make sure "Copy items if needed" is checked

### Step 5: Update Configuration

Edit `Config.swift` and update these values:

```swift
// For local testing with backend
static var apiBaseURL: String {
    #if DEBUG
    return "http://localhost:3001"  // For simulator
    // return "http://YOUR_IP:3001" // For physical device
    #else
    return "https://your-production-url.com"
    #endif
}

// Add your Stripe keys
static var stripePublishableKey: String {
    #if DEBUG
    return "pk_test_YOUR_TEST_KEY"
    #else
    return "pk_live_YOUR_LIVE_KEY"
    #endif
}
```

### Step 6: Configure Info.plist

Add these entries to `Info.plist`:

```xml
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
```

This allows connecting to your local backend server.

### Step 7: Run the Backend

Make sure your Node.js backend is running:

```bash
# In your project root
npm start

# Or manually
npm run dev:all
```

Verify it's running at: http://localhost:3001/api/health

### Step 8: Run the iOS App

1. In Xcode, select a simulator (iPhone 15 Pro recommended)
2. Press **Cmd + R** or click the Play button
3. The app should build and launch!

## 📱 Testing on Physical Device

### For Local Backend Connection:

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update `Config.swift`:
   ```swift
   return "http://YOUR_IP_ADDRESS:3001"
   // Example: return "http://192.168.1.100:3001"
   ```

3. Make sure iPhone and computer are on the same WiFi network

4. Build and run on your device

## 🔧 Troubleshooting

### "Could not connect to backend"

**Check:**
1. Backend is running: `npm run check`
2. Correct URL in `Config.swift`
3. For physical device: Using computer's IP, not localhost
4. Info.plist allows local networking

### Firebase Errors

**Check:**
1. `GoogleService-Info.plist` is added to project
2. Bundle identifier matches Firebase console
3. Firebase packages are properly installed

### Build Errors

**Try:**
1. Clean build folder: **Product → Clean Build Folder** (Cmd + Shift + K)
2. Reset package cache: **File → Packages → Reset Package Caches**
3. Restart Xcode

## 🎨 Customization

### Change App Icon

1. Add icons to `Assets.xcassets/AppIcon`
2. Drag PNG files for different sizes

### Change App Name

1. Select project in navigator
2. Under **General → Display Name**
3. Enter your desired name

### Change Colors/Theme

Edit views to use your brand colors:
```swift
.foregroundStyle(.blue.gradient)  // Change to your color
```

## 🚀 Next Steps

### Recommended Additions:

1. **Add actual pose models** - Create `Pose.swift` model based on your data structure
2. **Implement pose API calls** - Add endpoints in `APIService.swift`
3. **Add image handling** - Use PhotosPicker for uploads
4. **Implement search** - Add search functionality to library
5. **Add animations** - Use SwiftUI animations for smooth transitions
6. **Offline support** - Cache data locally
7. **Push notifications** - Integrate Firebase Cloud Messaging

### Production Checklist:

- [ ] Update API URLs to production
- [ ] Add proper error handling
- [ ] Implement analytics
- [ ] Add crash reporting
- [ ] Create App Store screenshots
- [ ] Write App Store description
- [ ] Submit for review

## 📚 Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Firebase iOS Guide](https://firebase.google.com/docs/ios/setup)
- [Stripe iOS SDK](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**Need help?** Check the main README or reach out for support!
