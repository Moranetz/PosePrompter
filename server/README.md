# PosePrompt Studio - API Server

Backend API server for handling Stripe payments, credit balance updates, and AI image generation.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the `server/` directory
   - Fill in all required environment variables (see below)

3. **Get Stripe API Keys:**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your **Secret key** (starts with `sk_test_` for test mode)
   - Copy your **Publishable key** (starts with `pk_test_` for test mode)

4. **Get Stripe Webhook Secret:**
   - Go to https://dashboard.stripe.com/webhooks
   - Create a webhook endpoint pointing to your server: `https://yourdomain.com/api/stripe/webhook`
   - Copy the webhook signing secret (starts with `whsec_`)

5. **Get AI API Keys:**
   - **Replicate:** Go to https://replicate.com/account/api-tokens
   - **OpenAI:** Go to https://platform.openai.com/api-keys

6. **Configure Firebase Admin:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Either:
     - Paste the entire JSON as a stringified value in `FIREBASE_SERVICE_ACCOUNT`
     - Or use individual variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# AI Image Generation APIs
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Firebase Admin (choose one method)
# Method 1: Service account JSON (stringified)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Method 2: Individual variables
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Server Configuration
CLIENT_URL=http://localhost:5173
PORT=3001
```

## Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Payment Endpoints

#### POST /api/create-payment-intent
Creates a Stripe payment intent for a credit package purchase.

**Request:**
```json
{
  "amount": 2400,
  "creditPackage": "200",
  "userId": "user123"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

#### POST /api/confirm-payment
Confirms payment and updates user credit balance (legacy endpoint - webhook handles this automatically).

**Request:**
```json
{
  "paymentIntentId": "pi_xxx",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "creditBalance": 200,
  "creditsAdded": 200
}
```

#### POST /api/stripe/webhook
Stripe webhook endpoint for payment events. Automatically updates user credits when payment succeeds.

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Note:** This endpoint uses `express.raw()` middleware to verify webhook signatures.

### Image Generation Endpoints

#### POST /api/generate-image
Generates an image using the specified AI provider.

**Headers:**
- `Authorization: Bearer <firebase-id-token>` (required)

**Request:**
```json
{
  "provider": "flux",
  "prompt": "A beautiful sunset over mountains",
  "options": {
    "width": 1024,
    "height": 1024,
    "num_outputs": 1
  }
}
```

**Providers:**
- `flux` - Flux Pro (10 credits)
- `sdxl` - Stable Diffusion XL (8 credits)
- `dalle3` - DALL-E 3 (12 credits)

**Response (Success):**
```json
{
  "success": true,
  "imageUrl": "https://storage.googleapis.com/...",
  "provider": "flux",
  "cost": 10,
  "newBalance": 90,
  "generationId": "abc123",
  "metadata": {
    "originalUrl": "https://...",
    "imageId": "img_1234567890_user123",
    "options": {...}
  }
}
```

**Error Responses:**
- `400` - Bad Request (invalid provider, prompt too long, etc.)
- `401` - Unauthorized (missing/invalid token)
- `402` - Payment Required (insufficient credits)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Credit Management Endpoints

#### GET /api/credits/balance
Gets the current credit balance for the authenticated user.

**Headers:**
- `Authorization: Bearer <firebase-id-token>` (required)

**Response:**
```json
{
  "credits": 100,
  "userId": "user123"
}
```

#### GET /api/generation-history
Gets generation history for the authenticated user.

**Headers:**
- `Authorization: Bearer <firebase-id-token>` (required)

**Query Parameters:**
- `limit` (optional): Maximum number of results (default: 10)

**Response:**
```json
{
  "generations": [
    {
      "id": "gen123",
      "userId": "user123",
      "provider": "flux",
      "imageUrl": "https://...",
      "prompt": "A beautiful sunset...",
      "cost": 10,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### POST /api/refund-credits
Refunds credits to a user (admin/system use).

**Headers:**
- `Authorization: Bearer <firebase-id-token>` (required)

**Request:**
```json
{
  "userId": "user123",
  "amount": 10,
  "reason": "Failed generation refund"
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 110,
  "refunded": 10
}
```

### Utility Endpoints

#### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "stripe": true,
  "firebase": true,
  "replicate": true,
  "openai": true
}
```

## Security Features

### Authentication
- All image generation and credit endpoints require Firebase ID token authentication
- Tokens are verified using Firebase Admin SDK
- Invalid or expired tokens return `401 Unauthorized`

### Rate Limiting
- General API: 100 requests per 15 minutes per IP
- Image generation: 10 requests per minute per IP
- Rate limit exceeded returns `429 Too Many Requests`

### Input Validation
- All inputs are validated before processing
- Prompt length limited to 1000 characters
- Provider names must match allowed values
- Credit amounts validated against package prices

### Error Handling
- Comprehensive error handling with appropriate HTTP status codes
- Credits are automatically refunded if generation fails
- All errors are logged for debugging
- User-friendly error messages returned to client

### Webhook Security
- Stripe webhook signatures are verified
- Only verified events are processed
- Payment metadata is validated before credit updates

## Credit Costs

| Provider | Cost (Gems) |
|----------|-------------|
| Flux Pro | 10 |
| SDXL | 8 |
| DALL-E 3 | 12 |

## Credit Packages

| Package | Credits | Price |
|---------|---------|-------|
| Starter | 50 | $6.00 |
| Basic | 100 | $12.00 |
| Popular | 200 | $24.00 |
| Value | 420 | $48.00 (400 + 20 bonus) |
| Premium | 1100 | $120.00 (1000 + 100 bonus) |
| Ultimate | 2300 | $240.00 (2000 + 300 bonus) |

## Deployment

Deploy this server to:
- Heroku
- Railway
- Render
- AWS Lambda (with serverless framework)
- Google Cloud Functions
- Any Node.js hosting service

### Deployment Checklist

1. Set all environment variables in your hosting platform
2. Update `CLIENT_URL` to your production frontend URL
3. Configure Stripe webhook URL to point to your deployed server
4. Ensure Firebase Admin SDK has proper permissions
5. Set up monitoring and logging
6. Configure CORS for your production domain
7. Enable HTTPS (required for Stripe webhooks)

## Troubleshooting

### Firebase Admin Not Initialized
- Check that `FIREBASE_SERVICE_ACCOUNT` or individual Firebase variables are set
- Verify the service account has proper permissions
- Check Firebase project ID matches

### Image Generation Fails
- Verify API keys are set correctly (`REPLICATE_API_TOKEN`, `OPENAI_API_KEY`)
- Check API quotas and billing
- Review error logs for specific error messages

### Webhook Not Working
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook URL in Stripe dashboard matches your server URL
- Ensure server is accessible from the internet (for production)
- Check webhook signature verification logs

### Rate Limiting Issues
- Adjust rate limit settings in `server.js` if needed
- Consider implementing user-based rate limiting
- Monitor for abuse patterns

## Support

For issues or questions:
1. Check the error logs in your server console
2. Review Firebase and Stripe dashboard logs
3. Verify all environment variables are set correctly
4. Check API provider status pages
