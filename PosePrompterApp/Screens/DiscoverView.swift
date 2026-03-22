import SwiftUI
import SwiftData

// MARK: - Seen Posts Tracker

final class SeenPostsTracker: ObservableObject {
    private let key = "PosePrompter_SeenPostIDs"
    @Published private(set) var seenIDs: Set<String>

    init() {
        let stored = UserDefaults.standard.stringArray(forKey: key) ?? []
        seenIDs = Set(stored)
    }

    func markSeen(_ postID: String) {
        guard seenIDs.insert(postID).inserted else { return }
        UserDefaults.standard.set(Array(seenIDs), forKey: key)
    }

    func hasSeen(_ postID: String) -> Bool {
        seenIDs.contains(postID)
    }

    var unseenCount: Int {
        DiscoverPost.samples.count - seenIDs.count
    }
}

// MARK: - Likes Manager

final class LikesManager: ObservableObject {
    private let likesKey = "PosePrompter_UserLikes"
    private let countsKey = "PosePrompter_LikeCounts"
    @Published private(set) var likedIDs: Set<String>
    @Published private(set) var likeCounts: [String: Int]

    init() {
        let storedLikes = UserDefaults.standard.stringArray(forKey: likesKey) ?? []
        likedIDs = Set(storedLikes)

        // Initialize counts: base likes from post data + user community likes
        if let storedCounts = UserDefaults.standard.dictionary(forKey: countsKey) as? [String: Int] {
            likeCounts = storedCounts
        } else {
            // Seed with the base likes from each post
            var initial: [String: Int] = [:]
            for post in DiscoverPost.samples {
                initial[post.id] = post.likes
            }
            likeCounts = initial
            UserDefaults.standard.set(initial, forKey: countsKey)
        }
    }

    func toggleLike(_ postID: String) {
        if likedIDs.contains(postID) {
            likedIDs.remove(postID)
            likeCounts[postID, default: 0] -= 1
        } else {
            likedIDs.insert(postID)
            likeCounts[postID, default: 0] += 1
        }
        UserDefaults.standard.set(Array(likedIDs), forKey: likesKey)
        UserDefaults.standard.set(likeCounts, forKey: countsKey)
    }

    func isLiked(_ postID: String) -> Bool {
        likedIDs.contains(postID)
    }

    func count(for postID: String) -> Int {
        likeCounts[postID] ?? 0
    }
}

struct DiscoverView: View {
    @Environment(PromptState.self) private var state
    @Environment(\.modelContext) private var modelContext
    @StateObject private var seenTracker = SeenPostsTracker()
    @StateObject private var likesManager = LikesManager()
    @State private var selectedPost: DiscoverPost?
    @State private var copiedPostId: String?
    @State private var searchText = ""
    @State private var selectedTag: String?

    private var allTags: [String] {
        var seen = Set<String>()
        var result: [String] = []
        for post in DiscoverPost.samples {
            for tag in post.tags {
                if seen.insert(tag).inserted {
                    result.append(tag)
                }
            }
        }
        return result
    }

    private var filteredPosts: [DiscoverPost] {
        var posts = DiscoverPost.samples
        if let tag = selectedTag {
            posts = posts.filter { $0.tags.contains(tag) }
        }
        if !searchText.isEmpty {
            let query = searchText.lowercased()
            posts = posts.filter {
                $0.title.lowercased().contains(query) ||
                $0.prompt.lowercased().contains(query) ||
                $0.tags.contains(where: { $0.lowercased().contains(query) })
            }
        }
        let seenIDs = seenTracker.seenIDs
        let counts = likesManager.likeCounts
        let isSearching = !searchText.isEmpty || selectedTag != nil

        posts.sort { a, b in
            if isSearching {
                // When searching/filtering: rank by likes first
                let aLikes = counts[a.id] ?? 0
                let bLikes = counts[b.id] ?? 0
                if aLikes != bLikes { return aLikes > bLikes }
            } else {
                // Default feed: unseen first, then by likes
                let aUnseen = !seenIDs.contains(a.id)
                let bUnseen = !seenIDs.contains(b.id)
                if aUnseen != bUnseen { return aUnseen }
                let aLikes = counts[a.id] ?? 0
                let bLikes = counts[b.id] ?? 0
                if aLikes != bLikes { return aLikes > bLikes }
            }
            return false
        }
        return posts
    }

    private var leftColumnPosts: [DiscoverPost] {
        filteredPosts.enumerated().compactMap { $0.offset % 2 == 0 ? $0.element : nil }
    }

    private var rightColumnPosts: [DiscoverPost] {
        filteredPosts.enumerated().compactMap { $0.offset % 2 == 1 ? $0.element : nil }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        tagFilterBar
                        masonryGrid
                    }
                    .padding(.horizontal, 10)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Discover")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if seenTracker.unseenCount > 0 {
                        Text("\(seenTracker.unseenCount) new")
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(Theme.selectedAccent)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Theme.selectedAccent.opacity(0.15), in: Capsule())
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Search prompts...")
            .sheet(item: $selectedPost) { post in
                DiscoverDetailSheet(post: post, likesManager: likesManager)
                    .environment(state)
            }
        }
    }

    // MARK: - Tag Filter Bar

    private var tagFilterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                tagChip(nil, label: "All")
                ForEach(allTags, id: \.self) { tag in
                    tagChip(tag, label: tag)
                }
            }
            .padding(.horizontal, 6)
        }
    }

    private func tagChip(_ tag: String?, label: String) -> some View {
        let isActive = selectedTag == tag
        return Button {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                selectedTag = tag
            }
            HapticManager.light()
        } label: {
            Text(label)
                .font(.caption.weight(isActive ? .semibold : .regular))
                .foregroundStyle(isActive ? .white : .white.opacity(0.55))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(isActive ? Theme.selectedAccent.opacity(0.3) : Color.white.opacity(0.06))
                )
                .overlay(
                    Capsule()
                        .stroke(isActive ? Theme.selectedAccent.opacity(0.5) : Color.white.opacity(0.08), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Masonry Grid

    private var masonryGrid: some View {
        HStack(alignment: .top, spacing: 10) {
            LazyVStack(spacing: 10) {
                ForEach(leftColumnPosts) { post in
                    DiscoverCard(
                        post: post,
                        isCopied: copiedPostId == post.id,
                        isSeen: seenTracker.hasSeen(post.id),
                        isLiked: likesManager.isLiked(post.id),
                        likeCount: likesManager.count(for: post.id),
                        onTap: {
                            seenTracker.markSeen(post.id)
                            selectedPost = post
                        },
                        onCopy: { copyPrompt(post) },
                        onLike: {
                            likesManager.toggleLike(post.id)
                            HapticManager.light()
                        }
                    )
                }
            }
            LazyVStack(spacing: 10) {
                ForEach(rightColumnPosts) { post in
                    DiscoverCard(
                        post: post,
                        isCopied: copiedPostId == post.id,
                        isSeen: seenTracker.hasSeen(post.id),
                        isLiked: likesManager.isLiked(post.id),
                        likeCount: likesManager.count(for: post.id),
                        onTap: {
                            seenTracker.markSeen(post.id)
                            selectedPost = post
                        },
                        onCopy: { copyPrompt(post) },
                        onLike: {
                            likesManager.toggleLike(post.id)
                            HapticManager.light()
                        }
                    )
                }
            }
        }
    }

    private func copyPrompt(_ post: DiscoverPost) {
        UIPasteboard.general.string = post.prompt
        copiedPostId = post.id
        HapticManager.success()

        let entry = PromptHistory(
            promptText: post.prompt,
            selectionsSnapshot: [:]
        )
        modelContext.insert(entry)

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            if copiedPostId == post.id { copiedPostId = nil }
        }
    }
}

// MARK: - Discover Card

struct DiscoverCard: View {
    let post: DiscoverPost
    let isCopied: Bool
    let isSeen: Bool
    let isLiked: Bool
    let likeCount: Int
    let onTap: () -> Void
    let onCopy: () -> Void
    let onLike: () -> Void

    var body: some View {
        Button {
            onTap()
        } label: {
            VStack(alignment: .leading, spacing: 0) {
                ZStack(alignment: .bottomLeading) {
                    CachedAsyncImage(url: post.imageURL) {
                        Theme.cardBackground
                    }
                    .aspectRatio(1 / post.aspectRatio, contentMode: .fill)
                    .clipped()
                    .opacity(isSeen ? 0.7 : 1.0)

                    LinearGradient(
                        colors: [.clear, .black.opacity(0.6)],
                        startPoint: .center,
                        endPoint: .bottom
                    )

                    HStack(spacing: 4) {
                        ForEach(post.tags.prefix(2), id: \.self) { tag in
                            Text(tag)
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundStyle(.white.opacity(0.9))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 3)
                                .background(.ultraThinMaterial.opacity(0.7), in: Capsule())
                        }
                    }
                    .padding(10)
                }
                .clipShape(UnevenRoundedRectangle(topLeadingRadius: 14, bottomLeadingRadius: 0, bottomTrailingRadius: 0, topTrailingRadius: 14))

                VStack(alignment: .leading, spacing: 6) {
                    Text(post.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .lineLimit(1)

                    Text(post.prompt)
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.4))
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)

                    HStack(spacing: 6) {
                        // Like button + count
                        Button {
                            onLike()
                        } label: {
                            HStack(spacing: 3) {
                                Image(systemName: isLiked ? "heart.fill" : "heart")
                                    .font(.caption2)
                                    .foregroundStyle(isLiked ? .red : .white.opacity(0.4))
                                Text(formatCompact(likeCount))
                                    .font(.system(size: 10, weight: .medium).monospacedDigit())
                                    .foregroundStyle(isLiked ? .red.opacity(0.8) : .white.opacity(0.35))
                            }
                        }
                        .buttonStyle(.plain)

                        Text(post.author)
                            .font(.caption2)
                            .foregroundStyle(.white.opacity(0.25))
                            .lineLimit(1)

                        Spacer()

                        Button {
                            onCopy()
                        } label: {
                            Image(systemName: isCopied ? "checkmark" : "doc.on.doc")
                                .font(.caption2)
                                .foregroundStyle(isCopied ? .green : .white.opacity(0.4))
                                .frame(width: 28, height: 28)
                                .background(Color.white.opacity(0.06), in: Circle())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 10)
            }
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(Theme.cardBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(Theme.cardBorder, lineWidth: 0.5)
                    )
            )
        }
        .buttonStyle(CardPressStyle())
    }

    private func formatCompact(_ n: Int) -> String {
        if n >= 1000 { return String(format: "%.1fK", Double(n) / 1000.0) }
        return "\(n)"
    }
}

struct CardPressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Detail Sheet

struct DiscoverDetailSheet: View {
    let post: DiscoverPost
    @ObservedObject var likesManager: LikesManager
    @Environment(PromptState.self) private var state
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @State private var copiedFeedback = false
    @State private var heartScale: CGFloat = 1.0

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        heroImage
                        VStack(alignment: .leading, spacing: 16) {
                            actionButtons
                            promptSection
                            tagsSection
                            statsSection
                        }
                        .padding(.horizontal)
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
                    Button {
                        copyPrompt()
                    } label: {
                        Image(systemName: copiedFeedback ? "checkmark.circle.fill" : "doc.on.doc")
                            .foregroundStyle(copiedFeedback ? .green : .white.opacity(0.7))
                    }
                }
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }

    private var heroImage: some View {
        ZStack(alignment: .bottomLeading) {
            CachedAsyncImage(url: post.imageURL) {
                Theme.cardBackground
            }
            .aspectRatio(1 / post.aspectRatio, contentMode: .fill)
            .frame(maxWidth: .infinity)
            .clipped()

            LinearGradient(
                colors: [.clear, .clear, .black.opacity(0.7)],
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(alignment: .leading, spacing: 4) {
                Text(post.title)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.white)
                Text("by \(post.author)")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.7))
            }
            .padding(20)
        }
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal)
        .padding(.top, 8)
    }

    private var actionButtons: some View {
        HStack(spacing: 10) {
            // Use as Template — primary action
            Button {
                state.loadFromPreset(entryIDs: post.entryIDs)
                // Find preset index
                if let idx = DiscoverPost.samples.firstIndex(where: { $0.id == post.id }) {
                    state.currentPresetIndex = idx
                }
                state.navigateToBuilder = true
                dismiss()
                HapticManager.medium()
            } label: {
                Label("Use as Template", systemImage: "wand.and.stars")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.selectedAccent)
            .controlSize(.regular)

            // Copy
            Button {
                copyPrompt()
            } label: {
                Label(
                    copiedFeedback ? "Copied!" : "Copy",
                    systemImage: copiedFeedback ? "checkmark" : "doc.on.doc"
                )
                .font(.subheadline.weight(.medium))
            }
            .buttonStyle(.bordered)
            .tint(copiedFeedback ? .green : .white.opacity(0.6))
            .controlSize(.regular)

            ShareLink(item: post.prompt) {
                Image(systemName: "square.and.arrow.up")
                    .font(.subheadline.weight(.medium))
                    .frame(width: 44, height: 36)
            }
            .buttonStyle(.bordered)
            .tint(.white.opacity(0.6))
        }
    }

    private var promptSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "text.quote")
                    .foregroundStyle(Theme.selectedAccent)
                Text("Full Prompt")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(.white)
                Spacer()
                Text("\(post.prompt.split(separator: " ").count) words")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.35))
            }

            Text(post.prompt)
                .font(.callout)
                .foregroundStyle(.white.opacity(0.8))
                .textSelection(.enabled)
                .lineSpacing(4)
        }
        .padding(16)
        .glassCard(cornerRadius: 16)
    }

    private var tagsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Tags")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white.opacity(0.6))

            FlowLayout(spacing: 8) {
                ForEach(post.tags, id: \.self) { tag in
                    Text(tag)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.white.opacity(0.7))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.white.opacity(0.06), in: Capsule())
                        .overlay(
                            Capsule()
                                .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                        )
                }
            }
        }
    }

    private var statsSection: some View {
        HStack(spacing: 20) {
            // Tappable like button
            Button {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                    likesManager.toggleLike(post.id)
                    heartScale = 1.3
                }
                HapticManager.light()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    withAnimation(.spring(response: 0.2)) {
                        heartScale = 1.0
                    }
                }
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: likesManager.isLiked(post.id) ? "heart.fill" : "heart")
                        .font(.body)
                        .foregroundStyle(likesManager.isLiked(post.id) ? .red : .white.opacity(0.5))
                        .scaleEffect(heartScale)
                    Text(formatNumber(likesManager.count(for: post.id)))
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(likesManager.isLiked(post.id) ? .red.opacity(0.8) : .white.opacity(0.5))
                }
            }
            .buttonStyle(.plain)

            HStack(spacing: 6) {
                Image(systemName: "bookmark.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.selectedAccent.opacity(0.7))
                Text(formatNumber(post.saves))
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.white.opacity(0.5))
            }
            Spacer()
        }
        .padding(.horizontal, 4)
    }

    private func copyPrompt() {
        UIPasteboard.general.string = post.prompt
        copiedFeedback = true
        HapticManager.success()

        let entry = PromptHistory(promptText: post.prompt, selectionsSnapshot: [:])
        modelContext.insert(entry)

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            copiedFeedback = false
        }
    }

    private func formatNumber(_ n: Int) -> String {
        if n >= 1000 { return String(format: "%.1fK", Double(n) / 1000.0) }
        return "\(n)"
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        layout(proposal: proposal, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: y + rowHeight), positions)
    }
}
