//
//  User.swift
//  PosePromptStudio
//
//  User data model
//

import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    var displayName: String
    let createdAt: Date
    var subscription: Subscription?
    var photoURL: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case displayName
        case createdAt
        case subscription
        case photoURL
    }
}

// MARK: - Mock Data (for previews)

extension User {
    static let mock = User(
        id: "123",
        email: "demo@poseprompt.studio",
        displayName: "Demo User",
        createdAt: Date(),
        subscription: .mock,
        photoURL: nil
    )
}
