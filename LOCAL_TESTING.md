# Local Testing Guide

## Running Backend Locally

### Start the Backend Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:3001`

### Verify Server is Running

Check the health endpoint:
```bash
curl http://localhost:3001/api/health
```

Or visit in browser: `http://localhost:3001/api/health`

## Testing Stripe Webhooks Locally

Since your Stripe webhook is configured for `https://api.poseprompter.com`, you need to use **Stripe CLI** to forward webhooks to your local server.

### Install Stripe CLI

**Windows:**
```bash
# Using Scoop
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
```

### Forward Webhooks to Local Server

1. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

2. **Forward webhooks:**
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

3. **Copy the webhook secret:**
   - Stripe CLI will show a webhook secret like: `whsec_...`
   - **Temporarily** update `server/.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_...  # Use the one from Stripe CLI
     ```
   - Restart your backend server

### Test Payments

1. **Start backend server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Stripe CLI webhook forwarding:**
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

4. **Make a test payment:**
   - Sign in to your app
   - Click credits button
   - Use test card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`

5. **Watch for webhook events:**
   - Stripe CLI will show webhook events in real-time
   - Backend logs will show credit updates
   - Check user's credit balance in Firestore

## Environment Variables for Local Testing

### Frontend (`.env.local`)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Get from Stripe Dashboard
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (`server/.env`)
```env
STRIPE_SECRET_KEY=sk_test_...  # Get from Stripe Dashboard (NEVER commit this!)
STRIPE_WEBHOOK_SECRET=whsec_...  # Use the one from Stripe CLI for local testing
FIREBASE_SERVICE_ACCOUNT={...}  # Get from Firebase Console
CLIENT_URL=http://localhost:5173
PORT=3001
```

## Testing Checklist

- [ ] Backend server running on `localhost:3001`
- [ ] Health endpoint returns `200 OK`
- [ ] Stripe CLI forwarding webhooks
- [ ] Frontend running on `localhost:5173`
- [ ] Test payment completes successfully
- [ ] Webhook events received in Stripe CLI
- [ ] Credits added to user account in Firestore

## Troubleshooting

### Backend not starting
- Check if port 3001 is already in use
- Verify all environment variables are set in `server/.env`
- Check server logs for errors

### Webhooks not working
- Make sure Stripe CLI is running
- Verify webhook secret matches Stripe CLI output
- Check backend logs for webhook errors
- Ensure backend server is running

### CORS errors
- Verify `CLIENT_URL=http://localhost:5173` in `server/.env`
- Restart backend after changing environment variables

### Payment fails
- Check Stripe test mode is enabled
- Verify Stripe keys are test keys (start with `pk_test_` and `sk_test_`)
- Check browser console for errors
- Check backend logs for payment intent errors

