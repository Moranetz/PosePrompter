import SwiftUI

@main
struct PosePrompterApp: App {
    @State private var promptState = PromptState()

    var body: some Scene {
        WindowGroup {
            MainView()
                .environment(promptState)
                .preferredColorScheme(.dark)
        }
    }
}
