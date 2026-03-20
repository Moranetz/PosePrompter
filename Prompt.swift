//
//  Prompt.swift
//  PosePromptStudio
//
//  AI Prompt data model for PosePrompter
//

import Foundation

struct Prompt: Codable, Identifiable {
    let id: String
    var name: String?
    var createdAt: Date
    var createdBy: String
    
    // All 30 category selections (matching your web app)
    var selections: PromptSelections
    
    // Generated output
    var generatedImageURL: String?
    var generatedText: String?  // The full prompt text
    
    // Metadata
    var isFavorite: Bool
    var tags: [String]?
    var isPublic: Bool
    
    enum CodingKeys: String, CodingKey {
        case id, name, createdAt, createdBy
        case selections
        case generatedImageURL, generatedText
        case isFavorite, tags, isPublic
    }
}

// MARK: - Prompt Selections

struct PromptSelections: Codable {
    // Body Pose
    var bodyPose: Int?
    var torso: Int?
    var arms: Int?
    var hands: Int?
    var legs: Int?
    var feet: Int?
    var bodySize: Int?
    
    // Face & Head
    var headPosition: Int?
    var facialExpression: Int?
    var eyes: Int?
    var mouth: Int?
    var hair: Int?
    
    // Clothes & Styling
    var outfit: Int?
    var outfitTop: Int?
    var outfitBottom: Int?
    var shoes: Int?
    var jewelry: Int?
    var hairAccessories: Int?
    var bags: Int?
    var brandDesigner: Int?
    
    // Background & Environment
    var background: Int?
    var props: Int?
    
    // Framing & Composition
    var framing: Int?
    var perspective: Int?
    var cameraAngle: Int?
    var cameraType: Int?
    
    // Aesthetic & Style
    var aesthetic: Int?
    var lighting: Int?
    var colorPalette: Int?
    var texture: Int?
    var mood: Int?
    var photoStyle: Int?
    
    init() {
        // Initialize with defaults (index 0 for each)
    }
    
    enum CodingKeys: String, CodingKey {
        case bodyPose = "BodyPose"
        case torso = "Torso"
        case arms = "Arms"
        case hands = "Hands"
        case legs = "Legs"
        case feet = "Feet"
        case bodySize = "BodySize"
        case headPosition = "HeadPosition"
        case facialExpression = "FacialExpression"
        case eyes = "Eyes"
        case mouth = "Mouth"
        case hair = "Hair"
        case outfit = "Outfit"
        case outfitTop = "OutfitTop"
        case outfitBottom = "OutfitBottom"
        case shoes = "Shoes"
        case jewelry = "Jewelry"
        case hairAccessories = "HairAccessories"
        case bags = "Bags"
        case brandDesigner = "BrandDesigner"
        case background = "Background"
        case props = "Props"
        case framing = "Framing"
        case perspective = "Perspective"
        case cameraAngle = "CameraAngle"
        case cameraType = "CameraType"
        case aesthetic = "Aesthetic"
        case lighting = "Lighting"
        case colorPalette = "ColorPalette"
        case texture = "Texture"
        case mood = "Mood"
        case photoStyle = "PhotoStyle"
    }
}

// MARK: - Category Option

struct CategoryOption: Codable, Identifiable {
    var id: String { title }
    let title: String
    let description: String?
    let keywords: [String]?
    
    enum CodingKeys: String, CodingKey {
        case title, description, keywords
    }
}

// MARK: - Mock Data

extension Prompt {
    static let mock = Prompt(
        id: UUID().uuidString,
        name: "Fashion Portrait",
        createdAt: Date(),
        createdBy: "user123",
        selections: PromptSelections(),
        generatedImageURL: nil,
        generatedText: "A fashion portrait with studio lighting",
        isFavorite: false,
        tags: ["fashion", "portrait"],
        isPublic: false
    )
    
    static let mockList: [Prompt] = [
        Prompt(
            id: "1",
            name: "Casual Street Style",
            createdAt: Date().addingTimeInterval(-86400),
            createdBy: "user123",
            selections: PromptSelections(),
            generatedImageURL: nil,
            generatedText: "Casual street style photography",
            isFavorite: true,
            tags: ["casual", "street"],
            isPublic: true
        ),
        Prompt(
            id: "2",
            name: "Professional Headshot",
            createdAt: Date().addingTimeInterval(-172800),
            createdBy: "user123",
            selections: PromptSelections(),
            generatedImageURL: nil,
            generatedText: "Professional corporate headshot",
            isFavorite: false,
            tags: ["professional", "corporate"],
            isPublic: false
        ),
        Prompt(
            id: "3",
            name: "Artistic Pose",
            createdAt: Date().addingTimeInterval(-259200),
            createdBy: "user123",
            selections: PromptSelections(),
            generatedImageURL: nil,
            generatedText: "Artistic dramatic pose with moody lighting",
            isFavorite: true,
            tags: ["artistic", "dramatic"],
            isPublic: true
        )
    ]
}
