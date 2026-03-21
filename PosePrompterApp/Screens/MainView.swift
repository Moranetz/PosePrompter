import SwiftUI

struct MainView: View {
    @Environment(PromptState.self) private var state
    @State private var expandedGroups: Set<String> = ["Body"]  // Only first group expanded by default
    @State private var showPromptPreview = false
    @State private var copiedFeedback = false
    @State private var selectedCategory: PromptCategory?

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        promptPreviewCard
                        actionBar
                        categoryGroupsList
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Pose Prompter")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .sheet(item: $selectedCategory) { category in
                CategoryPickerView(category: category)
                    .environment(state)
            }
            .sheet(isPresented: $showPromptPreview) {
                PromptPreviewView()
                    .environment(state)
            }
        }
    }

    // MARK: - Prompt Preview Card

    private var promptPreviewCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "text.quote")
                    .foregroundStyle(Theme.selectedAccent)
                Text("Generated Prompt")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.8))
                Spacer()
                if state.selectedCategoryCount > 0 {
                    Text("\(state.selectedCategoryCount) active")
                        .font(.caption)
                        .foregroundStyle(Theme.selectedAccent)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Theme.selectedAccent.opacity(0.15), in: Capsule())
                }
            }

            if state.generatedPrompt.isEmpty {
                Text("Tap categories below or hit Randomize to build your prompt...")
                    .font(.callout)
                    .foregroundStyle(.white.opacity(0.35))
                    .italic()
            } else {
                Text(state.generatedPrompt)
                    .font(.callout)
                    .foregroundStyle(.white.opacity(0.75))
                    .lineLimit(4)
                    .onTapGesture {
                        showPromptPreview = true
                    }

                HStack(spacing: 12) {
                    Button {
                        showPromptPreview = true
                    } label: {
                        Label("Expand", systemImage: "arrow.up.left.and.arrow.down.right")
                            .font(.caption.weight(.medium))
                    }
                    .buttonStyle(.bordered)
                    .tint(Theme.selectedAccent)

                    Button {
                        copyPrompt()
                    } label: {
                        Label(copiedFeedback ? "Copied!" : "Copy", systemImage: copiedFeedback ? "checkmark" : "doc.on.doc")
                            .font(.caption.weight(.medium))
                    }
                    .buttonStyle(.bordered)
                    .tint(copiedFeedback ? .green : .white.opacity(0.7))
                }
            }
        }
        .padding(16)
        .glassCard(cornerRadius: 20)
        .padding(.top, 8)
    }

    // MARK: - Action Bar

    private var actionBar: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                    state.randomizeAll()
                }
            } label: {
                Label("Randomize All", systemImage: "dice.fill")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.selectedAccent)
            .controlSize(.regular)

            Button {
                withAnimation(.spring(response: 0.3)) {
                    state.clearAll()
                }
            } label: {
                Label("Clear", systemImage: "xmark.circle")
                    .font(.subheadline.weight(.medium))
            }
            .buttonStyle(.bordered)
            .tint(.white.opacity(0.6))
            .controlSize(.regular)
        }
    }

    // MARK: - Category Groups List

    private var categoryGroupsList: some View {
        LazyVStack(spacing: 12) {
            ForEach(CategoryGroup.allCases, id: \.rawValue) { group in
                categoryGroupSection(group)
            }
        }
    }

    private func categoryGroupSection(_ group: CategoryGroup) -> some View {
        let isExpanded = expandedGroups.contains(group.rawValue)

        return VStack(spacing: 0) {
            // Group Header
            Button {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    if isExpanded {
                        expandedGroups.remove(group.rawValue)
                    } else {
                        expandedGroups.insert(group.rawValue)
                    }
                }
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: group.icon)
                        .font(.title3)
                        .foregroundStyle(group.color)
                        .frame(width: 28)

                    Text(group.rawValue)
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)

                    Spacer()

                    let activeCount = group.categories.filter { state.selectedOption(for: $0.id) != nil }.count
                    if activeCount > 0 {
                        Text("\(activeCount)/\(group.categories.count)")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(group.color)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 2)
                            .background(group.color.opacity(0.15), in: Capsule())
                    }

                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.white.opacity(0.4))
                        .rotationEffect(.degrees(isExpanded ? 90 : 0))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }

            if isExpanded {
                VStack(spacing: 1) {
                    ForEach(group.categories) { category in
                        categoryRow(category, groupColor: group.color)
                    }
                }
                .padding(.bottom, 8)
            }
        }
        .glassCard(cornerRadius: 16)
    }

    private func categoryRow(_ category: PromptCategory, groupColor: Color) -> some View {
        let selected = state.selectedOption(for: category.id)
        let isLocked = state.isLocked(category.id)

        return Button {
            selectedCategory = category
        } label: {
            HStack(spacing: 10) {
                Image(systemName: category.icon)
                    .font(.subheadline)
                    .foregroundStyle(groupColor.opacity(0.8))
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 2) {
                    Text(category.name)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.white)
                    if let sel = selected {
                        Text(sel.title)
                            .font(.caption)
                            .foregroundStyle(groupColor)
                            .lineLimit(1)
                    } else {
                        Text("None")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.3))
                    }
                }

                Spacer()

                // Lock button
                Button {
                    withAnimation(.spring(response: 0.2)) {
                        state.toggleLock(category: category.id)
                    }
                } label: {
                    Image(systemName: isLocked ? "lock.fill" : "lock.open")
                        .font(.caption)
                        .foregroundStyle(isLocked ? .yellow : .white.opacity(0.3))
                }
                .buttonStyle(.plain)

                // Randomize single
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        state.randomize(category: category.id)
                    }
                } label: {
                    Image(systemName: "dice")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.5))
                }
                .buttonStyle(.plain)

                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.2))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(selected != nil ? groupColor.opacity(0.06) : Color.clear)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Helpers

    private func copyPrompt() {
        UIPasteboard.general.string = state.generatedPrompt
        copiedFeedback = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            copiedFeedback = false
        }
    }
}

extension PromptCategory: @retroactive Hashable {
    static func == (lhs: PromptCategory, rhs: PromptCategory) -> Bool {
        lhs.id == rhs.id
    }
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
