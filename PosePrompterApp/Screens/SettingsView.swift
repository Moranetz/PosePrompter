import SwiftUI

struct SettingsView: View {
    @Environment(PromptState.self) private var state
    @Environment(AuthManager.self) private var authManager
    @Environment(StoreManager.self) private var storeManager
    @State private var showResetConfirm = false
    @State private var showSignIn = false
    @State private var backendURLText = AppConfig.savedAPIBaseURLOverride ?? ""

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        accountSection
                        statsSection
                        promptsSection
                        backendSection
                        linksSection
                        actionsSection
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .alert("Reset All Selections?", isPresented: $showResetConfirm) {
                Button("Cancel", role: .cancel) {}
                Button("Reset", role: .destructive) { state.clearAll() }
            } message: {
                Text("This will clear all your current selections and locks.")
            }
            .sheet(isPresented: $showSignIn) {
                SignInSheet()
                    .environment(authManager)
            }
        }
    }

    // MARK: - Account

    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Account", systemImage: "person.circle")
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)

            if let user = authManager.currentUser {
                HStack(spacing: 12) {
                    Image(systemName: "person.crop.circle.fill")
                        .font(.title)
                        .foregroundStyle(Theme.selectedAccent)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(user.displayName)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white)
                        if let email = user.email {
                            Text(email)
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.4))
                        }
                    }
                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("\(storeManager.purchasedCredits)")
                            .font(.title3.weight(.bold).monospacedDigit())
                            .foregroundStyle(Theme.selectedAccent)
                        Text("credits")
                            .font(.caption2)
                            .foregroundStyle(.white.opacity(0.4))
                    }
                }
                .padding(14)
                .glassCard(cornerRadius: 12)

                Button {
                    authManager.signOut()
                } label: {
                    Text("Sign Out")
                        .font(.caption)
                        .foregroundStyle(.red.opacity(0.6))
                }
            } else {
                Button {
                    showSignIn = true
                } label: {
                    Label("Sign In with Apple", systemImage: "applelogo")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(14)
                        .glassCard(cornerRadius: 12)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(16)
        .glassCard()
    }

    // MARK: - Stats

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Your Prompt Stats", systemImage: "chart.bar")
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)

            HStack(spacing: 16) {
                statTile(value: "\(state.selectedCategoryCount)", label: "Active", icon: "checkmark.circle", color: Theme.selectedAccent)
                statTile(value: "\(state.locks.count)", label: "Locked", icon: "lock.fill", color: .orange)
                statTile(value: "\(AllCategories.allCategories.count)", label: "Categories", icon: "square.grid.2x2", color: Theme.sceneColor)
            }
        }
        .padding(16)
        .glassCard()
    }

    private func statTile(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title.weight(.bold).monospacedDigit())
                .foregroundStyle(.white)
            Text(label)
                .font(.caption2.weight(.medium))
                .foregroundStyle(.white.opacity(0.4))
                .textCase(.uppercase)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .glassCard(cornerRadius: 12)
    }

    private var promptsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Your Prompts", systemImage: "text.quote")
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)

            VStack(alignment: .leading, spacing: 6) {
                infoRow(label: "Available Prompts", value: "\(AllCategories.allCategories.reduce(0) { $0 + $1.options.count })")
                infoRow(label: "Categories", value: "\(AllCategories.allCategories.count)")
                infoRow(label: "Groups Active", value: "\(activeGroupCount)/\(CategoryGroup.allCases.count)")
                infoRow(label: "Prompt Length", value: promptWordCount)
                infoRow(label: "Version", value: "1.0.0")
            }
            .padding(14)
            .glassCard(cornerRadius: 12)
        }
        .padding(16)
        .glassCard()
    }

    private var backendSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Backend", systemImage: "server.rack")
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)

            Text("Set the API host for simulator or device testing. Leave blank to use the build default.")
                .font(.caption)
                .foregroundStyle(.white.opacity(0.45))

            TextField("https://api.poseprompter.com", text: $backendURLText)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .foregroundStyle(.white)
                .padding(12)
                .background(Color.white.opacity(0.04), in: RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                )

            HStack(spacing: 10) {
                Button {
                    AppConfig.setAPIBaseURLOverride(backendURLText)
                    backendURLText = AppConfig.savedAPIBaseURLOverride ?? ""
                } label: {
                    Text("Save")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(Theme.selectedAccent, in: Capsule())
                }
                .buttonStyle(.plain)

                Button {
                    AppConfig.clearAPIBaseURLOverride()
                    backendURLText = ""
                } label: {
                    Text("Use Default")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.6))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(Color.white.opacity(0.06), in: Capsule())
                }
                .buttonStyle(.plain)

                Spacer()

                Text(AppConfig.apiBaseURL)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.35))
                    .lineLimit(1)
                    .truncationMode(.middle)
            }
        }
        .padding(16)
        .glassCard()
    }

    private var activeGroupCount: Int {
        CategoryGroup.allCases.filter { group in
            group.categories.contains { state.selectedOption(for: $0.id) != nil }
        }.count
    }

    private var promptWordCount: String {
        let words = state.generatedPrompt.split(separator: " ").count
        return words == 0 ? "—" : "\(words) words"
    }

    private func infoRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.6))
            Spacer()
            Text(value)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white.opacity(0.8))
        }
    }

    private var linksSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Legal", systemImage: "doc.text")
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)

            VStack(spacing: 1) {
                linkRow(title: "Website", icon: "globe", url: "https://poseprompter.com")
                linkRow(title: "Terms of Service", icon: "doc.plaintext", url: "https://poseprompter.com/#terms")
                linkRow(title: "Privacy Policy", icon: "hand.raised", url: "https://poseprompter.com/#privacy")
            }
            .glassCard(cornerRadius: 12)
        }
        .padding(16)
        .glassCard()
    }

    private func linkRow(title: String, icon: String, url: String) -> some View {
        Link(destination: URL(string: url)!) {
            HStack {
                Image(systemName: icon)
                    .font(.subheadline)
                    .foregroundStyle(Theme.selectedAccent)
                    .frame(width: 24)
                Text(title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white)
                Spacer()
                Image(systemName: "arrow.up.right")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.3))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
        }
    }

    private var actionsSection: some View {
        VStack(spacing: 10) {
            Button {
                showResetConfirm = true
            } label: {
                HStack {
                    Image(systemName: "arrow.counterclockwise")
                    Text("Reset All Selections")
                }
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.red.opacity(0.8))
                .frame(maxWidth: .infinity)
                .padding(14)
                .glassCard(cornerRadius: 12)
            }
        }
        .padding(16)
        .glassCard()
    }
}
