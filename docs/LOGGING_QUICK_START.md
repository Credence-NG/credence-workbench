# Logging System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Environment Configuration

Add to your `.env` file:

```bash
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_DIR=logs
```

### 2. That's It!

All API requests are automatically logged. No additional code changes needed.

---

## 📊 What Gets Logged?

### Automatically Logged

✅ All HTTP requests (GET, POST, PUT, PATCH, DELETE)
✅ All HTTP responses (success and error)
✅ Authentication events
✅ Token refresh attempts
✅ Request/response duration

### Example Console Output

```
2025-11-01 10:30:15 [info]: API Request {
  "method": "POST",
  "url": "/orgs/123/proofs",
  "hasPayload": true
}

2025-11-01 10:30:16 [info]: API Response Success {
  "method": "POST",
  "url": "/orgs/123/proofs",
  "status": 201,
  "duration": 987
}
```

---

## 📂 Log Files

Logs are saved to:
- `logs/combined-YYYY-MM-DD.log` - All logs
- `logs/error-YYYY-MM-DD.log` - Errors only
- `logs/api-YYYY-MM-DD.log` - API interactions

Files rotate daily and are kept for 14-30 days.

---

## 🔧 Log Levels

| Level | Use Case | Set With |
|-------|----------|----------|
| `debug` | Development, full details | `LOG_LEVEL=debug` |
| `info` | Production, normal ops | `LOG_LEVEL=info` |
| `warn` | Warnings only | `LOG_LEVEL=warn` |
| `error` | Errors only | `LOG_LEVEL=error` |

---

## 💡 Manual Logging (Optional)

For specific operations, use:

```typescript
import { APILogger } from '../utils/logger';

// Verification operations
APILogger.logVerification('proof_request_sent', {
  connectionId: 'conn-123',
  schemaId: 'schema-456'
});

// Issuance operations
APILogger.logIssuance('credential_issued', {
  credentialId: 'cred-789'
});

// Schema operations
APILogger.logSchema('schema_created', {
  schemaId: 'schema-001',
  schemaName: 'DriverLicense'
});

// Organization operations
APILogger.logOrganization('wallet_created', {
  orgId: 'org-123',
  walletType: 'dedicated'
});

// Ecosystem operations
APILogger.logEcosystem('org_added', {
  ecosystemId: 'eco-001',
  orgId: 'org-456'
});
```

---

## 🎯 Common Scenarios

### View Recent Logs
```bash
tail -f logs/combined-2025-11-01.log
```

### View Errors Only
```bash
tail -f logs/error-2025-11-01.log
```

### Search for Specific API Call
```bash
grep "/orgs/123/proofs" logs/api-2025-11-01.log
```

### Count Errors
```bash
grep "ERROR" logs/combined-2025-11-01.log | wc -l
```

---

## ❌ Troubleshooting

### No logs showing?
1. Check `LOG_TO_FILE=true` in `.env`
2. Verify `logs/` directory exists
3. Check console for errors

### Too verbose?
Set `LOG_LEVEL=warn` or `LOG_LEVEL=error`

### Performance issues?
Set `LOG_LEVEL=error` and `LOG_TO_FILE=false`

---

## 📚 Full Documentation

See [LOGGING_IMPLEMENTATION_GUIDE.md](./LOGGING_IMPLEMENTATION_GUIDE.md) for:
- Complete configuration options
- Advanced usage examples
- Architecture details
- Best practices
- Performance tuning

---

## ✅ What Was Implemented

- ✅ Winston logger with daily file rotation
- ✅ Automatic logging for all API requests
- ✅ Environment-based configuration
- ✅ Structured log format (JSON support)
- ✅ Separate log files (combined, error, API)
- ✅ Authentication & token refresh logging
- ✅ Operation-specific loggers
- ✅ Performance tracking (request duration)
- ✅ Error categorization (4xx vs 5xx)
- ✅ Log file rotation (14-30 day retention)

---

*For questions, see [LOGGING_IMPLEMENTATION_GUIDE.md](./LOGGING_IMPLEMENTATION_GUIDE.md)*
