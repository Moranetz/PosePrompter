import AuthenticationServices
import CryptoKit
import Security
import SwiftUI

@MainActor
@Observable
final class AuthManager {
    var currentUser: AppUser?
    var isSignedIn: Bool { currentUser != nil }

    private var currentNonce: String?
    private var session: FirebaseSession?
    private let config: FirebaseRESTConfig?
    private let sessionKey = "PosePrompter_FirebaseSession"

    init() {
        config = FirebaseRESTConfig.load()
        session = Self.loadSession(from: sessionKey)
        currentUser = session.map { AppUser(id: $0.userId, displayName: $0.displayName, email: $0.email, credits: 0) }

        Task {
            await refreshSessionIfNeeded()
        }
    }

    var isConfigured: Bool { config != nil }

    func configureAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        let nonce = Self.randomNonceString()
        currentNonce = nonce
        request.requestedScopes = [.fullName, .email]
        request.nonce = Self.sha256(nonce)
    }

    func handleSignInWithApple(_ result: Result<ASAuthorization, Error>, completion: @escaping (Bool) -> Void = { _ in }) {
        switch result {
        case .success(let auth):
            defer { currentNonce = nil }
            guard
                let credential = auth.credential as? ASAuthorizationAppleIDCredential,
                let appleToken = credential.identityToken,
                let idTokenString = String(data: appleToken, encoding: .utf8),
                let nonce = currentNonce,
                let config
            else {
                completion(false)
                return
            }

            let fullName = Self.formatName(credential.fullName)

            Task {
                do {
                    let signInResponse = try await Self.signInWithApple(
                        apiKey: config.apiKey,
                        idToken: idTokenString,
                        nonce: nonce
                    )

                    let session: FirebaseSession
                    if let fullName, !fullName.isEmpty {
                        session = try await Self.updateDisplayName(
                            apiKey: config.apiKey,
                            idToken: signInResponse.idToken,
                            displayName: fullName,
                            refreshToken: signInResponse.refreshToken,
                            expiresIn: TimeInterval(signInResponse.expiresIn)
                        )
                    } else {
                        session = FirebaseSession(
                            userId: signInResponse.localId,
                            displayName: signInResponse.displayName ?? (credential.fullName.flatMap { Self.formatName($0) } ?? (signInResponse.email ?? "Creator")),
                            email: signInResponse.email,
                            idToken: signInResponse.idToken,
                            refreshToken: signInResponse.refreshToken,
                            tokenExpiry: Date().addingTimeInterval(TimeInterval(signInResponse.expiresIn))
                        )
                    }

                    apply(session)
                    HapticManager.success()
                    await MainActor.run { completion(true) }
                } catch {
                    print("[AuthManager] Firebase REST sign-in failed: \(error.localizedDescription)")
                    await MainActor.run { completion(false) }
                }
            }

        case .failure:
            currentNonce = nil
            completion(false)
            break
        }
    }

    func signOut() {
        clearSession()
        HapticManager.light()
    }

    func idToken() async throws -> String {
        guard config != nil else {
            throw AuthError.notConfigured
        }

        guard session != nil else {
            throw AuthError.notAuthenticated
        }

        try await refreshSessionIfNeeded()

        guard let token = session?.idToken else {
            throw AuthError.notAuthenticated
        }

        return token
    }

    private func refreshSessionIfNeeded() async {
        guard let config, let session else { return }

        if let expiry = session.tokenExpiry,
           expiry.timeIntervalSinceNow > 300,
           !session.idToken.isEmpty {
            return
        }

        guard !session.refreshToken.isEmpty else { return }

        do {
            let refreshed = try await Self.refreshSession(
                apiKey: config.apiKey,
                refreshToken: session.refreshToken
            )

            let updatedSession = FirebaseSession(
                userId: session.userId,
                displayName: session.displayName,
                email: session.email,
                idToken: refreshed.idToken,
                refreshToken: refreshed.refreshToken,
                tokenExpiry: Date().addingTimeInterval(TimeInterval(refreshed.expiresIn))
            )

            apply(updatedSession)
        } catch {
            print("[AuthManager] Session refresh failed: \(error.localizedDescription)")
        }
    }

    private func apply(_ session: FirebaseSession) {
        self.session = session
        currentUser = AppUser(id: session.userId, displayName: session.displayName, email: session.email, credits: 0)
        Self.saveSession(session, key: sessionKey)
    }

    private func clearSession() {
        session = nil
        currentUser = nil
        UserDefaults.standard.removeObject(forKey: sessionKey)
    }

    private static func signInWithApple(apiKey: String, idToken: String, nonce: String) async throws -> FirebaseIdentityResponse {
        let url = URL(string: "https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=\(apiKey)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let postBody = "id_token=\(idToken.encodedForFormBody)&providerId=apple.com&nonce=\(nonce.encodedForFormBody)"
        let body: [String: Any] = [
            "postBody": postBody,
            "requestUri": "http://localhost",
            "returnSecureToken": true
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response: response, data: data)

        return try JSONDecoder().decode(FirebaseIdentityResponse.self, from: data)
    }

    private static func updateDisplayName(
        apiKey: String,
        idToken: String,
        displayName: String,
        refreshToken: String,
        expiresIn: Int
    ) async throws -> FirebaseSession {
        let url = URL(string: "https://identitytoolkit.googleapis.com/v1/accounts:update?key=\(apiKey)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "idToken": idToken,
            "displayName": displayName,
            "returnSecureToken": true
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response: response, data: data)

        let result = try JSONDecoder().decode(FirebaseIdentityResponse.self, from: data)
        return FirebaseSession(
            userId: result.localId,
            displayName: (result.displayName?.isEmpty == false ? result.displayName : nil) ?? displayName,
            email: result.email,
            idToken: result.idToken,
            refreshToken: result.refreshToken.isEmpty ? refreshToken : result.refreshToken,
            tokenExpiry: Date().addingTimeInterval(TimeInterval(result.expiresIn > 0 ? result.expiresIn : Int(expiresIn)))
        )
    }

    private static func refreshSession(apiKey: String, refreshToken: String) async throws -> FirebaseRefreshResponse {
        let url = URL(string: "https://securetoken.googleapis.com/v1/token?key=\(apiKey)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let body = "grant_type=refresh_token&refresh_token=\(refreshToken)"
        request.httpBody = body.data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response: response, data: data)

        return try JSONDecoder().decode(FirebaseRefreshResponse.self, from: data)
    }

    private static func validate(response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError.invalidResponse
        }

        guard 200...299 ~= httpResponse.statusCode else {
            let message = String(data: data, encoding: .utf8) ?? "Unknown Firebase auth error"
            throw AuthError.serverError(message)
        }
    }

    private static func saveSession(_ session: FirebaseSession, key: String) {
        guard let data = try? JSONEncoder().encode(session) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private static func loadSession(from key: String) -> FirebaseSession? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(FirebaseSession.self, from: data)
    }

    private static func formatName(_ components: PersonNameComponents?) -> String? {
        guard let components else { return nil }
        let parts = [
            components.givenName,
            components.middleName,
            components.familyName
        ]
        .compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }

        guard !parts.isEmpty else { return nil }
        return parts.joined(separator: " ")
    }

    private static func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")

        var result = ""
        result.reserveCapacity(length)

        while result.count < length {
            var random: UInt8 = 0
            let errorCode = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
            if errorCode != errSecSuccess {
                fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)")
            }

            if random < charset.count {
                result.append(charset[Int(random)])
            }
        }

        return result
    }

    private static func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        return hashedData.map { String(format: "%02x", $0) }.joined()
    }
}

private extension String {
    var encodedForFormBody: String {
        addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? self
    }
}

struct AppUser: Codable, Identifiable {
    let id: String
    var displayName: String
    var email: String?
    var credits: Int = 0
}

private struct FirebaseSession: Codable {
    let userId: String
    let displayName: String
    let email: String?
    let idToken: String
    let refreshToken: String
    let tokenExpiry: Date?
}

private struct FirebaseIdentityResponse: Codable {
    let localId: String
    let displayName: String?
    let email: String?
    let idToken: String
    let refreshToken: String
    let expiresIn: Int

    enum CodingKeys: String, CodingKey {
        case localId
        case displayName
        case email
        case idToken
        case refreshToken
        case expiresIn = "expiresIn"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        localId = try container.decode(String.self, forKey: .localId)
        displayName = try container.decodeIfPresent(String.self, forKey: .displayName)
        email = try container.decodeIfPresent(String.self, forKey: .email)
        idToken = try container.decode(String.self, forKey: .idToken)
        refreshToken = try container.decode(String.self, forKey: .refreshToken)

        if let expiresString = try? container.decode(String.self, forKey: .expiresIn),
           let expiresInt = Int(expiresString) {
            expiresIn = expiresInt
        } else {
            expiresIn = (try? container.decode(Int.self, forKey: .expiresIn)) ?? 3600
        }
    }
}

private struct FirebaseRefreshResponse: Codable {
    let idToken: String
    let refreshToken: String
    let expiresIn: Int

    enum CodingKeys: String, CodingKey {
        case idToken = "id_token"
        case refreshToken = "refresh_token"
        case expiresIn = "expires_in"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        idToken = try container.decode(String.self, forKey: .idToken)
        refreshToken = try container.decode(String.self, forKey: .refreshToken)

        if let expiresString = try? container.decode(String.self, forKey: .expiresIn),
           let expiresInt = Int(expiresString) {
            expiresIn = expiresInt
        } else {
            expiresIn = (try? container.decode(Int.self, forKey: .expiresIn)) ?? 3600
        }
    }
}

private struct FirebaseRESTConfig {
    let apiKey: String

    static func load() -> FirebaseRESTConfig? {
        guard
            let url = Bundle.main.url(forResource: "GoogleService-Info", withExtension: "plist"),
            let data = try? Data(contentsOf: url),
            let plist = try? PropertyListSerialization.propertyList(from: data, options: [], format: nil),
            let dict = plist as? [String: Any],
            let apiKey = dict["API_KEY"] as? String,
            !apiKey.isEmpty
        else {
            return nil
        }

        return FirebaseRESTConfig(apiKey: apiKey)
    }
}

enum AuthError: LocalizedError {
    case notConfigured
    case notAuthenticated
    case invalidResponse
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .notConfigured:
            return "Firebase configuration is missing. Add GoogleService-Info.plist to the app target."
        case .notAuthenticated:
            return "Please sign in with Apple to generate images."
        case .invalidResponse:
            return "Invalid response from authentication service."
        case .serverError(let message):
            return message
        }
    }
}
