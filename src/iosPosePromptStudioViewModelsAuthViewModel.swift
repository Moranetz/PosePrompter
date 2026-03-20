//
//  AuthViewModel.swift
//  PosePromptStudio
//
//  ViewModel for authentication logic
//

import Foundation
import SwiftUI

@MainActor
final class AuthViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // MARK: - Services
    
    private let firebaseService = FirebaseService()
    
    // MARK: - Initialization
    
    init() {
        // Observe Firebase auth state
        Task {
            for await isAuth in firebaseService.$isAuthenticated.values {
                self.isAuthenticated = isAuth
                self.currentUser = firebaseService.currentUser
            }
        }
    }
    
    // MARK: - Authentication Methods
    
    /// Sign in with email and password
    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let user = try await firebaseService.signIn(email: email, password: password)
            currentUser = user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    /// Sign up with email and password
    func signUp(email: String, password: String, displayName: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let user = try await firebaseService.signUp(
                email: email,
                password: password,
                displayName: displayName
            )
            currentUser = user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    /// Sign out
    func signOut() {
        do {
            try firebaseService.signOut()
            currentUser = nil
            isAuthenticated = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    /// Reset password
    func resetPassword(email: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await firebaseService.resetPassword(email: email)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    /// Delete account
    func deleteAccount() async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await firebaseService.deleteAccount()
            currentUser = nil
            isAuthenticated = false
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // MARK: - Validation
    
    func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
    
    func isValidPassword(_ password: String) -> Bool {
        // At least 6 characters
        return password.count >= 6
    }
}
