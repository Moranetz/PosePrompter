import UIKit

/// API service for image generation. Replace baseURL and endpoints with your actual backend.
actor APIService {
    static let shared = APIService()

    // TODO: Set your actual API base URL
    private let baseURL = "https://api.poseprompter.com"

    enum APIError: LocalizedError {
        case notAuthenticated
        case insufficientCredits
        case invalidResponse
        case serverError(String)
        case networkError

        var errorDescription: String? {
            switch self {
            case .notAuthenticated: return "Please sign in to generate images."
            case .insufficientCredits: return "Not enough credits. Purchase more to continue."
            case .invalidResponse: return "Invalid response from server."
            case .serverError(let msg): return msg
            case .networkError: return "Network error. Check your connection."
            }
        }
    }

    struct GenerationResult {
        let image: UIImage
        let creditsUsed: Int
        let remainingCredits: Int
    }

    /// Generate an image from a prompt
    func generateImage(
        prompt: String,
        model: String,
        referencePhotoData: Data? = nil,
        authToken: String
    ) async throws -> GenerationResult {
        var request = URLRequest(url: URL(string: "\(baseURL)/api/generate")!)
        request.httpMethod = "POST"
        request.addValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        var body: [String: Any] = [
            "prompt": prompt,
            "model": model,
        ]

        if let photoData = referencePhotoData {
            body["referencePhoto"] = photoData.base64EncodedString()
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
                  let imageURL = URL(string: imageURLString) else {
                throw APIError.invalidResponse
            }

            let (imageData, _) = try await URLSession.shared.data(from: imageURL)
            guard let image = UIImage(data: imageData) else {
                throw APIError.invalidResponse
            }

            let creditsUsed = json["creditsUsed"] as? Int ?? 1
            let remaining = json["remainingCredits"] as? Int ?? 0

            return GenerationResult(image: image, creditsUsed: creditsUsed, remainingCredits: remaining)

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
        var request = URLRequest(url: URL(string: "\(baseURL)/api/credits")!)
        request.addValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let credits = json["credits"] as? Int else {
            throw APIError.invalidResponse
        }
        return credits
    }
}
