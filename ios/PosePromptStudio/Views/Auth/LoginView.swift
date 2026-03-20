//
//  LoginView.swift
//  PosePromptStudio
//
//  Login screen
//

import SwiftUI

struct LoginView: View {

    // MARK: - Environment

    @EnvironmentObject var authViewModel: AuthViewModel

    // MARK: - State

    @State private var email = ""
    @State private var password = ""
    @State private var showSignUp = false
    @State private var showForgotPassword = false

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Logo and title
                    header

                    // Login form
                    loginForm

                    // Error message
                    if let errorMessage = authViewModel.errorMessage {
                        errorBanner(errorMessage)
                    }

                    // Sign in button
                    signInButton

                    // Forgot password
                    forgotPasswordButton

                    Divider()
                        .padding(.vertical)

                    // Sign up
                    signUpButton
                }
                .padding()
            }
            .navigationTitle("Welcome")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showSignUp) {
                SignUpView()
            }
            .sheet(isPresented: $showForgotPassword) {
                ForgotPasswordView()
            }
        }
    }

    // MARK: - Subviews

    private var header: some View {
        VStack(spacing: 12) {
            Image(systemName: "figure.walk")
                .font(.system(size: 80))
                .foregroundStyle(.blue.gradient)

            Text("PosePrompt Studio")
                .font(.title)
                .fontWeight(.bold)

            Text("Your creative pose reference tool")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 40)
        .padding(.bottom, 20)
    }

    private var loginForm: some View {
        VStack(spacing: 16) {
            // Email field
            TextField("Email", text: $email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)

            // Password field
            SecureField("Password", text: $password)
                .textContentType(.password)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
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

    private var signInButton: some View {
        Button {
            Task {
                await authViewModel.signIn(email: email, password: password)
            }
        } label: {
            if authViewModel.isLoading {
                ProgressView()
                    .tint(.white)
            } else {
                Text("Sign In")
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

    private var forgotPasswordButton: some View {
        Button("Forgot Password?") {
            showForgotPassword = true
        }
        .font(.subheadline)
    }

    private var signUpButton: some View {
        HStack {
            Text("Don't have an account?")
                .foregroundStyle(.secondary)

            Button("Sign Up") {
                showSignUp = true
            }
            .fontWeight(.semibold)
        }
        .font(.subheadline)
    }

    // MARK: - Computed Properties

    private var isFormValid: Bool {
        authViewModel.isValidEmail(email) && authViewModel.isValidPassword(password)
    }
}

// MARK: - Preview

#Preview {
    LoginView()
        .environmentObject(AuthViewModel())
}
