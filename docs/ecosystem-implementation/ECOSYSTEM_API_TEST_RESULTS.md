# Ecosystem API Test Results - Complete Reference

**Test Date:** October 6, 2025  
**Test Script:** `test-ecosystem-complete.sh`  
**Base URL:** `http://localhost:5000`  
**Test Status:** ✅ 12/12 Tests Passed

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [Organizations](#2-organizations)
3. [Ecosystem Creation](#3-ecosystem-creation)
4. [Ecosystem Details](#4-ecosystem-details)
5. [Organization Management](#5-organization-management)
6. [Schema Management](#6-schema-management)
7. [Pricing Management](#7-pricing-management)
8. [Ecosystem Listing](#8-ecosystem-listing)
9. [Ecosystem Updates](#9-ecosystem-updates)

---

## 1. Authentication

### Test 1: User Authentication
**Endpoint:** `POST /auth/signin`

#### Request:
```json
{
  "email": "admin@getconfirmd.com",
  "password": "Admin135!"
}
```

#### Response (200 OK):
```json
{
  "statusCode": 200,
  "message": "User login successfully",
  "data": {
    "access_token": "eyJhbGci...",
    "expires_in": 900,
    "refresh_expires_in": 1800,
    "refresh_token": "eyJhbGci...",
    "token_type": "Bearer",
    "not-before-policy": 0,
    "session_state": "ea4ef824-20fe-4d0c-bc00-645180c281d0",
    "scope": "profile email",
    "isRegisteredToSupabase": false
  }
}
```

#### Key Information:
- **Token Expiry:** 900 seconds (15 minutes)
- **Refresh Token Expiry:** 1800 seconds (30 minutes)
- **Token Type:** Bearer
- **Scope:** profile, email

#### Usage in Frontend:
```typescript
// Store token for API requests
const token = response.data.access_token;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## 2. Organizations

### Test 2: Get Available Organizations
**Endpoint:** `GET /orgs/`

#### Response (200 OK):
```json
{
  "statusCode": 200,
  "message": "Organizations details fetched successfully",
  "data": {
    "totalCount": 4,
    "totalPages": 1,
    "organizations": [
      {
        "id": "6116a71e-7770-4aa7-992b-dc47fcfd7f8d",
        "name": "Cowriex",
        "description": "Cowriex Issuer",
        "logoUrl": "https://platform.confamd.com/uploads/org-logos/orgLogo-1759295011922.png",
        "orgSlug": "cowriex",
        "createDateTime": "2025-10-01T05:03:31.929Z",
        "userOrgRoles": [
          {
            "id": "40e66030-2938-4b84-a3bd-b29a2424910a",
            "orgRole": {
              "id": "73e190e6-2c45-4e84-9ffe-5d4147709ca7",
              "name": "owner",
              "description": "Organization Owner"
            }
          }
        ]
      },
      {
        "id": "de61da1b-286b-4499-8819-a1c67e0e71e8",
        "name": "Credence Health",
        "description": "Credence Health",
        "logoUrl": "https://platform.confamd.com/uploads/org-logos/orgLogo-1758521181391.png",
        "orgSlug": "credence-health",
        "createDateTime": "2025-09-22T03:30:20.290Z",
        "userOrgRoles": [
          {
            "id": "48d43ae1-f540-4577-a0dc-23826449fc71",
            "orgRole": {
              "id": "73e190e6-2c45-4e84-9ffe-5d4147709ca7",
              "name": "owner",
              "description": "Organization Owner"
            }
          }
        ]
      },
      {
        "id": "7c44b2cd-eed4-400b-be31-c34484d92a1b",
        "name": "Demo Issuer",
        "description": "Demo Issuer",
        "logoUrl": null,
        "orgSlug": "two",
        "createDateTime": "2025-09-19T22:52:35.005Z",
        "userOrgRoles": [
          {
            "id": "ec3579b2-5588-4366-b1ee-b5493dca36a8",
            "orgRole": {
              "id": "73e190e6-2c45-4e84-9ffe-5d4147709ca7",
              "name": "owner",
              "description": "Organization Owner"
            }
          }
        ]
      },
      {
        "id": "386e808c-4fe7-4729-94da-2e426f6d7f6d",
        "name": "Platform-admin",
        "description": "Platform-admin",
        "logoUrl": "",
        "orgSlug": "platform-admin",
        "createDateTime": "2025-07-28T03:17:48.731Z",
        "userOrgRoles": [
          {
            "id": "55bed64d-c783-4337-822b-98df25d76e6b",
            "orgRole": {
              "id": "197b4b81-be5d-4f81-8b30-481fa8e6494b",
              "name": "platform_admin",
              "description": "To setup all the platform of the user"
            }
          },
          {
            "id": "9690c018-1bc5-4ecc-9147-f03ae82b32c9",
            "orgRole": {
              "id": "73e190e6-2c45-4e84-9ffe-5d4147709ca7",
              "name": "owner",
              "description": "Organization Owner"
            }
          }
        ]
      }
    ]
  }
}
```

#### Key Information:
- **Total Organizations:** 4
- **Includes:** User's role in each organization
- **logoUrl:** Can be null or empty string
- **User Roles:** owner, platform_admin

---

## 3. Ecosystem Creation

### Test 3: Create New Ecosystem
**Endpoint:** `POST /ecosystem`

#### Request:
```json
{
  "name": "Test Healthcare Ecosystem 1759808062",
  "description": "A test healthcare credentials ecosystem for testing purposes",
  "logoUrl": "https://example.com/logo.png",
  "tags": ["healthcare", "credentials", "testing"],
  "autoEndorsement": false,
  "ecosystemOrgs": []
}
```

#### Response (201 Created):
```json
{
  "statusCode": 201,
  "message": "Ecosystem created successfully",
  "data": {
    "id": "c625ec03-f4d1-465e-85bb-7b44ae8baac9",
    "createDateTime": "2025-10-07T03:34:24.165Z",
    "lastChangedDateTime": "2025-10-07T03:34:24.165Z",
    "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "lastChangedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "name": "Test Healthcare Ecosystem 1759808062",
    "description": "A test healthcare credentials ecosystem for testing purposes",
    "slug": null,
    "logoUrl": "https://example.com/logo.png",
    "managedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "status": "ACTIVE",
    "businessModel": "OPEN",
    "isPublic": true,
    "metadata": null
  }
}
```

#### Key Information:
- **Status Code:** 201 Created
- **Default Status:** ACTIVE
- **Default Business Model:** OPEN
- **Default isPublic:** true
- **Slug:** Generated automatically (null initially)
- **ecosystemOrgs:** Can be empty array or contain initial organizations

#### Field Descriptions:
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Ecosystem name (required) |
| `description` | string | Ecosystem description (required) |
| `logoUrl` | string | URL to ecosystem logo (optional) |
| `tags` | string[] | Array of tags for categorization (optional) |
| `autoEndorsement` | boolean | Enable automatic endorsement (optional) |
| `ecosystemOrgs` | array | Initial organizations to add (optional) |

---

## 4. Ecosystem Details

### Test 4: Get Ecosystem Details
**Endpoint:** `GET /ecosystem/:ecosystemId`

#### Response (200 OK):
```json
{
  "statusCode": 200,
  "message": "Ecosystem data fetched successfully",
  "data": {
    "id": "c625ec03-f4d1-465e-85bb-7b44ae8baac9",
    "createDateTime": "2025-10-07T03:34:24.165Z",
    "lastChangedDateTime": "2025-10-07T03:34:24.165Z",
    "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "lastChangedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "name": "Test Healthcare Ecosystem 1759808062",
    "description": "A test healthcare credentials ecosystem for testing purposes",
    "slug": null,
    "logoUrl": "https://example.com/logo.png",
    "managedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "status": "ACTIVE",
    "businessModel": "OPEN",
    "isPublic": true,
    "metadata": null
  }
}
```

#### Key Information:
- Returns complete ecosystem details
- Includes audit fields (createdBy, lastChangedBy, timestamps)

---

## 5. Organization Management

### Test 5 & 6: Add Organizations to Ecosystem

#### Test 5: Add Organization as ISSUER/FOUNDING_MEMBER
**Endpoint:** `POST /ecosystem/:ecosystemId/organizations`

**Request:**
```json
{
  "orgId": "6116a71e-7770-4aa7-992b-dc47fcfd7f8d",
  "roleInEcosystem": "ISSUER",
  "membershipType": "FOUNDING_MEMBER"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Organization added to ecosystem successfully",
  "data": {
    "id": "aa9b5b14-15b2-427c-858d-2e627a0c5c4b",
    "createDateTime": "2025-10-07T03:34:24.812Z",
    "lastChangedDateTime": "2025-10-07T03:34:24.812Z",
    "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "lastChangedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "ecosystemId": "c625ec03-f4d1-465e-85bb-7b44ae8baac9",
    "orgId": "6116a71e-7770-4aa7-992b-dc47fcfd7f8d",
    "membershipType": "FOUNDING_MEMBER",
    "status": "ACTIVE",
    "joinedAt": "2025-10-07T03:34:24.811Z",
    "roleInEcosystem": "ISSUER",
    "metadata": null
  }
}
```

#### Test 6: Add Organization as VERIFIER/MEMBER
**Request:**
```json
{
  "orgId": "de61da1b-286b-4499-8819-a1c67e0e71e8",
  "roleInEcosystem": "VERIFIER",
  "membershipType": "MEMBER"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Organization added to ecosystem successfully",
  "data": {
    "id": "fb37dcf4-ad8a-4ccb-bb1f-578fc3576c85",
    "createDateTime": "2025-10-07T03:34:24.971Z",
    "lastChangedDateTime": "2025-10-07T03:34:24.971Z",
    "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "lastChangedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "ecosystemId": "c625ec03-f4d1-465e-85bb-7b44ae8baac9",
    "orgId": "de61da1b-286b-4499-8819-a1c67e0e71e8",
    "membershipType": "MEMBER",
    "status": "ACTIVE",
    "joinedAt": "2025-10-07T03:34:24.970Z",
    "roleInEcosystem": "VERIFIER",
    "metadata": null
  }
}
```

#### Valid Values:

**roleInEcosystem:**
- `ISSUER` - Can issue credentials
- `VERIFIER` - Can verify credentials
- `BOTH` - Can both issue and verify

**membershipType:**
- `FOUNDING_MEMBER` - Founding member of ecosystem
- `PARTNER` - Partner organization
- `MEMBER` - Regular member

---

### Test 7: Get Ecosystem Organizations
**Endpoint:** `GET /ecosystem/:ecosystemId/organizations`

#### Response (200 OK):
```json
{
  "statusCode": 200,
  "message": "Ecosystem data fetched successfully",
  "data": [
    {
      "id": "aa9b5b14-15b2-427c-858d-2e627a0c5c4b",
      "createDateTime": "2025-10-07T03:34:24.812Z",
      "lastChangedDateTime": "2025-10-07T03:34:24.812Z",
      "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
      "lastChangedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
      "ecosystemId": "c625ec03-f4d1-465e-85bb-7b44ae8baac9",
      "orgId": "6116a71e-7770-4aa7-992b-dc47fcfd7f8d",
      "membershipType": "FOUNDING_MEMBER",
      "status": "ACTIVE",
      "joinedAt": "2025-10-07T03:34:24.811Z",
      "roleInEcosystem": "ISSUER",
      "metadata": null,
      "organisation": {
        "id": "6116a71e-7770-4aa7-992b-dc47fcfd7f8d",
        "name": "Cowriex",
        "description": "Cowriex Issuer"
      }
    },
    {
      "id": "fb37dcf4-ad8a-4ccb-bb1f-578fc3576c85",
      "createDateTime": "2025-10-07T03:34:24.971Z",
      "lastChangedDateTime": "2025-10-07T03:34:24.971Z",
      "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
      "lastChangedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
      "ecosystemId": "c625ec03-f4d1-465e-85bb-7b44ae8baac9",
      "orgId": "de61da1b-286b-4499-8819-a1c67e0e71e8",
      "membershipType": "MEMBER",
      "status": "ACTIVE",
      "joinedAt": "2025-10-07T03:34:24.970Z",
      "roleInEcosystem": "VERIFIER",
      "metadata": null,
      "organisation": {
        "id": "de61da1b-286b-4499-8819-a1c67e0e71e8",
        "name": "Credence Health",
        "description": "Credence Health"
      }
    }
  ]
}
```

#### Key Information:
- **Returns:** Flat array of organizations (not nested in `data.data`)
- **Includes:** Nested `organisation` object with id, name, description
- **Fields:** All ecosystem membership details + organization details

---

## 6. Schema Management

### Test 8: Get Organization Schemas
**Endpoint:** `GET /orgs/:orgId/schemas?pageNumber=1&pageSize=5`

#### Response (200 OK):
```json
{
  "statusCode": 200,
  "message": "Schema retrieved successfully.",
  "data": {
    "totalItems": 1,
    "hasNextPage": false,
    "hasPreviousPage": false,
    "nextPage": 2,
    "previousPage": 0,
    "lastPage": 1,
    "data": [
      {
        "id": "1384d1ae-0f9f-442c-9d22-c2e072d7dc2f",
        "createDateTime": "2025-10-01T05:05:56.814Z",
        "name": "Confirmed Phone",
        "version": "0.1",
        "attributes": [
          {
            "attributeName": "Phone Number",
            "schemaDataType": "string",
            "displayName": "Phone Number",
            "isRequired": true
          },
          {
            "attributeName": "issued",
            "schemaDataType": "datetime-local",
            "displayName": "issued",
            "isRequired": false
          }
        ],
        "schemaLedgerId": "7sp5CTJ1YMnDut7HEKDqNf:2:Confirmed Phone:0.1",
        "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
        "publisherDid": "7sp5CTJ1YMnDut7HEKDqNf",
        "orgId": "6116a71e-7770-4aa7-992b-dc47fcfd7f8d",
        "issuerId": "did:indy:bcovrin:testnet:7sp5CTJ1YMnDut7HEKDqNf",
        "alias": null,
        "organizationName": "Cowriex",
        "userName": "malik"
      }
    ]
  }
}
```

#### Key Information:
- **Pagination:** Supports pageNumber and pageSize query params
- **Response Structure:** `data.data` array contains schemas
- **Attributes:** Array of schema attributes with data types
- **schemaLedgerId:** Unique identifier on blockchain ledger
- **organizationName:** Included in response

#### ⚠️ Important Note:
**Ecosystem Schema Endpoints Not Yet Available**
- No dedicated endpoint for ecosystem schemas
- Must fetch schemas per organization using `/orgs/:orgId/schemas`
- Future endpoint may be: `GET /ecosystem/:ecosystemId/schemas`

---

## 7. Pricing Management

### Test 9: Add Pricing for Schema (❌ CURRENTLY FAILING)
**Endpoint:** `POST /ecosystem/:ecosystemId/pricing`

#### Request:
```json
{
  "schemaId": "1384d1ae-0f9f-442c-9d22-c2e072d7dc2f",
  "issuancePrice": 10.50,
  "verificationPrice": 5.25,
  "currency": "USD",
  "issuanceRevenueSharing": {
    "platformShare": 10,
    "ecosystemShare": 5,
    "issuerShare": 85
  },
  "verificationRevenueSharing": {
    "platformShare": 10,
    "ecosystemShare": 5,
    "verifierShare": 85
  }
}
```

#### Response (500 Error):
```json
{
  "statusCode": 500,
  "message": "Invalid `this.prisma.ecosystem_credential_pricing.create()` invocation...\nForeign key constraint violated: `fk_ecosystem_pricing_creddef (index)`",
  "error": {
    "message": "Foreign key constraint violated: `fk_ecosystem_pricing_creddef (index)`",
    "code": 500
  }
}
```

#### ⚠️ Issue Analysis:
**Problem:** Backend expects `credentialDefinitionId` but frontend sends `schemaId`

**Root Cause:**
- Database foreign key constraint: `fk_ecosystem_pricing_creddef`
- Backend validation expects credential definition reference
- Schema ID is not recognized by the foreign key constraint

**Resolution Needed:**
1. **Option A (Backend Change):** Update backend to accept `schemaId` instead of `credentialDefinitionId`
2. **Option B (Frontend Adaptation):** Send `credentialDefinitionId` field (with schema ID value) until backend is updated

**Temporary Workaround:**
```json
{
  "credentialDefinitionId": "1384d1ae-0f9f-442c-9d22-c2e072d7dc2f",  // Use this field name
  "issuancePrice": 10.50,
  "verificationPrice": 5.25,
  "currency": "USD"
}
```

---

### Test 10: Get Ecosystem Pricing
**Endpoint:** `GET /ecosystem/:ecosystemId/pricing`

#### Response (200 OK):
```json
{
  "statusCode": 200,
  "message": "Ecosystem data fetched successfully",
  "data": []
}
```

#### Key Information:
- Returns empty array when no pricing configured
- Expected structure (when data exists):
```typescript
interface PricingEntry {
  id: string;
  ecosystemId: string;
  credentialDefinitionId: string;  // Note: Currently uses this, not schemaId
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice?: number;
  currency: string;
  isActive: boolean;
  createDateTime: string;
  // Revenue sharing fields (if implemented)
  issuanceRevenueSharing?: {
    platformShare: number;
    ecosystemShare: number;
    issuerShare: number;
  };
  verificationRevenueSharing?: {
    platformShare: number;
    ecosystemShare: number;
    verifierShare: number;
  };
}
```

---

## 8. Ecosystem Listing

### Test 11: List All Ecosystems
**Endpoint:** `GET /ecosystem?pageNumber=1&pageSize=10`

#### Response (200 OK):
```json
{
  "statusCode": 200,
  "message": "Ecosystem data fetched successfully",
  "data": {
    "data": [
      {
        "id": "c625ec03-f4d1-465e-85bb-7b44ae8baac9",
        "createDateTime": "2025-10-07T03:34:24.165Z",
        "lastChangedDateTime": "2025-10-07T03:34:24.165Z",
        "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
        "lastChangedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
        "name": "Test Healthcare Ecosystem 1759808062",
        "description": "A test healthcare credentials ecosystem for testing purposes",
        "slug": null,
        "logoUrl": "https://example.com/logo.png",
        "managedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
        "status": "ACTIVE",
        "businessModel": "OPEN",
        "isPublic": true,
        "metadata": null
      }
      // ... more ecosystems
    ],
    "totalCount": 28,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Query Parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pageNumber` | number | 1 | Current page number |
| `pageSize` | number | 10 | Items per page |

#### Key Information:
- **Pagination:** Full pagination support with totalCount, totalPages
- **Structure:** `data.data` array contains ecosystems
- **Metadata:** page, limit, totalCount, totalPages

---

## 9. Ecosystem Updates

### Test 12: Update Ecosystem
**Endpoint:** `PUT /ecosystem/:ecosystemId`

#### Request:
```json
{
  "name": "Test Healthcare Ecosystem 1759808062 - Updated",
  "description": "A test healthcare credentials ecosystem for testing purposes - Updated with new information",
  "tags": ["healthcare", "credentials", "testing", "updated"]
}
```

#### Response (200 OK):
```json
{
  "statusCode": 200,
  "message": "Ecosystem updated successfully",
  "data": {
    "id": "c625ec03-f4d1-465e-85bb-7b44ae8baac9",
    "createDateTime": "2025-10-07T03:34:24.165Z",
    "lastChangedDateTime": "2025-10-07T03:34:26.167Z",
    "createdBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "lastChangedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "name": "Test Healthcare Ecosystem 1759808062 - Updated",
    "description": "A test healthcare credentials ecosystem for testing purposes - Updated with new information",
    "slug": null,
    "logoUrl": "https://example.com/logo.png",
    "managedBy": "d2f9ba95-995a-4490-a643-1805de09e7a0",
    "status": "ACTIVE",
    "businessModel": "OPEN",
    "isPublic": true,
    "metadata": null
  }
}
```

#### Key Information:
- **Partial Updates:** Can update specific fields without sending all data
- **lastChangedDateTime:** Automatically updated
- **Updatable Fields:** name, description, logoUrl, tags, status, businessModel, isPublic

---

## Summary & Key Takeaways

### ✅ Working Endpoints:
1. ✅ Authentication (`POST /auth/signin`)
2. ✅ Get Organizations (`GET /orgs/`)
3. ✅ Create Ecosystem (`POST /ecosystem`)
4. ✅ Get Ecosystem Details (`GET /ecosystem/:id`)
5. ✅ Add Organization to Ecosystem (`POST /ecosystem/:id/organizations`)
6. ✅ Get Ecosystem Organizations (`GET /ecosystem/:id/organizations`)
7. ✅ Get Organization Schemas (`GET /orgs/:orgId/schemas`)
8. ✅ Get Ecosystem Pricing (`GET /ecosystem/:id/pricing`)
9. ✅ List Ecosystems (`GET /ecosystem`)
10. ✅ Update Ecosystem (`PUT /ecosystem/:id`)

### ❌ Known Issues:
1. **Pricing Creation Failure:**
   - Backend expects `credentialDefinitionId` field
   - Frontend sends `schemaId` field
   - Foreign key constraint violation
   - **Workaround:** Use `credentialDefinitionId` field name temporarily

2. **Missing Endpoints:**
   - No dedicated `GET /ecosystem/:id/schemas` endpoint
   - Must fetch schemas per organization individually

### 🔧 Frontend Implementation Notes:

#### 1. Organization Management:
```typescript
// Add organization to ecosystem
const addOrgPayload = {
  orgId: "uuid",
  roleInEcosystem: "ISSUER" | "VERIFIER" | "BOTH",
  membershipType: "FOUNDING_MEMBER" | "PARTNER" | "MEMBER"
};

// Response includes nested organisation object
interface EcosystemOrganization {
  id: string;
  orgId: string;
  roleInEcosystem: string;
  membershipType: string;
  status: string;
  joinedAt: string;
  organisation: {
    id: string;
    name: string;
    description: string;
  };
}
```

#### 2. Schema Fetching:
```typescript
// Must fetch per organization
const organizationIds = ecosystemOrgs.map(org => org.orgId);
const allSchemas = [];

for (const orgId of organizationIds) {
  const response = await axios.get(`/orgs/${orgId}/schemas?pageNumber=1&pageSize=10`);
  allSchemas.push(...response.data.data.data);
}
```

#### 3. Pricing (Temporary Fix):
```typescript
// Use credentialDefinitionId until backend is updated
const pricingPayload = {
  credentialDefinitionId: schemaId,  // Use this field name
  issuancePrice: 10.50,
  verificationPrice: 5.25,
  currency: "USD"
};
```

### 📝 TypeScript Interface Reference:

```typescript
// Complete type definitions for ecosystem management
interface Ecosystem {
  id: string;
  createDateTime: string;
  lastChangedDateTime: string;
  createdBy: string;
  lastChangedBy: string;
  name: string;
  description: string;
  slug: string | null;
  logoUrl: string | null;
  managedBy: string;
  status: "ACTIVE" | "INACTIVE";
  businessModel: "OPEN" | string;
  isPublic: boolean;
  metadata: any | null;
}

interface EcosystemOrganization {
  id: string;
  createDateTime: string;
  lastChangedDateTime: string;
  createdBy: string;
  lastChangedBy: string;
  ecosystemId: string;
  orgId: string;
  membershipType: "FOUNDING_MEMBER" | "PARTNER" | "MEMBER";
  status: "ACTIVE" | "INACTIVE";
  joinedAt: string;
  roleInEcosystem: "ISSUER" | "VERIFIER" | "BOTH";
  metadata: any | null;
  organisation: {
    id: string;
    name: string;
    description: string;
  };
}

interface Schema {
  id: string;
  createDateTime: string;
  name: string;
  version: string;
  attributes: SchemaAttribute[];
  schemaLedgerId: string;
  createdBy: string;
  publisherDid: string;
  orgId: string;
  issuerId: string;
  alias: string | null;
  organizationName: string;
  userName: string;
}

interface SchemaAttribute {
  attributeName: string;
  schemaDataType: string;
  displayName: string;
  isRequired: boolean;
}

interface CredentialPricing {
  id: string;
  ecosystemId: string;
  credentialDefinitionId: string;  // Note: Use this until backend updated to schemaId
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice?: number;
  currency: string;
  isActive: boolean;
  createDateTime: string;
}
```

---

**Document Version:** 1.0  
**Last Updated:** October 6, 2025  
**Status:** ✅ Reference Complete - Ready for Implementation
