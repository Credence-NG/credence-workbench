# Astro Build-Time Environment Variable Issue - Critical Fix

## Problem Summary

When deploying the application in Docker with `NODE_ENV=staging`, external users were getting **network errors at /auth/signin** because the middleware was still adding localhost URLs to the Content Security Policy, even though the container environment was correctly set to staging.

## Root Cause Analysis

### The Three-Layer Problem

1. **Docker Runtime Environment** ✅ (Was correct)
   - Container had `NODE_ENV=staging` at runtime
   - Verified with `docker compose exec app printenv NODE_ENV`

2. **Astro Build-Time Baking** ❌ (Was the problem)
   - Astro **bakes `import.meta.env` values at BUILD TIME** during `npm run build`
   - The middleware was reading `import.meta.env.PUBLIC_MODE` which was baked in during build
   - Even though runtime env was `staging`, the baked-in value was from the build environment

3. **Package.json Script Hardcoding** ❌ (Additional problem)
   - The `build` script in package.json hardcoded `NODE_ENV=production astro build`
   - This overrode Docker ARG environment variables during build
   - Dockerfile was running `npm run build` which always built with production env

### Evidence

**Middleware logs showed**:
```javascript
{
  runtimeEnv: "development",  // ❌ Wrong! Should be "staging"
  publicMode: undefined,      // ❌ Not set at build time
  publicEnvironment: undefined,
  buildTimeNodeEnv: "production",  // ❌ From package.json script
  isDevelopment: false,
  willAddLocalhost: true,     // ❌ Adding localhost for external users!
}
```

**Container environment was correct**:
```bash
$ docker compose exec app printenv | grep NODE_ENV
NODE_ENV=staging  # ✅ Correct at runtime
```

**But baked values were wrong**:
```javascript
// Inside the built code
import.meta.env.PUBLIC_MODE = undefined  // ❌ Not set during build
process.env.NODE_ENV = "production"      // ❌ From build script
```

## Solution

### Fix 1: Use Correct Build Script in Dockerfile

**Before**:
```dockerfile
# Dockerfile
COPY . .
RUN npm run build  # ❌ Uses NODE_ENV=production from package.json
```

**After**:
```dockerfile
# Dockerfile
COPY . .

# Build with staging environment variables
ARG NODE_ENV=staging
ARG PUBLIC_ENVIRONMENT=staging
ARG PUBLIC_MODE=staging
ENV NODE_ENV=${NODE_ENV}
ENV PUBLIC_ENVIRONMENT=${PUBLIC_ENVIRONMENT}
ENV PUBLIC_MODE=${PUBLIC_MODE}

# Use build:staging script which respects NODE_ENV=staging
RUN npm run build:staging
```

### Fix 2: Pass Build Args in docker-compose.yml

**Before**:
```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    # No build args - defaults to production
```

**After**:
```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=staging
        - PUBLIC_ENVIRONMENT=staging
        - PUBLIC_MODE=staging
```

### Fix 3: Middleware Already Corrected

The middleware was previously updated to use runtime environment detection:

```typescript
// src/middleware.ts
const runtimeEnv = import.meta.env.PUBLIC_MODE || import.meta.env.PUBLIC_ENVIRONMENT;
const isDevelopment =
  wsHost === "localhost" ||
  wsHost === "127.0.0.1" ||
  wsHost.includes(".local") ||
  runtimeEnv === "development";

const isViteEnvironment = isDevelopment && wsPort === "3000";
const willAddLocalhost = isDevelopment || isViteEnvironment;
```

## Why This Was Difficult to Debug

1. **Multiple environment variable sources**:
   - Docker environment variables (runtime)
   - Dockerfile ARG/ENV (build time)
   - package.json scripts (hardcoded)
   - .env.docker file (loaded at runtime)
   - Astro's import.meta.env (baked at build time)

2. **Astro's build-time baking**:
   - Not obvious that `import.meta.env` values are frozen at build time
   - Runtime environment changes don't affect baked values
   - No clear error messages about environment mismatch

3. **docker-compose.override.yml**:
   - Automatically loaded and overrides main config
   - Was initially set to development mode
   - Easy to forget it exists

4. **Package.json scripts**:
   - Hardcoded NODE_ENV values in scripts
   - Override environment variables set in Dockerfile
   - Need to use environment-specific scripts (build:staging)

## Verification Steps

After applying the fix and rebuilding:

### 1. Check Build Command in Docker Logs
```bash
docker compose build 2>&1 | grep "npm run"
# Should show: npm run build:staging
```

### 2. Check Middleware Logs
```bash
docker compose logs app | grep "runtimeEnv" | head -5
```

**Expected Output**:
```javascript
{
  runtimeEnv: "staging",           // ✅ Correct
  publicMode: "staging",           // ✅ Set at build time
  publicEnvironment: "staging",    // ✅ Set at build time
  buildTimeNodeEnv: "staging",     // ✅ From build:staging script
  isDevelopment: false,
  willAddLocalhost: false,         // ✅ No localhost for external users
}
```

### 3. Verify No Localhost in CSP
```bash
docker compose logs app | grep "ALLOW_DOMAIN" | grep -v "localhost"
# Should show domains without localhost
```

### 4. Test External Sign-In
```bash
# From external machine
curl -X POST https://studio.confamd.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

Should NOT get network errors or localhost redirections.

## Files Changed

### [Dockerfile](../Dockerfile)
- Added ARG declarations for NODE_ENV, PUBLIC_ENVIRONMENT, PUBLIC_MODE
- Changed from `npm run build` to `npm run build:staging`

### [docker-compose.yml](../docker-compose.yml)
- Added build args section to pass staging environment variables

### [docker-compose.override.yml](../docker-compose.override.yml)
- Changed NODE_ENV from development to staging (previously fixed)

### [src/middleware.ts](../src/middleware.ts)
- Already using runtime environment detection (previously fixed)

## Related Documentation

- [LOCALHOST_REDIRECTION_FIX.md](./LOCALHOST_REDIRECTION_FIX.md) - Initial investigation
- [DOCKER_STAGING_SETUP.md](./DOCKER_STAGING_SETUP.md) - Complete Docker guide
- [ENVIRONMENT_SETUP_GUIDE.md](./ENVIRONMENT_SETUP_GUIDE.md) - General environment setup
- [ENVIRONMENT_SPECIFIC_URLS.md](./ENVIRONMENT_SPECIFIC_URLS.md) - URL configuration

## Key Takeaways

1. **Astro bakes `import.meta.env` at build time** - You can't change these values at runtime
2. **Use environment-specific build scripts** - `build:staging` for staging, not generic `build`
3. **Pass build args in docker-compose.yml** - Don't rely on Dockerfile defaults
4. **Test at build time, not just runtime** - Environment detection happens during build
5. **Check middleware logs on startup** - Verify environment is detected correctly

## Quick Reference

### Build with Correct Environment
```bash
# Local staging build
npm run build:staging

# Docker staging build
docker compose build --build-arg NODE_ENV=staging

# Or just use docker compose (with updated config)
docker compose up --build -d
```

### Verify Environment in Build
```bash
# Check what script was used
docker compose build 2>&1 | grep "npm run"

# Check baked environment in logs
docker compose logs app | grep "runtimeEnv" | head -1
```

### Test Configuration
```bash
# Before deployment
pnpm docker:test

# After deployment
docker compose exec app printenv | grep NODE_ENV
docker compose logs app | grep "willAddLocalhost" | head -1
```

## Update History

- **2025-11-03**: Initial documentation of critical fix
  - Identified Astro build-time environment baking issue
  - Fixed Dockerfile to use build:staging script
  - Added build args to docker-compose.yml
  - Documented complete root cause analysis

## Related Issues

- External users getting network errors at /auth/signin
- Localhost URLs appearing in staging CSP
- Middleware detecting wrong environment despite correct container env
- docker-compose.override.yml overriding to development mode (previously fixed)

---

**IMPORTANT**: This is a critical configuration issue. Always verify middleware logs show `willAddLocalhost: false` after deploying to staging or production.
