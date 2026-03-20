//
//  PromptLibraryView.swift
//  PosePromptStudio
//
//  Library view for saved prompt sets, presets, and community packages
//

import SwiftUI

struct PromptLibraryView: View {

    // MARK: - State

    @State private var selectedTab: LibraryTab = .saved
    @State private var searchText = ""
    @State private var sortOrder: SortOrder = .newest
    @State private var showDeleteConfirmation = false
    @State private var promptSetToDelete: PromptSet?

    // Sample data — will be replaced with real data from PromptBuilderViewModel/Firestore
    @State private var savedPromptSets: [PromptSet] = []
    @State private var presets: [Preset] = []

    // MARK: - Types

    enum LibraryTab: String, CaseIterable {
        case saved = "Saved"
        case presets = "Presets"
        case packages = "Packages"

        var iconName: String {
            switch self {
            case .saved: return "bookmark.fill"
            case .presets: return "wand.and.stars"
            case .packages: return "shippingbox.fill"
            }
        }
    }

    enum SortOrder: String, CaseIterable {
        case newest = "Newest"
        case oldest = "Oldest"
        case alphabetical = "A–Z"

        var iconName: String {
            switch self {
            case .newest: return "arrow.down"
            case .oldest: return "arrow.up"
            case .alphabetical: return "textformat.abc"
            }
        }
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Tab picker
                tabPicker

                // Content
                Group {
                    switch selectedTab {
                    case .saved:
                        savedPromptsList
                    case .presets:
                        presetsList
                    case .packages:
                        packagesView
                    }
                }
            }
            .navigationTitle("Library")
            .searchable(text: $searchText, prompt: "Search prompts...")
            .toolbar { toolbarContent }
            .alert("Delete Prompt Set?", isPresented: $showDeleteConfirmation) {
                Button("Delete", role: .destructive) {
                    if let promptSet = promptSetToDelete {
                        withAnimation {
                            savedPromptSets.removeAll { $0.id == promptSet.id }
                        }
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This action cannot be undone.")
            }
        }
    }

    // MARK: - Tab Picker

    private var tabPicker: some View {
        HStack(spacing: 0) {
            ForEach(LibraryTab.allCases, id: \.self) { tab in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = tab
                    }
                } label: {
                    VStack(spacing: 6) {
                        HStack(spacing: 4) {
                            Image(systemName: tab.iconName)
                                .font(.caption)
                            Text(tab.rawValue)
                                .font(.subheadline)
                                .fontWeight(selectedTab == tab ? .semibold : .regular)
                        }
                        .foregroundStyle(selectedTab == tab ? .blue : .secondary)

                        Rectangle()
                            .fill(selectedTab == tab ? Color.blue : Color.clear)
                            .frame(height: 2)
                    }
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }

    // MARK: - Saved Prompts List

    private var savedPromptsList: some View {
        Group {
            if filteredSavedPromptSets.isEmpty {
                emptyState(
                    icon: "bookmark",
                    title: "No Saved Prompts",
                    message: "Save prompt combinations from the builder to access them here."
                )
            } else {
                List {
                    ForEach(filteredSavedPromptSets) { promptSet in
                        savedPromptRow(promptSet)
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            let promptSet = filteredSavedPromptSets[index]
                            savedPromptSets.removeAll { $0.id == promptSet.id }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
    }

    private func savedPromptRow(_ promptSet: PromptSet) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(promptSet.name)
                        .font(.headline)

                    if !promptSet.description.isEmpty {
                        Text(promptSet.description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }

                Spacer()

                // Category count badge
                let selectionCount = promptSet.selections.count
                Text("\(selectionCount)")
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.blue.opacity(0.1))
                    .foregroundStyle(.blue)
                    .cornerRadius(6)
            }

            // Category color dots preview
            HStack(spacing: 4) {
                ForEach(Array(promptSet.selections.keys.prefix(10)), id: \.self) { key in
                    if let category = Category(rawValue: key) {
                        Circle()
                            .fill(category.color)
                            .frame(width: 6, height: 6)
                    }
                }
                if promptSet.selections.count > 10 {
                    Text("+\(promptSet.selections.count - 10)")
                        .font(.system(size: 8))
                        .foregroundStyle(.secondary)
                }
            }

            // Prompt preview
            Text(promptSet.generatedPrompt)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)

            // Metadata
            HStack {
                Text(promptSet.createdAt, style: .date)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                Spacer()

                // Actions
                HStack(spacing: 12) {
                    Button {
                        UIPasteboard.general.string = promptSet.generatedPrompt
                    } label: {
                        Image(systemName: "doc.on.doc")
                            .font(.caption)
                    }

                    Button(role: .destructive) {
                        promptSetToDelete = promptSet
                        showDeleteConfirmation = true
                    } label: {
                        Image(systemName: "trash")
                            .font(.caption)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Presets List

    private var presetsList: some View {
        Group {
            if filteredPresets.isEmpty {
                emptyState(
                    icon: "wand.and.stars",
                    title: "No Presets",
                    message: "Presets are curated prompt combinations from extracted prompts."
                )
            } else {
                List {
                    ForEach(filteredPresets) { preset in
                        presetRow(preset)
                    }
                }
                .listStyle(.plain)
            }
        }
    }

    private func presetRow(_ preset: Preset) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(preset.title)
                    .font(.headline)

                Spacer()

                if preset.isComprehensive {
                    Text("Comprehensive")
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color(hex: "a855f7").opacity(0.15))
                        .foregroundStyle(Color(hex: "a855f7"))
                        .cornerRadius(4)
                }
            }

            // Entry categories preview
            HStack(spacing: 4) {
                ForEach(Array(preset.entries.keys.sorted()), id: \.self) { key in
                    if let category = Category(rawValue: key) {
                        HStack(spacing: 2) {
                            Circle()
                                .fill(category.color)
                                .frame(width: 6, height: 6)
                            Text(category.displayName)
                                .font(.system(size: 9))
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }

            // Entry count
            Text("\(preset.entries.count) categor\(preset.entries.count == 1 ? "y" : "ies")")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }

    // MARK: - Packages View

    private var packagesView: some View {
        emptyState(
            icon: "shippingbox",
            title: "Community Packages",
            message: "Browse and install prompt packs created by the community. Coming soon to iOS."
        )
    }

    // MARK: - Empty State

    private func emptyState(icon: String, title: String, message: String) -> some View {
        VStack(spacing: 16) {
            Spacer()

            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text(title)
                .font(.title3)
                .fontWeight(.semibold)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Spacer()
        }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .primaryAction) {
            Menu {
                ForEach(SortOrder.allCases, id: \.self) { order in
                    Button {
                        sortOrder = order
                    } label: {
                        Label(order.rawValue, systemImage: order.iconName)
                    }
                }
            } label: {
                Image(systemName: "line.3.horizontal.decrease.circle")
            }
        }
    }

    // MARK: - Filtered Data

    private var filteredSavedPromptSets: [PromptSet] {
        var result = savedPromptSets

        // Search filter
        if !searchText.isEmpty {
            result = result.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.description.localizedCaseInsensitiveContains(searchText) ||
                $0.generatedPrompt.localizedCaseInsensitiveContains(searchText)
            }
        }

        // Sort
        switch sortOrder {
        case .newest:
            result.sort { $0.createdAt > $1.createdAt }
        case .oldest:
            result.sort { $0.createdAt < $1.createdAt }
        case .alphabetical:
            result.sort { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        }

        return result
    }

    private var filteredPresets: [Preset] {
        if searchText.isEmpty {
            return presets
        }
        return presets.filter {
            $0.title.localizedCaseInsensitiveContains(searchText)
        }
    }
}

// MARK: - Preview

#Preview {
    PromptLibraryView()
}
