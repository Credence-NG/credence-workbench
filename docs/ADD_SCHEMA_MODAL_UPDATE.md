# AddSchemaToEcosystemModal - Pricing Model Update
**Date:** November 5, 2025
**Status:** ✅ Complete
**Component:** [AddSchemaToEcosystemModal.tsx](../src/components/Ecosystem/AddSchemaToEcosystemModal.tsx)

## Overview

Complete rewrite of the Add Schema to Ecosystem modal to support the new three-way revenue sharing pricing model per the API Guide v1.1.0.

---

## What Changed

### Before (Old Governance Model):
```typescript
interface FormValues {
    schemaId: string;
    governanceLevel: GovernanceLevel; // MANDATORY, RECOMMENDED, OPTIONAL
    usagePolicy: string;
}
```

**UI Flow:**
1. Select schema
2. Choose governance level (dropdown)
3. Enter optional usage policy (textarea)

### After (New Pricing Model):
```typescript
interface FormValues extends AddSchemaToEcosystemRequest {
    schemaLedgerId: string;

    // Pricing
    issuancePrice: number;
    verificationPrice: number;
    revocationPrice: number;
    currency: string;

    // 9 revenue share percentages
    issuancePlatformShare: number;
    issuanceEcosystemShare: number;
    issuanceIssuerShare: number;
    verificationPlatformShare: number;
    verificationEcosystemShare: number;
    verificationVerifierShare: number;
    revocationPlatformShare: number;
    revocationEcosystemShare: number;
    revocationIssuerShare: number;

    useStandardSplit: boolean; // UI helper
}
```

**New UI Flow:**
1. Select schema
2. Configure pricing (4 fields)
3. Configure revenue sharing (9 percentage fields)

---

## Key Features Implemented

### 1. **Three-Step Wizard Interface**

#### Step 1: Select Schema
- Schema search and filtering
- Pagination (5 schemas per page)
- Schema type toggle (Indy/W3C)
- Visual selection indicator
- Displays schema attributes count

#### Step 2: Configure Pricing
- **4 input fields:**
  - Issuance Price ($)
  - Verification Price ($)
  - Revocation Price ($)
  - Currency (dropdown with 8 currencies)
- Validation: All prices must be ≥ 0
- Selected schema info displayed above

#### Step 3: Revenue Sharing Configuration
- **"Use Standard Split" checkbox** (10/5/85)
  - When checked: All 9 percentage fields disabled and set to standard
  - When unchecked: All fields editable for custom splits

- **Three revenue split sections:**
  - Issuance: Platform/Ecosystem/Issuer
  - Verification: Platform/Ecosystem/Verifier
  - Revocation: Platform/Ecosystem/Issuer

- **Visual Total Indicators:**
  - Green background: Total = 100% ✓
  - Red background: Total ≠ 100% ✗
  - Real-time calculation display

- **Live Revenue Examples:**
  - Shows actual dollar amounts for each party
  - Updates automatically as prices/percentages change
  - Example: "For a $10.00 issuance → Platform: $1.00, Ecosystem: $0.50, Issuer: $8.50"

### 2. **Comprehensive Validation**

#### Client-Side (Yup + Custom)
```typescript
validationSchema = yup.object().shape({
    schemaLedgerId: yup.string()
        .required()
        .matches(/^did:/, 'Must be valid DID'),
    issuancePrice: yup.number().min(0).required(),
    verificationPrice: yup.number().min(0).required(),
    revocationPrice: yup.number().min(0).required(),
    currency: yup.string().length(3).uppercase().required(),
    // ... all 9 revenue shares (0-100)
});
```

#### Pre-Submit Validation
Uses `validateAddSchemaRequest()` from [ecosystemValidation.ts](../src/utils/ecosystemValidation.ts):
- Validates each operation totals exactly 100%
- Checks DID format
- Validates ISO currency code
- Returns errors array (blocks submission)
- Returns warnings array (displays but allows submission)

### 3. **Enhanced UX Features**

#### Visual Feedback
- **Color-coded total indicators:**
  ```
  Green border + green background = 100% ✓
  Red border + red background = ≠ 100% ✗
  ```

- **Disabled state styling:**
  - When "Use Standard Split" checked, all percentage inputs grayed out
  - Prevents accidental modifications

- **Real-time calculations:**
  - Dollar amounts update on every keystroke
  - No need to submit to see revenue distribution

#### Warnings System
- Non-blocking warnings displayed in yellow alert box
- Example: "Issuance split differs from standard (10/5/85)"
- Allows proceeding but informs user of deviation

#### Error Handling
- Red error messages below each field
- Global error alert at top of form
- Specific validation errors from backend displayed
- Comprehensive console logging for debugging

### 4. **Default Values**

The form initializes with sensible defaults:
```typescript
initialFormData = {
    schemaLedgerId: '',
    issuancePrice: 10.00,        // Default pricing
    verificationPrice: 5.00,
    revocationPrice: 2.00,
    currency: 'USD',
    useStandardSplit: true,      // Standard split enabled by default
    ...createStandardRevenueSplit(), // 10/5/85 for all operations
}
```

Users can immediately submit with standard configuration or customize as needed.

---

## Technical Implementation

### State Management
```typescript
const [loading, setLoading] = useState<boolean>(false);
const [loadingSchemas, setLoadingSchemas] = useState<boolean>(false);
const [errorMsg, setErrorMsg] = useState<string | null>(null);
const [schemas, setSchemas] = useState<Schema[]>([]);
const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
const [searchText, setSearchText] = useState('');
const [schemaType, setSchemaType] = useState<'indy' | 'w3c'>('indy');
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
```

### Form Management
Uses **Formik** (following CLAUDE.md best practices):
- Prevents focus loss issues in modals
- Built-in validation integration
- Easy form state management
- `enableReinitialize` for dynamic initial values

### Key Functions

#### `handleStandardSplitToggle(checked, setFieldValue)`
Toggles between standard and custom splits:
```typescript
if (checked) {
    const standardSplit = createStandardRevenueSplit();
    Object.entries(standardSplit).forEach(([key, value]) => {
        setFieldValue(key, value);
    });
}
```

#### `calculateShareTotal(platform, ecosystem, issuerOrVerifier)`
Real-time calculation for visual indicators:
```typescript
return platform + ecosystem + issuerOrVerifier;
// Used to determine green/red styling
```

#### `handleSubmit(values, actions)`
1. Removes UI helper field (`useStandardSplit`)
2. Validates using `validateAddSchemaRequest()`
3. Blocks submission if errors
4. Shows warnings if any (but allows proceed)
5. Submits to backend API
6. Handles success/error responses
7. Closes modal and refreshes list on success

---

## API Integration

### Request Sent to Backend
```typescript
POST /ecosystem/{ecosystemId}/schemas

Body:
{
  "schemaLedgerId": "did:indy:sovrin:123/schema/medical/1.0",
  "issuancePrice": 10.00,
  "verificationPrice": 5.00,
  "revocationPrice": 2.00,
  "currency": "USD",
  "issuancePlatformShare": 10,
  "issuanceEcosystemShare": 5,
  "issuanceIssuerShare": 85,
  "verificationPlatformShare": 10,
  "verificationEcosystemShare": 5,
  "verificationVerifierShare": 85,
  "revocationPlatformShare": 10,
  "revocationEcosystemShare": 5,
  "revocationIssuerShare": 85
}
```

### Success Response Handling
```typescript
if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
    props.setMessage('Schema added to ecosystem successfully!');
    props.setOpenModal(false);
    if (props.onSchemaAdded) {
        props.onSchemaAdded(); // Triggers parent to refresh schema list
    }
}
```

---

## UI Screenshots (Mockup)

### Step 1: Select Schema
```
┌─ Add Schema to Ecosystem with Pricing ────────────────────────────┐
│                                                                     │
│ 1. Select Schema from Platform                                     │
│ Browse and select a schema to add with pricing configuration.      │
│                                                                     │
│ ┌─────────────────────────┐  ┌──────────────┐                    │
│ │ 🔍 Search schemas...     │  │ Indy Schemas ▼│                    │
│ └─────────────────────────┘  └──────────────┘                    │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐│
│ │ Schema Name    │ Version │ Organization │ Attributes │ Action ││
│ ├───────────────────────────────────────────────────────────────┤│
│ │ Medical License│  1.0    │ Hospital ABC │  8 attr   │[Select]││
│ │ Driver License │  2.1    │ DMV Dept     │  12 attr  │[Select]││
│ │ Student ID     │  1.5    │ University   │  6 attr   │[Select]││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                     │
│                         [ 1 ] 2  3  4  5  >                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 2 & 3: After Selection
```
┌─ Add Schema to Ecosystem with Pricing ────────────────────────────┐
│                                                                     │
│ 2. Configure Pricing                                               │
│                                                                     │
│ Selected Schema: Medical License v1.0                              │
│ did:indy:sovrin:123/schema/medical-license/1.0                    │
│                                                                     │
│ Issuance Price * Verification Price * Revocation Price * Currency*│
│ ┌──────┐         ┌──────┐            ┌──────┐            ┌─────┐ │
│ │10.00 │ USD     │ 5.00 │ USD        │ 2.00 │ USD        │USD ▼│ │
│ └──────┘         └──────┘            └──────┘            └─────┘ │
│                                                                     │
│ ──────────────────────────────────────────────────────────────────│
│                                                                     │
│ 3. Revenue Sharing Configuration          ☑ Use Standard (10/5/85)│
│                                                                     │
│ Configure revenue distribution. Each operation must total 100%.    │
│                                                                     │
│ Issuance Revenue Split                                             │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Platform %  Ecosystem %  Issuer %      Total                 │ │
│ │ ┌───┐       ┌───┐        ┌───┐        ┌──────────┐          │ │
│ │ │10 │ %     │ 5 │ %      │85 │ %      │ 100% ✓   │ (green)  │ │
│ │ └───┘       └───┘        └───┘        └──────────┘          │ │
│ │ Example: $10.00 issuance → Platform: $1.00, Ecosystem: $0.50,│ │
│ │          Issuer: $8.50                                        │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Verification Revenue Split                                         │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Platform %  Ecosystem %  Verifier %    Total                 │ │
│ │ ┌───┐       ┌───┐        ┌───┐        ┌──────────┐          │ │
│ │ │10 │ %     │ 5 │ %      │85 │ %      │ 100% ✓   │ (green)  │ │
│ │ └───┘       └───┘        └───┘        └──────────┘          │ │
│ │ Example: $5.00 verification → Platform: $0.50, Ecosystem:    │ │
│ │          $0.25, Verifier: $4.25                               │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Revocation Revenue Split                                           │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Platform %  Ecosystem %  Issuer %      Total                 │ │
│ │ ┌───┐       ┌───┐        ┌───┐        ┌──────────┐          │ │
│ │ │10 │ %     │ 5 │ %      │85 │ %      │ 100% ✓   │ (green)  │ │
│ │ └───┘       └───┘        └───┘        └──────────┘          │ │
│ │ Example: $2.00 revocation → Platform: $0.20, Ecosystem:      │ │
│ │          $0.10, Issuer: $1.70                                 │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│                         [Cancel]  [Add Schema with Pricing]        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Dependencies Used

```typescript
// Flowbite React components
import { Button, Label, Modal, Table, Badge, Pagination, Select, TextInput } from 'flowbite-react';

// Formik for form management (per CLAUDE.md guidance)
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';

// Yup for validation
import * as yup from 'yup';

// Our validation utilities
import {
    validateAddSchemaRequest,
    createStandardRevenueSplit,
    STANDARD_REVENUE_SPLIT,
    VALID_CURRENCIES,
} from '../../utils/ecosystemValidation';

// React Icons
import { HiPlus, HiDocumentText, HiInformationCircle } from 'react-icons/hi';
```

---

## Testing Checklist

### Functional Testing
- [ ] Schema list loads correctly
- [ ] Search filters schemas
- [ ] Pagination works
- [ ] Schema type filter (Indy/W3C) works
- [ ] Schema selection highlights row
- [ ] Pricing fields accept decimal numbers
- [ ] Currency dropdown shows all options
- [ ] Standard split checkbox enables/disables percentage fields
- [ ] Standard split sets correct values (10/5/85)
- [ ] Total indicators show green when = 100%
- [ ] Total indicators show red when ≠ 100%
- [ ] Example calculations display correctly
- [ ] Form validation prevents invalid submission
- [ ] Success message appears on successful addition
- [ ] Modal closes after success
- [ ] Parent list refreshes after success
- [ ] Error messages display correctly

### Edge Cases
- [ ] All percentages = 0 (total 0%, should show red)
- [ ] Negative prices (should be blocked by validation)
- [ ] Percentages > 100 (should be blocked)
- [ ] Non-numeric input in percentage fields
- [ ] Empty required fields
- [ ] Custom split totaling 99% or 101% (should block)
- [ ] Backend validation errors displayed properly

### UI/UX Testing
- [ ] Modal scrollable on smaller screens
- [ ] Form readable on mobile (responsive)
- [ ] Dark mode colors work correctly
- [ ] Loading spinner appears during submission
- [ ] Submit button disabled while loading
- [ ] Submit button disabled when no schema selected
- [ ] Focus management works correctly (no focus loss)
- [ ] Tab order is logical

### Integration Testing
- [ ] API request body matches expected format
- [ ] Success response handled correctly
- [ ] Error responses displayed properly
- [ ] Network errors handled gracefully
- [ ] 400 validation errors from backend shown
- [ ] 500 server errors shown with friendly message

---

## Migration Notes

### For Developers
1. **Old governance fields removed:**
   - `governanceLevel` enum usage deleted
   - `usagePolicy` textarea removed
   - Any code referencing these fields needs update

2. **New pricing fields added:**
   - All components consuming `AddSchemaToEcosystemRequest` must provide 13 new fields
   - Validation required for revenue share totals

3. **Modal size increased:**
   - Changed from `size="4xl"` to `size="6xl"`
   - Accommodate larger form with pricing configuration

### For Users
1. **New workflow:**
   - Users must now configure pricing when adding schemas
   - Standard 10/5/85 split available as default
   - Custom splits allowed for flexibility

2. **Visual feedback:**
   - Real-time validation prevents errors
   - Live revenue calculations show exact distribution

---

## Known Issues / Limitations

1. **No schema pricing edit after creation:**
   - Need separate update modal/flow
   - Next: Implement EcosystemSchemaManager with edit capability

2. **Currency list hardcoded:**
   - Currently 8 currencies in VALID_CURRENCIES constant
   - Could be expanded to full ISO 4217 list

3. **No pricing templates:**
   - Only standard split available as preset
   - Could add ability to save custom templates

4. **No bulk operations:**
   - Can only add one schema at a time
   - Could add multi-select for batch additions

---

## Next Steps

1. **Update EcosystemSchemaManager** to display pricing
2. **Create Update Pricing Modal** for editing existing schema pricing
3. **Add pricing visualization** (charts/graphs)
4. **Implement pricing templates** feature
5. **Add pricing history/audit log**

---

## Files Modified

- ✅ [AddSchemaToEcosystemModal.tsx](../src/components/Ecosystem/AddSchemaToEcosystemModal.tsx) - Complete rewrite (772 lines)

## Files Referenced

- [ecosystem.ts](../src/types/ecosystem.ts) - Type definitions
- [ecosystemValidation.ts](../src/utils/ecosystemValidation.ts) - Validation utilities
- [ecosystem.ts](../src/api/ecosystem.ts) - API integration

---

**Status:** ✅ Complete and ready for testing
**Next Priority:** Update EcosystemSchemaManager to display pricing information
