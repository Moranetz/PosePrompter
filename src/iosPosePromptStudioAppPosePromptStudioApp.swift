//
//  PosePromptStudioApp.swift
//  PosePromptStudio
//
//  Created for iOS
//

import SwiftUI
import FirebaseCore

@main
struct PosePromptStudioApp: App {
    
    // MARK: - Properties
    
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var networkMonitor = NetworkMonitor()
    
    // MARK: - Initialization
    
    init() {
        // Configure Firebase
        FirebaseApp.configure()
        
        // Configure appearance
        configureAppearance()
    }
    
    // MARK: - Body
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel)
                .environmentObject(networkMonitor)
                .preferredColorScheme(nil) // Supports both light and dark mode
        }
    }
    
    // MARK: - Private Methods
    
    private func configureAppearance() {
        // Customize navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        
        // Customize tab bar appearance
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
    }
}
