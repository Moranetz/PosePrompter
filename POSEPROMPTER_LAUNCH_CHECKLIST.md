# PosePrompter Launch Checklist

Use this before shipping a build or changing backend credentials.

## 1. iOS Sign-In

- [ ] Confirm Sign in with Apple completes successfully.
- [ ] Confirm `AuthManager` stores a usable Firebase session.
- [ ] Confirm the app can call `GET /api/credits/balance` with the bearer token.
- [ ] Sign out and sign back in on a clean device.

## 2. App Store Credits

- [ ] Confirm the product IDs in `PosePrompterApp/Shared/StoreManager.swift` match App Store Connect exactly.
- [ ] Confirm each consumable product is available in `Product.products(for:)`.
- [ ] Make one test purchase and confirm the server creates one `appStorePurchases/{transactionId}` record.
- [ ] Restore purchases and confirm already-processed transactions do not double-credit.
- [ ] Confirm Firestore credit balance updates in `users/{uid}.gems`.

## 3. Image Generation

- [ ] Confirm `OPENAI_API_KEY` is set on the server for GPT Image 2 Medium.
- [ ] Confirm any remaining provider keys are set only if those providers are still enabled.
- [ ] Run one generation through `/api/generate-image`.
- [ ] Confirm the response image loads in iOS from either a remote URL or a `data:` URL.
- [ ] Confirm the app updates its displayed balance from `newBalance`.

## 4. Server Configuration

- [ ] Set `APP_STORE_ISSUER_ID`.
- [ ] Set `APP_STORE_KEY_ID`.
- [ ] Set `APP_STORE_PRIVATE_KEY`.
- [ ] Set `APP_STORE_BUNDLE_ID=com.poseprompt.studio`.
- [ ] Set `APP_STORE_ENVIRONMENT=sandbox` for sandbox testing, or leave it unset to try production then sandbox.
- [ ] Confirm Firebase Admin credentials are available to the server.
- [ ] Confirm Firestore writes succeed for credits and purchase records.

## 5. Backend URL

- [ ] Confirm the Settings screen backend override saves and clears correctly.
- [ ] Confirm simulator defaults to `http://127.0.0.1:3001` when no override is set.
- [ ] Confirm device/release builds use the production API URL by default.
- [ ] Confirm the app can switch between local and production backends without reinstalling.

## 6. Smoke Test

- [ ] Sign in.
- [ ] Buy a small credit pack.
- [ ] Generate one image with GPT Image 2 Medium.
- [ ] Restore purchases.
- [ ] Reopen the app and confirm the balance still matches the server.

## 7. Production Hardening

- [ ] Add App Store JWS signature verification on the server if you want stronger purchase validation.
- [ ] Review any remaining fallback UI in the app for accidental local-only behavior.
- [ ] Confirm analytics, logging, and error reporting are working in production.

