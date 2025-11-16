# Ecosystem Components Quick Reference

## Component Inventory

### Phase 4A: Core Components (5)

| Component | File | Lines | Purpose | Permissions |
|-----------|------|-------|---------|-------------|
| EditEcosystemModal | `EditEcosystemModal.tsx` | 380 | Edit ecosystem details | `canEditEcosystem` |
| EcosystemDashboard | `EcosystemDashboard.tsx` | 412 | Overview dashboard | `canEditEcosystem`, `canViewAnalytics`, `canViewHealth` |

### Phase 4B: Management Components (4)

| Component | File | Lines | Purpose | Permissions |
|-----------|------|-------|---------|-------------|
| OrganizationList | `OrganizationList.tsx` | 285 | List member organizations | `canRemoveOrganizations` |
| InviteOrgModal | `InviteOrgModal.tsx` | 265 | Invite organizations | `canInviteOrganizations` |
| PricingManager | `PricingManager.tsx` | 435 | Manage credential pricing | `canSetPricing`, `canViewPricing` |
| TransactionList | `TransactionList.tsx` | 320 | View transaction history | `canViewTransactions` |

### Phase 4C: Financial Components (2)

| Component | File | Lines | Purpose | Permissions |
|-----------|------|-------|---------|-------------|
| SettlementList | `SettlementList.tsx` | 335 | Manage settlements | `canProcessSettlements`, `canApproveSettlements`, `canViewSettlements` |
| ProcessSettlementModal | `ProcessSettlementModal.tsx` | 310 | Process/approve settlements | `canProcessSettlements`, `canApproveSettlements` |

### Phase 4D: Analytics Components (2)

| Component | File | Lines | Purpose | Permissions |
|-----------|------|-------|---------|-------------|
| AnalyticsCharts | `AnalyticsCharts.tsx` | 365 | Visualize analytics | `canViewAnalytics` |
| HealthIndicator | `HealthIndicator.tsx` | 340 | Display health metrics | `canViewHealth` |

### Phase 4E: Onboarding Components (4)

| Component | File | Lines | Purpose | Permissions |
|-----------|------|-------|---------|-------------|
| ApplicationList | `ApplicationList.tsx` | 305 | View applications | `canReviewApplications`, `canViewApplications` |
| ApplicationReviewModal | `ApplicationReviewModal.tsx` | 285 | Review applications | `canReviewApplications` |
| ApplyToEcosystemForm | `ApplyToEcosystemForm.tsx` | 330 | Apply to join | `canApplyToEcosystem` |
| EcosystemSettings | `EcosystemSettings.tsx` | 540 | Manage settings | `canManageSettings` |

---

## Component Dependencies

### Required Imports Pattern

```typescript
// Formik (for all form components)
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import * as yup from 'yup';

// Flowbite React
import { Button, Card, Label, Modal, Badge, Table, Pagination, Avatar } from 'flowbite-react';

// API & Types
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import type { Ecosystem } from '../../types/ecosystem';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';

// Custom Components
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { SearchInput } from '../SearchInput';
```

---

## Common Patterns

### 1. Permission Check
```typescript
const [canPerformAction, setCanPerformAction] = useState<boolean>(false);

useEffect(() => {
  const checkPermissions = async () => {
    const permissions = await getEcosystemPermissions();
    setCanPerformAction(permissions.canPerformAction);
  };
  checkPermissions();
}, []);
```

### 2. Data Fetching
```typescript
const fetchData = async () => {
  setLoading(true);
  setErrorMsg(null);

  try {
    const response = await getEcosystemData(ecosystemId);
    const { data } = response as AxiosResponse;

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setData(data?.data);
    } else {
      setErrorMsg(data?.message || 'Failed to fetch data');
    }
  } catch (error) {
    const err = error as Error;
    setErrorMsg(err?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### 3. Formik Form
```typescript
<Formik
  initialValues={initialData}
  validationSchema={yup.object().shape({
    field: yup.string().required('Field is required'),
  })}
  validateOnBlur
  validateOnChange
  enableReinitialize
  onSubmit={handleSubmit}
>
  {(formikHandlers): JSX.Element => (
    <Form onSubmit={formikHandlers.handleSubmit}>
      <Field
        id="field"
        name="field"
        type="text"
        className="bg-gray-50 border..."
      />
      {formikHandlers?.errors?.field && formikHandlers?.touched?.field && (
        <span className="text-red-500 text-xs">
          {formikHandlers?.errors?.field}
        </span>
      )}
    </Form>
  )}
</Formik>
```

### 4. Search Input
```typescript
const [searchText, setSearchText] = useState<string>('');

const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
  setSearchText(event.target.value);
};

<SearchInput onInputChange={handleSearch} value={searchText} />
```

### 5. Pagination
```typescript
const initialPageState = { pageNumber: 1, pageSize: 10, total: 1 };
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => {
    setCurrentPage(page);
    fetchData(page);
  }}
/>
```

---

## Type Reference

### Key Enums

```typescript
enum BusinessModel {
  TRANSACTION_FEE = "transaction_fee",
  SUBSCRIPTION = "subscription",
  HYBRID = "hybrid",
  FREE = "free",
}

enum EcosystemStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

enum MembershipType {
  ISSUER = "issuer",
  VERIFIER = "verifier",
  BOTH = "both",
}

enum ApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}
```

---

## Quick Integration Guide

### 1. Add Component to Page

```astro
---
// src/pages/ecosystem/[id]/index.astro
import EcosystemDashboard from '../../../components/Ecosystem/EcosystemDashboard';
---

<EcosystemDashboard ecosystemId={Astro.params.id} client:load />
```

### 2. Navigate to Component

```typescript
// From any component
window.location.href = `/ecosystem/${ecosystemId}`;
window.location.href = `/ecosystem/${ecosystemId}/settings`;
```

### 3. Use in Modal

```typescript
const [showModal, setShowModal] = useState(false);

<Button onClick={() => setShowModal(true)}>Open Settings</Button>

{showModal && (
  <EditEcosystemModal
    ecosystemId={ecosystemId}
    ecosystemData={ecosystem}
    onClose={() => setShowModal(false)}
    onSuccess={() => {
      setShowModal(false);
      fetchEcosystem();
    }}
  />
)}
```

---

## File Locations

All components are located in:
```
/src/components/Ecosystem/
```

All types are in:
```
/src/types/ecosystem.ts
```

Permission system is in:
```
/src/utils/ecosystemPermissions.ts
```

API functions are in:
```
/src/api/ecosystem.ts
```

---

## Status: ✅ ALL COMPLETE

**17/17 Components** - Ready for integration
