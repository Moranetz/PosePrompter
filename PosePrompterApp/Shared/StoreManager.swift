import StoreKit
import SwiftUI

@Observable
final class StoreManager {
    private(set) var products: [Product] = []
    private(set) var purchasedCredits: Int = 0
    private(set) var isLoading = false

    // Product IDs — configure these in App Store Connect
    static let productIDs: [String] = [
        "com.melmarion.poseprompter.credits.50",
        "com.melmarion.poseprompter.credits.100",
        "com.melmarion.poseprompter.credits.200",
        "com.melmarion.poseprompter.credits.420",
        "com.melmarion.poseprompter.credits.1100",
    ]

    // Credit amounts per product
    static let creditAmounts: [String: Int] = [
        "com.melmarion.poseprompter.credits.50": 50,
        "com.melmarion.poseprompter.credits.100": 100,
        "com.melmarion.poseprompter.credits.200": 200,
        "com.melmarion.poseprompter.credits.420": 420,
        "com.melmarion.poseprompter.credits.1100": 1100,
    ]

    init() {
        Task { await loadProducts() }
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

    func purchase(_ product: Product, authToken: String) async throws -> Bool {
        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            let _ = try await redeemPurchase(
                productId: product.id,
                transactionId: String(transaction.id),
                authToken: authToken
            )
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

    func restorePurchases(authToken: String) async {
        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result) {
                do {
                    let _ = try await redeemPurchase(
                        productId: transaction.productID,
                        transactionId: String(transaction.id),
                        authToken: authToken
                    )
                    await transaction.finish()
                } catch {
                    print("[StoreManager] Failed to redeem restored purchase: \(error.localizedDescription)")
                }
            }
        }
    }

    func setCredits(_ amount: Int) {
        purchasedCredits = max(0, amount)
    }

    func syncCredits(authToken: String) async {
        do {
            let balance = try await APIService.shared.checkCredits(authToken: authToken)
            setCredits(balance)
        } catch {
            print("[StoreManager] Failed to sync credits: \(error.localizedDescription)")
        }
    }

    func reconcilePurchases(authToken: String) async {
        await restorePurchases(authToken: authToken)
        await syncCredits(authToken: authToken)
    }

    func redeemPurchase(productId: String, transactionId: String, authToken: String) async throws -> Int {
        let newBalance = try await APIService.shared.redeemAppStorePurchase(
            productId: productId,
            transactionId: transactionId,
            authToken: authToken
        )
        setCredits(newBalance)
        return newBalance
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let value):
            return value
        }
    }

    enum StoreError: Error {
        case failedVerification
    }
}
