# Backend Deployment Guide

Your backend needs to be deployed so Stripe webhooks can reach it at `https://api.poseprompter.com/api/stripe/webhook`.

## Quick Deployment Options

### Option 1: Railway (Recommended - Easiest)

1. **Sign up at [Railway](https://railway.app/)**
2. **Create a new project**
3. **Deploy from GitHub:**
   - Connect your GitHub repository
   - Select the `server` folder as the root
   - Railway will auto-detect Node.js

4. **Add Environment Variables:**
   - Go to your project → Variables
   - Add all variables from `server/.env`:
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `FIREBASE_SERVICE_ACCOUNT`
     - `CLIENT_URL=https://poseprompter.com`
     - `PORT` (Railway sets this automatically)

5. **Get your Railway URL:**
   - Railway gives you a URL like: `https://your-app.railway.app`
   - This is your backend URL

6. **Set up Custom Domain (api.poseprompter.com):**
   - In Railway project → Settings → Domains
   - Add custom domain: `api.poseprompter.com`
   - Railway will give you DNS records to add
   - Add CNAME record at your domain registrar:
     - Name: `api`
     - Value: `your-app.railway.app`

### Option 2: Render

1. **Sign up at [Render](https://render.com/)**
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure:**
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

5. **Add Environment Variables:**
   - Same as Railway (all from `server/.env`)

6. **Get Render URL:**
   - Render gives you: `https://your-app.onrender.com`

7. **Set up Custom Domain:**
   - In Render dashboard → Custom Domains
   - Add: `api.poseprompter.com`
   - Add DNS records at your registrar

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create app:**
   ```bash
   cd server
   heroku create poseprompt-api
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set STRIPE_SECRET_KEY=sk_test_...
   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
   heroku config:set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
   heroku config:set CLIENT_URL=https://poseprompter.com
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Add custom domain:**
   ```bash
   heroku domains:add api.poseprompter.com
   ```

## Setting Up DNS for api.poseprompter.com

After deploying, you need to point `api.poseprompter.com` to your backend server.

### If using Railway:
- Add CNAME record:
  - Name: `api`
  - Type: `CNAME`
  - Value: `your-app.railway.app`

### If using Render:
- Add CNAME record:
  - Name: `api`
  - Type: `CNAME`
  - Value: `your-app.onrender.com`

### If using Heroku:
- Heroku will give you DNS target
- Add CNAME record pointing to that target

## Verify Deployment

1. **Check health endpoint:**
   ```bash
   curl https://api.poseprompter.com/api/health
   ```

2. **Should return:**
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "stripe": true,
     "firebase": true
   }
   ```

## Update Frontend

After deployment, update `.env.local`:

```env
VITE_API_BASE_URL=https://api.poseprompter.com
```

## Testing Webhooks

Once deployed:
1. Make a test payment
2. Check Stripe Dashboard → Event deliveries
3. Verify webhook events are received
4. Check that credits are added to user accounts

## Troubleshooting

### Backend not accessible
- Check DNS propagation (can take 24-48 hours)
- Verify DNS records are correct
- Check hosting platform logs

### Webhook not working
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook URL in Stripe dashboard
- Ensure backend is accessible from internet
- Check backend logs for webhook errors

### CORS errors
- Update `CLIENT_URL` in backend environment variables
- Add `https://poseprompter.com` to CORS allowed origins

