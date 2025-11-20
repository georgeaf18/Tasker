# Security Reference - Sensitive Data Locations

**Purpose:** This document lists ALL locations where sensitive data (API keys, database URLs, secrets) are stored in the Tasker project. Use this as a checklist to update placeholder values with real credentials after implementation is complete.

**Important:** All files listed below currently contain PLACEHOLDER values. Update them with real credentials before deploying to production.

---

## Backend Environment Files

### 1. `/backend/.env.development`
**Contains:** Local development database and API key
**Lines to update:**
- Line 3: `DATABASE_URL` - Local PostgreSQL connection string
- Line 5: `API_KEY` - Development API key (can be simple value like "dev-key-123")

**Current placeholders:**
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE?schema=public"
API_KEY="PLACEHOLDER_DEV_API_KEY"
```

### 2. `/backend/.env.staging.local`
**Contains:** Staging/testing database and API key (gitignored)
**Lines to update:**
- Line 4: `DATABASE_URL` - Neon development branch connection string
- Line 6: `API_KEY` - Staging API key

**Current placeholders:**
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
API_KEY="PLACEHOLDER_STAGING_API_KEY"
```

**How to get real value:**
- Go to Neon dashboard → Development branch → Connection string
- Generate API key: `openssl rand -base64 32`

### 3. `/backend/.env.production.local`
**Contains:** Production database and API key (gitignored)
**Lines to update:**
- Line 5: `DATABASE_URL` - Neon production branch connection string
- Line 7: `API_KEY` - Production API key (use strong random value)

**Current placeholders:**
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
API_KEY="PLACEHOLDER_PRODUCTION_API_KEY"
```

**How to get real value:**
- Go to Neon dashboard → Production branch → Connection string
- Generate secure API key: `openssl rand -base64 32`

---

## Frontend Environment Files

### 4. `/frontend/src/environments/environment.development.ts`
**Contains:** Local development API URL and key
**Lines to update:**
- Line 4: `apiUrl` - Backend URL (usually http://localhost:3000/api)
- Line 5: `apiKey` - Must match backend `.env.development` API_KEY

**Current placeholders:**
```typescript
apiUrl: 'http://localhost:3000/api',
apiKey: 'PLACEHOLDER_DEV_API_KEY',
```

### 5. `/frontend/src/environments/environment.staging.ts`
**Contains:** Staging backend URL and API key
**Lines to update:**
- Line 4: `apiUrl` - Staging backend URL (will be Fly.io URL when deployed)
- Line 5: `apiKey` - Must match backend staging API_KEY

**Current placeholders:**
```typescript
apiUrl: 'https://STAGING_BACKEND_URL/api',
apiKey: 'PLACEHOLDER_STAGING_API_KEY',
```

**How to get real value:**
- Backend URL: After deploying to Fly.io, use `https://tasker-backend.fly.dev/api`
- API key: Use same value as backend staging API_KEY

### 6. `/frontend/src/environments/environment.production.ts`
**Contains:** Production backend URL and API key
**Lines to update:**
- Line 4: `apiUrl` - Production backend URL
- Line 5: `apiKey` - Must match backend production API_KEY

**Current placeholders:**
```typescript
apiUrl: 'https://PRODUCTION_BACKEND_URL/api',
apiKey: 'PLACEHOLDER_PRODUCTION_API_KEY',
```

---

## Fly.io Deployment Secrets

### 7. Fly.io App Secrets (stored on Fly.io platform)
**Contains:** Production environment variables for deployed backend
**Secrets to set:**
- `DATABASE_URL` - Neon production database connection string
- `API_KEY` - Production API key (must match frontend production)
- `ALLOWED_ORIGINS` - Frontend production URL (when deployed)

**How to set:**
```bash
# Generate secure API key
openssl rand -base64 32

# Set secrets on Fly.io
flyctl secrets set DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require" --app tasker-backend
flyctl secrets set API_KEY="your-generated-key-here" --app tasker-backend
flyctl secrets set ALLOWED_ORIGINS="https://your-frontend-url.com" --app tasker-backend
```

**Current placeholders:**
- DATABASE_URL: (use current value from `.env.production.local`)
- API_KEY: `PLACEHOLDER_PRODUCTION_API_KEY`
- ALLOWED_ORIGINS: `http://localhost:4200` (update when frontend is deployed)

---

## Files That Should NEVER Be Committed

These files contain real credentials and are in `.gitignore`:
- ✅ `backend/.env.local`
- ✅ `backend/.env.development.local`
- ✅ `backend/.env.staging.local`
- ✅ `backend/.env.production.local`
- ✅ `backend/.env` (if you create it with real values)

**Safe to commit** (contain placeholder values only):
- ✅ `backend/.env.development` (with placeholders)
- ✅ `frontend/src/environments/*.ts` (with placeholders)

---

## Security Checklist - Before Production Deployment

### Backend
- [ ] Update `backend/.env.development` with real local database URL
- [ ] Update `backend/.env.development` with simple dev API key
- [ ] Update `backend/.env.staging.local` with Neon dev branch URL
- [ ] Update `backend/.env.staging.local` with staging API key
- [ ] Update `backend/.env.production.local` with Neon production URL
- [ ] Generate strong production API key: `openssl rand -base64 32`
- [ ] Update `backend/.env.production.local` with production API key
- [ ] Verify `.env.*.local` files are in `.gitignore`

### Frontend
- [ ] Update `environment.development.ts` apiKey to match backend dev key
- [ ] Update `environment.staging.ts` apiUrl with Fly.io URL
- [ ] Update `environment.staging.ts` apiKey to match backend staging key
- [ ] Update `environment.production.ts` apiUrl with production backend URL
- [ ] Update `environment.production.ts` apiKey to match backend production key

### Fly.io
- [ ] Set `DATABASE_URL` secret on Fly.io
- [ ] Set `API_KEY` secret on Fly.io (same as backend production)
- [ ] Set `ALLOWED_ORIGINS` secret when frontend is deployed
- [ ] Verify secrets are set: `flyctl secrets list --app tasker-backend`

### Testing
- [ ] Test local development with real dev credentials
- [ ] Test staging deployment with real staging credentials
- [ ] Test production deployment with real production credentials
- [ ] Verify API returns 401 without API key
- [ ] Verify API works with correct API key

---

## How to Generate Secure API Keys

### Development (Simple)
```bash
# Can be anything memorable for local dev
echo "dev-api-key-local-123"
```

### Staging & Production (Secure)
```bash
# Generate 32-character random base64 string
openssl rand -base64 32

# Example output:
# 8vK9xL2mN4pQ7rS1tU6wY3zA5bC8dE0fG2hI4jK6
```

---

## Rotation Schedule (Recommended)

- **Development API Key:** Rotate every 6 months or when compromised
- **Staging API Key:** Rotate every 3 months
- **Production API Key:** Rotate every 3 months or immediately if compromised

**Rotation steps:**
1. Generate new API key: `openssl rand -base64 32`
2. Update backend environment file
3. Update frontend environment file with same key
4. Update Fly.io secret: `flyctl secrets set API_KEY="new-key"`
5. Redeploy backend: `flyctl deploy --app tasker-backend`
6. Test that old key no longer works

---

## Emergency: API Key Compromised

If an API key is exposed in commits, screenshots, or logs:

1. **Immediately rotate the key:**
   ```bash
   # Generate new key
   NEW_KEY=$(openssl rand -base64 32)

   # Update Fly.io
   flyctl secrets set API_KEY="$NEW_KEY" --app tasker-backend

   # Update local files
   # backend/.env.production.local → API_KEY="$NEW_KEY"
   # frontend/src/environments/environment.production.ts → apiKey: "$NEW_KEY"
   ```

2. **Verify old key is revoked:**
   ```bash
   curl -H "X-API-Key: OLD_KEY" https://tasker-backend.fly.dev/api/tasks
   # Should return 401 Unauthorized
   ```

3. **Monitor for unauthorized access** in Fly.io logs

---

## Current Status (After Implementation)

All files currently contain **PLACEHOLDER** values:
- `PLACEHOLDER_DEV_API_KEY`
- `PLACEHOLDER_STAGING_API_KEY`
- `PLACEHOLDER_PRODUCTION_API_KEY`
- `STAGING_BACKEND_URL`
- `PRODUCTION_BACKEND_URL`

**Next steps:**
1. Complete authentication implementation
2. Test with placeholder values to verify structure
3. Update all placeholders with real values using this checklist
4. Test end-to-end with real credentials
5. Deploy to production

---

**Last Updated:** 2025-11-20 (Initial creation)
