import Foundation
import SwiftData

@Model
final class GeneratedImage {
    var imageData: Data
    var prompt: String
    var modelUsed: String
    var timestamp: Date
    var isFavorited: Bool

    init(imageData: Data, prompt: String, modelUsed: String, timestamp: Date = .now, isFavorited: Bool = false) {
        self.imageData = imageData
        self.prompt = prompt
        self.modelUsed = modelUsed
        self.timestamp = timestamp
        self.isFavorited = isFavorited
    }
}
