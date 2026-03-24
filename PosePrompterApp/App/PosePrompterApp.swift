import SwiftUI
import Combine
import SwiftData

@main
struct PosePrompterApp: App {
    @State private var promptState = PromptState()
    @State private var authManager = AuthManager()
    @State private var storeManager = StoreManager()
    @State private var selectedTab = 0

    var body: some Scene {
        WindowGroup {
            TabView(selection: $selectedTab) {
                DiscoverView()
                    .tabItem {
                        Label("Discover", systemImage: "sparkle.magnifyingglass")
                    }
                    .tag(0)
                MainView()
                    .tabItem {
                        Label("Builder", systemImage: "wand.and.stars")
                    }
                    .tag(1)
                CreateView()
                    .tabItem {
                        Label("Create", systemImage: "camera.aperture")
                    }
                    .tag(2)
                SettingsView()
                    .tabItem {
                        Label("Settings", systemImage: "gearshape")
                    }
                    .tag(3)
            }
            .tint(Theme.selectedAccent)
            .environment(promptState)
            .environment(authManager)
            .environment(storeManager)
            .preferredColorScheme(.dark)
            .modelContainer(for: [PromptHistory.self, SavedTemplate.self, GeneratedImage.self])
            .onChange(of: promptState.navigateToBuilder) { _, navigate in
                if navigate {
                    selectedTab = 1
                    promptState.navigateToBuilder = false
                }
            }
            .onOpenURL { url in
                if url.host == "builder" {
                    selectedTab = 1
                } else if url.host == "create" {
                    selectedTab = 2
                }
            }
            .onReceive(Timer.publish(every: 10, on: .main, in: .common).autoconnect()) { _ in
                ReviewManager.shared.addPlayTime(10)
            }
        }
    }
}
