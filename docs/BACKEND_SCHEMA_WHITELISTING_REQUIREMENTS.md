# Backend Requirements for Ecosystem Schema Whitelisting

**Date:** October 6, 2025  
**Priority:** 🔴 CRITICAL  
**For:** Backend Development Team  
**From:** Frontend Team

---

## 📋 Executive Summary

**Requirement:** Ecosystems need the ability to whitelist ANY platform schema (not just from member organizations) and configure pricing per schema for issuance, verification, and fee sharing.

**Current Gap:** Frontend assumed schemas would be automatically shown from member organizations. This is incorrect.

**Action Required:** Verify if backend endpoints exist for ecosystem schema whitelisting. If not, implement them.

---

## 🎯 Business Requirements

### Schema Whitelisting Workflow

1. **Platform Admin creates an ecosystem**
2. **Admin adds member organizations** to ecosystem (ISSUER, VERIFIER, BOTH)
3. **Admin whitelists schemas** to the ecosystem:
   - Can add ANY platform schema (from any organization)
   - Not limited to schemas from member organizations
   - Explicit add/remove actions required
4. **Admin configures pricing** for each whitelisted schema:
   - Issuance fee
   - Verification fee
   - Revenue sharing/fee split

### Key Points

- ✅ Schemas must be **explicitly added** to ecosystem
- ✅ Can add schemas from **ANY organization** (not just members)
- ✅ Same schema can be in **multiple ecosystems** with different pricing
- ✅ Pricing is set **per ecosystem per schema**
- ✅ Removing schema should cascade to pricing records

---

## 🔍 Required Backend Endpoints

### 1. Get Ecosystem Schemas (Whitelisted)

**Endpoint:**
```
GET /ecosystem/:ecosystemId/schemas
```

**Query Parameters:**
```typescript
{
  pageNumber?: number;    // Pagination
  pageSize?: number;      // Items per page
  search?: string;        // Search by schema name or org
  sortBy?: 'name' | 'addedDate' | 'organization';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Schemas fetched successfully",
  "data": {
    "data": [
      {
        "id": "ecosystem-schema-uuid",
        "schemaId": "schema-uuid",
        "schemaName": "Degree Certificate",
        "schemaVersion": "1.0",
        "schemaLedgerId": "did:indy:sovrin:...",
        "organizationId": "org-uuid",
        "organizationName": "University X",
        "addedBy": "user-uuid",
        "addedByName": "Admin User",
        "addedDate": "2025-10-06T12:00:00Z",
        "attributes": [
          {
            "attributeName": "degree",
            "schemaDataType": "string",
            "displayName": "Degree",
            "isRequired": true
          }
        ],
        "pricing": {
          "id": "pricing-uuid",
          "issuanceFee": 10.00,
          "verificationFee": 2.00,
          "currency": "USD",
          "revenueSharing": {
            "platformShare": 20,
            "ecosystemShare": 30,
            "issuerShare": 50
          }
        }
      }
    ],
    "totalItems": 15,
    "totalPages": 2,
    "pageNumber": 1,
    "pageSize": 10
  }
}
```

**Notes:**
- Only returns schemas **explicitly added** to this ecosystem
- Includes pricing information if configured
- Pagination required for large lists

---

### 2. Add Schema to Ecosystem (Whitelist)

**Endpoint:**
```
POST /ecosystem/:ecosystemId/schemas
```

**Request Body:**
```json
{
  "schemaId": "schema-uuid",
  "issuanceFee": 10.00,      // Optional: Set initial pricing
  "verificationFee": 2.00,   // Optional
  "currency": "USD"          // Optional, default to USD
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Schema added to ecosystem successfully",
  "data": {
    "id": "ecosystem-schema-uuid",
    "ecosystemId": "ecosystem-uuid",
    "schemaId": "schema-uuid",
    "addedBy": "user-uuid",
    "addedDate": "2025-10-06T12:00:00Z"
  }
}
```

**Validation:**
- ✅ Schema must exist in platform
- ✅ Schema not already in this ecosystem (prevent duplicates)
- ✅ User must be platform admin
- ❌ Do NOT require schema to be from member organization

**Database:**
```sql
INSERT INTO ecosystem_schemas (
  id, ecosystem_id, schema_id, added_by, added_date
) VALUES (?, ?, ?, ?, NOW())
ON CONFLICT (ecosystem_id, schema_id) DO NOTHING;
```

---

### 3. Remove Schema from Ecosystem

**Endpoint:**
```
DELETE /ecosystem/:ecosystemId/schemas/:schemaId
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Schema removed from ecosystem successfully"
}
```

**Validation:**
- ✅ Schema must be in ecosystem
- ✅ User must be platform admin
- ⚠️ Cascade delete: Remove associated pricing records

**Database:**
```sql
DELETE FROM ecosystem_schemas
WHERE ecosystem_id = ? AND schema_id = ?;

-- Should cascade to pricing table
DELETE FROM ecosystem_pricing
WHERE ecosystem_id = ? AND schema_id = ?;
```

---

### 4. Get Available Schemas (Not Yet in Ecosystem)

**Endpoint:**
```
GET /schemas
```

**Query Parameters:**
```typescript
{
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  ecosystemId?: string;        // Filter out schemas already in this ecosystem
  notInEcosystem?: boolean;    // If true, exclude schemas in ecosystemId
}
```

**Example Request:**
```
GET /schemas?ecosystemId=abc-123&notInEcosystem=true&pageNumber=1&pageSize=10
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Schemas fetched successfully",
  "data": {
    "data": [
      {
        "id": "schema-uuid",
        "name": "Employment Verification",
        "version": "2.0",
        "schemaLedgerId": "did:indy:sovrin:...",
        "organizationId": "org-uuid",
        "organizationName": "Company Y",
        "attributes": [...],
        "createDateTime": "2025-09-01T10:00:00Z"
      }
    ],
    "totalItems": 50,
    "totalPages": 5,
    "pageNumber": 1,
    "pageSize": 10
  }
}
```

**Notes:**
- Returns ALL platform schemas
- If `notInEcosystem=true`, exclude schemas already in specified ecosystem
- Used for "Add Schema" modal

---

### 5. Update Pricing Validation

**Endpoint:** (Existing)
```
POST /ecosystem/:ecosystemId/pricing
```

**Additional Validation Required:**
```typescript
// Before creating pricing:
1. Verify schema exists in platform
2. Verify schema is in ecosystem (ecosystem_schemas table)
3. If not, return error: "Schema must be added to ecosystem first"
```

**Current Issue:**
- Field name is `credentialDefinitionId`
- Should be `schemaId` (or accept both)
- Foreign key references wrong table

**Recommended Change:**
```json
// Request body should accept:
{
  "schemaId": "uuid",              // Preferred
  "credentialDefinitionId": "uuid" // Deprecated but supported
}
```

---

## 💾 Database Schema

### New Table: `ecosystem_schemas`

```sql
CREATE TABLE ecosystem_schemas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystem(id) ON DELETE CASCADE,
  schema_id UUID NOT NULL REFERENCES schema(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES "user"(id),
  added_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate schemas in same ecosystem
  UNIQUE(ecosystem_id, schema_id)
);

-- Indexes for performance
CREATE INDEX idx_ecosystem_schemas_ecosystem ON ecosystem_schemas(ecosystem_id);
CREATE INDEX idx_ecosystem_schemas_schema ON ecosystem_schemas(schema_id);
CREATE INDEX idx_ecosystem_schemas_added_date ON ecosystem_schemas(added_date DESC);
```

### Update Table: `ecosystem_pricing`

```sql
-- Add foreign key to ecosystem_schemas
ALTER TABLE ecosystem_pricing
  ADD CONSTRAINT fk_ecosystem_pricing_ecosystem_schema
  FOREIGN KEY (ecosystem_id, schema_id)
  REFERENCES ecosystem_schemas(ecosystem_id, schema_id)
  ON DELETE CASCADE;

-- Or if using credentialDefinitionId field:
-- Rename field or add new field
ALTER TABLE ecosystem_pricing
  ADD COLUMN schema_id UUID;

-- Migrate data
UPDATE ecosystem_pricing
SET schema_id = credentialDefinitionId;

-- Add constraint
ALTER TABLE ecosystem_pricing
  ADD CONSTRAINT fk_ecosystem_pricing_schema_id
  FOREIGN KEY (schema_id)
  REFERENCES schema(id)
  ON DELETE CASCADE;

-- Eventually deprecate credentialDefinitionId
```

---

## ✅ Validation Rules

### Adding Schema to Ecosystem

1. ✅ Schema ID must be valid UUID
2. ✅ Schema must exist in `schema` table
3. ✅ Schema NOT already in ecosystem (`ecosystem_schemas`)
4. ✅ User must be platform admin (or ecosystem owner)
5. ❌ Do NOT check if schema's organization is in ecosystem
6. ✅ Initial pricing fields optional (can set later)

### Removing Schema from Ecosystem

1. ✅ Schema must be in ecosystem
2. ✅ User must be platform admin (or ecosystem owner)
3. ✅ CASCADE delete pricing records
4. ⚠️ Consider soft delete if historical data needed

### Setting Pricing

1. ✅ Schema must be in ecosystem FIRST
2. ✅ Validate fees are non-negative
3. ✅ Validate revenue sharing sums to 100% (if provided)
4. ✅ One pricing record per ecosystem per schema

---

## 🧪 Test Cases

### Test 1: Add Schema from Member Organization
```bash
POST /ecosystem/eco-123/schemas
{
  "schemaId": "schema-from-member-org"
}
# Expected: 201 Created
```

### Test 2: Add Schema from Non-Member Organization
```bash
POST /ecosystem/eco-123/schemas
{
  "schemaId": "schema-from-any-org"
}
# Expected: 201 Created (IMPORTANT: Should work!)
```

### Test 3: Add Duplicate Schema
```bash
POST /ecosystem/eco-123/schemas
{
  "schemaId": "schema-already-added"
}
# Expected: 409 Conflict or 400 Bad Request
```

### Test 4: Get Ecosystem Schemas
```bash
GET /ecosystem/eco-123/schemas?pageNumber=1&pageSize=10
# Expected: 200 OK with only whitelisted schemas
```

### Test 5: Set Pricing for Non-Whitelisted Schema
```bash
POST /ecosystem/eco-123/pricing
{
  "schemaId": "schema-not-in-ecosystem",
  "issuanceFee": 10
}
# Expected: 400 Bad Request "Schema must be added to ecosystem first"
```

### Test 6: Remove Schema with Pricing
```bash
DELETE /ecosystem/eco-123/schemas/schema-with-pricing
# Expected: 200 OK, pricing also deleted (cascade)
```

### Test 7: Get Available Schemas
```bash
GET /schemas?ecosystemId=eco-123&notInEcosystem=true
# Expected: 200 OK, excludes schemas already in eco-123
```

---

## 🔄 Migration Strategy

### Phase 1: Database Changes (No Downtime)
1. Create `ecosystem_schemas` table
2. Add indexes
3. Do NOT add foreign key constraints yet

### Phase 2: Data Migration
1. Migrate existing pricing records to populate `ecosystem_schemas`
```sql
INSERT INTO ecosystem_schemas (ecosystem_id, schema_id, added_by)
SELECT DISTINCT ecosystem_id, schema_id, created_by
FROM ecosystem_pricing
WHERE schema_id IS NOT NULL;
```

### Phase 3: Add Constraints
1. Add foreign key constraints
2. Test validation works

### Phase 4: Deploy Endpoints
1. Deploy new endpoints
2. Test with frontend
3. Update API documentation

---

## 📞 Questions for Backend Team

### Critical Questions:

1. **Do these endpoints already exist?**
   - GET /ecosystem/:id/schemas ❓
   - POST /ecosystem/:id/schemas ❓
   - DELETE /ecosystem/:id/schemas/:schemaId ❓
   - GET /schemas?notInEcosystem=true ❓

2. **Does `ecosystem_schemas` table exist?** ❓

3. **Pricing table structure:**
   - Does it use `credentialDefinitionId` or `schemaId`? ❓
   - Can we change field name or must support both? ❓

4. **Foreign key constraints:**
   - Is pricing table constrained to credential_definition table? ❓
   - Can we change to reference schema table instead? ❓

5. **Business logic:**
   - Can same schema be in multiple ecosystems? ✅ (Assumed YES)
   - Can pricing differ per ecosystem? ✅ (Assumed YES)
   - What happens to pricing when schema removed? ❓ (Suggest CASCADE DELETE)

6. **Permissions:**
   - Who can add schemas? (Suggest: Platform admins + ecosystem owner)
   - Who can remove schemas? (Suggest: Platform admins + ecosystem owner)
   - Who can set pricing? (Suggest: Platform admins)

---

## 🚀 Priority & Timeline

### HIGH PRIORITY - BLOCKING FRONTEND WORK

**Timeline:**
- Database changes: 1 day
- Endpoint implementation: 2 days
- Testing: 1 day
- **Total: 4 days**

**Frontend is blocked until:**
1. ✅ GET /ecosystem/:id/schemas endpoint works
2. ✅ POST /ecosystem/:id/schemas endpoint works
3. ✅ Pricing validation checks schema is in ecosystem

**Frontend can work on (not blocked):**
- Organization management (already working)
- UI component structure (can use mock data)
- Type definitions
- Modal scaffolding

---

## 📝 Next Steps

1. **Backend Team:** Review this document and confirm:
   - Which endpoints exist vs need implementation
   - Database schema status
   - Timeline estimate

2. **Frontend Team:** Wait for confirmation, then:
   - Update API service with new functions
   - Create AddSchemaToEcosystemModal
   - Rewrite EcosystemSchemaManager
   - Update type definitions

3. **Joint Testing:**
   - Integration testing with real endpoints
   - End-to-end flow testing
   - Edge case testing

---

## 📄 Related Documents

- **ECOSYSTEM_SCHEMA_WHITELISTING_CLARIFICATION.md** - Complete frontend specification
- **ECOSYSTEM_IMPLEMENTATION_GAP_ANALYSIS.md** - Gap analysis with this issue
- **ECOSYSTEM_API_TEST_RESULTS.md** - Original API test results (needs schema updates)

---

**Document Status:** ✅ Ready for Backend Team Review  
**Next Action:** Backend team to confirm endpoint status  
**Priority:** 🔴 CRITICAL - Blocking all schema and pricing work  
**Contact:** Frontend Team Lead

---

## 📧 Response Template for Backend Team

Please respond with:

```
✅ CONFIRMED: Endpoints exist and work as specified
   - GET /ecosystem/:id/schemas
   - POST /ecosystem/:id/schemas
   - DELETE /ecosystem/:id/schemas/:schemaId
   - GET /schemas?notInEcosystem=true

OR

⚠️ PARTIAL: Some endpoints exist, some need implementation
   - Details: [list what exists and what's missing]
   - Timeline: [estimate for missing pieces]

OR

❌ NOT IMPLEMENTED: Need to implement from scratch
   - Timeline: [estimate]
   - Resources: [who will work on it]
   - Questions: [any clarifications needed]

Database Schema Status:
   - ecosystem_schemas table: [EXISTS / NEEDS CREATION]
   - Pricing field name: [credentialDefinitionId / schemaId / BOTH]
   - Foreign key constraints: [details]

Estimated Timeline: [X days]
```

Thank you! 🙏

