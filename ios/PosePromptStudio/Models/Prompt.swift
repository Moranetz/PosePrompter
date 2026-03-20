//
//  Prompt.swift
//  PosePromptStudio
//
//  Prompt data models matching the web app's Firestore schema
//

import Foundation

// MARK: - Prompt Set

/// A saved combination of selections across all 30 categories
/// Maps to the web app's savedPromptSets in Firestore
struct PromptSet: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var description: String

    /// Maps Category rawValue -> selected option index within that category
    var selections: [String: Int]

    /// Maps Category rawValue -> whether it's included in prompt assembly
    var includedCategories: [String: Bool]

    /// The fully assembled prompt text from all selected options
    var generatedPrompt: String

    var createdAt: Date
    var updatedAt: Date

    /// Create a new prompt set with a unique ID
    static func create(
        name: String,
        description: String = "",
        selections: [Category: Int] = [:],
        includedCategories: [Category: Bool] = [:],
        generatedPrompt: String = ""
    ) -> PromptSet {
        let timestamp = Int(Date().timeIntervalSince1970 * 1000)
        let random = String(Int.random(in: 100_000...999_999), radix: 36)
        return PromptSet(
            id: "set_\(timestamp)_\(random)",
            name: name,
            description: description,
            selections: Dictionary(uniqueKeysWithValues: selections.map { ($0.key.rawValue, $0.value) }),
            includedCategories: Dictionary(uniqueKeysWithValues: includedCategories.map { ($0.key.rawValue, $0.value) }),
            generatedPrompt: generatedPrompt,
            createdAt: Date(),
            updatedAt: Date()
        )
    }

    /// Get the selected index for a category
    func selectionIndex(for category: Category) -> Int? {
        selections[category.rawValue]
    }

    /// Check if a category is included in prompt assembly
    func isCategoryIncluded(_ category: Category) -> Bool {
        includedCategories[category.rawValue] ?? true
    }
}

// MARK: - Custom Option

/// A user-created prompt option added to a category
/// Maps to the web app's customOptions in Firestore
struct CustomOption: Codable, Identifiable, Equatable {
    let id: String
    var title: String
    var text: String
    var createdAt: Date

    /// Convert to CategoryOption for display
    var asCategoryOption: CategoryOption {
        CategoryOption(id: id, title: title, prompt: text)
    }

    static func create(title: String, text: String) -> CustomOption {
        let timestamp = Int(Date().timeIntervalSince1970 * 1000)
        let random = String(Int.random(in: 100_000_000...999_999_999), radix: 36)
        return CustomOption(
            id: "custom_\(timestamp)_\(random)",
            title: title,
            text: text,
            createdAt: Date()
        )
    }
}

// MARK: - Preset

/// A curated combination of entry IDs mapping original prompts to decomposed entries
/// Maps to the web app's presets.js
struct Preset: Codable, Identifiable, Equatable {
    let id: String
    let title: String

    /// Maps Category rawValue -> entry ID (e.g., "Aesthetic" -> "aesthetic_073")
    let entries: [String: String]

    /// Get the entry ID for a given category
    func entryId(for category: Category) -> String? {
        entries[category.rawValue]
    }

    /// Whether this preset uses a comprehensive aesthetic (only Aesthetic entry)
    var isComprehensive: Bool {
        entries.count == 1 && entries.keys.first == Category.aesthetic.rawValue
    }
}

// MARK: - Prompt Assembly Result

/// The result of assembling a prompt from selected options
struct PromptAssemblyResult {
    let fullPrompt: String
    let categoryPrompts: [(category: Category, prompt: String)]
    let excludedCategories: Set<Category>
    let totalSelections: Int
}
