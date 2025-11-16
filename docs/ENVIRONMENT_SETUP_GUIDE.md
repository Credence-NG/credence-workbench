# Environment Setup Guide

## Overview

This guide explains how environment variables are configured and used in the Confirmd Studio project. The project uses a hybrid approach combining Node.js `process.env` and Astro's `import.meta.env` for environment management.

---

## Table of Contents

1. [Environment Files](#environment-files)
2. [Environment Variables](#environment-variables)
3. [NODE_ENV Configuration](#node_env-configuration)
4. [Available npm Scripts](#available-npm-scripts)
5. [Environment-Specific Behavior](#environment-specific-behavior)
6. [Quick Start](#quick-start)
7. [Troubleshooting](#troubleshooting)

---

## Environment Files

### Available Files

| File | Purpose | Use Case |
|------|---------|----------|
| `.env` | **Active development config** | Local development (gitignored) |
| `.env.docker` | Docker/Production config | Container deployments |
| `.env.bak` | Backup configuration | Restore previous settings |
| `.env.sample` | Template/Example | Reference for new setups |
| `.env.demo` | Demo environment | Demo deployments |

### File Priority

```
.env (local) > Environment variables > Default values
```

---

## Environment Variables

### Core Variables

#### Node Environment

```bash
# Server-side Node.js environment
NODE_ENV=development|staging|production

# Public Astro environment mode (exposed to browser)
PUBLIC_ENVIRONMENT=development|staging|production
PUBLIC_MODE=development|staging|production
```

#### API Configuration

```bash
# Base API URLs
PUBLIC_BASE_URL=https://platform.confamd.com
PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000
PUBLIC_BASE_URL_STAGING=https://platform.confamd.com
PUBLIC_BASE_URL_PRODUCTION=https://platform.credence.ng

# Tunnel URL for local development with ngrok/cloudflare
PUBLIC_TUNNEL_URL=https://studio.confamd.com
```

#### Platform Branding

```bash
PUBLIC_PLATFORM_NAME=WorkBench
PUBLIC_PLATFORM_LOGO=/images/confirmd1-logo.png
PUBLIC_POWERED_BY=Credence Networks Inc.
PUBLIC_PLATFORM_WEB_URL=https://cowriex.com.ng/
PUBLIC_PLATFORM_DOCS_URL=https://credence.com.ng/
PUBLIC_PLATFORM_GIT=https://github.com/credenceng
PUBLIC_PLATFORM_TWITTER_URL="https://twitter.com/..."
PUBLIC_PLATFORM_DISCORD_SUPPORT="https://discord.gg/credence"
```

#### Security

```bash
# Encryption key for sensitive data
PUBLIC_CRYPTO_PRIVATE_KEY=your_crypto_key_here

# Keycloak authentication
PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID='confirmd-bench-management'
PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET=your_secret_here

# Content Security Policy allowed domains
PUBLIC_ALLOW_DOMAIN="http://studio.confamd.com https://studio.confamd.com ..."
```

#### Blockchain Configuration

```bash
PUBLIC_POLYGON_TESTNET_URL='https://rpc-amoy.polygon.technology/'
PUBLIC_POLYGON_MAINNET_URL='https://polygon-rpc.com/'
```

#### Logging Configuration

```bash
LOG_LEVEL=info|debug|warn|error
LOG_TO_FILE=true|false
LOG_DIR=logs
LOG_FORMAT=json|text
```

#### Feature Flags

```bash
PUBLIC_SHOW_NAME_AS_LOGO=true|false
```

---

## NODE_ENV Configuration

### What is NODE_ENV?

`NODE_ENV` is a standard Node.js convention that determines the application's runtime mode. It affects:

- Build optimizations
- Error handling verbosity
- Logging levels
- Security policies
- WebSocket configuration
- API endpoint selection

### Valid Values

```bash
development  # Local development with hot reload, verbose logging
staging      # Pre-production testing environment
production   # Optimized production build, minimal logging
```

### Where It's Used

Located in [src/middleware.ts](../src/middleware.ts):

```typescript
const isDevelopment =
    wsHost === "localhost" ||
    wsHost === "127.0.0.1" ||
    process.env.NODE_ENV === "development" ||
    import.meta.env.PUBLIC_MODE === "development";

const isViteEnvironment =
    process.env.NODE_ENV !== "production" ||
    import.meta.env.PUBLIC_MODE === "development";
```

**Purpose**: Determines WebSocket URLs and Content Security Policy for development vs production.

---

## Available npm Scripts

### Development Scripts

```bash
# Start development server with NODE_ENV=development
pnpm dev
# or
npm run dev

# Start with debug logging enabled
pnpm dev:debug

# Alternative development start command
pnpm start
```

### Build Scripts

```bash
# Production build (optimized, NODE_ENV=production)
pnpm build

# Development build (unoptimized, NODE_ENV=development)
pnpm build:dev

# Staging build (NODE_ENV=staging)
pnpm build:staging

# Explicit production build (same as pnpm build)
pnpm build:prod
```

### Preview Scripts

```bash
# Preview production build
pnpm preview

# Preview development build
pnpm preview:dev
```

### Utility Scripts

```bash
# Check current NODE_ENV and platform
pnpm env:check

# Output example:
# NODE_ENV: development
# Platform: darwin
```

---

## Environment-Specific Behavior

### Development Mode (`NODE_ENV=development`)

**Features:**
- Hot module replacement (HMR) enabled
- Verbose error messages with stack traces
- Source maps enabled
- Unminified code
- Development server runs on port 3000
- WebSocket connects to localhost
- Console debug logs visible

**When to use:**
- Local development on your machine
- Debugging issues
- Testing new features

### Staging Mode (`NODE_ENV=staging`)

**Features:**
- Similar to production but with staging URLs
- May include additional logging
- Used for pre-production testing

**When to use:**
- Testing before production deployment
- QA environment
- Client demos

### Production Mode (`NODE_ENV=production`)

**Features:**
- Code minification and optimization
- Error messages sanitized
- Source maps disabled
- Production API endpoints
- Optimized asset loading
- Minimal console output
- JSON-formatted logs (Docker)

**When to use:**
- Live production deployments
- Performance testing
- Final builds

---

## Quick Start

### 1. Initial Setup

```bash
# Copy environment template (if needed)
cp .env.sample .env

# Or use existing .env file (already configured)
```

### 2. Configure Environment

Edit `.env`:

```bash
# Set environment mode
NODE_ENV=development
PUBLIC_MODE=development

# Set API base URL for local backend
PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000

# Or use remote backend
PUBLIC_BASE_URL_DEVELOPMENT=https://platform.confamd.com
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start Development Server

```bash
pnpm dev
```

Server will start at `http://localhost:3000`

### 5. Verify Environment

```bash
pnpm env:check
```

Expected output:
```
NODE_ENV: development
Platform: darwin
```

---

## Environment Detection Flow

```
┌─────────────────────────────────────┐
│ Application Starts                  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Load .env file                      │
│ - NODE_ENV                          │
│ - PUBLIC_MODE                       │
│ - PUBLIC_ENVIRONMENT                │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Middleware checks environment       │
│ (src/middleware.ts)                 │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Determine behavior:                 │
│ - isDevelopment?                    │
│ - isViteEnvironment?                │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Configure:                          │
│ - WebSocket URLs                    │
│ - Content Security Policy           │
│ - API endpoints                     │
│ - Logging                           │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: NODE_ENV not recognized

**Symptoms:**
```bash
pnpm dev
# Application doesn't respect NODE_ENV
```

**Solution:**
1. Check `.env` file has `NODE_ENV=development`
2. Restart the development server
3. Verify with `pnpm env:check`

---

### Issue: WebSocket connection fails

**Symptoms:**
- Console error: "WebSocket connection failed"
- Real-time features not working

**Solution:**
1. Verify `NODE_ENV=development` in `.env`
2. Check `PUBLIC_MODE=development`
3. Ensure backend is running on configured URL
4. Check `PUBLIC_ALLOW_DOMAIN` includes WebSocket URLs

**Debug:**
```bash
# Check middleware logs in console
# Look for "🐛 MIDDLEWARE DEBUG:" output
```

---

### Issue: Environment variables not updating

**Symptoms:**
- Changed `.env` but values don't update
- Old configuration still active

**Solution:**
1. **Stop the dev server** (Ctrl+C)
2. **Clear build cache**: `rm -rf .astro dist`
3. **Restart**: `pnpm dev`

**Note**: Astro caches environment variables at build time. Server restart required.

---

### Issue: Production build failing

**Symptoms:**
```bash
pnpm build
# Build errors or warnings
```

**Solution:**
1. Ensure `NODE_ENV=production` is set
2. Check all required environment variables are defined
3. Verify no development-only code in production paths
4. Run `pnpm build:dev` first to isolate environment issues

---

### Issue: Wrong API endpoint being used

**Symptoms:**
- API calls fail
- CORS errors
- Authentication issues

**Solution:**
1. Check `PUBLIC_BASE_URL_DEVELOPMENT` matches your backend
2. Verify `NODE_ENV` matches your intent
3. Check `src/config/envConfig.ts` for URL selection logic

**Debug:**
```typescript
// Add to your component
console.log('API Base URL:', import.meta.env.PUBLIC_BASE_URL_DEVELOPMENT);
console.log('Environment:', import.meta.env.PUBLIC_MODE);
```

---

## Advanced Configuration

### Custom Environment Files

Create environment-specific files:

```bash
.env.local       # Local overrides (highest priority)
.env.development # Development defaults
.env.staging     # Staging defaults
.env.production  # Production defaults
```

Load with:
```bash
# Development
cp .env.development .env
pnpm dev

# Staging
cp .env.staging .env
pnpm build:staging

# Production
cp .env.production .env
pnpm build:prod
```

---

### Docker Environment

**File**: `.env.docker`

```bash
NODE_ENV=production
PORT=3000
PUBLIC_BASE_URL=https://platform.confamd.com
LOG_FORMAT=json
```

**Usage:**
```bash
docker compose up --build
```

Docker Compose automatically loads `.env.docker` when configured.

---

### Environment Validation

Add validation script:

```javascript
// scripts/validate-env.js
const required = [
  'PUBLIC_BASE_URL',
  'PUBLIC_CRYPTO_PRIVATE_KEY',
  'PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID'
];

required.forEach(key => {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
});

console.log('✓ Environment variables validated');
```

Add to package.json:
```json
"scripts": {
  "validate:env": "node scripts/validate-env.js"
}
```

---

## Security Best Practices

### DO ✓

- Keep `.env` out of version control (add to `.gitignore`)
- Use `.env.sample` as a template for team members
- Rotate secrets regularly (crypto keys, API secrets)
- Use strong, randomly generated values for `PUBLIC_CRYPTO_PRIVATE_KEY`
- Limit `PUBLIC_ALLOW_DOMAIN` to necessary domains only
- Use environment-specific Keycloak clients

### DON'T ✗

- Commit `.env` files to Git
- Use production secrets in development
- Share secrets via Slack/email
- Hardcode secrets in source code
- Use weak/predictable crypto keys
- Allow `*` in Content Security Policy

---

## Related Files

| File | Purpose |
|------|---------|
| [.env](./.env) | Active environment configuration |
| [.env.docker](./.env.docker) | Docker environment configuration |
| [src/middleware.ts](../src/middleware.ts) | Environment detection and CSP |
| [src/config/envConfig.ts](../src/config/envConfig.ts) | Environment config helpers |
| [astro.config.mjs](../astro.config.mjs) | Astro configuration |
| [package.json](../package.json) | npm scripts with NODE_ENV |

---

## Reference: All Environment Variables

```bash
# Environment
NODE_ENV=development
PUBLIC_ENVIRONMENT=development
PUBLIC_MODE=development

# API URLs
PUBLIC_BASE_URL=https://platform.confamd.com
PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000
PUBLIC_BASE_URL_STAGING=https://platform.confamd.com
PUBLIC_BASE_URL_PRODUCTION=https://platform.credence.ng
PUBLIC_TUNNEL_URL=https://studio.confamd.com

# Security
PUBLIC_CRYPTO_PRIVATE_KEY=dzIvVU5uMa0R3sYwdjEEuT4id17mPpjr
PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID='confirmd-bench-management'
PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET=your_secret_here
PUBLIC_ALLOW_DOMAIN="domain1 domain2 ..."

# Blockchain
PUBLIC_POLYGON_TESTNET_URL='https://rpc-amoy.polygon.technology/'
PUBLIC_POLYGON_MAINNET_URL='https://polygon-rpc.com/'

# Branding
PUBLIC_PLATFORM_NAME=WorkBench
PUBLIC_PLATFORM_LOGO=/images/confirmd1-logo.png
PUBLIC_POWERED_BY=Credence Networks Inc.
PUBLIC_PLATFORM_WEB_URL=https://cowriex.com.ng/
PUBLIC_PLATFORM_DOCS_URL=https://credence.com.ng/
PUBLIC_PLATFORM_GIT=https://github.com/credenceng
PUBLIC_PLATFORM_TWITTER_URL="https://twitter.com/..."
PUBLIC_PLATFORM_DISCORD_SUPPORT="https://discord.gg/credence"

# Feature Flags
PUBLIC_SHOW_NAME_AS_LOGO=true

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_DIR=logs
LOG_FORMAT=text
```

---

## Update History

- **2025-11-03**: Initial creation
  - Documented NODE_ENV configuration
  - Added npm scripts with environment modes
  - Comprehensive troubleshooting guide
  - Security best practices
  - Environment-specific behavior documentation

---

## Need Help?

- Check the [troubleshooting section](#troubleshooting)
- Review [CLAUDE.md](../CLAUDE.md) for project patterns
- Ask in Discord: https://discord.gg/credence
- Report issues: https://github.com/credenceng/issues
