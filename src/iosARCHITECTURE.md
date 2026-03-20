# 📐 iOS App Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       iOS App (SwiftUI)                     │
│                    PosePrompt Studio                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐  ┌──────────────────┐
        │  Firebase iOS SDK │  │  Your Backend    │
        │                   │  │  (Node.js)       │
        │  • Auth           │  │  Port 3001       │
        │  • Firestore      │  │                  │
        │  • Storage        │  │  • REST API      │
        └───────────────────┘  │  • Stripe        │
                               │  • Business Logic│
                               └──────────────────┘
```

---

## App Layer Architecture (MVVM)

```
┌─────────────────────────────────────────────────────────────┐
│                          VIEWS                              │
│  (SwiftUI - User Interface)                                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ LoginView    │  │ MainTabView  │  │ ProfileView  │     │
│  │ SignUpView   │  │ LibraryView  │  │ SettingsView │     │
│  │ ContentView  │  │ CreateView   │  │ ...more      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                    Uses / Observes
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       VIEW MODELS                           │
│  (Business Logic & State Management)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ AuthViewModel                                        │  │
│  │ • @Published properties                              │  │
│  │ • Sign in/up/out logic                              │  │
│  │ • Validation                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                     Calls Methods
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVICES                             │
│  (Data Access & External Communication)                     │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │FirebaseService │  │  APIService    │  │NetworkMonitor│ │
│  │                │  │                │  │              │ │
│  │• signIn()      │  │• request()     │  │• isConnected │ │
│  │• signUp()      │  │• GET/POST/etc  │  │• WiFi/Cell   │ │
│  │• fetchData()   │  │• Health check  │  │              │ │
│  │• CRUD ops      │  │                │  │              │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                     Operates On
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         MODELS                              │
│  (Data Structures)                                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ User         │  │ Subscription │  │ Pose (TBD)   │     │
│  │              │  │              │  │              │     │
│  │• id          │  │• plan        │  │• id          │     │
│  │• email       │  │• status      │  │• name        │     │
│  │• displayName │  │• dates       │  │• imageURL    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Example: User Login

```
1. User Input
   │
   │  User enters email & password
   │
   ▼
2. View (LoginView)
   │
   │  Button tap triggers action
   │
   ▼
3. ViewModel (AuthViewModel)
   │
   │  Validates input
   │  Sets isLoading = true
   │
   ▼
4. Service (FirebaseService)
   │
   │  Calls Firebase Auth SDK
   │  auth.signIn(email, password)
   │
   ▼
5. Firebase Cloud
   │
   │  Authenticates user
   │  Returns user token
   │
   ▼
6. Service (FirebaseService)
   │
   │  Fetches user data from Firestore
   │  Creates User model
   │
   ▼
7. ViewModel (AuthViewModel)
   │
   │  Updates @Published properties
   │  currentUser = user
   │  isAuthenticated = true
   │  isLoading = false
   │
   ▼
8. View (ContentView)
   │
   │  Observes state change
   │  Shows MainTabView
   │
   ▼
9. User sees main app!
```

---

## File Organization

```
PosePromptStudio/
│
├── 📱 App/
│   └── PosePromptStudioApp.swift         Entry point
│       │
│       ├── Configures Firebase
│       ├── Sets up environment
│       └── Injects dependencies
│
├── ⚙️ Core/
│   └── Config/
│       └── Config.swift                  Configuration
│           │
│           ├── API URLs
│           ├── Stripe keys
│           ├── Endpoints
│           └── Feature flags
│
├── 📦 Models/
│   ├── User.swift                        Data structures
│   └── Subscription.swift
│       │
│       ├── Codable (JSON)
│       ├── Identifiable (Lists)
│       └── Mock data (Previews)
│
├── 🔧 Services/
│   ├── FirebaseService.swift             External services
│   ├── APIService.swift
│   └── NetworkMonitor.swift
│       │
│       ├── Singleton pattern
│       ├── Async/await
│       └── Error handling
│
├── 🧠 ViewModels/
│   └── AuthViewModel.swift               Business logic
│       │
│       ├── @Published properties
│       ├── Calls services
│       └── State management
│
└── 🎨 Views/
    ├── ContentView.swift                 UI Components
    │
    ├── Auth/
    │   ├── LoginView.swift
    │   ├── SignUpView.swift
    │   └── ForgotPasswordView.swift
    │
    └── Main/
        └── MainTabView.swift
            │
            ├── HomeView
            ├── LibraryView
            ├── CreateView
            └── ProfileView
```

---

## Navigation Flow

```
App Launch
    │
    ▼
ContentView
    │
    ├─── isAuthenticated? ───┐
    │                        │
    NO                      YES
    │                        │
    ▼                        ▼
LoginView              MainTabView
    │                        │
    ├── Sign Up ──▶ SignUpView    ├── Tab 1: HomeView
    │                        │
    └── Forgot ──▶ ForgotPasswordView    ├── Tab 2: LibraryView
                             │
                             ├── Tab 3: CreateView
                             │
                             └── Tab 4: ProfileView
                                  │
                                  ├── Settings
                                  ├── Subscription
                                  └── Sign Out ──▶ Back to LoginView
```

---

## State Management

```
┌─────────────────────────────────────────┐
│         App-Level State                 │
│      (@EnvironmentObject)               │
│                                          │
│  ┌────────────────────────────────┐    │
│  │ AuthViewModel                  │    │
│  │ • currentUser                  │    │
│  │ • isAuthenticated              │    │
│  │ • isLoading                    │    │
│  │ • errorMessage                 │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │ NetworkMonitor                 │    │
│  │ • isConnected                  │    │
│  │ • connectionType               │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
              │
              │ Injected into all views
              │
              ▼
┌─────────────────────────────────────────┐
│         View-Level State                │
│         (@State)                        │
│                                          │
│  • Form inputs (text fields)            │
│  • Sheet presentation                   │
│  • Local UI state                       │
│  • Animation states                     │
└─────────────────────────────────────────┘
```

---

## API Communication Flow

```
iOS App                    Backend Server
   │                            │
   │  1. HTTP Request           │
   │  ────────────────────▶     │
   │     GET /api/poses         │
   │     Headers:               │
   │     - Content-Type         │
   │     - Authorization (?)    │
   │                            │
   │                       2. Process
   │                          Request
   │                            │
   │  3. HTTP Response          │
   │  ◀────────────────────     │
   │     200 OK                 │
   │     {                      │
   │       "poses": [...]       │
   │     }                      │
   │                            │
   │  4. Decode JSON            │
   │     to Swift objects       │
   │                            │
   │  5. Update UI              │
   │                            │
```

---

## Firebase Integration

```
iOS App                 Firebase
   │                       │
   │  Authentication        │
   │  ─────────────▶        │
   │  signIn(email, pwd)    │
   │                        │
   │  ◀─────────────        │
   │  User Token            │
   │                        │
   │  Firestore Query       │
   │  ─────────────▶        │
   │  collection("users")   │
   │  .document(uid)        │
   │                        │
   │  ◀─────────────        │
   │  User Data             │
   │                        │
   │  Real-time Listener    │
   │  ─────────────▶        │
   │  Listen to changes     │
   │                        │
   │  ◀─────────────        │
   │  Updates (real-time)   │
   │                        │
```

---

## Error Handling Flow

```
User Action
    │
    ▼
Try Operation
    │
    ├── Success ──▶ Update UI ──▶ Done ✓
    │
    └── Error
        │
        ▼
    Catch Error
        │
        ├── Network Error ──▶ Show "No connection" banner
        │
        ├── Auth Error ──▶ Show login error message
        │
        ├── API Error ──▶ Show error alert
        │
        └── Unknown Error ──▶ Log + Generic error message
```

---

## Concurrency Model

```
┌─────────────────────────────────────────┐
│          Main Actor (@MainActor)        │
│      UI Updates - Always here           │
│                                          │
│  • View rendering                       │
│  • State updates                        │
│  • User interaction                     │
└─────────────────────────────────────────┘
              ▲
              │
        async/await
              │
              ▼
┌─────────────────────────────────────────┐
│          Background Tasks               │
│      Network, Database, etc.            │
│                                          │
│  • API calls                            │
│  • Firebase operations                  │
│  • Image processing                     │
│  • Heavy computations                   │
└─────────────────────────────────────────┘
```

---

## Testing Strategy

```
┌─────────────────────────────────────────┐
│          Unit Tests                     │
│                                          │
│  • Models (Codable)                     │
│  • ViewModels (logic)                   │
│  • Services (mocked)                    │
│  • Utility functions                    │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│       Integration Tests                 │
│                                          │
│  • API communication                    │
│  • Firebase integration                 │
│  • State management                     │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│          UI Tests                       │
│                                          │
│  • Login flow                           │
│  • Navigation                           │
│  • User workflows                       │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│       Manual Testing                    │
│                                          │
│  • Different devices                    │
│  • Network conditions                   │
│  • Edge cases                           │
└─────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────┐
│    App Transport Security (ATS)         │
│    • HTTPS enforcement                  │
│    • Local networking exception         │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│    Firebase Security Rules              │
│    • User-based access control          │
│    • Data validation                    │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│    Backend Authentication               │
│    • Token verification                 │
│    • Request validation                 │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│    Code-Level Security                  │
│    • No hardcoded secrets               │
│    • Environment configs                │
│    • Input validation                   │
└─────────────────────────────────────────┘
```

---

## Build & Deploy Pipeline

```
Development
    │
    ├─── Code ──▶ Xcode
    │
    ├─── Test ──▶ Simulator / Device
    │
    ├─── Debug ──▶ Fix issues
    │
    ▼
Archive
    │
    ├─── Product → Archive
    │
    ├─── Distribute App
    │
    ▼
TestFlight
    │
    ├─── Internal Testing (instant)
    │
    ├─── External Testing (review)
    │
    ├─── Gather Feedback
    │
    ▼
App Store
    │
    ├─── Create Listing
    │
    ├─── Upload Build
    │
    ├─── Submit for Review
    │
    ├─── Wait (1-2 days)
    │
    ▼
🎉 Released!
```

---

## Performance Optimization

```
┌─────────────────────────────────────────┐
│           Image Loading                 │
│  • AsyncImage for URLs                  │
│  • Caching                              │
│  • Lazy loading                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         List Performance                │
│  • LazyVStack/LazyHStack                │
│  • Pagination                           │
│  • Prefetching                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        Network Efficiency               │
│  • Request batching                     │
│  • Response caching                     │
│  • Background updates                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       Memory Management                 │
│  • Weak references                      │
│  • Task cancellation                    │
│  • Resource cleanup                     │
└─────────────────────────────────────────┘
```

---

## Development Workflow

```
1. Plan Feature
   │
   ├─── Define requirements
   ├─── Design UI mockup
   └─── Plan data model
   │
   ▼
2. Create Model
   │
   ├─── Define struct
   ├─── Make Codable
   └─── Add mock data
   │
   ▼
3. Create Service
   │
   ├─── Add API endpoint
   ├─── Implement method
   └─── Handle errors
   │
   ▼
4. Create ViewModel
   │
   ├─── Add @Published properties
   ├─── Implement logic
   └─── Call service
   │
   ▼
5. Create View
   │
   ├─── Build UI
   ├─── Add Preview
   └─── Test in simulator
   │
   ▼
6. Test & Refine
   │
   ├─── Fix bugs
   ├─── Optimize
   └─── Document
   │
   ▼
7. Ship! 🚀
```

---

**Use these diagrams to understand the app structure!**

Refer back to this file when planning new features or debugging issues.
