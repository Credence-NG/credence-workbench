#!/bin/bash

# Health check script for the Confirmd Studio Docker container
# This script is used by Docker to determine if the container is healthy

set -e

HOST="localhost"
PORT="${PORT:-3000}"

# Check if the application is responding
if curl -f -s "http://$HOST:$PORT/api/health" >/dev/null 2>&1; then
    echo "✅ Application is healthy"
    exit 0
elif curl -f -s "http://$HOST:$PORT/" >/dev/null 2>&1; then
    echo "⚠️  Application is responding but health endpoint may not be available"
    exit 0
else
    echo "❌ Application is not responding"
    exit 1
fi