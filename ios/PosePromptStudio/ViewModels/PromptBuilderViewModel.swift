//
//  PromptBuilderViewModel.swift
//  PosePromptStudio
//
//  Prompt building logic mirroring PhotoElementRandomizer.jsx
//

import Foundation
import SwiftUI

@MainActor
final class PromptBuilderViewModel: ObservableObject {

    // MARK: - Published Properties

    /// Currently selected option index per category
    @Published var selections: [Category: Int] = [:]

    /// Which categories are enabled for prompt assembly
    @Published var enabledCategories: Set<Category> = []

    /// All available options per category (built-in + custom)
    @Published var categoryOptions: [Category: [CategoryOption]] = [:]

    /// Saved prompt sets
    @Published var savedPromptSets: [PromptSet] = []

    /// Available presets
    @Published var presets: [Preset] = []

    /// Current preset index (for cycling)
    @Published var currentPresetIndex: Int = 0

    /// The assembled prompt text
    @Published var assembledPrompt: String = ""

    /// Undo/redo history
    @Published private(set) var canUndo: Bool = false
    @Published private(set) var canRedo: Bool = false

    /// Loading/error state
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    // MARK: - Private Properties

    private var undoStack: [[Category: Int]] = []
    private var redoStack: [[Category: Int]] = []
    private let maxUndoLevels = 50

    // Note: In production, inject a shared FirebaseService instance
    // rather than creating a separate one here
    private var firebaseService: FirebaseService?

    // MARK: - Initialization

    init() {
        setupDefaultCategories()
    }

    // MARK: - Setup

    /// Enable default categories from each group
    private func setupDefaultCategories() {
        for group in CategoryGroup.all {
            for category in group.defaultCategories {
                enabledCategories.insert(category)
            }
        }
    }

    // MARK: - Category Selection

    /// Get the currently selected option for a category
    func selectedOption(for category: Category) -> CategoryOption? {
        guard let index = selections[category],
              let options = categoryOptions[category],
              index >= 0, index < options.count else {
            return nil
        }
        return options[index]
    }

    /// Select a specific option index for a category
    func select(index: Int, for category: Category) {
        pushUndo()
        selections[category] = index
        assemblePrompt()
    }

    /// Randomize the selection for a single category
    func randomize(category: Category) {
        guard let options = categoryOptions[category], !options.isEmpty else { return }
        pushUndo()
        selections[category] = Int.random(in: 0..<options.count)
        assemblePrompt()
    }

    /// Randomize all enabled categories
    func randomizeAll() {
        pushUndo()
        for category in enabledCategories {
            guard let options = categoryOptions[category], !options.isEmpty else { continue }
            selections[category] = Int.random(in: 0..<options.count)
        }
        assemblePrompt()
    }

    /// Clear the selection for a category
    func clearSelection(for category: Category) {
        pushUndo()
        selections.removeValue(forKey: category)
        assemblePrompt()
    }

    /// Clear all selections
    func clearAll() {
        pushUndo()
        selections.removeAll()
        assembledPrompt = ""
    }

    // MARK: - Category Enable/Disable

    /// Toggle whether a category is included in prompt assembly
    func toggleCategory(_ category: Category) {
        if enabledCategories.contains(category) {
            enabledCategories.remove(category)
        } else {
            enabledCategories.insert(category)
        }
        assemblePrompt()
    }

    /// Check if a category is enabled
    func isCategoryEnabled(_ category: Category) -> Bool {
        enabledCategories.contains(category)
    }

    /// Check if a category is auto-excluded by a comprehensive aesthetic
    func isCategoryOverridden(_ category: Category) -> Bool {
        guard comprehensiveAestheticOverrides.contains(category) else { return false }
        guard let aestheticOption = selectedOption(for: .aesthetic) else { return false }
        return aestheticOption.isComprehensive
    }

    /// The effective set of categories contributing to the prompt
    var activeCategories: Set<Category> {
        var active = enabledCategories
        // Remove overridden categories when comprehensive aesthetic is selected
        if let aestheticOption = selectedOption(for: .aesthetic), aestheticOption.isComprehensive {
            active.subtract(comprehensiveAestheticOverrides)
        }
        return active
    }

    // MARK: - Prompt Assembly

    /// Assemble the full prompt from all active selections
    func assemblePrompt() {
        var parts: [(category: Category, prompt: String)] = []
        let active = activeCategories

        // Assemble in group order for consistent output
        for group in CategoryGroup.all {
            for category in group.allCategories {
                guard active.contains(category),
                      let option = selectedOption(for: category) else { continue }
                parts.append((category: category, prompt: option.prompt))
            }
        }

        assembledPrompt = parts.map(\.prompt).joined(separator: ". ")
    }

    /// Get the full assembly result with metadata
    func getAssemblyResult() -> PromptAssemblyResult {
        var categoryPrompts: [(category: Category, prompt: String)] = []
        let active = activeCategories
        var excluded = Set<Category>()

        for group in CategoryGroup.all {
            for category in group.allCategories {
                if isCategoryOverridden(category) {
                    excluded.insert(category)
                    continue
                }
                guard active.contains(category),
                      let option = selectedOption(for: category) else { continue }
                categoryPrompts.append((category: category, prompt: option.prompt))
            }
        }

        return PromptAssemblyResult(
            fullPrompt: categoryPrompts.map(\.prompt).joined(separator: ". "),
            categoryPrompts: categoryPrompts,
            excludedCategories: excluded,
            totalSelections: categoryPrompts.count
        )
    }

    // MARK: - Presets

    /// Load a preset by applying its entry ID mappings to selections
    func loadPreset(_ preset: Preset) {
        pushUndo()

        for category in Category.allCases {
            guard let entryId = preset.entryId(for: category),
                  let options = categoryOptions[category],
                  let index = options.firstIndex(where: { $0.id == entryId }) else {
                continue
            }
            selections[category] = index
            enabledCategories.insert(category)
        }

        assemblePrompt()
    }

    /// Cycle to the next preset
    func nextPreset() {
        guard !presets.isEmpty else { return }
        currentPresetIndex = (currentPresetIndex + 1) % presets.count
        loadPreset(presets[currentPresetIndex])
    }

    /// Cycle to the previous preset
    func previousPreset() {
        guard !presets.isEmpty else { return }
        currentPresetIndex = (currentPresetIndex - 1 + presets.count) % presets.count
        loadPreset(presets[currentPresetIndex])
    }

    /// The currently active preset (if any)
    var currentPreset: Preset? {
        guard !presets.isEmpty, currentPresetIndex < presets.count else { return nil }
        return presets[currentPresetIndex]
    }

    // MARK: - Undo/Redo

    private func pushUndo() {
        undoStack.append(selections)
        if undoStack.count > maxUndoLevels {
            undoStack.removeFirst()
        }
        redoStack.removeAll()
        canUndo = !undoStack.isEmpty
        canRedo = false
    }

    func undo() {
        guard let previous = undoStack.popLast() else { return }
        redoStack.append(selections)
        selections = previous
        canUndo = !undoStack.isEmpty
        canRedo = !redoStack.isEmpty
        assemblePrompt()
    }

    func redo() {
        guard let next = redoStack.popLast() else { return }
        undoStack.append(selections)
        selections = next
        canUndo = !undoStack.isEmpty
        canRedo = !redoStack.isEmpty
        assemblePrompt()
    }

    // MARK: - Save/Load Prompt Sets

    /// Save current selections as a named prompt set
    func savePromptSet(name: String, description: String = "") {
        let promptSet = PromptSet.create(
            name: name,
            description: description,
            selections: selections,
            includedCategories: Dictionary(
                uniqueKeysWithValues: Category.allCases.map { ($0, enabledCategories.contains($0)) }
            ),
            generatedPrompt: assembledPrompt
        )
        savedPromptSets.append(promptSet)
    }

    /// Load a saved prompt set
    func loadPromptSet(_ promptSet: PromptSet) {
        pushUndo()

        selections = Dictionary(
            uniqueKeysWithValues: promptSet.selections.compactMap { key, value in
                guard let category = Category(rawValue: key) else { return nil }
                return (category, value)
            }
        )

        enabledCategories = Set(
            promptSet.includedCategories.compactMap { key, value in
                guard value, let category = Category(rawValue: key) else { return nil }
                return category
            }
        )

        assemblePrompt()
    }

    /// Delete a saved prompt set
    func deletePromptSet(_ promptSet: PromptSet) {
        savedPromptSets.removeAll { $0.id == promptSet.id }
    }

    // MARK: - Custom Options

    /// Add a custom option to a category
    func addCustomOption(to category: Category, title: String, prompt: String) {
        let option = CategoryOption(
            id: "custom_\(Int(Date().timeIntervalSince1970 * 1000))_\(Int.random(in: 100_000...999_999))",
            title: title,
            prompt: prompt
        )
        categoryOptions[category, default: []].append(option)
    }

    // MARK: - Clipboard

    /// Copy the assembled prompt to the clipboard
    func copyPromptToClipboard() {
        UIPasteboard.general.string = assembledPrompt
    }

    // MARK: - Stats

    /// Number of categories with active selections
    var activeSelectionCount: Int {
        activeCategories.filter { selections[$0] != nil }.count
    }

    /// Total number of available options across all categories
    var totalOptionCount: Int {
        categoryOptions.values.reduce(0) { $0 + $1.count }
    }
}
