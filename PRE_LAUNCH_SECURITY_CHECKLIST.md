# Pre-Launch Security Checklist

## ✅ Already Completed

- [x] Firebase Security Rules configured and deployed
- [x] Storage Security Rules configured and deployed
- [x] Environment variables properly configured
- [x] Terms of Service page created
- [x] Privacy Policy page created
- [x] Copyright notice added to footer

## 🔴 CRITICAL - Do Before Launch

### 1. Restrict Firebase API Key (15 minutes) ⚠️ HIGH PRIORITY

**Why**: Prevents others from using your API key on their own sites.

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **Browser API key** (starts with `AIza...`)
5. Click **Edit** (pencil icon)
6. Under **Application restrictions**, select **HTTP referrers (web sites)**
7. Click **Add an item** and add:
   ```
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   https://yourproject.firebaseapp.com/*
   https://yourproject.web.app/*
   ```
   (Replace `yourdomain.com` and `yourproject` with your actual values)
8. Click **Save**

**Test**: Try accessing your Firebase from a different domain - it should fail.

---

## 🟡 RECOMMENDED - Do Before Launch

### 2. Enable Firebase App Check (30 minutes)

**Why**: Adds an additional layer of protection against abuse and bot traffic.

**Steps**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **App Check** (in left sidebar)
4. Click **Get started**
5. Click **Register** next to your web app
6. Choose **reCAPTCHA v3** (free option)
7. Add your domain
8. Click **Save**

**Note**: This is optional but recommended for production.

### 3. Disable Source Maps in Production (Optional)

**Why**: Makes your code structure harder to read (but also makes debugging harder).

**Steps**:
1. Open `vite.config.js`
2. Find the `build` section
3. Change `sourcemap: true` to `sourcemap: false`
4. Rebuild your production bundle

**Trade-off**: 
- ✅ Makes code harder to reverse-engineer
- ❌ Makes debugging production issues much harder

**Recommendation**: Leave enabled unless you have a specific reason to disable.

---

## 🟢 OPTIONAL - Can Do After Launch

### 4. Set Up Monitoring

- [ ] Configure Firebase usage alerts
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor for unusual API usage patterns

### 5. Legal Considerations

- [ ] Review and customize Terms of Service (currently generic template)
- [ ] Review and customize Privacy Policy (currently generic template)
- [ ] Consider trademarking your brand name
- [ ] Consult with attorney if handling payments or sensitive data

### 6. Additional Hardening

- [ ] Review Firebase Security Rules one more time
- [ ] Test all user flows for security issues
- [ ] Consider rate limiting for Cloud Functions (if you add them)

---

## 📝 Quick Reference

### Your Current Security Status

| Security Measure | Status | Priority |
|-----------------|--------|----------|
| Firebase Security Rules | ✅ Done | - |
| Storage Security Rules | ✅ Done | - |
| API Key Restrictions | ❌ **TODO** | 🔴 HIGH |
| App Check | ❌ Optional | 🟡 Medium |
| Legal Pages | ✅ Done | - |
| Source Maps | ⚠️ Enabled | 🟡 Optional |

---

## 🎯 Minimum Viable Security (Before Launch)

At minimum, complete these before going public:

1. ✅ **Restrict Firebase API Key** (15 min) - **MUST DO**
2. ✅ **Test your Security Rules** - Verify users can only access their own data
3. ✅ **Review Terms & Privacy Policy** - Customize the templates if needed

Everything else can be done after launch, but these three are critical.

---

## 🚨 What Happens If You Skip These?

### If you don't restrict API keys:
- Anyone can use your Firebase API key on their own site
- They could potentially abuse your Firebase quotas
- You might get unexpected charges

### If you don't test Security Rules:
- Users might access other users' data
- Your database could be vulnerable
- Data breaches possible

### If you don't have legal pages:
- Not legally compliant in many jurisdictions
- Users may not trust your service
- Could face legal issues

---

## ✅ Final Pre-Launch Test

Before going live, test these scenarios:

1. **User Isolation Test**:
   - Create two test accounts
   - Verify Account A cannot access Account B's data
   - Verify Account A cannot modify Account B's packages

2. **Storage Test**:
   - Try uploading a file > 5MB (should fail)
   - Try uploading to another user's folder (should fail)
   - Try uploading non-image file (should fail)

3. **API Key Test**:
   - Try accessing Firebase from a different domain (should fail if restricted)

4. **Legal Pages Test**:
   - Click Terms of Service link in footer (should work)
   - Click Privacy Policy link in footer (should work)

---

## 📞 Need Help?

- **Firebase Security Rules**: See `FIREBASE_SECURITY_RULES_SETUP.md`
- **General Security**: See `SECURITY_GUIDE.md`
- **Firebase Documentation**: https://firebase.google.com/docs

---

**Remember**: Perfect security doesn't exist, but these measures will protect your backend and user data. Focus on completing the critical items before launch!

