//
//  SignUpView.swift
//  PosePromptStudio
//
//  Sign up screen
//

import SwiftUI

struct SignUpView: View {
    
    // MARK: - Environment
    
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    
    // MARK: - State
    
    @State private var displayName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    
    // MARK: - Body
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    header
                    
                    // Sign up form
                    signUpForm
                    
                    // Error message
                    if let errorMessage = authViewModel.errorMessage {
                        errorBanner(errorMessage)
                    }
                    
                    // Sign up button
                    signUpButton
                    
                    // Terms
                    termsText
                }
                .padding()
            }
            .navigationTitle("Create Account")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    // MARK: - Subviews
    
    private var header: some View {
        VStack(spacing: 12) {
            Image(systemName: "person.crop.circle.fill.badge.plus")
                .font(.system(size: 60))
                .foregroundStyle(.blue.gradient)
            
            Text("Join PosePrompt Studio")
                .font(.title3)
                .fontWeight(.semibold)
        }
        .padding(.vertical)
    }
    
    private var signUpForm: some View {
        VStack(spacing: 16) {
            // Display name field
            TextField("Display Name", text: $displayName)
                .textContentType(.name)
                .autocapitalization(.words)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
            
            // Email field
            TextField("Email", text: $email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .textInputAutocapitalization(.never)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
            
            // Password field
            SecureField("Password", text: $password)
                .textContentType(.newPassword)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
            
            // Confirm password field
            SecureField("Confirm Password", text: $confirmPassword)
                .textContentType(.newPassword)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
            
            // Password requirements
            passwordRequirements
        }
    }
    
    private var passwordRequirements: some View {
        VStack(alignment: .leading, spacing: 4) {
            requirementRow(
                text: "At least 6 characters",
                isMet: password.count >= 6
            )
            requirementRow(
                text: "Passwords match",
                isMet: !password.isEmpty && password == confirmPassword
            )
        }
        .font(.caption)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 4)
    }
    
    private func requirementRow(text: String, isMet: Bool) -> some View {
        HStack(spacing: 6) {
            Image(systemName: isMet ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(isMet ? .green : .secondary)
            Text(text)
                .foregroundStyle(isMet ? .primary : .secondary)
        }
    }
    
    private func errorBanner(_ message: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
            Text(message)
                .font(.subheadline)
        }
        .foregroundStyle(.white)
        .padding()
        .frame(maxWidth: .infinity)
        .background(.red.gradient)
        .cornerRadius(10)
    }
    
    private var signUpButton: some View {
        Button {
            Task {
                await authViewModel.signUp(
                    email: email,
                    password: password,
                    displayName: displayName
                )
                if authViewModel.isAuthenticated {
                    dismiss()
                }
            }
        } label: {
            if authViewModel.isLoading {
                ProgressView()
                    .tint(.white)
            } else {
                Text("Create Account")
                    .fontWeight(.semibold)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .foregroundStyle(.white)
        .background(isFormValid ? Color.blue : Color.gray)
        .cornerRadius(10)
        .disabled(!isFormValid || authViewModel.isLoading)
    }
    
    private var termsText: some View {
        Text("By signing up, you agree to our Terms of Service and Privacy Policy")
            .font(.caption)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
            .padding(.horizontal)
    }
    
    // MARK: - Computed Properties
    
    private var isFormValid: Bool {
        !displayName.isEmpty &&
        authViewModel.isValidEmail(email) &&
        authViewModel.isValidPassword(password) &&
        password == confirmPassword
    }
}

// MARK: - Preview

#Preview {
    SignUpView()
        .environmentObject(AuthViewModel())
}
