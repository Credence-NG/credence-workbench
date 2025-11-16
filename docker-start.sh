#!/bin/bash

# 🐳 Docker Compose Startup Script for Confirmd Studio
# Starts the application with Cloudflare Tunnel using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"

echo -e "${BLUE}🐳 Starting Confirmd Studio with Docker Compose${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose is not available. Please install Docker Compose.${NC}"
    exit 1
fi

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Select appropriate compose files based on environment
case $ENVIRONMENT in
    "production"|"prod")
        echo -e "${GREEN}🚀 Starting in PRODUCTION mode${NC}"
        COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
        ;;
    "development"|"dev")
        echo -e "${YELLOW}🛠️  Starting in DEVELOPMENT mode${NC}"
        COMPOSE_FILES="-f docker-compose.yml"
        ;;
    "monitoring")
        echo -e "${BLUE}📊 Starting with MONITORING enabled${NC}"
        COMPOSE_FILES="-f docker-compose.yml --profile monitoring"
        ;;
    *)
        echo -e "${YELLOW}⚠️  Unknown environment '$ENVIRONMENT', using development${NC}"
        COMPOSE_FILES="-f docker-compose.yml"
        ;;
esac

# Check for required files
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found in current directory${NC}"
    exit 1
fi

if [ ! -f "studio-tunnel-config.yml" ]; then
    echo -e "${RED}❌ studio-tunnel-config.yml not found${NC}"
    echo "Please ensure your Cloudflare tunnel configuration file exists."
    exit 1
fi

# Check for tunnel credentials
CREDS_PATH="$HOME/.cloudflared"
if [ ! -d "$CREDS_PATH" ]; then
    echo -e "${RED}❌ Cloudflared credentials directory not found: $CREDS_PATH${NC}"
    echo "Please ensure your Cloudflare tunnel is properly configured."
    exit 1
fi

# Build and start services
echo -e "${BLUE}🏗️  Building and starting services...${NC}"
echo "Command: $DOCKER_COMPOSE $COMPOSE_FILES up --build -d"
echo ""

$DOCKER_COMPOSE $COMPOSE_FILES up --build -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo -e "${BLUE}📋 Service Status:${NC}"
$DOCKER_COMPOSE $COMPOSE_FILES ps

# Show logs
echo ""
echo -e "${BLUE}📝 Service Logs (last 20 lines):${NC}"
$DOCKER_COMPOSE $COMPOSE_FILES logs --tail=20

echo ""
echo -e "${GREEN}✅ Confirmd Studio started successfully!${NC}"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "  • Local: http://localhost:3000"
echo "  • Public (Cloudflare): https://studio.confamd.com"
if [[ "$COMPOSE_FILES" == *"monitoring"* ]]; then
    echo "  • Prometheus: http://localhost:9090"
fi
echo ""
echo -e "${YELLOW}💡 Useful Commands:${NC}"
echo "  • View logs: $DOCKER_COMPOSE $COMPOSE_FILES logs -f"
echo "  • Stop services: $DOCKER_COMPOSE $COMPOSE_FILES down"
echo "  • Restart: $DOCKER_COMPOSE $COMPOSE_FILES restart"
echo "  • Check status: $DOCKER_COMPOSE $COMPOSE_FILES ps"
echo ""
echo "Press Ctrl+C to stop all services"

# Follow logs
trap '$DOCKER_COMPOSE $COMPOSE_FILES down; exit' INT
$DOCKER_COMPOSE $COMPOSE_FILES logs -f