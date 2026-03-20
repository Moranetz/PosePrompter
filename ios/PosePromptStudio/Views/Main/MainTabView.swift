//
//  MainTabView.swift
//  PosePromptStudio
//
//  Main tab bar interface after login
//

import SwiftUI

struct MainTabView: View {

    // MARK: - State

    @State private var selectedTab = 0

    // MARK: - Body

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home tab
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            // Library tab
            PromptLibraryView()
                .tabItem {
                    Label("Library", systemImage: "photo.stack.fill")
                }
                .tag(1)

            // Prompt Builder tab
            PromptBuilderView()
                .tabItem {
                    Label("Create", systemImage: "plus.circle.fill")
                }
                .tag(2)

            // Profile tab
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(3)
        }
    }
}

// MARK: - Home View

struct HomeView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Welcome to PosePrompt Studio")
                        .font(.title)
                        .fontWeight(.bold)

                    // Add your home content here
                    // This is where you'll display featured poses, recent activity, etc.

                    VStack(spacing: 16) {
                        featureCard(
                            icon: "figure.walk",
                            title: "Browse Poses",
                            description: "Explore our extensive library"
                        )

                        featureCard(
                            icon: "paintbrush.fill",
                            title: "Create Custom Poses",
                            description: "Design your own references"
                        )

                        featureCard(
                            icon: "square.and.arrow.up.fill",
                            title: "Export & Share",
                            description: "Save and share your work"
                        )
                    }
                    .padding()
                }
            }
            .navigationTitle("Home")
        }
    }

    private func featureCard(icon: String, title: String, description: String) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundStyle(.blue.gradient)
                .frame(width: 60, height: 60)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Profile View

struct ProfileView: View {

    var body: some View {
        NavigationStack {
            List {
                // User info section
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.blue.gradient)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Guest User")
                                .font(.title3)
                                .fontWeight(.semibold)
                            Text("Not signed in")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }

                // Subscription section
                Section("Subscription") {
                    NavigationLink("Upgrade to Premium") {
                        SubscriptionView()
                    }
                }

                // Settings section
                Section("Settings") {
                    NavigationLink {
                        Text("Account Settings")
                    } label: {
                        Label("Account", systemImage: "person.fill")
                    }

                    NavigationLink {
                        Text("Preferences")
                    } label: {
                        Label("Preferences", systemImage: "gearshape.fill")
                    }

                    NavigationLink {
                        Text("Help & Support")
                    } label: {
                        Label("Help & Support", systemImage: "questionmark.circle.fill")
                    }
                }

                // About section
                Section {
                    NavigationLink {
                        Text("About PosePrompt Studio")
                    } label: {
                        Label("About", systemImage: "info.circle.fill")
                    }
                }
            }
            .navigationTitle("Profile")
        }
    }
}

// MARK: - Subscription View

struct SubscriptionView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Choose Your Plan")
                    .font(.title)
                    .fontWeight(.bold)

                ForEach([SubscriptionPlan.basic, .premium, .pro], id: \.self) { plan in
                    planCard(plan: plan)
                }
            }
            .padding()
        }
        .navigationTitle("Subscription")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func planCard(plan: SubscriptionPlan) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(plan.displayName)
                        .font(.title2)
                        .fontWeight(.bold)
                    Text(plan.price)
                        .font(.headline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                if plan == .premium {
                    Text("Popular")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(.blue)
                        .foregroundStyle(.white)
                        .cornerRadius(8)
                }
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                ForEach(plan.features, id: \.self) { feature in
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                        Text(feature)
                            .font(.subheadline)
                    }
                }
            }

            Button("Subscribe") {
                // Add subscription action
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .frame(maxWidth: .infinity)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
}

// MARK: - Preview

#Preview {
    MainTabView()
}
