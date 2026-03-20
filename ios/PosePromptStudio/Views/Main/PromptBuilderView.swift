//
//  PromptBuilderView.swift
//  PosePromptStudio
//
//  Main prompt builder UI — the iOS equivalent of PhotoElementRandomizer.jsx
//

import SwiftUI

struct PromptBuilderView: View {

    // MARK: - Environment

    @StateObject private var viewModel = PromptBuilderViewModel()

    // MARK: - State

    @State private var expandedGroups: Set<String> = Set(CategoryGroup.all.map(\.title))
    @State private var showSaveSheet = false
    @State private var showPromptDetail = false
    @State private var savePromptName = ""
    @State private var savePromptDescription = ""
    @State private var copiedToClipboard = false

    // MARK: - Body

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Prompt preview bar
                promptPreview

                // Category groups
                ScrollView {
                    LazyVStack(spacing: 16) {
                        // Preset navigator
                        presetNavigator

                        // Category groups
                        ForEach(CategoryGroup.all) { group in
                            categoryGroupSection(group)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Prompt Builder")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { toolbarContent }
            .sheet(isPresented: $showSaveSheet) { savePromptSheet }
            .sheet(isPresented: $showPromptDetail) { promptDetailSheet }
        }
    }

    // MARK: - Prompt Preview

    private var promptPreview: some View {
        VStack(spacing: 8) {
            HStack {
                Text(viewModel.assembledPrompt.isEmpty ? "Tap categories to build your prompt..." : viewModel.assembledPrompt)
                    .font(.caption)
                    .foregroundStyle(viewModel.assembledPrompt.isEmpty ? .secondary : .primary)
                    .lineLimit(3)

                Spacer(minLength: 8)

                if !viewModel.assembledPrompt.isEmpty {
                    Button {
                        viewModel.copyPromptToClipboard()
                        withAnimation {
                            copiedToClipboard = true
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            withAnimation {
                                copiedToClipboard = false
                            }
                        }
                    } label: {
                        Image(systemName: copiedToClipboard ? "checkmark.circle.fill" : "doc.on.doc")
                            .foregroundStyle(copiedToClipboard ? .green : .blue)
                    }
                }
            }

            HStack(spacing: 12) {
                Label("\(viewModel.activeSelectionCount)", systemImage: "checkmark.circle.fill")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                if viewModel.activeCategories.count < viewModel.enabledCategories.count {
                    Label("Some categories overridden", systemImage: "info.circle")
                        .font(.caption2)
                        .foregroundStyle(.orange)
                }

                Spacer()

                Button {
                    showPromptDetail = true
                } label: {
                    Text("View Full")
                        .font(.caption2)
                        .fontWeight(.medium)
                }
                .disabled(viewModel.assembledPrompt.isEmpty)
            }
        }
        .padding()
        .background(Color(.systemGray6))
    }

    // MARK: - Preset Navigator

    private var presetNavigator: some View {
        HStack {
            Button {
                viewModel.previousPreset()
            } label: {
                Image(systemName: "chevron.left")
            }
            .disabled(viewModel.presets.isEmpty)

            Spacer()

            if let preset = viewModel.currentPreset {
                Text("\(viewModel.currentPresetIndex + 1)/\(viewModel.presets.count) \(preset.title)")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(1)
            } else {
                Text("No presets loaded")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                viewModel.nextPreset()
            } label: {
                Image(systemName: "chevron.right")
            }
            .disabled(viewModel.presets.isEmpty)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }

    // MARK: - Category Group Section

    private func categoryGroupSection(_ group: CategoryGroup) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // Group header
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    if expandedGroups.contains(group.title) {
                        expandedGroups.remove(group.title)
                    } else {
                        expandedGroups.insert(group.title)
                    }
                }
            } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(group.title)
                            .font(.headline)
                            .foregroundStyle(.primary)
                        Text(group.description)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Image(systemName: expandedGroups.contains(group.title) ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .buttonStyle(.plain)

            // Category rows
            if expandedGroups.contains(group.title) {
                ForEach(group.allCategories) { category in
                    categoryRow(category)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - Category Row

    private func categoryRow(_ category: Category) -> some View {
        let isOverridden = viewModel.isCategoryOverridden(category)
        let isEnabled = viewModel.isCategoryEnabled(category)
        let selectedOption = viewModel.selectedOption(for: category)

        return VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                // Category color dot
                Circle()
                    .fill(category.color)
                    .frame(width: 10, height: 10)

                // Category name
                Text(category.displayName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(isOverridden ? .secondary : .primary)

                if isOverridden {
                    Text("(overridden)")
                        .font(.caption2)
                        .foregroundStyle(.orange)
                }

                Spacer()

                // Enable/disable toggle
                Button {
                    viewModel.toggleCategory(category)
                } label: {
                    Image(systemName: isEnabled ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(isEnabled ? category.color : .secondary)
                }

                // Randomize button
                Button {
                    viewModel.randomize(category: category)
                } label: {
                    Image(systemName: "shuffle")
                        .font(.caption)
                        .foregroundStyle(.blue)
                }
                .disabled(isOverridden)
            }

            // Selected option display
            if let option = selectedOption, !isOverridden {
                HStack {
                    Text(option.title)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)

                    Spacer()

                    Button {
                        viewModel.clearSelection(for: category)
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.leading, 18)
            }
        }
        .padding(.vertical, 4)
        .opacity(isOverridden ? 0.5 : 1.0)
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItemGroup(placement: .primaryAction) {
            // Randomize all
            Button {
                viewModel.randomizeAll()
            } label: {
                Image(systemName: "shuffle")
            }

            // Save prompt
            Button {
                showSaveSheet = true
            } label: {
                Image(systemName: "square.and.arrow.down")
            }
            .disabled(viewModel.assembledPrompt.isEmpty)
        }

        ToolbarItemGroup(placement: .secondaryAction) {
            // Undo
            Button {
                viewModel.undo()
            } label: {
                Label("Undo", systemImage: "arrow.uturn.backward")
            }
            .disabled(!viewModel.canUndo)

            // Redo
            Button {
                viewModel.redo()
            } label: {
                Label("Redo", systemImage: "arrow.uturn.forward")
            }
            .disabled(!viewModel.canRedo)

            // Clear all
            Button(role: .destructive) {
                viewModel.clearAll()
            } label: {
                Label("Clear All", systemImage: "trash")
            }
            .disabled(viewModel.selections.isEmpty)
        }
    }

    // MARK: - Save Prompt Sheet

    private var savePromptSheet: some View {
        NavigationStack {
            Form {
                Section("Prompt Set Name") {
                    TextField("Name", text: $savePromptName)
                }

                Section("Description (optional)") {
                    TextField("Description", text: $savePromptDescription, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    Text(viewModel.assembledPrompt)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } header: {
                    Text("Preview")
                }
            }
            .navigationTitle("Save Prompt Set")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showSaveSheet = false
                        savePromptName = ""
                        savePromptDescription = ""
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        viewModel.savePromptSet(
                            name: savePromptName,
                            description: savePromptDescription
                        )
                        showSaveSheet = false
                        savePromptName = ""
                        savePromptDescription = ""
                    }
                    .disabled(savePromptName.isEmpty)
                }
            }
        }
    }

    // MARK: - Prompt Detail Sheet

    private var promptDetailSheet: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Full prompt
                    Text(viewModel.assembledPrompt)
                        .font(.body)
                        .textSelection(.enabled)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(10)

                    // Per-category breakdown
                    let result = viewModel.getAssemblyResult()

                    if !result.excludedCategories.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Excluded (comprehensive aesthetic)")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundStyle(.orange)
                            ForEach(Array(result.excludedCategories), id: \.self) { category in
                                Text(category.displayName)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }

                    ForEach(result.categoryPrompts, id: \.category) { item in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(item.category.color)
                                    .frame(width: 8, height: 8)
                                Text(item.category.displayName)
                                    .font(.caption)
                                    .fontWeight(.semibold)
                            }
                            Text(item.prompt)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Prompt Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        showPromptDetail = false
                    }
                }
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        viewModel.copyPromptToClipboard()
                    } label: {
                        Image(systemName: "doc.on.doc")
                    }
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    PromptBuilderView()
        .environmentObject(AuthViewModel())
}
