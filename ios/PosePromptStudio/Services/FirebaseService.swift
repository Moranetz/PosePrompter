//
//  FirebaseService.swift
//  PosePromptStudio
//
//  Service for Firebase Authentication and Firestore
//

import Foundation
import FirebaseAuth
import FirebaseFirestore

@MainActor
final class FirebaseService: ObservableObject {

    // MARK: - Properties

    @Published var currentUser: User?
    @Published var isAuthenticated = false

    private let auth = Auth.auth()
    private let db = Firestore.firestore()

    // MARK: - Initialization

    init() {
        // Listen for auth state changes
        let _ = auth.addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                self?.isAuthenticated = user != nil
                if let user {
                    try? await self?.fetchUserData(uid: user.uid)
                } else {
                    self?.currentUser = nil
                }
            }
        }
    }

    // MARK: - Authentication Methods

    /// Sign in with email and password
    func signIn(email: String, password: String) async throws -> User {
        let result = try await auth.signIn(withEmail: email, password: password)
        return try await fetchUserData(uid: result.user.uid)
    }

    /// Sign up with email and password
    func signUp(email: String, password: String, displayName: String) async throws -> User {
        let result = try await auth.createUser(withEmail: email, password: password)

        // Update display name
        let changeRequest = result.user.createProfileChangeRequest()
        changeRequest.displayName = displayName
        try await changeRequest.commitChanges()

        // Create user document in Firestore
        let user = User(
            id: result.user.uid,
            email: email,
            displayName: displayName,
            createdAt: Date(),
            subscription: nil
        )

        try await createUserDocument(user: user)

        return user
    }

    /// Sign out
    func signOut() throws {
        try auth.signOut()
        currentUser = nil
        isAuthenticated = false
    }

    /// Reset password
    func resetPassword(email: String) async throws {
        try await auth.sendPasswordReset(withEmail: email)
    }

    /// Delete account
    func deleteAccount() async throws {
        guard let user = auth.currentUser else {
            throw FirebaseError.notAuthenticated
        }

        // Delete user document from Firestore
        try await db.collection("users").document(user.uid).delete()

        // Delete authentication account
        try await user.delete()

        currentUser = nil
        isAuthenticated = false
    }

    // MARK: - Firestore Methods

    /// Fetch user data from Firestore
    @discardableResult
    private func fetchUserData(uid: String) async throws -> User {
        let document = try await db.collection("users").document(uid).getDocument()

        guard let data = document.data() else {
            throw FirebaseError.userNotFound
        }

        let user = try Firestore.Decoder().decode(User.self, from: data)
        self.currentUser = user
        return user
    }

    /// Create user document in Firestore
    private func createUserDocument(user: User) async throws {
        let data = try Firestore.Encoder().encode(user)
        try await db.collection("users").document(user.id).setData(data)
        self.currentUser = user
    }

    /// Update user document
    func updateUser(_ user: User) async throws {
        let data = try Firestore.Encoder().encode(user)
        try await db.collection("users").document(user.id).setData(data, merge: true)
        self.currentUser = user
    }

    // MARK: - Firestore Queries

    /// Generic method to fetch documents from a collection
    func fetchDocuments<T: Decodable>(
        from collection: String,
        where field: String? = nil,
        isEqualTo value: Any? = nil
    ) async throws -> [T] {
        var query: Query = db.collection(collection)

        if let field, let value {
            query = query.whereField(field, isEqualTo: value)
        }

        let snapshot = try await query.getDocuments()

        return try snapshot.documents.compactMap { document in
            try Firestore.Decoder().decode(T.self, from: document.data())
        }
    }

    /// Generic method to add a document to a collection
    func addDocument<T: Encodable>(
        to collection: String,
        data: T,
        documentId: String? = nil
    ) async throws {
        let encodedData = try Firestore.Encoder().encode(data)

        if let documentId {
            try await db.collection(collection).document(documentId).setData(encodedData)
        } else {
            try await db.collection(collection).addDocument(data: encodedData)
        }
    }

    /// Generic method to update a document
    func updateDocument<T: Encodable>(
        in collection: String,
        documentId: String,
        data: T
    ) async throws {
        let encodedData = try Firestore.Encoder().encode(data)
        try await db.collection(collection).document(documentId).setData(encodedData, merge: true)
    }

    /// Generic method to delete a document
    func deleteDocument(
        from collection: String,
        documentId: String
    ) async throws {
        try await db.collection(collection).document(documentId).delete()
    }
}

// MARK: - Errors

enum FirebaseError: LocalizedError {
    case notAuthenticated
    case userNotFound
    case invalidData

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "User is not authenticated"
        case .userNotFound:
            return "User data not found"
        case .invalidData:
            return "Invalid data format"
        }
    }
}
