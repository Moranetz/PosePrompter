//
//  Categories.swift
//  PosePromptStudio
//
//  Category system mirroring the web app's 30 prompt categories
//

import SwiftUI

// MARK: - Category Option

/// A single selectable option within a category (e.g., one lighting setup or one pose)
struct CategoryOption: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let prompt: String
    var comprehensive: Bool?

    /// Whether this is a comprehensive aesthetic that overrides Lighting, ColorPalette, Texture
    var isComprehensive: Bool {
        comprehensive ?? false
    }

    static func == (lhs: CategoryOption, rhs: CategoryOption) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Category

/// One of the 30 prompt categories
enum Category: String, CaseIterable, Codable, Identifiable {
    // Aesthetic & Style
    case aesthetic = "Aesthetic"
    case lighting = "Lighting"
    case colorPalette = "ColorPalette"
    case texture = "Texture"
    case mood = "Mood"
    case photoStyle = "PhotoStyle"

    // Framing & Composition
    case framing = "Framing"
    case perspective = "Perspective"
    case cameraAngle = "CameraAngle"
    case cameraType = "CameraType"

    // Background & Environment
    case background = "Background"
    case props = "Props"

    // Clothes & Styling
    case outfit = "Outfit"
    case outfitTop = "OutfitTop"
    case outfitBottom = "OutfitBottom"
    case shoes = "Shoes"
    case jewelry = "Jewelry"
    case hairAccessories = "HairAccessories"
    case bags = "Bags"
    case brandDesigner = "BrandDesigner"

    // Face & Head
    case headPosition = "HeadPosition"
    case facialExpression = "FacialExpression"
    case eyes = "Eyes"
    case mouth = "Mouth"
    case hair = "Hair"

    // Body & Pose
    case bodyPose = "BodyPose"
    case torso = "Torso"
    case arms = "Arms"
    case hands = "Hands"
    case legs = "Legs"
    case feet = "Feet"
    case bodySize = "BodySize"

    var id: String { rawValue }

    /// Human-readable display name
    var displayName: String {
        switch self {
        case .aesthetic: return "Aesthetic"
        case .lighting: return "Lighting"
        case .colorPalette: return "Color Palette"
        case .texture: return "Texture"
        case .mood: return "Mood"
        case .photoStyle: return "Photo Style"
        case .framing: return "Framing"
        case .perspective: return "Perspective"
        case .cameraAngle: return "Camera Angle"
        case .cameraType: return "Camera Type"
        case .background: return "Background"
        case .props: return "Props"
        case .outfit: return "Outfit"
        case .outfitTop: return "Outfit Top"
        case .outfitBottom: return "Outfit Bottom"
        case .shoes: return "Shoes"
        case .jewelry: return "Jewelry"
        case .hairAccessories: return "Hair Accessories"
        case .bags: return "Bags"
        case .brandDesigner: return "Brand/Designer"
        case .headPosition: return "Head Position"
        case .facialExpression: return "Facial Expression"
        case .eyes: return "Eyes"
        case .mouth: return "Mouth"
        case .hair: return "Hair"
        case .bodyPose: return "Body Pose"
        case .torso: return "Torso"
        case .arms: return "Arms"
        case .hands: return "Hands"
        case .legs: return "Legs"
        case .feet: return "Feet"
        case .bodySize: return "Body Size"
        }
    }

    /// Brand color for this category
    var color: Color {
        switch self {
        case .aesthetic: return Color(hex: "a855f7")
        case .bodyPose: return Color(hex: "10b981")
        case .torso: return Color(hex: "22c55e")
        case .arms: return Color(hex: "4ade80")
        case .hands: return Color(hex: "86efac")
        case .legs: return Color(hex: "16a34a")
        case .feet: return Color(hex: "15803d")
        case .bodySize: return Color(hex: "f59e0b")
        case .headPosition: return Color(hex: "ec4899")
        case .facialExpression: return Color(hex: "f472b6")
        case .eyes: return Color(hex: "fb7185")
        case .mouth: return Color(hex: "fda4af")
        case .hair: return Color(hex: "f97316")
        case .outfit: return Color(hex: "3b82f6")
        case .outfitTop: return Color(hex: "60a5fa")
        case .outfitBottom: return Color(hex: "93c5fd")
        case .shoes: return Color(hex: "2563eb")
        case .jewelry: return Color(hex: "fbbf24")
        case .hairAccessories: return Color(hex: "fcd34d")
        case .bags: return Color(hex: "f59e0b")
        case .brandDesigner: return Color(hex: "d97706")
        case .perspective: return Color(hex: "8b5cf6")
        case .framing: return Color(hex: "a78bfa")
        case .cameraAngle: return Color(hex: "c4b5fd")
        case .cameraType: return Color(hex: "f59e0b")
        case .lighting: return Color(hex: "eab308")
        case .colorPalette: return Color(hex: "ef4444")
        case .texture: return Color(hex: "0ea5e9")
        case .mood: return Color(hex: "d946ef")
        case .photoStyle: return Color(hex: "14b8a6")
        case .background: return Color(hex: "06b6d4")
        case .props: return Color(hex: "84cc16")
        }
    }

    /// SF Symbol icon for this category
    var iconName: String {
        switch self {
        case .aesthetic: return "sparkles"
        case .lighting: return "light.max"
        case .colorPalette: return "paintpalette.fill"
        case .texture: return "square.grid.3x3.fill"
        case .mood: return "heart.fill"
        case .photoStyle: return "camera.filters"
        case .framing: return "crop"
        case .perspective: return "perspective"
        case .cameraAngle: return "angle"
        case .cameraType: return "camera.fill"
        case .background: return "photo.fill"
        case .props: return "cube.fill"
        case .outfit: return "tshirt.fill"
        case .outfitTop: return "tshirt.fill"
        case .outfitBottom: return "figure.walk"
        case .shoes: return "shoe.fill"
        case .jewelry: return "star.fill"
        case .hairAccessories: return "crown.fill"
        case .bags: return "bag.fill"
        case .brandDesigner: return "tag.fill"
        case .headPosition: return "head.profile.arrow.forward.and.visionpro"
        case .facialExpression: return "face.smiling.fill"
        case .eyes: return "eye.fill"
        case .mouth: return "mouth.fill"
        case .hair: return "wind"
        case .bodyPose: return "figure.stand"
        case .torso: return "figure.arms.open"
        case .arms: return "hand.raised.fill"
        case .hands: return "hand.point.up.fill"
        case .legs: return "figure.walk"
        case .feet: return "shoeprint.fill"
        case .bodySize: return "person.fill"
        }
    }
}

// MARK: - Category Group

/// Groups categories into logical sections matching the web app's 6-part layout
struct CategoryGroup: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let defaultCategories: [Category]
    let allCategories: [Category]

    /// The 6 groups ordered from most static to most dynamic
    static let all: [CategoryGroup] = [
        CategoryGroup(
            title: "Background & Environment",
            description: "Most static elements — set once for photo bursts",
            defaultCategories: [.background],
            allCategories: [.background, .props]
        ),
        CategoryGroup(
            title: "Framing & Composition",
            description: "Camera framing and composition settings",
            defaultCategories: [.framing],
            allCategories: [.framing, .perspective, .cameraAngle, .cameraType]
        ),
        CategoryGroup(
            title: "Aesthetic & Style",
            description: "Overall aesthetic, lighting, and mood",
            defaultCategories: [.aesthetic],
            allCategories: [.aesthetic, .lighting, .colorPalette, .texture, .mood, .photoStyle]
        ),
        CategoryGroup(
            title: "Clothes & Styling",
            description: "Outfits and styling accessories",
            defaultCategories: [.outfit, .outfitTop, .outfitBottom, .shoes, .jewelry, .hairAccessories, .bags, .brandDesigner],
            allCategories: [.outfit, .outfitTop, .outfitBottom, .shoes, .jewelry, .hairAccessories, .bags, .brandDesigner]
        ),
        CategoryGroup(
            title: "Face & Head",
            description: "Facial features, expressions, and hair",
            defaultCategories: [.facialExpression],
            allCategories: [.headPosition, .facialExpression, .eyes, .mouth, .hair]
        ),
        CategoryGroup(
            title: "Body & Pose",
            description: "Body positioning and pose — most dynamic",
            defaultCategories: [.bodyPose, .torso, .arms, .hands, .legs, .feet, .bodySize],
            allCategories: [.bodyPose, .torso, .arms, .hands, .legs, .feet, .bodySize]
        ),
    ]
}

// MARK: - Comprehensive Aesthetic Overrides

/// Categories auto-excluded when a comprehensive aesthetic is selected
let comprehensiveAestheticOverrides: Set<Category> = [
    .lighting,
    .colorPalette,
    .texture,
]

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
