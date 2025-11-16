# 🔒 Ecosystem Access Control Matrix

**Document Version**: 1.0  
**Last Updated**: October 5, 2025  
**Status**: Approved

---

## Overview

This document defines the complete access control matrix for the Ecosystem Coordination Layer feature. Access is controlled by two primary factors:

1. **Platform Role**: Whether the user has `PlatformRoles.platformAdmin` role
2. **Organization Membership**: Whether the user has an `ORG_ID` in localStorage (belongs to any organization)

---

## Role Definitions

### Platform Admin
- **Identifier**: User has `PlatformRoles.platformAdmin` in `USER_ROLES` localStorage
- **Permission Level**: Full administrative control over all ecosystems
- **Use Cases**: 
  - System administrators managing platform-wide ecosystem coordination
  - Creating and configuring new ecosystems
  - Managing ecosystem settings and organizations
  - Processing financial settlements
  - Reviewing organization applications

### Organization Member
- **Identifier**: User has `ORG_ID` in localStorage (any organization)
- **Permission Level**: View-only access with limited actions
- **Use Cases**:
  - Organization users viewing ecosystem information
  - Viewing analytics and performance data
  - Applying to join ecosystems
  - Accepting ecosystem invitations
  - Viewing own organization's transactions and performance

### Non-Member
- **Identifier**: User without `ORG_ID` in localStorage
- **Permission Level**: No access to ecosystem features
- **Behavior**: All ecosystem features hidden or return 403 errors

---

## Complete Permission Matrix

| Feature Category | Action | Platform Admin | Org Member | Non-Member |
|-----------------|--------|---------------|------------|------------|
| **Core Ecosystem Management** |
| View Ecosystem List | List all available ecosystems | ✅ Yes | ✅ Yes | ❌ No |
| View Ecosystem Details | View detailed information about an ecosystem | ✅ Yes | ✅ Yes | ❌ No |
| Create Ecosystem | Create a new ecosystem | ✅ Yes | ❌ No | ❌ No |
| Edit Ecosystem | Modify ecosystem name, description, settings | ✅ Yes | ❌ No | ❌ No |
| Delete Ecosystem | Remove an ecosystem | ✅ Yes | ❌ No | ❌ No |
| View Ecosystem Settings | Access ecosystem configuration | ✅ Yes | ❌ No | ❌ No |
| Update Ecosystem Settings | Modify business model, membership fees, etc. | ✅ Yes | ❌ No | ❌ No |
| **Organization Management** |
| View Member Organizations | See list of organizations in ecosystem | ✅ Yes | ✅ Yes | ❌ No |
| View Organization Details | See organization information | ✅ Yes | ✅ Yes | ❌ No |
| Invite Organizations | Send invitations to join ecosystem | ✅ Yes | ❌ No | ❌ No |
| Remove Organizations | Remove organization from ecosystem | ✅ Yes | ❌ No | ❌ No |
| View Organization Performance | View analytics for specific organization | ✅ All orgs | ✅ Own org only | ❌ No |
| **Pricing Management** |
| View Credential Pricing | View pricing for credential definitions | ✅ Yes | ✅ Yes | ❌ No |
| Set Credential Pricing | Set/update pricing for credentials | ✅ Yes | ❌ No | ❌ No |
| Update Credential Pricing | Modify existing pricing | ✅ Yes | ❌ No | ❌ No |
| Delete Credential Pricing | Remove pricing entry | ✅ Yes | ❌ No | ❌ No |
| **Transaction Management** |
| View All Transactions | See all ecosystem transactions | ✅ Yes | ❌ No | ❌ No |
| View Own Organization Transactions | See own org's transactions | ✅ Yes | ✅ Yes | ❌ No |
| View Transaction Details | See detailed transaction information | ✅ All | ✅ Own only | ❌ No |
| Filter Transactions | Filter by type, org, date range | ✅ Yes | ✅ Limited | ❌ No |
| Export Transactions | Export transaction data | ✅ Yes | ✅ Own only | ❌ No |
| **Settlement Management** |
| View Settlements | View settlement records | ✅ Yes | ✅ Read-only | ❌ No |
| Process Settlement | Initiate settlement calculation | ✅ Yes | ❌ No | ❌ No |
| Approve Settlement | Approve calculated settlement | ✅ Yes | ❌ No | ❌ No |
| Complete Settlement | Mark settlement as paid | ✅ Yes | ❌ No | ❌ No |
| View Settlement Details | See detailed settlement breakdown | ✅ Yes | ✅ Read-only | ❌ No |
| View Settlement Stats | View settlement statistics | ✅ Yes | ❌ No | ❌ No |
| **Analytics & Reporting** |
| View Analytics Dashboard | Access main analytics page | ✅ Yes | ✅ Yes | ❌ No |
| View Revenue Analytics | See revenue charts and trends | ✅ Yes | ✅ Limited | ❌ No |
| View Transaction Analytics | See transaction volume/trends | ✅ Yes | ✅ Limited | ❌ No |
| View Organization Analytics | See per-org performance | ✅ All orgs | ✅ Own org | ❌ No |
| View Health Score | See ecosystem health metrics | ✅ Yes | ✅ Yes | ❌ No |
| View Detailed Analytics | Access detailed analytics data | ✅ Yes | ✅ Limited | ❌ No |
| Export Analytics | Export analytics data | ✅ Yes | ✅ Limited | ❌ No |
| **Onboarding & Applications** |
| Apply to Join Ecosystem | Submit application to join | ✅ Yes | ✅ Yes | ❌ No |
| View Own Applications | See submitted applications | ✅ Yes | ✅ Yes | ❌ No |
| View All Applications | See all pending applications | ✅ Yes | ❌ No | ❌ No |
| Review Applications | Review pending applications | ✅ Yes | ❌ No | ❌ No |
| Approve Applications | Accept organization into ecosystem | ✅ Yes | ❌ No | ❌ No |
| Reject Applications | Decline organization application | ✅ Yes | ❌ No | ❌ No |
| Send Invitations | Invite organizations directly | ✅ Yes | ❌ No | ❌ No |
| Accept Invitations | Accept invitation to join | ✅ Yes | ✅ Yes | ❌ No |
| View Onboarding Stats | See application/invitation statistics | ✅ Yes | ❌ No | ❌ No |

---

## Permission Implementation

### Code Reference

**Permission Utility**: `src/utils/ecosystemPermissions.ts`

```typescript
export interface EcosystemPermissions {
  // Platform Admin only
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageSettings: boolean;
  canInviteOrgs: boolean;
  canRemoveOrgs: boolean;
  canReviewApplications: boolean;
  canManageSettlements: boolean;
  canSetPricing: boolean;
  canViewAllTransactions: boolean;
  canViewSettlementStats: boolean;
  canViewOnboardingStats: boolean;
  
  // All organization members
  canViewList: boolean;
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canViewTransactions: boolean;
  canViewMembers: boolean;
  canApplyToEcosystem: boolean;
  canAcceptInvitation: boolean;
  canViewPricing: boolean;
  canViewSettlements: boolean;
  canViewOwnOrgPerformance: boolean;
}

export const isPlatformAdmin = async (): Promise<boolean> => {
  const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
  if (!userRoles) return false;
  const roles = userRoles.split(',');
  return roles.includes(PlatformRoles.platformAdmin);
};

export const getEcosystemPermissions = async (): Promise<EcosystemPermissions> => {
  const isPlatAdmin = await isPlatformAdmin();
  const hasOrgMembership = !!(await getFromLocalStorage(storageKeys.ORG_ID));

  return {
    // Platform Admin exclusive
    canCreate: isPlatAdmin,
    canEdit: isPlatAdmin,
    canDelete: isPlatAdmin,
    canManageSettings: isPlatAdmin,
    canInviteOrgs: isPlatAdmin,
    canRemoveOrgs: isPlatAdmin,
    canReviewApplications: isPlatAdmin,
    canManageSettlements: isPlatAdmin,
    canSetPricing: isPlatAdmin,
    canViewAllTransactions: isPlatAdmin,
    canViewSettlementStats: isPlatAdmin,
    canViewOnboardingStats: isPlatAdmin,
    
    // All org members
    canViewList: hasOrgMembership,
    canViewDashboard: hasOrgMembership,
    canViewAnalytics: hasOrgMembership,
    canViewTransactions: hasOrgMembership,
    canViewMembers: hasOrgMembership,
    canApplyToEcosystem: hasOrgMembership,
    canAcceptInvitation: hasOrgMembership,
    canViewPricing: hasOrgMembership,
    canViewSettlements: hasOrgMembership,
    canViewOwnOrgPerformance: hasOrgMembership,
  };
};
```

---

## Usage Patterns

### In React Components

```tsx
import { getEcosystemPermissions, EcosystemPermissions } from '../utils/ecosystemPermissions';

const MyComponent = () => {
  const [permissions, setPermissions] = useState<EcosystemPermissions | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      const perms = await getEcosystemPermissions();
      setPermissions(perms);
    };
    loadPermissions();
  }, []);

  if (!permissions) return <Spinner />;

  return (
    <div>
      {permissions.canCreate && (
        <Button onClick={handleCreate}>Create Ecosystem</Button>
      )}
      
      {permissions.canViewDashboard && (
        <Link to="/ecosystems/dashboard">View Dashboard</Link>
      )}
    </div>
  );
};
```

### In Astro Pages

```typescript
---
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';

const permissions = await getEcosystemPermissions();

// Redirect if no access
if (!permissions.canCreate) {
  return Astro.redirect('/ecosystems?error=unauthorized');
}
---

<Layout>
  <CreateEcosystemForm />
</Layout>
```

### In API Calls

```typescript
const deleteEcosystem = async (id: string) => {
  try {
    // Check permission first
    if (!await canPerformAction('canDelete')) {
      throw new Error('You do not have permission to delete this ecosystem');
    }
    
    await ecosystemService.deleteEcosystem(id);
    toast.success('Ecosystem deleted successfully');
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## UI Visibility Rules

### Navigation/Sidebar

| Menu Item | Platform Admin | Org Member | Non-Member |
|-----------|---------------|------------|------------|
| Ecosystems (parent) | ✅ Visible | ✅ Visible | ❌ Hidden |
| └─ List Ecosystems | ✅ Visible | ✅ Visible | ❌ Hidden |
| └─ Create Ecosystem | ✅ Visible | ❌ Hidden | ❌ Hidden |
| └─ Applications | ✅ Visible | ❌ Hidden | ❌ Hidden |

### Ecosystem Dashboard

| UI Element | Platform Admin | Org Member | Non-Member |
|------------|---------------|------------|------------|
| View Dashboard | ✅ Full access | ✅ Limited data | ❌ No access |
| Edit Button | ✅ Visible | ❌ Hidden | ❌ No access |
| Delete Button | ✅ Visible | ❌ Hidden | ❌ No access |
| Settings Button | ✅ Visible | ❌ Hidden | ❌ No access |
| Analytics Charts | ✅ All data | ✅ Limited data | ❌ No access |
| Invite Org Button | ✅ Visible | ❌ Hidden | ❌ No access |
| Apply Button | ✅ Visible | ✅ Visible | ❌ No access |

### Settlements Page

| UI Element | Platform Admin | Org Member | Non-Member |
|------------|---------------|------------|------------|
| Settlements List | ✅ All settlements | ✅ Read-only | ❌ No access |
| Process Button | ✅ Enabled | ❌ Hidden | ❌ No access |
| Approve Button | ✅ Enabled | ❌ Hidden | ❌ No access |
| Complete Button | ✅ Enabled | ❌ Hidden | ❌ No access |
| Stats Panel | ✅ Visible | ❌ Hidden | ❌ No access |

### Applications Page

| UI Element | Platform Admin | Org Member | Non-Member |
|------------|---------------|------------|------------|
| View Applications | ✅ All apps | ❌ No access | ❌ No access |
| Review Modal | ✅ Enabled | ❌ No access | ❌ No access |
| Approve/Reject Buttons | ✅ Enabled | ❌ No access | ❌ No access |
| Apply Button | ✅ Visible | ✅ Visible | ❌ No access |

---

## Error Handling

### Permission Denied Responses

**HTTP 403 Response**:
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "error": "Forbidden"
}
```

**UI Error Handling**:
```typescript
catch (error) {
  const err = error as any;
  
  if (err?.response?.status === 403) {
    toast.error('Access denied: You do not have permission to perform this action');
  } else {
    toast.error(err?.message || 'An error occurred');
  }
}
```

---

## Testing Checklist

### Permission Tests

- [ ] Platform Admin can create ecosystem
- [ ] Organization Member cannot create ecosystem
- [ ] Non-member cannot access any ecosystem features
- [ ] Platform Admin can edit ecosystem settings
- [ ] Organization Member cannot edit ecosystem
- [ ] Platform Admin can delete ecosystem
- [ ] Organization Member cannot delete ecosystem
- [ ] Platform Admin can review applications
- [ ] Organization Member cannot review applications
- [ ] Platform Admin can process settlements
- [ ] Organization Member cannot process settlements
- [ ] Both roles can view ecosystem list
- [ ] Both roles can view ecosystem dashboard
- [ ] Both roles can apply to join ecosystem
- [ ] Both roles can accept invitations
- [ ] Organization Member can view only own org transactions
- [ ] Platform Admin can view all transactions
- [ ] All buttons/actions respect permission visibility
- [ ] Unauthorized actions return proper 403 errors

---

## Migration Notes

### Replacing EcosystemRoles with PlatformRoles

The existing `src/config/ecosystem.ts` uses `EcosystemRoles` enum. This should be replaced with the standard `PlatformRoles.platformAdmin`:

**Before**:
```typescript
export enum EcosystemRoles {
  ecosystemLead = 'ecosystem_lead',
  ecosystemMember = 'ecosystem_member'
}
```

**After**:
```typescript
// Use PlatformRoles.platformAdmin instead
import { PlatformRoles } from '../common/enums';
```

**Migration Steps**:
1. Update `checkEcosystem()` to check for `PlatformRoles.platformAdmin`
2. Remove `EcosystemRoles` enum
3. Update all permission checks throughout codebase
4. Test all permission boundaries

---

## Security Considerations

1. **Always check permissions server-side**: Frontend permission checks are for UX only. Backend must validate.
2. **Token-based permissions**: Permissions derived from stored user roles and org membership
3. **Fail-safe defaults**: If permission check fails, default to no access
4. **Audit logging**: All administrative actions should be logged
5. **Permission caching**: Cache permissions in component state, refresh on navigation
6. **Graceful degradation**: Hide features user cannot access, don't show disabled buttons

---

**Document Status**: Ready for Implementation  
**Approval**: Required before Phase 2 implementation begins
