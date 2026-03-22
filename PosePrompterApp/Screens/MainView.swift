import SwiftUI
import SwiftData

struct MainView: View {
    @Environment(PromptState.self) private var state
    @Environment(\.modelContext) private var modelContext
    @State private var expandedGroups: Set<String> = ["Body"]
    @State private var showPromptPreview = false
    @State private var showTemplates = false
    @State private var copiedFeedback = false
    @State private var activeCategory: PromptCategory?

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                Theme.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        presetCyclingBar
                        promptPreviewCard
                        actionBar
                        categoryGroupsList
                    }
                    .padding(.horizontal)
                    .padding(.bottom, activeCategory != nil ? 120 : 40)
                }

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
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showTemplates = true
                        HapticManager.light()
                    } label: {
                        Image(systemName: "bookmark")
                            .foregroundStyle(.white.opacity(0.6))
                    }
                }
            }
            .sheet(isPresented: $showPromptPreview) {
                PromptPreviewView()
                    .environment(state)
            }
            .sheet(isPresented: $showTemplates) {
                SavedTemplatesView()
                    .environment(state)
            }
            .animation(.spring(response: 0.3, dampingFraction: 0.8), value: activeCategory?.id)
        }
    }

    // MARK: - Preset Cycling Bar

    private var presetCyclingBar: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation(.spring(response: 0.3)) {
                    state.previousPreset()
                }
                HapticManager.selection()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.white.opacity(0.4))
                    .frame(width: 32, height: 32)
                    .background(Color.white.opacity(0.06), in: Circle())
            }
            .buttonStyle(.plain)

            VStack(spacing: 2) {
                if let name = state.currentPresetName, let idx = state.currentPresetIndex {
                    Text("\(idx + 1)/\(DiscoverPost.samples.count)")
                        .font(.system(size: 10, weight: .semibold).monospacedDigit())
                        .foregroundStyle(Theme.selectedAccent)
                    Text(name)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.white.opacity(0.6))
                        .lineLimit(1)
                } else {
                    Text("Custom")
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.white.opacity(0.4))
                }
            }
            .frame(maxWidth: .infinity)

            Button {
                withAnimation(.spring(response: 0.3)) {
                    state.nextPreset()
                }
                HapticManager.selection()
            } label: {
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.white.opacity(0.4))
                    .frame(width: 32, height: 32)
                    .background(Color.white.opacity(0.06), in: Circle())
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .glassCard(cornerRadius: 14)
        .padding(.top, 8)
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
                Text(state.highlightedPrompt)
                    .font(.callout)
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

                    if let image = renderShareCard(state: state) {
                        ShareLink(item: Image(uiImage: image), preview: SharePreview("Prompt", image: Image(uiImage: image))) {
                            Image(systemName: "square.and.arrow.up")
                                .font(.caption.weight(.medium))
                        }
                        .buttonStyle(.bordered)
                        .tint(.white.opacity(0.5))
                    }
                }
            }
        }
        .padding(16)
        .glassCard(cornerRadius: 20)
    }

    // MARK: - Action Bar

    private var actionBar: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                    state.randomizeAll()
                }
                HapticManager.medium()
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
                HapticManager.light()
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
            Button {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    if isExpanded {
                        expandedGroups.remove(group.rawValue)
                    } else {
                        expandedGroups.insert(group.rawValue)
                    }
                }
                HapticManager.light()
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
                activeCategory = isActive ? nil : category
            }
            HapticManager.selection()
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

                Button {
                    withAnimation(.spring(response: 0.2)) {
                        state.toggleLock(category: category.id)
                    }
                    HapticManager.medium()
                } label: {
                    Image(systemName: isLocked ? "lock.fill" : "lock.open")
                        .font(.caption)
                        .foregroundStyle(isLocked ? .yellow : .white.opacity(0.3))
                }
                .buttonStyle(.plain)

                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        state.randomize(category: category.id)
                    }
                    HapticManager.medium()
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
        HapticManager.success()

        // Save to history
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

// MARK: - Word Button Bar

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
            HStack {
                Image(systemName: category.icon)
                    .font(.caption)
                    .foregroundStyle(category.groupColor)
                Text(category.name)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.8))

                Spacer()

                Button {
                    withAnimation(.spring(response: 0.2)) {
                        state.clear(category: category.id)
                    }
                    HapticManager.light()
                } label: {
                    Image(systemName: "xmark.circle")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.4))
                }
                .buttonStyle(.plain)

                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        state.randomize(category: category.id)
                    }
                    HapticManager.medium()
                } label: {
                    Image(systemName: "dice.fill")
                        .font(.caption)
                        .foregroundStyle(category.groupColor)
                }
                .buttonStyle(.plain)

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
                                HapticManager.selection()
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

extension PromptCategory: Hashable {
    static func == (lhs: PromptCategory, rhs: PromptCategory) -> Bool {
        lhs.id == rhs.id
    }
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
