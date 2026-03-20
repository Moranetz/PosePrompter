//
//  PromptBuilderView.swift
//  PosePromptStudio
//
//  Main prompt builder interface
//

import SwiftUI

struct PromptBuilderView: View {
    
    @StateObject private var viewModel = PromptBuilderViewModel()
    @EnvironmentObject private var categoryManager: CategoryManager
    @State private var selectedSection: CategorySection = .bodyPose
    @State private var showSaveSheet = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Generated prompt preview
                promptPreview
                
                Divider()
                
                // Section picker
                sectionPicker
                
                // Category selections
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(selectedSection.categories, id: \.self) { category in
                            CategoryPicker(
                                category: category,
                                selectedIndex: viewModel.getSelection(for: category),
                                options: categoryManager.getOptions(for: category)
                            ) { index in
                                viewModel.updateSelection(category: category, index: index)
                            }
                        }
                    }
                    .padding()
                }
                
                Divider()
                
                // Action buttons
                actionButtons
            }
            .navigationTitle("Prompt Builder")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button {
                            viewModel.randomizeAll()
                        } label: {
                            Label("Randomize All", systemImage: "shuffle")
                        }
                        
                        Button {
                            viewModel.randomize(section: selectedSection)
                        } label: {
                            Label("Randomize Section", systemImage: "shuffle.circle")
                        }
                        
                        Button(role: .destructive) {
                            viewModel.reset()
                        } label: {
                            Label("Reset All", systemImage: "arrow.counterclockwise")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showSaveSheet) {
                SavePromptSheet(viewModel: viewModel)
            }
        }
    }
    
    // MARK: - Subviews
    
    private var promptPreview: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Generated Prompt")
                .font(.caption)
                .foregroundStyle(.secondary)
            
            ScrollView(.horizontal, showsIndicators: false) {
                Text(viewModel.generatedText.isEmpty ? "Select options to build your prompt..." : viewModel.generatedText)
                    .font(.body)
                    .padding(.horizontal, 4)
            }
            
            if let imageURL = viewModel.generatedImageURL {
                AsyncImage(url: URL(string: imageURL)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                } placeholder: {
                    ProgressView()
                }
                .frame(height: 200)
                .cornerRadius(12)
            }
        }
        .padding()
        .background(Color(.systemGray6))
    }
    
    private var sectionPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(CategorySection.allCases, id: \.self) { section in
                    SectionButton(
                        section: section,
                        isSelected: selectedSection == section
                    ) {
                        withAnimation {
                            selectedSection = section
                        }
                    }
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
    }
    
    private var actionButtons: some View {
        HStack(spacing: 12) {
            Button {
                Task {
                    await viewModel.generateImage()
                }
            } label: {
                if viewModel.isGenerating {
                    ProgressView()
                        .tint(.white)
                } else {
                    Label("Generate Image", systemImage: "sparkles")
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(viewModel.isGenerating || viewModel.generatedText.isEmpty)
            
            Button {
                showSaveSheet = true
            } label: {
                Label("Save", systemImage: "square.and.arrow.down")
            }
            .buttonStyle(.bordered)
            .disabled(viewModel.generatedText.isEmpty)
        }
        .padding()
    }
}

// MARK: - Section Button

struct SectionButton: View {
    let section: CategorySection
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: section.icon)
                    .font(.title3)
                
                Text(section.rawValue)
                    .font(.caption2)
                    .multilineTextAlignment(.center)
            }
            .frame(width: 80, height: 60)
            .background(isSelected ? Color.accentColor : Color(.systemGray6))
            .foregroundStyle(isSelected ? .white : .primary)
            .cornerRadius(12)
        }
    }
}

// MARK: - Category Picker

struct CategoryPicker: View {
    let category: CategoryKey
    let selectedIndex: Int
    let options: [CategoryOption]
    let onSelect: (Int) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(category.displayName)
                .font(.headline)
            
            if options.isEmpty {
                Text("No options available")
                    .foregroundStyle(.secondary)
                    .italic()
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(options.enumerated()), id: \.offset) { index, option in
                            OptionButton(
                                title: option.title,
                                isSelected: index == selectedIndex
                            ) {
                                onSelect(index)
                            }
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Option Button

struct OptionButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.accentColor : Color(.systemGray5))
                .foregroundStyle(isSelected ? .white : .primary)
                .cornerRadius(8)
        }
    }
}

// MARK: - Save Sheet

struct SavePromptSheet: View {
    @ObservedObject var viewModel: PromptBuilderViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Prompt Details") {
                    TextField("Name (optional)", text: $viewModel.promptName)
                }
                
                Section("Preview") {
                    Text(viewModel.generatedText)
                        .font(.caption)
                }
            }
            .navigationTitle("Save Prompt")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await viewModel.savePrompt()
                            dismiss()
                        }
                    }
                    .disabled(viewModel.isSaving)
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    PromptBuilderView()
        .environmentObject(CategoryManager.shared)
}
