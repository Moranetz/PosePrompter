//
//  Config.swift
//  PosePromptStudio
//
//  Environment configuration
//

import Foundation

enum Config {
    
    // MARK: - API Configuration
    
    /// Base URL for the backend API
    /// - Development: Use localhost for simulator, IP address for physical device
    /// - Production: Use your production server URL
    static var apiBaseURL: String {
        #if DEBUG
        // For iOS Simulator
        return "http://localhost:3001"
        
        // For physical device testing, uncomment and use your computer's IP:
        // return "http://192.168.1.100:3001"
        #else
        // Production URL - UPDATE THIS before release
        return "https://api.poseprompt.studio"
        #endif
    }
    
    // MARK: - Stripe Configuration
    
    /// Stripe publishable key
    /// Get this from: https://dashboard.stripe.com/apikeys
    static var stripePublishableKey: String {
        #if DEBUG
        // Test mode key
        return "pk_test_YOUR_TEST_KEY_HERE"
        #else
        // Live mode key - UPDATE THIS before release
        return "pk_live_YOUR_LIVE_KEY_HERE"
        #endif
    }
    
    // MARK: - API Endpoints
    
    enum Endpoint {
        static let health = "/api/health"
        static let auth = "/api/auth"
        static let users = "/api/users"
        static let poses = "/api/poses"
        static let subscription = "/api/subscription"
        static let payment = "/api/payment"
        
        // Add more endpoints as needed
    }
    
    // MARK: - App Configuration
    
    /// App version
    static var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }
    
    /// Build number
    static var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }
    
    /// Bundle identifier
    static var bundleIdentifier: String {
        Bundle.main.bundleIdentifier ?? "com.poseprompt.studio"
    }
    
    // MARK: - Feature Flags
    
    enum Features {
        /// Enable offline mode
        static let offlineMode = true
        
        /// Enable analytics
        static let analytics = true
        
        /// Enable push notifications
        static let pushNotifications = true
        
        /// Enable haptic feedback
        static let haptics = true
    }
    
    // MARK: - Cache Configuration
    
    enum Cache {
        /// Cache expiration time in seconds
        static let expirationTime: TimeInterval = 3600 // 1 hour
        
        /// Maximum cache size in bytes
        static let maxSize: Int = 100 * 1024 * 1024 // 100 MB
    }
}
