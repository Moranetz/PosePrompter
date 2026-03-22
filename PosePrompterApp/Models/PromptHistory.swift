import Foundation
import SwiftData

@Model
final class PromptHistory {
    var promptText: String
    var selectionsSnapshot: [String: Int]
    var timestamp: Date
    var isFavorited: Bool

    init(promptText: String, selectionsSnapshot: [String: Int], timestamp: Date = .now, isFavorited: Bool = false) {
        self.promptText = promptText
        self.selectionsSnapshot = selectionsSnapshot
        self.timestamp = timestamp
        self.isFavorited = isFavorited
    }
}
