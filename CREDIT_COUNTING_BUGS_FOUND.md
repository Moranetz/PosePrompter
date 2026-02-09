# Credit Counting System Bugs Found

## 🚨 CRITICAL BUG #1: addUserCredits is NOT Atomic

### Location
- **Backend**: `server/server.js:303-348`

### Problem
`addUserCredits()` uses a **non-atomic read-then-write pattern**:
```javascript
const userDoc = await userRef.get();  // Read
// ... calculate newBalance ...
await userRef.update({ gems: newBalance });  // Write
```

**Race condition scenario:**
1. Webhook adds 100 credits: reads balance=50, calculates 150, writes 150
2. Simultaneously, refund adds 50 credits: reads balance=50, calculates 100, writes 100
3. **Result: User gets 100 credits instead of 200! Second write overwrites first**

**Compare to `deductUserCredits()`:**
- Uses `db.runTransaction()` - atomic ✓
- Prevents race conditions ✓

### Impact
- **CRITICAL**: Credits can be lost in race conditions
- Multiple simultaneous credit additions can overwrite each other
- Refunds and payments happening simultaneously can lose credits
- **Financial data corruption**

### Fix Required
Make `addUserCredits()` atomic using transactions:
```javascript
const addUserCredits = async (userId, amount) => {
  // ... validation ...
  
  const result = await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      // Create user atomically
      transaction.set(userRef, {
        gems: amount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return amount;
    }
    
    const userData = userDoc.data();
    const currentCredits = userData.gems || userData.credits || 0;
    const newBalance = currentCredits + amount;
    
    // Validate
    if (isNaN(newBalance) || newBalance < currentCredits) {
      throw new Error(`Invalid balance calculation`);
    }
    
    // Atomically update
    transaction.update(userRef, {
      gems: newBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return newBalance;
  });
  
  return result;
};
```

---

## 🚨 CRITICAL BUG #2: Webhook Idempotency Race Condition

### Location
- **Backend**: `server/server.js:706-729`

### Problem
**Idempotency check has a race condition:**
```javascript
// Step 1: Check if transaction exists
const existingTransaction = await db.collection('transactions')
  .where('paymentIntentId', '==', paymentIntent.id)
  .where('status', '==', 'completed')
  .limit(1)
  .get();

if (!existingTransaction.empty) {
  // Already processed
  break;
}

// Step 2: Add credits (NOT ATOMIC!)
const newBalance = await addUserCredits(userId, creditsToAdd);

// Step 3: Log transaction
await db.collection('transactions').add({ ... });
```

**Race condition scenario:**
1. Webhook #1: Checks transactions → none found → proceeds
2. Webhook #2 (retry): Checks transactions → none found yet → proceeds
3. Webhook #1: Adds credits → logs transaction
4. Webhook #2: Adds credits again → logs transaction
5. **Result: Credits added twice!**

**The problem:** Check and add are separate operations. Between check and add, another webhook can pass the check.

### Impact
- **CRITICAL**: Users can get double credits from webhook retries
- Stripe retries webhooks up to 3 times
- Each retry could add credits again
- **Financial loss**

### Fix Required
**Option 1 (Recommended)**: Use transaction document as lock
```javascript
// Try to create transaction document atomically
const transactionRef = db.collection('transactions').doc();
try {
  await transactionRef.set({
    userId,
    paymentIntentId: paymentIntent.id,
    credits: creditsToAdd,
    status: 'processing',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: false }); // Fails if document exists
  
  // Document created = we're the first to process
  const newBalance = await addUserCredits(userId, creditsToAdd);
  
  // Update transaction to completed
  await transactionRef.update({ status: 'completed', newBalance });
  
} catch (error) {
  // Document already exists = already processed
  if (error.code === 6) { // ALREADY_EXISTS
    console.log(`[webhook] Payment intent ${paymentIntent.id} already processed`);
    break;
  }
  throw error;
}
```

**Option 2**: Use Firestore transaction for check+add+log
```javascript
await db.runTransaction(async (transaction) => {
  // Check if already processed
  const existingQuery = db.collection('transactions')
    .where('paymentIntentId', '==', paymentIntent.id)
    .where('status', '==', 'completed')
    .limit(1);
  const existing = await transaction.get(existingQuery);
  
  if (!existing.empty) {
    throw new Error('Already processed'); // Transaction will rollback
  }
  
  // Add credits atomically
  const userRef = db.collection('users').doc(userId);
  const userDoc = await transaction.get(userRef);
  // ... add credits in transaction ...
  
  // Log transaction atomically
  const txRef = db.collection('transactions').doc();
  transaction.set(txRef, { ... });
});
```

---

## 🚨 CRITICAL BUG #3: Transaction Logging After Credit Addition

### Location
- **Backend**: `server/server.js:718-729`

### Problem
**Order of operations:**
1. Add credits (line 718)
2. Log transaction (line 721-729)

**If logging fails:**
- Credits are already added
- No transaction record exists
- Webhook retries → checks transactions → none found → adds credits again
- **Result: Double credits!**

**If logging succeeds but credit addition failed:**
- Transaction record exists
- Credits not added
- User paid but got no credits
- Webhook won't retry (thinks it succeeded)

### Impact
- **CRITICAL**: Credits added but no record = double crediting on retry
- Credits not added but record exists = user loses money
- Inconsistent state between credits and transaction log

### Fix Required
**Make credit addition and transaction logging atomic:**
```javascript
await db.runTransaction(async (transaction) => {
  // Check idempotency
  // Add credits
  // Log transaction
  // All in one atomic transaction
});
```

---

## 🐛 BUG #4: confirm-payment Can Still Add Credits

### Location
- **Backend**: `server/server.js:1312-1404`
- **Frontend**: `src/components/BuyCreditsModal.jsx:102` (comment says webhook handles it)

### Problem
**Even though frontend comment says "webhook will handle credit addition":**
- `/api/confirm-payment` endpoint still exists and works
- Has idempotency check, but **race condition with webhook**
- If both webhook and confirm-payment run simultaneously:
  1. Webhook checks transactions → none found → proceeds
  2. confirm-payment checks transactions → none found → proceeds
  3. Both add credits
  4. **Result: Double credits!**

### Impact
- Users can get double credits if both endpoints run
- Legacy endpoint should be removed or disabled

### Fix Required
**Option 1**: Remove endpoint entirely
**Option 2**: Make it return early if webhook already processed
**Option 3**: Use same atomic transaction pattern as webhook

---

## 🐛 BUG #5: No Integer Validation

### Location
- **Backend**: `server/server.js:303-348, 264-300`

### Problem
Credits are stored as numbers, but:
- No validation that they're integers
- Floating point operations could create decimals
- `parseInt()` could return NaN if input is invalid
- Division operations (like creator compensation) could create decimals

**Example:**
```javascript
const creditsToAdd = parseInt(paymentIntent.metadata.credits, 10);
// If metadata.credits is "50.5", parseInt returns 50 (loses precision)
// If metadata.credits is "abc", parseInt returns NaN
```

### Impact
- Credits could become decimals (50.5 gems)
- NaN could break balance calculations
- Inconsistent credit amounts

### Fix Required
```javascript
// Validate and ensure integer
if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
  throw new Error(`Invalid credit amount: ${amount}. Must be a positive integer.`);
}
amount = Math.floor(Math.max(0, Number(amount)));
```

---

## 🐛 BUG #6: Negative Balance Possible (Edge Case)

### Location
- **Backend**: `server/server.js:264-300, 303-348`

### Problem
**Scenario:**
1. User has 10 credits
2. Request 1: Deducts 10 credits (atomic) → balance = 0
3. Request 2: Tries to deduct 5 credits → fails (insufficient) ✓
4. But if refund happens after deduction:
   - Refund adds credits using non-atomic `addUserCredits()`
   - If balance was already 0, could theoretically go negative if calculation is wrong

**Actually, validation prevents this:**
- `addUserCredits` validates `amount > 0` ✓
- `deductUserCredits` validates `amount > 0` ✓
- But no explicit check that balance can't go negative

### Impact
- Edge case, but could cause issues
- Negative balances would break UI
- Could allow users to generate with negative balance

### Fix Required
Add explicit validation:
```javascript
if (newBalance < 0) {
  throw new Error('Balance cannot be negative');
}
```

---

## 🐛 BUG #7: gems vs credits Field Inconsistency

### Location
- **Backend**: `server/server.js:260, 282, 325`
- **Frontend**: `src/utils/paymentService.js:213`

### Problem
Code checks both `gems` and `credits` fields:
```javascript
return userData.gems || userData.credits || 0;
```

**Issues:**
1. If both fields exist with different values, which one is used?
2. Updates always write to `gems`, but reads check `credits` too
3. Could lead to inconsistent state
4. Migration from `credits` to `gems` is incomplete

### Impact
- Inconsistent credit balances
- Users might see wrong balance
- Data migration issues

### Fix Required
**Standardize on `gems` everywhere:**
- Remove `credits` field checks
- Migrate all `credits` to `gems`
- Update all code to only use `gems`

---

## 🐛 BUG #8: Creator Compensation Race Condition

### Location
- **Frontend**: `src/utils/paymentService.js:107-195`

### Problem
**Creator compensation uses non-atomic increments:**
```javascript
await updateDoc(creatorRef, {
  gems: increment(compensationPerCreator),
  updatedAt: serverTimestamp(),
});
```

**But this is actually OK** because `increment()` is atomic in Firestore.

**However, the calculation has issues:**
```javascript
const compensationPerCreator = Math.max(
  MIN_COMPENSATION_GEMS,
  Math.ceil(gemsPurchased * CREATOR_COMPENSATION_PERCENTAGE)
);
```

If user has 10 installed packages:
- Each creator gets: `Math.ceil(100 * 0.05) = 5 gems`
- Total awarded: `10 * 5 = 50 gems`
- But user only purchased 100 gems
- **Creators get 50% of purchase, not 5%!**

### Impact
- **CRITICAL**: Creator compensation is calculated per creator, not total
- If user has many installed packages, compensation exceeds purchase amount
- **Financial loss**

### Fix Required
**Calculate total compensation, then divide:**
```javascript
const totalCompensation = Math.ceil(gemsPurchased * CREATOR_COMPENSATION_PERCENTAGE);
const compensationPerCreator = Math.max(
  MIN_COMPENSATION_GEMS,
  Math.ceil(totalCompensation / creatorIds.size)
);
```

---

## 🐛 BUG #9: No Validation of Credit Field Type

### Location
- **Backend**: `server/server.js:282, 325`

### Problem
```javascript
const currentCredits = userData.gems || userData.credits || 0;
```

**What if `gems` is a string?**
- `"50" || 0` returns `"50"` (string)
- `"50" + 10` = `"5010"` (string concatenation!)
- Balance becomes corrupted

### Impact
- Credit balances could become strings
- Math operations break
- Data corruption

### Fix Required
```javascript
let currentCredits = userData.gems ?? userData.credits ?? 0;
currentCredits = Number(currentCredits);
if (isNaN(currentCredits) || currentCredits < 0) {
  currentCredits = 0;
}
```

---

## 🐛 BUG #10: Webhook Error Swallows Credit Addition Failure

### Location
- **Backend**: `server/server.js:732-735`

### Problem
```javascript
} catch (creditError) {
  console.error('[webhook] Error updating credits:', creditError);
  // Don't fail the webhook - log error for manual review
}
```

**If credit addition fails:**
- Error is logged but webhook returns success
- Stripe thinks webhook succeeded
- Credits never added
- User paid but got nothing
- No retry from Stripe

### Impact
- Users lose money
- No automatic retry
- Requires manual intervention

### Fix Required
**Return error to Stripe so it retries:**
```javascript
} catch (creditError) {
  console.error('[webhook] Error updating credits:', creditError);
  // Return error so Stripe retries
  return res.status(500).json({ error: 'Failed to process payment' });
}
```

---

## Summary of Required Fixes

### Critical (Must Fix Immediately)
1. **Make addUserCredits atomic** - Use transactions
2. **Fix webhook idempotency race condition** - Use atomic check+add+log
3. **Fix creator compensation calculation** - Divide total, not per creator
4. **Fix webhook error handling** - Return error to trigger retry

### Important (Should Fix Soon)
5. **Remove or fix confirm-payment endpoint** - Prevent double crediting
6. **Add integer validation** - Ensure credits are always integers
7. **Add negative balance check** - Prevent negative balances
8. **Standardize gems field** - Remove credits field checks

### Nice to Have
9. **Add type validation** - Ensure credits are numbers, not strings
10. **Better error messages** - More descriptive credit errors

---

## Recommended Fix Priority

1. **Make addUserCredits atomic** (CRITICAL - financial bug)
2. **Fix webhook race condition** (CRITICAL - double crediting)
3. **Fix creator compensation** (CRITICAL - financial loss)
4. **Fix webhook error handling** (IMPORTANT - lost payments)
5. **Remove confirm-payment** (IMPORTANT - double crediting risk)
6. **Add validations** (IMPORTANT - data integrity)
7. **Standardize fields** (Nice to have)

