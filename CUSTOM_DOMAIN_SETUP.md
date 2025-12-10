# Custom Domain Setup: poseprompter.com

Complete guide to set up your custom domain `poseprompter.com` with Firebase Hosting.

---

## Step 1: Add Domain to Firebase Hosting

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pose-prompter**
3. Navigate to **Hosting** (in left sidebar)
4. Click **"Add custom domain"** button
5. Enter your domain: `poseprompter.com`
6. Click **"Continue"**
7. Firebase will show you DNS records to add (save these!)

---

## Step 2: Configure DNS Records

You need to add DNS records at your domain registrar (where you bought poseprompter.com).

### Option A: A Records (Recommended)

Firebase will give you two A records. Add them at your domain registrar:

```
Type: A
Name: @ (or leave blank)
Value: [IP address from Firebase]
TTL: 3600 (or default)
```

Add both A records Firebase provides.

### Option B: CNAME Record (Alternative)

If Firebase offers a CNAME option:

```
Type: CNAME
Name: @ (or www)
Value: pose-prompter.web.app
TTL: 3600
```

**Note**: Some registrars don't allow CNAME on root domain (@), so you might need to use A records.

---

## Step 3: Wait for DNS Propagation

- DNS changes can take **15 minutes to 48 hours**
- Usually takes **1-2 hours**
- Firebase will show status: "Pending" → "Connected"

**Check status in Firebase Console → Hosting → Custom domains**

---

## Step 4: SSL Certificate (Automatic)

Firebase automatically provisions SSL certificates:
- Takes **24-48 hours** after DNS is verified
- You'll get an email when it's ready
- Your site will be available at `https://poseprompter.com`

---

## Step 5: Update Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pose-prompter**
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to **"Authorized domains"**
5. Click **"Add domain"**
6. Add:
   - `poseprompter.com`
   - `www.poseprompter.com` (if you want www version)
7. Click **"Add"**

**Make sure these are listed:**
- ✅ `localhost` (for local dev)
- ✅ `pose-prompter.web.app`
- ✅ `pose-prompter.firebaseapp.com`
- ✅ `poseprompter.com` (NEW)
- ✅ `www.poseprompter.com` (if using www)

---

## Step 6: Update API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **APIs & Services** → **Credentials**
4. Find your Browser API key (starts with `AIzaSy...`)
5. Click **Edit**
6. Under **"Application restrictions"** → **"HTTP referrers"**, add:
   ```
   http://localhost:*
   https://localhost:*
   https://pose-prompter.web.app/*
   https://pose-prompter.firebaseapp.com/*
   https://poseprompter.com/*
   https://www.poseprompter.com/*
   ```
7. Click **Save**

---

## Step 7: Update reCAPTCHA Domains (If Using App Check)

If you set up App Check with reCAPTCHA:

1. Go to [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Find your site
3. Click **Edit**
4. Add to **Domains**:
   ```
   poseprompter.com
   www.poseprompter.com
   ```
5. Click **Save**

---

## Step 8: Update Firebase Hosting Configuration (Optional)

If you want to redirect or configure your domain, edit `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

## Step 9: Deploy to Custom Domain

After DNS is verified and SSL is ready:

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

3. Your app will be available at:
   - `https://poseprompter.com`
   - `https://www.poseprompter.com` (if configured)
   - `https://pose-prompter.web.app` (still works)

---

## Step 10: Test Everything

After setup is complete, test:

1. **Visit your custom domain:**
   - `https://poseprompter.com`
   - Should load your app

2. **Test authentication:**
   - Try Google sign-in
   - Try email/password sign-in
   - Should work on custom domain

3. **Check SSL:**
   - Look for padlock icon in browser
   - Should show "Secure" or "Valid certificate"

---

## Troubleshooting

### DNS Not Propagating
- Wait longer (can take up to 48 hours)
- Check DNS propagation: https://www.whatsmydns.net/
- Verify records are correct at your registrar

### SSL Certificate Not Issuing
- Wait 24-48 hours after DNS verification
- Check Firebase Console → Hosting → Custom domains
- Look for any error messages

### Authentication Not Working on Custom Domain
- Make sure `poseprompter.com` is in authorized domains
- Make sure API key restrictions include `https://poseprompter.com/*`
- Clear browser cache and try again

### Site Not Loading
- Check Firebase Console → Hosting → Custom domains status
- Verify DNS records are correct
- Try accessing `https://pose-prompter.web.app` (should still work)

---

## Quick Checklist

- [ ] Added custom domain in Firebase Hosting
- [ ] Added DNS records at domain registrar
- [ ] Waited for DNS propagation (1-2 hours)
- [ ] Added `poseprompter.com` to Firebase authorized domains
- [ ] Updated API key restrictions with new domain
- [ ] Updated reCAPTCHA domains (if using App Check)
- [ ] Waited for SSL certificate (24-48 hours)
- [ ] Deployed app to Firebase Hosting
- [ ] Tested authentication on custom domain
- [ ] Verified SSL certificate is working

---

## Domain Registrar Guides

Common registrars:
- **GoDaddy**: DNS Management → Add A/CNAME records
- **Namecheap**: Advanced DNS → Add records
- **Google Domains**: DNS → Custom records
- **Cloudflare**: DNS → Add record

---

## Important Notes

1. **Keep Firebase domains**: `pose-prompter.web.app` will still work
2. **Both domains work**: Users can access via custom domain or Firebase domain
3. **SSL is automatic**: Firebase handles SSL certificates
4. **No code changes needed**: Your app code doesn't need changes
5. **DNS propagation**: Can take time, be patient

---

## Need Help?

- **Firebase Hosting Docs**: https://firebase.google.com/docs/hosting/custom-domain
- **DNS Troubleshooting**: Check your domain registrar's support docs
- **Firebase Support**: https://firebase.google.com/support

---

**Estimated Time**: 
- DNS setup: 15 minutes
- DNS propagation: 1-48 hours
- SSL certificate: 24-48 hours after DNS verified
- **Total: Usually 1-2 days for full setup**

