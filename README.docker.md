# Docker Setup for Confirmd Studio

This directory contains Docker Compose configuration for running Confirmd Studio with Cloudflare Tunnel integration.

## 📋 Prerequisites

1. **Docker & Docker Compose**: Ensure you have Docker Desktop installed
2. **Cloudflare Tunnel**: Properly configured tunnel with credentials
3. **Environment Configuration**: Copy `.env.docker` to `.env` and configure

## 🚀 Quick Start

### Development Mode
```bash
# Start in development mode
./docker-start.sh development

# Or using docker-compose directly
docker-compose up --build
```

### Production Mode
```bash
# Start in production mode
./docker-start.sh production

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### With Monitoring
```bash
# Start with Prometheus monitoring
./docker-start.sh monitoring

# Or using docker-compose directly
docker-compose --profile monitoring up --build -d
```

## 🐳 Services

### App Service
- **Container**: `confirmd-studio-app`
- **Port**: `3000`
- **Health Check**: `/api/health`
- **Build**: Uses `Dockerfile` in root directory

### Cloudflare Tunnel Service
- **Container**: `confirmd-tunnel`
- **Image**: `cloudflare/cloudflared:latest`
- **Config**: Uses `studio-tunnel-config.yml`
- **Domain**: `studio.confamd.com`

### Monitoring (Optional)
- **Container**: `confirmd-metrics`
- **Port**: `9090`
- **Service**: Prometheus metrics collection

## 📁 File Structure

```
├── docker-compose.yml          # Base compose configuration
├── docker-compose.override.yml # Development overrides
├── docker-compose.prod.yml     # Production overrides
├── docker-start.sh            # Startup script
├── docker-healthcheck.sh      # Health check script
├── prometheus.yml             # Prometheus configuration
├── .env.docker               # Environment template
└── studio-tunnel-config.yml  # Cloudflare tunnel config
```

## ⚙️ Configuration

### Environment Variables

Copy `.env.docker` to `.env` and configure:

```bash
cp .env.docker .env
# Edit .env with your configuration
```

### Cloudflare Tunnel

Ensure your tunnel configuration is properly set:

1. **Credentials**: Place tunnel credentials in `~/.cloudflared/`
2. **Configuration**: Update `studio-tunnel-config.yml` with your tunnel ID
3. **Domain**: Verify DNS settings for `studio.confamd.com`

## 🔧 Management Commands

### Start Services
```bash
docker-compose up -d                    # Development
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d  # Production
```

### Stop Services
```bash
docker-compose down                     # Stop all services
docker-compose down -v                  # Stop and remove volumes
```

### View Logs
```bash
docker-compose logs -f                  # Follow all logs
docker-compose logs -f app              # Follow app logs only
docker-compose logs -f cloudflare-tunnel # Follow tunnel logs only
```

### Service Status
```bash
docker-compose ps                       # Check service status
docker-compose top                      # Show running processes
```

### Restart Services
```bash
docker-compose restart                  # Restart all services
docker-compose restart app              # Restart app only
```

## 🏥 Health Checks

Both services include health checks:

- **App**: HTTP check on `/api/health` endpoint
- **Tunnel**: HTTP check on metrics endpoint `:8080/metrics`

Check health status:
```bash
docker-compose ps
docker inspect confirmd-studio-app | grep -A 10 Health
```

## 📊 Monitoring

When using the monitoring profile:

1. **Prometheus**: Available at `http://localhost:9090`
2. **Metrics**: 
   - Tunnel metrics: `http://localhost:8080/metrics`
   - App metrics: `http://localhost:3000/api/metrics` (if implemented)

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   ```

2. **Tunnel Credentials Missing**
   ```bash
   # Check credentials directory
   ls -la ~/.cloudflared/
   ```

3. **Service Won't Start**
   ```bash
   # Check logs for errors
   docker-compose logs app
   docker-compose logs cloudflare-tunnel
   ```

### Useful Debug Commands

```bash
# Enter app container
docker-compose exec app /bin/bash

# Check network connectivity
docker-compose exec app curl -v http://localhost:3000

# View tunnel status
docker-compose exec cloudflare-tunnel cloudflared tunnel info
```

## 🔒 Security Considerations

1. **Secrets Management**: Use Docker secrets or external secret management
2. **Network Security**: Services communicate through internal Docker network
3. **Credential Protection**: Tunnel credentials are mounted read-only
4. **Resource Limits**: Production configuration includes resource limits

## 🚢 Deployment

For production deployment:

1. Use production compose file
2. Configure proper logging
3. Set up monitoring
4. Configure backup strategies
5. Implement CI/CD pipeline

## 📞 Support

For issues related to:
- **Docker**: Check Docker documentation
- **Cloudflare Tunnel**: Refer to Cloudflare Tunnel docs
- **Application**: Check application logs and documentation