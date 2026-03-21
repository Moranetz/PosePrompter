import SwiftUI

struct SettingsView: View {
    @Environment(PromptState.self) private var state
    @State private var showResetConfirm = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // Stats
                        statsSection

                        // About
                        aboutSection

                        // Actions
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
                Button("Reset", role: .destructive) {
                    state.clearAll()
                }
            } message: {
                Text("This will clear all your current selections and locks.")
            }
        }
    }

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Your Prompt Stats", systemImage: "chart.bar")
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)

            HStack(spacing: 16) {
                statTile(
                    value: "\(state.selectedCategoryCount)",
                    label: "Active",
                    icon: "checkmark.circle",
                    color: Theme.selectedAccent
                )
                statTile(
                    value: "\(state.locks.count)",
                    label: "Locked",
                    icon: "lock.fill",
                    color: .orange
                )
                statTile(
                    value: "\(AllCategories.allCategories.count)",
                    label: "Categories",
                    icon: "square.grid.2x2",
                    color: Theme.sceneColor
                )
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

    private var aboutSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("About", systemImage: "info.circle")
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)

            VStack(alignment: .leading, spacing: 8) {
                Text("Pose Prompter")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                Text("A creative tool for generating detailed photo prompts. Select from 32 categories covering body poses, facial expressions, styling, camera settings, and more — then combine them into a complete prompt for AI image generation.")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.5))
                    .lineSpacing(3)
            }
            .padding(14)
            .glassCard(cornerRadius: 12)

            VStack(alignment: .leading, spacing: 6) {
                infoRow(label: "Categories", value: "\(AllCategories.allCategories.count)")
                infoRow(label: "Total Prompts", value: "\(AllCategories.allCategories.reduce(0) { $0 + $1.options.count })")
                infoRow(label: "Version", value: "1.0.0")
            }
            .padding(14)
            .glassCard(cornerRadius: 12)
        }
        .padding(16)
        .glassCard()
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
