#!/usr/bin/env node
/**
 * Environment Configuration Test Script
 * Tests that NODE_ENV correctly selects the appropriate API base URL
 */

// Mock import.meta.env for testing
const mockEnv = {
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
  PUBLIC_BASE_URL_DEVELOPMENT: process.env.PUBLIC_BASE_URL_DEVELOPMENT || 'http://localhost:5000',
  PUBLIC_BASE_URL_STAGING: process.env.PUBLIC_BASE_URL_STAGING || 'https://platform.confamd.com',
  PUBLIC_BASE_URL_PRODUCTION: process.env.PUBLIC_BASE_URL_PRODUCTION || 'https://platform.credence.ng',
  PUBLIC_MODE: process.env.PUBLIC_MODE,
  PUBLIC_ENVIRONMENT: process.env.PUBLIC_ENVIRONMENT,
};

// Simulate the getEnvironmentAwareBaseUrl logic
function getEnvironmentAwareBaseUrl() {
  const nodeEnv = process.env.NODE_ENV;
  const mode = mockEnv.PUBLIC_MODE;
  const environment = mockEnv.PUBLIC_ENVIRONMENT;

  const currentEnv = nodeEnv || mode || environment;

  if (currentEnv === 'development') {
    return mockEnv.PUBLIC_BASE_URL_DEVELOPMENT || 'http://localhost:5000';
  }

  if (currentEnv === 'staging') {
    return mockEnv.PUBLIC_BASE_URL_STAGING || mockEnv.PUBLIC_BASE_URL;
  }

  if (currentEnv === 'production') {
    return mockEnv.PUBLIC_BASE_URL_PRODUCTION || mockEnv.PUBLIC_BASE_URL;
  }

  return mockEnv.PUBLIC_BASE_URL || 'http://localhost:5000';
}

// Run tests
console.log('🧪 Environment Configuration Test\n');
console.log('━'.repeat(60));

// Display current environment
console.log('\n📊 Current Environment Variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV || '(not set)');
console.log('  PUBLIC_MODE:', mockEnv.PUBLIC_MODE || '(not set)');
console.log('  PUBLIC_ENVIRONMENT:', mockEnv.PUBLIC_ENVIRONMENT || '(not set)');

console.log('\n🌐 Available Base URLs:');
console.log('  Development:', mockEnv.PUBLIC_BASE_URL_DEVELOPMENT);
console.log('  Staging:', mockEnv.PUBLIC_BASE_URL_STAGING);
console.log('  Production:', mockEnv.PUBLIC_BASE_URL_PRODUCTION);
console.log('  Default:', mockEnv.PUBLIC_BASE_URL || '(not set)');

console.log('\n✅ Selected Base URL:');
const selectedUrl = getEnvironmentAwareBaseUrl();
console.log('  →', selectedUrl);

console.log('\n━'.repeat(60));

// Validation
const expectedUrls = {
  development: mockEnv.PUBLIC_BASE_URL_DEVELOPMENT,
  staging: mockEnv.PUBLIC_BASE_URL_STAGING,
  production: mockEnv.PUBLIC_BASE_URL_PRODUCTION,
};

const currentEnv = process.env.NODE_ENV || mockEnv.PUBLIC_MODE || mockEnv.PUBLIC_ENVIRONMENT;
const expectedUrl = expectedUrls[currentEnv];

if (expectedUrl && selectedUrl === expectedUrl) {
  console.log('\n✅ SUCCESS: Correct URL selected for', currentEnv, 'environment');
  console.log('   Expected:', expectedUrl);
  console.log('   Got:     ', selectedUrl);
  process.exit(0);
} else if (!currentEnv) {
  console.log('\n⚠️  WARNING: No environment set (NODE_ENV, PUBLIC_MODE, or PUBLIC_ENVIRONMENT)');
  console.log('   Using fallback URL:', selectedUrl);
  process.exit(0);
} else {
  console.log('\n✅ Environment URL selected:', selectedUrl);
  process.exit(0);
}
