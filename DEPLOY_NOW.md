# Deploy to Custom Domain - Step by Step Guide

This guide will help you deploy PosePrompt Studio to your custom domain.

## Prerequisites

- [ ] Firebase project created
- [ ] Domain purchased (e.g., `poseprompter.com`)
- [ ] Firebase CLI installed
- [ ] All environment variables ready

---

## Part 1: Deploy Frontend to Firebase Hosting

### Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate.

### Step 3: Initialize Firebase (if not already done)

```bash
firebase init hosting
```

**When prompted:**
- Select your Firebase project
- Public directory: `dist` (press Enter)
- Configure as single-page app: **Yes**
- Set up automatic builds: **No** (we'll build manually)
- Overwrite index.html: **No**

### Step 4: Build Your Frontend

```bash
npm run build
```

This creates the `dist` folder with your production build.

### Step 5: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app is now live at: `https://your-project-id.web.app`

---

## Part 2: Set Up Custom Domain

### Step 6: Add Custom Domain in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Hosting** in the left sidebar
4. Click **"Add custom domain"**
5. Enter your domain (e.g., `poseprompter.com`)
6. Click **Continue**

### Step 7: Configure DNS Records

Firebase will show you DNS records to add. You need to add these at your domain registrar.

**For root domain (poseprompter.com):**
- Add **2 A records** with the IP addresses Firebase provides:
  ```
  Type: A
  Name: @ (or leave blank)
  Value: [IP address 1 from Firebase]
  TTL: 3600
  
  Type: A
  Name: @ (or leave blank)
  Value: [IP address 2 from Firebase]
  TTL: 3600
  ```

**For www subdomain (optional):**
- Add a CNAME record:
  ```
  Type: CNAME
  Name: www
  Value: your-project-id.web.app
  TTL: 3600
  ```

### Step 8: Wait for DNS Verification

- DNS propagation: **15 minutes to 48 hours** (usually 1-2 hours)
- Check status in Firebase Console → Hosting → Custom domains
- Status will change from "Pending" to "Connected"

### Step 9: Wait for SSL Certificate

- Firebase automatically provisions SSL certificates
- Takes **24-48 hours** after DNS is verified
- You'll get an email when ready
- Your site will be available at `https://poseprompter.com`

---

## Part 3: Update Firebase Configuration

### Step 10: Add Domain to Authorized Domains

1. Go to Firebase Console → Project Settings
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Add:
   - `poseprompter.com`
   - `www.poseprompter.com` (if using www)

### Step 11: Update API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your Browser API key (starts with `AIzaSy...`)
5. Click **Edit**
6. Under **"Application restrictions"** → **"HTTP referrers"**, add:
   ```
   http://localhost:*
   https://localhost:*
   https://your-project-id.web.app/*
   https://your-project-id.firebaseapp.com/*
   https://poseprompter.com/*
   https://www.poseprompter.com/*
   ```
7. Click **Save**

---

## Part 4: Deploy Backend Server

Your backend needs to be deployed separately. Choose one option:

### Option A: Railway (Recommended - Easiest)

1. **Sign up at [Railway](https://railway.app/)**
2. **Create new project**
3. **Deploy from GitHub:**
   - Connect your GitHub repository
   - Select `server` folder as root directory
   - Railway auto-detects Node.js

4. **Add Environment Variables:**
   Go to your Railway project → Variables, add:
   ```
   STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
   STRIPE_WEBHOOK_SECRET=whsec_...
   REPLICATE_API_TOKEN=r8_...
   OPENAI_API_KEY=sk-...
   GOOGLE_GEMINI_API_KEY=...
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   CLIENT_URL=https://poseprompter.com
   PORT=3001
   ```

5. **Get your backend URL:**
   - Railway gives you: `https://your-app.railway.app`
   - This is your backend API URL

6. **Set up custom domain (api.poseprompter.com):**
   - In Railway → Settings → Domains
   - Add custom domain: `api.poseprompter.com`
   - Add CNAME record at your registrar:
     ```
     Type: CNAME
     Name: api
     Value: your-app.railway.app
     ```

### Option B: Render

1. **Sign up at [Render](https://render.com/)**
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

5. **Add Environment Variables** (same as Railway)

6. **Get Render URL:** `https://your-app.onrender.com`

7. **Set up custom domain:**
   - In Render → Custom Domains
   - Add: `api.poseprompter.com`
   - Add CNAME record at registrar

---

## Part 5: Update Frontend Environment Variables

### Step 12: Create Production Environment File

Create `.env.production` in the project root:

```env
# Firebase Configuration (get from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Stripe Publishable Key (safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)

# Backend API URL
VITE_API_BASE_URL=https://api.poseprompter.com
# Or use Railway/Render URL temporarily:
# VITE_API_BASE_URL=https://your-app.railway.app
```

### Step 13: Rebuild and Redeploy

```bash
# Build with production environment
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

---

## Part 6: Update Stripe Webhook

### Step 14: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://api.poseprompter.com/api/stripe/webhook
   ```
   (Or use Railway/Render URL temporarily)
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)
6. Add it to your backend environment variables

---

## Part 7: Verify Everything Works

### Step 15: Test Your Deployment

1. **Visit your custom domain:**
   - `https://poseprompter.com`
   - Should load your app

2. **Test authentication:**
   - Try Google sign-in
   - Try email/password sign-in
   - Should work on custom domain

3. **Test backend API:**
   ```bash
   curl https://api.poseprompter.com/api/health
   ```
   Should return: `{"status":"ok",...}`

4. **Test payments:**
   - Make a test payment
   - Verify webhook receives events
   - Check credits are added

5. **Check SSL:**
   - Look for padlock icon in browser
   - Should show "Secure"

---

## Quick Command Reference

```bash
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy everything
firebase deploy
```

---

## Troubleshooting

### DNS Not Working
- Wait longer (can take 48 hours)
- Check DNS propagation: https://www.whatsmydns.net/
- Verify records are correct at registrar

### SSL Certificate Not Ready
- Wait 24-48 hours after DNS verification
- Check Firebase Console → Hosting → Custom domains
- Look for error messages

### Authentication Not Working
- Make sure domain is in authorized domains
- Make sure API key restrictions include your domain
- Clear browser cache

### Backend Not Accessible
- Check backend logs in Railway/Render
- Verify environment variables are set
- Test health endpoint: `curl https://api.poseprompter.com/api/health`

### CORS Errors
- Update `CLIENT_URL` in backend environment variables
- Make sure it matches your frontend domain exactly

---

## Deployment Checklist

- [ ] Firebase CLI installed and logged in
- [ ] Frontend built (`npm run build`)
- [ ] Frontend deployed to Firebase Hosting
- [ ] Custom domain added in Firebase Console
- [ ] DNS records added at domain registrar
- [ ] DNS verified (status: "Connected")
- [ ] Domain added to Firebase authorized domains
- [ ] API key restrictions updated
- [ ] Backend deployed (Railway/Render)
- [ ] Backend environment variables configured
- [ ] Backend custom domain configured (api.poseprompter.com)
- [ ] Frontend `.env.production` created
- [ ] Frontend rebuilt and redeployed
- [ ] Stripe webhook configured
- [ ] SSL certificate active
- [ ] Everything tested and working

---

## Next Steps After Deployment

1. **Monitor Firebase Console** for errors
2. **Set up Firebase Analytics** to track usage
3. **Enable Firebase App Check** for security
4. **Set up monitoring alerts** in Firebase
5. **Test all features** on production domain
6. **Update documentation** with production URLs

---

**Estimated Time:**
- Frontend deployment: 15 minutes
- DNS setup: 15 minutes
- DNS propagation: 1-48 hours
- SSL certificate: 24-48 hours after DNS verified
- Backend deployment: 30 minutes
- **Total: Usually 1-2 days for full setup**

