# Quick Diagnostic Guide - AI Integration Issues

## 🚀 Quick Start

### Step 1: Run the Diagnostic Tool
```bash
cd server
npm run diagnose
```

This will automatically check:
- ✅ Backend server connectivity
- ✅ Environment variable configuration
- ✅ API key formats
- ✅ Firebase configuration
- ✅ Provider availability

### Step 2: Check Backend Health
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "stripe": true,
  "firebase": true,
  "replicate": true,
  "openai": true,
  "gemini": true
}
```

### Step 3: Review Common Issues

## 🔍 Common Issues & Quick Fixes

### Issue: "Replicate API not configured"
**Symptom**: Flux and SDXL models don't work  
**Fix**: Add to `server/.env`:
```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
```

### Issue: "User not authenticated"
**Symptom**: 401 Unauthorized error  
**Fix**: 
- Check Firebase auth is initialized
- Verify user is signed in
- Check token is being sent in Authorization header

### Issue: "Insufficient credits"
**Symptom**: 402 Payment Required  
**Fix**: 
- Check user credit balance
- Purchase more credits
- Verify credit deduction logic

### Issue: "Rate limit exceeded"
**Symptom**: 429 Too Many Requests  
**Fix**: 
- Wait 1 minute between requests
- Check: Max 10 requests/minute per IP
- Check: Max 5 generations/minute per user

### Issue: "No image URL returned"
**Symptom**: Generation succeeds but no image  
**Fix**: 
- Check provider response format
- Verify image upload to Firebase Storage
- Check network connectivity

### Issue: "Content policy violation"
**Symptom**: 400 error with policy message  
**Fix**: 
- Modify prompt to remove prohibited content
- Try different wording
- Check AI provider's content policy

## 📋 Diagnostic Checklist

When experiencing issues, check these in order:

1. **Backend Running?**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **API Keys Configured?**
   ```bash
   cd server
   npm run diagnose
   ```

3. **User Authenticated?**
   - Check browser console for auth errors
   - Verify Firebase auth state

4. **Sufficient Credits?**
   - Check balance in UI
   - Or: `GET /api/credits/balance`

5. **Rate Limits?**
   - Wait 1 minute
   - Check server logs for rate limit messages

6. **Provider Available?**
   - Check health endpoint
   - Verify API key is valid

## 🔧 Manual Testing

### Test Image Generation (requires auth token)
```bash
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

### Check Error Reports
Check Firestore `errorReports` collection for detailed error logs.

## 📚 Full Documentation

For comprehensive troubleshooting, see:
- **AI_INTEGRATION_DIAGNOSTIC_FRAMEWORK.md** - Complete diagnostic framework
- **ENVIRONMENT_VARIABLES.md** - Environment variable setup
- **server/README.md** - Backend setup guide

## 🆘 Still Having Issues?

1. Check browser console for frontend errors
2. Check server logs for backend errors
3. Review error reports in Firestore
4. Verify all environment variables are set
5. Test with health endpoint
6. Check network tab in browser DevTools

---

*For detailed analysis, use the full diagnostic framework in AI_INTEGRATION_DIAGNOSTIC_FRAMEWORK.md*


