# iOS Quick Reference

## 📋 Quick Commands

### Start Everything
```bash
# Start backend server
npm start

# Check if servers are running
npm run check

# Stop all servers
npm run stop
```

### Xcode
- **Build:** `Cmd + B`
- **Run:** `Cmd + R`
- **Clean:** `Cmd + Shift + K`
- **Stop:** `Cmd + .`
- **Preview:** `Cmd + Option + Enter`

## 🗂️ File Organization

```
PosePromptStudio/
├── App/              → App initialization
├── Core/             → Core utilities & config
├── Models/           → Data models
├── Services/         → API, Firebase, Network
├── ViewModels/       → Business logic
└── Views/            → UI components
```

## 🔑 Key Files to Customize

### 1. Config.swift
```swift
// Update backend URL
static var apiBaseURL: String {
    return "http://localhost:3001"  // or your IP
}

// Add Stripe key
static var stripePublishableKey: String {
    return "pk_test_YOUR_KEY"
}
```

### 2. Models
Create models matching your backend data:
```swift
struct Pose: Codable, Identifiable {
    let id: String
    let name: String
    let imageURL: String
    // Add your fields
}
```

### 3. API Service
Add your API calls:
```swift
func fetchPoses() async throws -> [Pose] {
    try await request(
        endpoint: Config.Endpoint.poses,
        method: .get
    )
}
```

## 🎨 SwiftUI Patterns

### Basic View
```swift
struct MyView: View {
    var body: some View {
        Text("Hello")
    }
}

#Preview {
    MyView()
}
```

### View with State
```swift
struct MyView: View {
    @State private var count = 0
    
    var body: some View {
        Button("Count: \(count)") {
            count += 1
        }
    }
}
```

### View with ViewModel
```swift
struct MyView: View {
    @EnvironmentObject var viewModel: MyViewModel
    
    var body: some View {
        Text(viewModel.data)
    }
}
```

## 🔥 Firebase Patterns

### Sign In
```swift
try await firebaseService.signIn(
    email: email,
    password: password
)
```

### Fetch Data
```swift
let poses: [Pose] = try await firebaseService.fetchDocuments(
    from: "poses"
)
```

### Add Data
```swift
try await firebaseService.addDocument(
    to: "poses",
    data: newPose
)
```

## 🌐 API Patterns

### GET Request
```swift
let response: [Pose] = try await APIService.shared.request(
    endpoint: "/api/poses",
    method: .get
)
```

### POST Request
```swift
struct CreatePoseRequest: Codable {
    let name: String
    let imageURL: String
}

try await APIService.shared.request(
    endpoint: "/api/poses",
    method: .post,
    body: CreatePoseRequest(name: "Pose 1", imageURL: "...")
)
```

## 🎯 Common Tasks

### Add New View

1. Create file in `Views/`
2. Add to `MainTabView.swift` or navigate to it
3. Add preview:
```swift
#Preview {
    NewView()
}
```

### Add New Model

1. Create file in `Models/`
2. Make it `Codable` for API/Firebase
3. Add `Identifiable` for lists

```swift
struct MyModel: Codable, Identifiable {
    let id: String
    let name: String
}
```

### Add New API Endpoint

1. Add to `Config.swift`:
```swift
enum Endpoint {
    static let myEndpoint = "/api/my-endpoint"
}
```

2. Add method to `APIService.swift`:
```swift
func fetchMyData() async throws -> MyData {
    try await request(
        endpoint: Config.Endpoint.myEndpoint,
        method: .get
    )
}
```

### Add Loading State

```swift
struct MyView: View {
    @State private var isLoading = false
    @State private var data: [Item] = []
    
    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else {
                List(data) { item in
                    Text(item.name)
                }
            }
        }
        .task {
            await loadData()
        }
    }
    
    func loadData() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            data = try await APIService.shared.fetchData()
        } catch {
            print("Error: \(error)")
        }
    }
}
```

## 🐛 Debugging

### Print Debugging
```swift
print("Debug: \(value)")
dump(complexObject)
```

### Breakpoints
- Click line number in Xcode
- `Cmd + \` to toggle

### View Hierarchy
- **Debug View Hierarchy:** Pause app, click 3D icon in debug bar

### Network Debugging
```swift
// In APIService.swift, add logging:
print("Request: \(request.url?.absoluteString ?? "")")
print("Response: \(String(data: data, encoding: .utf8) ?? "")")
```

## 📱 Simulator Tips

### Shortcuts
- **Home:** `Cmd + Shift + H`
- **Lock:** `Cmd + L`
- **Screenshot:** `Cmd + S`
- **Rotate:** `Cmd + Left/Right Arrow`

### Reset Simulator
- **Device → Erase All Content and Settings**

## 🚀 Performance Tips

### Images
```swift
// Async image loading
AsyncImage(url: URL(string: imageURL)) { image in
    image.resizable()
} placeholder: {
    ProgressView()
}
```

### Lists
```swift
// Use LazyVStack for large lists
LazyVStack {
    ForEach(items) { item in
        ItemRow(item: item)
    }
}
```

### Tasks
```swift
// Cancel tasks when view disappears
.task {
    await loadData()
}
// Automatic cancellation on disappear
```

## 🔐 Security

### Never Commit
- `Config.swift` (use template)
- `GoogleService-Info.plist`
- API keys
- Passwords

### Environment Variables
Use `#if DEBUG` for different configs:
```swift
#if DEBUG
let apiURL = "http://localhost:3001"
#else
let apiURL = "https://production.com"
#endif
```

## 📦 Building for Release

### Archive
1. **Product → Archive**
2. Wait for build
3. **Distribute App**
4. Follow prompts

### TestFlight
- Upload to App Store Connect
- Internal testing: Immediate
- External testing: Needs review

### App Store
- Create listing in App Store Connect
- Add screenshots, description
- Submit for review
- Wait 1-2 days

## 💡 Resources

- [SwiftUI Docs](https://developer.apple.com/documentation/swiftui)
- [Firebase iOS](https://firebase.google.com/docs/ios/setup)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**Keep this file handy as a quick reference!**
