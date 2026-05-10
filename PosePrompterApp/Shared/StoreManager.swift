import StoreKit
import SwiftUI

@Observable
final class StoreManager {
    private(set) var products: [Product] = []
    private(set) var purchasedCredits: Int = 0
    private(set) var isLoading = false

    // Product IDs — configure these in App Store Connect
    static let productIDs: [String] = [
        "com.moranetz.poseprompter.credits.50",
        "com.moranetz.poseprompter.credits.100",
        "com.moranetz.poseprompter.credits.200",
        "com.moranetz.poseprompter.credits.420",
        "com.moranetz.poseprompter.credits.1100",
    ]

    // Credit amounts per product
    static let creditAmounts: [String: Int] = [
        "com.moranetz.poseprompter.credits.50": 50,
        "com.moranetz.poseprompter.credits.100": 100,
        "com.moranetz.poseprompter.credits.200": 200,
        "com.moranetz.poseprompter.credits.420": 420,
        "com.moranetz.poseprompter.credits.1100": 1100,
    ]

    private let creditsKey = "PosePrompter_Credits"

    init() {
        purchasedCredits = UserDefaults.standard.integer(forKey: creditsKey)
        Task { await loadProducts() }
        Task { await listenForTransactions() }
    }

    func loadProducts() async {
        isLoading = true
        do {
            products = try await Product.products(for: Self.productIDs)
                .sorted { $0.price < $1.price }
        } catch {
            products = []
        }
        isLoading = false
    }

    func purchase(_ product: Product) async throws -> Bool {
        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            let credits = Self.creditAmounts[product.id] ?? 0
            addCredits(credits)
            await transaction.finish()
            return true

        case .userCancelled:
            return false

        case .pending:
            return false

        @unknown default:
            return false
        }
    }

    func restorePurchases() async {
        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result) {
                let credits = Self.creditAmounts[transaction.productID] ?? 0
                addCredits(credits)
                await transaction.finish()
            }
        }
    }

    func useCredits(_ amount: Int) -> Bool {
        guard purchasedCredits >= amount else { return false }
        purchasedCredits -= amount
        UserDefaults.standard.set(purchasedCredits, forKey: creditsKey)
        return true
    }

    private func addCredits(_ amount: Int) {
        purchasedCredits += amount
        UserDefaults.standard.set(purchasedCredits, forKey: creditsKey)
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let value):
            return value
        }
    }

    private func listenForTransactions() async {
        for await result in Transaction.updates {
            if let transaction = try? checkVerified(result) {
                let credits = Self.creditAmounts[transaction.productID] ?? 0
                addCredits(credits)
                await transaction.finish()
            }
        }
    }

    enum StoreError: Error {
        case failedVerification
    }
}
