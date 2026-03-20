//
//  ForgotPasswordView.swift
//  PosePromptStudio
//
//  Forgot password screen
//

import SwiftUI

struct ForgotPasswordView: View {

    // MARK: - Environment

    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    // MARK: - State

    @State private var email = ""
    @State private var showSuccess = false

    // MARK: - Body

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Header
                header

                // Email field
                emailField

                // Error message
                if let errorMessage = authViewModel.errorMessage {
                    errorBanner(errorMessage)
                }

                // Success message
                if showSuccess {
                    successBanner
                }

                // Reset button
                resetButton

                Spacer()
            }
            .padding()
            .navigationTitle("Reset Password")
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
            Image(systemName: "key.fill")
                .font(.system(size: 60))
                .foregroundStyle(.blue.gradient)

            Text("Forgot your password?")
                .font(.title3)
                .fontWeight(.semibold)

            Text("Enter your email and we'll send you a link to reset your password")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical)
    }

    private var emailField: some View {
        TextField("Email", text: $email)
            .textContentType(.emailAddress)
            .keyboardType(.emailAddress)
            .textInputAutocapitalization(.never)
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(10)
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

    private var successBanner: some View {
        HStack {
            Image(systemName: "checkmark.circle.fill")
            Text("Password reset email sent! Check your inbox.")
                .font(.subheadline)
        }
        .foregroundStyle(.white)
        .padding()
        .frame(maxWidth: .infinity)
        .background(.green.gradient)
        .cornerRadius(10)
    }

    private var resetButton: some View {
        Button {
            Task {
                await authViewModel.resetPassword(email: email)
                if authViewModel.errorMessage == nil {
                    showSuccess = true

                    // Dismiss after 2 seconds
                    try? await Task.sleep(for: .seconds(2))
                    dismiss()
                }
            }
        } label: {
            if authViewModel.isLoading {
                ProgressView()
                    .tint(.white)
            } else {
                Text("Send Reset Link")
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

    // MARK: - Computed Properties

    private var isFormValid: Bool {
        authViewModel.isValidEmail(email)
    }
}

// MARK: - Preview

#Preview {
    ForgotPasswordView()
        .environmentObject(AuthViewModel())
}
