# Code Review - Critical Issues Found

## 🔴 CRITICAL ISSUES

### 1. Double Crediting Risk
**Location**: `src/components/BuyCreditsModal.jsx:70` and `server/server.js:365`

**Problem**: 
- Frontend calls `/api/confirm-payment` after payment succeeds (line 70)
- Webhook also handles `payment_intent.succeeded` and adds credits (line 365)
- Both could succeed, causing credits to be added twice

**Impact**: Users could receive double credits for a single payment

**Fix**: 
- Remove the `confirm-payment` call from frontend OR
- Add idempotency check in both places to prevent duplicate processing

### 2. No Idempotency in Webhook
**Location**: `server/server.js:365-392`

**Problem**: 
- Webhook doesn't check if credits were already added for this payment intent
- If Stripe retries the webhook, credits could be added multiple times

**Impact**: Duplicate credit additions on webhook retries

**Fix**: 
- Check if transaction already exists before adding credits
- Use paymentIntentId as unique identifier

### 3. Memory Leak - setTimeout Not Cleaned Up
**Location**: `src/components/BuyCreditsModal.jsx:90-95`

**Problem**: 
- `setTimeout` callback could execute after component unmounts
- No cleanup in useEffect return function

**Impact**: Potential memory leaks, callbacks on unmounted components

**Fix**: 
- Store timeout ID and clear it in cleanup function

### 4. Missing Error Handling for Network Failures
**Location**: `src/components/BuyCreditsModal.jsx:320-346`

**Problem**: 
- No handling for network timeouts or connection failures
- User could be stuck in loading state

**Impact**: Poor user experience, stuck UI states

**Fix**: 
- Add timeout to fetch requests
- Add retry logic for transient failures

### 5. No Validation of clientSecret vs paymentIntentId
**Location**: `src/components/BuyCreditsModal.jsx:35-105`

**Problem**: 
- `clientSecret` and `paymentIntentId` are stored separately
- No validation that they match before processing payment

**Impact**: Potential security issue if values get out of sync

**Fix**: 
- Validate clientSecret contains paymentIntentId or verify they match

### 6. Missing Idempotency Key in Payment Intent Creation
**Location**: `server/server.js:313-324`

**Problem**: 
- No idempotency key when creating payment intents
- Duplicate requests could create multiple payment intents

**Impact**: Users could be charged multiple times for same purchase

**Fix**: 
- Add `idempotencyKey` to payment intent creation using userId + creditPackage + timestamp

### 7. Unsafe parseInt in Webhook
**Location**: `server/server.js:370`

**Problem**: 
- `parseInt(paymentIntent.metadata.credits, 10)` without validation
- Could return NaN if metadata is corrupted

**Impact**: Credits could be added as NaN, breaking user balance

**Fix**: 
- Validate parseInt result is a number and > 0

### 8. No Transaction Logging for Failed Payments
**Location**: `server/server.js:395-399`

**Problem**: 
- Failed payments are only logged to console
- No persistent record for analysis

**Impact**: Difficult to track payment failures and refund issues

**Fix**: 
- Log failed payments to Firestore transactions collection

### 9. Legacy confirm-payment Endpoint Still Active
**Location**: `server/server.js:729-795`

**Problem**: 
- Endpoint marked as "legacy" but still functional
- Could be used to bypass webhook security

**Impact**: Security risk, potential for abuse

**Fix**: 
- Remove endpoint OR
- Add strict validation and rate limiting

## 🟡 MEDIUM PRIORITY ISSUES

### 10. Credit Balance Polling Too Frequent
**Location**: `src/components/CreditBalance.jsx:43`

**Problem**: 
- Polls every 30 seconds even when not needed
- Wastes resources

**Fix**: 
- Only poll when modal is open or after purchase

### 11. No Loading State Cleanup
**Location**: `src/components/CreditBalance.jsx:20-46`

**Problem**: 
- If component unmounts during fetch, setState could be called

**Fix**: 
- Use AbortController to cancel fetch on unmount

### 12. Missing Error Boundaries
**Location**: Payment flow components

**Problem**: 
- No error boundaries around payment components
- Errors could crash entire app

**Fix**: 
- Add error boundaries with fallback UI

## 🟢 LOW PRIORITY / CODE QUALITY

### 13. Inconsistent Error Messages
**Location**: Multiple files

**Problem**: 
- Error messages vary in format and detail

**Fix**: 
- Standardize error message format

### 14. Magic Numbers
**Location**: `src/components/BuyCreditsModal.jsx:90` (2000ms delay)

**Problem**: 
- Hardcoded timeout values

**Fix**: 
- Extract to constants

### 15. Missing TypeScript/PropTypes
**Location**: All components

**Problem**: 
- No type checking for props

**Fix**: 
- Add PropTypes or migrate to TypeScript

