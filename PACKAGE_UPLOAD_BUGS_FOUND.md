# Package Upload System Bugs Found

## 🚨 CRITICAL BUG #1: Orphaned Images on Package Creation Failure

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:122-174`

### Problem
**Image upload happens BEFORE package creation:**
1. User uploads cover image → Image saved to Firebase Storage
2. User fills form and clicks "Create Package"
3. Package creation fails (validation, network error, etc.)
4. **Image remains in storage forever - orphaned!**

**Scenario:**
```javascript
// Step 1: Image uploaded (line 156)
await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(storageRef);

// Step 2: User submits form (line 293)
const packageId = await createPackage(user.uid, packageData); // FAILS HERE
// Image already in storage, but package doesn't exist!
```

### Impact
- **CRITICAL**: Storage bloat from orphaned images
- Users waste storage quota
- No way to clean up orphaned images
- Costs money over time

### Fix Required
**Option 1 (Recommended)**: Upload image only after form validation passes
- Validate form first
- Upload image just before package creation
- If package creation fails, delete image

**Option 2**: Cleanup on failure
```javascript
try {
  const packageId = await createPackage(user.uid, packageData);
} catch (error) {
  // Delete uploaded image if package creation fails
  if (formData.coverImageUrl) {
    await deleteObject(ref(storage, fileName));
  }
  throw error;
}
```

---

## 🚨 CRITICAL BUG #2: No Cleanup on Modal Close After Upload

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:102-119`

### Problem
**User uploads image, then closes modal:**
1. User uploads cover image → Image saved to storage
2. User closes modal without creating package
3. **Image remains in storage forever - orphaned!**

**Current cleanup (line 102-119):**
```javascript
useEffect(() => {
  if (!isOpen) {
    setFormData({ ... }); // Resets form state
    // BUT DOESN'T DELETE UPLOADED IMAGE!
  }
}, [isOpen]);
```

### Impact
- **CRITICAL**: Storage bloat from abandoned uploads
- Users can upload images and never create packages
- No cleanup mechanism

### Fix Required
**Cleanup uploaded image when modal closes:**
```javascript
useEffect(() => {
  if (!isOpen) {
    // Cleanup uploaded image if modal closes
    if (formData.coverImageUrl && !formData.coverImageSaved) {
      const fileName = formData.coverImageUrl.split('/').pop();
      deleteObject(ref(storage, `package-covers/${user.uid}/${fileName}`))
        .catch(err => console.error('Failed to cleanup image:', err));
    }
    setFormData({ ... });
  }
}, [isOpen]);
```

---

## 🚨 CRITICAL BUG #3: No Cleanup on Package Deletion

### Location
- **Frontend**: `src/components/MyPackages.jsx` (package deletion)
- **Service**: `src/packageService.js:264-289` (deletePackage function)

### Problem
**When package is deleted, cover image stays in storage:**
1. User deletes package
2. Package document removed from Firestore
3. **Cover image remains in Firebase Storage forever!**

**Current deletePackage (line 264-289):**
```javascript
export const deletePackage = async (packageId) => {
  // ... validation ...
  await deleteDoc(packageRef); // Only deletes Firestore document
  // NO IMAGE DELETION!
}
```

### Impact
- **CRITICAL**: Storage bloat from deleted packages
- Images accumulate over time
- No way to clean up

### Fix Required
**Delete cover image when package is deleted:**
```javascript
export const deletePackage = async (packageId) => {
  // Get package data first to get coverImage URL
  const packageData = await getPackage(packageId);
  
  // Delete Firestore document
  await deleteDoc(packageRef);
  
  // Delete cover image from storage
  if (packageData.coverImage) {
    try {
      // Extract path from URL or construct it
      const imagePath = extractPathFromUrl(packageData.coverImage);
      await deleteObject(ref(storage, imagePath));
    } catch (imageError) {
      logger.warn('[deletePackage] Failed to delete cover image:', imageError);
      // Don't fail package deletion if image deletion fails
    }
  }
}
```

---

## 🐛 BUG #4: Missing Plus Icon Import

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:966`

### Problem
**Code uses `Plus` icon but doesn't import it:**
```javascript
// Line 2: Imports
import { X, Upload, Loader2, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
// Missing: Plus

// Line 966: Usage
{isAdding ? <X size={14} /> : <Plus size={14} />}
```

### Impact
- **Runtime error**: `Plus is not defined`
- UI breaks when trying to add prompts
- Component crashes

### Fix Required
```javascript
import { X, Upload, Loader2, Check, AlertCircle, Image as ImageIcon, Plus } from 'lucide-react';
```

---

## 🐛 BUG #5: Filename Collision Risk

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:152`

### Problem
**Filename uses timestamp + original filename:**
```javascript
const fileName = `package-covers/${user.uid}/${Date.now()}_${file.name}`;
```

**Collision scenarios:**
1. Same user uploads same file twice in same millisecond
2. User uploads file, then immediately uploads again
3. Clock skew or system time issues

### Impact
- Files could overwrite each other
- Lost images
- Confusion

### Fix Required
**Add random component:**
```javascript
const uniqueId = Math.random().toString(36).substring(2, 9);
const fileName = `package-covers/${user.uid}/${Date.now()}_${uniqueId}_${file.name}`;
```

---

## 🐛 BUG #6: No Filename Sanitization

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:152`

### Problem
**Uses original filename directly:**
```javascript
const fileName = `package-covers/${user.uid}/${Date.now()}_${file.name}`;
```

**Security issues:**
- `file.name` could contain path traversal: `../../../etc/passwd`
- Special characters: `file name with spaces & symbols!.jpg`
- Very long filenames
- Unicode issues

### Impact
- **Security risk**: Path traversal attacks
- Storage errors from invalid filenames
- Broken URLs

### Fix Required
**Sanitize filename:**
```javascript
const sanitizeFileName = (fileName) => {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '').replace(/\//g, '_');
  // Remove special characters except dots and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Limit length
  sanitized = sanitized.substring(0, 255);
  return sanitized;
};

const fileName = `package-covers/${user.uid}/${Date.now()}_${sanitizeFileName(file.name)}`;
```

---

## 🐛 BUG #7: No Content-Type Validation in Upload

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:156`

### Problem
**Uploads file without explicit content-type:**
```javascript
await uploadBytes(storageRef, file); // No metadata!
```

**Issues:**
- Browser might not set correct content-type
- File could be uploaded with wrong MIME type
- Storage rules check content-type, but upload doesn't set it

### Impact
- Files might fail storage rules validation
- Incorrect MIME types in storage
- Images might not display correctly

### Fix Required
**Set content-type explicitly:**
```javascript
await uploadBytes(storageRef, file, {
  contentType: file.type || 'image/jpeg',
  customMetadata: {
    uploadedBy: user.uid,
    uploadedAt: new Date().toISOString(),
  }
});
```

---

## 🐛 BUG #8: No Validation of Download URL

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:160`

### Problem
**Gets download URL but doesn't validate it:**
```javascript
const downloadURL = await getDownloadURL(storageRef);
// No validation that URL is valid or accessible
setFormData(prev => ({
  ...prev,
  coverImageUrl: downloadURL, // Could be empty or invalid
}));
```

**If getDownloadURL fails silently or returns invalid URL:**
- Package created with invalid cover image URL
- Broken images in marketplace
- No way to detect issue

### Impact
- Packages with broken cover images
- Poor user experience
- No error detection

### Fix Required
**Validate download URL:**
```javascript
const downloadURL = await getDownloadURL(storageRef);
if (!downloadURL || !downloadURL.startsWith('http')) {
  throw new Error('Failed to get valid download URL');
}
// Optionally verify URL is accessible
try {
  const response = await fetch(downloadURL, { method: 'HEAD' });
  if (!response.ok) {
    throw new Error('Download URL not accessible');
  }
} catch (verifyError) {
  console.warn('[CreatePackageModal] URL verification failed:', verifyError);
  // Continue anyway, but log warning
}
```

---

## 🐛 BUG #9: No Cleanup When Replacing Cover Image

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:122-174, 714`

### Problem
**User uploads new image, old one stays in storage:**
1. User uploads cover image #1 → Saved to storage
2. User uploads cover image #2 → Saved to storage
3. **Image #1 remains in storage forever!**

**Current code (line 714):**
```javascript
onClick={() => setFormData(prev => ({ ...prev, coverImage: null, coverImageUrl: '' }))}
// Only clears state, doesn't delete old image
```

### Impact
- Storage bloat from replaced images
- Multiple versions of same package cover
- Wasted storage

### Fix Required
**Delete old image before uploading new one:**
```javascript
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Delete old image if exists
  if (formData.coverImageUrl) {
    try {
      const oldFileName = extractPathFromUrl(formData.coverImageUrl);
      await deleteObject(ref(storage, oldFileName));
    } catch (deleteError) {
      console.warn('[CreatePackageModal] Failed to delete old image:', deleteError);
      // Continue with new upload anyway
    }
  }

  // ... rest of upload logic ...
};
```

---

## 🐛 BUG #10: No File Extension Validation

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:129`

### Problem
**Only validates MIME type, not file extension:**
```javascript
if (!file.type.startsWith('image/')) {
  setError('Please select a valid image file');
  return;
}
```

**Issues:**
- MIME type can be spoofed
- File could be `.exe` renamed to `.jpg` with image MIME type
- Storage rules check content-type, but file extension might not match

### Impact
- Security risk: Malicious files could be uploaded
- Inconsistent file types
- Potential exploits

### Fix Required
**Validate both MIME type and extension:**
```javascript
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

// Validate MIME type
if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
  setError('Please select a valid image file');
  return;
}

// Validate extension
const fileExtension = file.name.split('.').pop()?.toLowerCase();
if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
  setError('File extension not allowed. Please use JPG, PNG, GIF, or WebP.');
  return;
}
```

---

## 🐛 BUG #11: No Error Recovery for Partial Uploads

### Location
- **Frontend**: `src/components/CreatePackageModal.jsx:168-171`

### Problem
**If upload fails partway through:**
1. Upload starts
2. Network fails mid-upload
3. Partial file might be in storage
4. No cleanup of partial uploads

### Impact
- Partial files in storage
- Storage bloat
- Confusion

### Fix Required
**Use upload task with progress and cleanup on failure:**
```javascript
try {
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  uploadTask.on('state_changed',
    (snapshot) => {
      // Progress tracking
    },
    (error) => {
      // Upload failed - cleanup if needed
      console.error('[CreatePackageModal] Upload failed:', error);
      setError(getErrorMessage(error));
    },
    async () => {
      // Upload complete
      const downloadURL = await getDownloadURL(storageRef);
      // ... set state ...
    }
  );
} catch (err) {
  // Handle errors
}
```

---

## Summary of Required Fixes

### Critical (Must Fix Immediately)
1. **Cleanup orphaned images on package creation failure**
2. **Cleanup uploaded images when modal closes**
3. **Delete cover images when packages are deleted**
4. **Fix missing Plus icon import**

### Important (Should Fix Soon)
5. **Add filename collision prevention**
6. **Sanitize filenames**
7. **Set content-type on upload**
8. **Validate download URLs**
9. **Cleanup when replacing cover images**

### Nice to Have
10. **Validate file extensions**
11. **Handle partial uploads**

---

## Recommended Fix Priority

1. **Fix Plus import** (CRITICAL - breaks UI)
2. **Cleanup on package deletion** (CRITICAL - storage bloat)
3. **Cleanup on modal close** (CRITICAL - storage bloat)
4. **Cleanup on creation failure** (CRITICAL - storage bloat)
5. **Filename sanitization** (IMPORTANT - security)
6. **Content-type validation** (IMPORTANT - data integrity)
7. **Collision prevention** (IMPORTANT - data loss)
8. **Replace cleanup** (IMPORTANT - storage efficiency)
9. **URL validation** (Nice to have)
10. **Extension validation** (Nice to have)
11. **Partial upload handling** (Nice to have)

