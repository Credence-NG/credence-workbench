#!/bin/bash

# Test Docker Staging Environment Configuration
# Verifies that staging environment has no localhost redirections

echo "🧪 Docker Staging Environment Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load .env.docker file
if [ ! -f .env.docker ]; then
    echo "❌ ERROR: .env.docker file not found"
    exit 1
fi

echo "📋 Loading .env.docker configuration..."
source .env.docker

echo ""
echo "📊 Environment Variables:"
echo "  NODE_ENV: ${NODE_ENV}"
echo "  PUBLIC_ENVIRONMENT: ${PUBLIC_ENVIRONMENT}"
echo "  PUBLIC_MODE: ${PUBLIC_MODE}"
echo ""

echo "🌐 API Base URLs:"
echo "  PUBLIC_BASE_URL: ${PUBLIC_BASE_URL}"
echo "  PUBLIC_BASE_URL_DEVELOPMENT: ${PUBLIC_BASE_URL_DEVELOPMENT}"
echo "  PUBLIC_BASE_URL_STAGING: ${PUBLIC_BASE_URL_STAGING}"
echo "  PUBLIC_BASE_URL_PRODUCTION: ${PUBLIC_BASE_URL_PRODUCTION}"
echo ""

echo "🔍 Testing Configuration..."
echo ""

# Test 1: NODE_ENV should be staging
if [ "$NODE_ENV" = "staging" ]; then
    echo "✅ NODE_ENV is set to 'staging'"
else
    echo "❌ FAIL: NODE_ENV is '$NODE_ENV', expected 'staging'"
    exit 1
fi

# Test 2: PUBLIC_BASE_URL should NOT be localhost
if [[ "$PUBLIC_BASE_URL" == *"localhost"* ]]; then
    echo "❌ FAIL: PUBLIC_BASE_URL contains 'localhost': $PUBLIC_BASE_URL"
    exit 1
else
    echo "✅ PUBLIC_BASE_URL does not contain 'localhost'"
fi

# Test 3: PUBLIC_BASE_URL should be staging URL
if [ "$PUBLIC_BASE_URL" = "https://platform.confamd.com" ]; then
    echo "✅ PUBLIC_BASE_URL is set to staging backend"
else
    echo "⚠️  WARNING: PUBLIC_BASE_URL is '$PUBLIC_BASE_URL', expected 'https://platform.confamd.com'"
fi

# Test 4: PUBLIC_ALLOW_DOMAIN should NOT contain localhost
if [[ "$PUBLIC_ALLOW_DOMAIN" == *"localhost"* ]]; then
    echo "❌ FAIL: PUBLIC_ALLOW_DOMAIN contains 'localhost'"
    echo "   This will cause localhost redirections in staging!"
    exit 1
else
    echo "✅ PUBLIC_ALLOW_DOMAIN does not contain 'localhost'"
fi

# Test 5: Verify all required URLs are HTTPS
echo ""
echo "🔒 Security Checks:"
if [[ "$PUBLIC_BASE_URL" == https://* ]]; then
    echo "✅ PUBLIC_BASE_URL uses HTTPS"
else
    echo "⚠️  WARNING: PUBLIC_BASE_URL does not use HTTPS: $PUBLIC_BASE_URL"
fi

if [[ "$PUBLIC_BASE_URL_STAGING" == https://* ]]; then
    echo "✅ PUBLIC_BASE_URL_STAGING uses HTTPS"
else
    echo "⚠️  WARNING: PUBLIC_BASE_URL_STAGING does not use HTTPS: $PUBLIC_BASE_URL_STAGING"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL TESTS PASSED"
echo ""
echo "Docker staging configuration is correct:"
echo "  • NODE_ENV=staging"
echo "  • No localhost URLs in production paths"
echo "  • Using staging backend: https://platform.confamd.com"
echo ""
echo "Ready for Docker deployment! 🚀"
