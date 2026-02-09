/**
 * AI Integration Diagnostic Tool
 * 
 * This script helps diagnose issues with AI image generation by checking:
 * - Environment variables
 * - API key configuration
 * - Backend server connectivity
 * - Firebase configuration
 * - Provider availability
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const API_BASE_URL = process.env.CLIENT_URL || 'http://localhost:3001';
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkmark(passed) {
  return passed ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`;
}

async function checkHealth() {
  log('\n=== Backend Health Check ===', 'cyan');
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (response.ok) {
      const health = await response.json();
      log(`Status: ${health.status}`, health.status === 'ok' ? 'green' : 'red');
      log(`Stripe: ${checkmark(health.stripe)}`);
      log(`Firebase: ${checkmark(health.firebase)}`);
      log(`Replicate: ${checkmark(health.replicate)}`);
      log(`OpenAI: ${checkmark(health.openai)}`);
      log(`Gemini: ${checkmark(health.gemini)}`);
      
      if (!health.replicate) {
        log('  ⚠ Replicate API not configured - Flux and SDXL will not work', 'yellow');
      }
      if (!health.openai) {
        log('  ⚠ OpenAI API not configured - DALL-E 3 will not work', 'yellow');
      }
      if (!health.gemini) {
        log('  ⚠ Gemini API not configured - NanoBanana will not work', 'yellow');
      }
      
      return health;
    } else {
      log(`Health check failed: ${response.status} ${response.statusText}`, 'red');
      return null;
    }
  } catch (error) {
    log(`Cannot connect to backend at ${API_BASE_URL}`, 'red');
    log(`Error: ${error.message}`, 'red');
    log('  Make sure the server is running: cd server && npm start', 'yellow');
    return null;
  }
}

function checkEnvironmentVariables() {
  log('\n=== Environment Variables Check ===', 'cyan');
  
  const required = {
    'REPLICATE_API_TOKEN': 'Required for Flux and SDXL',
    'OPENAI_API_KEY': 'Required for DALL-E 3',
    'GOOGLE_GEMINI_API_KEY': 'Required for NanoBanana',
    'STRIPE_SECRET_KEY': 'Required for payments',
    'FIREBASE_SERVICE_ACCOUNT': 'Required for Firebase Admin (or use individual vars)',
  };
  
  const optional = {
    'CLIENT_URL': 'Frontend URL for CORS',
    'PORT': 'Server port (default: 3001)',
  };
  
  let allPresent = true;
  
  log('\nRequired Variables:', 'blue');
  for (const [key, description] of Object.entries(required)) {
    const present = !!process.env[key];
    log(`  ${checkmark(present)} ${key}: ${description}`, present ? 'green' : 'red');
    if (!present) {
      allPresent = false;
      if (key === 'FIREBASE_SERVICE_ACCOUNT') {
        // Check for individual Firebase vars
        const hasIndividual = process.env.FIREBASE_PROJECT_ID && 
                              process.env.FIREBASE_CLIENT_EMAIL && 
                              process.env.FIREBASE_PRIVATE_KEY;
        if (hasIndividual) {
          log(`    → Using individual Firebase variables instead`, 'yellow');
          allPresent = true;
        }
      }
    }
  }
  
  log('\nOptional Variables:', 'blue');
  for (const [key, description] of Object.entries(optional)) {
    const present = !!process.env[key];
    log(`  ${checkmark(present)} ${key}: ${description}`, present ? 'green' : 'yellow');
  }
  
  return allPresent;
}

function checkApiKeyFormats() {
  log('\n=== API Key Format Validation ===', 'cyan');
  
  const checks = [
    {
      key: 'REPLICATE_API_TOKEN',
      pattern: /^r8_/,
      name: 'Replicate',
      example: 'r8_xxxxxxxxxxxxx',
    },
    {
      key: 'OPENAI_API_KEY',
      pattern: /^sk-/,
      name: 'OpenAI',
      example: 'sk-xxxxxxxxxxxxx',
    },
    {
      key: 'GOOGLE_GEMINI_API_KEY',
      pattern: /^AIza/,
      name: 'Google Gemini',
      example: 'AIzaSyxxxxxxxxxxxxx',
    },
    {
      key: 'STRIPE_SECRET_KEY',
      pattern: /^sk_(test|live)_/,
      name: 'Stripe',
      example: 'sk_test_xxxxxxxxxxxxx',
    },
  ];
  
  let allValid = true;
  
  for (const check of checks) {
    const value = process.env[check.key];
    if (value) {
      const valid = check.pattern.test(value);
      log(`  ${checkmark(valid)} ${check.name}: ${valid ? 'Valid format' : 'Invalid format'}`, 
          valid ? 'green' : 'red');
      if (!valid) {
        log(`    Expected format: ${check.example}`, 'yellow');
        allValid = false;
      }
    } else {
      log(`  ${checkmark(false)} ${check.name}: Not set`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function checkFirebaseConfig() {
  log('\n=== Firebase Configuration Check ===', 'cyan');
  
  let hasConfig = false;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT.trim()
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\\\/g, '\\');
      const serviceAccount = JSON.parse(jsonString);
      
      log(`  ${checkmark(true)} FIREBASE_SERVICE_ACCOUNT: Valid JSON`, 'green');
      log(`    Project ID: ${serviceAccount.project_id || 'N/A'}`, 'blue');
      log(`    Client Email: ${serviceAccount.client_email || 'N/A'}`, 'blue');
      hasConfig = true;
    } catch (error) {
      log(`  ${checkmark(false)} FIREBASE_SERVICE_ACCOUNT: Invalid JSON`, 'red');
      log(`    Error: ${error.message}`, 'red');
    }
  } else if (process.env.FIREBASE_PROJECT_ID && 
             process.env.FIREBASE_CLIENT_EMAIL && 
             process.env.FIREBASE_PRIVATE_KEY) {
    log(`  ${checkmark(true)} Firebase: Using individual variables`, 'green');
    log(`    Project ID: ${process.env.FIREBASE_PROJECT_ID}`, 'blue');
    log(`    Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`, 'blue');
    hasConfig = true;
  } else {
    log(`  ${checkmark(false)} Firebase: No configuration found`, 'red');
    log(`    Set either FIREBASE_SERVICE_ACCOUNT or individual variables`, 'yellow');
  }
  
  return hasConfig;
}

async function testProviderConnectivity() {
  log('\n=== Provider Connectivity Test ===', 'cyan');
  log('  (This requires a valid auth token - skipping for now)', 'yellow');
  log('  To test: Use the health endpoint or try a real generation', 'yellow');
}

function generateReport(health, envVars, apiKeys, firebase) {
  log('\n=== Diagnostic Report ===', 'cyan');
  
  const issues = [];
  const warnings = [];
  
  if (!health) {
    issues.push('Backend server is not accessible');
  } else {
    if (!health.replicate) warnings.push('Replicate API not configured (Flux, SDXL unavailable)');
    if (!health.openai) warnings.push('OpenAI API not configured (DALL-E 3 unavailable)');
    if (!health.gemini) warnings.push('Gemini API not configured (NanoBanana unavailable)');
    if (!health.firebase) issues.push('Firebase Admin not initialized');
  }
  
  if (!envVars) {
    issues.push('Missing required environment variables');
  }
  
  if (!apiKeys) {
    issues.push('Some API keys have invalid formats');
  }
  
  if (!firebase) {
    issues.push('Firebase configuration is missing or invalid');
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    log('\n✓ All checks passed! Your AI integration should be working.', 'green');
  } else {
    if (issues.length > 0) {
      log('\n✗ Critical Issues:', 'red');
      issues.forEach(issue => log(`  - ${issue}`, 'red'));
    }
    
    if (warnings.length > 0) {
      log('\n⚠ Warnings:', 'yellow');
      warnings.forEach(warning => log(`  - ${warning}`, 'yellow'));
    }
    
    log('\nNext Steps:', 'cyan');
    log('  1. Fix critical issues first', 'blue');
    log('  2. Review environment variable setup in server/.env', 'blue');
    log('  3. Check API key formats match expected patterns', 'blue');
    log('  4. Verify backend server is running', 'blue');
    log('  5. Test with: curl http://localhost:3001/api/health', 'blue');
  }
}

async function main() {
  log('\n🔍 AI Integration Diagnostic Tool', 'cyan');
  log('=====================================\n', 'cyan');
  
  const health = await checkHealth();
  const envVars = checkEnvironmentVariables();
  const apiKeys = checkApiKeyFormats();
  const firebase = checkFirebaseConfig();
  await testProviderConnectivity();
  
  generateReport(health, envVars, apiKeys, firebase);
  
  log('\nFor detailed troubleshooting, see: AI_INTEGRATION_DIAGNOSTIC_FRAMEWORK.md\n', 'blue');
}

main().catch(console.error);

