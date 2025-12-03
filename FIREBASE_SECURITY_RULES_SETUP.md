# Firebase Security Rules Setup Guide

This guide explains how to set up and deploy Firebase Security Rules for PosePrompt Studio.

## Overview

Firebase Security Rules protect your Firestore database and Storage from unauthorized access. This project includes pre-configured rules that enforce:

- **User Privacy**: Users can only access their own data
- **Package Sharing**: Published packages are readable by everyone, but only owners can modify
- **Review System**: Reviews are public but can only be created/edited by the author
- **File Uploads**: Users can only upload to their own folders with size and type restrictions

## Files Included

- `firestore.rules` - Firestore database security rules
- `storage.rules` - Firebase Storage security rules
- `firestore.indexes.json` - Firestore indexes for optimized queries

## Method 1: Deploy Rules via Firebase CLI (Recommended)

This is the recommended method as it keeps your rules in version control and allows easy deployment.

### Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init
   ```
   - Select your Firebase project
   - Choose Firestore and Storage when prompted
   - Use the existing rules files when asked

### Deploy Rules

**Deploy Firestore Rules:**
```bash
firebase deploy --only firestore:rules
```

**Deploy Storage Rules:**
```bash
firebase deploy --only storage:rules
```

**Deploy Firestore Indexes:**
```bash
firebase deploy --only firestore:indexes
```

**Deploy Everything at Once:**
```bash
firebase deploy
```

### Verify Deployment

After deploying, check the Firebase Console:
1. Go to **Firestore Database** → **Rules** tab
2. Verify the rules match `firestore.rules`
3. Go to **Storage** → **Rules** tab
4. Verify the rules match `storage.rules`

## Method 2: Set Up Rules in Firebase Console (Manual)

If you prefer to set up rules manually in the Firebase Console:

### Firestore Rules Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Open `firestore.rules` from this project
5. Copy the entire contents
6. Paste into the rules editor in Firebase Console
7. Click **"Publish"** button
8. Wait for confirmation that rules are published

### Storage Rules Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage** → **Rules** tab
4. Open `storage.rules` from this project
5. Copy the entire contents
6. Paste into the rules editor in Firebase Console
7. Click **"Publish"** button
8. Wait for confirmation that rules are published

### Firestore Indexes Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **"Add Index"**
5. For each index in `firestore.indexes.json`, create an index:
   - **Collection ID**: `packages` or `reviews`
   - **Fields**: Add fields as specified in the JSON
   - **Query scope**: Collection
   - Click **"Create"**

Alternatively, you can use the Firebase CLI to deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Understanding the Rules

### Firestore Rules (`firestore.rules`)

#### Users Collection
- **Read**: Users can only read their own user document
- **Write**: Users can only create/update/delete their own user document
- **Validation**: Ensures user documents have required fields with correct types

#### Packages Collection
- **Read**: Anyone can read published packages; owners can read their own drafts
- **Create**: Authenticated users can create packages (they become the owner)
- **Update**: Only package owners can update their packages
- **Delete**: Only package owners can delete their packages
- **Validation**: Ensures package data structure is correct

#### Reviews Collection
- **Read**: Anyone can read reviews (public)
- **Create**: Authenticated users can create reviews
- **Update**: Only review authors can update their reviews
- **Delete**: Only review authors can delete their reviews
- **Validation**: Ensures review data structure is correct (rating 1-5, comment max 1000 chars)

### Storage Rules (`storage.rules`)

#### Avatars (`avatars/{userId}/{fileName}`)
- **Read**: Public (anyone can view avatars)
- **Write**: Only the user can upload to their own folder
- **Delete**: Only the user can delete their own files
- **Restrictions**: 
  - Only image files allowed
  - Maximum 5MB per file

#### Package Covers (`package-covers/{userId}/{fileName}`)
- **Read**: Public (anyone can view package covers)
- **Write**: Only the user can upload to their own folder
- **Delete**: Only the user can delete their own files
- **Restrictions**: 
  - Only image files allowed
  - Maximum 5MB per file

## Testing Rules

### Test Firestore Rules

1. Go to **Firestore Database** → **Rules** tab
2. Click **"Rules Playground"** (if available)
3. Test different scenarios:
   - User reading their own document
   - User trying to read another user's document
   - User creating a package
   - User trying to update someone else's package

### Test Storage Rules

1. Go to **Storage** → **Rules** tab
2. Use the Firebase Console to test uploads:
   - Try uploading to your own folder (should work)
   - Try uploading to another user's folder (should fail)
   - Try uploading a file larger than 5MB (should fail)
   - Try uploading a non-image file (should fail)

## Common Issues

### "Permission denied" errors

**Possible causes:**
1. Rules not deployed - Deploy rules using Firebase CLI
2. User not authenticated - Ensure user is signed in
3. Rules syntax error - Check rules for syntax errors in Firebase Console
4. Data structure mismatch - Ensure your data matches the validation rules

**Solutions:**
- Check Firebase Console for rule syntax errors
- Verify user is authenticated: `console.log(auth.currentUser)`
- Review rule logic matches your use case
- Check browser console for specific error messages

### Rules not updating

**Solutions:**
- Wait a few seconds (rules can take time to propagate)
- Clear browser cache
- Check Firebase Console to verify rules were published
- Try deploying again: `firebase deploy --only firestore:rules`

### Index errors

If you see index-related errors:
1. Go to **Firestore Database** → **Indexes** tab
2. Check for pending indexes
3. Wait for indexes to build (can take a few minutes)
4. Or deploy indexes: `firebase deploy --only firestore:indexes`

## Rate Limiting

The current rules include a basic rate limiting check (`checkRateLimit()`), but it's a placeholder. For production, consider:

1. **Cloud Functions**: Implement rate limiting in Cloud Functions
2. **Firebase App Check**: Protect your app from abuse
3. **Custom Backend**: Use a backend service for advanced rate limiting

## Security Best Practices

1. **Never disable rules**: Always have security rules in place
2. **Test thoroughly**: Test rules with different user scenarios
3. **Monitor usage**: Check Firebase Console for unusual activity
4. **Keep rules updated**: Update rules as your app evolves
5. **Use App Check**: Enable Firebase App Check for additional protection
6. **Review regularly**: Periodically review rules for security issues

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security)
- [Firebase Rules Playground](https://firebase.google.com/docs/rules/rules-playground)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

## Next Steps

After setting up security rules:

1. ✅ Test all features with the new rules
2. ✅ Monitor Firebase Console for errors
3. ✅ Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. ✅ Set up Firebase App Check (recommended)
5. ✅ Configure Firebase Monitoring and Alerts

