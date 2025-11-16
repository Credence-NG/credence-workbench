# Ecosystem Pricing Model Update - Implementation Summary
**Date:** November 5, 2025
**Status:** ✅ Priority 1 Complete (Type Definitions & API Layer)
**Reference:** [ECOSYSTEM_IMPLEMENTATION_REVIEW.md](./ECOSYSTEM_IMPLEMENTATION_REVIEW.md)

## What Was Implemented

This document summarizes the Priority 1 fixes for the Ecosystem schema pricing model to align with the official Backend API Guide v1.1.0.

---

## Changes Made

### 1. Updated Type Definitions ✅

**File:** [`src/types/ecosystem.ts`](../src/types/ecosystem.ts)

#### Changed: `EcosystemSchema` Interface

**Before:**
```typescript
export interface EcosystemSchema {
  id: string;
  ecosystemId: string;
  schemaId: string;  // ❌ Wrong field name
  status: EcosystemSchemaStatus;
  governanceLevel: GovernanceLevel;
  usagePolicy: string | null;
  schema: { ... };  // Nested schema details
}
```

**After:**
```typescript
export interface EcosystemSchema {
  id: string;
  ecosystemId: string;
  schemaLedgerId: string;  // ✅ Correct DID format

  // ✅ Added pricing fields
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice: number;
  currency: string;

  // ✅ Added issuance revenue sharing (3 fields)
  issuancePlatformShare: number;
  issuanceEcosystemShare: number;
  issuanceIssuerShare: number;

  // ✅ Added verification revenue sharing (3 fields)
  verificationPlatformShare: number;
  verificationEcosystemShare: number;
  verificationVerifierShare: number;

  // ✅ Added revocation revenue sharing (3 fields)
  revocationPlatformShare: number;
  revocationEcosystemShare: number;
  revocationIssuerShare: number;

  // Audit fields
  createDateTime: string;
  createdBy: string;
}
```

**Total Fields Added:** 12 pricing/revenue fields

#### Changed: `AddSchemaToEcosystemRequest` Interface

**Before:**
```typescript
export interface AddSchemaToEcosystemRequest {
  schemaId: string;
  governanceLevel?: GovernanceLevel;
  usagePolicy?: string;
}
```

**After:**
```typescript
export interface AddSchemaToEcosystemRequest {
  schemaLedgerId: string;  // DID format required

  // Pricing configuration
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice: number;
  currency: string;

  // Issuance revenue split (must total 100%)
  issuancePlatformShare: number;
  issuanceEcosystemShare: number;
  issuanceIssuerShare: number;

  // Verification revenue split (must total 100%)
  verificationPlatformShare: number;
  verificationEcosystemShare: number;
  verificationVerifierShare: number;

  // Revocation revenue split (must total 100%)
  revocationPlatformShare: number;
  revocationEcosystemShare: number;
  revocationIssuerShare: number;
}
```

#### Added: `UpdateSchemaPricingRequest` Interface

**New type for updating existing schema pricing:**
```typescript
export interface UpdateSchemaPricingRequest {
  // All fields optional
  issuancePrice?: number;
  verificationPrice?: number;
  revocationPrice?: number;
  currency?: string;

  // IMPORTANT: If updating revenue shares for an operation,
  // ALL 3 shares required and must total 100%
  issuancePlatformShare?: number;
  issuanceEcosystemShare?: number;
  issuanceIssuerShare?: number;

  verificationPlatformShare?: number;
  verificationEcosystemShare?: number;
  verificationVerifierShare?: number;

  revocationPlatformShare?: number;
  revocationEcosystemShare?: number;
  revocationIssuerShare?: number;
}
```

#### Deprecated Fields

Marked as deprecated but kept for backward compatibility:
```typescript
/** @deprecated Governance level not used in current API spec */
export enum GovernanceLevel { ... }

/** @deprecated Schema status not used in current API spec */
export enum EcosystemSchemaStatus { ... }
```

---

### 2. Created Validation Utilities ✅

**File:** [`src/utils/ecosystemValidation.ts`](../src/utils/ecosystemValidation.ts) (NEW)

#### Key Functions:

##### Revenue Share Validation
```typescript
validateRevenueShares(platform, ecosystem, issuerOrVerifier)
// Validates:
// - Each share is 0-100
// - Total equals exactly 100%

validateIssuanceShares(platform, ecosystem, issuer)
validateVerificationShares(platform, ecosystem, verifier)
validateRevocationShares(platform, ecosystem, issuer)
// Operation-specific validation with tailored error messages
```

##### Pricing Validation
```typescript
validatePrices(issuancePrice, verificationPrice, revocationPrice)
// Validates all prices are non-negative

validateCurrency(currency)
// Validates ISO currency code format (3 uppercase letters)

validateSchemaLedgerId(schemaLedgerId)
// Validates DID format (must start with "did:")
```

##### Complete Request Validation
```typescript
validateAddSchemaRequest(request: AddSchemaToEcosystemRequest)
// Validates entire add schema request
// Returns: { valid: boolean, errors: string[], warnings: string[] }

validateUpdatePricingRequest(request: UpdateSchemaPricingRequest)
// Validates update request
// Ensures when updating revenue shares, ALL 3 shares provided
```

#### Helper Functions:

##### Standard Revenue Split
```typescript
createStandardRevenueSplit()
// Returns standard 10/5/85 split for all operations
// Platform: 10%, Ecosystem: 5%, Issuer/Verifier: 85%
```

##### Revenue Calculator
```typescript
calculateRevenueDistribution(price, platformShare, ecosystemShare, issuerOrVerifierShare)
// Returns actual dollar amounts for each party
// Example: $10 with 10/5/85 split
// → Platform: $1.00, Ecosystem: $0.50, Issuer: $8.50
```

#### Constants:
```typescript
export const STANDARD_REVENUE_SPLIT = {
  platform: 10,
  ecosystem: 5,
  issuerOrVerifier: 85,
};

export const VALID_CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY", "INR"
];
```

---

### 3. Updated API Layer ✅

**File:** [`src/api/ecosystem.ts`](../src/api/ecosystem.ts)

#### Updated Import
```typescript
import type {
  // ... existing imports
  AddSchemaToEcosystemRequest,
  UpdateSchemaPricingRequest,  // ✅ Added
} from "../types/ecosystem";
```

#### Updated `updateSchemaPricing` Function

**Before:**
```typescript
export const updateSchemaPricing = async (
  ecosystemId: string,
  schemaId: string,
  pricing: {
    issuancePrice?: number;
    verificationPrice?: number;
    issuerRevenueShare?: number;  // ❌ Wrong structure
  }
)
```

**After:**
```typescript
export const updateSchemaPricing = async (
  ecosystemId: string,
  schemaId: string,
  pricing: UpdateSchemaPricingRequest  // ✅ New type
)
```

**Improvements:**
- Uses correct `UpdateSchemaPricingRequest` type
- Added detailed JSDoc documentation
- Added debug logging for requests/responses/errors
- Includes validation reminders in comments

---

## Usage Examples

### Adding a Schema with Pricing

```typescript
import { addSchemaToEcosystem } from '../api/ecosystem';
import { validateAddSchemaRequest, createStandardRevenueSplit } from '../utils/ecosystemValidation';

// Create request with standard split
const request: AddSchemaToEcosystemRequest = {
  schemaLedgerId: 'did:indy:sovrin:123/schema/medical-license/1.0',
  issuancePrice: 10.00,
  verificationPrice: 5.00,
  revocationPrice: 2.00,
  currency: 'USD',
  ...createStandardRevenueSplit(),  // Adds 10/5/85 split
};

// Validate before sending
const validation = validateAddSchemaRequest(request);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  // Show errors to user
  return;
}

if (validation.warnings && validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
  // Optionally show warnings to user
}

// Send request
try {
  const response = await addSchemaToEcosystem(ecosystemId, request);
  console.log('Schema added successfully:', response.data);
} catch (error) {
  console.error('Failed to add schema:', error);
}
```

### Updating Schema Pricing

```typescript
import { updateSchemaPricing } from '../api/ecosystem';
import { validateUpdatePricingRequest } from '../utils/ecosystemValidation';

// Update only prices (revenue shares unchanged)
const updateRequest: UpdateSchemaPricingRequest = {
  issuancePrice: 15.00,
  verificationPrice: 7.50,
};

// Or update issuance revenue split (ALL 3 required)
const customSplitRequest: UpdateSchemaPricingRequest = {
  issuancePlatformShare: 15,
  issuanceEcosystemShare: 10,
  issuanceIssuerShare: 75,  // Total: 100%
};

// Validate
const validation = validateUpdatePricingRequest(updateRequest);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  return;
}

// Update
await updateSchemaPricing(ecosystemId, schemaId, updateRequest);
```

### Calculating Revenue Distribution

```typescript
import { calculateRevenueDistribution } from '../utils/ecosystemValidation';

// For a $10 issuance with 10/5/85 split
const distribution = calculateRevenueDistribution(10.00, 10, 5, 85);

console.log(distribution);
// {
//   total: 10.00,
//   platform: 1.00,
//   ecosystem: 0.50,
//   issuerOrVerifier: 8.50
// }

// Display to user
console.log(`Platform receives: $${distribution.platform.toFixed(2)}`);
console.log(`Ecosystem receives: $${distribution.ecosystem.toFixed(2)}`);
console.log(`Issuer receives: $${distribution.issuerOrVerifier.toFixed(2)}`);
```

---

## Validation Rules Summary

### 1. Pricing Rules
- All prices must be ≥ 0
- Currency must be 3-letter ISO code (e.g., "USD", "EUR")
- Schema ledger ID must be valid DID format (start with "did:")

### 2. Revenue Share Rules
- Each percentage must be 0-100
- For each operation type (issuance/verification/revocation):
  - Platform% + Ecosystem% + Issuer/Verifier% = **exactly 100%**
- When updating, if ANY share for an operation is provided, ALL 3 must be provided

### 3. Standard Split
- Platform: 10%
- Ecosystem: 5%
- Issuer/Verifier: 85%

---

## What Still Needs to Be Done (Priority 2 & 3)

### Priority 2: UI Components (Estimated 4-6 hours)

These components need major updates to support the new pricing model:

#### 1. AddSchemaToEcosystemModal.tsx
**Current:** Likely has governance level and usage policy fields
**Needs:**
- 3 pricing input fields (issuance, verification, revocation)
- Currency dropdown
- 9 revenue share percentage inputs (3 per operation)
- Real-time validation showing totals
- Visual indicators (pie charts or progress bars)
- Default to standard 10/5/85 split with option to customize
- Error messages for invalid splits

**Example UI:**
```
┌─ Add Schema to Ecosystem ──────────────────────┐
│                                                 │
│ Schema Ledger ID *                              │
│ ┌────────────────────────────────────────────┐ │
│ │ did:indy:sovrin:...                        │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ ──── Pricing Configuration ────                │
│                                                 │
│ Issuance Price *     Verification Price *      │
│ ┌──────┐ USD       ┌──────┐ USD               │
│ │ 10.00│            │  5.00│                   │
│ └──────┘            └──────┘                   │
│                                                 │
│ Revocation Price *   Currency *                │
│ ┌──────┐ USD       ┌────────┐                 │
│ │  2.00│            │  USD ▼ │                 │
│ └──────┘            └────────┘                 │
│                                                 │
│ ──── Revenue Sharing ────                      │
│                                                 │
│ Use Standard Split (10/5/85)  [✓]              │
│                                                 │
│ Issuance Revenue Split                         │
│ Platform   Ecosystem   Issuer       Total      │
│ ┌──┐ %    ┌──┐ %      ┌──┐ %        ┌────┐   │
│ │10│       │ 5│        │85│          │100%│✓  │
│ └──┘       └──┘        └──┘          └────┘   │
│ ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (visual)   │
│                                                 │
│ [Similar for Verification and Revocation]      │
│                                                 │
│           [Cancel]  [Add Schema]               │
└─────────────────────────────────────────────────┘
```

#### 2. EcosystemSchemaManager.tsx
**Needs:**
- Display pricing table with columns for all 3 operation prices
- Display revenue splits (perhaps collapsible sections)
- "Edit Pricing" button opening update modal
- Calculate and show example revenue distribution

#### 3. PricingManager.tsx
**Needs:**
- Complete rewrite likely required
- Display comprehensive pricing across all schemas
- Allow bulk pricing updates
- Show revenue projections

### Priority 3: Testing (Estimated 2-3 hours)

1. Unit tests for validation functions
2. Integration tests with mock API
3. E2E tests for add/update flows
4. Edge case testing (floating point precision, boundary values)

---

## Breaking Changes

### Type Changes
- `EcosystemSchema.schemaId` → `schemaLedgerId`
- `AddSchemaToEcosystemRequest` completely rewritten
- `UpdateSchemaPricingRequest` signature changed
- `GovernanceLevel` and `EcosystemSchemaStatus` deprecated

### Components Affected
Any component using these types will need updates:
- AddSchemaToEcosystemModal
- EcosystemSchemaManager
- PricingManager
- SchemaManager (if used)
- Any schema list/display components

---

## Migration Checklist

For teams upgrading to this version:

- [ ] Update type imports from `src/types/ecosystem`
- [ ] Replace `schemaId` with `schemaLedgerId` in all schema-related code
- [ ] Remove references to `governanceLevel` and `usagePolicy`
- [ ] Add pricing and revenue share fields to schema add/update flows
- [ ] Import and use validation functions before API calls
- [ ] Update UI components to display pricing information
- [ ] Add revenue share input controls to forms
- [ ] Test with backend API to ensure compatibility
- [ ] Update documentation and user guides

---

## API Compatibility

### Endpoint Changes
✅ **No endpoint URLs changed** - only request/response body structures

### Backward Compatibility
⚠️ **Partially backward compatible:**
- Old code using deprecated fields will cause TypeScript errors
- Runtime errors will occur when sending old request format to backend
- Response parsing will fail if expecting old structure

**Recommendation:** Complete all Priority 2 UI updates before deploying to production.

---

## Resources

- [Official API Guide](../../../confirmd-platform/docs/ECOSYSTEM_FRONTEND_GUIDE.md)
- [Implementation Review](./ECOSYSTEM_IMPLEMENTATION_REVIEW.md)
- [Type Definitions](../src/types/ecosystem.ts)
- [API Layer](../src/api/ecosystem.ts)
- [Validation Utilities](../src/utils/ecosystemValidation.ts)

---

## Version History

- **v1.0.0** (Nov 5, 2025) - Priority 1 complete: Type definitions, API layer, validation utilities
- **Future v1.1.0** - UI component updates (Priority 2)
- **Future v1.2.0** - Testing and edge case handling (Priority 3)

---

**Status:** Ready for Priority 2 (UI Components) implementation
**Next Steps:** Update AddSchemaToEcosystemModal component with pricing form
