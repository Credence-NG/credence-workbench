# Environment-Specific URL Configuration

## Overview

This guide explains how to configure environment-specific API base URLs that automatically switch based on `NODE_ENV`. The system automatically selects the correct backend URL for development, staging, or production environments.

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Environment Variables](#environment-variables)
3. [Quick Start](#quick-start)
4. [Testing](#testing)
5. [Environment Files](#environment-files)
6. [Migration Guide](#migration-guide)
7. [Troubleshooting](#troubleshooting)

---

## How It Works

### Automatic URL Selection

The application automatically selects the appropriate API base URL based on the current environment:

```
NODE_ENV=development  →  PUBLIC_BASE_URL_DEVELOPMENT  →  http://localhost:5000
NODE_ENV=staging      →  PUBLIC_BASE_URL_STAGING      →  https://platform.confamd.com
NODE_ENV=production   →  PUBLIC_BASE_URL_PRODUCTION   →  https://platform.credence.ng
```

### Selection Priority

The environment is determined in this order:

1. **NODE_ENV** (highest priority)
2. **PUBLIC_MODE**
3. **PUBLIC_ENVIRONMENT**
4. Fallback to **PUBLIC_BASE_URL**

### Implementation

Located in [src/config/envConfig.ts](../src/config/envConfig.ts):

```typescript
const getEnvironmentAwareBaseUrl = () => {
  const nodeEnv = process?.env?.NODE_ENV;
  const mode = PUBLIC_MODE || import.meta.env.PUBLIC_MODE;
  const environment = PUBLIC_ENVIRONMENT || import.meta.env.PUBLIC_ENVIRONMENT;

  const currentEnv = nodeEnv || mode || environment;

  if (currentEnv === "development") {
    return PUBLIC_BASE_URL_DEVELOPMENT || "http://localhost:5000";
  }

  if (currentEnv === "staging") {
    return PUBLIC_BASE_URL_STAGING || PUBLIC_BASE_URL;
  }

  if (currentEnv === "production") {
    return PUBLIC_BASE_URL_PRODUCTION || PUBLIC_BASE_URL;
  }

  return PUBLIC_BASE_URL || "http://localhost:5000";
};

export const envConfig = {
  PUBLIC_BASE_URL: getEnvironmentAwareBaseUrl(),
  // ... other config
};
```

---

## Environment Variables

### Required Variables

Add these to your `.env` file:

```bash
# ============================================
# ENVIRONMENT CONFIGURATION
# ============================================
NODE_ENV=development

# ============================================
# API BASE URLS (Environment-Specific)
# ============================================
# Default/Fallback URL
PUBLIC_BASE_URL=https://platform.confamd.com

# Development Backend (used when NODE_ENV=development)
PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000

# Staging Backend (used when NODE_ENV=staging)
PUBLIC_BASE_URL_STAGING=https://platform.confamd.com

# Production Backend (used when NODE_ENV=production)
PUBLIC_BASE_URL_PRODUCTION=https://platform.credence.ng
```

### Variable Descriptions

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Current environment mode | `development`, `staging`, `production` |
| `PUBLIC_BASE_URL` | Default/fallback API URL | `https://platform.confamd.com` |
| `PUBLIC_BASE_URL_DEVELOPMENT` | Local development backend | `http://localhost:5000` |
| `PUBLIC_BASE_URL_STAGING` | Staging environment backend | `https://platform.confamd.com` |
| `PUBLIC_BASE_URL_PRODUCTION` | Production backend | `https://platform.credence.ng` |

---

## Quick Start

### 1. Set Up Environment

Choose your environment template:

```bash
# For local development
cp .env.development .env

# For staging
cp .env.staging .env

# For production
cp .env.production .env
```

### 2. Verify Configuration

Test that the correct URL is selected:

```bash
# Test current environment
pnpm env:test

# Test development environment
pnpm env:test:dev

# Test staging environment
pnpm env:test:staging

# Test production environment
pnpm env:test:prod
```

Expected output:
```
🧪 Environment Configuration Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Current Environment Variables:
  NODE_ENV: development
  PUBLIC_MODE: development
  PUBLIC_ENVIRONMENT: development

🌐 Available Base URLs:
  Development: http://localhost:5000
  Staging: https://platform.confamd.com
  Production: https://platform.credence.ng
  Default: https://platform.confamd.com

✅ Selected Base URL:
  → http://localhost:5000

✅ SUCCESS: Correct URL selected for development environment
```

### 3. Run Application

```bash
# Development (uses PUBLIC_BASE_URL_DEVELOPMENT)
pnpm dev

# Staging build (uses PUBLIC_BASE_URL_STAGING)
pnpm build:staging

# Production build (uses PUBLIC_BASE_URL_PRODUCTION)
pnpm build:prod
```

---

## Testing

### Test Scripts

Added to [package.json](../package.json):

```json
{
  "scripts": {
    "env:test": "node scripts/test-env.js",
    "env:test:dev": "NODE_ENV=development node scripts/test-env.js",
    "env:test:staging": "NODE_ENV=staging node scripts/test-env.js",
    "env:test:prod": "NODE_ENV=production node scripts/test-env.js"
  }
}
```

### Manual Testing

#### Test Development Environment

```bash
pnpm env:test:dev
```

Should output:
```
✅ Selected Base URL: http://localhost:5000
✅ SUCCESS: Correct URL selected for development environment
```

#### Test Staging Environment

```bash
pnpm env:test:staging
```

Should output:
```
✅ Selected Base URL: https://platform.confamd.com
✅ SUCCESS: Correct URL selected for staging environment
```

#### Test Production Environment

```bash
pnpm env:test:prod
```

Should output:
```
✅ Selected Base URL: https://platform.credence.ng
✅ SUCCESS: Correct URL selected for production environment
```

### Integration Testing

Start the dev server and check the console:

```bash
pnpm dev
```

Open browser console and check:
```javascript
// In browser console
console.log('API Base URL:', window.__ENV__.PUBLIC_BASE_URL);
```

Or check network requests to verify the correct backend is being used.

---

## Environment Files

### File Structure

```
.env                    # Active configuration (gitignored)
.env.development        # Development template
.env.staging           # Staging template
.env.production        # Production template
.env.sample            # General template
.env.docker            # Docker configuration
```

### .env.development

```bash
NODE_ENV=development
PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000

# Use local backend
PUBLIC_BASE_URL=http://localhost:5000

# Debug logging
LOG_LEVEL=debug
LOG_FORMAT=text
```

**Use case**: Local development with backend running on localhost

### .env.staging

```bash
NODE_ENV=staging
PUBLIC_BASE_URL_STAGING=https://platform.confamd.com

# Use staging backend
PUBLIC_BASE_URL=https://platform.confamd.com

# Info logging with JSON format
LOG_LEVEL=info
LOG_FORMAT=json
```

**Use case**: Pre-production testing environment

### .env.production

```bash
NODE_ENV=production
PUBLIC_BASE_URL_PRODUCTION=https://platform.credence.ng

# Use production backend
PUBLIC_BASE_URL=https://platform.credence.ng

# Error logging only
LOG_LEVEL=error
LOG_FORMAT=json
```

**Use case**: Live production deployment

---

## Migration Guide

### Migrating Existing Code

If your code directly references `PUBLIC_BASE_URL`, no changes needed! The system automatically handles it.

#### Before (manual selection)

```typescript
// ❌ Old way - manual environment checks
const apiUrl = process.env.NODE_ENV === 'production'
  ? 'https://platform.credence.ng'
  : 'http://localhost:5000';
```

#### After (automatic selection)

```typescript
// ✅ New way - automatic via envConfig
import { envConfig } from '@/config/envConfig';

const apiUrl = envConfig.PUBLIC_BASE_URL;
// Automatically selects correct URL based on NODE_ENV
```

### Updating API Calls

All existing API calls using `envConfig.PUBLIC_BASE_URL` will automatically use the correct environment-specific URL:

```typescript
// src/services/apiRequests.ts
import { envConfig } from '@/config/envConfig';

const response = await axios.get(`${envConfig.PUBLIC_BASE_URL}/api/endpoint`);
// Automatically uses:
// - http://localhost:5000 in development
// - https://platform.confamd.com in staging
// - https://platform.credence.ng in production
```

---

## Troubleshooting

### Issue: Wrong URL Being Used

**Symptoms:**
- API calls go to wrong backend
- CORS errors
- 404 errors

**Solution:**

1. **Check NODE_ENV is set:**
   ```bash
   pnpm env:check
   ```

2. **Verify environment variables:**
   ```bash
   pnpm env:test
   ```

3. **Check .env file:**
   ```bash
   cat .env | grep NODE_ENV
   cat .env | grep PUBLIC_BASE_URL
   ```

4. **Restart dev server:**
   ```bash
   # Environment variables are cached
   pnpm dev
   ```

---

### Issue: Environment Not Switching

**Symptoms:**
- Changed NODE_ENV but URL didn't change
- Still using old backend

**Solution:**

1. **Clear Astro cache:**
   ```bash
   rm -rf .astro dist
   ```

2. **Restart dev server:**
   ```bash
   pnpm dev
   ```

3. **Verify with test:**
   ```bash
   NODE_ENV=production pnpm env:test
   ```

---

### Issue: Test Script Fails

**Symptoms:**
```
Error: Cannot find module './scripts/test-env.js'
```

**Solution:**

Ensure script exists and is executable:
```bash
ls -la scripts/test-env.js
chmod +x scripts/test-env.js
```

---

### Issue: Development Uses Production URL

**Symptoms:**
- NODE_ENV=development but uses production URL
- Local backend not being used

**Solution:**

1. **Check .env file order:**
   ```bash
   # .env should have:
   NODE_ENV=development
   PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000
   ```

2. **Verify priority:**
   ```bash
   # NODE_ENV takes precedence over PUBLIC_MODE
   echo $NODE_ENV
   ```

3. **Check for typos:**
   ```bash
   grep -E "PUBLIC_BASE_URL" .env
   ```

---

### Issue: Backend Not Running

**Symptoms:**
```
Failed to fetch
Network error
```

**Solution:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Start local backend:**
   ```bash
   # In backend directory
   npm start
   ```

3. **Or use remote backend:**
   ```bash
   # In .env, change:
   PUBLIC_BASE_URL_DEVELOPMENT=https://platform.confamd.com
   ```

---

## Advanced Configuration

### Custom Environment

Create a custom environment (e.g., `qa`):

1. **Create .env.qa:**
   ```bash
   NODE_ENV=qa
   PUBLIC_BASE_URL_QA=https://qa.confamd.com
   ```

2. **Update envConfig.ts:**
   ```typescript
   if (currentEnv === "qa") {
     return PUBLIC_BASE_URL_QA || PUBLIC_BASE_URL;
   }
   ```

3. **Add npm script:**
   ```json
   "build:qa": "NODE_ENV=qa astro build"
   ```

### Multiple Backends

Configure different backends for different services:

```bash
# .env
PUBLIC_AUTH_BASE_URL_DEVELOPMENT=http://localhost:5001
PUBLIC_API_BASE_URL_DEVELOPMENT=http://localhost:5002

PUBLIC_AUTH_BASE_URL_PRODUCTION=https://auth.credence.ng
PUBLIC_API_BASE_URL_PRODUCTION=https://api.credence.ng
```

Update `envConfig.ts`:
```typescript
export const envConfig = {
  AUTH_BASE_URL: getEnvironmentAwareUrl('AUTH'),
  API_BASE_URL: getEnvironmentAwareUrl('API'),
};
```

---

## Best Practices

### 1. Always Define All Environment URLs

```bash
# ✓ Good - All environments defined
PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000
PUBLIC_BASE_URL_STAGING=https://platform.confamd.com
PUBLIC_BASE_URL_PRODUCTION=https://platform.credence.ng

# ✗ Bad - Missing staging
PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000
PUBLIC_BASE_URL_PRODUCTION=https://platform.credence.ng
```

### 2. Use Template Files

```bash
# ✓ Good - Copy from template
cp .env.development .env

# ✗ Bad - Manual configuration
echo "NODE_ENV=development" > .env
```

### 3. Test Before Deployment

```bash
# ✓ Good - Test environment first
pnpm env:test:prod
pnpm build:prod

# ✗ Bad - Deploy without testing
pnpm build:prod
```

### 4. Keep Secrets Separate

```bash
# ✓ Good - Different secrets per environment
# .env.development
PUBLIC_KEYCLOAK_CLIENT_SECRET=dev_secret_123

# .env.production
PUBLIC_KEYCLOAK_CLIENT_SECRET=prod_secret_xyz

# ✗ Bad - Same secrets everywhere
PUBLIC_KEYCLOAK_CLIENT_SECRET=shared_secret
```

---

## Related Documentation

- [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md) - Complete environment configuration
- [CLAUDE.md](../CLAUDE.md) - Project patterns and best practices
- [src/config/envConfig.ts](../src/config/envConfig.ts) - Configuration implementation
- [package.json](../package.json) - npm scripts

---

## Summary

### Key Points

✅ **Automatic URL selection** based on NODE_ENV
✅ **Three environments** supported: development, staging, production
✅ **Easy testing** with `pnpm env:test:*` commands
✅ **Template files** for each environment
✅ **No code changes** required for existing API calls

### Quick Commands

```bash
# Setup
cp .env.development .env

# Test
pnpm env:test:dev

# Run
pnpm dev
```

---

## Update History

- **2025-11-03**: Initial creation
  - Environment-specific URL configuration
  - Automatic URL selection based on NODE_ENV
  - Test scripts for all environments
  - Template files for dev/staging/prod
  - Comprehensive troubleshooting guide

---

## Need Help?

- Check [ENVIRONMENT_SETUP_GUIDE.md](./ENVIRONMENT_SETUP_GUIDE.md)
- Review [Troubleshooting](#troubleshooting) section
- Test with `pnpm env:test`
- Ask in Discord: https://discord.gg/credence
