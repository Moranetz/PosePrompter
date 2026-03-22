import SwiftUI
import SwiftData

struct PromptPreviewView: View {
    @Environment(PromptState.self) private var state
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @State private var copiedFeedback = false
    @State private var shareImage: UIImage?

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        fullPromptSection
                        contributingCategoriesSection
                    }
                    .padding()
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Prompt Preview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(.white.opacity(0.7))
                }
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 12) {
                        Button {
                            copyPrompt()
                        } label: {
                            Image(systemName: copiedFeedback ? "checkmark" : "doc.on.doc")
                                .foregroundStyle(copiedFeedback ? .green : .white.opacity(0.7))
                        }

                        if let image = shareImage {
                            ShareLink(item: Image(uiImage: image), preview: SharePreview("Prompt", image: Image(uiImage: image))) {
                                Image(systemName: "square.and.arrow.up")
                                    .foregroundStyle(.white.opacity(0.7))
                            }
                        } else {
                            ShareLink(item: state.generatedPrompt) {
                                Image(systemName: "square.and.arrow.up")
                                    .foregroundStyle(.white.opacity(0.7))
                            }
                        }
                    }
                }
            }
            .onAppear {
                shareImage = renderShareCard(state: state)
            }
        }
    }

    private var fullPromptSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "text.quote")
                    .foregroundStyle(Theme.selectedAccent)
                Text("Full Prompt")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(.white)
                Spacer()

                Text("\(state.generatedPrompt.count) chars")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.4))
            }

            if state.generatedPrompt.isEmpty {
                Text("No selections made yet. Go back and select some options or tap Randomize All.")
                    .font(.callout)
                    .foregroundStyle(.white.opacity(0.4))
                    .italic()
            } else {
                Text(state.highlightedPrompt)
                    .font(.callout)
                    .textSelection(.enabled)
                    .lineSpacing(4)
            }

            if !state.generatedPrompt.isEmpty {
                Button {
                    copyPrompt()
                } label: {
                    Label(copiedFeedback ? "Copied to Clipboard!" : "Copy Full Prompt", systemImage: copiedFeedback ? "checkmark.circle.fill" : "doc.on.doc.fill")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(copiedFeedback ? .green : Theme.selectedAccent)
                .controlSize(.regular)
            }
        }
        .padding(16)
        .glassCard(cornerRadius: 20)
    }

    private var contributingCategoriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Contributing Categories")
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)
                .padding(.horizontal, 4)

            let activeCats = AllCategories.allCategories.filter { state.selectedOption(for: $0.id) != nil }

            if activeCats.isEmpty {
                Text("No categories selected")
                    .font(.callout)
                    .foregroundStyle(.white.opacity(0.4))
                    .padding(.horizontal, 4)
            } else {
                ForEach(activeCats) { cat in
                    if let option = state.selectedOption(for: cat.id) {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Image(systemName: cat.icon)
                                    .font(.caption)
                                    .foregroundStyle(cat.groupColor)
                                Text(cat.name)
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(cat.groupColor)
                                Spacer()
                                Text(option.title)
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.5))
                                    .lineLimit(1)
                            }
                            Text(option.prompt)
                                .font(.caption2)
                                .foregroundStyle(.white.opacity(0.4))
                                .lineLimit(2)
                        }
                        .padding(10)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(cat.groupColor.opacity(0.06))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(cat.groupColor.opacity(0.15), lineWidth: 0.5)
                                )
                        )
                    }
                }
            }
        }
    }

    private func copyPrompt() {
        UIPasteboard.general.string = state.generatedPrompt
        copiedFeedback = true
        HapticManager.success()

        let entry = PromptHistory(
            promptText: state.generatedPrompt,
            selectionsSnapshot: state.selectionsSnapshot
        )
        modelContext.insert(entry)

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            copiedFeedback = false
        }
    }
}
