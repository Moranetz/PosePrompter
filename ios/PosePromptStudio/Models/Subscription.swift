//
//  Subscription.swift
//  PosePromptStudio
//
//  Stripe subscription model
//

import Foundation

struct Subscription: Codable {
    let id: String
    let status: SubscriptionStatus
    let plan: SubscriptionPlan
    let currentPeriodStart: Date
    let currentPeriodEnd: Date
    let cancelAtPeriodEnd: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case status
        case plan
        case currentPeriodStart
        case currentPeriodEnd
        case cancelAtPeriodEnd
    }
}

// MARK: - Subscription Status

enum SubscriptionStatus: String, Codable {
    case active
    case canceled
    case incomplete
    case incompleteExpired = "incomplete_expired"
    case pastDue = "past_due"
    case trialing
    case unpaid
}

// MARK: - Subscription Plan

enum SubscriptionPlan: String, Codable {
    case free
    case basic
    case premium
    case pro

    var displayName: String {
        switch self {
        case .free: return "Free"
        case .basic: return "Basic"
        case .premium: return "Premium"
        case .pro: return "Pro"
        }
    }

    var price: String {
        switch self {
        case .free: return "$0/month"
        case .basic: return "$9.99/month"
        case .premium: return "$19.99/month"
        case .pro: return "$49.99/month"
        }
    }

    var features: [String] {
        switch self {
        case .free:
            return [
                "Basic pose library",
                "Limited exports",
                "Watermarked images"
            ]
        case .basic:
            return [
                "Full pose library",
                "Unlimited exports",
                "No watermarks",
                "HD quality"
            ]
        case .premium:
            return [
                "Everything in Basic",
                "Advanced editing tools",
                "Custom poses",
                "Priority support"
            ]
        case .pro:
            return [
                "Everything in Premium",
                "API access",
                "Team collaboration",
                "White label options"
            ]
        }
    }
}

// MARK: - Mock Data

extension Subscription {
    static let mock = Subscription(
        id: "sub_123",
        status: .active,
        plan: .premium,
        currentPeriodStart: Date(),
        currentPeriodEnd: Calendar.current.date(byAdding: .month, value: 1, to: Date())!,
        cancelAtPeriodEnd: false
    )
}
