import SwiftUI

struct MainView: View {
    @Environment(PromptState.self) private var state
    @State private var expandedGroups: Set<String> = ["Body"]
    @State private var showPromptPreview = false
    @State private var copiedFeedback = false
    @State private var activeCategory: PromptCategory?

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                Theme.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        promptPreviewCard
                        actionBar
                        categoryGroupsList
                    }
                    .padding(.horizontal)
                    .padding(.bottom, activeCategory != nil ? 120 : 40)
                }

                // Bottom word button bar
                if let category = activeCategory {
                    WordButtonBar(
                        category: category,
                        state: state,
                        onDismiss: { activeCategory = nil }
                    )
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .navigationTitle("Pose Prompter")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .sheet(isPresented: $showPromptPreview) {
                PromptPreviewView()
                    .environment(state)
            }
            .animation(.spring(response: 0.3, dampingFraction: 0.8), value: activeCategory?.id)
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
                    activeCategory = nil
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
        let isActive = activeCategory?.id == category.id

        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                if isActive {
                    activeCategory = nil
                } else {
                    activeCategory = category
                }
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: category.icon)
                    .font(.subheadline)
                    .foregroundStyle(groupColor.opacity(0.8))
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 2) {
                    Text(category.name)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(isActive ? groupColor : .white)
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

                Image(systemName: isActive ? "chevron.down" : "chevron.right")
                    .font(.caption2)
                    .foregroundStyle(isActive ? groupColor : .white.opacity(0.2))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                isActive ? groupColor.opacity(0.1) :
                selected != nil ? groupColor.opacity(0.06) : Color.clear
            )
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

// MARK: - Word Button Bar (bottom bar with scrolling option pills)

struct WordButtonBar: View {
    let category: PromptCategory
    let state: PromptState
    let onDismiss: () -> Void

    private var selectedIndex: Int? {
        if let idx = state.selections[category.id] {
            return idx
        }
        return nil
    }

    var body: some View {
        VStack(spacing: 0) {
            // Drag handle + category name
            HStack {
                Image(systemName: category.icon)
                    .font(.caption)
                    .foregroundStyle(category.groupColor)
                Text(category.name)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.8))

                Spacer()

                // Clear selection
                Button {
                    withAnimation(.spring(response: 0.2)) {
                        state.clear(category: category.id)
                    }
                } label: {
                    Image(systemName: "xmark.circle")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.4))
                }
                .buttonStyle(.plain)

                // Randomize
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        state.randomize(category: category.id)
                    }
                } label: {
                    Image(systemName: "dice.fill")
                        .font(.caption)
                        .foregroundStyle(category.groupColor)
                }
                .buttonStyle(.plain)

                // Close
                Button {
                    onDismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.white.opacity(0.5))
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 16)
            .padding(.top, 10)
            .padding(.bottom, 6)

            // Scrolling word buttons
            ScrollViewReader { proxy in
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(category.options.enumerated()), id: \.element.id) { index, option in
                            let isSelected = index == selectedIndex

                            Button {
                                withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                                    if isSelected {
                                        state.clear(category: category.id)
                                    } else {
                                        state.select(category: category.id, index: index)
                                    }
                                }
                            } label: {
                                Text(option.title)
                                    .font(.caption.weight(isSelected ? .semibold : .regular))
                                    .foregroundStyle(isSelected ? .white : .white.opacity(0.6))
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 10)
                                    .background(
                                        Capsule()
                                            .fill(isSelected ? category.groupColor.opacity(0.3) : Color.white.opacity(0.06))
                                    )
                                    .overlay(
                                        Capsule()
                                            .stroke(isSelected ? category.groupColor.opacity(0.5) : Color.white.opacity(0.08), lineWidth: 1)
                                    )
                            }
                            .buttonStyle(.plain)
                            .id(index)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)
                }
                .onChange(of: selectedIndex) { _, newValue in
                    if let idx = newValue {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            proxy.scrollTo(idx, anchor: .center)
                        }
                    }
                }
                .onAppear {
                    if let idx = selectedIndex {
                        proxy.scrollTo(idx, anchor: .center)
                    }
                }
            }
        }
        .background(
            Rectangle()
                .fill(.ultraThinMaterial)
                .environment(\.colorScheme, .dark)
                .overlay(
                    Rectangle()
                        .fill(Color.black.opacity(0.4))
                )
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(category.groupColor.opacity(0.2))
                        .frame(height: 0.5)
                }
        )
        .ignoresSafeArea(.container, edges: .bottom)
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
