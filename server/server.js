/**
 * Express Server for PosePrompt Studio API
 * 
 * This server handles:
 * - Creating Stripe payment intents
 * - Confirming payments and updating user credit balance in Firestore
 * - Webhook handling for Stripe events
 * - Image generation with multiple AI providers
 * - Credit management and generation history
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import rateLimit from 'express-rate-limit';
import Replicate from 'replicate';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY is not set in environment variables!');
  console.error('Please add STRIPE_SECRET_KEY to server/.env file');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Firebase Admin
let db;
let auth;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If using service account JSON (stringified)
    try {
      // Handle escaped JSON string from .env file
      let jsonString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      // Always unescape quotes and newlines (they're escaped in .env)
      jsonString = jsonString.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
      const serviceAccount = JSON.parse(jsonString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (parseError) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
      console.error('JSON string length:', process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0);
      console.error('First 200 chars:', process.env.FIREBASE_SERVICE_ACCOUNT?.substring(0, 200) || 'undefined');
      throw parseError;
    }
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // If using individual environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    console.warn('Firebase Admin not initialized - using default credentials or service account file');
    admin.initializeApp();
  }
  db = admin.firestore();
  auth = admin.auth();
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  console.warn('Continuing without Firebase Admin - some endpoints may not work');
}

// Initialize AI clients
let replicateClient = null;
let openaiClient = null;

const getReplicateClient = () => {
  if (!replicateClient && process.env.REPLICATE_API_TOKEN) {
    replicateClient = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }
  return replicateClient;
};

const getOpenAIClient = () => {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 generations per minute
  message: 'Too many generation requests. Please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/generate-image', generationLimiter);

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!auth) {
      return res.status(500).json({
        error: 'Authentication service not available',
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    
    next();
  } catch (error) {
    console.error('[authenticateUser] Error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

// Credit costs per provider (in gems)
const CREDIT_COSTS = {
  flux: 10,
  sdxl: 8,
  dalle3: 12,
};

// Credit packages configuration
const CREDIT_PACKAGES = {
  '50': { credits: 50, price: 600 }, // $6.00 in cents
  '100': { credits: 100, price: 1200 }, // $12.00 in cents
  '200': { credits: 200, price: 2400 }, // $24.00 in cents
  '420': { credits: 420, price: 4800 }, // $48.00 in cents (400 + 20 bonus)
  '1100': { credits: 1100, price: 12000 }, // $120.00 in cents (1000 + 100 bonus)
  '2300': { credits: 2300, price: 24000 }, // $240.00 in cents (2000 + 300 bonus)
};

// Helper function to get user credit balance
const getUserCredits = async (userId) => {
  if (!db) throw new Error('Firebase Admin not initialized');
  
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    return 0;
  }
  
  const userData = userDoc.data();
  return userData.gems || userData.credits || 0;
};

// Helper function to deduct credits
const deductUserCredits = async (userId, amount) => {
  if (!db) throw new Error('Firebase Admin not initialized');
  
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }
  
  const currentCredits = userDoc.data().gems || userDoc.data().credits || 0;
  
  if (currentCredits < amount) {
    throw new Error('Insufficient credits');
  }
  
  await userRef.update({
    gems: currentCredits - amount,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return currentCredits - amount;
};

// Helper function to add credits
const addUserCredits = async (userId, amount) => {
  if (!db) throw new Error('Firebase Admin not initialized');
  
  // Validate amount
  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid credit amount: ${amount}`);
  }
  
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    await userRef.set({
      gems: amount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[addUserCredits] Created new user ${userId} with ${amount} credits`);
    return amount;
  }
  
  const userData = userDoc.data();
  let currentCredits = userData.gems || userData.credits || 0;
  
  // Validate current credits is a number
  if (isNaN(currentCredits)) {
    console.warn(`[addUserCredits] Invalid current credits for user ${userId}, defaulting to 0`);
    currentCredits = 0;
  }
  
  const newBalance = currentCredits + amount;
  
  // Validate new balance calculation
  if (isNaN(newBalance) || newBalance < currentCredits) {
    throw new Error(`Invalid balance calculation: ${currentCredits} + ${amount} = ${newBalance}`);
  }
  
  await userRef.update({
    gems: newBalance,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  console.log(`[addUserCredits] Added ${amount} credits to user ${userId}: ${currentCredits} -> ${newBalance}`);
  
  return newBalance;
};

// Helper function to upload image to Firebase Storage
const uploadImageToStorage = async (userId, imageUrl, imageId) => {
  if (!db) throw new Error('Firebase Admin not initialized');
  
  try {
    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const bucket = admin.storage().bucket();
    const fileName = `users/${userId}/generations/${imageId}.png`;
    const file = bucket.file(fileName);
    
    await file.save(Buffer.from(buffer), {
      metadata: {
        contentType: 'image/png',
      },
    });
    
    // Make file publicly accessible
    await file.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('[uploadImageToStorage] Error:', error);
    throw error;
  }
};

/**
 * POST /api/create-payment-intent
 * Creates a Stripe payment intent for a credit package purchase
 */
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, creditPackage, userId } = req.body;

    // Validate input
    if (!amount || !creditPackage) {
      return res.status(400).json({
        error: 'Missing required fields: amount and creditPackage are required',
      });
    }

    // Validate credit package exists
    const packageData = CREDIT_PACKAGES[creditPackage];
    if (!packageData) {
      return res.status(400).json({
        error: `Invalid credit package: ${creditPackage}`,
      });
    }

    // Validate amount matches package price
    if (amount !== packageData.price) {
      return res.status(400).json({
        error: `Amount ${amount} does not match package price ${packageData.price}`,
      });
    }

    // Create payment intent with idempotency key to prevent duplicates
    const idempotencyKey = `${userId || 'anonymous'}-${creditPackage}-${Date.now()}`;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        userId: userId || 'anonymous',
        creditPackage: creditPackage,
        credits: packageData.credits.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    }, {
      idempotencyKey: idempotencyKey,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('[create-payment-intent] Error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message,
    });
  }
});

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for payment confirmation
 */
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      console.warn('STRIPE_WEBHOOK_SECRET not set - skipping signature verification');
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        
        const userId = paymentIntent.metadata.userId;
        const creditsToAdd = parseInt(paymentIntent.metadata.credits, 10);
        
        // Validate creditsToAdd is a valid number
        if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
          console.error('[webhook] Invalid credits value:', paymentIntent.metadata.credits);
          break;
        }
        
        if (userId && userId !== 'anonymous' && creditsToAdd > 0) {
          try {
            // Check if transaction already exists (idempotency)
            const existingTransaction = await db.collection('transactions')
              .where('paymentIntentId', '==', paymentIntent.id)
              .where('status', '==', 'completed')
              .limit(1)
              .get();
            
            if (!existingTransaction.empty) {
              console.log(`[webhook] Payment intent ${paymentIntent.id} already processed. Skipping.`);
              break;
            }
            
            const newBalance = await addUserCredits(userId, creditsToAdd);
            
            // Log transaction
            await db.collection('transactions').add({
              userId,
              paymentIntentId: paymentIntent.id,
              credits: creditsToAdd,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: 'completed',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            
            console.log(`[webhook] Added ${creditsToAdd} credits to user ${userId}. New balance: ${newBalance}`);
          } catch (creditError) {
            console.error('[webhook] Error updating credits:', creditError);
            // Don't fail the webhook - log error for manual review
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('PaymentIntent failed:', failedPayment.id);
        
        // Log failed payment to Firestore for analysis
        try {
          await db.collection('transactions').add({
            userId: failedPayment.metadata.userId || 'unknown',
            paymentIntentId: failedPayment.id,
            credits: 0,
            amount: failedPayment.amount,
            currency: failedPayment.currency,
            status: 'failed',
            error: failedPayment.last_payment_error?.message || 'Payment failed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (logError) {
          console.error('[webhook] Failed to log failed payment:', logError);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[webhook] Error processing event:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

/**
 * POST /api/generate-image
 * Generates an image using the specified AI provider
 */
app.post('/api/generate-image', authenticateUser, async (req, res) => {
  try {
    const { provider, prompt, options = {} } = req.body;
    const userId = req.user.uid;

    // Validate input
    if (!provider || !prompt) {
      return res.status(400).json({
        error: 'Missing required fields: provider and prompt are required',
      });
    }

    // Validate provider
    if (!CREDIT_COSTS[provider]) {
      return res.status(400).json({
        error: `Invalid provider: ${provider}. Must be one of: ${Object.keys(CREDIT_COSTS).join(', ')}`,
      });
    }

    // Check credits
    const cost = CREDIT_COSTS[provider];
    const currentCredits = await getUserCredits(userId);
    
    if (currentCredits < cost) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: cost,
        available: currentCredits,
      });
    }

    // Validate prompt length
    if (prompt.length > 1000) {
      return res.status(400).json({
        error: 'Prompt too long. Maximum 1000 characters.',
      });
    }

    let imageUrl = null;
    let creditsDeducted = false;

    try {
      // Generate image based on provider
      switch (provider) {
        case 'flux':
          const replicate = getReplicateClient();
          if (!replicate) {
            throw new Error('Replicate API not configured');
          }
          
          const fluxOutput = await replicate.run(
            'black-forest-labs/flux-pro',
            {
              input: {
                prompt: prompt,
                width: options.width || 1024,
                height: options.height || 1024,
                num_outputs: options.num_outputs || 1,
              }
            }
          );
          imageUrl = Array.isArray(fluxOutput) ? fluxOutput[0] : fluxOutput;
          break;

        case 'sdxl':
          const replicateSDXL = getReplicateClient();
          if (!replicateSDXL) {
            throw new Error('Replicate API not configured');
          }
          
          const sdxlOutput = await replicateSDXL.run(
            'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
            {
              input: {
                prompt: prompt,
                width: options.width || 1024,
                height: options.height || 1024,
                num_outputs: options.num_outputs || 1,
              }
            }
          );
          imageUrl = Array.isArray(sdxlOutput) ? sdxlOutput[0] : sdxlOutput;
          break;

        case 'dalle3':
          const openai = getOpenAIClient();
          if (!openai) {
            throw new Error('OpenAI API not configured');
          }
          
          const dalleResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            size: options.size || '1024x1024',
            quality: options.quality || 'hd',
            n: 1,
          });
          imageUrl = dalleResponse.data[0]?.url;
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if (!imageUrl) {
        throw new Error('No image URL returned from provider');
      }

      // Upload to Firebase Storage
      const imageId = `img_${Date.now()}_${userId}`;
      const firebaseUrl = await uploadImageToStorage(userId, imageUrl, imageId);

      // Deduct credits
      const newBalance = await deductUserCredits(userId, cost);
      creditsDeducted = true;

      // Log generation
      const generationDoc = await db.collection('generationHistory').add({
        userId,
        provider,
        imageUrl: firebaseUrl,
        prompt: prompt.substring(0, 500),
        cost,
        imageId,
        options,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        imageUrl: firebaseUrl,
        provider,
        cost,
        newBalance,
        generationId: generationDoc.id,
        metadata: {
          originalUrl: imageUrl,
          imageId,
          options,
        },
      });
    } catch (generationError) {
      // Refund credits if generation failed
      if (creditsDeducted) {
        try {
          await addUserCredits(userId, cost);
        } catch (refundError) {
          console.error('[generate-image] Error refunding credits:', refundError);
        }
      }

      // Handle specific error types
      if (generationError.message?.includes('rate limit')) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Please try again in a moment.',
        });
      } else if (generationError.message?.includes('content policy') || generationError.message?.includes('safety')) {
        return res.status(400).json({
          error: 'Content policy violation',
          message: 'Your prompt violates the content policy. Please modify your prompt.',
        });
      }

      throw generationError;
    }
  } catch (error) {
    console.error('[generate-image] Error:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes('Insufficient credits')) {
      statusCode = 402;
    } else if (error.message?.includes('Invalid') || error.message?.includes('Missing')) {
      statusCode = 400;
    } else if (error.message?.includes('Unauthorized')) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      error: 'Image generation failed',
      message: error.message || 'An unknown error occurred',
    });
  }
});

/**
 * GET /api/credits/balance
 * Gets the current credit balance for a user
 */
app.get('/api/credits/balance', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    if (!db) {
      return res.status(500).json({
        error: 'Database not initialized',
      });
    }

    const credits = await getUserCredits(userId);

    res.json({
      credits,
      userId,
    });
  } catch (error) {
    console.error('[credits/balance] Error:', error);
    res.status(500).json({
      error: 'Failed to get credit balance',
      message: error.message,
    });
  }
});

/**
 * GET /api/generation-history
 * Gets generation history for a user
 */
app.get('/api/generation-history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const limitCount = parseInt(req.query.limit) || 10;
    
    if (!db) {
      return res.status(500).json({
        error: 'Database not initialized',
      });
    }

    const historyQuery = db.collection('generationHistory')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount);
    
    const snapshot = await historyQuery.get();
    const generations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      generations,
      count: generations.length,
    });
  } catch (error) {
    console.error('[generation-history] Error:', error);
    res.status(500).json({
      error: 'Failed to get generation history',
      message: error.message,
    });
  }
});

/**
 * POST /api/refund-credits
 * Refunds credits to a user (admin/system use)
 */
app.post('/api/refund-credits', authenticateUser, async (req, res) => {
  try {
    const { userId: targetUserId, amount, reason } = req.body;
    const adminUserId = req.user.uid;

    // Validate input
    if (!targetUserId || !amount || !reason) {
      return res.status(400).json({
        error: 'Missing required fields: userId, amount, and reason are required',
      });
    }

    // Check if user is admin (you can implement admin check here)
    // For now, allow users to refund their own credits or implement admin check
    if (targetUserId !== adminUserId) {
      // TODO: Implement admin check
      // return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    if (!db) {
      return res.status(500).json({
        error: 'Database not initialized',
      });
    }

    const newBalance = await addUserCredits(targetUserId, amount);

    // Log refund
    await db.collection('refunds').add({
      userId: targetUserId,
      amount,
      reason,
      refundedBy: adminUserId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      newBalance,
      refunded: amount,
    });
  } catch (error) {
    console.error('[refund-credits] Error:', error);
    res.status(500).json({
      error: 'Failed to refund credits',
      message: error.message,
    });
  }
});

/**
 * POST /api/confirm-payment
 * Confirms payment and updates user's credit balance in Firestore
 * (Legacy endpoint - webhook now handles this)
 */
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, userId } = req.body;

    if (!paymentIntentId || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: paymentIntentId and userId are required',
      });
    }

    if (!db) {
      return res.status(500).json({
        error: 'Firebase Admin not initialized',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify payment was successful
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: `Payment not succeeded. Status: ${paymentIntent.status}`,
      });
    }

    // Verify userId matches (security check)
    if (paymentIntent.metadata.userId !== userId) {
      return res.status(403).json({
        error: 'User ID mismatch',
      });
    }

    // Get credits from metadata
    const creditsToAdd = parseInt(paymentIntent.metadata.credits, 10);

    // Update user's credit balance
    const newBalance = await addUserCredits(userId, creditsToAdd);

    // Log transaction
    try {
      await db.collection('transactions').add({
        userId,
        paymentIntentId,
        credits: creditsToAdd,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.warn('[confirm-payment] Failed to log transaction:', logError);
    }

    res.json({
      success: true,
      creditBalance: newBalance,
      creditsAdded: creditsToAdd,
    });
  } catch (error) {
    console.error('[confirm-payment] Error:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message,
    });
  }
});

/**
 * POST /api/webhook
 * Legacy webhook endpoint (redirects to /api/stripe/webhook)
 */
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Redirect to new webhook endpoint
  req.url = '/api/stripe/webhook';
  app._router.handle(req, res);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stripe: !!stripe,
    firebase: !!db,
    replicate: !!getReplicateClient(),
    openai: !!getOpenAIClient(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PosePrompt Studio API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Create payment intent: POST http://localhost:${PORT}/api/create-payment-intent`);
  console.log(`✅ Confirm payment: POST http://localhost:${PORT}/api/confirm-payment`);
  console.log(`🎨 Generate image: POST http://localhost:${PORT}/api/generate-image`);
  console.log(`💰 Get credits: GET http://localhost:${PORT}/api/credits/balance`);
  console.log(`📜 Generation history: GET http://localhost:${PORT}/api/generation-history`);
});
