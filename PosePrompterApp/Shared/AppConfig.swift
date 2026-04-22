import Foundation

enum AppConfig {
    private static let apiBaseURLOverrideKey = "PosePrompter_APIBaseURLOverride"

    static var apiBaseURL: String {
        if let override = UserDefaults.standard.string(forKey: apiBaseURLOverrideKey),
           !override.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return normalized(override)
        }

        if let plistValue = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
           !plistValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return normalized(plistValue)
        }

#if targetEnvironment(simulator)
        return "http://127.0.0.1:3001"
#else
        return "https://api.poseprompter.com"
#endif
    }

    static var savedAPIBaseURLOverride: String? {
        UserDefaults.standard.string(forKey: apiBaseURLOverrideKey)
    }

    static func setAPIBaseURLOverride(_ url: String?) {
        let trimmed = url?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if trimmed.isEmpty {
            UserDefaults.standard.removeObject(forKey: apiBaseURLOverrideKey)
        } else {
            UserDefaults.standard.set(normalized(trimmed), forKey: apiBaseURLOverrideKey)
        }
    }

    static func clearAPIBaseURLOverride() {
        UserDefaults.standard.removeObject(forKey: apiBaseURLOverrideKey)
    }

    private static func normalized(_ url: String) -> String {
        var value = url.trimmingCharacters(in: .whitespacesAndNewlines)
        while value.hasSuffix("/") {
            value.removeLast()
        }
        return value
    }
}
