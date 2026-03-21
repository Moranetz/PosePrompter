import SwiftUI

@main
struct PosePrompterApp: App {
    @State private var promptState = PromptState()

    var body: some Scene {
        WindowGroup {
            TabView {
                MainView()
                    .tabItem {
                        Label("Builder", systemImage: "wand.and.stars")
                    }
                SettingsView()
                    .tabItem {
                        Label("Settings", systemImage: "gearshape")
                    }
            }
            .tint(Theme.selectedAccent)
            .environment(promptState)
            .preferredColorScheme(.dark)
        }
    }
}
