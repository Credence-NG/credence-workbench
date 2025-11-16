# Environment Configuration Quick Reference

## Quick Commands

```bash
# Test environment configuration
pnpm env:test              # Test current environment
pnpm env:test:dev          # Test development
pnpm env:test:staging      # Test staging
pnpm env:test:prod         # Test production

# Switch environments
cp .env.development .env   # Switch to development
cp .env.staging .env       # Switch to staging
cp .env.production .env    # Switch to production

# Run application
pnpm dev                   # Development mode
pnpm build:dev             # Build for development
pnpm build:staging         # Build for staging
pnpm build:prod            # Build for production
```

## Environment URLs

| NODE_ENV | Backend URL | Use Case |
|----------|-------------|----------|
| `development` | `http://localhost:5000` | Local development |
| `staging` | `https://platform.confamd.com` | Pre-production testing |
| `production` | `https://platform.credence.ng` | Live production |

## .env File Structure

```bash
# Environment Mode
NODE_ENV=development|staging|production

# API URLs (automatically selected)
PUBLIC_BASE_URL=https://platform.confamd.com                 # Fallback
PUBLIC_BASE_URL_DEVELOPMENT=http://localhost:5000            # For NODE_ENV=development
PUBLIC_BASE_URL_STAGING=https://platform.confamd.com         # For NODE_ENV=staging
PUBLIC_BASE_URL_PRODUCTION=https://platform.credence.ng      # For NODE_ENV=production
```

## How It Works

```
┌─────────────────────┐
│  Set NODE_ENV       │
│  (development/      │
│   staging/          │
│   production)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  envConfig reads    │
│  NODE_ENV and       │
│  selects URL        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PUBLIC_BASE_URL    │
│  set automatically  │
└─────────────────────┘
```

## Troubleshooting

### Wrong URL being used?
```bash
# 1. Check current NODE_ENV
echo $NODE_ENV

# 2. Test configuration
pnpm env:test

# 3. Restart dev server
pnpm dev
```

### Environment not switching?
```bash
# Clear cache and restart
rm -rf .astro dist
pnpm dev
```

## Files

| File | Purpose |
|------|---------|
| `.env` | Active config (gitignored) |
| `.env.development` | Development template |
| `.env.staging` | Staging template |
| `.env.production` | Production template |
| `src/config/envConfig.ts` | Configuration logic |
| `scripts/test-env.js` | Test script |

## Full Documentation

- [ENVIRONMENT_SPECIFIC_URLS.md](./ENVIRONMENT_SPECIFIC_URLS.md) - Complete guide
- [ENVIRONMENT_SETUP_GUIDE.md](./ENVIRONMENT_SETUP_GUIDE.md) - Environment setup
