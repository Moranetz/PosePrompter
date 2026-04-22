import UIKit

/// API service for image generation. Replace baseURL and endpoints with your actual backend.
actor APIService {
    static let shared = APIService()

    private var baseURL: String { AppConfig.apiBaseURL }

    enum APIError: LocalizedError {
        case notAuthenticated
        case insufficientCredits
        case invalidResponse
        case serverError(String)
        case networkError

        var errorDescription: String? {
            switch self {
            case .notAuthenticated: return "Please sign in with Firebase to generate images."
            case .insufficientCredits: return "Not enough credits. Purchase more to continue."
            case .invalidResponse: return "Invalid response from server."
            case .serverError(let msg): return msg
            case .networkError: return "Network error. Check your connection."
            }
        }
    }

    struct GenerationResult {
        let image: UIImage
        let cost: Int
        let remainingCredits: Int
    }

    /// Generate an image from a prompt
    func generateImage(
        prompt: String,
        provider: String,
        options: [String: Any] = [:],
        facePhotoUrl: String? = nil,
        authToken: String
    ) async throws -> GenerationResult {
        guard !authToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw APIError.notAuthenticated
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/api/generate-image")!)
        request.httpMethod = "POST"
        request.addValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        var body: [String: Any] = [
            "provider": provider,
            "prompt": prompt,
            "options": options,
        ]

        if let facePhotoUrl {
            body["facePhotoUrl"] = facePhotoUrl
        }

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200:
            guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let imageURLString = json["imageUrl"] as? String,
                  let image = try await Self.loadImage(from: imageURLString) else {
                throw APIError.invalidResponse
            }

            let cost = json["cost"] as? Int ?? json["creditsUsed"] as? Int ?? 1
            let remaining = json["newBalance"] as? Int ?? json["remainingCredits"] as? Int ?? 0

            return GenerationResult(image: image, cost: cost, remainingCredits: remaining)

        case 401:
            throw APIError.notAuthenticated
        case 402:
            throw APIError.insufficientCredits
        default:
            let msg = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError.serverError(msg)
        }
    }

    /// Check credit balance
    func checkCredits(authToken: String) async throws -> Int {
        guard !authToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw APIError.notAuthenticated
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/api/credits/balance")!)
        request.addValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let credits = json["credits"] as? Int else {
            throw APIError.invalidResponse
        }
        return credits
    }

    /// Redeem an App Store purchase against the backend credit ledger.
    func redeemAppStorePurchase(
        productId: String,
        transactionId: String,
        authToken: String
    ) async throws -> Int {
        guard !authToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw APIError.notAuthenticated
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/api/credits/redeem-app-store")!)
        request.httpMethod = "POST"
        request.addValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "productId": productId,
            "transactionId": transactionId
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200:
            guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let newBalance = json["newBalance"] as? Int else {
                throw APIError.invalidResponse
            }
            return newBalance
        case 401:
            throw APIError.notAuthenticated
        default:
            let msg = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError.serverError(msg)
        }
    }

    private static func loadImage(from imageURLString: String) async throws -> UIImage? {
        if imageURLString.hasPrefix("data:") {
            guard let commaIndex = imageURLString.firstIndex(of: ",") else {
                return nil
            }

            let base64String = String(imageURLString[imageURLString.index(after: commaIndex)...])
            guard let imageData = Data(base64Encoded: base64String),
                  let image = UIImage(data: imageData) else {
                return nil
            }
            return image
        }

        guard let imageURL = URL(string: imageURLString) else {
            return nil
        }

        let (imageData, _) = try await URLSession.shared.data(from: imageURL)
        return UIImage(data: imageData)
    }
}
