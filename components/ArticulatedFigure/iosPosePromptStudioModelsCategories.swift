//
//  Categories.swift
//  PosePromptStudio
//
//  Category definitions matching web app structure
//

import Foundation

// MARK: - Category Registry

enum CategoryKey: String, CaseIterable {
    // Body Pose (7)
    case bodyPose = "BodyPose"
    case torso = "Torso"
    case arms = "Arms"
    case hands = "Hands"
    case legs = "Legs"
    case feet = "Feet"
    case bodySize = "BodySize"
    
    // Face & Head (5)
    case headPosition = "HeadPosition"
    case facialExpression = "FacialExpression"
    case eyes = "Eyes"
    case mouth = "Mouth"
    case hair = "Hair"
    
    // Clothes & Styling (8)
    case outfit = "Outfit"
    case outfitTop = "OutfitTop"
    case outfitBottom = "OutfitBottom"
    case shoes = "Shoes"
    case jewelry = "Jewelry"
    case hairAccessories = "HairAccessories"
    case bags = "Bags"
    case brandDesigner = "BrandDesigner"
    
    // Background & Environment (2)
    case background = "Background"
    case props = "Props"
    
    // Framing & Composition (4)
    case framing = "Framing"
    case perspective = "Perspective"
    case cameraAngle = "CameraAngle"
    case cameraType = "CameraType"
    
    // Aesthetic & Style (6)
    case aesthetic = "Aesthetic"
    case lighting = "Lighting"
    case colorPalette = "ColorPalette"
    case texture = "Texture"
    case mood = "Mood"
    case photoStyle = "PhotoStyle"
    
    var displayName: String {
        // Convert camelCase to Title Case with spaces
        let result = rawValue.replacingOccurrences(
            of: "([A-Z])",
            with: " $1",
            options: .regularExpression
        ).trimmingCharacters(in: .whitespaces)
        return result.prefix(1).uppercased() + result.dropFirst()
    }
    
    var section: CategorySection {
        switch self {
        case .bodyPose, .torso, .arms, .hands, .legs, .feet, .bodySize:
            return .bodyPose
        case .headPosition, .facialExpression, .eyes, .mouth, .hair:
            return .faceHead
        case .outfit, .outfitTop, .outfitBottom, .shoes, .jewelry, .hairAccessories, .bags, .brandDesigner:
            return .clothesStyling
        case .background, .props:
            return .backgroundEnvironment
        case .framing, .perspective, .cameraAngle, .cameraType:
            return .framingComposition
        case .aesthetic, .lighting, .colorPalette, .texture, .mood, .photoStyle:
            return .aestheticStyle
        }
    }
}

// MARK: - Category Sections

enum CategorySection: String, CaseIterable {
    case bodyPose = "Body & Pose"
    case faceHead = "Face & Head"
    case clothesStyling = "Clothes & Styling"
    case backgroundEnvironment = "Background & Environment"
    case framingComposition = "Framing & Composition"
    case aestheticStyle = "Aesthetic & Style"
    
    var icon: String {
        switch self {
        case .bodyPose: return "figure.walk"
        case .faceHead: return "face.smiling"
        case .clothesStyling: return "tshirt"
        case .backgroundEnvironment: return "photo.on.rectangle"
        case .framingComposition: return "camera.viewfinder"
        case .aestheticStyle: return "paintpalette"
        }
    }
    
    var categories: [CategoryKey] {
        CategoryKey.allCases.filter { $0.section == self }
    }
}

// MARK: - Category Manager

@MainActor
class CategoryManager: ObservableObject {
    
    @Published var categories: [CategoryKey: [CategoryOption]] = [:]
    @Published var isLoading = false
    @Published var error: Error?
    
    static let shared = CategoryManager()
    
    private init() {
        // Initialize with placeholder data
        // In production, fetch from backend
        loadPlaceholderCategories()
    }
    
    func loadCategories() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            // TODO: Fetch categories from backend
            // For now, use placeholders
            loadPlaceholderCategories()
        } catch {
            self.error = error
        }
    }
    
    private func loadPlaceholderCategories() {
        // Body Pose
        categories[.bodyPose] = [
            CategoryOption(title: "Standing", description: "Standing upright", keywords: ["standing", "upright"]),
            CategoryOption(title: "Sitting", description: "Sitting pose", keywords: ["sitting", "seated"]),
            CategoryOption(title: "Walking", description: "Walking motion", keywords: ["walking", "motion"]),
            CategoryOption(title: "Running", description: "Running pose", keywords: ["running", "athletic"])
        ]
        
        categories[.torso] = [
            CategoryOption(title: "Straight", description: nil, keywords: nil),
            CategoryOption(title: "Twisted", description: nil, keywords: nil),
            CategoryOption(title: "Leaning", description: nil, keywords: nil)
        ]
        
        categories[.arms] = [
            CategoryOption(title: "At Sides", description: nil, keywords: nil),
            CategoryOption(title: "Crossed", description: nil, keywords: nil),
            CategoryOption(title: "Raised", description: nil, keywords: nil),
            CategoryOption(title: "On Hips", description: nil, keywords: nil)
        ]
        
        categories[.hands] = [
            CategoryOption(title: "Relaxed", description: nil, keywords: nil),
            CategoryOption(title: "Fists", description: nil, keywords: nil),
            CategoryOption(title: "Pointing", description: nil, keywords: nil),
            CategoryOption(title: "Holding Object", description: nil, keywords: nil)
        ]
        
        categories[.legs] = [
            CategoryOption(title: "Together", description: nil, keywords: nil),
            CategoryOption(title: "Spread", description: nil, keywords: nil),
            CategoryOption(title: "Crossed", description: nil, keywords: nil)
        ]
        
        categories[.feet] = [
            CategoryOption(title: "Flat", description: nil, keywords: nil),
            CategoryOption(title: "On Toes", description: nil, keywords: nil),
            CategoryOption(title: "Crossed", description: nil, keywords: nil)
        ]
        
        categories[.bodySize] = [
            CategoryOption(title: "Slim", description: nil, keywords: nil),
            CategoryOption(title: "Average", description: nil, keywords: nil),
            CategoryOption(title: "Athletic", description: nil, keywords: nil),
            CategoryOption(title: "Plus Size", description: nil, keywords: nil)
        ]
        
        // Face & Head
        categories[.headPosition] = [
            CategoryOption(title: "Straight", description: nil, keywords: nil),
            CategoryOption(title: "Tilted", description: nil, keywords: nil),
            CategoryOption(title: "Looking Up", description: nil, keywords: nil),
            CategoryOption(title: "Looking Down", description: nil, keywords: nil)
        ]
        
        categories[.facialExpression] = [
            CategoryOption(title: "Neutral", description: nil, keywords: nil),
            CategoryOption(title: "Smiling", description: nil, keywords: nil),
            CategoryOption(title: "Serious", description: nil, keywords: nil),
            CategoryOption(title: "Laughing", description: nil, keywords: nil)
        ]
        
        categories[.eyes] = [
            CategoryOption(title: "Looking at Camera", description: nil, keywords: nil),
            CategoryOption(title: "Looking Away", description: nil, keywords: nil),
            CategoryOption(title: "Eyes Closed", description: nil, keywords: nil)
        ]
        
        categories[.mouth] = [
            CategoryOption(title: "Closed", description: nil, keywords: nil),
            CategoryOption(title: "Slight Smile", description: nil, keywords: nil),
            CategoryOption(title: "Open Smile", description: nil, keywords: nil)
        ]
        
        categories[.hair] = [
            CategoryOption(title: "Short", description: nil, keywords: nil),
            CategoryOption(title: "Long", description: nil, keywords: nil),
            CategoryOption(title: "Curly", description: nil, keywords: nil),
            CategoryOption(title: "Straight", description: nil, keywords: nil)
        ]
        
        // Aesthetic & Style
        categories[.aesthetic] = [
            CategoryOption(title: "Modern", description: nil, keywords: nil),
            CategoryOption(title: "Vintage", description: nil, keywords: nil),
            CategoryOption(title: "Minimalist", description: nil, keywords: nil),
            CategoryOption(title: "Dramatic", description: nil, keywords: nil)
        ]
        
        categories[.lighting] = [
            CategoryOption(title: "Natural", description: nil, keywords: nil),
            CategoryOption(title: "Studio", description: nil, keywords: nil),
            CategoryOption(title: "Dramatic", description: nil, keywords: nil),
            CategoryOption(title: "Soft", description: nil, keywords: nil)
        ]
        
        categories[.mood] = [
            CategoryOption(title: "Happy", description: nil, keywords: nil),
            CategoryOption(title: "Serious", description: nil, keywords: nil),
            CategoryOption(title: "Mysterious", description: nil, keywords: nil),
            CategoryOption(title: "Energetic", description: nil, keywords: nil)
        ]
        
        // Framing & Composition
        categories[.framing] = [
            CategoryOption(title: "Full Body", description: nil, keywords: nil),
            CategoryOption(title: "Portrait", description: nil, keywords: nil),
            CategoryOption(title: "Close-up", description: nil, keywords: nil),
            CategoryOption(title: "Medium Shot", description: nil, keywords: nil)
        ]
        
        categories[.cameraAngle] = [
            CategoryOption(title: "Eye Level", description: nil, keywords: nil),
            CategoryOption(title: "High Angle", description: nil, keywords: nil),
            CategoryOption(title: "Low Angle", description: nil, keywords: nil)
        ]
        
        // Add more placeholder categories as needed
        // In production, these should come from your backend API
    }
    
    func getOptions(for category: CategoryKey) -> [CategoryOption] {
        return categories[category] ?? []
    }
    
    func getOption(for category: CategoryKey, at index: Int) -> CategoryOption? {
        let options = getOptions(for: category)
        guard index >= 0 && index < options.count else { return nil }
        return options[index]
    }
}
