# Ecosystem Schema Edit Implementation

**Date**: 2025-11-10
**Feature**: Edit Schema Pricing in Ecosystem Dashboard
**Status**: ✅ Completed and Deployed

---

## Overview

Implemented the ability to edit schema pricing and revenue split configurations for schemas already added to an ecosystem. This feature allows ecosystem administrators to modify pricing models without removing and re-adding schemas.

---

## Features Added

### 1. Edit Button in Schema List
- **Location**: Actions column in EcosystemSchemaManager.tsx
- **Icon**: Blue pencil icon (HiPencil)
- **Behavior**: Opens edit modal with pre-populated data
- **Permission**: Only visible to users with `canManageSchemas` permission

### 2. Edit Modal Functionality
- **Component**: AddSchemaToEcosystemModal.tsx (enhanced to support edit mode)
- **Features**:
  - Read-only schema display (schema cannot be changed)
  - Pre-populated pricing fields from existing configuration
  - Pre-populated revenue split percentages
  - Separate API endpoint for updates (`updateSchemaPricing`)
  - Validation with real-time warnings
  - Different submit button text/icon in edit mode

### 3. Field Name Correction
- **Issue**: Verification revenue split incorrectly named `verificationVerifierShare`
- **Correction**: Changed to `verificationIssuerShare` (matches business logic)
- **Reason**: All three revenue operations (Issuance, Verification, Revocation) split between Platform/Ecosystem/**Issuer**

---

## Implementation Details

### Files Modified

#### 1. `/src/components/Ecosystem/EcosystemSchemaManager.tsx`

**State Management**:
```typescript
const [editingSchema, setEditingSchema] = useState<EcosystemSchema | null>(null);
const [showEditModal, setShowEditModal] = useState(false);
```

**Edit Button** (line 318):
```typescript
<Button
    size="xs"
    color="info"
    onClick={() => {
        setEditingSchema(ecosystemSchema);
        setShowEditModal(true);
    }}
    title="Edit pricing"
>
    <HiPencil className="h-4 w-4" />
</Button>
```

**Edit Modal** (line 521):
```typescript
{showEditModal && canManageSchemas && editingSchema && (
    <AddSchemaToEcosystemModal
        ecosystemId={ecosystemId}
        openModal={showEditModal}
        setOpenModal={(flag) => {
            setShowEditModal(flag);
            if (!flag) setEditingSchema(null);
        }}
        onSchemaAdded={handleSchemaAdded}
        setMessage={setSuccess}
        editingSchema={editingSchema}
    />
)}
```

**Label Fix** (line 412):
```typescript
<div className="text-gray-600 dark:text-gray-400">
    Issuer ({ecosystemSchema.verificationIssuerShare}%)
</div>
```

---

#### 2. `/src/components/Ecosystem/AddSchemaToEcosystemModal.tsx`

**Props Interface** (line 32):
```typescript
interface AddSchemaToEcosystemModalProps {
    ecosystemId: string;
    openModal: boolean;
    setOpenModal: (flag: boolean) => void;
    setMessage: (message: string) => void;
    onSchemaAdded?: () => void;
    editingSchema?: EcosystemSchema | null; // NEW: For edit mode
}
```

**Edit Mode Detection** (line 59):
```typescript
const { editingSchema } = props;
const isEditMode = !!editingSchema;
```

**Initial Form Data Function** (line 75):
```typescript
const getInitialFormData = (): FormValues => {
    if (isEditMode && editingSchema) {
        return {
            schemaLedgerId: editingSchema.schemaLedgerId,
            issuancePrice: Number(editingSchema.issuancePrice),
            verificationPrice: Number(editingSchema.verificationPrice),
            revocationPrice: Number(editingSchema.revocationPrice),
            currency: editingSchema.currency,
            useStandardSplit: false,
            issuancePlatformShare: Number(editingSchema.issuancePlatformShare),
            issuanceEcosystemShare: Number(editingSchema.issuanceEcosystemShare),
            issuanceIssuerShare: Number(editingSchema.issuanceIssuerShare),
            verificationPlatformShare: Number(editingSchema.verificationPlatformShare),
            verificationEcosystemShare: Number(editingSchema.verificationEcosystemShare),
            verificationIssuerShare: Number(editingSchema.verificationIssuerShare),
            revocationPlatformShare: Number(editingSchema.revocationPlatformShare),
            revocationEcosystemShare: Number(editingSchema.revocationEcosystemShare),
            revocationIssuerShare: Number(editingSchema.revocationIssuerShare),
        };
    }
    return {
        schemaLedgerId: '',
        issuancePrice: 10.00,
        verificationPrice: 5.00,
        revocationPrice: 2.00,
        currency: 'USD',
        useStandardSplit: true,
        ...createStandardRevenueSplit(),
    };
};
```

**Form Reinitialization** (line 108):
```typescript
// Update form data when editingSchema changes
useEffect(() => {
    setInitialFormData(getInitialFormData());
}, [editingSchema]);
```

**Submit Handler** (line 267):
```typescript
if (isEditMode && editingSchema) {
    // Update existing schema pricing
    const updatePayload: UpdateSchemaPricingRequest = {
        issuancePrice: requestData.issuancePrice,
        verificationPrice: requestData.verificationPrice,
        revocationPrice: requestData.revocationPrice,
        currency: requestData.currency,
        issuancePlatformShare: requestData.issuancePlatformShare,
        issuanceEcosystemShare: requestData.issuanceEcosystemShare,
        issuanceIssuerShare: requestData.issuanceIssuerShare,
        verificationPlatformShare: requestData.verificationPlatformShare,
        verificationEcosystemShare: requestData.verificationEcosystemShare,
        verificationIssuerShare: requestData.verificationIssuerShare,
        revocationPlatformShare: requestData.revocationPlatformShare,
        revocationEcosystemShare: requestData.revocationEcosystemShare,
        revocationIssuerShare: requestData.revocationIssuerShare,
    };
    response = await updateSchemaPricing(
        props.ecosystemId,
        editingSchema.id,
        updatePayload
    ) as AxiosResponse;
} else {
    // Add new schema
    response = await addSchemaToEcosystem(
        props.ecosystemId,
        requestData
    ) as AxiosResponse;
}
```

**Read-Only Schema Display** (line 371):
```typescript
{isEditMode ? (
    <div>
        <h3 className="text-lg font-semibold mb-2">
            1. Selected Schema
        </h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <HiDocumentText className="h-6 w-6 text-primary-600" />
                <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {(() => {
                            const parts = editingSchema?.schemaLedgerId?.split(':');
                            return parts && parts.length >= 3 ? parts[2] : 'Schema';
                        })()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Version: {(() => {
                            const parts = editingSchema?.schemaLedgerId?.split(':');
                            return parts && parts.length >= 4 ? parts[3] : 'N/A';
                        })()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                        {editingSchema?.schemaLedgerId?.substring(0, 50)}...
                    </div>
                </div>
            </div>
        </div>
    </div>
) : (
    // Original schema selection dropdown
)}
```

**Submit Button** (line 855):
```typescript
<Button
    type="submit"
    disabled={loading || (!selectedSchema && !isEditMode)}
>
    {loading ? (
        <>
            <CustomSpinner />
            <span className="ml-2">{isEditMode ? 'Updating...' : 'Adding Schema...'}</span>
        </>
    ) : isEditMode ? (
        <>
            <HiPencil className="mr-2 h-5 w-5" />
            Update Pricing
        </>
    ) : (
        <>
            <HiPlus className="mr-2 h-5 w-5" />
            Add Schema with Pricing
        </>
    )}
</Button>
```

**Label Fix** (line 743):
```typescript
<Label value="Issuer %" />
```

---

#### 3. `/src/types/ecosystem.ts`

**Field Name Changes**:
```typescript
// AddSchemaToEcosystemRequest interface (line 337)
verificationIssuerShare: number;  // Changed from verificationVerifierShare

// UpdateSchemaPricingRequest interface (line 747)
verificationIssuerShare?: number;

// EcosystemSchema interface (line 283)
verificationIssuerShare: number;  // Issuer's percentage
```

---

#### 4. `/src/utils/ecosystemValidation.ts`

**Global Replacement**: All 5 occurrences of `verificationVerifierShare` changed to `verificationIssuerShare`

---

## Bug Fixes

### Issue 1: Missing Icon Import
**Error**: `ReferenceError: HiPencil is not defined`
**Location**: AddSchemaToEcosystemModal.tsx line 866
**Fix**: Added HiPencil to imports:
```typescript
import { HiPlus, HiDocumentText, HiInformationCircle, HiPencil } from 'react-icons/hi';
```

### Issue 2: Submit Button Disabled in Edit Mode
**Symptom**: No "Save" button visible after making changes
**Cause**: Button disabled condition was `!selectedSchema`, always true in edit mode
**Fix**: Changed to `(!selectedSchema && !isEditMode)`

### Issue 3: NaN% Display in Edit Mode
**Symptom**: Form fields showing "NaN%" when edit modal opens
**Cause**: `initialFormData` state variable only set once on mount, didn't update when `editingSchema` prop changed
**Fix**: Added useEffect to update form data when editingSchema changes:
```typescript
useEffect(() => {
    setInitialFormData(getInitialFormData());
}, [editingSchema]);
```

**Why it works**:
1. Formik already has `enableReinitialize={true}` set
2. When `editingSchema` changes, useEffect triggers
3. `setInitialFormData(getInitialFormData())` recalculates form values
4. Formik detects `initialValues` change and updates form fields
5. All pricing values are properly converted from strings to numbers

---

## Business Logic Clarification

### Revenue Split Model

All three revenue operations share the same revenue split model:

| Operation | Platform Share | Ecosystem Share | Issuer Share |
|-----------|----------------|-----------------|--------------|
| **Issuance** | 10% | 5% | 85% |
| **Verification** | 10% | 5% | 85% |
| **Revocation** | 10% | 5% | 85% |

**Important**: The "Verifier" does NOT receive any revenue share. Revenue is split between:
1. **Platform**: The technology platform (e.g., 10%)
2. **Ecosystem**: The ecosystem managing the schema (e.g., 5%)
3. **Issuer**: The organization that issued the credential (e.g., 85%)

This applies to all three operations including verification - even though a Verifier is involved in the verification process, the revenue still goes to the Issuer.

---

## Testing Results

### Local Development (`localhost:3000`)
✅ Edit button appears in Actions column
✅ Clicking edit opens modal with correct schema
✅ Schema name and version displayed correctly (parsed from schemaLedgerId)
✅ All pricing fields pre-populated with existing values
✅ All revenue split percentages pre-populated correctly
✅ No NaN% display issues
✅ Submit button displays "Update Pricing" with pencil icon
✅ Form validation works (100% total check)
✅ Update API call succeeds
✅ Schema list refreshes after update
✅ Success message displays
✅ All labels show "Issuer" (not "Verifier")

### Docker Environment
✅ Container builds successfully
✅ Container status: Healthy
✅ Application accessible at http://localhost:3000
✅ Edit functionality works in Docker environment

---

## User Experience Flow

### Editing a Schema

1. **Navigate** to ecosystem dashboard → Schemas tab
2. **Locate** the schema you want to edit in the list
3. **Click** the blue pencil icon in the Actions column
4. **Modal opens** with:
   - Read-only schema information (name, version, ledger ID)
   - Pre-populated pricing fields
   - Pre-populated revenue split percentages
5. **Modify** pricing and/or revenue splits
6. **Review** validation warnings (must total 100%)
7. **Click** "Update Pricing" button
8. **Success** - Schema list refreshes with updated data

---

## API Integration

### Update Endpoint
```typescript
// PUT /api/ecosystems/{ecosystemId}/schemas/{schemaId}/pricing
const updateSchemaPricing = async (
    ecosystemId: string,
    schemaId: string,
    data: UpdateSchemaPricingRequest
): Promise<AxiosResponse>
```

### Request Payload
```typescript
interface UpdateSchemaPricingRequest {
    issuancePrice?: number;
    verificationPrice?: number;
    revocationPrice?: number;
    currency?: string;
    issuancePlatformShare?: number;
    issuanceEcosystemShare?: number;
    issuanceIssuerShare?: number;
    verificationPlatformShare?: number;
    verificationEcosystemShare?: number;
    verificationIssuerShare?: number;  // Corrected field name
    revocationPlatformShare?: number;
    revocationEcosystemShare?: number;
    revocationIssuerShare?: number;
}
```

---

## Key Learnings

### 1. Formik State Reinitialization
When using Formik with dynamic initial values from props:
- Set `enableReinitialize={true}` on the Formik component
- Use `useEffect` to update state when prop changes
- Ensure `initialValues` reference changes (triggers Formik reinitialization)

**Pattern**:
```typescript
const [initialFormData, setInitialFormData] = useState<FormValues>(getInitialFormData());

useEffect(() => {
    setInitialFormData(getInitialFormData());
}, [propThatChanges]);

<Formik
    initialValues={initialFormData}
    enableReinitialize
    ...
/>
```

### 2. String to Number Conversion
Backend may return numbers as strings. Always convert explicitly:
```typescript
Number(editingSchema.issuancePrice)  // Converts "10" to 10
```

### 3. Modal Edit Pattern
For edit functionality in modals:
- Accept optional `editingItem` prop
- Use `isEditMode = !!editingItem` boolean
- Conditionally render UI elements
- Switch submit handler logic based on mode
- Update button text/icons based on mode

### 4. Schema Ledger ID Parsing
Indy schema ledger IDs follow format: `{did}:2:{name}:{version}`
```typescript
const parts = schemaLedgerId.split(':');
const schemaName = parts[2];
const schemaVersion = parts[3];
```

---

## Related Documentation

- [Ecosystem Schema Display Fixes](./ECOSYSTEM_SCHEMA_DISPLAY_FIXES.md)
- [Ecosystem Implementation Review](./ECOSYSTEM_IMPLEMENTATION_REVIEW.md)
- [Backend API Alignment Update](./BACKEND_API_ALIGNMENT_UPDATE.md)

---

## Deployment Status

| Environment | Status | Version | Health |
|------------|--------|---------|--------|
| Local Dev | ✅ Working | Latest | Healthy |
| Docker | ✅ Deployed | Latest | Healthy |
| Staging | 🔄 Pending | - | - |
| Production | 🔄 Pending | - | - |

---

## Commands Used

```bash
# Local development
pnpm dev

# Docker rebuild and deploy
docker stop confirmd-studio-app
docker rm confirmd-studio-app
docker compose up --build -d app

# Check container status
docker ps --filter name=confirmd-studio-app

# View container logs
docker logs confirmd-studio-app --tail 100
```

---

**Implemented by**: Claude Code Assistant
**Verified by**: User (itopa)
**Documentation**: Complete
**Status**: ✅ Production Ready
