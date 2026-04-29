# PosePrompter Deployment Guide

## Architecture

- **Frontend**: Firebase Hosting → `poseprompter.com` / `pose-prompter.web.app`
- **Backend API**: Render.com (free tier) → `poseprompter-api.onrender.com`
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (face photos, generated images)
- **Auth**: Firebase Authentication (Google sign-in)
- **Payments**: Stripe
- **Analytics**: PostHog

## Deploy Frontend

```bash
npm run build
firebase deploy --only hosting --project pose-prompter
```

## Deploy Backend (Render.com)

### First-time setup

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New" → "Web Service"
3. Connect the `melmarion/PosePrompter` repo
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Add environment variables (see below)

### Required Environment Variables (Render dashboard)

| Variable | Source | Required |
|----------|--------|----------|
| `REPLICATE_API_TOKEN` | [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens) | Yes (for image gen) |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → Project Settings → Service Accounts → Generate Key (paste entire JSON) | Yes |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) | For payments |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Optional (DALL-E 3) |
| `CLIENT_URL` | `https://poseprompter.com` | Yes |
| `PORT` | `3001` | Yes |

### After backend is live

Update `.env.local` with the backend URL:
```
VITE_API_URL=https://poseprompter-api.onrender.com
```

Then rebuild and redeploy frontend:
```bash
npm run build
firebase deploy --only hosting --project pose-prompter
```

## Image Generation Models

| Provider | Model | Use Case | Cost |
|----------|-------|----------|------|
| Flux Pro | `black-forest-labs/flux-1.1-pro` | Text-to-image (highest quality) | 10 gems |
| InstantID | `zsxkib/instant-id` | Face-preserving generation | 12 gems |
| SDXL | `stability-ai/sdxl` | Text-to-image (fast/budget) | 8 gems |
| SDXL + FaceID | `lucataco/ip-adapter-faceid` | Face-preserving (SDXL quality) | 8 gems |
| DALL-E 3 | OpenAI | Text-to-image (no face support) | 12 gems |

When a user selects Flux or SDXL and has a face photo selected, the backend automatically upgrades to InstantID or IP-Adapter FaceID respectively.
