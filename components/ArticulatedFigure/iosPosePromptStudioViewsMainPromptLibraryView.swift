//
//  PromptLibraryView.swift
//  PosePromptStudio
//
//  View for browsing saved prompts
//

import SwiftUI

struct PromptLibraryView: View {
    
    @StateObject private var viewModel = PromptLibraryViewModel()
    @State private var searchText = ""
    @State private var showFilterSheet = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading prompts...")
                } else if viewModel.prompts.isEmpty {
                    emptyState
                } else {
                    promptList
                }
            }
            .navigationTitle("My Prompts")
            .searchable(text: $searchText, prompt: "Search prompts...")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showFilterSheet = true
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .sheet(isPresented: $showFilterSheet) {
                FilterSheet(viewModel: viewModel)
            }
            .task {
                await viewModel.loadPrompts()
            }
            .refreshable {
                await viewModel.loadPrompts()
            }
        }
    }
    
    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            
            Text("No Prompts Yet")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Create your first AI prompt to get started")
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
    
    private var promptList: some View {
        List {
            ForEach(filteredPrompts) { prompt in
                NavigationLink {
                    PromptDetailView(prompt: prompt)
                } label: {
                    PromptRow(prompt: prompt)
                }
                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                    Button(role: .destructive) {
                        Task {
                            await viewModel.deletePrompt(prompt)
                        }
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                    
                    Button {
                        Task {
                            await viewModel.toggleFavorite(prompt)
                        }
                    } label: {
                        Label("Favorite", systemImage: prompt.isFavorite ? "star.slash" : "star")
                    }
                    .tint(.yellow)
                }
            }
        }
    }
    
    private var filteredPrompts: [Prompt] {
        if searchText.isEmpty {
            return viewModel.prompts
        } else {
            return viewModel.prompts.filter { prompt in
                prompt.name?.localizedCaseInsensitiveContains(searchText) == true ||
                prompt.generatedText?.localizedCaseInsensitiveContains(searchText) == true
            }
        }
    }
}

// MARK: - Prompt Row

struct PromptRow: View {
    let prompt: Prompt
    
    var body: some View {
        HStack(spacing: 12) {
            // Thumbnail or placeholder
            if let imageURL = prompt.generatedImageURL {
                AsyncImage(url: URL(string: imageURL)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Color.gray
                }
                .frame(width: 60, height: 60)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            } else {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: 60, height: 60)
                    .overlay {
                        Image(systemName: "photo")
                            .foregroundStyle(.secondary)
                    }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(prompt.name ?? "Untitled")
                    .font(.headline)
                
                if let text = prompt.generatedText {
                    Text(text)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                
                HStack {
                    Text(prompt.createdAt.formatted(date: .abbreviated, time: .omitted))
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                    
                    if prompt.isFavorite {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundStyle(.yellow)
                    }
                }
            }
            
            Spacer()
        }
    }
}

// MARK: - Filter Sheet

struct FilterSheet: View {
    @ObservedObject var viewModel: PromptLibraryViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Sort By") {
                    Picker("Sort", selection: $viewModel.sortOption) {
                        Text("Newest First").tag(SortOption.newest)
                        Text("Oldest First").tag(SortOption.oldest)
                        Text("Name (A-Z)").tag(SortOption.nameAsc)
                        Text("Name (Z-A)").tag(SortOption.nameDesc)
                    }
                }
                
                Section("Filter") {
                    Toggle("Favorites Only", isOn: $viewModel.showFavoritesOnly)
                }
            }
            .navigationTitle("Filter & Sort")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Prompt Library ViewModel

@MainActor
final class PromptLibraryViewModel: ObservableObject {
    
    @Published var prompts: [Prompt] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var sortOption: SortOption = .newest
    @Published var showFavoritesOnly = false
    
    private let firebaseService = FirebaseService()
    private let apiService = APIService.shared
    
    func loadPrompts() async {
        guard let userId = firebaseService.currentUser?.id else { return }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            // Load from Firestore
            let loadedPrompts: [Prompt] = try await firebaseService.fetchDocuments(
                from: "prompts",
                where: "createdBy",
                isEqualTo: userId
            )
            
            prompts = loadedPrompts.sorted()
            
        } catch {
            errorMessage = error.localizedDescription
            // Fallback to mock data
            prompts = Prompt.mockList
        }
    }
    
    func deletePrompt(_ prompt: Prompt) async {
        do {
            try await firebaseService.deleteDocument(
                from: "prompts",
                documentId: prompt.id
            )
            
            prompts.removeAll { $0.id == prompt.id }
        } catch {
            errorMessage = "Failed to delete prompt"
        }
    }
    
    func toggleFavorite(_ prompt: Prompt) async {
        var updatedPrompt = prompt
        updatedPrompt.isFavorite.toggle()
        
        do {
            try await firebaseService.updateDocument(
                in: "prompts",
                documentId: prompt.id,
                data: updatedPrompt
            )
            
            if let index = prompts.firstIndex(where: { $0.id == prompt.id }) {
                prompts[index] = updatedPrompt
            }
        } catch {
            errorMessage = "Failed to update favorite status"
        }
    }
}

enum SortOption {
    case newest, oldest, nameAsc, nameDesc
}

extension Array where Element == Prompt {
    func sorted() -> [Prompt] {
        sorted { $0.createdAt > $1.createdAt }
    }
}

// MARK: - Preview

#Preview {
    PromptLibraryView()
}
