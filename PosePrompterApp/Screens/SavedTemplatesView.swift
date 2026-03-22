import SwiftUI
import SwiftData

struct SavedTemplatesView: View {
    @Environment(PromptState.self) private var state
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \SavedTemplate.updatedAt, order: .reverse) private var templates: [SavedTemplate]
    @State private var showSaveAlert = false
    @State private var newTemplateName = ""

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                if templates.isEmpty && state.selectedCategoryCount == 0 {
                    emptyState
                } else {
                    ScrollView {
                        VStack(spacing: 12) {
                            if state.selectedCategoryCount > 0 {
                                saveCurrentButton
                            }
                            ForEach(templates) { template in
                                templateCard(template)
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 40)
                    }
                }
            }
            .navigationTitle("My Templates")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(.white.opacity(0.7))
                }
            }
            .alert("Save Template", isPresented: $showSaveAlert) {
                TextField("Template name", text: $newTemplateName)
                Button("Save") {
                    guard !newTemplateName.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                    let template = SavedTemplate(name: newTemplateName, selectionsSnapshot: state.selectionsSnapshot)
                    modelContext.insert(template)
                    newTemplateName = ""
                    HapticManager.success()
                }
                Button("Cancel", role: .cancel) { newTemplateName = "" }
            } message: {
                Text("Name your current prompt configuration")
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "bookmark")
                .font(.largeTitle)
                .foregroundStyle(.white.opacity(0.2))
            Text("No templates saved")
                .font(.headline)
                .foregroundStyle(.white.opacity(0.4))
            Text("Build a prompt, then save it here")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.25))
        }
    }

    private var saveCurrentButton: some View {
        Button {
            showSaveAlert = true
            HapticManager.light()
        } label: {
            Label("Save Current Prompt", systemImage: "plus.circle.fill")
                .font(.subheadline.weight(.semibold))
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.borderedProminent)
        .tint(Theme.selectedAccent)
        .controlSize(.regular)
    }

    private func templateCard(_ template: SavedTemplate) -> some View {
        let previewPrompt = previewText(for: template)

        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(template.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                Spacer()
                Text(template.updatedAt, style: .date)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.3))
            }

            Text(previewPrompt)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.5))
                .lineLimit(3)

            HStack(spacing: 10) {
                Button {
                    state.loadFromSnapshot(template.selectionsSnapshot)
                    dismiss()
                    HapticManager.medium()
                } label: {
                    Label("Load", systemImage: "arrow.right.circle")
                        .font(.caption2.weight(.medium))
                }
                .buttonStyle(.bordered)
                .tint(Theme.selectedAccent)

                Button {
                    template.selectionsSnapshot = state.selectionsSnapshot
                    template.updatedAt = .now
                    HapticManager.success()
                } label: {
                    Label("Update", systemImage: "arrow.triangle.2.circlepath")
                        .font(.caption2.weight(.medium))
                }
                .buttonStyle(.bordered)
                .tint(.white.opacity(0.5))

                Spacer()

                Button {
                    withAnimation {
                        modelContext.delete(template)
                    }
                    HapticManager.light()
                } label: {
                    Image(systemName: "trash")
                        .font(.caption2)
                        .foregroundStyle(.red.opacity(0.5))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(14)
        .glassCard(cornerRadius: 14)
    }

    private func previewText(for template: SavedTemplate) -> String {
        var parts: [String] = []
        for cat in AllCategories.allCategories {
            if let idx = template.selectionsSnapshot[cat.id],
               idx < cat.options.count {
                parts.append(cat.options[idx].prompt)
            }
        }
        return parts.joined(separator: " ")
    }
}
