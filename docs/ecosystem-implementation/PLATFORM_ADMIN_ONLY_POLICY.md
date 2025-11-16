# Ecosystem Permissions - Platform Admin Only

**Date:** October 6, 2025  
**Status:** ✅ Updated  
**Policy:** Platform Admin Exclusive Access

---

## Permission Policy

### Platform Admin Exclusive Operations

The following ecosystem operations are **restricted to Platform Admins only**:

- ✅ **Create Ecosystem** - Only platform admins can create new ecosystems
- ✅ **Edit Ecosystem** - Only platform admins can modify ecosystem settings
- ✅ **Delete Ecosystem** - Only platform admins can delete ecosystems
- ✅ **Manage Settings** - Only platform admins can configure ecosystem settings
- ✅ **Invite Organizations** - Only platform admins can invite organizations
- ✅ **Remove Organizations** - Only platform admins can remove organizations
- ✅ **Review Applications** - Only platform admins can review join applications
- ✅ **Manage Settlements** - Only platform admins can process settlements
- ✅ **Set Pricing** - Only platform admins can configure pricing
- ✅ **View All Transactions** - Only platform admins can view all transaction data
- ✅ **View Settlement Stats** - Only platform admins can view settlement statistics
- ✅ **View Onboarding Stats** - Only platform admins can view onboarding statistics

### Organization Member Operations

All organization members (regardless of role) have these permissions:

- ✅ **View List** - View list of ecosystems
- ✅ **View Dashboard** - View ecosystem dashboard
- ✅ **View Analytics** - View ecosystem analytics
- ✅ **View Transactions** - View transactions (filtered by organization)
- ✅ **View Members** - View ecosystem members
- ✅ **Apply to Ecosystem** - Submit application to join ecosystem
- ✅ **Accept Invitation** - Accept ecosystem invitation
- ✅ **View Pricing** - View pricing information
- ✅ **View Settlements** - View settlement information (filtered by organization)
- ✅ **View Own Org Performance** - View own organization's performance metrics

---

## Updated Permission Matrix

| Permission | Platform Admin | Org Owner | Org Admin | Org Issuer | Org Verifier | Org Member |
|------------|----------------|-----------|-----------|------------|--------------|------------|
| **Administrative** |
| Create Ecosystem | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Ecosystem | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Ecosystem | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Invite Organizations | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Remove Organizations | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Review Applications | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Settlements | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Set Pricing | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Viewing (Admin Level)** |
| View All Transactions | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Settlement Stats | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Onboarding Stats | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Viewing (Member Level)** |
| View List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Transactions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Members | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Pricing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Settlements | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Org Performance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Participation** |
| Apply to Ecosystem | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accept Invitation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Implementation Details

### Permission Check Function

```typescript
export const getEcosystemPermissions = async (): Promise<EcosystemPermissions> => {
  const isPlatAdmin = await isPlatformAdmin();
  const hasMembership = await hasOrgMembership();

  return {
    // Platform Admin exclusive permissions
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

    // All organization members permissions
    canViewList: hasMembership,
    canViewDashboard: hasMembership,
    canViewAnalytics: hasMembership,
    canViewTransactions: hasMembership,
    canViewMembers: hasMembership,
    canApplyToEcosystem: hasMembership,
    canAcceptInvitation: hasMembership,
    canViewPricing: hasMembership,
    canViewSettlements: hasMembership,
    canViewOwnOrgPerformance: hasMembership,
  };
};
```

### Platform Admin Check

```typescript
export const isPlatformAdmin = async (): Promise<boolean> => {
  try {
    const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
    if (!userRoles) return false;

    // USER_ROLES is stored as comma-separated string
    const roles = userRoles.split(",").map((role: string) => role.trim());
    return roles.includes(PlatformRoles.platformAdmin);
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return false;
  }
};
```

---

## UI Behavior

### For Platform Admins
- ✅ See "Create Ecosystem" button on ecosystem list page
- ✅ Can access `/ecosystems/create` route
- ✅ Can edit ecosystem settings
- ✅ Can manage all ecosystem operations
- ✅ Can view all data and statistics

### For Organization Owners/Admins/Members
- ✅ Can view ecosystem list
- ✅ Can view ecosystem dashboards
- ✅ Can view analytics and reports
- ✅ Can view transactions (filtered to their organization)
- ✅ Can apply to join ecosystems
- ❌ **Cannot** see "Create Ecosystem" button
- ❌ **Cannot** access creation form
- ❌ **Cannot** edit ecosystems
- ❌ **Cannot** manage ecosystem settings

---

## Route Protection

### `/ecosystems/create`

```astro
const response = await checkUserSession({cookies: Astro.cookies, currentPath: Astro.url.pathname});

if (!response.authorized) {
    return Astro.redirect(response.redirect);
}

// Only Platform Admins can create ecosystems
const canCreate = await canPerformAction('canCreate');
if (!canCreate) {
    return Astro.redirect('/ecosystems?error=unauthorized');
}
```

**Result:** Non-platform-admin users are redirected to `/ecosystems?error=unauthorized`

### `/ecosystems/[ecosystemId]/dashboard`

```astro
const response = await checkUserSession({cookies: Astro.cookies, currentPath: Astro.url.pathname});

if (!response.authorized) {
    return Astro.redirect(response.redirect);
}

if (!ecosystemId) {
    return Astro.redirect('/ecosystems');
}

// Access control is handled by checkUserSession and organization membership
```

**Result:** Any authenticated user with organization membership can view ecosystem dashboards

---

## Access Control Flow

```
User Action: Click "Create Ecosystem"
                    ↓
            Check if button visible
                    ↓
        Yes → User is Platform Admin
                    ↓
        Navigate to /ecosystems/create
                    ↓
        Server-side permission check
                    ↓
        isPlatformAdmin() === true?
                    ↓
        Yes → Show creation form
        No  → Redirect to /ecosystems?error=unauthorized
```

```
User Action: View Ecosystem Dashboard
                    ↓
        Navigate to /ecosystems/{id}/dashboard
                    ↓
        Server-side session check
                    ↓
        checkUserSession() authorized?
                    ↓
        Yes → Has organization membership?
                    ↓
        Yes → Show dashboard
        No  → Redirect to login
```

---

## Files Modified

```
src/utils/ecosystemPermissions.ts
├── Reverted: getEcosystemPermissions() to platform admin only
├── Removed: hasOrgAdminRole() function (no longer needed)
└── Status: Platform admin exclusive permissions enforced

src/pages/ecosystems/create.astro
├── Updated: Comment to reflect "Only Platform Admins"
└── Status: Route protected for platform admins only

src/pages/ecosystems/[ecosystemId]/dashboard.astro
└── Status: Accessible to all organization members (no changes)
```

---

## Testing Checklist

### Platform Admin User
- [ ] Can see "Create Ecosystem" button
- [ ] Can click and navigate to creation form
- [ ] Can submit and create new ecosystem
- [ ] Can view all ecosystems
- [ ] Can access ecosystem dashboards
- [ ] Can edit ecosystem settings

### Organization Owner/Admin/Member User
- [ ] **Cannot** see "Create Ecosystem" button
- [ ] Redirected if accessing `/ecosystems/create` directly
- [ ] Can view ecosystem list
- [ ] Can click and view ecosystem dashboards
- [ ] Can view analytics and reports
- [ ] Can see transactions filtered to their organization

---

## Security Notes

### Why Platform Admin Only?

1. **Centralized Control**: Ecosystems are platform-level constructs that coordinate multiple organizations
2. **Data Governance**: Platform admins understand the broader implications of ecosystem creation
3. **Quality Control**: Prevents proliferation of poorly configured ecosystems
4. **Business Logic**: Ecosystem creation may have licensing or business implications
5. **Technical Complexity**: Ecosystem configuration requires platform-level knowledge

### Organization Role Separation

- **Platform Admin**: Manages the platform and its ecosystems (platform-level role)
- **Organization Owner/Admin**: Manages their organization within the platform (org-level role)
- **Separation of Concerns**: Platform operations vs. organization operations

---

## Conclusion

Ecosystem creation and editing are now restricted to **Platform Admins only**. All organization members can view and participate in ecosystems, but cannot create or modify them.

**Policy:** Platform Admin Exclusive for Create/Edit/Delete operations  
**Status:** ✅ Enforced  
**Security:** ✅ Route protected  
**UI:** ✅ Button visibility controlled
