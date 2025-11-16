# Keycloak Token Timeout Configuration Guide

## Overview
The 4+ minute timeout you're experiencing is controlled by Keycloak server settings, not your frontend application. Here's how to adjust these timeouts to give users more time to fill out forms.

## Current Keycloak Configuration
Based on your environment variables:
- **Client ID**: `confirmd-bench-management`
- **Client Secret**: Available in your `.env` file
- **Base URL**: Your Keycloak admin console should be accessible

## Key Timeout Settings in Keycloak

### 1. Access Token Lifespan
**Location**: Realm Settings → Tokens → Access Token Lifespan
- **Default**: Usually 5 minutes
- **Recommended**: 15-30 minutes for form-heavy applications
- **Impact**: How long API calls work without refresh

### 2. Refresh Token Lifespan
**Location**: Realm Settings → Tokens → Refresh Token Max Reuse
- **Default**: Usually 30 minutes to 1 hour
- **Recommended**: 2-8 hours for better user experience
- **Impact**: How long users can stay logged in without re-authenticating

### 3. SSO Session Idle Timeout
**Location**: Realm Settings → Tokens → SSO Session Idle
- **Default**: Usually 30 minutes
- **Recommended**: 2-4 hours for form applications
- **Impact**: How long users can be inactive before logout

### 4. SSO Session Max Lifespan
**Location**: Realm Settings → Tokens → SSO Session Max
- **Default**: Usually 10 hours
- **Recommended**: 8-12 hours for work applications
- **Impact**: Maximum session length regardless of activity

## Step-by-Step Configuration Changes

### Access Keycloak Admin Console
1. Navigate to your Keycloak admin console
2. Login with admin credentials
3. Select your realm (likely the one containing `confirmd-bench-management`)

### Adjust Realm-Level Settings
1. Go to **Realm Settings** → **Tokens** tab
2. Modify these values:

```
Access Token Lifespan: 30 minutes (from default 5 minutes)
Refresh Token Max Reuse: 0 (unlimited reuse)
SSO Session Idle: 4 hours (from default 30 minutes)
SSO Session Max: 12 hours (from default 10 hours)
```

### Adjust Client-Level Settings (Optional)
1. Go to **Clients** → Find `confirmd-bench-management`
2. Go to **Settings** tab
3. **Advanced Settings** section:

```
Access Token Lifespan: 30 minutes
```

### Recommended Settings for Form-Heavy Applications

For applications where users spend significant time filling forms:

```yaml
# Realm Settings → Tokens
Access Token Lifespan: 30 minutes
Refresh Token Max Reuse: 0 (unlimited)
SSO Session Idle: 4 hours
SSO Session Max: 12 hours

# Client Settings (if overriding realm defaults)
Access Token Lifespan: 30 minutes
```

## Environment-Specific Recommendations

### Development Environment
- **Access Token**: 1 hour (easier debugging)
- **SSO Session Idle**: 8 hours (less interruption)
- **SSO Session Max**: 24 hours

### Production Environment
- **Access Token**: 15-30 minutes (security balance)
- **SSO Session Idle**: 2-4 hours (user convenience)
- **SSO Session Max**: 8-12 hours (reasonable work day)

## Verifying Changes

### 1. Check Token Expiration Times
After making changes, you can verify by examining JWT tokens:
```javascript
// In browser console, check token expiration
const token = localStorage.getItem('access_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires at:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
  console.log('Minutes until expiration:', (payload.exp * 1000 - Date.now()) / 60000);
}
```

### 2. Test Form Scenarios
1. Start filling a long form
2. Wait the expected timeout period
3. Submit the form
4. Verify you get the improved user experience instead of immediate redirect

## Impact on Your Enhanced Token Refresh System

Our enhanced token refresh system will work better with longer timeouts:

- **Shorter Access Token** (15-30 min): More frequent but graceful refreshes
- **Longer Refresh Token** (2-4 hours): Users can work longer without re-authentication
- **Longer Session Idle** (2-4 hours): Better experience for users who take breaks

## Additional Keycloak Settings to Consider

### 1. Remember Me
**Location**: Realm Settings → Login → Remember Me
- **Enable**: ON
- **Impact**: Users can stay logged in across browser sessions

### 2. Require Re-authentication
**Location**: Client Settings → Authentication Flow Overrides
- **Configure**: Based on security requirements
- **Impact**: When users must re-enter credentials

### 3. Token Exchange
**Location**: Client Settings → Capability config
- **Enable**: For better token refresh flows
- **Impact**: More flexible authentication

## Monitoring and Troubleshooting

### Check Current Settings
1. Access Keycloak Admin Console
2. Navigate to Realm Settings → Tokens
3. Document current values before changing

### Test Token Lifecycles
```javascript
// Monitor token refresh in console
// Our enhanced logging will show:
console.log('🔄 [TokenRefreshManager] Token refresh successful');
console.log('⏰ New token expires in X minutes');
```

### Rollback Plan
Keep track of original settings in case you need to revert:
```
Original Access Token Lifespan: 5 minutes
Original SSO Session Idle: 30 minutes
Original SSO Session Max: 10 hours
```

## Security Considerations

### Balancing Security vs Usability
- **Shorter tokens**: More secure, more interruptions
- **Longer tokens**: Less secure, better user experience
- **Our solution**: Graceful handling of any timeout length

### Production Best Practices
1. Access tokens: 15-30 minutes maximum
2. Refresh tokens: 2-8 hours based on use case
3. Session monitoring: Enable Keycloak events logging
4. Regular security reviews: Adjust based on usage patterns

## Implementation Priority

### Phase 1 (Immediate)
1. Increase Access Token Lifespan to 30 minutes
2. Increase SSO Session Idle to 4 hours

### Phase 2 (After Testing)
1. Fine-tune based on user feedback
2. Implement Remember Me if needed
3. Configure environment-specific settings

### Phase 3 (Long-term)
1. Monitor usage patterns
2. Adjust settings based on analytics
3. Implement additional security measures if needed

The combination of increased Keycloak timeouts + our enhanced token refresh system will provide the best user experience for your form-heavy application.
