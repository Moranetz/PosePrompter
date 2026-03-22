import SwiftUI

struct ShareCardView: View {
    let highlightedPrompt: AttributedString
    let categoryCount: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .font(.title3)
                    .foregroundStyle(Theme.selectedAccent)
                Text("Pose Prompter")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
                Spacer()
                Text("\(categoryCount) categories")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Theme.selectedAccent)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Theme.selectedAccent.opacity(0.15), in: Capsule())
            }

            Divider()
                .background(.white.opacity(0.1))

            // Prompt text
            Text(highlightedPrompt)
                .font(.callout)
                .lineSpacing(4)

            Spacer(minLength: 8)

            // Footer
            HStack {
                Text("Made with Pose Prompter")
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(.white.opacity(0.25))
                Spacer()
                Image(systemName: "camera.aperture")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.15))
            }
        }
        .padding(24)
        .frame(width: 380)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.black)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Theme.cardBorder, lineWidth: 1)
                )
        )
    }
}

@MainActor
func renderShareCard(state: PromptState) -> UIImage? {
    let view = ShareCardView(
        highlightedPrompt: state.highlightedPrompt,
        categoryCount: state.selectedCategoryCount
    )
    let renderer = ImageRenderer(content: view)
    renderer.scale = UIScreen.main.scale
    return renderer.uiImage
}
