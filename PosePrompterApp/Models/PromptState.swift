import Foundation
import SwiftUI

@Observable
final class PromptState {
    // Selected option index per category ID (nil = none selected)
    var selections: [String: Int?] = [:]
    // Locked categories that won't be randomized
    var locks: Set<String> = []

    private let selectionsKey = "PosePrompter_Selections"
    private let locksKey = "PosePrompter_Locks"

    init() {
        loadFromDefaults()
    }

    // MARK: - Computed

    var generatedPrompt: String {
        let allCats = AllCategories.allCategories
        var parts: [String] = []
        for cat in allCats {
            if let selectedIndex = selections[cat.id] as? Int,
               selectedIndex < cat.options.count {
                parts.append(cat.options[selectedIndex].prompt)
            }
        }
        return parts.joined(separator: " ")
    }

    var selectedCategoryCount: Int {
        selections.values.compactMap { $0 }.count
    }

    func selectedOption(for categoryId: String) -> PromptOption? {
        guard let index = selections[categoryId] as? Int else { return nil }
        guard let cat = AllCategories.allCategories.first(where: { $0.id == categoryId }) else { return nil }
        guard index < cat.options.count else { return nil }
        return cat.options[index]
    }

    // MARK: - Actions

    func select(category: String, index: Int?) {
        selections[category] = index
        saveToDefaults()
    }

    func randomize(category: String) {
        guard !locks.contains(category) else { return }
        guard let cat = AllCategories.allCategories.first(where: { $0.id == category }) else { return }
        guard !cat.options.isEmpty else { return }
        let randomIndex = Int.random(in: 0..<cat.options.count)
        selections[category] = randomIndex
        saveToDefaults()
    }

    func randomizeAll() {
        let allCats = AllCategories.allCategories
        for cat in allCats {
            if !locks.contains(cat.id) && !cat.options.isEmpty {
                let randomIndex = Int.random(in: 0..<cat.options.count)
                selections[cat.id] = randomIndex
            }
        }
        saveToDefaults()
    }

    func clearAll() {
        selections.removeAll()
        locks.removeAll()
        saveToDefaults()
    }

    func clear(category: String) {
        selections[category] = nil as Int?
        saveToDefaults()
    }

    func toggleLock(category: String) {
        if locks.contains(category) {
            locks.remove(category)
        } else {
            locks.insert(category)
        }
        saveToDefaults()
    }

    func isLocked(_ category: String) -> Bool {
        locks.contains(category)
    }

    // MARK: - Persistence

    private func saveToDefaults() {
        // Convert selections to a simpler format for storage
        var storable: [String: Int] = [:]
        for (key, value) in selections {
            if let idx = value {
                storable[key] = idx
            }
        }
        UserDefaults.standard.set(storable, forKey: selectionsKey)
        UserDefaults.standard.set(Array(locks), forKey: locksKey)
    }

    private func loadFromDefaults() {
        if let stored = UserDefaults.standard.dictionary(forKey: selectionsKey) as? [String: Int] {
            for (key, value) in stored {
                selections[key] = value
            }
        }
        if let storedLocks = UserDefaults.standard.stringArray(forKey: locksKey) {
            locks = Set(storedLocks)
        }
    }
}
