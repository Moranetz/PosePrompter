# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for PosePrompt Studio.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js installed on your system
3. Firebase Admin SDK credentials

## Step 1: Install Dependencies

### Frontend Dependencies

The Stripe React dependencies have been added to `package.json`. Install them:

```bash
npm install
```

If npm has issues, you can manually add these to `package.json` dependencies:
- `@stripe/stripe-js`: `^2.4.0`
- `@stripe/react-stripe-js`: `^2.4.0`

### Backend Dependencies

Navigate to the `server` directory and install backend dependencies:

```bash
cd server
npm install
```

## Step 2: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Make sure you're in **Test mode** for development
3. Copy your **Publishable key** (starts with `pk_test_...`)
4. Copy your **Secret key** (starts with `sk_test_...`)

⚠️ **Important**: Never expose your Secret key in client-side code!

## Step 3: Configure Environment Variables

### Frontend (.env.local)

Create a `.env.local` file in the root directory:

```env
# Stripe Publishable Key (safe to expose in client)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend API URL
VITE_API_BASE_URL=http://localhost:3001
```

For production, update `VITE_API_BASE_URL` to your deployed backend URL.

### Backend (server/.env)

Create a `.env` file in the `server` directory:

```env
# Stripe Secret Key (NEVER expose this!)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret (get this after setting up webhook)
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase Admin SDK
# Option 1: Service account JSON (stringified)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Option 2: Individual environment variables
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173
```

### Getting Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Either:
   - Copy the entire JSON content and stringify it for `FIREBASE_SERVICE_ACCOUNT`
   - Or extract `project_id`, `client_email`, and `private_key` for individual variables

## Step 4: Set Up Stripe Webhook (Production)

For production, you need to set up a webhook endpoint:

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add it to your backend `.env` as `STRIPE_WEBHOOK_SECRET`

For local development, you can use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

## Step 5: Start the Backend Server

In the `server` directory:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will run on `http://localhost:3001` by default.

## Step 6: Start the Frontend

In the root directory:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

## Step 7: Test the Integration

1. Sign in to your app
2. Click the credits/gems button in the header
3. Select a credit package
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

## Credit Packages

The following packages are configured:

| Credits | Price | Bonus |
|---------|-------|-------|
| 50 | $6 | - |
| 100 | $12 | - |
| 200 | $24 | - |
| 420 | $48 | 20 bonus |
| 1,100 | $120 | 100 bonus |
| 2,300 | $240 | 300 bonus |

## Security Checklist

- ✅ Secret key is only in backend `.env` (never in frontend)
- ✅ Webhook signatures are verified (in production)
- ✅ Payment amounts are validated on the server
- ✅ User IDs are verified before updating credits
- ✅ All transactions are logged in Firestore

## Deployment

### Backend Deployment

Deploy the `server` directory to:
- Heroku
- Railway
- Render
- AWS Lambda
- Google Cloud Functions
- Any Node.js hosting service

Make sure to:
1. Set all environment variables in your hosting platform
2. Update `CLIENT_URL` to your production frontend URL
3. Configure Stripe webhook URL to point to your deployed server

### Frontend Deployment

Deploy as usual. Make sure:
1. `.env.local` variables are set in your hosting platform
2. `VITE_API_BASE_URL` points to your deployed backend

## Troubleshooting

### "Stripe key not found" warning
- Make sure `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Restart the dev server after adding environment variables

### Payment intent creation fails
- Check that the backend server is running
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check backend logs for errors

### Credits not updating
- Verify Firebase Admin is configured correctly
- Check that `userId` matches the authenticated user
- Check Firestore security rules allow credit updates

### CORS errors
- Make sure `CLIENT_URL` in backend `.env` matches your frontend URL
- Check that CORS middleware is configured correctly

## Support

For Stripe-specific issues, check:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)

