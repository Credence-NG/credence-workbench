# ProactiveTokenRefresh Integration Guide

## Overview
The ProactiveTokenRefresh system automatically refreshes JWT tokens **before** they expire for active users, preventing session timeout interruptions during work sessions.

## How It Works

### 🔄 **Proactive Refresh Cycle**
1. **Checks every 2 minutes** if user is active and token needs refresh
2. **Refreshes tokens when < 1.5 minutes remain** (optimized for 5-minute Keycloak tokens)
3. **Only runs for active users** - pauses during inactivity
4. **Stops on auth pages** - won't interfere with login/signup flows

### 👤 **Activity Detection**
Monitors these user interactions:
- Mouse movements and clicks
- Keyboard input
- Scrolling
- Touch events
- Focus/blur events

**Inactive after**: 30 minutes of no interaction
**Page visibility**: Pauses when tab is hidden, resumes when visible

## Integration Status

### ✅ **Auto-Initialization**
- Automatically starts when page loads (see bottom of `proactiveTokenRefresh.ts`)
- Additional import in `LayoutCommon.astro` ensures loading
- Skips initialization on authentication pages

### ✅ **TokenRefreshManager Integration**
- Uses existing `TokenRefreshManager.refreshTokens()` method
- Follows same error handling patterns
- Respects existing token storage mechanisms

### ✅ **Axios Interceptor Enhancement**
- Enhanced error messages with activity context
- Better user experience during session expiration
- Cooperative with proactive refresh system

## Configuration

### Current Settings (Optimized for 5-minute Keycloak tokens)
```typescript
REFRESH_INTERVAL = 2 minutes      // How often to check
TOKEN_REFRESH_THRESHOLD = 1.5 minutes  // When to refresh
ACTIVITY_TIMEOUT = 30 minutes     // When user considered inactive
```

### For Different Token Lifespans
```typescript
// For 15-minute tokens
REFRESH_INTERVAL = 5 * 60 * 1000;           // Check every 5 minutes  
TOKEN_REFRESH_THRESHOLD = 3 * 60 * 1000;    // Refresh at 3 minutes left

// For 30-minute tokens  
REFRESH_INTERVAL = 10 * 60 * 1000;          // Check every 10 minutes
TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;    // Refresh at 5 minutes left
```

## Testing & Monitoring

### Console Logs to Watch For

**Initialization:**
```
🚀 [ProactiveTokenRefresh] Initializing proactive token refresh system
👂 [ProactiveTokenRefresh] Activity tracking setup complete
⏰ [ProactiveTokenRefresh] Refresh timer started (checking every 120s)
```

**During Operation:**
```
⏰ [ProactiveTokenRefresh] Token expires in 2 minutes
🔄 [ProactiveTokenRefresh] Token expiring soon - refreshing proactively  
✅ [ProactiveTokenRefresh] Proactive token refresh successful
🔄 [ProactiveTokenRefresh] New token confirmed in storage
```

**Activity Changes:**
```
👤 [ProactiveTokenRefresh] User became active again
😴 [ProactiveTokenRefresh] User inactive - pausing proactive refresh
```

**Page Visibility:**
```
👁️ [ProactiveTokenRefresh] Page hidden - pausing proactive refresh
👁️ [ProactiveTokenRefresh] Page visible - resuming proactive refresh
```

### Using the Status Component

Add to any page during development:
```tsx
import ProactiveRefreshStatus from '../components/ProactiveRefreshStatus';

// In your component render:
<ProactiveRefreshStatus />
```

This shows a live status widget in the bottom-right corner with:
- User activity status
- Token expiration countdown
- System operational status

## Expected Behavior

### ✅ **Success Scenarios**
1. **Long Form Sessions**: Users can fill forms for 10+ minutes without interruption
2. **Background Refresh**: Tokens refresh silently while user works
3. **Tab Switching**: System pauses/resumes based on tab visibility
4. **Inactive Users**: System conserves resources when user steps away

### 🚨 **Error Scenarios**
1. **Refresh Token Expired**: System stops trying, shows user-friendly message
2. **Network Errors**: Retries on next interval
3. **Invalid Tokens**: System stops and logs error
4. **Auth Pages**: System doesn't run, avoiding conflicts

## Troubleshooting

### Issue: No Console Logs
**Cause**: System not initializing
**Check**: 
- Look for import errors in browser console
- Verify not on authentication page
- Check if auto-initialization script is running

### Issue: Tokens Not Refreshing
**Cause**: Timing misconfiguration or user marked inactive
**Check**:
- Current activity status in logs
- Token expiration timing
- Adjust `TOKEN_REFRESH_THRESHOLD` if needed

### Issue: Too Frequent Refresh
**Cause**: Threshold too high for token lifespan
**Solution**: Increase `TOKEN_REFRESH_THRESHOLD` or `REFRESH_INTERVAL`

### Issue: Still Getting Session Expired Messages
**Cause**: System not catching token expiration in time
**Solution**: 
1. Increase Keycloak token lifespan (primary fix)
2. Decrease `TOKEN_REFRESH_THRESHOLD` (secondary fix)
3. Decrease `REFRESH_INTERVAL` for more frequent checks

## Benefits

### 🎯 **User Experience**
- **No interruptions** during active work sessions
- **Clear messaging** when sessions do expire
- **Save work prompts** before redirecting to login
- **Seamless token refresh** happens in background

### 🔧 **Developer Experience**  
- **Comprehensive logging** for debugging
- **Easy configuration** for different environments
- **Graceful error handling** prevents system crashes
- **Resource efficient** - pauses when not needed

### 🛡️ **Security**
- **Maintains token expiration** for security
- **Respects refresh token limits** 
- **Proper cleanup** on page unload
- **No interference** with authentication flows

## Next Steps

1. **Test the system** by monitoring console logs
2. **Add status component** to a test page to verify operation  
3. **Adjust timing** if needed based on your Keycloak settings
4. **Consider increasing Keycloak timeouts** for the ultimate solution

The system is now fully integrated and should prevent the "session expired while active" issue you were experiencing!
