import SwiftUI
import SwiftData

struct HistoryView: View {
    @Environment(PromptState.self) private var state
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \PromptHistory.timestamp, order: .reverse) private var history: [PromptHistory]
    @State private var showFavoritesOnly = false
    @State private var copiedId: String?

    private var filtered: [PromptHistory] {
        showFavoritesOnly ? history.filter(\.isFavorited) : history
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                if filtered.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        LazyVStack(spacing: 10) {
                            ForEach(filtered) { entry in
                                historyCard(entry)
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 40)
                    }
                }
            }
            .navigationTitle("History")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        withAnimation(.spring(response: 0.25)) {
                            showFavoritesOnly.toggle()
                        }
                        HapticManager.light()
                    } label: {
                        Image(systemName: showFavoritesOnly ? "star.fill" : "star")
                            .foregroundStyle(showFavoritesOnly ? .yellow : .white.opacity(0.5))
                    }
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.largeTitle)
                .foregroundStyle(.white.opacity(0.2))
            Text(showFavoritesOnly ? "No favorites yet" : "No history yet")
                .font(.headline)
                .foregroundStyle(.white.opacity(0.4))
            Text("Prompts you copy will appear here")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.25))
        }
    }

    private func historyCard(_ entry: PromptHistory) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(entry.timestamp, style: .relative)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.35))
                Text("ago")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.35))
                Spacer()

                Button {
                    withAnimation(.spring(response: 0.2)) {
                        entry.isFavorited.toggle()
                    }
                    HapticManager.light()
                } label: {
                    Image(systemName: entry.isFavorited ? "star.fill" : "star")
                        .font(.caption)
                        .foregroundStyle(entry.isFavorited ? .yellow : .white.opacity(0.3))
                }
                .buttonStyle(.plain)
            }

            Text(entry.promptText)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.7))
                .lineLimit(4)
                .multilineTextAlignment(.leading)

            HStack(spacing: 10) {
                Button {
                    UIPasteboard.general.string = entry.promptText
                    copiedId = entry.id.hashValue.description
                    HapticManager.success()
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { copiedId = nil }
                } label: {
                    Label(
                        copiedId == entry.id.hashValue.description ? "Copied!" : "Copy",
                        systemImage: copiedId == entry.id.hashValue.description ? "checkmark" : "doc.on.doc"
                    )
                    .font(.caption2.weight(.medium))
                }
                .buttonStyle(.bordered)
                .tint(copiedId == entry.id.hashValue.description ? .green : .white.opacity(0.5))

                Button {
                    state.loadFromSnapshot(entry.selectionsSnapshot)
                    state.navigateToBuilder = true
                    HapticManager.medium()
                } label: {
                    Label("Load", systemImage: "arrow.right.circle")
                        .font(.caption2.weight(.medium))
                }
                .buttonStyle(.bordered)
                .tint(Theme.selectedAccent)

                Spacer()

                Button {
                    withAnimation {
                        modelContext.delete(entry)
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
}
