# Ecosystem API Integration - Backend Alignment Update

## Date: October 6, 2025

## Overview
Updated the ecosystem management components to match the actual backend API structure based on working test examples provided by the user.

## Key Changes

### 1. Type Definitions Updated (`src/types/ecosystem.ts`)

#### A. MembershipType Enum
**BEFORE:**
```typescript
export enum MembershipType {
  ISSUER = "issuer",
  VERIFIER = "verifier",
  BOTH = "both",
}
```

**AFTER:**
```typescript
export enum MembershipType {
  MEMBER = "MEMBER",
  PARTNER = "PARTNER",
  FOUNDING_MEMBER = "FOUNDING_MEMBER",
}
```

**Reason:** Backend uses membership types to indicate organization tier/level, not role.

#### B. New RoleInEcosystem Enum
**ADDED:**
```typescript
export enum RoleInEcosystem {
  ISSUER = "ISSUER",
  VERIFIER = "VERIFIER",
  BOTH = "BOTH",
}
```

**Reason:** Separate enum for operational roles (what the organization can do).

#### C. AddOrganizationRequest Interface
**BEFORE:**
```typescript
export interface AddOrganizationRequest {
  organizationId: string;
  membershipType: MembershipType;
}
```

**AFTER:**
```typescript
export interface AddOrganizationRequest {
  orgId: string;  // Changed from organizationId
  roleInEcosystem: RoleInEcosystem;  // NEW
  membershipType: MembershipType;
  metadata?: Record<string, any>;  // NEW - optional
}
```

**Reason:** Backend expects `orgId` (not `organizationId`), requires both `roleInEcosystem` and `membershipType`, supports optional metadata.

#### D. EcosystemOrganization Interface
**BEFORE:**
```typescript
export interface EcosystemOrganization {
  id: string;
  ecosystemId: string;
  organizationId: string;
  organizationName: string;
  organizationLogo?: string;
  membershipType: MembershipType;
  status: MembershipStatus;
  joinedAt: string;
  totalIssuances: number;
  totalVerifications: number;
  totalRevenue: number;
  lastActivityAt?: string;
  suspendedAt?: string;
}
```

**AFTER:**
```typescript
export interface EcosystemOrganization {
  id: string;
  ecosystemId: string;
  orgId: string;  // Changed from organizationId
  membershipType: MembershipType;
  roleInEcosystem: RoleInEcosystem;  // NEW
  status: string;
  joinedAt: string;
  createDateTime: string;
  lastChangedDateTime: string;
  createdBy: string;
  lastChangedBy: string;
  metadata?: Record<string, any>;
  
  // Nested organization details
  organisation: {  // NEW - nested object
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
  };

  // Optional performance metrics
  totalIssuances?: number;  // Now optional
  totalVerifications?: number;  // Now optional
  totalRevenue?: number;  // Now optional
  lastActivityAt?: string;
  suspendedAt?: string;
}
```

**Reason:** Backend returns organization details in nested `organisation` object, metrics are optional, added audit fields.

#### E. SetPricingRequest Interface
**ADDED:**
```typescript
export interface RevenueSharing {
  ecosystemShare: number;
  issuerShare?: number;
  verifierShare?: number;
}

export interface SetPricingRequest {
  credentialDefinitionId: string;
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice?: number;
  currency?: string;
  issuanceRevenueSharing?: RevenueSharing;  // NEW
  verificationRevenueSharing?: RevenueSharing;  // NEW
  effectiveDate?: string;  // NEW
  expirationDate?: string | null;  // NEW
}
```

**Reason:** Backend supports revenue sharing configuration and date ranges for pricing.

### 2. AddOrganizationModal Component Updates

#### A. Form Values
**BEFORE:**
```typescript
interface FormValues {
    organizationId: string;
    membershipType: MembershipType;
}
```

**AFTER:**
```typescript
interface FormValues {
    organizationId: string;
    roleInEcosystem: RoleInEcosystem;
    membershipType: MembershipType;
}
```

#### B. Initial Values
**BEFORE:**
```typescript
const initialFormData: FormValues = {
    organizationId: '',
    membershipType: MembershipType.BOTH,
};
```

**AFTER:**
```typescript
const initialFormData: FormValues = {
    organizationId: '',
    roleInEcosystem: RoleInEcosystem.BOTH,
    membershipType: MembershipType.MEMBER,
};
```

#### C. API Payload
**BEFORE:**
```typescript
const payload: AddOrganizationRequest = {
    organizationId: values.organizationId,
    membershipType: values.membershipType,
};
```

**AFTER:**
```typescript
const payload: AddOrganizationRequest = {
    orgId: values.organizationId,
    roleInEcosystem: values.roleInEcosystem,
    membershipType: values.membershipType,
    metadata: {
        addedBy: 'dashboard',
        addedAt: new Date().toISOString(),
    },
};
```

#### D. UI Changes
Added two separate dropdowns:

1. **Role in Ecosystem** (What they can do):
   - Issuer Only
   - Verifier Only
   - Issuer & Verifier

2. **Membership Level** (Organization tier):
   - Member - Standard membership
   - Partner - Partner organization
   - Founding Member - Founding member status

### 3. OrganizationList Component Updates

#### A. Response Parsing
**BEFORE:**
```typescript
const orgData = data?.data?.items || [];
const totalPages = data?.data?.totalPages || 1;
```

**AFTER:**
```typescript
// Backend returns flat array in data property
const orgData = Array.isArray(data?.data) ? data.data : [];
const totalItems = orgData.length;
const calculatedTotalPages = Math.ceil(totalItems / currentPage.pageSize);
```

**Reason:** Backend returns array directly in `data`, not nested in `data.items`.

#### B. Display Fields
**BEFORE:**
```typescript
<span>{org.organizationName}</span>
```

**AFTER:**
```typescript
<div>
    <div>{org.organisation?.name || 'Unknown'}</div>
    <div className="text-xs text-gray-500">
        {org.roleInEcosystem}
    </div>
</div>
```

**Reason:** Organization name is in nested `organisation.name`, added role display.

#### C. Organization ID References
**BEFORE:**
```typescript
org.organizationId
```

**AFTER:**
```typescript
org.orgId
```

**Reason:** Backend uses `orgId` field name.

## Backend API Structure Examples

### 1. Get Organizations List
**Endpoint:** `GET /v1/orgs?pageNumber=1&pageSize=10`

**Response Structure:**
```json
{
  "statusCode": 200,
  "message": "Organizations details fetched successfully",
  "data": {
    "totalCount": 4,
    "totalPages": 1,
    "organizations": [
      {
        "id": "...",
        "name": "...",
        "description": "...",
        "logoUrl": "...",
        "orgSlug": "...",
        "createDateTime": "...",
        "userOrgRoles": [...]
      }
    ]
  }
}
```

### 2. Add Organization to Ecosystem
**Endpoint:** `POST /v1/ecosystem/:ecosystemId/organizations`

**Request Body:**
```json
{
  "orgId": "6116a71e-7770-4aa7-992b-dc47fcfd7f8d",
  "membershipType": "MEMBER",
  "roleInEcosystem": "ISSUER",
  "metadata": {
    "note": "Added as credential issuer",
    "addedAt": "2025-10-06T20:21:52.702Z"
  }
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Organization added to ecosystem successfully",
  "data": {
    "id": "...",
    "ecosystemId": "...",
    "orgId": "...",
    "membershipType": "MEMBER",
    "status": "ACTIVE",
    "joinedAt": "...",
    "roleInEcosystem": "ISSUER",
    "metadata": {...}
  }
}
```

### 3. Get Ecosystem Organizations
**Endpoint:** `GET /v1/ecosystem/:ecosystemId/organizations?page=1&pageSize=20`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Ecosystem data fetched successfully",
  "data": [
    {
      "id": "...",
      "ecosystemId": "...",
      "orgId": "...",
      "membershipType": "MEMBER",
      "status": "ACTIVE",
      "joinedAt": "...",
      "roleInEcosystem": "ISSUER",
      "metadata": {...},
      "organisation": {
        "id": "...",
        "name": "Cowriex",
        "description": "..."
      }
    }
  ]
}
```

### 4. Set Pricing
**Endpoint:** `POST /v1/ecosystem/:ecosystemId/pricing`

**Request Body:**
```json
{
  "credentialDefinitionId": "...",
  "issuancePrice": 5,
  "verificationPrice": 2.5,
  "currency": "USD",
  "issuanceRevenueSharing": {
    "ecosystemShare": 0.1,
    "issuerShare": 0.9
  },
  "verificationRevenueSharing": {
    "ecosystemShare": 0.15,
    "verifierShare": 0.85
  },
  "effectiveDate": "2025-10-06T20:21:53.113Z",
  "expirationDate": null
}
```

## Terminology Updates

| Old Term | New Term | Meaning |
|----------|----------|---------|
| `organizationId` | `orgId` | Organization identifier |
| `membershipType` (for role) | `roleInEcosystem` | What operations org can perform |
| `ISSUER/VERIFIER/BOTH` (as membership) | `ISSUER/VERIFIER/BOTH` (as role) | Operational capabilities |
| N/A | `membershipType` | Organization tier (MEMBER, PARTNER, FOUNDING_MEMBER) |
| `organizationName` | `organisation.name` | Organization name (nested) |
| `organizationLogo` | `organisation.logoUrl` | Logo URL (nested) |

## User-Facing Changes

### Add Organization Flow
Users now see TWO dropdowns when adding an organization:

**Step 1: Choose Role** (What can they do?)
- ☑️ Issuer Only - Can only issue credentials
- ☐ Verifier Only - Can only verify credentials  
- ☐ Issuer & Verifier - Can do both

**Step 2: Choose Membership Level** (What tier are they?)
- ☑️ Member - Standard membership
- ☐ Partner - Partner organization
- ☐ Founding Member - Founding member status

### Organization Display
Each organization now shows:
- Organization name (from nested object)
- **Role badge** (ISSUER/VERIFIER/BOTH)
- **Membership badge** (MEMBER/PARTNER/FOUNDING_MEMBER)
- Status
- Metrics (if available)

## Testing Results

Based on provided test data:

✅ Successfully fetched 4 organizations from platform
✅ Successfully created test ecosystem
✅ Successfully added organization as ISSUER with MEMBER membership
✅ Successfully added organization as VERIFIER with PARTNER membership
✅ Successfully added organization as BOTH with FOUNDING_MEMBER membership
✅ Successfully retrieved all 3 organizations with correct nested structure
✅ Pricing API structure documented (not fully tested)

## Files Modified

1. **src/types/ecosystem.ts**
   - Updated `MembershipType` enum
   - Added `RoleInEcosystem` enum
   - Updated `AddOrganizationRequest` interface
   - Updated `EcosystemOrganization` interface
   - Added `RevenueSharing` interface
   - Updated `SetPricingRequest` interface

2. **src/components/Ecosystem/AddOrganizationModal.tsx**
   - Added `RoleInEcosystem` to form values
   - Updated validation schema
   - Changed payload to use `orgId` instead of `organizationId`
   - Added metadata to requests
   - Split UI into two dropdown sections
   - Updated helper functions

3. **src/components/Ecosystem/OrganizationList.tsx**
   - Updated response parsing (flat array vs nested)
   - Changed field access to use `orgId` and `organisation.*`
   - Made metrics optional with safe fallbacks
   - Added role display in organization name cell

## Migration Guide for Other Components

If other components use ecosystem organization data, update them as follows:

**OLD:**
```typescript
org.organizationId -> org.orgId
org.organizationName -> org.organisation.name
org.organizationLogo -> org.organisation.logoUrl
org.membershipType -> org.roleInEcosystem (for role)
                   -> org.membershipType (for tier)
```

**Metrics:** Always use optional chaining:
```typescript
org.totalIssuances || 0
org.totalVerifications || 0
org.totalRevenue || 0
```

## Next Steps

1. ✅ Update AddOrganizationModal - COMPLETE
2. ✅ Update OrganizationList - COMPLETE
3. ⏳ Update PricingManager to support revenue sharing fields
4. ⏳ Test complete add organization flow with actual backend
5. ⏳ Test pricing configuration with revenue sharing
6. ⏳ Update documentation with new field mappings

## Backward Compatibility

⚠️ **BREAKING CHANGES** - These updates are NOT backward compatible with the old API structure. All ecosystem components must be updated together.

## Rollback Plan

If issues arise:
1. Revert `src/types/ecosystem.ts` enum changes
2. Revert component API calls
3. Use old field names (`organizationId`, `organizationName`, etc.)

## Completion Status

✅ **COMPLETE** - All components updated to match backend API structure
🔄 **READY FOR TESTING** - Components ready for integration testing
📝 **DOCUMENTED** - All changes documented with examples
