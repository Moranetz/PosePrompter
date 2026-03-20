//
//  PromptBuilderViewModel.swift
//  PosePromptStudio
//
//  ViewModel for building AI prompts
//

import Foundation
import SwiftUI

@MainActor
final class PromptBuilderViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var selections = PromptSelections()
    @Published var promptName: String = ""
    @Published var generatedText: String = ""
    @Published var generatedImageURL: String?
    @Published var isGenerating = false
    @Published var isSaving = false
    @Published var errorMessage: String?
    
    // MARK: - Services
    
    private let apiService = APIService.shared
    private let firebaseService = FirebaseService()
    private let categoryManager = CategoryManager.shared
    
    // MARK: - Selection Methods
    
    func updateSelection(category: CategoryKey, index: Int) {
        switch category {
        // Body Pose
        case .bodyPose: selections.bodyPose = index
        case .torso: selections.torso = index
        case .arms: selections.arms = index
        case .hands: selections.hands = index
        case .legs: selections.legs = index
        case .feet: selections.feet = index
        case .bodySize: selections.bodySize = index
            
        // Face & Head
        case .headPosition: selections.headPosition = index
        case .facialExpression: selections.facialExpression = index
        case .eyes: selections.eyes = index
        case .mouth: selections.mouth = index
        case .hair: selections.hair = index
            
        // Clothes & Styling
        case .outfit: selections.outfit = index
        case .outfitTop: selections.outfitTop = index
        case .outfitBottom: selections.outfitBottom = index
        case .shoes: selections.shoes = index
        case .jewelry: selections.jewelry = index
        case .hairAccessories: selections.hairAccessories = index
        case .bags: selections.bags = index
        case .brandDesigner: selections.brandDesigner = index
            
        // Background & Environment
        case .background: selections.background = index
        case .props: selections.props = index
            
        // Framing & Composition
        case .framing: selections.framing = index
        case .perspective: selections.perspective = index
        case .cameraAngle: selections.cameraAngle = index
        case .cameraType: selections.cameraType = index
            
        // Aesthetic & Style
        case .aesthetic: selections.aesthetic = index
        case .lighting: selections.lighting = index
        case .colorPalette: selections.colorPalette = index
        case .texture: selections.texture = index
        case .mood: selections.mood = index
        case .photoStyle: selections.photoStyle = index
        }
        
        // Regenerate prompt text
        generatePromptText()
    }
    
    func getSelection(for category: CategoryKey) -> Int {
        switch category {
        // Body Pose
        case .bodyPose: return selections.bodyPose ?? 0
        case .torso: return selections.torso ?? 0
        case .arms: return selections.arms ?? 0
        case .hands: return selections.hands ?? 0
        case .legs: return selections.legs ?? 0
        case .feet: return selections.feet ?? 0
        case .bodySize: return selections.bodySize ?? 0
            
        // Face & Head
        case .headPosition: return selections.headPosition ?? 0
        case .facialExpression: return selections.facialExpression ?? 0
        case .eyes: return selections.eyes ?? 0
        case .mouth: return selections.mouth ?? 0
        case .hair: return selections.hair ?? 0
            
        // Clothes & Styling
        case .outfit: return selections.outfit ?? 0
        case .outfitTop: return selections.outfitTop ?? 0
        case .outfitBottom: return selections.outfitBottom ?? 0
        case .shoes: return selections.shoes ?? 0
        case .jewelry: return selections.jewelry ?? 0
        case .hairAccessories: return selections.hairAccessories ?? 0
        case .bags: return selections.bags ?? 0
        case .brandDesigner: return selections.brandDesigner ?? 0
            
        // Background & Environment
        case .background: return selections.background ?? 0
        case .props: return selections.props ?? 0
            
        // Framing & Composition
        case .framing: return selections.framing ?? 0
        case .perspective: return selections.perspective ?? 0
        case .cameraAngle: return selections.cameraAngle ?? 0
        case .cameraType: return selections.cameraType ?? 0
            
        // Aesthetic & Style
        case .aesthetic: return selections.aesthetic ?? 0
        case .lighting: return selections.lighting ?? 0
        case .colorPalette: return selections.colorPalette ?? 0
        case .texture: return selections.texture ?? 0
        case .mood: return selections.mood ?? 0
        case .photoStyle: return selections.photoStyle ?? 0
        }
    }
    
    // MARK: - Prompt Generation
    
    func generatePromptText() {
        var components: [String] = []
        
        // Build prompt from selections
        for category in CategoryKey.allCases {
            let index = getSelection(for: category)
            if let option = categoryManager.getOption(for: category, at: index) {
                components.append(option.title)
            }
        }
        
        generatedText = components.joined(separator: ", ")
    }
    
    func randomizeAll() {
        for category in CategoryKey.allCases {
            let options = categoryManager.getOptions(for: category)
            guard !options.isEmpty else { continue }
            let randomIndex = Int.random(in: 0..<options.count)
            updateSelection(category: category, index: randomIndex)
        }
    }
    
    func randomize(section: CategorySection) {
        for category in section.categories {
            let options = categoryManager.getOptions(for: category)
            guard !options.isEmpty else { continue }
            let randomIndex = Int.random(in: 0..<options.count)
            updateSelection(category: category, index: randomIndex)
        }
    }
    
    func reset() {
        selections = PromptSelections()
        generatedText = ""
        generatedImageURL = nil
        generatePromptText()
    }
    
    // MARK: - AI Generation
    
    func generateImage() async {
        isGenerating = true
        errorMessage = nil
        
        do {
            // TODO: Call your AI image generation API
            // This should match your backend endpoint
            
            struct GenerateImageRequest: Codable {
                let prompt: String
                let selections: PromptSelections
            }
            
            struct GenerateImageResponse: Codable {
                let imageURL: String
                let prompt: String
            }
            
            let request = GenerateImageRequest(
                prompt: generatedText,
                selections: selections
            )
            
            let response: GenerateImageResponse = try await apiService.request(
                endpoint: "/api/generate-image",
                method: .post,
                body: request
            )
            
            generatedImageURL = response.imageURL
            
        } catch {
            errorMessage = "Failed to generate image: \(error.localizedDescription)"
        }
        
        isGenerating = false
    }
    
    // MARK: - Save/Load
    
    func savePrompt() async {
        guard let userId = firebaseService.currentUser?.id else {
            errorMessage = "You must be logged in to save prompts"
            return
        }
        
        isSaving = true
        errorMessage = nil
        
        do {
            let prompt = Prompt(
                id: UUID().uuidString,
                name: promptName.isEmpty ? "Untitled Prompt" : promptName,
                createdAt: Date(),
                createdBy: userId,
                selections: selections,
                generatedImageURL: generatedImageURL,
                generatedText: generatedText,
                isFavorite: false,
                tags: nil,
                isPublic: false
            )
            
            // Save to Firestore
            try await firebaseService.addDocument(
                to: "prompts",
                data: prompt,
                documentId: prompt.id
            )
            
            // Also save to backend if needed
            try await apiService.request(
                endpoint: "/api/prompts",
                method: .post,
                body: prompt
            )
            
        } catch {
            errorMessage = "Failed to save prompt: \(error.localizedDescription)"
        }
        
        isSaving = false
    }
    
    func loadPrompt(_ prompt: Prompt) {
        selections = prompt.selections
        promptName = prompt.name ?? ""
        generatedText = prompt.generatedText ?? ""
        generatedImageURL = prompt.generatedImageURL
        generatePromptText()
    }
}
