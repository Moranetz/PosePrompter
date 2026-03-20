//
//  ContentView.swift
//  PosePromptStudio
//
//  Root view that handles authentication state
//

import SwiftUI

struct ContentView: View {

    // MARK: - Environment

    @EnvironmentObject var networkMonitor: NetworkMonitor

    // MARK: - Body

    var body: some View {
        ZStack {
            // Go straight to main app - no login required
            MainTabView()

            // Network status banner
            if !networkMonitor.isConnected {
                VStack {
                    networkStatusBanner
                    Spacer()
                }
                .transition(.move(edge: .top))
            }
        }
        .animation(.easeInOut, value: networkMonitor.isConnected)
    }

    // MARK: - Subviews

    private var networkStatusBanner: some View {
        HStack {
            Image(systemName: "wifi.slash")
            Text("No Internet Connection")
                .font(.subheadline)
                .fontWeight(.medium)
        }
        .foregroundStyle(.white)
        .padding()
        .frame(maxWidth: .infinity)
        .background(.red.gradient)
    }
}

// MARK: - Preview

#Preview {
    ContentView()
        .environmentObject(NetworkMonitor())
}
