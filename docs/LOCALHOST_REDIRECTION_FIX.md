# Localhost Redirection Fix

## Problem

When accessing the application externally (via `https://studio.confamd.com`), users were getting network errors during sign-in. The issue was that the Docker container was still using `localhost` URLs even though it was configured for staging.

## Root Cause

The `docker-compose.override.yml` file was automatically overriding the environment to `NODE_ENV=development`, which caused the middleware to add localhost URLs to the Content Security Policy and API calls.

### What Happened

1. **docker-compose.yml** set `NODE_ENV=staging` ✅
2. **docker-compose.override.yml** overrode it to `NODE_ENV=development` ❌
3. **Middleware** detected development mode and added localhost URLs
4. **External users** got network errors because localhost wasn't accessible

### Evidence from Logs

```javascript
// Before fix:
{
  nodeEnv: 'development',  // ❌ Wrong!
  isDevelopment: true,
  willAddLocalhost: true,  // ❌ Adding localhost for external users
  domains: "...http://localhost:5000...ws://localhost:5000..."
}
```

## Solution

### 1. Fixed docker-compose.override.yml

**File**: `docker-compose.override.yml`

**Before**:
```yaml
services:
  app:
    environment:
      - NODE_ENV=development  # ❌ This was overriding staging config
    volumes:
      - ./src:/app/src:ro  # ❌ Mounting source code (dev only)
```

**After**:
```yaml
services:
  app:
    environment:
      - NODE_ENV=staging  # ✅ Correct for Docker deployment
      - PUBLIC_ENVIRONMENT=staging
      - PUBLIC_MODE=staging
    # No source code mounting in staging/production
```

### 2. Verified .env.docker Configuration

**File**: `.env.docker`

```bash
# Environment
NODE_ENV=staging
PUBLIC_ENVIRONMENT=staging
PUBLIC_MODE=staging

# API URLs (NO localhost)
PUBLIC_BASE_URL=https://platform.confamd.com
PUBLIC_BASE_URL_STAGING=https://platform.confamd.com

# CSP (NO localhost)
PUBLIC_ALLOW_DOMAIN="https://studio.confamd.com wss://studio.confamd.com https://platform.confamd.com ..."
```

### 3. Fixed Middleware Logic

**File**: `src/middleware.ts`

**Before**:
```typescript
const isViteEnvironment =
    wsPort === "3000" ||
    process.env.NODE_ENV !== "production" ||  // ❌ staging !== production, so adds localhost
    import.meta.env.PUBLIC_MODE === "development";
```

**After**:
```typescript
const isViteEnvironment =
    isDevelopment && wsPort === "3000";  // ✅ Only development gets localhost
```

## Verification

### 1. Check Environment in Container

```bash
docker compose exec app printenv | grep NODE_ENV
# Should show: NODE_ENV=staging
```

### 2. Check Middleware Logs

```bash
docker compose logs app | grep "willAddLocalhost"
```

Expected output:
```javascript
{
  nodeEnv: 'staging',  // ✅ Correct
  isDevelopment: false,
  willAddLocalhost: false,  // ✅ No localhost for external users
}
```

### 3. Test API Calls

```bash
# Check what base URL axios is using
docker compose logs app | grep "PUBLIC_BASE_URL"
```

Should show:
```
PUBLIC_BASE_URL=https://platform.confamd.com
```

### 4. Test External Access

```bash
# From external machine or browser
curl https://studio.confamd.com/api/health
```

Should NOT redirect to localhost.

## Deployment Steps

### Clean Rebuild

```bash
# 1. Stop containers
docker compose down

# 2. Verify configuration
pnpm docker:test

# 3. Rebuild and start
docker compose up --build --force-recreate -d

# 4. Check logs
docker compose logs -f app | head -50
```

### Verify No Localhost

```bash
# Check environment variables
docker compose exec app printenv | grep -E "NODE_ENV|PUBLIC_BASE_URL"

# Check middleware behavior
docker compose logs app | grep "willAddLocalhost"

# Test signin endpoint
curl -X POST https://studio.confamd.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

## docker-compose.override.yml Explained

### What is it?

Docker Compose automatically loads `docker-compose.override.yml` if it exists. This file overrides settings from `docker-compose.yml`.

### When to use it?

- **Local development**: Override with development settings
- **Staging/Production**: Override with production settings
- **Different environments**: Different override files for each environment

### How to disable it?

```bash
# Option 1: Rename it
mv docker-compose.override.yml docker-compose.override.yml.disabled

# Option 2: Use explicit file flag
docker compose -f docker-compose.yml up

# Option 3: Keep it but set correct environment
# (This is what we did - set NODE_ENV=staging)
```

## Testing Checklist

After applying the fix:

- [ ] `docker compose exec app printenv | grep NODE_ENV` shows `staging`
- [ ] Logs show `willAddLocalhost: false`
- [ ] Logs show `nodeEnv: 'staging'`
- [ ] No `localhost` URLs in `PUBLIC_ALLOW_DOMAIN`
- [ ] API calls use `https://platform.confamd.com`
- [ ] External signin works without network errors
- [ ] No CORS errors in browser console
- [ ] WebSocket connections use `wss://` not `ws://localhost`

## Related Files

| File | Purpose | Change |
|------|---------|--------|
| `docker-compose.override.yml` | Override settings | Changed NODE_ENV to staging |
| `.env.docker` | Environment variables | Already correct |
| `src/middleware.ts` | CSP and localhost logic | Fixed isViteEnvironment logic |
| `src/services/axiosIntercepter.ts` | API base URL | Uses envConfig (no change needed) |

## Key Takeaways

1. **docker-compose.override.yml is loaded automatically** - Be aware of its existence
2. **NODE_ENV must be staging for Docker** - Not development
3. **Middleware checks NODE_ENV** - This controls localhost addition
4. **Test after every deployment** - Use `pnpm docker:test`
5. **Check logs for willAddLocalhost** - Should be `false` in staging

## Quick Fix Commands

```bash
# If you encounter this issue again:

# 1. Check current NODE_ENV
docker compose exec app printenv NODE_ENV

# 2. If it shows 'development', rebuild:
docker compose down
docker compose up --build --force-recreate -d

# 3. Verify fix
docker compose logs app | grep "nodeEnv\|willAddLocalhost" | head -5
```

## Update History

- **2025-11-03**: Fixed localhost redirection in Docker staging deployment
  - Updated docker-compose.override.yml to use NODE_ENV=staging
  - Verified middleware logic
  - Tested external access
  - Documented the fix

## Related Documentation

- [DOCKER_STAGING_SETUP.md](./DOCKER_STAGING_SETUP.md) - Complete Docker guide
- [ENVIRONMENT_SPECIFIC_URLS.md](./ENVIRONMENT_SPECIFIC_URLS.md) - Environment URL configuration
- [ENVIRONMENT_SETUP_GUIDE.md](./ENVIRONMENT_SETUP_GUIDE.md) - General environment setup
