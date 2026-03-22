import Foundation
import SwiftData

@Model
final class SavedTemplate {
    var name: String
    var selectionsSnapshot: [String: Int]
    var createdAt: Date
    var updatedAt: Date

    init(name: String, selectionsSnapshot: [String: Int]) {
        self.name = name
        self.selectionsSnapshot = selectionsSnapshot
        self.createdAt = .now
        self.updatedAt = .now
    }
}
