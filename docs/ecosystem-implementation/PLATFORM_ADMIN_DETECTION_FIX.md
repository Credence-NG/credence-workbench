# Platform Admin Detection Fix

**Date:** October 6, 2025  
**Status:** ✅ Fixed  
**Issue:** Platform admin user redirected as unauthorized when creating ecosystem

---

## Problem

When a platform admin user clicked "Create Ecosystem", they were redirected to:
```
http://localhost:3000/ecosystems?error=unauthorized
```

This happened even though the user had the `platform_admin` role.

---

## Root Cause

The `isPlatformAdmin()` function was only checking the `USER_ROLES` storage key, which contains **organization role names** (like `owner`, `admin`, `issuer`, etc.), not platform roles.

### Original Implementation (INCORRECT)

```typescript
export const isPlatformAdmin = async (): Promise<boolean> => {
  const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
  if (!userRoles) return false;

  const roles = userRoles.split(",").map((role: string) => role.trim());
  return roles.includes(PlatformRoles.platformAdmin); // ❌ Never true
};
```

**Why it failed:**
- `USER_ROLES` stores organization roles: `"owner"`, `"admin"`, `"issuer"`, etc.
- `platform_admin` is NOT stored in `USER_ROLES`
- Platform admin status is stored differently in `userData.userOrgRoles`

### Data Structure

**USER_ROLES (localStorage):**
```javascript
"owner,admin" // Organization roles only
```

**userData (localStorage):**
```javascript
{
  data: {
    userOrgRoles: [
      {
        orgRole: {
          name: "platform_admin" // ✅ Platform role stored here
        }
      },
      {
        orgRole: {
          name: "owner" // Organization role
        },
        orgId: "..."
      }
    ]
  }
}
```

---

## Solution

Updated `isPlatformAdmin()` to check **both** sources:

1. **First**: Check `USER_ROLES` (for backward compatibility)
2. **Second**: Check `userData.userOrgRoles` array (correct source for platform admin)

### Updated Implementation (CORRECT)

```typescript
export const isPlatformAdmin = async (): Promise<boolean> => {
  try {
    // First, check USER_ROLES for backward compatibility
    const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
    
    if (userRoles) {
      const roles = userRoles.split(",").map((role: string) => role.trim());
      
      if (roles.includes(PlatformRoles.platformAdmin)) {
        return true; // ✅ Found in USER_ROLES
      }
    }

    // Check userOrgRoles from localStorage (more reliable source)
    const userDataStr = await getFromLocalStorage('userData');
    
    if (userDataStr) {
      const userData = typeof userDataStr === 'string' ? JSON.parse(userDataStr) : userDataStr;
      const userOrgRoles = userData?.data?.userOrgRoles || userData?.userOrgRoles || [];
      
      const isPlatAdmin = userOrgRoles.some(
        (role: any) => role?.orgRole?.name === PlatformRoles.platformAdmin
      );
      
      return isPlatAdmin; // ✅ Found in userOrgRoles
    }

    return false; // ❌ Not found
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return false;
  }
};
```

---

## How Platform Admin Detection Works Now

### Detection Flow

```
1. Check USER_ROLES storage key
   ├─ Contains "platform_admin"? → ✅ Return true
   └─ Not found → Continue to step 2

2. Get userData from localStorage
   ├─ Parse userData object
   ├─ Extract userOrgRoles array
   ├─ Check if any role has orgRole.name === "platform_admin"
   │  ├─ Found? → ✅ Return true
   │  └─ Not found? → ❌ Return false
   └─ userData not found? → ❌ Return false
```

### Debug Logging

Added comprehensive logging to help troubleshoot:

```typescript
console.log('🔍 [isPlatformAdmin] Raw user_roles from localStorage:', userRoles);
console.log('🔍 [isPlatformAdmin] Parsed roles array:', roles);
console.log('🔍 [isPlatformAdmin] Checking userData from localStorage');
console.log('🔍 [isPlatformAdmin] userOrgRoles:', userOrgRoles);
console.log('🔍 [isPlatformAdmin] Role names:', userOrgRoles.map((role: any) => role?.orgRole?.name));
console.log(`✅ [isPlatformAdmin] Result from userOrgRoles: ${isPlatAdmin}`);
```

---

## Verification

### Browser Console Logs to Check

When you click "Create Ecosystem" as a platform admin, you should see:

```
🔍 [canPerformAction] Checking permission for: canCreate
🔍 [isPlatformAdmin] Raw user_roles from localStorage: owner
🔍 [isPlatformAdmin] Parsed roles array: ["owner"]
🔍 [isPlatformAdmin] Checking userData from localStorage
🔍 [isPlatformAdmin] userOrgRoles: [{ orgRole: { name: "platform_admin" } }]
🔍 [isPlatformAdmin] Role names: ["platform_admin"]
✅ [isPlatformAdmin] Result from userOrgRoles: true
✅ [canPerformAction] Permission 'canCreate': true
```

### Expected Behavior

**For Platform Admin Users:**
- ✅ See "Create Ecosystem" button on `/ecosystems` page
- ✅ Can click button and navigate to `/ecosystems/create`
- ✅ Can see and submit the creation form
- ✅ No redirect to `?error=unauthorized`

**For Non-Platform Admin Users:**
- ❌ "Create Ecosystem" button hidden
- ❌ If accessing `/ecosystems/create` directly → redirected to `?error=unauthorized`

---

## Testing Checklist

### Platform Admin User (Has `platform_admin` in userOrgRoles)
- [ ] Button visible on ecosystem list page
- [ ] Clicking button navigates to creation form
- [ ] Form is accessible and submittable
- [ ] Console shows `isPlatformAdmin: true`
- [ ] Console shows `canCreate: true`

### Organization Owner User (Does NOT have `platform_admin`)
- [ ] Button NOT visible on ecosystem list page
- [ ] Direct URL access redirects to `?error=unauthorized`
- [ ] Console shows `isPlatformAdmin: false`
- [ ] Console shows `canCreate: false`

---

## Related Code

### Where Platform Admin is Checked

1. **`src/utils/ecosystemPermissions.ts`** - Permission checking (FIXED)
2. **`src/utils/check-session-feature.ts`** - Session validation (Reference implementation)
3. **`src/pages/ecosystems/create.astro`** - Route protection
4. **`src/components/Ecosystem/EcosystemList.tsx`** - Button visibility

### Similar Pattern in Codebase

The same pattern is used in `check-session-feature.ts`:

```typescript
const userOrgRoles = userData?.data?.userOrgRoles || [];
const isPlatformAdmin = userOrgRoles.some(
  (role: any) => role?.orgRole?.name === "platform_admin"
);
```

Our fix now aligns with this established pattern.

---

## Files Modified

```
src/utils/ecosystemPermissions.ts
├── Fixed: isPlatformAdmin() function
├── Added: userData.userOrgRoles checking
├── Added: Comprehensive debug logging
└── Added: Fallback to USER_ROLES for backward compatibility
```

---

## Additional Debugging

### Check localStorage in Browser Console

```javascript
// Check USER_ROLES
localStorage.getItem('user_roles')
// Expected for org owner: "owner"

// Check userData
JSON.parse(localStorage.getItem('userData'))
// Expected for platform admin:
// {
//   data: {
//     userOrgRoles: [
//       { orgRole: { name: "platform_admin" } }
//     ]
//   }
// }
```

### Manual Test Function

Add this to browser console to test:

```javascript
async function testPlatformAdmin() {
  const { isPlatformAdmin } = await import('./src/utils/ecosystemPermissions');
  const result = await isPlatformAdmin();
  console.log('Platform Admin?', result);
}
testPlatformAdmin();
```

---

## Prevention

To prevent similar issues in the future:

1. **Always check `userData.userOrgRoles`** for platform admin status
2. **Don't rely solely on `USER_ROLES`** - it contains org roles only
3. **Follow existing patterns** in `check-session-feature.ts`
4. **Add debug logging** when checking permissions
5. **Test with both platform admin and org owner accounts**

---

## Conclusion

The issue was caused by checking the wrong data source for platform admin status. The fix now correctly checks `userData.userOrgRoles` array, which is where platform admin role is actually stored.

**Status:** ✅ Platform admin users can now create ecosystems  
**Testing:** Console logs added for easy verification  
**Compatibility:** Backward compatible with USER_ROLES check
