# Ecosystem Management - Quick Reference Card

**Last Updated:** October 6, 2025

---

## 📁 File Locations

| Component | Path |
|-----------|------|
| Dashboard | `src/components/Ecosystem/EcosystemDashboard.tsx` |
| Organization List | `src/components/Ecosystem/OrganizationList.tsx` |
| Add Org Modal | `src/components/Ecosystem/AddOrganizationModal.tsx` |
| Schema Manager | `src/components/Ecosystem/EcosystemSchemaManager.tsx` ⭐ NEW |
| Pricing Manager | `src/components/Ecosystem/PricingManager.tsx` |
| Types | `src/types/ecosystem.ts` |
| API | `src/api/ecosystem.ts` |
| Schema API | `src/api/Schema.ts` |

---

## 🔗 API Endpoints Quick Reference

```typescript
// Organizations
GET    /orgs/                                        // Get available orgs
POST   /ecosystem/:id/organizations                  // Add org to ecosystem
GET    /ecosystem/:id/organizations                  // Get ecosystem orgs
DELETE /ecosystem/:id/organizations/:orgId           // Remove org

// Schemas
GET    /orgs/:orgId/schemas?pageNumber=1&pageSize=10 // Get org schemas
// Note: No ecosystem schemas endpoint yet

// Pricing
GET    /ecosystem/:id/pricing                        // Get pricing
POST   /ecosystem/:id/pricing                        // Set pricing

// Ecosystem
POST   /ecosystem                                     // Create ecosystem
GET    /ecosystem/:id                                 // Get ecosystem
PUT    /ecosystem/:id                                 // Update ecosystem
GET    /ecosystem?pageNumber=1&pageSize=10            // List ecosystems
```

---

## 📊 Data Structures

### Add Organization
```typescript
POST /ecosystem/:id/organizations
{
  "orgId": "uuid",
  "roleInEcosystem": "ISSUER" | "VERIFIER" | "BOTH",
  "membershipType": "FOUNDING_MEMBER" | "PARTNER" | "MEMBER"
}
```

### Organization Response (IMPORTANT!)
```typescript
// Returns FLAT ARRAY, not nested!
{
  "data": [
    {
      "orgId": "uuid",
      "roleInEcosystem": "ISSUER",
      "membershipType": "FOUNDING_MEMBER",
      "organisation": {  // Nested org details
        "id": "uuid",
        "name": "Org Name",
        "description": "..."
      }
    }
  ]
}
```

### Set Pricing (⚠️ Note Field Name!)
```typescript
POST /ecosystem/:id/pricing
{
  "credentialDefinitionId": "schema-uuid", // ⚠️ Use this name with schema ID!
  "issuancePrice": 10.50,
  "verificationPrice": 5.25,
  "currency": "USD"
}
```

---

## 🎯 Key Implementation Details

### 1. Organization ID Tracking
```typescript
// Dashboard tracks org IDs for schema fetching
const [organizationIds, setOrganizationIds] = useState<string[]>([]);

// OrganizationList notifies parent
<OrganizationList 
  onOrganizationsChange={(orgIds) => setOrganizationIds(orgIds)}
/>

// EcosystemSchemaManager receives IDs
<EcosystemSchemaManager 
  ecosystemId={ecosystemId}
  organizationIds={organizationIds}
/>
```

### 2. Schema Fetching (Multi-Org)
```typescript
// Fetch from each org in parallel
for (const orgId of organizationIds) {
  const response = await getAllSchemasByOrgId(params, orgId);
  allSchemas.push(...response.data.data.data);
}
```

### 3. Response Parsing (CRITICAL!)
```typescript
// ❌ WRONG - Organizations endpoint doesn't nest like this
const orgs = response.data.data.organizations;

// ✅ CORRECT - Flat array
const orgs = Array.isArray(response.data) ? response.data : [];
```

---

## ⚠️ Known Issues

### Issue 1: Pricing Field Name
**Problem:** Backend uses `credentialDefinitionId`, should be `schemaId`
**Workaround:** Use `credentialDefinitionId` field name with schema ID value
**Status:** Temporary until backend updated

### Issue 2: No Ecosystem Schemas Endpoint
**Problem:** Must fetch schemas per organization (N API calls)
**Impact:** Performance with many organizations
**Status:** Awaiting backend endpoint creation

### Issue 3: Revenue Sharing Not Implemented
**Status:** UI ready, backend pending
**Fields:** `issuanceRevenueSharing`, `verificationRevenueSharing`

---

## 🎨 Component Props

### EcosystemDashboard
```typescript
<EcosystemDashboard ecosystemId="uuid" />
```

### OrganizationList
```typescript
<OrganizationList 
  ecosystemId="uuid"
  onInviteClick={() => setShowModal(true)}
  onOrganizationsChange={(ids) => setOrgIds(ids)}
/>
```

### EcosystemSchemaManager ⭐ NEW
```typescript
<EcosystemSchemaManager 
  ecosystemId="uuid"
  organizationIds={["uuid1", "uuid2"]}
/>
```

### AddOrganizationModal
```typescript
<AddOrganizationModal
  ecosystemId="uuid"
  isOpen={true}
  onClose={() => setOpen(false)}
  onSuccess={() => refreshList()}
/>
```

### PricingManager
```typescript
<PricingManager ecosystemId="uuid" />
```

---

## 🔍 Testing Checklist

- [ ] Add organization with ISSUER role
- [ ] Add organization with VERIFIER role
- [ ] View schemas from both organizations
- [ ] Search schemas by name
- [ ] Navigate schema pagination
- [ ] Configure pricing (note field name issue)
- [ ] Remove organization
- [ ] Verify schemas disappear after removal
- [ ] Test with no organizations (empty state)
- [ ] Test permissions (admin vs member)

---

## 📚 Documentation Files

1. **`ECOSYSTEM_API_TEST_RESULTS.md`** - Complete API reference with test cases
2. **`ECOSYSTEM_MANAGEMENT_COMPLETE_GUIDE.md`** - Full implementation guide
3. **`ECOSYSTEM_SCHEMA_INTEGRATION.md`** - Schema component details
4. **`BACKEND_API_ALIGNMENT.md`** - Frontend-backend structure alignment
5. **`ECOSYSTEM_MANAGEMENT_QUICK_REFERENCE.md`** - This file

---

## 💡 Quick Tips

1. **Always use `credentialDefinitionId` in pricing (not `schemaId`)** until backend updated
2. **Organizations response is flat array** - not nested in `data.data.items`
3. **Schema fetching is per-organization** - no ecosystem endpoint yet
4. **OrganizationList callback is critical** for schema display to work
5. **Empty states are comprehensive** - test with no data scenarios
6. **Permissions control UI** - buttons only show if user has access
7. **Search is client-side** in schema manager (filters after fetching all)
8. **Labels say "Schema"** but backend field is `credentialDefinitionId`

---

## 🚀 Quick Start

```bash
# Start dev server
pnpm dev

# Navigate to ecosystem
http://localhost:3000/ecosystems/{ecosystemId}

# Test flow:
1. Click "Add Organization"
2. Select org, choose role and membership
3. Click "Add to Ecosystem"
4. Switch to "Schemas" tab
5. See schemas from added organization
6. Switch to "Pricing" tab
7. Copy schema ID from Schemas tab
8. Add pricing (use credentialDefinitionId field!)
```

---

## 📞 Need Help?

1. Check API test results: `docs/ECOSYSTEM_API_TEST_RESULTS.md`
2. Review complete guide: `docs/ECOSYSTEM_MANAGEMENT_COMPLETE_GUIDE.md`
3. Check type definitions: `src/types/ecosystem.ts`
4. Review backend alignment: `docs/BACKEND_API_ALIGNMENT.md`

---

**Status:** ✅ Ready for Use  
**Version:** 1.0  
**Tested:** October 6, 2025
