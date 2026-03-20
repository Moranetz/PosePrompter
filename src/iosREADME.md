# PosePrompt Studio - iOS App

This is the native iOS version of PosePrompt Studio, built with Swift and SwiftUI.

## 📱 Requirements

- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## 🏗️ Architecture

```
iOS App (SwiftUI)
    ↓
    ├─→ Firebase SDK (Auth, Firestore, Storage)
    └─→ Backend API (http://localhost:3001 or production)
```

## 📂 Project Structure

```
PosePromptStudio-iOS/
├── PosePromptStudio/
│   ├── App/
│   │   └── PosePromptStudioApp.swift          # App entry point
│   ├── Core/
│   │   ├── Config/
│   │   │   ├── Config.swift                    # Environment configuration
│   │   │   └── GoogleService-Info.plist        # Firebase config
│   │   └── Extensions/
│   ├── Models/
│   │   ├── User.swift                          # User data model
│   │   ├── Pose.swift                          # Pose data model
│   │   └── Subscription.swift                  # Stripe subscription model
│   ├── Services/
│   │   ├── FirebaseService.swift               # Firebase authentication & DB
│   │   ├── APIService.swift                    # Backend API calls
│   │   ├── StripeService.swift                 # Stripe integration
│   │   └── NetworkMonitor.swift                # Connection monitoring
│   ├── ViewModels/
│   │   ├── AuthViewModel.swift                 # Authentication logic
│   │   └── MainViewModel.swift                 # Main app logic
│   ├── Views/
│   │   ├── ContentView.swift                   # Root view
│   │   ├── Auth/
│   │   │   ├── LoginView.swift
│   │   │   ├── SignUpView.swift
│   │   │   └── ForgotPasswordView.swift
│   │   ├── Main/
│   │   │   └── MainTabView.swift               # Main app interface
│   │   └── Components/
│   │       └── LoadingView.swift
│   └── Resources/
│       └── Assets.xcassets
```

## 🚀 Setup Instructions

### 1. Install Dependencies

This project uses Swift Package Manager. Dependencies will be automatically resolved when you open the project in Xcode.

**Dependencies:**
- Firebase SDK (Auth, Firestore, Storage)
- Stripe iOS SDK

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (same one used in web app)
3. Add an iOS app
4. Download `GoogleService-Info.plist`
5. Add it to `PosePromptStudio/Core/Config/`

### 3. Configure Backend URL

Edit `PosePromptStudio/Core/Config/Config.swift`:

```swift
// For local development
static let apiBaseURL = "http://localhost:3001"

// For production
static let apiBaseURL = "https://your-production-url.com"
```

### 4. Run the App

1. Open `PosePromptStudio.xcodeproj` in Xcode
2. Select a simulator or device
3. Press `Cmd + R` to build and run

## 🔧 Configuration

### Environment Variables

The iOS app uses a `Config.swift` file instead of `.env` files:

```swift
struct Config {
    static let apiBaseURL = "http://localhost:3001"
    static let stripePublishableKey = "pk_test_..."
    // Firebase config is in GoogleService-Info.plist
}
```

### Backend Integration

The iOS app communicates with your existing Node.js backend on port 3001. Make sure:

1. Backend server is running (`npm run dev:server`)
2. For iOS Simulator: Use `http://localhost:3001`
3. For physical device: Use your computer's IP (e.g., `http://192.168.1.100:3001`)

## 🎨 Features

- ✅ Native SwiftUI interface
- ✅ Firebase Authentication (Email/Password, Google, etc.)
- ✅ Real-time data sync with Firestore
- ✅ Stripe payment integration
- ✅ Smooth animations (native iOS transitions)
- ✅ Offline support
- ✅ Dark mode support
- ✅ iPad support

## 📦 Building for Release

### TestFlight (Beta Testing)

1. Archive the app: `Product > Archive`
2. Upload to App Store Connect
3. Submit for TestFlight review
4. Invite testers

### App Store Release

1. Update version and build number
2. Create App Store listing in App Store Connect
3. Archive and upload
4. Submit for review

## 🧪 Testing

The project uses Swift Testing framework:

```swift
import Testing

@Test("User login succeeds with valid credentials")
func testUserLogin() async throws {
    let authService = FirebaseService()
    let result = await authService.signIn(email: "test@example.com", password: "password")
    #expect(result != nil)
}
```

Run tests: `Cmd + U` in Xcode

## 🔐 Security

- All API keys are stored in `Config.swift` (add to `.gitignore`)
- Firebase config in `GoogleService-Info.plist`
- Never commit sensitive keys to version control
- Use environment-specific configs for dev/production

## 📚 Additional Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Firebase iOS SDK](https://firebase.google.com/docs/ios/setup)
- [Stripe iOS SDK](https://stripe.com/docs/payments/accept-a-payment?platform=ios)

## 🆘 Troubleshooting

### "Connection Failed" Error

1. Ensure backend is running (`npm run check`)
2. Check `Config.apiBaseURL` matches your backend URL
3. For physical devices, use computer's IP address

### Firebase Not Working

1. Verify `GoogleService-Info.plist` is added to project
2. Ensure bundle identifier matches Firebase console
3. Check Firebase SDK is properly initialized

### Stripe Errors

1. Verify `stripePublishableKey` in `Config.swift`
2. Ensure backend has correct `STRIPE_SECRET_KEY`
3. Check API endpoints match between iOS and backend

---

**Ready to build!** Open the Xcode project and start developing your iOS app.
