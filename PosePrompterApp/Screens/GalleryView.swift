import SwiftUI
import SwiftData

struct GalleryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \GeneratedImage.timestamp, order: .reverse) private var images: [GeneratedImage]
    @State private var selectedImage: GeneratedImage?
    @State private var showFavoritesOnly = false

    private let columns = [
        GridItem(.flexible(), spacing: 4),
        GridItem(.flexible(), spacing: 4),
        GridItem(.flexible(), spacing: 4)
    ]

    private var filtered: [GeneratedImage] {
        showFavoritesOnly ? images.filter(\.isFavorited) : images
    }

    var body: some View {
        ZStack {
            Theme.backgroundGradient.ignoresSafeArea()

            if filtered.isEmpty {
                emptyState
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 4) {
                        ForEach(filtered) { item in
                            galleryThumbnail(item)
                        }
                    }
                    .padding(4)
                    .padding(.bottom, 40)
                }
            }
        }
        .navigationTitle("Gallery")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    withAnimation { showFavoritesOnly.toggle() }
                    HapticManager.light()
                } label: {
                    Image(systemName: showFavoritesOnly ? "heart.fill" : "heart")
                        .foregroundStyle(showFavoritesOnly ? .red : .white.opacity(0.5))
                }
            }
        }
        .sheet(item: $selectedImage) { image in
            GalleryDetailView(image: image)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "photo.on.rectangle.angled")
                .font(.largeTitle)
                .foregroundStyle(.white.opacity(0.2))
            Text(showFavoritesOnly ? "No favorites yet" : "No images yet")
                .font(.headline)
                .foregroundStyle(.white.opacity(0.4))
            Text("Generated images will appear here")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.25))
        }
    }

    private func galleryThumbnail(_ item: GeneratedImage) -> some View {
        Button {
            selectedImage = item
        } label: {
            if let uiImage = UIImage(data: item.imageData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
                    .frame(minHeight: 120)
                    .clipped()
                    .overlay(alignment: .topTrailing) {
                        if item.isFavorited {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 10))
                                .foregroundStyle(.red)
                                .padding(6)
                        }
                    }
            } else {
                Rectangle()
                    .fill(Theme.cardBackground)
                    .frame(minHeight: 120)
                    .overlay {
                        Image(systemName: "photo")
                            .foregroundStyle(.white.opacity(0.2))
                    }
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Detail View

struct GalleryDetailView: View {
    let image: GeneratedImage
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @State private var showDeleteConfirm = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        if let uiImage = UIImage(data: image.imageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFit()
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                                .padding(.horizontal)

                            // Actions
                            HStack(spacing: 12) {
                                Button {
                                    UIImageWriteToSavedPhotosAlbum(uiImage, nil, nil, nil)
                                    HapticManager.success()
                                } label: {
                                    Label("Save", systemImage: "arrow.down.circle")
                                        .font(.subheadline.weight(.medium))
                                        .frame(maxWidth: .infinity)
                                }
                                .buttonStyle(.bordered)
                                .tint(Theme.selectedAccent)

                                ShareLink(item: Image(uiImage: uiImage), preview: SharePreview("Image", image: Image(uiImage: uiImage))) {
                                    Label("Share", systemImage: "square.and.arrow.up")
                                        .font(.subheadline.weight(.medium))
                                        .frame(maxWidth: .infinity)
                                }
                                .buttonStyle(.bordered)
                                .tint(.white.opacity(0.6))
                            }
                            .padding(.horizontal)
                        }

                        // Prompt
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Prompt")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(.white.opacity(0.6))
                            Text(image.prompt)
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.7))
                                .textSelection(.enabled)
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .glassCard(cornerRadius: 14)
                        .padding(.horizontal)

                        // Meta
                        HStack {
                            Label(image.modelUsed, systemImage: "cpu")
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.4))
                            Spacer()
                            Text(image.timestamp, style: .date)
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.3))
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.bottom, 40)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(.white.opacity(0.7))
                }
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 12) {
                        Button {
                            image.isFavorited.toggle()
                            HapticManager.light()
                        } label: {
                            Image(systemName: image.isFavorited ? "heart.fill" : "heart")
                                .foregroundStyle(image.isFavorited ? .red : .white.opacity(0.5))
                        }
                        Button {
                            showDeleteConfirm = true
                        } label: {
                            Image(systemName: "trash")
                                .foregroundStyle(.red.opacity(0.6))
                        }
                    }
                }
            }
            .alert("Delete Image?", isPresented: $showDeleteConfirm) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    modelContext.delete(image)
                    dismiss()
                }
            }
        }
    }
}
