import Foundation
import SwiftUI

@Observable
final class PromptState {
    var selections: [String: Int?] = [:]
    var locks: Set<String> = []

    // Preset cycling
    var currentPresetIndex: Int? = nil
    // Navigation trigger for "Use as Template"
    var navigateToBuilder = false

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

    var highlightedPrompt: AttributedString {
        let allCats = AllCategories.allCategories
        var result = AttributedString()
        var isFirst = true
        for cat in allCats {
            if let selectedIndex = selections[cat.id] as? Int,
               selectedIndex < cat.options.count {
                if !isFirst {
                    result.append(AttributedString(" "))
                }
                var segment = AttributedString(cat.options[selectedIndex].prompt)
                segment.foregroundColor = cat.groupColor
                result.append(segment)
                isFirst = false
            }
        }
        return result
    }

    var selectedCategoryCount: Int {
        selections.values.compactMap { $0 }.count
    }

    /// Clean snapshot for saving to SwiftData
    var selectionsSnapshot: [String: Int] {
        var snap: [String: Int] = [:]
        for (key, value) in selections {
            if let idx = value { snap[key] = idx }
        }
        return snap
    }

    var currentPresetName: String? {
        guard let idx = currentPresetIndex,
              idx >= 0, idx < DiscoverPost.samples.count else { return nil }
        return DiscoverPost.samples[idx].title
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
        currentPresetIndex = nil
        saveToDefaults()
    }

    func randomize(category: String) {
        guard !locks.contains(category) else { return }
        guard let cat = AllCategories.allCategories.first(where: { $0.id == category }) else { return }
        guard !cat.options.isEmpty else { return }
        selections[category] = Int.random(in: 0..<cat.options.count)
        currentPresetIndex = nil
        saveToDefaults()
    }

    func randomizeAll() {
        for cat in AllCategories.allCategories {
            if !locks.contains(cat.id) && !cat.options.isEmpty {
                selections[cat.id] = Int.random(in: 0..<cat.options.count)
            }
        }
        currentPresetIndex = nil
        saveToDefaults()
    }

    func clearAll() {
        selections.removeAll()
        locks.removeAll()
        currentPresetIndex = nil
        saveToDefaults()
    }

    func clear(category: String) {
        selections[category] = nil as Int?
        currentPresetIndex = nil
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

    // MARK: - Preset Loading

    func loadFromPreset(entryIDs: [String]) {
        selections.removeAll()
        let allCats = AllCategories.allCategories
        for entryID in entryIDs {
            for cat in allCats {
                if let idx = cat.options.firstIndex(where: { $0.id == entryID }) {
                    selections[cat.id] = idx
                    break
                }
            }
        }
        saveToDefaults()
    }

    func loadFromPresetAtIndex(_ index: Int) {
        guard index >= 0, index < DiscoverPost.samples.count else { return }
        let post = DiscoverPost.samples[index]
        loadFromPreset(entryIDs: post.entryIDs)
        currentPresetIndex = index
    }

    func nextPreset() {
        let total = DiscoverPost.samples.count
        guard total > 0 else { return }
        let next = ((currentPresetIndex ?? -1) + 1) % total
        loadFromPresetAtIndex(next)
    }

    func previousPreset() {
        let total = DiscoverPost.samples.count
        guard total > 0 else { return }
        let prev = ((currentPresetIndex ?? 1) - 1 + total) % total
        loadFromPresetAtIndex(prev)
    }

    func loadFromSnapshot(_ snapshot: [String: Int]) {
        selections.removeAll()
        for (key, value) in snapshot {
            selections[key] = value
        }
        currentPresetIndex = nil
        saveToDefaults()
    }

    // MARK: - Persistence

    private func saveToDefaults() {
        UserDefaults.standard.set(selectionsSnapshot, forKey: selectionsKey)
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
