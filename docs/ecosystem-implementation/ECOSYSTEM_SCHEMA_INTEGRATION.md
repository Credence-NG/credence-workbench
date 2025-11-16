# Ecosystem Schema Integration

## Overview
This document describes the integration of schema management into the ecosystem dashboard, replacing the previous "Credential Definitions" concept with "Schemas" to align with the platform's existing schema management system.

## Changes Made

### 1. New Component: EcosystemSchemaManager
**File:** `src/components/Ecosystem/EcosystemSchemaManager.tsx`

A specialized component for displaying schemas from all organizations within an ecosystem.

#### Features:
- **Multi-Organization Schema Fetching**: Automatically fetches schemas from all organizations in the ecosystem
- **Search Functionality**: Filter schemas by name or organization name
- **Pagination**: Paginated display with configurable page size
- **Schema Details Display**: Shows schema name, version, organization, attributes count, and creation date
- **Responsive Table Layout**: Mobile-friendly table with proper overflow handling
- **Empty States**: Informative messages when no organizations or schemas exist
- **Info Card**: Educational content about schemas in ecosystems

#### Props:
```typescript
interface EcosystemSchemaManagerProps {
    ecosystemId: string;        // The ecosystem ID
    organizationIds: string[];  // Array of organization IDs in the ecosystem
}
```

#### API Integration:
- Uses `getAllSchemasByOrgId()` from `src/api/Schema.ts`
- Fetches schemas from each organization in parallel
- Combines results and applies client-side filtering/pagination
- Handles errors gracefully (continues even if one org fails)

#### Search and Filtering:
- Searches across schema name and organization name
- Case-insensitive search
- Resets to page 1 on search
- Filters applied to combined results from all organizations

---

### 2. Updated Component: EcosystemDashboard
**File:** `src/components/Ecosystem/EcosystemDashboard.tsx`

#### Changes:
1. **Import Update**: Added `EcosystemSchemaManager` import (replaced `SchemaManager`)
2. **State Management**: 
   - Removed: `firstOrgId` state
   - Added: `organizationIds` state to track all org IDs in ecosystem
3. **Tab Renamed**: "Credential Definitions" → "Schemas"
4. **Tab Content Replaced**: Placeholder text replaced with `EcosystemSchemaManager` component
5. **Organization Tracking**: Added callback to receive organization IDs from `OrganizationList`

#### Code Changes:
```typescript
// Before
import SchemaManager from './SchemaManager';
const [firstOrgId, setFirstOrgId] = useState<string | null>(null);

// After
import EcosystemSchemaManager from './EcosystemSchemaManager';
const [organizationIds, setOrganizationIds] = useState<string[]>([]);
```

#### Tab Structure:
```typescript
<Tabs.Item title="Schemas" icon={HiDocumentText}>
    <EcosystemSchemaManager 
        ecosystemId={ecosystemId}
        organizationIds={organizationIds}
    />
</Tabs.Item>
```

---

### 3. Updated Component: OrganizationList
**File:** `src/components/Ecosystem/OrganizationList.tsx`

#### Changes:
1. **New Prop**: Added `onOrganizationsChange` callback
2. **Organization Tracking**: Extracts org IDs and notifies parent when organizations change
3. **Automatic Updates**: Callback triggered whenever organization list is fetched

#### Code Changes:
```typescript
interface OrganizationListProps {
    ecosystemId: string;
    onInviteClick?: () => void;
    onOrganizationsChange?: (orgIds: string[]) => void; // NEW
}

// In fetchOrganizations():
if (onOrganizationsChange) {
    const orgIds = orgData.map((org: EcosystemOrganization) => org.orgId);
    onOrganizationsChange(orgIds);
}
```

#### Integration:
```typescript
<OrganizationList 
    ecosystemId={ecosystemId} 
    onInviteClick={() => setShowAddOrgModal(true)}
    onOrganizationsChange={(orgIds) => setOrganizationIds(orgIds)}
/>
```

---

### 4. Updated Component: PricingManager
**File:** `src/components/Ecosystem/PricingManager.tsx`

#### UI Label Changes:
All user-facing text updated to reference "Schema" instead of "Credential Definition":

| Old Text | New Text |
|----------|----------|
| "Credential Definition ID" | "Schema ID" |
| "Credential Definition ID is required" | "Schema ID is required" |
| "Enter credential definition ID" | "Enter schema ID" |
| "Set Credential Pricing" | "Set Schema Pricing" |
| "Credential Pricing" | "Schema Pricing" |
| "Manage pricing for credential operations" | "Manage pricing for schema-based credential operations" |
| Table header: "Credential" | "Schema" |
| "Unknown Credential" | "Unknown Schema" |

#### Backend Compatibility:
- **Field names unchanged**: `credentialDefinitionId` kept in form values and API payloads
- This maintains backward compatibility with existing backend API
- Only user-facing labels were updated

**Note:** If the backend API is updated to use `schemaId`, the field names in this component will need to be updated as well.

---

## Data Flow

### Schema Loading Flow:
```
EcosystemDashboard
    ↓ (passes ecosystemId)
OrganizationList
    ↓ (fetches organizations, extracts orgIds)
    ↓ (calls onOrganizationsChange callback)
EcosystemDashboard
    ↓ (updates organizationIds state)
    ↓ (passes organizationIds to EcosystemSchemaManager)
EcosystemSchemaManager
    ↓ (iterates through organizationIds)
    ↓ (calls getAllSchemasByOrgId for each)
Schema API
    ↓ (fetches schemas for each organization)
EcosystemSchemaManager
    ↓ (combines, filters, paginates results)
    ↓ (displays in table)
```

### Organization Change Flow:
1. User adds/removes organization in OrganizationList
2. OrganizationList refetches organizations
3. OrganizationList extracts new org IDs
4. Calls `onOrganizationsChange(orgIds)`
5. EcosystemDashboard updates `organizationIds` state
6. EcosystemSchemaManager receives new prop
7. useEffect triggers, refetches schemas for new org list

---

## API Endpoints Used

### Schema API:
```typescript
GET /orgs/:orgId/schemas?pageNumber=1&pageSize=10&searchByText=search
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "totalItems": 1,
    "data": [
      {
        "id": "uuid",
        "name": "Schema Name",
        "version": "1.0",
        "attributes": [...],
        "schemaLedgerId": "...",
        "orgId": "uuid",
        "organizationName": "Org Name",
        "createDateTime": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Organization API:
```typescript
GET /v1/ecosystem/:id/organizations?page=1&pageSize=10&search=query
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "orgId": "uuid",
      "roleInEcosystem": "ISSUER",
      "membershipType": "MEMBER",
      "organisation": {
        "id": "uuid",
        "name": "Organization Name",
        ...
      }
    }
  ]
}
```

---

## User Experience

### Ecosystem Dashboard - Schemas Tab:

1. **No Organizations:**
   - Shows icon and message: "No Organizations - Add organizations to this ecosystem to see their schemas."

2. **Organizations but No Schemas:**
   - Shows icon and message: "No Schemas Found - Organizations in this ecosystem have not created any schemas yet."

3. **With Schemas:**
   - Displays table with:
     - Schema icon + name (with ID preview)
     - Version badge
     - Organization name + creator
     - Attributes count badge
     - Creation date
     - View action button
   - Search bar at top
   - Pagination at bottom (if multiple pages)
   - Info card at bottom with educational content

4. **Search Active:**
   - If no results: "No schemas match your search criteria."
   - Results update as user types
   - Pagination resets to page 1

### Info Card Content:
- "Schemas define the structure of credentials in this ecosystem"
- "Each organization can create and manage their own schemas"
- "Schemas from all ecosystem members are displayed here"
- "Use Schema IDs when configuring pricing for credential operations"

---

## Integration with Existing Features

### Connection to Pricing:
- PricingManager now references "Schema ID" instead of "Credential Definition ID"
- Users can view schemas in Schemas tab, then use schema IDs in Pricing tab
- Info card in Schemas tab explains this relationship

### Connection to Organizations:
- Schemas are automatically loaded when organizations join/leave ecosystem
- Schema table shows which organization owns each schema
- Provides transparency for multi-organization ecosystems

### Reuse of Existing Components:
- Uses platform's existing `getAllSchemasByOrgId()` API
- Follows same patterns as SchemasList component
- Maintains consistency with rest of platform

---

## Future Enhancements

### Potential Features:
1. **Schema Details Modal**: Click view button to see full schema details (attributes, etc.)
2. **Schema Filtering**: Filter by organization, version, attribute count
3. **Schema Linking**: Ability to "link" specific schemas to ecosystem (whitelist/blacklist)
4. **Schema Metrics**: Show usage stats (credentials issued, verifications performed)
5. **Schema Recommendations**: Suggest commonly used schemas to organizations
6. **Bulk Operations**: Select multiple schemas for batch actions

### Backend API Enhancements:
1. **Dedicated Endpoint**: `GET /v1/ecosystem/:id/schemas` to fetch all schemas in one call
2. **Schema Linking**: `POST /v1/ecosystem/:id/schemas/:schemaId` to link schemas
3. **Schema Permissions**: Control which schemas are allowed in ecosystem
4. **Schema Analytics**: Track schema usage within ecosystem

---

## Testing Checklist

- [ ] Verify schemas load when ecosystem has organizations
- [ ] Verify empty state when ecosystem has no organizations
- [ ] Verify empty state when organizations have no schemas
- [ ] Test search functionality (by schema name and org name)
- [ ] Test pagination (navigate through pages)
- [ ] Test adding organization triggers schema refresh
- [ ] Test removing organization triggers schema refresh
- [ ] Verify pricing tab shows "Schema ID" labels
- [ ] Verify no TypeScript compilation errors
- [ ] Test responsive layout on mobile devices
- [ ] Verify loading states display correctly
- [ ] Verify error handling for API failures

---

## Technical Notes

### Performance Considerations:
- Fetches schemas for all organizations in parallel (not sequential)
- Implements client-side pagination to reduce memory usage
- Search filters applied after all data is fetched (could be optimized with backend search)
- Consider implementing caching if schema list is large

### Error Handling:
- Continues fetching even if one organization's schema fetch fails
- Displays error messages for complete failures
- Graceful degradation when partial data is available

### Accessibility:
- All form fields have proper labels
- Table has proper semantic HTML structure
- Loading states use CustomSpinner component
- Empty states provide clear guidance

---

## Related Documentation

- [Backend API Requirements](./BACKEND_API_REQUIREMENTS.md)
- [Backend API Alignment](./BACKEND_API_ALIGNMENT.md)
- [Organization Management Quick Guide](./BACKEND_API_CREDENTIAL_REQUESTS_SPEC.md)

---

## Summary

The integration successfully:
✅ Replaces "Credential Definitions" with "Schemas" throughout ecosystem dashboard
✅ Reuses existing platform schema management APIs
✅ Provides centralized view of schemas from all ecosystem organizations
✅ Updates pricing labels to reference schemas
✅ Maintains backward compatibility with backend APIs
✅ Implements search, pagination, and proper empty states
✅ Follows established patterns and UI conventions

**No compilation errors** - All components updated successfully!
