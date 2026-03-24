import StoreKit
import UIKit

final class ReviewManager {
    static let shared = ReviewManager()
    private init() {}

    private let defaults = UserDefaults.standard
    private var versionKey: String { "reviewPrompted_\(currentVersion)" }
    private var currentVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    private let promptCountKey = "poseprompter.promptCreateCount"
    private let imageGenCountKey = "poseprompter.imageGenCount"

    /// Call after creating a prompt. Prompts review after 3rd prompt creation.
    func logPromptCreated() {
        let count = defaults.integer(forKey: promptCountKey) + 1
        defaults.set(count, forKey: promptCountKey)
        if count >= 3 { promptReview() }
    }

    /// Call after generating an image. Prompts review after 2nd image generation.
    func logImageGenerated() {
        let count = defaults.integer(forKey: imageGenCountKey) + 1
        defaults.set(count, forKey: imageGenCountKey)
        if count >= 2 { promptReview() }
    }

    private func promptReview() {
        guard !defaults.bool(forKey: versionKey) else { return }
        defaults.set(true, forKey: versionKey)

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            if let scene = UIApplication.shared.connectedScenes
                .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
                SKStoreReviewController.requestReview(in: scene)
            }
        }
    }
}
