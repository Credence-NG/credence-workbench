# Schema List Retrieval - Debugging Guide

## Issue
Cannot retrieve list of schemas when clicking "Add Schema" button in the ecosystem dashboard.

## Changes Made

### 1. Enhanced Error Handling in `getAllSchemas` API
**File:** `src/api/Schema.ts`

**Changes:**
- Added comprehensive console logging at key points
- Changed error handling from returning error message to throwing error (better error propagation)
- Added request parameter logging
- Added URL logging for debugging

**Console Logs Added:**
```
🔍 [getAllSchemas API] Request params: { itemPerPage, page, allSearch, ledgerId, schemaType }
🔍 [getAllSchemas API] Request URL: /platform/schemas?pageSize=...
✅ [getAllSchemas API] Response: { ... }
❌ [getAllSchemas API] Error: { ... }
```

### 2. Enhanced Error Handling in `AddSchemaToEcosystemModal`
**File:** `src/components/Ecosystem/AddSchemaToEcosystemModal.tsx`

**Changes:**
- Added detailed console logging for debugging
- Enhanced error messages with more context
- Logs API response for inspection

**Console Logs Added:**
```
🔍 [AddSchemaModal] Fetching schemas with params: { page, pageSize, searchText, ledgerId }
📦 [AddSchemaModal] API Response: { ... }
✅ [AddSchemaModal] Schemas fetched successfully: { count, totalItems }
❌ [AddSchemaModal] API returned error: { ... }
❌ [AddSchemaModal] Exception occurred: { ... }
```

## How to Debug

### Step 1: Open Browser Console
1. Navigate to: `http://localhost:3000/ecosystems/{ecosystemId}/dashboard`
2. Open browser DevTools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Clear any existing logs

### Step 2: Trigger the Issue
1. Click on the **"Schemas"** tab in the ecosystem dashboard
2. Click the **"Add Schema"** button
3. Watch the console for log messages

### Step 3: Analyze Console Logs

#### Expected Flow (Success):
```
🔍 [AddSchemaModal] Fetching schemas with params: { page: 1, pageSize: 5, searchText: '', ledgerId: 'xxx' }
🔍 [getAllSchemas API] Request params: { itemPerPage: 5, page: 1, allSearch: '', ledgerId: 'xxx', schemaType: '' }
🔍 [getAllSchemas API] Request URL: /platform/schemas?pageSize=5&searchByText=&pageNumber=1&ledgerId=xxx&schemaType=
✅ [getAllSchemas API] Response: { data: { statusCode: 200, data: { data: [...], totalItems: 10 } } }
📦 [AddSchemaModal] API Response: { data: { statusCode: 200, ... } }
✅ [AddSchemaModal] Schemas fetched successfully: { count: 5, totalItems: 10 }
```

#### Common Issues to Check:

##### Issue 1: Missing Ledger ID
```
🔍 [getAllSchemas API] Request params: { ..., ledgerId: null }
```
**Solution:** Check if LEDGER_ID is stored in localStorage
```javascript
// In browser console:
localStorage.getItem('ledgerId')
```

##### Issue 2: Missing or Invalid Token
```
❌ [getAllSchemas API] Error: { message: 'Unauthorized' }
```
**Solution:** Check if TOKEN is valid
```javascript
// In browser console:
localStorage.getItem('token')
```

##### Issue 3: API Returns Error Status
```
📦 [AddSchemaModal] API Response: { data: { statusCode: 400, message: '...' } }
❌ [AddSchemaModal] API returned error: ...
```
**Solution:** Check the error message for specific backend issue

##### Issue 4: Network Error
```
❌ [getAllSchemas API] Error: { message: 'Network Error' }
```
**Solution:** 
- Check if backend is running
- Check if API endpoint exists: `GET /platform/schemas`
- Check CORS configuration

##### Issue 5: Empty Response
```
✅ [AddSchemaModal] Schemas fetched successfully: { count: 0, totalItems: 0 }
```
**Solution:** No schemas exist in the platform yet. Need to create schemas first.

### Step 4: Check Network Tab
1. Go to **Network** tab in DevTools
2. Filter by "schemas"
3. Click on the request to see:
   - **Request URL**: Should be `/platform/schemas?pageSize=5&searchByText=&pageNumber=1&ledgerId=...`
   - **Request Headers**: Check Authorization header
   - **Response**: Check the actual API response

### Step 5: Common Fixes

#### Fix 1: Ledger ID Missing
If ledgerId is null or undefined:
```typescript
// User needs to select/configure ledger in settings
// Or check if ledger is properly stored during login
```

#### Fix 2: Backend API Not Responding
Check backend logs for the `/platform/schemas` endpoint:
```bash
# Check if endpoint exists in backend
# Check if endpoint requires authentication
# Check if ledgerId parameter is required
```

#### Fix 3: Empty Schema List
If API returns empty list:
- Create test schemas in the platform first
- Or check if the current ledger has any schemas

#### Fix 4: CORS Issues
If you see CORS errors:
- Check backend CORS configuration
- Ensure `http://localhost:3000` is allowed

## API Endpoint Details

**Endpoint:** `GET /platform/schemas`

**Query Parameters:**
- `pageSize`: Number of items per page (default: 5)
- `searchByText`: Search query string (optional)
- `pageNumber`: Current page number (default: 1)
- `ledgerId`: ID of the ledger to query schemas from (required)
- `schemaType`: Type filter for schemas (optional)

**Expected Response:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "schema-uuid",
        "name": "Schema Name",
        "version": "1.0",
        "schemaLedgerId": "ledger-specific-id",
        "attributes": [...],
        "createDateTime": "2025-10-07T...",
        "orgId": "org-uuid",
        "organizationName": "Organization Name"
      }
    ],
    "totalItems": 10,
    "pageNumber": 1,
    "pageSize": 5
  }
}
```

## Testing Checklist

- [ ] Browser console shows logs when modal opens
- [ ] `ledgerId` is present in request params
- [ ] `token` is present in Authorization header
- [ ] API request completes (check Network tab)
- [ ] Response status is 200
- [ ] Response contains schema data
- [ ] Schemas appear in the modal table

## Quick Test

Run this in browser console when on the ecosystem page:
```javascript
// Check localStorage values
console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
console.log('Ledger ID:', localStorage.getItem('ledgerId') || 'Missing');

// Manual API test
fetch('/platform/schemas?pageSize=5&pageNumber=1&ledgerId=' + localStorage.getItem('ledgerId') + '&searchByText=&schemaType=', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Manual API Test Result:', data))
.catch(err => console.error('Manual API Test Error:', err));
```

## Next Steps

1. **Open the modal** and check console logs
2. **Share the console output** with the team
3. **Check Network tab** for the actual API call
4. **Verify backend** is running and endpoint exists
5. **Check if schemas exist** in the selected ledger

## Additional Resources

- Console logging format uses emoji icons for easy identification:
  - 🔍 = Debug/Info
  - ✅ = Success
  - ❌ = Error
  - 📦 = Data/Response

---

**Last Updated:** October 7, 2025  
**Status:** Debugging tools implemented, awaiting console logs
