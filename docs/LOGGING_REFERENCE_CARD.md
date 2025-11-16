# Logging System - Quick Reference Card

## 🎯 Current Status

| Feature | Status | Location |
|---------|--------|----------|
| **Browser Console Logs** | ✅ Working | Press F12 → Console |
| **File Logs** | ⏳ Pending | Needs server environment |
| **Auto-Logging** | ✅ Active | All API calls |
| **Manual Logging** | ✅ Available | APILogger methods |

---

## 🚀 Quick Start (30 Seconds)

### See Logs Right Now

1. **Open app**: `npm run dev`
2. **Open DevTools**: Press `F12`
3. **Go to Console tab**
4. **Login or make any API call**
5. **See logs!** 🎉

Example output:
```
[2025-11-01T10:30:15.123Z] [INFO] API Request
POST /api/auth/signin
```

---

## 📊 What Gets Logged Automatically

✅ **All HTTP Requests**
- GET, POST, PUT, PATCH, DELETE
- URL, method, payload (sanitized)
- Timestamp, duration

✅ **All HTTP Responses**
- Status code, response data
- Duration, success/error

✅ **Authentication Events**
- Login attempts
- Token refresh
- Session validation

✅ **Errors**
- 4xx client errors (WARN)
- 5xx server errors (ERROR)
- Network errors

---

## 💻 Environment Detection

```
Browser (Current)  → Console logging only
Server (Future)    → Console + File logging
```

---

## 🔧 Configuration (.env)

```bash
LOG_LEVEL=info          # debug|info|warn|error
LOG_TO_FILE=true        # true|false (server only)
LOG_DIR=logs            # Directory path
# LOG_FORMAT=json       # Optional: JSON format
```

---

## 📝 Manual Logging

```typescript
import { APILogger } from '../utils/logger';

// Verification
APILogger.logVerification('proof_sent', {
  connectionId: 'conn-123',
  schemaId: 'schema-456'
});

// Issuance
APILogger.logIssuance('cred_issued', {
  credentialId: 'cred-789'
});

// Schema
APILogger.logSchema('schema_created', {
  schemaId: 'schema-001'
});

// Organization
APILogger.logOrganization('wallet_created', {
  orgId: 'org-123'
});

// Ecosystem
APILogger.logEcosystem('org_added', {
  ecosystemId: 'eco-001'
});
```

---

## 🎨 Console Output Colors

| Level | Color | When |
|-------|-------|------|
| ERROR | 🔴 Red | Server errors, exceptions |
| WARN | 🟡 Yellow | Client errors (4xx) |
| INFO | 🔵 Blue | Normal operations |
| DEBUG | ⚪ Gray | Detailed debugging |

---

## 📂 File Structure (Server Only)

```
logs/
├── combined-2025-11-01.log  # All levels (14 days)
├── error-2025-11-01.log     # Errors only (30 days)
└── api-2025-11-01.log       # API calls (30 days)
```

---

## 🔍 Log Levels

```
ERROR > WARN > INFO > DEBUG
```

**LOG_LEVEL=info** shows:
- ✅ ERROR, WARN, INFO
- ❌ DEBUG

**LOG_LEVEL=error** shows:
- ✅ ERROR only
- ❌ WARN, INFO, DEBUG

---

## 🐛 Troubleshooting

### No logs in console?
1. Check DevTools is open (F12)
2. Make an API call (login, etc.)
3. Check Console tab (not Network)

### Want file logs?
- Deploy to server environment
- Use Astro SSR endpoints
- Create Node.js backend

---

## 📚 Full Documentation

- **Quick Start**: [LOGGING_QUICK_START.md](./LOGGING_QUICK_START.md)
- **Why Empty**: [WHY_LOGS_FOLDER_EMPTY.md](./WHY_LOGS_FOLDER_EMPTY.md)
- **Full Guide**: [LOGGING_IMPLEMENTATION_GUIDE.md](./LOGGING_IMPLEMENTATION_GUIDE.md)

---

## ✅ Verification Checklist

- [ ] Opened DevTools (F12)
- [ ] Went to Console tab
- [ ] Made an API call
- [ ] Saw colored log output
- [ ] ✅ Logging is working!

---

*Print this card and keep it handy! 📋*
