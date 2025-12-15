# Security Checklist for Development

This checklist is for developers (including AI assistants) working on this codebase to ensure security best practices are maintained.

## 🔒 Pre-Commit Security Checks

Before committing any code, verify:

- [ ] **No secrets in code**
  - No API keys, tokens, or passwords hardcoded
  - No `sk_test_`, `sk_live_`, `pk_test_`, `pk_live_`, `r8_`, `whsec_` patterns in code
  - No private keys or service account JSON in source files

- [ ] **No secrets in URLs**
  - API keys never passed as URL query parameters
  - Use Authorization headers or request headers instead
  - Example: `x-goog-api-key` header, not `?key=...` in URL

- [ ] **Environment variables only**
  - All secrets use `process.env.VARIABLE_NAME` (server-side)
  - Client-side only uses `VITE_` prefixed variables for public config (Firebase)
  - Never use `VITE_` prefix for secret API keys

- [ ] **No .env files committed**
  - Verify `.gitignore` includes all `.env*` patterns
  - Check `git status` to ensure no `.env` files are staged
  - Use `.env.example` templates without real values

- [ ] **Error messages sanitized**
  - No API keys, tokens, or secrets in error messages
  - Request IDs removed from user-facing errors
  - Full error details only logged server-side

## 🛡️ Code Review Security Patterns

### API Key Usage
```javascript
// ✅ CORRECT: Server-side, from environment
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
fetch(url, {
  headers: { 'x-goog-api-key': apiKey }
});

// ❌ WRONG: In URL
fetch(`https://api.example.com?key=${apiKey}`);

// ❌ WRONG: Client-side secret
const apiKey = import.meta.env.VITE_SECRET_KEY; // NEVER!
```

### Authentication
```javascript
// ✅ CORRECT: Verify tokens on server
const decodedToken = await auth.verifyIdToken(idToken);

// ✅ CORRECT: Check authentication before operations
if (!isAuthenticated() || request.auth.uid !== userId) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

### Error Handling
```javascript
// ✅ CORRECT: Sanitize before user display
const sanitized = sanitizeErrorMessage(error);
res.status(500).json({ error: sanitized });

// ❌ WRONG: Expose full error
res.status(500).json({ error: error.message }); // May contain secrets!
```

## 🚨 Common Security Pitfalls to Avoid

### 1. Client-Side Secret Exposure
- **Never** add secret API keys with `VITE_` prefix
- **Never** call AI APIs directly from client
- **Always** route through backend API server

### 2. URL Parameter Secrets
- **Never** put API keys in URL query strings
- **Always** use headers: `Authorization`, `x-goog-api-key`, etc.
- **Remember**: URLs appear in logs, browser history, referrer headers

### 3. Console Logging Secrets
- **Never** log full API keys or tokens
- **Safe**: Log first 10 chars: `apiKey.substring(0, 10) + '...'`
- **Safe**: Log boolean checks: `!!apiKey`
- **Never**: `console.log(apiKey)` or `console.log(process.env.SECRET_KEY)`

### 4. Error Message Exposure
- **Never** return full error objects to clients
- **Always** sanitize error messages
- **Remove**: Request IDs, API keys, stack traces from user-facing errors

### 5. Environment Variable Confusion
- **Server secrets**: `process.env.STRIPE_SECRET_KEY` (no prefix)
- **Client public config**: `import.meta.env.VITE_FIREBASE_API_KEY` (VITE_ prefix)
- **Rule**: If it's secret, it stays on the server

## 📋 Before Adding New Features

When adding new functionality that requires API keys:

1. **Identify if it's a secret**
   - Payment processing? → Secret (server-only)
   - AI image generation? → Secret (server-only)
   - Firebase config? → Public (client-safe)

2. **Choose the right location**
   - Secret → Server-side only (`server/.env`)
   - Public → Client-side (`VITE_` prefix in root `.env.local`)

3. **Implement securely**
   - Server: Use `process.env.VARIABLE_NAME`
   - Client: Use `import.meta.env.VITE_VARIABLE_NAME`
   - Never mix them up!

4. **Test security**
   - Verify secret not in client bundle (check `dist/` after build)
   - Verify secret not in URL parameters
   - Verify secret not in console logs
   - Verify secret not in error messages

## 🔍 Security Audit Commands

Run these before committing:

```bash
# Check for hardcoded secrets
grep -r "sk_test_\|sk_live_\|pk_test_\|pk_live_\|r8_\|whsec_" --exclude-dir=node_modules --exclude-dir=dist .

# Check for API keys in URLs
grep -r "?key=\|&key=\|apiKey=" --exclude-dir=node_modules --exclude-dir=dist .

# Check for .env files staged
git status | grep "\.env"

# Check for secrets in console.log
grep -r "console\.log.*apiKey\|console\.log.*secret\|console\.log.*token" --exclude-dir=node_modules .
```

## 📝 Documentation Updates

When documenting new features:

- [ ] **Clarify secret vs public**
  - Clearly mark which variables are secrets
  - Explain why they're server-only
  - Provide examples of correct usage

- [ ] **Update .env.example**
  - Add new variables with placeholder values
  - Add comments explaining purpose
  - Never include real values

- [ ] **Update security notes**
  - Document any security considerations
  - Explain authentication requirements
  - Note any rate limiting or restrictions

## 🎯 Quick Reference: What Goes Where

| Type | Location | Example | Safe to Commit? |
|------|----------|---------|------------------|
| Stripe Secret Key | `server/.env` | `STRIPE_SECRET_KEY=sk_test_...` | ❌ No |
| Stripe Publishable Key | Root `.env.local` | `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` | ❌ No (but safe if exposed) |
| Firebase Config | Root `.env.local` | `VITE_FIREBASE_API_KEY=...` | ❌ No (but safe if exposed) |
| AI API Keys | `server/.env` | `REPLICATE_API_TOKEN=r8_...` | ❌ No |
| Firebase Admin | `server/.env` | `FIREBASE_SERVICE_ACCOUNT={...}` | ❌ No |

## ⚠️ Red Flags - Stop and Review

If you see any of these, **STOP** and fix before committing:

- 🔴 API key in URL: `fetch('https://api.com?key=...')`
- 🔴 Secret with `VITE_` prefix: `VITE_STRIPE_SECRET_KEY`
- 🔴 Hardcoded secret: `const key = 'sk_test_12345'`
- 🔴 Secret in console.log: `console.log(process.env.SECRET_KEY)`
- 🔴 Secret in error message: `error.message` containing API key
- 🔴 .env file staged: `git status` shows `.env` files
- 🔴 Secret in client code: `import.meta.env.SECRET_KEY` (without VITE_)

## ✅ Security Checklist Summary

Before every commit:
1. ✅ No secrets in code
2. ✅ No secrets in URLs
3. ✅ No .env files committed
4. ✅ Error messages sanitized
5. ✅ Console logs don't expose secrets
6. ✅ Client-side only has public config
7. ✅ Server-side handles all secrets
8. ✅ Documentation updated if needed

---

**Remember**: When in doubt, ask yourself: "If this code was public on GitHub, would it expose any secrets?" If yes, fix it before committing.

