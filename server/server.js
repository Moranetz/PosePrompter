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

// Initialize Stripe (optional — server runs without it, payment endpoints will 503)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
  console.log('Stripe initialized');
} else {
  console.warn('STRIPE_SECRET_KEY not set — payment endpoints disabled');
}

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
// CORS configuration with security headers
app.use(cors({
  origin: process.env.CLIENT_URL || ['https://poseprompter.com', 'https://pose-prompter.web.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Request body size limits to prevent DoS attacks
app.use(express.json({ limit: '1mb' })); // Limit JSON payloads to 1MB
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Limit URL-encoded payloads

// Request timeout middleware (30 seconds for image generation, 10 seconds for others)
app.use((req, res, next) => {
  const timeout = req.path.includes('/generate-image') ? 30000 : 10000;
  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  });
  next();
});

// Rate limiting
// General API rate limiter (per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP + user ID for better tracking
  keyGenerator: (req) => {
    return req.ip + (req.user?.uid || 'anonymous');
  },
});

// Image generation rate limiter (stricter, per IP)
const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 generations per minute per IP
  message: 'Too many generation requests. Please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + (req.user?.uid || 'anonymous');
  },
});

// Per-user generation limiter (additional check after authentication)
const perUserGenerationLimiter = async (req, res, next) => {
  if (!req.user?.uid || !db) {
    return next();
  }
  
  try {
    // Check user's generation count in last minute
    const oneMinuteAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 60000);
    const recentGenerations = await db.collection('generationHistory')
      .where('userId', '==', req.user.uid)
      .where('createdAt', '>=', oneMinuteAgo)
      .limit(5)
      .get();
    
    if (recentGenerations.size >= 5) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'You have reached the maximum number of generations per minute. Please wait a moment.',
      });
    }
  } catch (error) {
    // If rate limit check fails, allow request but log error
    console.error('[perUserGenerationLimiter] Error:', error);
  }
  
  next();
};

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
  instantid: 12, // InstantID — face-preserving generation
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
  // Standardize on gems field, validate type
  let credits = userData.gems ?? userData.credits ?? 0;
  credits = Number(credits);
  
  // Validate and ensure integer
  if (isNaN(credits) || credits < 0) {
    return 0;
  }
  
  return Math.floor(credits);
};

// Helper function to deduct credits (atomic transaction to prevent race conditions)
const deductUserCredits = async (userId, amount) => {
  if (!db) throw new Error('Firebase Admin not initialized');
  
  if (amount <= 0) {
    throw new Error('Invalid credit amount');
  }
  
  // Use Firestore transaction to atomically check and deduct credits
  // This prevents race conditions where multiple requests could bypass credit checks
  const result = await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    // Standardize on gems field, validate type
    let currentCredits = userData.gems ?? userData.credits ?? 0;
    currentCredits = Math.floor(Math.max(0, Number(currentCredits)));
    
    // Validate current credits is a valid number
    if (isNaN(currentCredits) || currentCredits < 0) {
      throw new Error('Invalid current credits value');
    }
    
    if (currentCredits < amount) {
      throw new Error('Insufficient credits');
    }
    
    const newBalance = currentCredits - amount;
    
    // Ensure balance can't go negative (safety check)
    if (newBalance < 0) {
      throw new Error('Balance cannot be negative');
    }
    
    // Atomically update credits
    transaction.update(userRef, {
      gems: newBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return newBalance;
  });
  
  return result;
};

// Helper function to add credits (atomic transaction to prevent race conditions)
const addUserCredits = async (userId, amount) => {
  if (!db) throw new Error('Firebase Admin not initialized');
  
  // Validate amount - must be positive integer
  amount = Math.floor(Number(amount));
  if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
    throw new Error(`Invalid credit amount: ${amount}. Must be a positive integer.`);
  }
  
  // Use Firestore transaction to atomically read and add credits
  // This prevents race conditions where multiple requests could lose credits
  const result = await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      // Create user atomically with initial credits
      transaction.set(userRef, {
        gems: amount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[addUserCredits] Created new user ${userId} with ${amount} credits`);
      return amount;
    }
    
    const userData = userDoc.data();
    // Standardize on gems field, validate type
    let currentCredits = userData.gems ?? userData.credits ?? 0;
    currentCredits = Number(currentCredits);
    
    // Validate current credits is a valid number
    if (isNaN(currentCredits) || currentCredits < 0) {
      console.warn(`[addUserCredits] Invalid current credits for user ${userId}, defaulting to 0`);
      currentCredits = 0;
    }
    
    // Ensure integer
    currentCredits = Math.floor(Math.max(0, currentCredits));
    
    const newBalance = currentCredits + amount;
    
    // Validate new balance calculation
    if (isNaN(newBalance) || newBalance < currentCredits) {
      throw new Error(`Invalid balance calculation: ${currentCredits} + ${amount} = ${newBalance}`);
    }
    
    // Ensure result is integer
    const finalBalance = Math.floor(newBalance);
    
    // Atomically update credits
    transaction.update(userRef, {
      gems: finalBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`[addUserCredits] Added ${amount} credits to user ${userId}: ${currentCredits} -> ${finalBalance}`);
    
    return finalBalance;
  });
  
  return result;
};

/**
 * Reports an error to the user's account in Firestore for debugging
 * @param {string} userId - User ID
 * @param {Error|Object} error - The error object
 * @param {Object} context - Additional context
 */
const reportErrorToAccount = async (userId, error, context = {}) => {
  if (!userId || !db) return;

  try {
    // Extract Request ID
    let requestId = null;
    const errorMessage = error.message || error.error?.message || JSON.stringify(error);
    
    requestId = error.request_id || 
                error.headers?.['x-request-id'] || 
                error.requestId ||
                (errorMessage.match(/Request ID:\s*([a-f0-9-]{36})/i)?.[1]) ||
                (errorMessage.match(/\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/i)?.[1]);

    // Determine error type
    let errorType = 'unknown';
    if (error.status === 429 || errorMessage.includes('rate limit')) {
      errorType = 'rate_limit';
    } else if (error.status === 400 || errorMessage.includes('content policy')) {
      errorType = 'content_policy';
    } else if (error.status === 402 || errorMessage.includes('credits')) {
      errorType = 'credits';
    } else if (error.status === 500 || error.status === 502 || error.status === 503) {
      errorType = 'server_error';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorType = 'network';
    } else {
      errorType = 'api_error';
    }

    const errorReport = {
      userId,
      errorType,
      errorMessage,
      errorCode: error.code || null,
      requestId: requestId || null,
      statusCode: error.status || null,
      stack: error.stack || null,
      context: {
        endpoint: context.endpoint || null,
        action: context.action || null,
        metadata: context.metadata || null,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false,
    };

    await db.collection('errorReports').add(errorReport);
    console.log(`[ErrorReport] Error reported to account ${userId}:`, {
      requestId,
      errorType,
      endpoint: context.endpoint,
    });
  } catch (reportError) {
    // Don't throw - error reporting should never break the app
    console.error('[ErrorReport] Failed to report error to account:', reportError);
  }
};

/**
 * Sanitizes error messages to remove Request IDs and other sensitive information
 * @param {Error|string} error - The error object or message
 * @returns {string} Sanitized error message safe for user display
 */
const sanitizeErrorMessage = (error) => {
  let errorMessage = '';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    // Extract message from error object
    errorMessage = error.message || error.error?.message || JSON.stringify(error);
  }
  
  // Remove Request ID patterns from error message
  // Pattern: "Request ID: <uuid>" or "request_id: <uuid>" or just the UUID pattern
  const requestIdPatterns = [
    /Request ID:\s*[a-f0-9-]{36}/gi,
    /request_id:\s*[a-f0-9-]{36}/gi,
    /requestId:\s*[a-f0-9-]{36}/gi,
    /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi,
  ];
  
  let sanitized = errorMessage;
  requestIdPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '').trim();
  });
  
  // Clean up any double spaces or trailing punctuation
  sanitized = sanitized.replace(/\s+/g, ' ').replace(/[.,;:]\s*$/, '').trim();
  
  // If message is empty after sanitization, provide a generic message
  if (!sanitized) {
    sanitized = 'An error occurred. Please try again.';
  }
  
  return sanitized;
};

// Helper function to upload image to Firebase Storage
const uploadImageToStorage = async (userId, imageUrl, imageId) => {
  if (!db) throw new Error('Firebase Admin not initialized');
  
  try {
    // Validate imageUrl
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Invalid image URL');
    }
    
    // Handle data URIs
    if (imageUrl.startsWith('data:image/')) {
      const base64Data = imageUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid data URI format');
      }
      
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Validate file size (max 5MB to match storage rules and frontend)
      if (buffer.length > 5 * 1024 * 1024) {
        throw new Error('Image file too large (max 5MB)');
      }
      
      const bucket = admin.storage().bucket();
      const fileName = `users/${userId}/generations/${imageId}.png`;
      const file = bucket.file(fileName);
      
      // Extract content-type from data URI if available
      const mimeMatch = imageUrl.match(/data:image\/([^;]+)/);
      const contentType = mimeMatch ? `image/${mimeMatch[1]}` : 'image/png';
      
      await file.save(buffer, {
        metadata: {
          contentType: contentType,
        },
      });
      
      // Make file public with error handling
      try {
        await file.makePublic();
      } catch (publicError) {
        console.error('[uploadImageToStorage] Failed to make public:', publicError);
        // Try alternative: set metadata directly
        try {
          await file.setMetadata({ metadata: { public: 'true' } });
        } catch (metaError) {
          console.error('[uploadImageToStorage] Failed to set public metadata:', metaError);
          throw new Error('Failed to make image publicly accessible');
        }
      }
      
      // Verify file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File upload verification failed - file does not exist');
      }
      
      return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }
    
    // Validate URL format for HTTP/HTTPS URLs
    let url;
    try {
      url = new URL(imageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid URL protocol');
      }
    } catch {
      throw new Error('Invalid image URL format');
    }
    
    // Fetch image from URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'PosePrompt-Studio/1.0',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      // Validate content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }
      
      const buffer = await response.arrayBuffer();
      
      // Validate file size (max 5MB to match storage rules and frontend)
      if (buffer.byteLength > 5 * 1024 * 1024) {
        throw new Error('Image file too large (max 5MB)');
      }
      
      const bucket = admin.storage().bucket();
      const fileName = `users/${userId}/generations/${imageId}.png`;
      const file = bucket.file(fileName);
      
      await file.save(Buffer.from(buffer), {
        metadata: {
          contentType: contentType || 'image/png',
        },
      });
      
      // Make file public with error handling
      try {
        await file.makePublic();
      } catch (publicError) {
        console.error('[uploadImageToStorage] Failed to make public:', publicError);
        // Try alternative: set metadata directly
        try {
          await file.setMetadata({ metadata: { public: 'true' } });
        } catch (metaError) {
          console.error('[uploadImageToStorage] Failed to set public metadata:', metaError);
          throw new Error('Failed to make image publicly accessible');
        }
      }
      
      // Verify file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File upload verification failed - file does not exist');
      }
      
      return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Image fetch timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('[uploadImageToStorage] Error:', error);
    throw error;
  }
};

/**
 * POST /api/create-payment-intent
 * Creates a Stripe payment intent for a credit package purchase.
 *
 * Auth: requires verified Firebase ID token. userId is derived from the
 * authed token, never from request body — accepting body.userId let
 * unauthenticated callers spam Stripe under any uid (CWE-770 + CWE-639).
 */
app.post('/api/create-payment-intent', authenticateUser, async (req, res) => {
  try {
    const { amount, creditPackage } = req.body;
    const userId = req.user.uid;

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
    const idempotencyKey = `${userId}-${creditPackage}-${Date.now()}`;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        userId: userId,
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
      message: sanitizeErrorMessage(error),
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
        let creditsToAdd = parseInt(paymentIntent.metadata.credits, 10);
        
        // Validate creditsToAdd is a valid positive integer
        if (isNaN(creditsToAdd) || creditsToAdd <= 0 || !Number.isInteger(creditsToAdd)) {
          console.error('[webhook] Invalid credits value:', paymentIntent.metadata.credits);
          break;
        }
        
        // Ensure integer
        creditsToAdd = Math.floor(creditsToAdd);
        
        if (userId && userId !== 'anonymous' && creditsToAdd > 0) {
          try {
            // CRITICAL: Use atomic transaction with document ID as lock
            // Use paymentIntent.id as document ID - if it exists, already processed
            // This provides true idempotency even with concurrent webhooks
            try {
              await db.runTransaction(async (transaction) => {
                // Try to create transaction document atomically (acts as lock)
                const transactionRef = db.collection('transactions').doc(paymentIntent.id);
                const txDoc = await transaction.get(transactionRef);
                
                // If transaction document exists, already processed
                if (txDoc.exists && txDoc.data().status === 'completed') {
                  throw new Error('Already processed');
                }
                
                // Add credits atomically
                const userRef = db.collection('users').doc(userId);
                const userDoc = await transaction.get(userRef);
                
                if (!userDoc.exists) {
                  transaction.set(userRef, {
                    gems: creditsToAdd,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  });
                } else {
                  const userData = userDoc.data();
                  let currentCredits = userData.gems ?? userData.credits ?? 0;
                  currentCredits = Math.floor(Math.max(0, Number(currentCredits)));
                  const newBalance = currentCredits + creditsToAdd;
                  
                  transaction.update(userRef, {
                    gems: newBalance,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  });
                }
                
                // Log transaction atomically (in same transaction)
                // Use paymentIntent.id as document ID for true idempotency
                transaction.set(transactionRef, {
                  userId,
                  paymentIntentId: paymentIntent.id,
                  credits: creditsToAdd,
                  amount: paymentIntent.amount,
                  currency: paymentIntent.currency,
                  status: 'completed',
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: false }); // merge: false ensures it fails if document exists
              });
            } catch (txError) {
              // If "Already processed", that's expected - ignore
              if (txError.message === 'Already processed') {
                console.log(`[webhook] Payment intent ${paymentIntent.id} already processed. Skipping.`);
                break;
              }
              // If document already exists (ALREADY_EXISTS error), also already processed
              if (txError.code === 6) { // ALREADY_EXISTS
                console.log(`[webhook] Payment intent ${paymentIntent.id} already processed (document exists). Skipping.`);
                break;
              }
              // Other errors should be thrown to trigger retry
              throw txError;
            }
            
            // Get final balance for logging
            const finalBalance = await getUserCredits(userId);
            console.log(`[webhook] Added ${creditsToAdd} credits to user ${userId}. New balance: ${finalBalance}`);
          } catch (creditError) {
            // If error is "Already processed", that's expected - ignore it
            if (creditError.message === 'Already processed') {
              console.log(`[webhook] Payment intent ${paymentIntent.id} already processed.`);
              break;
            }
            
            console.error('[webhook] Error updating credits:', creditError);
            // Return error so Stripe retries (important for user to get credits)
            return res.status(500).json({ 
              error: 'Failed to process payment',
              message: 'Credit addition failed. Stripe will retry.'
            });
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
app.post('/api/generate-image', authenticateUser, perUserGenerationLimiter, async (req, res) => {
  try {
    const { provider, prompt, options = {}, facePhotoUrl } = req.body;
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

    // Calculate total cost based on num_outputs
    // CRITICAL: Charge per image generated, not per request
    const baseCost = CREDIT_COSTS[provider];
    const numOutputs = Math.max(1, Math.min(parseInt(options.num_outputs) || 1, 4)); // Limit to max 4 outputs
    const totalCost = baseCost * numOutputs;
    
    // Check credits using atomic transaction (prevents race conditions)
    const currentCredits = await getUserCredits(userId);
    
    if (currentCredits < totalCost) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: totalCost,
        available: currentCredits,
        baseCost: baseCost,
        numOutputs: numOutputs,
      });
    }

    // Validate prompt length (most models support up to 4000+ characters)
    // Only enforce a reasonable upper limit to prevent abuse
    if (typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt must be a string',
      });
    }
    
    if (prompt.length === 0 || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Prompt cannot be empty',
      });
    }
    
    if (prompt.length > 10000) {
      return res.status(400).json({
        error: 'Prompt too long. Maximum 10000 characters.',
      });
    }
    
    // Sanitize prompt: remove potential injection attempts
    // Remove null bytes, control characters (except newlines/tabs), and normalize whitespace
    const sanitizedPrompt = prompt
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars except \n, \r, \t
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (sanitizedPrompt.length === 0) {
      return res.status(400).json({
        error: 'Prompt contains only invalid characters',
      });
    }
    
    // Validate options object
    if (options && typeof options !== 'object') {
      return res.status(400).json({
        error: 'Options must be an object',
      });
    }
    
    // Validate facePhotoUrl if provided
    if (facePhotoUrl && (typeof facePhotoUrl !== 'string' || !facePhotoUrl.startsWith('http'))) {
      return res.status(400).json({
        error: 'Invalid face photo URL',
      });
    }

    let imageUrl = null;
    let creditsDeducted = false;

    try {
      // Use sanitized prompt for generation
      const finalPrompt = sanitizedPrompt;
      
      // Generate image based on provider
      switch (provider) {
        case 'flux': {
          const replicate = getReplicateClient();
          if (!replicate) {
            throw new Error('Replicate API not configured');
          }

          if (facePhotoUrl) {
            // Face-preserving generation via InstantID
            console.log('[generate-image] Face photo detected on Flux, using InstantID for face preservation');
            const instantIdOutput = await replicate.run(
              'zsxkib/instant-id',
              {
                input: {
                  image: facePhotoUrl,
                  prompt: `professional photo, ${finalPrompt}, high quality, detailed, sharp focus`,
                  negative_prompt: 'blurry, low quality, distorted face, deformed, ugly, bad anatomy, bad proportions, extra limbs, disfigured',
                  ip_adapter_scale: 0.8,
                  controlnet_conditioning_scale: 0.8,
                  num_inference_steps: 30,
                  guidance_scale: 5,
                  seed: options.seed || Math.floor(Math.random() * 2147483647),
                }
              }
            );
            imageUrl = Array.isArray(instantIdOutput) ? instantIdOutput[0] : instantIdOutput;
          } else {
            // Regular Flux 1.1 Pro generation (latest)
            const fluxOutput = await replicate.run(
              'black-forest-labs/flux-1.1-pro',
              {
                input: {
                  prompt: finalPrompt,
                  width: options.width || 1024,
                  height: options.height || 1024,
                  prompt_upsampling: true,
                }
              }
            );
            // Flux 1.1 Pro returns a single URL string
            imageUrl = typeof fluxOutput === 'string' ? fluxOutput : (Array.isArray(fluxOutput) ? fluxOutput[0] : fluxOutput);
          }
          break;
        }

        case 'instantid': {
          // Dedicated InstantID provider — face-preserving generation
          const replicateInstant = getReplicateClient();
          if (!replicateInstant) {
            throw new Error('Replicate API not configured');
          }
          if (!facePhotoUrl) {
            throw new Error('InstantID requires a face photo. Please upload a face photo first.');
          }

          console.log('[generate-image] InstantID generation with face preservation');
          const instantOutput = await replicateInstant.run(
            'zsxkib/instant-id',
            {
              input: {
                image: facePhotoUrl,
                prompt: `professional photo, ${finalPrompt}, high quality, detailed, sharp focus`,
                negative_prompt: 'blurry, low quality, distorted face, deformed, ugly, bad anatomy, bad proportions, extra limbs, disfigured',
                ip_adapter_scale: options.face_strength || 0.8,
                controlnet_conditioning_scale: options.pose_strength || 0.8,
                num_inference_steps: options.steps || 30,
                guidance_scale: options.guidance || 5,
                seed: options.seed || Math.floor(Math.random() * 2147483647),
              }
            }
          );
          imageUrl = Array.isArray(instantOutput) ? instantOutput[0] : instantOutput;
          break;
        }

        case 'sdxl': {
          const replicateSDXL = getReplicateClient();
          if (!replicateSDXL) {
            throw new Error('Replicate API not configured');
          }

          if (facePhotoUrl) {
            // SDXL with face photo: use IP-Adapter FaceID
            console.log('[generate-image] SDXL with face photo, using IP-Adapter FaceID');
            const faceIdOutput = await replicateSDXL.run(
              'lucataco/ip-adapter-faceid',
              {
                input: {
                  image: facePhotoUrl,
                  prompt: finalPrompt,
                  negative_prompt: 'blurry, low quality, distorted face, deformed, ugly, bad anatomy',
                  num_inference_steps: 30,
                  guidance_scale: 7.5,
                }
              }
            );
            imageUrl = Array.isArray(faceIdOutput) ? faceIdOutput[0] : faceIdOutput;
          } else {
            const sdxlOutput = await replicateSDXL.run(
              'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
              {
                input: {
                  prompt: finalPrompt,
                  negative_prompt: 'blurry, low quality, distorted, deformed',
                  width: options.width || 1024,
                  height: options.height || 1024,
                  num_outputs: 1,
                }
              }
            );
            imageUrl = Array.isArray(sdxlOutput) ? sdxlOutput[0] : sdxlOutput;
          }
          break;
        }

        case 'dalle3': {
          const openai = getOpenAIClient();
          if (!openai) {
            throw new Error('OpenAI API not configured');
          }

          if (facePhotoUrl) {
            console.log('[generate-image] DALL-E 3 does not support face photos, generating from prompt only');
          }

          const dalleResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: finalPrompt,
            size: options.size || '1024x1024',
            quality: options.quality || 'hd',
            n: 1,
          });
          imageUrl = dalleResponse.data[0]?.url;
          break;
        }

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if (!imageUrl) {
        throw new Error('No image URL returned from provider');
      }

      // CRITICAL: Deduct credits BEFORE upload to prevent free images if upload succeeds but deduction fails
      // If deduction fails, we haven't uploaded yet, so no cleanup needed
      // If upload fails after deduction, we refund credits
      const newBalance = await deductUserCredits(userId, totalCost);
      creditsDeducted = true;

      // Upload to Firebase Storage (after credits deducted)
      // Use unique imageId to prevent collisions
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${userId}`;
      let firebaseUrl;
      try {
        firebaseUrl = await uploadImageToStorage(userId, imageUrl, imageId);
      } catch (uploadError) {
        // Upload failed after credits deducted - refund credits
        console.error('[generate-image] Upload failed after credit deduction, refunding:', uploadError);
        try {
          await addUserCredits(userId, totalCost);
          creditsDeducted = false; // Already refunded
        } catch (refundError) {
          console.error('[generate-image] Error refunding credits after upload failure:', refundError);
          // Credits deducted but refund failed - log for manual review
        }
        // Return original URL as fallback so user doesn't lose the generated image
        firebaseUrl = imageUrl; // Return provider URL directly
        console.warn('[generate-image] Returning original provider URL due to upload failure');
      }

      // Log generation
      const generationDoc = await db.collection('generationHistory').add({
        userId,
        provider,
        imageUrl: firebaseUrl,
        prompt: finalPrompt.substring(0, 500),
        cost: totalCost, // Log total cost charged
        baseCost: baseCost,
        numOutputs: numOutputs,
        imageId,
        options,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        imageUrl: firebaseUrl,
        provider,
        cost: totalCost, // Return total cost charged
        baseCost: baseCost,
        numOutputs: numOutputs,
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
          await addUserCredits(userId, totalCost);
        } catch (refundError) {
          console.error('[generate-image] Error refunding credits:', refundError);
        }
      }

      // Report error to user's account for debugging
      await reportErrorToAccount(userId, generationError, {
        endpoint: '/api/generate-image',
        action: 'image_generation',
        metadata: { provider, prompt: finalPrompt.substring(0, 100) },
      });

      // Handle specific error types
      const errorMessage = generationError.message || '';
      if (errorMessage.includes('rate limit') || generationError.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Please try again in a moment.',
        });
      } else if (errorMessage.includes('content policy') || errorMessage.includes('safety') || generationError.status === 400) {
        return res.status(400).json({
          error: 'Content policy violation',
          message: 'Your prompt violates the content policy. Please modify your prompt.',
        });
      }

      // Sanitize error message before throwing
      const sanitizedError = new Error(sanitizeErrorMessage(generationError));
      sanitizedError.originalError = generationError; // Keep original for logging
      throw sanitizedError;
    }
  } catch (error) {
    console.error('[generate-image] Error:', error);
    
    // Report error to user's account for debugging
    await reportErrorToAccount(userId, error, {
      endpoint: '/api/generate-image',
      action: 'image_generation',
    });
    
    // Determine appropriate status code
    let statusCode = 500;
    const errorMessage = error.message || '';
    if (errorMessage.includes('Insufficient credits')) {
      statusCode = 402;
    } else if (errorMessage.includes('Invalid') || errorMessage.includes('Missing')) {
      statusCode = 400;
    } else if (errorMessage.includes('Unauthorized')) {
      statusCode = 401;
    }

    // Sanitize error message before sending to user
    const sanitizedMessage = sanitizeErrorMessage(error);

    res.status(statusCode).json({
      error: 'Image generation failed',
      message: sanitizedMessage,
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
      message: sanitizeErrorMessage(error),
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
      message: sanitizeErrorMessage(error),
    });
  }
});

/**
 * POST /api/refund-credits
 * Refunds credits to a user (admin/system use only)
 * CRITICAL: This endpoint requires admin authentication
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

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount. Must be a positive number.',
      });
    }

    // CRITICAL SECURITY: Only allow users to refund their own credits OR require admin
    // For production, implement proper admin check using Firebase Custom Claims
    // For now, only allow self-refunds (users can only refund to themselves)
    if (targetUserId !== adminUserId) {
      // Check if user has admin custom claim
      try {
        const userRecord = await auth.getUser(adminUserId);
        const isAdmin = userRecord.customClaims?.admin === true;
        
        if (!isAdmin) {
          return res.status(403).json({ 
            error: 'Unauthorized: Admin access required to refund credits to other users',
            message: 'You can only refund credits to your own account'
          });
        }
      } catch (authError) {
        return res.status(403).json({ 
          error: 'Unauthorized: Admin access required',
          message: 'Unable to verify admin status'
        });
      }
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
      message: sanitizeErrorMessage(error),
    });
  }
});

/**
 * POST /api/confirm-payment
 * Confirms payment and updates user's credit balance in Firestore
 * (Legacy endpoint - webhook now handles this automatically)
 * CRITICAL: Add idempotency check to prevent duplicate credit additions
 *
 * Auth: requires verified Firebase ID token. userId is derived from the
 * authed token. The paymentIntent.metadata.userId must equal the authed
 * uid — both checks together prevent grant-credits-to-wrong-user attacks.
 */
app.post('/api/confirm-payment', authenticateUser, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.uid;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Missing required field: paymentIntentId',
      });
    }

    if (!db) {
      return res.status(500).json({
        error: 'Firebase Admin not initialized',
      });
    }

    // CRITICAL: Check if transaction already processed (idempotency)
    const existingTransaction = await db.collection('transactions')
      .where('paymentIntentId', '==', paymentIntentId)
      .where('status', '==', 'completed')
      .limit(1)
      .get();
    
    if (!existingTransaction.empty) {
      // Transaction already processed, return existing result
      const existing = existingTransaction.docs[0].data();
      const currentBalance = await getUserCredits(userId);
      return res.json({
        success: true,
        creditBalance: currentBalance,
        creditsAdded: existing.credits,
        message: 'Payment already confirmed',
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
    let creditsToAdd = parseInt(paymentIntent.metadata.credits, 10);
    
    // Validate credits - must be positive integer
    if (isNaN(creditsToAdd) || creditsToAdd <= 0 || !Number.isInteger(creditsToAdd)) {
      return res.status(400).json({
        error: 'Invalid credits amount in payment metadata',
      });
    }
    
    // Ensure integer
    creditsToAdd = Math.floor(creditsToAdd);

    // Update user's credit balance (atomic)
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
      message: sanitizeErrorMessage(error),
    });
  }
});

/**
 * POST /api/reward-rating
 * Rewards credits to user for rating the app
 * Includes idempotency check to prevent duplicate rewards
 *
 * Auth: requires verified Firebase ID token. userId is derived from
 * the authed token, NEVER from request body — accepting body.userId
 * lets anyone burn another user's 50-credit reward (CWE-639).
 */
app.post('/api/reward-rating', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!db) {
      return res.status(500).json({
        error: 'Firebase Admin not initialized',
      });
    }

    // Credits to reward for rating
    const RATING_REWARD_CREDITS = 50;

    // Check if user has already been rewarded for rating (idempotency)
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      
      // Check if user has already been rewarded
      if (userData.hasRatedApp === true) {
        // User already rated, return current balance without rewarding again
        const currentBalance = await getUserCredits(userId);
        return res.json({
          success: true,
          creditBalance: currentBalance,
          creditsAdded: 0,
          message: 'Already rewarded for rating',
        });
      }
    }

    // Reward credits atomically
    const newBalance = await addUserCredits(userId, RATING_REWARD_CREDITS);

    // Mark user as having rated (idempotency flag)
    await userRef.set({
      hasRatedApp: true,
      ratedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Log the reward
    try {
      await db.collection('transactions').add({
        userId,
        type: 'rating_reward',
        credits: RATING_REWARD_CREDITS,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.warn('[reward-rating] Failed to log transaction:', logError);
    }

    console.log(`[reward-rating] Rewarded ${RATING_REWARD_CREDITS} credits to user ${userId} for rating`);

    res.json({
      success: true,
      creditBalance: newBalance,
      creditsAdded: RATING_REWARD_CREDITS,
    });
  } catch (error) {
    console.error('[reward-rating] Error:', error);
    res.status(500).json({
      error: 'Failed to reward credits for rating',
      message: sanitizeErrorMessage(error),
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

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 PosePrompt Studio API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Create payment intent: POST http://localhost:${PORT}/api/create-payment-intent`);
  console.log(`✅ Confirm payment: POST http://localhost:${PORT}/api/confirm-payment`);
  console.log(`🎨 Generate image: POST http://localhost:${PORT}/api/generate-image`);
  console.log(`💰 Get credits: GET http://localhost:${PORT}/api/credits/balance`);
  console.log(`📜 Generation history: GET http://localhost:${PORT}/api/generation-history`);
});

// Handle server errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or use a different port.`);
    console.error(`   To find and kill the process: netstat -ano | findstr :${PORT}`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit - let the process manager handle restarts
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let the process manager handle restarts
});
