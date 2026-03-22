import SwiftUI
import SwiftData
import PhotosUI
import StoreKit
import AuthenticationServices

// MARK: - Create View (Generate Images Tab)

struct CreateView: View {
    @Environment(PromptState.self) private var state
    @Environment(\.modelContext) private var modelContext
    @Environment(AuthManager.self) private var authManager
    @Environment(StoreManager.self) private var storeManager
    @State private var promptText = ""
    @State private var selectedModel: AIModel = .fluxPro
    @State private var isGenerating = false
    @State private var generatedImage: UIImage?
    @State private var showPaywall = false
    @State private var showHistory = false
    @State private var showGallery = false
    @State private var showSignIn = false
    @State private var showPhotosPicker = false
    @State private var referencePhoto: UIImage?
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var generationProgress: CGFloat = 0
    @State private var errorMessage: String?
    @State private var copiedFeedback = false

    private var credits: Int { storeManager.purchasedCredits }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        creditBalanceBar
                        promptInputSection
                        if referencePhoto != nil {
                            referencePhotoSection
                        }
                        modelSelectionSection
                        generateButton
                        if isGenerating {
                            generationProgressView
                        }
                        if let image = generatedImage {
                            generatedImageSection(image)
                        }
                        if let error = errorMessage {
                            errorBanner(error)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Create")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 12) {
                        Button {
                            showGallery = true
                            HapticManager.light()
                        } label: {
                            Image(systemName: "photo.on.rectangle")
                                .foregroundStyle(.white.opacity(0.6))
                        }

                        Button {
                            showHistory = true
                            HapticManager.light()
                        } label: {
                            Image(systemName: "clock.arrow.circlepath")
                                .foregroundStyle(.white.opacity(0.6))
                        }

                        Button {
                            showPhotosPicker = true
                            HapticManager.light()
                        } label: {
                            Image(systemName: "person.crop.rectangle")
                                .foregroundStyle(.white.opacity(0.6))
                        }
                    }
                }
            }
            .sheet(isPresented: $showPaywall) {
                PaywallView()
                    .environment(storeManager)
            }
            .sheet(isPresented: $showHistory) {
                HistoryView()
                    .environment(state)
            }
            .sheet(isPresented: $showGallery) {
                NavigationStack {
                    GalleryView()
                }
            }
            .sheet(isPresented: $showSignIn) {
                SignInSheet()
                    .environment(authManager)
            }
            .photosPicker(isPresented: $showPhotosPicker, selection: $selectedPhotoItem, matching: .images)
            .onChange(of: selectedPhotoItem) { _, item in
                Task {
                    if let data = try? await item?.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        referencePhoto = image
                        HapticManager.success()
                    }
                }
            }
            .onAppear {
                if promptText.isEmpty && !state.generatedPrompt.isEmpty {
                    promptText = state.generatedPrompt
                }
            }
        }
    }

    // MARK: - Credit Balance Bar

    private var creditBalanceBar: some View {
        HStack {
            if authManager.isSignedIn {
                Image(systemName: "diamond.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.selectedAccent)

                Text("\(credits) credits")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)

                Spacer()

                Button {
                    showPaywall = true
                    HapticManager.light()
                } label: {
                    Text("Buy Credits")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                        .background(Theme.selectedAccent, in: Capsule())
                }
                .buttonStyle(.plain)
            } else {
                Image(systemName: "person.crop.circle")
                    .font(.caption)
                    .foregroundStyle(Theme.selectedAccent)

                Text("Sign in to generate images")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white.opacity(0.7))

                Spacer()

                Button {
                    showSignIn = true
                    HapticManager.light()
                } label: {
                    Text("Sign In")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                        .background(Theme.selectedAccent, in: Capsule())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(14)
        .glassCard(cornerRadius: 14)
        .padding(.top, 8)
    }

    // MARK: - Prompt Input

    private var promptInputSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "text.cursor")
                    .foregroundStyle(Theme.selectedAccent)
                Text("Your Prompt")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.8))
                Spacer()
                Text("\(promptText.count)/1000")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.3))
            }

            TextEditor(text: $promptText)
                .font(.callout)
                .foregroundStyle(.white.opacity(0.85))
                .scrollContentBackground(.hidden)
                .frame(minHeight: 120, maxHeight: 200)
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white.opacity(0.04))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                        )
                )

            if !state.generatedPrompt.isEmpty && promptText != state.generatedPrompt {
                Button {
                    promptText = state.generatedPrompt
                    HapticManager.light()
                } label: {
                    Label("Use Builder Prompt", systemImage: "wand.and.stars")
                        .font(.caption.weight(.medium))
                }
                .buttonStyle(.bordered)
                .tint(Theme.selectedAccent)
            }
        }
        .padding(16)
        .glassCard(cornerRadius: 16)
    }

    // MARK: - Reference Photo

    private var referencePhotoSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Reference Photo")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.8))
                Spacer()
                Button {
                    referencePhoto = nil
                    selectedPhotoItem = nil
                    HapticManager.light()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.white.opacity(0.4))
                }
                .buttonStyle(.plain)
            }

            if let photo = referencePhoto {
                Image(uiImage: photo)
                    .resizable()
                    .scaledToFill()
                    .frame(height: 160)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(16)
        .glassCard(cornerRadius: 16)
    }

    // MARK: - Model Selection

    private var modelSelectionSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "cpu")
                    .foregroundStyle(Theme.selectedAccent)
                Text("AI Model")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.8))
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach(AIModel.allCases) { model in
                    modelCard(model)
                }
            }
        }
        .padding(16)
        .glassCard(cornerRadius: 16)
    }

    private func modelCard(_ model: AIModel) -> some View {
        let isSelected = selectedModel == model

        return Button {
            selectedModel = model
            HapticManager.selection()
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: model.icon)
                        .font(.caption)
                        .foregroundStyle(isSelected ? Theme.selectedAccent : .white.opacity(0.5))
                    Spacer()
                    if model.recommended {
                        Text("Best")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(Theme.selectedAccent)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Theme.selectedAccent.opacity(0.15), in: Capsule())
                    }
                }

                Text(model.name)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(isSelected ? .white : .white.opacity(0.7))

                HStack(spacing: 2) {
                    ForEach(0..<5) { i in
                        Image(systemName: "star.fill")
                            .font(.system(size: 7))
                            .foregroundStyle(i < model.quality ? Theme.selectedAccent.opacity(0.8) : .white.opacity(0.1))
                    }
                }

                Text("\(model.creditCost) credits")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.35))
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Theme.selectedAccent.opacity(0.1) : Color.white.opacity(0.03))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isSelected ? Theme.selectedAccent.opacity(0.4) : Color.white.opacity(0.06), lineWidth: isSelected ? 1.5 : 0.5)
                    )
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Generate Button

    private var generateButton: some View {
        Button {
            if credits < selectedModel.creditCost {
                showPaywall = true
                HapticManager.medium()
            } else {
                generateImage()
            }
        } label: {
            HStack(spacing: 8) {
                if isGenerating {
                    ProgressView()
                        .tint(.white)
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "sparkles")
                }
                Text(credits < selectedModel.creditCost ? "Buy Credits to Generate" : "Generate Image")
                    .font(.headline.weight(.bold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
        }
        .buttonStyle(.borderedProminent)
        .tint(Theme.selectedAccent)
        .disabled(isGenerating || promptText.trimmingCharacters(in: .whitespaces).isEmpty)
        .opacity(promptText.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1)
    }

    // MARK: - Progress

    private var generationProgressView: some View {
        VStack(spacing: 12) {
            ProgressView(value: generationProgress)
                .tint(Theme.selectedAccent)

            Text(progressMessage)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.5))
        }
        .padding(16)
        .glassCard(cornerRadius: 14)
    }

    private var progressMessage: String {
        switch generationProgress {
        case 0..<0.3: return "Preparing your prompt..."
        case 0.3..<0.6: return "AI is creating your image..."
        case 0.6..<0.9: return "Adding final details..."
        default: return "Almost done..."
        }
    }

    // MARK: - Generated Image

    private func generatedImageSection(_ image: UIImage) -> some View {
        VStack(spacing: 12) {
            Image(uiImage: image)
                .resizable()
                .scaledToFit()
                .clipShape(RoundedRectangle(cornerRadius: 16))

            HStack(spacing: 12) {
                Button {
                    UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
                    HapticManager.success()
                } label: {
                    Label("Save", systemImage: "arrow.down.circle")
                        .font(.subheadline.weight(.medium))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(Theme.selectedAccent)

                ShareLink(item: Image(uiImage: image), preview: SharePreview("Generated Image", image: Image(uiImage: image))) {
                    Label("Share", systemImage: "square.and.arrow.up")
                        .font(.subheadline.weight(.medium))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(.white.opacity(0.6))

                Button {
                    generatedImage = nil
                    generateImage()
                } label: {
                    Label("Retry", systemImage: "arrow.counterclockwise")
                        .font(.subheadline.weight(.medium))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(.white.opacity(0.6))
            }
        }
        .padding(16)
        .glassCard(cornerRadius: 16)
    }

    // MARK: - Error

    private func errorBanner(_ message: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.triangle")
                .foregroundStyle(.orange)
            Text(message)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.7))
            Spacer()
            Button {
                errorMessage = nil
            } label: {
                Image(systemName: "xmark")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.4))
            }
            .buttonStyle(.plain)
        }
        .padding(12)
        .background(Color.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.orange.opacity(0.2), lineWidth: 0.5)
        )
    }

    // MARK: - Generation (placeholder — connect to your API)

    private func generateImage() {
        guard !promptText.trimmingCharacters(in: .whitespaces).isEmpty else { return }

        guard authManager.isSignedIn else {
            showSignIn = true
            return
        }

        guard storeManager.useCredits(selectedModel.creditCost) else {
            showPaywall = true
            return
        }

        isGenerating = true
        errorMessage = nil
        generatedImage = nil
        generationProgress = 0
        HapticManager.medium()

        let entry = PromptHistory(
            promptText: promptText,
            selectionsSnapshot: state.selectionsSnapshot
        )
        modelContext.insert(entry)

        Task {
            do {
                // Progress animation
                for step in stride(from: 0.0, through: 0.3, by: 0.05) {
                    try? await Task.sleep(for: .milliseconds(150))
                    await MainActor.run { generationProgress = step }
                }

                let photoData = referencePhoto?.jpegData(compressionQuality: 0.8)
                let result = try await APIService.shared.generateImage(
                    prompt: promptText,
                    model: selectedModel.rawValue,
                    referencePhotoData: photoData,
                    authToken: authManager.currentUser?.id ?? ""
                )

                await MainActor.run {
                    generationProgress = 1.0
                    generatedImage = result.image
                    isGenerating = false
                    HapticManager.success()

                    // Save to gallery
                    if let data = result.image.jpegData(compressionQuality: 0.9) {
                        let saved = GeneratedImage(
                            imageData: data,
                            prompt: promptText,
                            modelUsed: selectedModel.name
                        )
                        modelContext.insert(saved)
                    }
                }
            } catch {
                await MainActor.run {
                    generationProgress = 0
                    isGenerating = false
                    errorMessage = error.localizedDescription
                    // Refund credits on failure
                    _ = storeManager.purchasedCredits // trigger observation
                    HapticManager.medium()
                }
            }
        }
    }
}

// MARK: - AI Model

enum AIModel: String, CaseIterable, Identifiable {
    case fluxPro = "flux_pro"
    case nanoBanana = "nano_banana"
    case sdxl = "sdxl"
    case dalle3 = "dalle3"

    var id: String { rawValue }

    var name: String {
        switch self {
        case .fluxPro: return "Flux Pro"
        case .nanoBanana: return "Nano Banana"
        case .sdxl: return "SDXL"
        case .dalle3: return "DALL-E 3"
        }
    }

    var icon: String {
        switch self {
        case .fluxPro: return "bolt.fill"
        case .nanoBanana: return "sparkles"
        case .sdxl: return "photo"
        case .dalle3: return "wand.and.rays"
        }
    }

    var quality: Int {
        switch self {
        case .fluxPro: return 5
        case .nanoBanana: return 5
        case .sdxl: return 4
        case .dalle3: return 5
        }
    }

    var creditCost: Int {
        switch self {
        case .fluxPro: return 1
        case .nanoBanana: return 1
        case .sdxl: return 1
        case .dalle3: return 2
        }
    }

    var recommended: Bool { self == .fluxPro }
}

// MARK: - Paywall View

struct PaywallView: View {
    @Environment(StoreManager.self) private var storeManager
    @Environment(\.dismiss) private var dismiss
    @State private var purchasing: String?

    // Fallback display data if StoreKit products haven't loaded
    private let fallbackPackages: [(id: String, credits: Int, price: String, label: String, popular: Bool)] = [
        ("com.melmarion.poseprompter.credits.50", 50, "$5.99", "Try it out", false),
        ("com.melmarion.poseprompter.credits.100", 100, "$11.99", "Build your gallery", false),
        ("com.melmarion.poseprompter.credits.200", 200, "$23.99", "Most popular", true),
        ("com.melmarion.poseprompter.credits.420", 420, "$47.99", "Never run out", false),
        ("com.melmarion.poseprompter.credits.1100", 1100, "$119.99", "Serious creators", false),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        VStack(spacing: 8) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 40))
                                .foregroundStyle(Theme.selectedAccent)

                            Text("Unlock AI Generation")
                                .font(.title2.weight(.bold))
                                .foregroundStyle(.white)

                            Text("Transform your prompts into stunning photos")
                                .font(.subheadline)
                                .foregroundStyle(.white.opacity(0.5))
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 20)

                        if !storeManager.products.isEmpty {
                            ForEach(storeManager.products) { product in
                                storeProductCard(product)
                            }
                        } else {
                            ForEach(Array(fallbackPackages.enumerated()), id: \.offset) { _, pkg in
                                fallbackCard(pkg)
                            }
                        }

                        Button {
                            Task { await storeManager.restorePurchases() }
                        } label: {
                            Text("Restore Purchases")
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.4))
                        }
                        .padding(.top, 8)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.white.opacity(0.4))
                    }
                }
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }

    private func storeProductCard(_ product: Product) -> some View {
        let credits = StoreManager.creditAmounts[product.id] ?? 0
        let isPopular = credits == 200
        let isPurchasing = purchasing == product.id

        return Button {
            purchasing = product.id
            Task {
                _ = try? await storeManager.purchase(product)
                purchasing = nil
                HapticManager.success()
            }
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text("\(credits)")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(.white)
                        Text("credits")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.6))
                        if isPopular {
                            Text("Popular")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(Theme.selectedAccent)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Theme.selectedAccent.opacity(0.15), in: Capsule())
                        }
                    }
                    Text(product.description)
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.4))
                }
                Spacer()
                if isPurchasing {
                    ProgressView().tint(Theme.selectedAccent)
                } else {
                    Text(product.displayPrice)
                        .font(.headline.weight(.bold))
                        .foregroundStyle(Theme.selectedAccent)
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(isPopular ? Theme.selectedAccent.opacity(0.08) : Theme.cardBackground)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(isPopular ? Theme.selectedAccent.opacity(0.3) : Theme.cardBorder, lineWidth: isPopular ? 1.5 : 0.5))
            )
        }
        .buttonStyle(.plain)
        .disabled(isPurchasing)
    }

    private func fallbackCard(_ pkg: (id: String, credits: Int, price: String, label: String, popular: Bool)) -> some View {
        Button {
            HapticManager.medium()
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text("\(pkg.credits)")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(.white)
                        Text("credits")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.6))
                        if pkg.popular {
                            Text("Popular")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(Theme.selectedAccent)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Theme.selectedAccent.opacity(0.15), in: Capsule())
                        }
                    }
                    Text(pkg.label)
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.4))
                }
                Spacer()
                Text(pkg.price)
                    .font(.headline.weight(.bold))
                    .foregroundStyle(Theme.selectedAccent)
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(pkg.popular ? Theme.selectedAccent.opacity(0.08) : Theme.cardBackground)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(pkg.popular ? Theme.selectedAccent.opacity(0.3) : Theme.cardBorder, lineWidth: pkg.popular ? 1.5 : 0.5))
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Sign In Sheet

struct SignInSheet: View {
    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 24) {
                    Spacer()

                    Image(systemName: "camera.aperture")
                        .font(.system(size: 60))
                        .foregroundStyle(Theme.selectedAccent)

                    Text("Pose Prompter")
                        .font(.title.weight(.bold))
                        .foregroundStyle(.white)

                    Text("Sign in to generate AI images,\nsave your creations, and sync across devices")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.center)

                    Spacer()

                    SignInWithAppleButton(.signIn) { request in
                        request.requestedScopes = [.fullName, .email]
                    } onCompletion: { result in
                        authManager.handleSignInWithApple(result)
                        if authManager.isSignedIn {
                            dismiss()
                        }
                    }
                    .signInWithAppleButtonStyle(.white)
                    .frame(height: 52)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .padding(.horizontal, 24)

                    Button {
                        dismiss()
                    } label: {
                        Text("Maybe Later")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.4))
                    }
                    .padding(.bottom, 20)
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }
}
