import AuthenticationServices
import SwiftUI

@Observable
final class AuthManager {
    var currentUser: AppUser?
    var isSignedIn: Bool { currentUser != nil }

    private let userKey = "PosePrompter_CurrentUser"

    init() {
        loadUser()
    }

    func handleSignInWithApple(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let auth):
            guard let credential = auth.credential as? ASAuthorizationAppleIDCredential else { return }
            let userId = credential.user
            let fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
                .compactMap { $0 }
                .joined(separator: " ")
            let email = credential.email

            let user = AppUser(
                id: userId,
                displayName: fullName.isEmpty ? (currentUser?.displayName ?? "Creator") : fullName,
                email: email ?? currentUser?.email
            )
            currentUser = user
            saveUser()
            HapticManager.success()

        case .failure:
            break
        }
    }

    func signOut() {
        currentUser = nil
        UserDefaults.standard.removeObject(forKey: userKey)
        HapticManager.light()
    }

    private func saveUser() {
        guard let user = currentUser,
              let data = try? JSONEncoder().encode(user) else { return }
        UserDefaults.standard.set(data, forKey: userKey)
    }

    private func loadUser() {
        guard let data = UserDefaults.standard.data(forKey: userKey),
              let user = try? JSONDecoder().decode(AppUser.self, from: data) else { return }
        currentUser = user
    }
}

struct AppUser: Codable, Identifiable {
    let id: String
    var displayName: String
    var email: String?
    var credits: Int = 0
}
