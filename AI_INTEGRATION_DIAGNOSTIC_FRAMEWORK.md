# AI Integration Forensic Analysis Framework

## Overview
This document provides a systematic approach to diagnosing issues in AI-powered website features by analyzing symptoms, tracing data flows, and identifying failure points between frontend, backend, and AI service layers.

---

## Phase 1: Symptom Pattern Recognition

### Immediate Diagnostic Questions

#### 1. Failure Type Classification
- [ ] **Total Failure**: No response at all (timeout, 500 error, network error)
- [ ] **Partial Failure**: Bad/weird response (wrong format, unexpected content)
- [ ] **Intermittent**: Sometimes works, sometimes fails
- [ ] **Consistent**: Always fails in the same way

#### 2. Timing Characteristics
- [ ] **Timeout**: Long delay then failure (30+ seconds)
- [ ] **Fast Failure**: Immediate error (< 1 second)
- [ ] **Variable Timing**: Inconsistent response times

#### 3. Input-Specific Issues
- [ ] **All Inputs Fail**: Works for nothing
- [ ] **Specific Inputs Fail**: Only certain prompts/queries fail
- [ ] **Length-Related**: Fails with long/short inputs
- [ ] **Character-Related**: Fails with special characters

#### 4. Error Message Analysis
Document the exact error message:
```
Error Message: _________________________________
Status Code: _________________________________
Request ID (if present): _______________________
```

---

## Phase 2: Layer-by-Layer Investigation

### Frontend Layer Checklist

#### Authentication & Authorization
- [ ] **401 Unauthorized**: Check if Firebase auth token is being sent
  - Location: `src/utils/imageGenerationService.js:356`
  - Check: `Authorization: Bearer ${token}` header present
  - Verify: `user.getIdToken()` is not null/undefined

- [ ] **403 Forbidden**: Check user permissions
  - Verify: User is authenticated before API call
  - Check: User has sufficient credits

#### Request Payload
- [ ] **Malformed Request**: Check console for network errors
  - Location: Browser DevTools → Network tab
  - Verify: Request body is valid JSON
  - Check: Required fields present (`provider`, `prompt`)

- [ ] **Missing Fields**: Verify all required parameters
  ```javascript
  // Required fields:
  - provider: 'flux' | 'sdxl' | 'dalle3' | 'nanobanana'
  - prompt: string (non-empty, max 10000 chars)
  - options: object (optional)
  - facePhotoUrl: string (optional, for face photo generation)
  ```

#### Rate Limiting
- [ ] **429 Too Many Requests**: Check rate limit errors
  - Backend limit: 10 requests/minute per IP
  - Per-user limit: 5 generations/minute
  - Location: `server/server.js:151-189`

#### UI Input Capture
- [ ] **Input Not Captured**: Verify prompt is being read correctly
  - Location: `src/components/AIImageGenerator.jsx:203-231`
  - Check: `prompt.trim()` is not empty
  - Verify: Model selection is valid

---

### Backend/Proxy Layer Checklist

#### CORS Configuration
- [ ] **CORS Errors**: Check browser console for CORS errors
  - Location: `server/server.js:113-119`
  - Verify: `CLIENT_URL` matches frontend URL
  - Check: `credentials: true` is set
  - Verify: Allowed headers include `Authorization`

#### Endpoint Routing
- [ ] **404 Not Found**: Verify endpoint exists
  - Endpoint: `POST /api/generate-image`
  - Location: `server/server.js:730`
  - Verify: Server is running on correct port (default: 3001)

#### Input Processing
- [ ] **Prompt Sanitization**: Check if prompt is being processed correctly
  - Location: `server/server.js:788-800`
  - Verify: Control characters removed
  - Check: Null bytes removed
  - Verify: Whitespace normalized

- [ ] **Options Validation**: Verify options object is valid
  - Location: `server/server.js:802-807`
  - Check: `options` is an object (not null/undefined)
  - Verify: `num_outputs` is between 1-4

#### Response Formatting
- [ ] **Response Structure**: Verify response format matches frontend expectations
  ```javascript
  // Expected response:
  {
    success: true,
    imageUrl: string,
    provider: string,
    cost: number,
    newBalance: number,
    generationId: string,
    metadata: object
  }
  ```

---

### AI Service Layer Checklist

#### API Key Configuration
- [ ] **Missing API Keys**: Check environment variables
  - Location: `server/server.js:86-109`
  - Required keys:
    - `REPLICATE_API_TOKEN` (for Flux, SDXL)
    - `OPENAI_API_KEY` (for DALL-E 3)
    - `GOOGLE_GEMINI_API_KEY` (for NanoBanana)
  - Verify: Keys are set in `server/.env` file

- [ ] **Invalid API Keys**: Check for 401/403 errors from AI providers
  - Replicate: Check `REPLICATE_API_TOKEN`
  - OpenAI: Check `OPENAI_API_KEY`
  - Google: Check `GOOGLE_GEMINI_API_KEY`

#### Model Configuration
- [ ] **Incorrect Model Name**: Verify model identifiers
  - Flux: `'black-forest-labs/flux-pro'` (line 852)
  - SDXL: `'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'` (line 873)
  - DALL-E 3: `'dall-e-3'` (line 893)
  - NanoBanana: `'gemini-2.0-flash-exp'` (line 912)

#### Parameter Configuration
- [ ] **Temperature/Quality Settings**: Check parameter values
  - DALL-E 3: `quality: 'hd'` or `'standard'` (line 896)
  - Flux/SDXL: `num_outputs: 1-4` (line 858)
  - NanoBanana: `temperature: 0.7` (line 923)

#### Prompt Engineering
- [ ] **Prompt Length**: Verify prompt is within limits
  - Max length: 10000 characters (line 782)
  - Min length: 1 character (non-empty, line 776)
  - Check: Prompt is not only whitespace

- [ ] **Content Policy Violations**: Check for policy errors
  - Location: `server/server.js:1055-1059`
  - Common causes: Inappropriate content, safety filters
  - Error message: "Content policy violation"

#### Streaming vs Non-Streaming
- [ ] **Response Handling**: Verify response format matches expectations
  - Replicate: Returns array or single URL (line 862, 883)
  - OpenAI: Returns `data[0].url` (line 899)
  - Gemini: Returns base64 data URI (line 939)

---

## Phase 3: Common Failure Patterns

### Pattern 1: "Replicate API not configured"
**Symptoms**: Error message "Replicate API not configured"  
**Root Cause**: Missing `REPLICATE_API_TOKEN` in environment  
**Fix**: Add `REPLICATE_API_TOKEN=r8_...` to `server/.env`

### Pattern 2: "User not authenticated"
**Symptoms**: 401 Unauthorized error  
**Root Cause**: Firebase auth token missing or expired  
**Fix**: 
- Check `user.getIdToken()` is called
- Verify token is sent in `Authorization` header
- Check Firebase auth state

### Pattern 3: "Insufficient credits"
**Symptoms**: 402 Payment Required error  
**Root Cause**: User doesn't have enough credits  
**Fix**: 
- Check credit balance: `GET /api/credits/balance`
- Verify credit costs match user balance
- Check: Credits are deducted atomically (line 998)

### Pattern 4: "Rate limit exceeded"
**Symptoms**: 429 Too Many Requests  
**Root Cause**: Too many requests in short time  
**Fix**: 
- Wait 1 minute between requests
- Check: Max 10 requests/minute per IP
- Check: Max 5 generations/minute per user

### Pattern 5: "No image URL returned"
**Symptoms**: Generation succeeds but no image URL  
**Root Cause**: AI provider response format mismatch  
**Fix**: 
- Check provider-specific response parsing
- Verify array handling for Replicate (line 862, 883)
- Check OpenAI response structure (line 899)

### Pattern 6: "Content policy violation"
**Symptoms**: 400 error with content policy message  
**Root Cause**: Prompt violates AI provider's content policy  
**Fix**: 
- Modify prompt to remove prohibited content
- Check prompt for inappropriate keywords
- Try different wording

### Pattern 7: "Image fetch timeout"
**Symptoms**: Timeout when uploading to Firebase Storage  
**Root Cause**: Image URL is invalid or unreachable  
**Fix**: 
- Verify image URL is accessible
- Check URL format (HTTP/HTTPS)
- Verify image is not too large (max 10MB)

---

## Phase 4: Diagnostic Tools & Commands

### Health Check Endpoint
```bash
# Check backend health and API key status
curl http://localhost:3001/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "...",
  "stripe": true,
  "firebase": true,
  "replicate": true,  // false if REPLICATE_API_TOKEN missing
  "openai": true,     // false if OPENAI_API_KEY missing
  "gemini": true      // false if GOOGLE_GEMINI_API_KEY missing
}
```

### Test Image Generation
```bash
# Test with curl (requires valid auth token)
curl -X POST http://localhost:3001/api/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "provider": "flux",
    "prompt": "a beautiful sunset",
    "options": {
      "width": 1024,
      "height": 1024,
      "num_outputs": 1
    }
  }'
```

### Check Server Logs
```bash
# View server logs for errors
# Look for:
# - [generate-image] Error: ...
# - [nanobanana] Gemini API error: ...
# - [authenticateUser] Error: ...
```

### Browser DevTools Checks
1. **Network Tab**:
   - Check request URL: Should be `${API_BASE_URL}/api/generate-image`
   - Check request headers: `Authorization: Bearer ...`
   - Check request payload: Valid JSON
   - Check response status: 200, 400, 401, 402, 429, 500
   - Check response body: Error message or image URL

2. **Console Tab**:
   - Look for JavaScript errors
   - Check for CORS errors
   - Verify error messages from frontend

---

## Phase 5: Code Flow Tracing

### Request Flow
```
1. Frontend: AIImageGenerator.jsx:handleGenerate()
   ↓
2. Frontend: imageGenerationService.js:generateImage()
   ↓
3. Frontend: imageGenerationService.js:generateViaBackend()
   ↓
4. Network: POST /api/generate-image
   ↓
5. Backend: server.js:authenticateUser middleware
   ↓
6. Backend: server.js:perUserGenerationLimiter middleware
   ↓
7. Backend: server.js:POST /api/generate-image handler
   ↓
8. Backend: Credit check (getUserCredits)
   ↓
9. Backend: Provider-specific generation
   - Flux: replicate.run('black-forest-labs/flux-pro')
   - SDXL: replicate.run('stability-ai/sdxl:...')
   - DALL-E 3: openai.images.generate()
   - NanoBanana: gemini.generateContent()
   ↓
10. Backend: Upload to Firebase Storage
   ↓
11. Backend: Deduct credits
   ↓
12. Backend: Return response with imageUrl
   ↓
13. Frontend: Display image
```

### Error Flow
```
1. Error occurs at any step above
   ↓
2. Backend: Catch error in try/catch
   ↓
3. Backend: reportErrorToAccount() (if userId available)
   ↓
4. Backend: Sanitize error message
   ↓
5. Backend: Return error response with status code
   ↓
6. Frontend: Catch error in generateViaBackend()
   ↓
7. Frontend: Report error to errorReportingService
   ↓
8. Frontend: Display error message to user
```

---

## Phase 6: Quick Reference - File Locations

### Frontend Files
- **Main Component**: `src/components/AIImageGenerator.jsx`
- **Image Generation Service**: `src/utils/imageGenerationService.js`
- **AI Image Service**: `src/utils/aiImageService.js`
- **Error Handler**: `src/utils/errorHandler.js`

### Backend Files
- **Main Server**: `server/server.js`
- **Image Generation Endpoint**: Line 730-1095
- **Authentication Middleware**: Line 195-228
- **Rate Limiting**: Line 136-189
- **Credit Management**: Line 248-348
- **Error Reporting**: Line 356-413

### Environment Variables
- **Frontend**: `.env.local` (root directory)
- **Backend**: `server/.env`
- **Required Keys**: See `ENVIRONMENT_VARIABLES.md`

---

## Phase 7: Troubleshooting Checklist

Use this checklist when diagnosing a specific issue:

- [ ] **Step 1**: Check browser console for errors
- [ ] **Step 2**: Check network tab for failed requests
- [ ] **Step 3**: Verify backend server is running (`/api/health`)
- [ ] **Step 4**: Check API keys are configured (health endpoint)
- [ ] **Step 5**: Verify user is authenticated (check token)
- [ ] **Step 6**: Check user has sufficient credits
- [ ] **Step 7**: Verify prompt is valid (non-empty, < 10000 chars)
- [ ] **Step 8**: Check rate limits (wait if needed)
- [ ] **Step 9**: Review server logs for detailed errors
- [ ] **Step 10**: Check error reports in Firestore (`errorReports` collection)

---

## Next Steps

When you encounter an issue:

1. **Document Symptoms**: Fill out Phase 1 questions
2. **Check Layers**: Go through Phase 2 checklists
3. **Match Pattern**: Compare to Phase 3 common patterns
4. **Use Tools**: Run Phase 4 diagnostic commands
5. **Trace Flow**: Follow Phase 5 code flow
6. **Review Files**: Check Phase 6 file locations
7. **Follow Checklist**: Complete Phase 7 troubleshooting steps

---

## Support Information

- **Backend Health**: `GET /api/health`
- **Credit Balance**: `GET /api/credits/balance`
- **Generation History**: `GET /api/generation-history`
- **Error Reports**: Check Firestore `errorReports` collection

---

*Last Updated: Based on current codebase analysis*
*Framework Version: 1.0*


