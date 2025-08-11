# Feature-Based Authorization Migration Guide

This guide outlines the migration from the dual route+feature authorization system to a unified feature-based approach aligned with the backend architecture.

## Overview

The new system simplifies authorization by:
- Using pattern-based route-to-feature mapping
- Eliminating redundant route arrays 
- Aligning frontend permissions with backend API structure
- Providing React hooks for UI control

## File Structure

### New Files Created
- `/src/config/featureAuth.ts` - Core authorization logic with route patterns
- `/src/utils/check-session-feature.ts` - Session checking for Astro pages
- `/src/hooks/useFeatureAccess.tsx` - React hooks for components

### Files to Update
- Astro pages using `checkUserSession`
- React components with permission checks
- Navigation/sidebar components

## Migration Steps

### 1. Update Astro Pages

**Before (old system):**
```typescript
import { checkUserSession } from '../utils/check-session';

export const prerender = false;

const session = await checkUserSession(Astro.request, ['/organizations/schemas']);
```

**After (new system):**
```typescript
import { checkUserSession } from '../utils/check-session-feature';

export const prerender = false;

const session = await checkUserSession(Astro.request, Astro.url.pathname);
```

### 2. Update React Components

**Before (manual permission checks):**
```typescript
const userRoles = JSON.parse(localStorage.getItem('ORG_ROLES') || '[]');
const canCreateSchema = userRoles.includes('owner') || userRoles.includes('admin');
```

**After (using hooks):**
```typescript
import { useCommonFeatures, FeatureGate } from '../hooks/useFeatureAccess';

const { canCreateSchema } = useCommonFeatures();

// Or use the component:
<FeatureGate feature={Features.CREATE_SCHEMA}>
  <CreateSchemaButton />
</FeatureGate>
```

### 3. Update Navigation Components

**Example: Sidebar Navigation**
```typescript
import { useFeatureNavigation } from '../hooks/useFeatureAccess';

export const SidebarNavigation = () => {
  const { navigationItems } = useFeatureNavigation();
  
  return (
    <nav>
      {navigationItems.map(item => (
        <NavLink key={item.path} to={item.path}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
```

## Route Pattern Mapping

The system uses RegExp patterns to map routes to features:

```typescript
// Examples from featureAuth.ts
'/organizations/schemas' → Features.VIEW_SCHEMAS
'/organizations/credentials/issue' → Features.ISSUANCE  
'/organizations/verification' → Features.VERIFICATION
'/platform-settings' → Features.PLATFORM_SETTINGS
```

## Platform Admin Handling

Platform administrators automatically get all features:
```typescript
// Platform admin gets Object.values(Features)
const isPlatformAdmin = checkPlatformAdmin(); // Checks for 'platform_admin' role
```

## Component Examples

### Feature Gates
```typescript
// Show/hide based on single feature
<FeatureGate feature={Features.CREATE_SCHEMA}>
  <CreateSchemaForm />
</FeatureGate>

// Multiple features (require any)
<FeatureGate feature="VIEW_SCHEMAS,MANAGE_SCHEMAS">
  <SchemaList />
</FeatureGate>

// Multiple features (require all)
<FeatureGate feature="CREATE_SCHEMA,MANAGE_ORGANIZATION" requireAll>
  <AdvancedSchemaOptions />
</FeatureGate>

// With fallback content
<FeatureGate 
  feature={Features.MANAGE_MEMBERS}
  fallback={<div>Access denied</div>}
>
  <UserManagement />
</FeatureGate>
```

### Platform Admin Gates
```typescript
<PlatformAdminGate>
  <PlatformSettingsPanel />
</PlatformAdminGate>
```

### Hook Usage
```typescript
const { 
  canCreateSchema,
  canIssueCredentials,
  isPlatformAdmin,
  loading 
} = useCommonFeatures();

if (loading) return <LoadingSpinner />;

return (
  <div>
    {canCreateSchema && <SchemaBuilder />}
    {canIssueCredentials && <CredentialIssuer />}
    {isPlatformAdmin && <AdminPanel />}
  </div>
);
```

## Files Requiring Updates

### Astro Pages (Priority: High)
- `/src/pages/organizations/schemas/index.astro`
- `/src/pages/organizations/credentials/issue/index.astro`
- `/src/pages/organizations/verification/index.astro`
- `/src/pages/platform-settings/index.astro`
- `/src/pages/organizations/users/index.astro`
- `/src/pages/connections/index.astro`

### React Components (Priority: Medium)
- `/src/components/User/UserDashBoard.tsx`
- `/src/app/SideBar.astro`
- `/src/components/Schemas/SchemasList.tsx`
- `/src/components/Issuance/CredentialIssuance.tsx`
- Navigation components

### Configuration (Priority: Low)
- Remove old FeatureRoutes arrays once migration complete
- Update middleware if needed

## Testing Checklist

- [ ] Platform admin can access all routes
- [ ] Organization owners can access appropriate features
- [ ] Members have restricted access
- [ ] Route patterns match correctly
- [ ] React components show/hide based on permissions
- [ ] Navigation items appear correctly for different roles
- [ ] Session validation works on all pages

## Backend Alignment

The new system aligns with backend API patterns:
```
Frontend Route          Backend API                 Feature
/organizations/schemas  → /orgs/{orgId}/schemas    → VIEW_SCHEMAS
/credentials/issue      → /orgs/{orgId}/credentials → ISSUANCE
/verification          → /orgs/{orgId}/proofs      → VERIFICATION
```

## Rollback Plan

If issues arise:
1. Keep old files until migration complete
2. Revert imports to old `check-session` temporarily
3. Test thoroughly before removing legacy code

## Next Steps

1. Update high-priority Astro pages first
2. Test each page after conversion
3. Update React components with hooks
4. Remove legacy authorization code
5. Validate with different user roles

This migration simplifies the codebase while providing better alignment with backend architecture and improved developer experience.
