# Image Upload Process Bugs Found

## 🚨 CRITICAL BUG #1: Upload Failure After Credit Deduction

### Location
- **Backend**: `server/server.js:995-1000`

### Problem
**Order of operations is WRONG:**
1. Line 995: Upload to Firebase Storage
2. Line 999: Deduct credits
3. Line 1000: Set `creditsDeducted = true`

**If upload succeeds but credit deduction fails:**
- Image is uploaded to storage
- Credits are NOT deducted (deduction failed)
- `creditsDeducted` remains `false`
- Error is caught, but NO refund happens (because `creditsDeducted` is false)
- **Result: User gets free image, no credits charged!**

**If upload fails:**
- Credits aren't deducted (good)
- But generated image URL is lost forever
- User paid for generation but got nothing

### Impact
- **CRITICAL**: Users can get images without paying if credit deduction fails
- Generated images can be lost if upload fails
- No cleanup of orphaned images

### Fix Required
**Option 1 (Recommended)**: Deduct credits BEFORE upload
- Check credits
- Deduct credits (atomic transaction)
- Then upload
- If upload fails, refund credits

**Option 2**: Make upload and credit deduction atomic
- Use a transaction that includes both operations
- Rollback both if either fails

---

## 🚨 CRITICAL BUG #2: Storage Rules Size Limit Mismatch

### Location
- **Frontend**: `src/components/FacePhotosPage.jsx:206` - 5MB limit
- **Backend**: `server/server.js:475, 531` - 10MB limit
- **Storage Rules**: `storage.rules:17` - 5MB limit

### Problem
- Frontend validates 5MB
- Backend validates 10MB
- Storage rules enforce 5MB

**Scenario:**
1. User uploads 7MB face photo
2. Frontend rejects it (5MB limit) ✓
3. But if frontend validation is bypassed, backend would accept 7MB
4. Storage rules would REJECT it (5MB limit)
5. Upload fails, but backend might have already processed it

**For generated images:**
- Backend allows 10MB
- Storage rules only allow 5MB
- Generated images > 5MB will FAIL to upload
- Credits already deducted, image lost

### Impact
- Generated images > 5MB will fail to upload
- Users charged but get no image
- Inconsistent limits across system

### Fix Required
**Standardize to 5MB everywhere:**
- Update backend limit from 10MB to 5MB
- Update all validation messages
- Ensure storage rules match

---

## 🐛 BUG #3: makePublic() May Fail Silently

### Location
- **Backend**: `server/server.js:489, 545`

### Problem
```javascript
await file.makePublic();
return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
```

If `makePublic()` fails:
- No error handling
- Function continues and returns URL
- Image might not be publicly accessible
- Frontend tries to display image, gets 403 error

### Impact
- Images might not be accessible
- Users see broken images
- No error message to debug

### Fix Required
```javascript
try {
  await file.makePublic();
} catch (publicError) {
  console.error('[uploadImageToStorage] Failed to make public:', publicError);
  // Try alternative: set public metadata directly
  await file.setMetadata({ metadata: { public: 'true' } });
  // Or throw error to trigger refund
  throw new Error('Failed to make image publicly accessible');
}
```

---

## 🐛 BUG #4: No Cleanup on Upload Failure

### Location
- **Backend**: `server/server.js:995`

### Problem
If upload fails after AI generation succeeds:
1. AI provider returns image URL
2. Upload to Firebase Storage fails
3. Error is thrown
4. Credits are refunded (if deducted)
5. **But the generated image URL is lost forever**
6. User paid for generation, got nothing, can't retry

### Impact
- Lost generated images
- Wasted AI API costs
- Poor user experience

### Fix Required
**Option 1**: Return original URL if upload fails
```javascript
try {
  const firebaseUrl = await uploadImageToStorage(userId, imageUrl, imageId);
  return firebaseUrl;
} catch (uploadError) {
  // Return original URL as fallback
  console.warn('[generate-image] Upload failed, returning original URL:', uploadError);
  return imageUrl; // Return provider URL directly
}
```

**Option 2**: Retry upload with exponential backoff
**Option 3**: Store original URL in metadata for retry

---

## 🐛 BUG #5: ImageId Collision Risk

### Location
- **Backend**: `server/server.js:994`

### Problem
```javascript
const imageId = `img_${Date.now()}_${userId}`;
```

If two requests happen in the same millisecond:
- Same `Date.now()` value
- Same `userId`
- **Same imageId**
- Second upload overwrites first image
- First user loses their image

### Impact
- Image overwrites
- Lost images
- Data corruption

### Fix Required
Add random component:
```javascript
const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${userId}`;
```

Or use UUID:
```javascript
import { randomUUID } from 'crypto';
const imageId = `img_${randomUUID()}_${userId}`;
```

---

## 🐛 BUG #6: No Retry Logic for Upload Failures

### Location
- **Backend**: `server/server.js:456-558`

### Problem
If upload fails due to:
- Network timeout
- Temporary storage error
- Rate limiting

The error is immediately thrown, no retry attempted.

### Impact
- Temporary failures cause permanent failures
- Poor reliability
- Wasted AI generation costs

### Fix Required
Add retry logic with exponential backoff:
```javascript
const maxRetries = 3;
let retries = 0;
while (retries < maxRetries) {
  try {
    await file.save(buffer, { metadata: { contentType: 'image/png' } });
    break; // Success
  } catch (error) {
    retries++;
    if (retries >= maxRetries) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
  }
}
```

---

## 🐛 BUG #7: Face Photo Duplicate Check is Race Condition

### Location
- **Frontend**: `src/components/FacePhotosPage.jsx:282-287`

### Problem
```javascript
setFacePhotos(prev => {
  const exists = prev.some(p => p.fullPath === newPhoto.fullPath);
  if (exists) {
    return prev; // Skip duplicate
  }
  return [newPhoto, ...prev];
});
```

**Race condition:**
1. User uploads same file twice quickly
2. First upload starts, `uploading = true`
3. Second upload checks state, `prev` doesn't have first upload yet
4. Both uploads proceed
5. Both create files with same name (overwrites, but still duplicate in state)

### Impact
- Duplicate uploads possible
- Wasted storage
- Confusing UI

### Fix Required
**Option 1**: Check storage before upload
```javascript
// Check if file already exists in storage
const existingFiles = await listAll(ref(storage, `face-photos/${user.uid}`));
const exists = existingFiles.items.some(item => item.name === fileName);
if (exists) {
  setError('This photo already exists');
  return;
}
```

**Option 2**: Use unique filename (timestamp + random)
```javascript
const fileName = `face-photos/${user.uid}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${file.name}`;
```

---

## 🐛 BUG #8: No Validation of Upload Success

### Location
- **Backend**: `server/server.js:539-546`

### Problem
```javascript
await file.save(Buffer.from(buffer), {
  metadata: { contentType: 'image/png' }
});
await file.makePublic();
return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
```

No verification that:
- File actually saved
- File is accessible
- URL is valid

### Impact
- Might return invalid URLs
- Images might not be accessible
- Hard to debug

### Fix Required
Verify upload succeeded:
```javascript
await file.save(buffer, { metadata: { contentType: 'image/png' } });
await file.makePublic();

// Verify file exists and is accessible
const [exists] = await file.exists();
if (!exists) {
  throw new Error('File upload verification failed');
}

// Verify URL is accessible (optional, might be slow)
// const testResponse = await fetch(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
// if (!testResponse.ok) {
//   throw new Error('Uploaded file is not accessible');
// }

return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
```

---

## 🐛 BUG #9: Content-Type Not Preserved for Data URIs

### Location
- **Backend**: `server/server.js:466-490`

### Problem
```javascript
if (imageUrl.startsWith('data:image/')) {
  const base64Data = imageUrl.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  // ...
  await file.save(buffer, {
    metadata: { contentType: 'image/png' } // Always PNG!
  });
}
```

Data URI might be `data:image/jpeg;base64,...` but saved as PNG.

### Impact
- Wrong content-type
- Browser might not display correctly
- Metadata mismatch

### Fix Required
Extract content-type from data URI:
```javascript
if (imageUrl.startsWith('data:image/')) {
  const [header, base64Data] = imageUrl.split(',');
  const mimeMatch = header.match(/data:image\/([^;]+)/);
  const contentType = mimeMatch ? `image/${mimeMatch[1]}` : 'image/png';
  
  await file.save(buffer, {
    metadata: { contentType: contentType }
  });
}
```

---

## 🐛 BUG #10: No Timeout for makePublic()

### Location
- **Backend**: `server/server.js:489, 545`

### Problem
`makePublic()` has no timeout. If it hangs:
- Request hangs indefinitely
- User waits forever
- Server resource exhaustion

### Impact
- Hanging requests
- Poor user experience
- Resource exhaustion

### Fix Required
Add timeout wrapper or use Promise.race:
```javascript
const makePublicWithTimeout = Promise.race([
  file.makePublic(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('makePublic timeout')), 10000)
  )
]);
await makePublicWithTimeout;
```

---

## Summary of Required Fixes

### Critical (Must Fix Immediately)
1. **Fix upload/credit deduction order** - Deduct credits before upload, or make atomic
2. **Standardize size limits** - All 5MB everywhere
3. **Handle makePublic() failures** - Add error handling

### Important (Should Fix Soon)
4. **Add cleanup on upload failure** - Return original URL or retry
5. **Fix imageId collision** - Add random component
6. **Add retry logic** - For temporary failures

### Nice to Have
7. **Fix face photo duplicate check** - Check storage, not just state
8. **Validate upload success** - Verify file exists
9. **Preserve content-type** - Extract from data URI
10. **Add timeout for makePublic()** - Prevent hanging

---

## Recommended Fix Priority

1. **Fix upload/credit order** (CRITICAL - financial bug)
2. **Standardize size limits** (CRITICAL - causes failures)
3. **Handle makePublic() failures** (IMPORTANT - broken images)
4. **Add cleanup/retry** (IMPORTANT - lost images)
5. **Fix imageId collision** (IMPORTANT - data loss)
6. **Others** (Nice to have)

