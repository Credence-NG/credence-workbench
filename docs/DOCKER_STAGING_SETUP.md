# Docker Staging Deployment Guide

## Overview

This guide explains how to deploy Confirmd Studio using Docker with `NODE_ENV=staging` configuration. The staging environment is configured to use remote backend URLs with **no localhost redirections**.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [Environment Variables](#environment-variables)
4. [Verification](#verification)
5. [Docker Commands](#docker-commands)
6. [Troubleshooting](#troubleshooting)
7. [Security](#security)

---

## Quick Start

### 1. Verify Configuration

```bash
# Test Docker staging configuration
pnpm docker:test
```

Expected output:
```
✅ ALL TESTS PASSED
Docker staging configuration is correct:
  • NODE_ENV=staging
  • No localhost URLs in production paths
  • Using staging backend: https://platform.confamd.com
```

### 2. Build and Run

```bash
# Build and start containers
docker compose up --build -d

# Check container status
docker compose ps

# View logs
docker compose logs -f app
```

### 3. Verify Deployment

```bash
# Check application is running
curl http://localhost:3000

# Check via tunnel URL
curl https://studio.confamd.com
```

---

## Configuration

### Docker Environment File

**File**: `.env.docker`

```bash
# ============================================
# DOCKER STAGING ENVIRONMENT CONFIGURATION
# ============================================
NODE_ENV=staging
PUBLIC_ENVIRONMENT=staging
PUBLIC_MODE=staging
PORT=3000

# ============================================
# API BASE URLS (Staging)
# ============================================
# NO localhost URLs - all point to remote backend
PUBLIC_BASE_URL=https://platform.confamd.com
PUBLIC_BASE_URL_STAGING=https://platform.confamd.com

# Frontend Configuration
PUBLIC_TUNNEL_URL=https://studio.confamd.com

# ============================================
# CONTENT SECURITY POLICY
# ============================================
# IMPORTANT: NO localhost URLs
PUBLIC_ALLOW_DOMAIN="https://studio.confamd.com wss://studio.confamd.com https://platform.confamd.com wss://platform.confamd.com ..."
```

### Key Configuration Points

1. **NODE_ENV=staging**
   - Uses staging backend URLs
   - No localhost WebSocket URLs added
   - JSON formatted logs

2. **No Localhost URLs**
   - `PUBLIC_BASE_URL` → `https://platform.confamd.com`
   - `PUBLIC_ALLOW_DOMAIN` → No localhost entries
   - Middleware will NOT add localhost to CSP

3. **HTTPS Only**
   - All URLs use HTTPS
   - Secure WebSocket (wss://)
   - HSTS enabled

---

## Environment Variables

### Required Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `staging` | Environment mode |
| `PUBLIC_ENVIRONMENT` | `staging` | Public environment flag |
| `PUBLIC_MODE` | `staging` | Astro environment mode |
| `PUBLIC_BASE_URL` | `https://platform.confamd.com` | Staging backend API |
| `PUBLIC_TUNNEL_URL` | `https://studio.confamd.com` | Frontend URL |

### Security Variables

| Variable | Purpose |
|----------|---------|
| `PUBLIC_CRYPTO_PRIVATE_KEY` | Encryption key |
| `PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID` | Keycloak client ID |
| `PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET` | Keycloak secret |

### Optional Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LOG_LEVEL` | `info` | Logging verbosity |
| `LOG_FORMAT` | `json` | Log format (json/text) |
| `MAX_MEMORY_USAGE` | `2048` | Max memory in MB |
| `MAX_CPU_USAGE` | `2` | Max CPU cores |

---

## Verification

### 1. Pre-Deployment Test

```bash
# Run configuration tests
pnpm docker:test
```

This verifies:
- ✅ NODE_ENV is set to 'staging'
- ✅ No localhost URLs in configuration
- ✅ All URLs use HTTPS
- ✅ Staging backend configured correctly

### 2. Middleware Behavior Check

When the application starts, check logs for:

```bash
docker compose logs app | grep "MIDDLEWARE DEBUG"
```

Expected output:
```javascript
🐛 MIDDLEWARE DEBUG: {
  nodeEnv: 'staging',
  publicMode: 'staging',
  isDevelopment: false,
  isViteEnvironment: false,
  willAddLocalhost: false,  // ← Should be FALSE
  ...
}
```

**Important**: `willAddLocalhost` must be `false` for staging!

### 3. Environment URL Selection Test

```bash
# Test inside Docker container
docker compose exec app node -e "
  process.env.NODE_ENV='staging';
  const { envConfig } = require('./dist/server/config/envConfig.js');
  console.log('Selected URL:', envConfig.PUBLIC_BASE_URL);
"
```

Expected: `https://platform.confamd.com`

---

## Docker Commands

### Build and Run

```bash
# Build and start in detached mode
docker compose up --build -d

# Build without cache
docker compose build --no-cache

# Start only
docker compose up -d

# Stop containers
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Logs and Debugging

```bash
# View all logs
docker compose logs

# Follow logs (real-time)
docker compose logs -f

# View app logs only
docker compose logs -f app

# View last 100 lines
docker compose logs --tail=100 app
```

### Container Management

```bash
# List running containers
docker compose ps

# Restart containers
docker compose restart

# Restart app only
docker compose restart app

# Execute command in container
docker compose exec app sh

# View container stats
docker stats confirmd-studio-app
```

### Cleanup

```bash
# Remove containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Remove containers, volumes, and images
docker compose down -v --rmi all

# Prune unused Docker resources
docker system prune -a
```

---

## Docker Compose Configuration

**File**: `docker-compose.yml`

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: confirmd-studio-app
    ports:
      - "3000:3000"
      - "8085:8085"
    environment:
      - NODE_ENV=staging
      - PUBLIC_ENVIRONMENT=staging
      - PUBLIC_MODE=staging
      - PORT=3000
    env_file:
      - .env.docker  # ← Uses staging config
    volumes:
      - ./logs:/app/logs
    networks:
      - confirmd-network
    restart: unless-stopped
```

### Key Points

1. **env_file: .env.docker**
   - Loads staging configuration
   - All variables from `.env.docker`

2. **environment overrides**
   - Explicit NODE_ENV=staging
   - Ensures staging mode

3. **Volumes**
   - Logs persisted to `./logs`
   - No source code mounting (production-like)

4. **Network**
   - Isolated Docker network
   - Cloudflare tunnel connectivity

---

## Troubleshooting

### Issue: Localhost URLs in CSP

**Symptoms:**
```
Content Security Policy: The page's settings blocked the loading of a resource at http://localhost:...
```

**Diagnosis:**
```bash
# Check middleware logs
docker compose logs app | grep "willAddLocalhost"
```

If `willAddLocalhost: true`, the configuration is wrong.

**Solution:**

1. Verify `.env.docker`:
   ```bash
   cat .env.docker | grep NODE_ENV
   # Should show: NODE_ENV=staging
   ```

2. Check no localhost in ALLOW_DOMAIN:
   ```bash
   cat .env.docker | grep PUBLIC_ALLOW_DOMAIN
   # Should NOT contain 'localhost'
   ```

3. Rebuild container:
   ```bash
   docker compose down
   docker compose up --build -d
   ```

---

### Issue: Wrong Backend URL

**Symptoms:**
- API calls fail
- 404 errors
- CORS errors

**Diagnosis:**
```bash
# Check selected URL in logs
docker compose logs app | grep "Selected URL"
```

**Solution:**

1. Test configuration:
   ```bash
   pnpm docker:test
   ```

2. Verify `.env.docker`:
   ```bash
   cat .env.docker | grep PUBLIC_BASE_URL
   # Should show: PUBLIC_BASE_URL=https://platform.confamd.com
   ```

3. Rebuild:
   ```bash
   docker compose up --build --force-recreate -d
   ```

---

### Issue: Container Won't Start

**Symptoms:**
```
container exited with code 1
```

**Diagnosis:**
```bash
# View container logs
docker compose logs app

# Check build logs
docker compose build app
```

**Common Causes:**

1. **Missing environment variables**
   ```bash
   # Verify .env.docker exists
   ls -la .env.docker
   ```

2. **Port conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :8085
   ```

3. **Build errors**
   ```bash
   # Rebuild without cache
   docker compose build --no-cache app
   ```

---

### Issue: Cloudflare Tunnel Not Working

**Symptoms:**
- `https://studio.confamd.com` not accessible
- Tunnel container failing

**Diagnosis:**
```bash
# Check tunnel status
docker compose ps cloudflare-tunnel

# View tunnel logs
docker compose logs cloudflare-tunnel
```

**Solution:**

1. **Verify credentials**:
   ```bash
   ls -la ~/.cloudflared/038b9d74-1d85-4cbf-89bd-118383b06364.json
   ```

2. **Check tunnel config**:
   ```bash
   cat docker-tunnel-config.yml
   ```

3. **Restart tunnel**:
   ```bash
   docker compose restart cloudflare-tunnel
   ```

---

## Security

### Security Checklist

- ✅ NODE_ENV=staging (not development)
- ✅ No localhost URLs in CSP
- ✅ HTTPS for all external URLs
- ✅ Secure WebSocket (wss://)
- ✅ HSTS enabled
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Secrets not in source control

### Environment-Specific Secrets

**Staging** (`.env.docker`):
```bash
PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET=staging_secret_here
PUBLIC_CRYPTO_PRIVATE_KEY=staging_key_here
```

**Production** (when deploying to production):
```bash
# Use different secrets!
PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET=production_secret_here
PUBLIC_CRYPTO_PRIVATE_KEY=production_key_here
```

### Content Security Policy

Docker staging enforces strict CSP:

```
connect-src 'self' https://platform.confamd.com wss://platform.confamd.com https://studio.confamd.com wss://studio.confamd.com
```

**No localhost URLs** are added in staging mode.

---

## Monitoring

### Health Checks

Docker compose includes health checks:

```bash
# Check health status
docker compose ps

# Manual health check
curl http://localhost:8085/

# Via tunnel
curl https://studio.confamd.com/
```

### Logs

Logs are persisted to `./logs` directory:

```bash
# View logs
ls -la logs/

# Tail logs
tail -f logs/error.log
tail -f logs/combined.log
```

### Metrics (Optional)

Enable Prometheus monitoring:

```bash
# Start with monitoring profile
docker compose --profile monitoring up -d

# Access metrics
open http://localhost:9090
```

---

## Deployment Workflow

### Standard Deployment

```bash
# 1. Verify configuration
pnpm docker:test

# 2. Build and start
docker compose up --build -d

# 3. Check logs
docker compose logs -f app

# 4. Verify accessibility
curl https://studio.confamd.com

# 5. Monitor for errors
docker compose logs -f
```

### Update Deployment

```bash
# 1. Pull latest changes
git pull

# 2. Verify configuration
pnpm docker:test

# 3. Rebuild and restart
docker compose up --build --force-recreate -d

# 4. Verify
docker compose ps
```

### Rollback

```bash
# 1. Stop current deployment
docker compose down

# 2. Checkout previous version
git checkout <previous-commit>

# 3. Rebuild
docker compose up --build -d
```

---

## Related Files

| File | Purpose |
|------|---------|
| [.env.docker](./.env.docker) | Docker staging configuration |
| [docker-compose.yml](../docker-compose.yml) | Docker Compose configuration |
| [docker-tunnel-config.yml](../docker-tunnel-config.yml) | Cloudflare tunnel config |
| [Dockerfile](../Dockerfile) | Docker image definition |
| [scripts/test-docker-env.sh](../scripts/test-docker-env.sh) | Configuration test script |
| [src/middleware.ts](../src/middleware.ts) | Middleware with environment logic |

---

## Summary

### Key Takeaways

✅ **NODE_ENV=staging** for Docker deployments
✅ **No localhost URLs** in staging configuration
✅ **HTTPS only** for all external connections
✅ **Test before deploy** with `pnpm docker:test`
✅ **Monitor logs** for environment detection

### Quick Commands

```bash
# Test configuration
pnpm docker:test

# Deploy
docker compose up --build -d

# Check status
docker compose ps

# View logs
docker compose logs -f app

# Stop
docker compose down
```

---

## Update History

- **2025-11-03**: Initial creation
  - Docker staging configuration
  - No localhost redirection setup
  - Comprehensive testing and verification
  - Troubleshooting guide
  - Security best practices

---

## Need Help?

- Check [Troubleshooting](#troubleshooting) section
- Review [ENVIRONMENT_SETUP_GUIDE.md](./ENVIRONMENT_SETUP_GUIDE.md)
- Run `pnpm docker:test` to verify configuration
- Check Docker logs: `docker compose logs -f`
