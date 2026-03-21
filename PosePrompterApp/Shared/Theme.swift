import SwiftUI

enum Theme {
    // MARK: - Colors
    static let backgroundGradient = LinearGradient(
        colors: [
            Color(red: 0.06, green: 0.04, blue: 0.15),
            Color(red: 0.08, green: 0.06, blue: 0.22),
            Color(red: 0.05, green: 0.10, blue: 0.25)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let cardBackground = Color.white.opacity(0.07)
    static let cardBorder = Color.white.opacity(0.12)
    static let selectedAccent = Color(red: 0.55, green: 0.40, blue: 1.0)
    static let promptPreviewBg = Color(red: 0.12, green: 0.08, blue: 0.28)

    // MARK: - Group Colors
    static let bodyColor = Color(red: 0.90, green: 0.45, blue: 0.45)
    static let faceColor = Color(red: 0.95, green: 0.65, blue: 0.40)
    static let styleColor = Color(red: 0.55, green: 0.40, blue: 1.0)
    static let outfitColor = Color(red: 0.95, green: 0.50, blue: 0.70)
    static let cameraColor = Color(red: 0.30, green: 0.75, blue: 0.90)
    static let sceneColor = Color(red: 0.40, green: 0.85, blue: 0.55)

    // MARK: - Glass Card Modifier
    static func glassCard(cornerRadius: CGFloat = 16) -> some ViewModifier {
        GlassCardModifier(cornerRadius: cornerRadius)
    }
}

struct GlassCardModifier: ViewModifier {
    let cornerRadius: CGFloat

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Theme.cardBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .stroke(Theme.cardBorder, lineWidth: 0.5)
                    )
            )
    }
}

extension View {
    func glassCard(cornerRadius: CGFloat = 16) -> some View {
        modifier(GlassCardModifier(cornerRadius: cornerRadius))
    }
}
