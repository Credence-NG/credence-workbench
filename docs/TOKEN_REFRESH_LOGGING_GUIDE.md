# Token Refresh Logging Guide

## 🔍 **Console Log Monitoring Guide**

This document explains how to track token refresh activity using the enhanced console logs we've implemented.

## 📊 **Key Log Patterns to Watch**

### 1. **TokenRefreshManager Logs**
```
🔄 [TokenRefreshManager] [abc123] Starting token refresh process at 2025-09-11T15:58:45.123Z
📊 [TokenRefreshManager] [State] Starting refresh abc123: { isRefreshing: true, hasPromise: true, ... }
🔍 [TokenRefreshManager] [abc123] Checking for refresh token in localStorage
✅ [TokenRefreshManager] [abc123] Refresh token found, making API call to: /auth/refresh-token
📡 [TokenRefreshManager] [abc123] Sending refresh request to: https://api.example.com/auth/refresh-token
📥 [TokenRefreshManager] [abc123] Refresh API response status: 200
💾 [TokenRefreshManager] [abc123] Updating localStorage with new tokens
🍪 [TokenRefreshManager] [abc123] Starting cookie sync process
✅ [TokenRefreshManager] [abc123] Cookie sync completed successfully
🎉 [TokenRefreshManager] [abc123] Token refresh process completed successfully
🔓 [TokenRefreshManager] [abc123] Releasing refresh lock
🏁 [TokenRefreshManager] [abc123] Final refresh result: { success: true, hasToken: true, duration: "1234ms" }
⏱️ [TokenRefreshManager] [abc123] Total refresh time: 1234ms
```

### 2. **AxiosInterceptor Logs**
```
🚨 [AxiosInterceptor] [def456] Response error intercepted
📊 [AxiosInterceptor] [def456] Error details: { status: 401, url: "/api/some-endpoint", isAuthPage: false }
🔄 [AxiosInterceptor] [def456] 401 error detected, triggering authentication check
🔍 [AxiosInterceptor] [def456] Starting authentication check
📡 [AxiosInterceptor] [def456] Making auth check request to: https://api.example.com/users/profile
📥 [AxiosInterceptor] [def456] Auth check response status: 401
🔄 [AxiosInterceptor] [def456] Attempting token refresh via TokenRefreshManager
📊 [AxiosInterceptor] [def456] Token refresh result: { success: true, hasNewToken: true }
✅ [AxiosInterceptor] [def456] Updating request headers with new token
🔄 [AxiosInterceptor] [def456] Request ready to retry with refreshed token
```

### 3. **FeatureSessionCheck Logs**
```
🔐 [FeatureSessionCheck] [ghi789] ===============================
🔐 [FeatureSessionCheck] [ghi789] Starting session check for path: /dashboard/credentials
🔐 [FeatureSessionCheck] [ghi789] Request URL: https://example.com/dashboard/credentials
🔐 [FeatureSessionCheck] [ghi789] Has cookies: true
🔄 [FeatureSessionCheck] [ghi789] User unauthorized - starting token refresh process
📍 [FeatureSessionCheck] [ghi789] Current path: /dashboard/credentials
✅ [FeatureSessionCheck] [ghi789] Refresh token found in cookies
🔄 [FeatureSessionCheck] [ghi789] Calling TokenRefreshManager.refreshTokens()
📊 [FeatureSessionCheck] [ghi789] Token refresh result: { success: true, hasNewToken: true }
✅ [FeatureSessionCheck] [ghi789] Token refresh successful, allowing user to continue
🏁 [FeatureSessionCheck] [ghi789] Token refresh successful: { permitted: true, authorized: true, ... }
🔐 [FeatureSessionCheck] [ghi789] ===============================
```

### 4. **CookieSync Logs**
```
🍪 [CookieSync] [jkl012] Starting cookie sync with server
📡 [CookieSync] [jkl012] Making profile request to: https://api.example.com/users/profile
🔑 [CookieSync] [jkl012] Using new token (first 20 chars): eyJhbGciOiJIUzI1NiIsI...
📥 [CookieSync] [jkl012] Cookie sync response status: 200
✅ [CookieSync] [jkl012] Cookie sync successful - server should have updated cookies
```

## 🔍 **What to Look For**

### ✅ **Successful Token Refresh Flow**
1. **Trigger**: 401 error or unauthorized status
2. **Check**: Refresh token exists in localStorage/cookies
3. **API Call**: Successful refresh API call (status 200)
4. **Storage Update**: localStorage updated with new tokens
5. **Cookie Sync**: Successful profile request to sync cookies
6. **Completion**: User can continue with their original action

### ❌ **Failed Token Refresh Scenarios**
1. **No Refresh Token**: `❌ [TokenRefreshManager] No refresh token found in localStorage`
2. **API Failure**: `📥 [TokenRefreshManager] Refresh API response status: 401`
3. **Network Error**: `💥 [TokenRefreshManager] Token refresh network/server error`
4. **Cookie Sync Failure**: `⚠️ [CookieSync] Cookie sync request failed with status: 500`

### 🔒 **Race Condition Prevention**
- **Multiple Requests**: `⏳ [TokenRefreshManager] Refresh already in progress, waiting for existing refresh...`
- **Lock Management**: `🔐 [TokenRefreshManager] Setting refresh lock` / `🔓 [TokenRefreshManager] Releasing refresh lock`

## 🎯 **Debugging Tips**

### 1. **Filter Console Logs**
In browser console, filter by:
- `[TokenRefreshManager]` - Core refresh logic
- `[AxiosInterceptor]` - API request interception
- `[FeatureSessionCheck]` - Page navigation checks
- `[CookieSync]` - Cookie synchronization

### 2. **Track Specific Sessions**
Each operation has a unique ID (e.g., `[abc123]`) - use this to follow a specific refresh through the entire flow.

### 3. **Monitor Timing**
Look for `⏱️ Total refresh time` logs to identify performance issues.

### 4. **Check Error Patterns**
- Frequent refresh failures might indicate backend issues
- Long refresh times might indicate network problems
- Cookie sync failures might indicate CORS or authentication issues

## 🚨 **Common Issues & Solutions**

| Issue | Log Pattern | Solution |
|-------|------------|----------|
| Form submission redirects | `🚪 Redirecting to sign-in` | Check if TokenRefreshManager is working |
| Infinite refresh loops | Multiple rapid refresh attempts | Check backend refresh token validation |
| Slow performance | High `Total refresh time` values | Investigate network or backend performance |
| Cookie sync failures | `⚠️ Cookie sync request failed` | Check server-side cookie handling |

## 📱 **Testing the Logs**

1. **Open browser console** and filter for token refresh logs
2. **Fill out a form** and let your token expire (wait ~15 minutes)
3. **Submit the form** - you should see the refresh flow in action
4. **Watch for the success pattern** - no redirect to sign-in page
5. **Verify timing** - whole process should take < 2 seconds

The logs will help you understand exactly what's happening during token refresh and identify any issues quickly!
