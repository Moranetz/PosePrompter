# Deployment Checklist

Use this checklist before deploying PosePrompt Studio to production.

## Pre-Deployment

### Code Quality
- [ ] Remove all `console.log()` statements from production code
- [ ] Remove all `console.error()` statements or replace with proper error logging
- [ ] Remove debug code and commented-out code
- [ ] Run linter and fix all warnings/errors
- [ ] Ensure all TypeScript/JavaScript errors are resolved

### Testing
- [ ] Test user authentication (sign up, sign in, sign out)
- [ ] Test user profile creation and updates
- [ ] Test custom options creation, editing, and deletion
- [ ] Test prompt set saving and loading
- [ ] Test package creation, publishing, and deletion
- [ ] Test package marketplace browsing and searching
- [ ] Test package installation
- [ ] Test image uploads (avatars and package covers)
- [ ] Test all error handling scenarios
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive design on mobile devices
- [ ] Test with slow network connections
- [ ] Perform accessibility testing

### Firebase Configuration
- [ ] Verify Firebase project is set to production mode
- [ ] Review and deploy Firestore Security Rules
- [ ] Review and deploy Storage Security Rules
- [ ] Set up Firestore indexes (deploy `firestore.indexes.json`)
- [ ] Verify Firebase Authentication providers are enabled
- [ ] Check Firebase quota limits and upgrade plan if needed
- [ ] Enable Firebase App Check (recommended for production)
- [ ] Set up Firebase Monitoring and Alerts

### Environment Variables
- [ ] Create production `.env.production` file
- [ ] Verify all Firebase config values are correct
- [ ] Ensure no development/test API keys are used
- [ ] Add `.env.production` to `.gitignore`
- [ ] Document required environment variables in README

### Security
- [ ] Review Firestore Security Rules for vulnerabilities
- [ ] Review Storage Security Rules for vulnerabilities
- [ ] Enable Firebase App Check
- [ ] Set up CORS rules if needed
- [ ] Review and restrict Firebase API keys if possible
- [ ] Enable Firebase Security Rules monitoring

## Firebase Hosting Setup

### Initial Setup
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Initialize Firebase Hosting: `firebase init hosting`
- [ ] Select your Firebase project
- [ ] Configure hosting directory (should be `dist`)
- [ ] Configure as single-page app (yes)
- [ ] Don't overwrite `index.html` (no)

### Build and Deploy
- [ ] Build production bundle: `npm run build`
- [ ] Test production build locally: `npm run preview`
- [ ] Deploy to Firebase Hosting: `firebase deploy --only hosting`
- [ ] Verify deployment at your Firebase Hosting URL

### Custom Domain (Optional)
- [ ] Add custom domain in Firebase Console → Hosting
- [ ] Follow DNS configuration instructions
- [ ] Wait for SSL certificate provisioning
- [ ] Verify custom domain works correctly
- [ ] Set up redirects if needed

## Post-Deployment

### Verification
- [ ] Test all features on production URL
- [ ] Verify Firebase Analytics is working
- [ ] Check Firebase Console for errors
- [ ] Monitor Firebase usage and costs
- [ ] Test error handling in production
- [ ] Verify images load correctly
- [ ] Check that authentication flows work

### Monitoring
- [ ] Set up Firebase Performance Monitoring
- [ ] Enable Firebase Crashlytics (if using)
- [ ] Set up Firebase Alerts for:
  - [ ] High error rates
  - [ ] Unusual traffic patterns
  - [ ] Storage quota warnings
  - [ ] Firestore quota warnings
- [ ] Monitor Firebase Console dashboard regularly

### Analytics
- [ ] Verify Firebase Analytics is enabled
- [ ] Set up custom events if needed
- [ ] Configure conversion tracking
- [ ] Review analytics data after first week

## Firebase Quota Limits

Check your Firebase plan limits:

### Firestore
- [ ] Document reads per day
- [ ] Document writes per day
- [ ] Storage size
- [ ] Network egress

### Storage
- [ ] Storage size
- [ ] Downloads per day
- [ ] Uploads per day

### Hosting
- [ ] Storage size
- [ ] Data transfer per month

### Authentication
- [ ] Monthly active users
- [ ] Phone verifications (if using)

**Note:** Upgrade to Blaze plan (pay-as-you-go) if you need higher limits or want to use Cloud Functions.

## Rollback Plan

If issues occur after deployment:

1. [ ] Keep previous deployment version accessible
2. [ ] Document rollback procedure
3. [ ] Test rollback process in staging
4. [ ] Have Firebase project backup ready

## Documentation

- [ ] Update README.md with production URL
- [ ] Document any production-specific configurations
- [ ] Create runbook for common issues
- [ ] Document monitoring and alerting setup

## Additional Notes

- Consider setting up a staging environment for testing before production
- Use Firebase Emulator Suite for local testing
- Set up CI/CD pipeline for automated deployments
- Consider using Firebase Extensions for additional functionality
- Review Firebase best practices documentation

