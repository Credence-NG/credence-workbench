# 🎯 Ecosystem Feature Implementation Plan

**Project**: Credence Workbench - Ecosystem Coordination Layer  
**Date**: October 5, 2025  
**Status**: Planning Phase  
**Reference**: `/confirmd-platform/ecosystem-doc/FRONTEND_INTEGRATION_GUIDE.md`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Access Control Matrix](#access-control-matrix)
3. [Phase 1: API Layer & Types](#phase-1-api-layer--types)
4. [Phase 2: Permission System](#phase-2-permission-system)
5. [Phase 3: Page Structure](#phase-3-page-structure)
6. [Phase 4: React Components](#phase-4-react-components)
7. [Phase 5: Integration & Testing](#phase-5-integration--testing)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Effort Estimation](#effort-estimation)
10. [Reference Files](#reference-files)

---

## Overview

### Executive Summary
Implement complete ecosystem coordination layer following the official FRONTEND_INTEGRATION_GUIDE.md. This includes ecosystem CRUD, organization management, pricing, transactions, settlements, analytics, and onboarding workflows.

### Core Features
1. ✅ **Ecosystem Management** - CRUD operations for ecosystems
2. ✅ **Organization Management** - Add/remove organizations, track membership
3. ✅ **Pricing Management** - Set credential pricing per definition
4. ✅ **Transaction Tracking** - Track issuance/verification/revocation transactions
5. ✅ **Settlement Processing** - Manage financial settlements
6. ✅ **Analytics Dashboard** - Revenue, transactions, performance metrics
7. ✅ **Health Monitoring** - Ecosystem health scores and indicators
8. ✅ **Onboarding** - Application submissions, invitations, reviews

---

## Access Control Matrix

### Role Definitions
- **Platform Admin**: User with `PlatformRoles.platformAdmin` role
- **Organization Member**: Any user who belongs to an organization (has `ORG_ID` in storage)
- **Non-Member**: Users without organization membership (no access)

### Permission Matrix

| Feature | Platform Admin | Org Member | Non-Member |
|---------|---------------|------------|------------|
| **Core Ecosystem Management** |
| View Ecosystem List | ✅ | ✅ | ❌ |
| Create Ecosystem | ✅ | ❌ | ❌ |
| Edit Ecosystem | ✅ | ❌ | ❌ |
| Delete Ecosystem | ✅ | ❌ | ❌ |
| View Ecosystem Details | ✅ | ✅ | ❌ |
| **Organization Management** |
| View Member Organizations | ✅ | ✅ | ❌ |
| Invite Organizations | ✅ | ❌ | ❌ |
| Remove Organizations | ✅ | ❌ | ❌ |
| View Organization Performance | ✅ | ✅ (own org) | ❌ |
| **Pricing Management** |
| View Pricing | ✅ | ✅ | ❌ |
| Set/Update Pricing | ✅ | ❌ | ❌ |
| **Transactions** |
| View All Transactions | ✅ | ❌ | ❌ |
| View Own Org Transactions | ✅ | ✅ | ❌ |
| **Settlements** |
| View Settlements | ✅ | ✅ (read-only) | ❌ |
| Process Settlement | ✅ | ❌ | ❌ |
| Approve Settlement | ✅ | ❌ | ❌ |
| Complete Settlement | ✅ | ❌ | ❌ |
| View Settlement Stats | ✅ | ❌ | ❌ |
| **Analytics & Health** |
| View Analytics Dashboard | ✅ | ✅ | ❌ |
| View Health Score | ✅ | ✅ | ❌ |
| View Detailed Analytics | ✅ | ✅ (limited) | ❌ |
| **Onboarding** |
| Apply to Join Ecosystem | ✅ | ✅ | ❌ |
| View Applications | ✅ | ❌ | ❌ |
| Review Applications | ✅ | ❌ | ❌ |
| Approve/Reject Applications | ✅ | ❌ | ❌ |
| Send Invitations | ✅ | ❌ | ❌ |
| Accept Invitations | ✅ | ✅ | ❌ |
| View Onboarding Stats | ✅ | ❌ | ❌ |
| **Settings** |
| View Ecosystem Settings | ✅ | ❌ | ❌ |
| Update Ecosystem Settings | ✅ | ❌ | ❌ |

---

## Phase 1: API Layer & Types

**Priority**: CRITICAL  
**Estimated Effort**: 6-8 hours

### 1.1 Update API Routes Configuration

**File**: `src/config/apiRoutes.ts`

```typescript
Ecosystem: {
  // Core Ecosystem
  root: "/ecosystem",  // Keep existing
  list: "/v1/ecosystem",                              // GET - List ecosystems
  create: "/v1/ecosystem",                            // POST - Create ecosystem
  getById: "/v1/ecosystem/:id",                       // GET - Get ecosystem details
  update: "/v1/ecosystem/:id",                        // PUT - Update ecosystem
  delete: "/v1/ecosystem/:id",                        // DELETE - Delete ecosystem
  
  // Organizations
  organizations: "/v1/ecosystem/:id/organizations",   // GET/POST - List/Add orgs
  organization: "/v1/ecosystem/:ecosystemId/organizations/:orgId", // GET/PUT/DELETE
  orgPerformance: "/v1/ecosystem/:id/organizations/:orgId/performance", // GET - Org analytics
  
  // Pricing
  pricing: "/v1/ecosystem/:id/pricing",               // GET/POST - List/Set pricing
  
  // Transactions
  transactions: "/v1/ecosystem/:id/transactions",     // GET - List transactions
  
  // Settlements
  settlements: "/v1/ecosystem/:id/settlements",       // GET - List settlements
  processSettlement: "/v1/ecosystem/:id/settlements/process", // POST
  approveSettlement: "/v1/ecosystem/:id/settlements/:settlementId/approve", // POST
  completeSettlement: "/v1/ecosystem/:id/settlements/:settlementId/complete", // POST
  settlementStats: "/v1/ecosystem/:id/settlements/stats", // GET
  
  // Analytics
  analytics: "/v1/ecosystem/:id/analytics",           // GET - Analytics data
  health: "/v1/ecosystem/:id/health",                 // GET - Health metrics
  
  // Onboarding
  applications: "/v1/ecosystem/:id/applications",     // GET/POST - List/Submit apps
  application: "/v1/ecosystem/:ecosystemId/applications/:appId", // GET - App details
  reviewApplication: "/v1/ecosystem/:ecosystemId/applications/:appId/review", // POST
  invitations: "/v1/ecosystem/:id/invitations",       // POST - Send invitation
  acceptInvitation: "/v1/ecosystem/invitations/:invitationId/accept", // POST
  onboardingStats: "/v1/ecosystem/:id/onboarding/stats", // GET
  
  // Legacy (Keep for backward compatibility)
  usersInvitation: "/users/invitations",              // Existing
  endorsements: {                                     // Existing
    list: "/endorsement-transactions",
    createSchemaRequest: "/transaction/schema",
  },
}
```

**Tasks**:
- [ ] Update existing `Ecosystem` object in apiRoutes.ts
- [ ] Keep legacy routes for backward compatibility
- [ ] Add comments for each endpoint

---

### 1.2 Create TypeScript Types

**File**: `src/types/ecosystem.ts` (NEW FILE)

**Content**: Copy all type definitions from FRONTEND_INTEGRATION_GUIDE.md including:

- Enums: `EcosystemStatus`, `BusinessModel`, `MembershipType`, `MembershipStatus`, `ApplicationStatus`, `TransactionType`, `SettlementStatus`
- Core Types: `Ecosystem`, `EcosystemOrganization`, `CredentialPricing`, `EcosystemTransaction`, `Settlement`, `Application`, `EcosystemAnalytics`, `EcosystemHealth`
- Request Types: `CreateEcosystemRequest`, `UpdateEcosystemRequest`, `AddOrganizationRequest`, `SetPricingRequest`, `SubmitApplicationRequest`, `ReviewApplicationRequest`, `SendInvitationRequest`
- Response Types: `ApiResponse<T>`, `PaginatedResponse<T>`

**Tasks**:
- [ ] Create `src/types/ecosystem.ts`
- [ ] Copy all types from guide
- [ ] Add JSDoc comments for complex types
- [ ] Export all types

---

### 1.3 Create Ecosystem Service

**File**: `src/api/ecosystem.ts` (NEW FILE)

**Pattern**: Follow `src/api/organization.ts` structure

**Service Methods**:

**Core Operations**:
- `getEcosystems(params?)` - List ecosystems
- `getEcosystem(id)` - Get details
- `createEcosystem(data)` - Create
- `updateEcosystem(id, data)` - Update
- `deleteEcosystem(id)` - Delete

**Organization Management**:
- `getOrganizations(ecosystemId, params?)` - List members
- `addOrganization(ecosystemId, data)` - Add member
- `removeOrganization(ecosystemId, orgId)` - Remove member
- `getOrgPerformance(ecosystemId, orgId)` - Get analytics

**Pricing**:
- `getPricing(ecosystemId)` - Get pricing
- `setPricing(ecosystemId, data)` - Set pricing

**Transactions**:
- `getTransactions(ecosystemId, params?)` - List transactions

**Settlements**:
- `getSettlements(ecosystemId, params?)` - List settlements
- `processSettlement(ecosystemId, data)` - Process
- `approveSettlement(ecosystemId, settlementId)` - Approve
- `completeSettlement(ecosystemId, settlementId, reference)` - Complete
- `getSettlementStats(ecosystemId)` - Get stats

**Analytics**:
- `getAnalytics(ecosystemId, params?)` - Get analytics
- `getHealth(ecosystemId)` - Get health

**Onboarding**:
- `submitApplication(ecosystemId, data)` - Submit app
- `getApplications(ecosystemId, status?)` - List apps
- `reviewApplication(ecosystemId, appId, data)` - Review
- `sendInvitation(ecosystemId, data)` - Send invite
- `acceptInvitation(invitationId)` - Accept invite
- `getOnboardingStats(ecosystemId)` - Get stats

**Tasks**:
- [ ] Create `src/api/ecosystem.ts`
- [ ] Implement all service methods
- [ ] Add proper error handling
- [ ] Add JSDoc comments
- [ ] Export service instance

---

## Phase 2: Permission System

**Priority**: HIGH  
**Estimated Effort**: 2 hours

### 2.1 Create Permission Utilities

**File**: `src/utils/ecosystemPermissions.ts` (NEW FILE)

```typescript
import { PlatformRoles } from '../common/enums';
import { getFromLocalStorage } from '../api/Auth';
import { storageKeys } from '../config/CommonConstant';

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

export const canPerformAction = async (
  action: keyof EcosystemPermissions
): Promise<boolean> => {
  const permissions = await getEcosystemPermissions();
  return permissions[action];
};
```

**Tasks**:
- [ ] Create `src/utils/ecosystemPermissions.ts`
- [ ] Implement permission functions
- [ ] Add unit tests for permission logic
- [ ] Document permission usage

---

## Phase 3: Page Structure

**Priority**: HIGH  
**Estimated Effort**: 8-10 hours

### 3.1 Create Page Files

```
src/pages/ecosystems/
  ├── index.astro                              # List all ecosystems
  ├── create.astro                             # Create ecosystem (Platform Admin)
  ├── [ecosystemId]/
  │   ├── dashboard.astro                      # Main dashboard with analytics
  │   ├── organizations.astro                  # Member organizations list
  │   ├── pricing.astro                        # Credential pricing management
  │   ├── transactions.astro                   # Transaction history
  │   ├── settlements.astro                    # Settlement processing
  │   ├── analytics.astro                      # Detailed analytics & charts
  │   ├── applications.astro                   # Application reviews (Platform Admin)
  │   ├── settings.astro                       # Ecosystem settings (Platform Admin)
  │   └── apply.astro                          # Application form (for joining)
```

### 3.2 Page Implementation Order

1. **index.astro** - Ecosystem list (All members)
2. **[ecosystemId]/dashboard.astro** - Main dashboard
3. **create.astro** - Create form (Platform Admin guard)
4. **[ecosystemId]/organizations.astro** - Member management
5. **[ecosystemId]/pricing.astro** - Pricing management
6. **[ecosystemId]/transactions.astro** - Transaction list
7. **[ecosystemId]/settlements.astro** - Settlement processing
8. **[ecosystemId]/analytics.astro** - Detailed analytics
9. **[ecosystemId]/applications.astro** - Application reviews
10. **[ecosystemId]/settings.astro** - Settings
11. **[ecosystemId]/apply.astro** - Join application

**Tasks**:
- [ ] Create all page files
- [ ] Add route protection (permission checks)
- [ ] Implement layouts
- [ ] Add loading states
- [ ] Add error boundaries

---

## Phase 4: React Components

**Priority**: HIGH  
**Estimated Effort**: 16-20 hours

### 4.1 Component Structure

```
src/components/Ecosystem/
  ├── EcosystemList.tsx                        # List with cards
  ├── EcosystemCard.tsx                        # Individual card
  ├── CreateEcosystemModal.tsx                 # Create form (Formik)
  ├── EditEcosystemModal.tsx                   # Edit form (Formik)
  ├── EcosystemDashboard.tsx                   # Dashboard overview
  ├── AnalyticsCharts.tsx                      # Revenue/transaction charts
  ├── HealthIndicator.tsx                      # Health score display
  ├── OrganizationList.tsx                     # Member orgs table
  ├── InviteOrgModal.tsx                       # Invite form (Formik)
  ├── PricingManager.tsx                       # Set pricing UI
  ├── TransactionList.tsx                      # Transaction table
  ├── SettlementList.tsx                       # Settlement table
  ├── ProcessSettlementModal.tsx               # Settlement processing
  ├── ApplicationList.tsx                      # Applications table
  ├── ApplicationReviewModal.tsx               # Review form (Formik)
  ├── ApplyToEcosystemModal.tsx                # Application form (Formik)
  └── EcosystemSettings.tsx                    # Settings panel
```

### 4.2 Implementation Priority

**Phase 4A - Core Components** (8-10 hours):
1. EcosystemList.tsx
2. EcosystemCard.tsx
3. CreateEcosystemModal.tsx (⚠️ **USE FORMIK**)
4. EditEcosystemModal.tsx (⚠️ **USE FORMIK**)
5. EcosystemDashboard.tsx

**Phase 4B - Management Components** (4-5 hours):
6. OrganizationList.tsx
7. InviteOrgModal.tsx (⚠️ **USE FORMIK**)
8. PricingManager.tsx
9. TransactionList.tsx

**Phase 4C - Financial Components** (3-4 hours):
10. SettlementList.tsx
11. ProcessSettlementModal.tsx (⚠️ **USE FORMIK**)

**Phase 4D - Analytics Components** (2-3 hours):
12. AnalyticsCharts.tsx
13. HealthIndicator.tsx

**Phase 4E - Onboarding Components** (3-4 hours):
14. ApplicationList.tsx
15. ApplicationReviewModal.tsx (⚠️ **USE FORMIK**)
16. ApplyToEcosystemModal.tsx (⚠️ **USE FORMIK**)
17. EcosystemSettings.tsx

**Tasks**:
- [ ] Create all component files
- [ ] Implement permission checks in each component
- [ ] Use Formik for ALL modal forms (see CLAUDE.md)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty states
- [ ] Make responsive (mobile-friendly)

---

## Phase 5: Integration & Testing

**Priority**: HIGH  
**Estimated Effort**: 6-8 hours

### 5.1 Navigation Integration

**File**: `src/config/pathRoutes.ts`

```typescript
ecosystem: {
  root: "/ecosystems",
  create: "/ecosystems/create",
  dashboard: "/ecosystems/:ecosystemId/dashboard",
  organizations: "/ecosystems/:ecosystemId/organizations",
  pricing: "/ecosystems/:ecosystemId/pricing",
  transactions: "/ecosystems/:ecosystemId/transactions",
  settlements: "/ecosystems/:ecosystemId/settlements",
  analytics: "/ecosystems/:ecosystemId/analytics",
  applications: "/ecosystems/:ecosystemId/applications",
  settings: "/ecosystems/:ecosystemId/settings",
  apply: "/ecosystems/:ecosystemId/apply",
}
```

**Tasks**:
- [ ] Update pathRoutes.ts
- [ ] Update sidebar menu (`src/components/Sidebar/DynamicSidebar.tsx`)
- [ ] Update feature routes (`src/config/featureRoutes.ts`)
- [ ] Add breadcrumb navigation

---

### 5.2 Testing Checklist

**Unit Tests**:
- [ ] Permission utility functions
- [ ] API service methods
- [ ] Component rendering

**Integration Tests**:
- [ ] Ecosystem CRUD flow
- [ ] Organization management
- [ ] Pricing management
- [ ] Settlement processing
- [ ] Application workflow

**E2E Tests**:
- [ ] Platform Admin can create ecosystem
- [ ] Org member can view but not edit
- [ ] Application submission and approval flow
- [ ] Settlement approval flow

**Manual Testing**:
- [ ] Test as Platform Admin
- [ ] Test as Organization Member
- [ ] Test permission boundaries
- [ ] Test all modals maintain focus (Formik implementation)
- [ ] Test responsive design
- [ ] Test error states
- [ ] Test loading states

---

## Implementation Guidelines

### 1. Code Quality Standards

**Follow Existing Patterns**:
- ✅ Mirror `Organizations` feature structure
- ✅ Use same API error handling patterns
- ✅ Follow same component organization
- ✅ Use existing UI components (Flowbite React)

**Critical Requirements**:
- ⚠️ **ALL modal forms MUST use Formik** (see `CLAUDE.md`)
- ✅ Use TypeScript strictly (no `any` types)
- ✅ Follow existing naming conventions
- ✅ Add proper error handling
- ✅ Include loading states
- ✅ Implement proper validation

**Code Style**:
- Add JSDoc comments for complex functions
- Follow existing code style (use existing files as reference)
- No hardcoded values - use constants
- Proper null/undefined checks
- Consistent error messages

---

### 2. Modal Forms - CRITICAL PATTERN

⚠️ **IMPORTANT**: All modal forms MUST use Formik to prevent focus loss issues.

**Reference**:
- ✅ `src/components/CreateOrgModal/index.tsx` - Working example
- ✅ `src/components/Setting/WebhookRegistration.tsx` - Edit modal example
- 📚 `CLAUDE.md` - Complete documentation

**Pattern**:
```tsx
import { Field, Form, Formik } from 'formik';
import * as yup from 'yup';

<Formik
  initialValues={formData}
  validationSchema={yup.object().shape({
    name: yup.string().required(),
  })}
  enableReinitialize
  onSubmit={handleSubmit}
>
  {(formik) => (
    <Form>
      <Field
        name="name"
        value={formik.values.name}
        onChange={(e) => {
          formik.setFieldValue('name', e.target.value);
          formik.setFieldTouched('name', true, false);
        }}
      />
      {formik.errors.name && formik.touched.name && (
        <span className="text-red-500 text-xs">{formik.errors.name}</span>
      )}
    </Form>
  )}
</Formik>
```

---

### 3. Permission Checks Pattern

**In Components**:
```tsx
const [permissions, setPermissions] = useState<EcosystemPermissions | null>(null);

useEffect(() => {
  const loadPermissions = async () => {
    const perms = await getEcosystemPermissions();
    setPermissions(perms);
  };
  loadPermissions();
}, []);

{permissions?.canCreate && (
  <Button onClick={handleCreate}>Create Ecosystem</Button>
)}
```

**In Astro Pages**:
```typescript
---
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';

const permissions = await getEcosystemPermissions();

if (!permissions.canCreate) {
  return Astro.redirect('/ecosystems?error=unauthorized');
}
---
```

---

### 4. Error Handling Pattern

```typescript
try {
  // Check permission first
  if (!await canPerformAction('canDelete')) {
    throw new Error('You do not have permission to delete this ecosystem');
  }
  
  await ecosystemService.deleteEcosystem(ecosystemId);
  setSuccess('Ecosystem deleted successfully');
} catch (error) {
  const err = error as any;
  
  if (err?.response?.status === 403) {
    setError('Access denied: You do not have permission to perform this action');
  } else if (err?.response?.status === 404) {
    setError('Ecosystem not found');
  } else {
    setError(err?.response?.data?.message || err?.message || 'An error occurred');
  }
}
```

---

## Effort Estimation

| Phase | Components | Effort | Priority |
|-------|-----------|---------|----------|
| **Phase 1: API & Types** | apiRoutes.ts, ecosystem.ts, types | 6-8 hours | CRITICAL |
| **Phase 2: Permissions** | ecosystemPermissions.ts | 2 hours | HIGH |
| **Phase 3: Pages (11 pages)** | Astro pages with guards | 8-10 hours | HIGH |
| **Phase 4A: Core Components** | List, Card, Create, Edit, Dashboard | 8-10 hours | HIGH |
| **Phase 4B: Management** | Orgs, Pricing, Transactions | 4-5 hours | HIGH |
| **Phase 4C: Financial** | Settlements | 3-4 hours | MEDIUM |
| **Phase 4D: Analytics** | Charts, Health | 2-3 hours | MEDIUM |
| **Phase 4E: Onboarding** | Applications, Settings | 3-4 hours | MEDIUM |
| **Phase 5: Integration** | Routes, sidebar, breadcrumbs | 2-3 hours | MEDIUM |
| **Phase 6: Testing** | Unit, integration, E2E tests | 6-8 hours | HIGH |
| **Phase 7: Documentation** | Update docs, add examples | 2-3 hours | MEDIUM |
| **TOTAL** | **Full Feature** | **46-60 hours** | |

---

## Reference Files

| Pattern Needed | Reference File | Purpose |
|----------------|----------------|---------|
| API Functions | `src/api/organization.ts` | API service pattern |
| Page Structure | `src/pages/organizations/dashboard.astro` | Astro page pattern |
| List Component | `src/components/organization/Dashboard.tsx` | List view pattern |
| Create Modal (Formik) | `src/components/CreateOrgModal/index.tsx` | Working Formik modal |
| Edit Modal (Formik) | `src/components/Setting/WebhookRegistration.tsx` | Edit modal pattern |
| Type Definitions | `src/types/*` | Type structure |
| API Routes | `src/config/apiRoutes.ts` | Route configuration |
| Path Routes | `src/config/pathRoutes.ts` | Frontend routes |
| Permission Checks | `src/config/ecosystem.ts` | Existing utilities |
| Modal Forms Guide | `CLAUDE.md` | Critical patterns |
| Official Guide | `/confirmd-platform/ecosystem-doc/FRONTEND_INTEGRATION_GUIDE.md` | Complete API reference |

---

## Sprint Planning

### Sprint 1 (Week 1) - Foundation
**Goal**: Complete API layer and basic infrastructure

- ✅ Phase 1: API & Types (6-8 hours)
- ✅ Phase 2: Permissions (2 hours)
- ✅ Start Phase 3: Create index.astro and dashboard.astro

### Sprint 2 (Week 2) - Core Features
**Goal**: Complete pages and core components

- ✅ Complete Phase 3: All pages (8-10 hours)
- ✅ Phase 4A: Core components (8-10 hours)

### Sprint 3 (Week 3) - Management Features
**Goal**: Complete management and financial features

- ✅ Phase 4B: Management components (4-5 hours)
- ✅ Phase 4C: Financial components (3-4 hours)
- ✅ Phase 4D: Analytics components (2-3 hours)

### Sprint 4 (Week 4) - Polish & Testing
**Goal**: Complete onboarding, integrate, and test

- ✅ Phase 4E: Onboarding components (3-4 hours)
- ✅ Phase 5: Integration (2-3 hours)
- ✅ Phase 6: Testing (6-8 hours)
- ✅ Phase 7: Documentation (2-3 hours)

---

## Progress Tracking

### Phase 1: API Layer & Types
- [ ] Update apiRoutes.ts
- [ ] Create ecosystem.ts types file
- [ ] Create ecosystem.ts service file
- [ ] Test API methods

### Phase 2: Permission System
- [ ] Create ecosystemPermissions.ts
- [ ] Add unit tests
- [ ] Document usage

### Phase 3: Pages
- [ ] index.astro
- [ ] create.astro
- [ ] [ecosystemId]/dashboard.astro
- [ ] [ecosystemId]/organizations.astro
- [ ] [ecosystemId]/pricing.astro
- [ ] [ecosystemId]/transactions.astro
- [ ] [ecosystemId]/settlements.astro
- [ ] [ecosystemId]/analytics.astro
- [ ] [ecosystemId]/applications.astro
- [ ] [ecosystemId]/settings.astro
- [ ] [ecosystemId]/apply.astro

### Phase 4: Components
- [ ] EcosystemList.tsx
- [ ] EcosystemCard.tsx
- [ ] CreateEcosystemModal.tsx
- [ ] EditEcosystemModal.tsx
- [ ] EcosystemDashboard.tsx
- [ ] AnalyticsCharts.tsx
- [ ] HealthIndicator.tsx
- [ ] OrganizationList.tsx
- [ ] InviteOrgModal.tsx
- [ ] PricingManager.tsx
- [ ] TransactionList.tsx
- [ ] SettlementList.tsx
- [ ] ProcessSettlementModal.tsx
- [ ] ApplicationList.tsx
- [ ] ApplicationReviewModal.tsx
- [ ] ApplyToEcosystemModal.tsx
- [ ] EcosystemSettings.tsx

### Phase 5: Integration
- [ ] Update pathRoutes.ts
- [ ] Update sidebar
- [ ] Update featureRoutes.ts
- [ ] Add breadcrumbs

### Phase 6: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

### Phase 7: Documentation
- [ ] Update CLAUDE.md
- [ ] Create usage examples
- [ ] Update API documentation

---

## Notes & Decisions

### Key Decisions
1. **Access Control**: Platform Admin only for management, all org members can view
2. **Modal Forms**: All forms MUST use Formik (see CLAUDE.md)
3. **API Version**: Using `/v1/ecosystem` endpoints from guide
4. **Backward Compatibility**: Keeping existing legacy routes

### Known Constraints
- Must maintain backward compatibility with existing ecosystem code
- Must follow Flowbite React component library
- Must use existing authentication/authorization patterns
- Chart.js for data visualization

### Risk Mitigation
- Start with core features first
- Test permission boundaries thoroughly
- Ensure Formik is used for all modal forms
- Regular progress reviews after each sprint

---

**Last Updated**: October 5, 2025  
**Document Version**: 1.0  
**Status**: Ready for Implementation
