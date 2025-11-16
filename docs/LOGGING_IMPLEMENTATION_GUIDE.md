# Server Logging Implementation Guide

## Overview

This document describes the comprehensive logging system implemented for all platform API interactions in the confirmd-workbench application. The logging system provides structured, configurable logging with support for file rotation, multiple log levels, and JSON formatting.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Usage Examples](#usage-examples)
5. [Log Levels](#log-levels)
6. [Log Formats](#log-formats)
7. [File Organization](#file-organization)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Features

### ✅ Implemented Features

- **Structured Logging**: All API requests and responses are logged with consistent structure
- **File Rotation**: Daily rotating log files with configurable retention (14-30 days)
- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR with environment-based configuration
- **Separate Log Files**:
  - `combined-*.log` - All log levels
  - `error-*.log` - Error-level logs only (30-day retention)
  - `api-*.log` - All API interactions for audit trail (30-day retention)
- **Colorized Console Output**: Easy-to-read console logs in development
- **JSON Format Support**: Optional JSON formatting for log aggregation tools
- **Performance Tracking**: Request/response duration measurement
- **Authentication Logging**: Token refresh and auth flow tracking
- **Operation-Specific Logging**: Dedicated loggers for verification, issuance, schema, etc.

---

## Architecture

### Core Components

1. **`src/utils/logger.ts`** - Centralized logger utility
2. **`src/services/apiRequests.ts`** - HTTP request wrappers with logging
3. **`src/services/axiosIntercepter.ts`** - Axios interceptors with logging
4. **`logs/`** - Log file directory (gitignored except `.gitkeep`)

### Logger Class Hierarchy

```
winston.Logger (main logger)
  └── APILogger (API-specific helpers)
      ├── logRequest()
      ├── logResponse()
      ├── logError()
      ├── logAuth()
      ├── logTokenRefresh()
      ├── logVerification()
      ├── logIssuance()
      ├── logSchema()
      ├── logOrganization()
      └── logEcosystem()
```

---

## Configuration

### Environment Variables

Add these to your `.env.bak` or `.env` file:

```bash
# ============================================
# LOGGING CONFIGURATION
# ============================================
# Log Level: debug, info, warn, error
LOG_LEVEL=info

# Enable/disable file logging (true/false)
LOG_TO_FILE=true

# Directory for log files (relative to project root)
LOG_DIR=logs

# Log format: json or text (optional, defaults to text for console)
# LOG_FORMAT=json
```

### Log Level Descriptions

| Level | Description | Use Case |
|-------|-------------|----------|
| `debug` | Verbose logging including request payloads | Local development, debugging |
| `info` | General information about API calls | Production monitoring |
| `warn` | Warning messages (e.g., 4xx errors) | Production monitoring |
| `error` | Error messages (e.g., 5xx errors, exceptions) | Production error tracking |

### Recommended Settings

**Development:**
```bash
LOG_LEVEL=debug
LOG_TO_FILE=true
LOG_DIR=logs
# LOG_FORMAT=json  # Commented out for readable console
```

**Production:**
```bash
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_DIR=logs
LOG_FORMAT=json  # Uncomment for log aggregation tools
```

---

## Usage Examples

### 1. Automatic Logging (Most Common)

All API requests made through `axiosGet`, `axiosPost`, `axiosPut`, `axiosPatch`, `axiosDelete` are automatically logged:

```typescript
import { axiosPost } from '../services/apiRequests';

// This is automatically logged
const response = await axiosPost({
  url: '/api/endpoint',
  payload: { data: 'value' },
  config: { headers: {...} }
});
```

**Console Output:**
```
2025-11-01 10:30:15 [info]: API Request {"type":"API_REQUEST","method":"POST","url":"/api/endpoint","timestamp":"2025-11-01T10:30:15.123Z","hasPayload":true}
2025-11-01 10:30:16 [info]: API Response Success {"type":"API_RESPONSE_SUCCESS","method":"POST","url":"/api/endpoint","status":200,"duration":987}
```

---

### 2. Manual Logging for Specific Operations

#### Verification Operations

```typescript
import { APILogger } from '../utils/logger';

// Log verification proof request
APILogger.logVerification('proof_request_created', {
  connectionId: 'conn-123',
  schemaId: 'schema-456',
  requestType: 'indy',
  attributes: ['firstName', 'lastName']
});
```

**Log Output:**
```json
{
  "level": "info",
  "message": "Verification Operation",
  "type": "VERIFICATION",
  "operation": "proof_request_created",
  "timestamp": "2025-11-01T10:30:15.123Z",
  "connectionId": "conn-123",
  "schemaId": "schema-456",
  "requestType": "indy",
  "attributes": ["firstName", "lastName"]
}
```

#### Issuance Operations

```typescript
APILogger.logIssuance('credential_issued', {
  credentialId: 'cred-789',
  connectionId: 'conn-123',
  schemaId: 'schema-456',
  success: true
});
```

#### Schema Operations

```typescript
APILogger.logSchema('schema_created', {
  schemaId: 'schema-new-001',
  schemaName: 'DriverLicense',
  version: '1.0',
  attributes: ['licenseNumber', 'expiryDate']
});
```

#### Organization Operations

```typescript
APILogger.logOrganization('wallet_created', {
  orgId: 'org-123',
  walletType: 'dedicated',
  didMethod: 'did:indy'
});
```

#### Ecosystem Operations

```typescript
APILogger.logEcosystem('organization_added', {
  ecosystemId: 'eco-001',
  organizationId: 'org-456',
  role: 'member'
});
```

---

### 3. Authentication Logging

Authentication events are automatically logged by the axios interceptor:

```typescript
// These are logged automatically:
// - auth_check_start
// - unauthorized_detected
// - token_refreshed
// - redirect_to_login
// - 401_error_detected
```

**Example Log:**
```json
{
  "level": "info",
  "message": "Authentication Event",
  "type": "AUTH_EVENT",
  "event": "token_refreshed",
  "timestamp": "2025-11-01T10:30:15.123Z",
  "authId": "a3b5c7d9"
}
```

---

### 4. Error Logging

Errors are automatically categorized:

- **5xx errors** → `logger.error()` (Server errors)
- **4xx errors** → `logger.warn()` (Client errors)
- **Network errors** → `logger.error()` (Connection issues)

```typescript
// Automatically logged by apiRequests.ts
axiosPost({ url: '/api/endpoint', payload })
  .catch(error => {
    // Error is already logged by APILogger.logError()
  });
```

**Error Log Example:**
```json
{
  "level": "error",
  "message": "API Server Error (5xx)",
  "type": "API_RESPONSE_ERROR",
  "method": "POST",
  "url": "/api/endpoint",
  "timestamp": "2025-11-01T10:30:15.123Z",
  "duration": 1523,
  "status": 500,
  "statusText": "Internal Server Error",
  "errorMessage": "Request failed with status code 500",
  "errorData": {...},
  "errorStack": "Error: Request failed...\n    at..."
}
```

---

## Log Levels

### Level Priority (Descending)

```
ERROR > WARN > INFO > DEBUG
```

When `LOG_LEVEL=info`:
- ✅ Logs: ERROR, WARN, INFO
- ❌ Does not log: DEBUG

### When to Use Each Level

| Level | When to Use | Example |
|-------|-------------|---------|
| **DEBUG** | Development debugging, detailed payloads | `APILogger.logRequest()` with full payload |
| **INFO** | Normal operations, successful transactions | `APILogger.logResponse()` on 2xx |
| **WARN** | Recoverable errors, client errors (4xx) | Failed validation, unauthorized access |
| **ERROR** | Server errors (5xx), exceptions | API failures, network errors |

---

## Log Formats

### Console Format (Development)

```
2025-11-01 10:30:15 [info]: API Request {
  "type": "API_REQUEST",
  "method": "POST",
  "url": "/orgs/123/proofs",
  "timestamp": "2025-11-01T10:30:15.123Z",
  "hasPayload": true
}
```

### JSON Format (Production)

```json
{
  "timestamp": "2025-11-01T10:30:15.123Z",
  "level": "info",
  "message": "API Request",
  "type": "API_REQUEST",
  "method": "POST",
  "url": "/orgs/123/proofs",
  "hasPayload": true
}
```

To enable JSON format, uncomment in `.env`:
```bash
LOG_FORMAT=json
```

---

## File Organization

### Log File Structure

```
logs/
├── .gitkeep                    # Keep directory in git
├── combined-2025-11-01.log     # All logs (14-day retention)
├── error-2025-11-01.log        # Errors only (30-day retention)
├── api-2025-11-01.log          # API interactions (30-day retention)
├── combined-2025-11-02.log
├── error-2025-11-02.log
└── api-2025-11-02.log
```

### File Rotation Policy

| File | Max Size | Retention | Content |
|------|----------|-----------|---------|
| `combined-*.log` | 20MB | 14 days | All log levels |
| `error-*.log` | 20MB | 30 days | ERROR level only |
| `api-*.log` | 20MB | 30 days | All API interactions |

Files are rotated daily (at midnight) or when max size is reached.

---

## Best Practices

### 1. ✅ DO: Use Operation-Specific Loggers

```typescript
// Good - Uses specific logger
APILogger.logVerification('proof_request_sent', { ... });

// Bad - Generic console.log
console.log('Proof request sent');
```

### 2. ✅ DO: Include Relevant Context

```typescript
// Good - Includes context
APILogger.logIssuance('credential_offered', {
  credentialId,
  schemaId,
  connectionId,
  attributes: selectedAttributes
});

// Bad - Minimal context
APILogger.logIssuance('credential_offered', { credentialId });
```

### 3. ✅ DO: Sanitize Sensitive Data

```typescript
// Good - Redacts sensitive data
APILogger.logRequest('POST', url, {
  ...payload,
  password: '[REDACTED]',
  privateKey: '[REDACTED]'
});

// Bad - Logs sensitive data
APILogger.logRequest('POST', url, payload);  // Contains passwords!
```

### 4. ❌ DON'T: Log Inside Loops

```typescript
// Bad - Creates too many logs
attributes.forEach(attr => {
  APILogger.logVerification('attribute_processed', { attr });
});

// Good - Log once with summary
APILogger.logVerification('attributes_processed', {
  count: attributes.length,
  attributes: attributes.map(a => a.name)
});
```

### 5. ❌ DON'T: Use console.log in Production Code

```typescript
// Bad
console.log('User created:', user);

// Good
APILogger.logOrganization('user_created', {
  userId: user.id,
  orgId: user.orgId
});
```

---

## Troubleshooting

### Issue: No Log Files Created

**Solution:**
1. Check `LOG_TO_FILE=true` in `.env`
2. Verify `logs/` directory exists
3. Check file permissions: `chmod 755 logs/`
4. Logs only work in Node.js environment (not browser)

### Issue: Too Many Log Files

**Solution:**
Reduce retention or increase max file size in `src/utils/logger.ts`:

```typescript
new DailyRotateFile({
  filename: `${config.logDirectory}/combined-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',  // Increase from 20m
  maxFiles: '7d',  // Reduce from 14d
  format: jsonFormat,
})
```

### Issue: Logs Not Showing in Console

**Solution:**
1. Check `LOG_LEVEL` setting (e.g., `warn` won't show `info` logs)
2. Verify you're calling the logger correctly
3. Check if browser environment (file logging only works in Node.js)

### Issue: Performance Impact

**Solution:**
1. Set `LOG_LEVEL=warn` or `LOG_LEVEL=error` in production
2. Disable file logging: `LOG_TO_FILE=false`
3. Use `LOG_FORMAT=json` for faster parsing

---

## Integration Checklist

### ✅ Completed

- [x] Installed winston and winston-daily-rotate-file
- [x] Created centralized logger utility
- [x] Added environment variables
- [x] Integrated logger into axios interceptor
- [x] Updated all apiRequests functions
- [x] Created logs directory structure
- [x] Added logs to .gitignore
- [x] Created documentation

### 🔄 Optional Enhancements

- [ ] Add log aggregation service integration (e.g., ELK, Datadog)
- [ ] Implement log encryption for sensitive data
- [ ] Add request correlation IDs
- [ ] Create log analysis dashboard
- [ ] Set up log-based alerts

---

## Example: Full Request/Response Cycle

### 1. Request Initiated

```typescript
// In Verification.tsx
const response = await verifyCredential(payload, requestType);
```

### 2. Logged by apiRequests.ts

```
[info] API Request POST /orgs/123/proofs?requestType=indy
{
  "method": "POST",
  "url": "/orgs/123/proofs",
  "hasPayload": true,
  "timestamp": "2025-11-01T10:30:15.123Z"
}
```

### 3. Successful Response

```
[info] API Response Success POST /orgs/123/proofs
{
  "method": "POST",
  "url": "/orgs/123/proofs",
  "status": 201,
  "duration": 987,
  "hasData": true
}
```

### 4. Or Error Response

```
[warn] API Client Error (4xx) POST /orgs/123/proofs
{
  "method": "POST",
  "url": "/orgs/123/proofs",
  "status": 400,
  "duration": 543,
  "errorMessage": "Invalid proof request format"
}
```

---

## Support

For questions or issues with the logging system:

1. Check this documentation first
2. Review log files in `logs/` directory
3. Verify environment configuration in `.env`
4. Check console output for logger errors

---

## Changelog

**2025-11-01** - Initial Implementation
- Added winston-based logging system
- Configured daily rotating file transports
- Integrated with all API request methods
- Added operation-specific loggers
- Created comprehensive documentation

---

*Last Updated: November 1, 2025*
