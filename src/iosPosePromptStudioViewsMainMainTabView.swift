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
            LibraryView()
                .tabItem {
                    Label("Library", systemImage: "photo.stack.fill")
                }
                .tag(1)
            
            // Create tab
            CreateView()
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

// MARK: - Library View

struct LibraryView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Text("Your pose library will appear here")
                    .foregroundStyle(.secondary)
                
                // Add your library grid/list here
            }
            .navigationTitle("Library")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        // Add filter/sort action
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
        }
    }
}

// MARK: - Create View

struct CreateView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.blue.gradient)
                
                Text("Create New Pose")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("Start creating your custom pose reference")
                    .foregroundStyle(.secondary)
                
                Button("Get Started") {
                    // Add create action
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .navigationTitle("Create")
        }
    }
}

// MARK: - Profile View

struct ProfileView: View {
    
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        NavigationStack {
            List {
                // User info section
                Section {
                    if let user = authViewModel.currentUser {
                        HStack {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 60))
                                .foregroundStyle(.blue.gradient)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.displayName)
                                    .font(.title3)
                                    .fontWeight(.semibold)
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }
                
                // Subscription section
                Section("Subscription") {
                    if let subscription = authViewModel.currentUser?.subscription {
                        HStack {
                            VStack(alignment: .leading) {
                                Text(subscription.plan.displayName)
                                    .font(.headline)
                                Text(subscription.plan.price)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            
                            Spacer()
                            
                            Text(subscription.status.rawValue.capitalized)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(subscription.status == .active ? Color.green : Color.orange)
                                .foregroundStyle(.white)
                                .cornerRadius(6)
                        }
                    } else {
                        NavigationLink("Upgrade to Premium") {
                            SubscriptionView()
                        }
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
                
                // Sign out section
                Section {
                    Button(role: .destructive) {
                        authViewModel.signOut()
                    } label: {
                        Label("Sign Out", systemImage: "arrow.right.square.fill")
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
        .environmentObject(AuthViewModel())
}
