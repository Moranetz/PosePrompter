import SwiftUI

enum Theme {
    // MARK: - Colors — Halide-inspired: pure black + warm coral accent

    // Background: pure black, no gradients
    static let background = Color.black
    static let backgroundGradient = LinearGradient(
        colors: [Color.black, Color.black],
        startPoint: .top,
        endPoint: .bottom
    )

    // Surfaces
    static let cardBackground = Color(white: 0.09)
    static let cardBorder = Color(white: 0.16)
    static let surfaceRaised = Color(white: 0.12)

    // Accent: warm coral
    static let accent = Color(red: 0.91, green: 0.455, blue: 0.38)  // #E87461
    static let selectedAccent = accent

    // Prompt preview
    static let promptPreviewBg = Color(white: 0.06)

    // Text
    static let textPrimary = Color(white: 0.92)
    static let textSecondary = Color(white: 0.55)
    static let textTertiary = Color(white: 0.32)

    // MARK: - Group Colors — muted, desaturated, single-hue variations
    // All derived from the coral accent at different saturations
    static let bodyColor = Color(red: 0.91, green: 0.455, blue: 0.38)     // coral (accent)
    static let faceColor = Color(red: 0.85, green: 0.55, blue: 0.42)      // warm peach
    static let styleColor = Color(red: 0.78, green: 0.52, blue: 0.48)     // dusty rose
    static let outfitColor = Color(red: 0.72, green: 0.48, blue: 0.44)    // muted mauve
    static let cameraColor = Color(red: 0.65, green: 0.52, blue: 0.50)    // warm grey
    static let sceneColor = Color(red: 0.60, green: 0.56, blue: 0.52)     // stone
}

// MARK: - Card Modifier — clean, no glass, just subtle surface

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
