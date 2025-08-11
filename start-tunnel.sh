#!/bin/bash

# 🚀 Start Permanent Cloudflare Tunnel
# Uses the configured studio.confamd.com domain
# Serves PRODUCTION build for optimal performance

set -e

TUNNEL_NAME="confirmd-studio"
TUNNEL_ID="038b9d74-1d85-4cbf-89bd-118383b06364"
DOMAIN="studio.confamd.com"
CONFIG_FILE="studio-tunnel-config.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting permanent Cloudflare tunnel...${NC}"
echo "  Tunnel: $TUNNEL_NAME ($TUNNEL_ID)"
echo "  Domain: https://$DOMAIN"
echo "  Config: $CONFIG_FILE"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared not found. Please install it first.${NC}"
    exit 1
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Configuration file not found: $CONFIG_FILE${NC}"
    exit 1
fi

# Check if credentials file exists
CREDS_FILE="/Users/itopa/.cloudflared/$TUNNEL_ID.json"
if [ ! -f "$CREDS_FILE" ]; then
    echo -e "${RED}❌ Credentials file not found: $CREDS_FILE${NC}"
    echo "Please ensure the tunnel is properly configured."
    exit 1
fi

# Check if production server is running
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}🔄 Production server not running on port 3000${NC}"
    echo "Building and starting production server..."
    
    # Build for production
    echo "🏗️  Building production assets..."
    npm run build
    
    # Check if Deno is available
    if command -v deno &> /dev/null; then
        echo "🚀 Starting production server with Deno..."
        PORT=3000 deno run --allow-net --allow-read --allow-env ./dist/server/entry.mjs &
    else
        echo -e "${YELLOW}⚠️  Deno not found locally. Starting development server for tunnel...${NC}"
        echo "   (In production deployment, ensure Deno is installed)"
        npm run dev:tunnel &
    fi
    PROD_PID=$!
    echo "📝 Server PID: $PROD_PID"
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    sleep 8
    
    # Check again
    if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Failed to start server on port 3000${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Server already running on port 3000${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Starting permanent Cloudflare tunnel...${NC}"
echo "📋 Configuration file: $CONFIG_FILE"
echo "🔗 Public URL: https://$DOMAIN"
echo "📱 Mobile wallets can access: https://$DOMAIN/api/invitation/[id]"
echo ""

# Update .env with permanent URL and API configuration
if grep -q "PUBLIC_TUNNEL_URL=" .env; then
    sed -i.bak "s|PUBLIC_TUNNEL_URL=.*|PUBLIC_TUNNEL_URL=https://$DOMAIN|" .env
else
    echo "PUBLIC_TUNNEL_URL=https://$DOMAIN" >> .env
fi

# Ensure the API base URL is set correctly for staging environment
if grep -q "PUBLIC_BASE_URL=" .env; then
    sed -i.bak "s|PUBLIC_BASE_URL=.*|PUBLIC_BASE_URL=https://platform.confamd.com|" .env
else
    echo "PUBLIC_BASE_URL=https://platform.confamd.com" >> .env
fi

echo -e "${GREEN}✅ Updated .env with tunnel URL and API base URL${NC}"

echo ""
echo "Press Ctrl+C to stop the tunnel"
echo "=================================================="

# Start the permanent tunnel
cloudflared tunnel --config "$CONFIG_FILE" run "$TUNNEL_NAME"
