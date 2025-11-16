# Backend API Specification: Credential Request Management

## Overview
This document specifies the backend API requirements for comprehensive credential request management in the ConfirMD platform. The API enables organizations to manage incoming credential requests from users, track their lifecycle, and issue credentials upon approval.

## Authentication & Authorization
- **Authentication**: Bearer token-based authentication using JWT
- **Authorization**: Organization-based access control with role-based permissions
- **Headers**: All requests require `Authorization: Bearer <token>` header
- **Content-Type**: `application/json` for all request/response bodies

## Base URL Structure
```
/api/orgs/{orgId}/credential-requests
```

## Core Data Models

### CredentialRequest
```typescript
interface CredentialRequest {
  id: string;
  status: CredentialRequestStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  organizationId: string;
  
  // Requester Information
  requesterFirstName: string;
  requesterLastName: string;
  requesterEmail: string | null;
  requesterPhoneNumber: string;
  requesterNationalId: string;
  
  // Subject Information (person credential is for)
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  nationalIdNumber: string;
  
  // Request Context
  connectionId?: string | null;
  schemaId: string;
  credentialDefinitionId: string;
  requestedAttributes: AttributeRequest[];
  requestData: RequestData;
  
  // Processing Information
  reviewedByUser: string | null;
  statusHistory: StatusHistory[];
  verificationMethod: VerificationMethod;
  source: RequestSource;
  requestNumber: string; // Unique identifier for tracking
  
  // Timestamps
  submittedAt: string; // ISO 8601
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  issuedAt: string | null;
  
  // Additional Fields
  rejectionReason: string | null;
  internalNotes: string | null;
  
  // Related Objects
  credentialDefinition: CredentialDefinition;
  organisation: Organization;
}
```

### Supporting Types
```typescript
type CredentialRequestStatus = 
  | "submitted" 
  | "under_review" 
  | "approved" 
  | "rejected" 
  | "issued" 
  | "failed";

type VerificationMethod = "phone" | "email" | "biometric" | "document";
type RequestSource = "mobile_app" | "web_portal" | "api" | "admin_panel";

interface StatusHistory {
  status: CredentialRequestStatus;
  timestamp: string; // ISO 8601
  updatedBy?: string;
  notes?: string;
}

interface RequestData {
  originalRequest: Record<string, any>;
  metadata: {
    verificationMethod: string;
    source: string;
    requestNumber: string;
  };
  attachments: Attachment[];
}

interface AttributeRequest {
  attributeName: string;
  value: any;
  isRequired: boolean;
  verified: boolean;
}

interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  uploadedAt: string;
}
```

## API Endpoints

### 1. List Credential Requests
**GET** `/api/orgs/{orgId}/credential-requests`

#### Query Parameters
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `status` (CredentialRequestStatus) - Filter by status
- `verificationMethod` (VerificationMethod) - Filter by verification method
- `source` (RequestSource) - Filter by source
- `search` (string) - Search in names, email, phone, request number
- `dateFrom` (string, ISO 8601) - Filter requests from date
- `dateTo` (string, ISO 8601) - Filter requests to date
- `sortBy` (string, default: "createdAt") - Sort field
- `sortOrder` ("asc" | "desc", default: "desc") - Sort direction

#### Response
```typescript
{
  data: CredentialRequest[];
  pagination: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    status?: CredentialRequestStatus;
    verificationMethod?: VerificationMethod;
    source?: RequestSource;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  };
}
```

### 2. Get Credential Request Details
**GET** `/api/orgs/{orgId}/credential-requests/{requestId}`

#### Response
```typescript
{
  data: CredentialRequest;
}
```

### 3. Update Credential Request Status
**PUT** `/api/orgs/{orgId}/credential-requests/{requestId}/status`

#### Request Body
```typescript
{
  status: CredentialRequestStatus;
  rejectionReason?: string; // Required if status is "rejected"
  internalNotes?: string;
  reviewedBy?: string; // User ID of reviewer
}
```

#### Response
```typescript
{
  data: CredentialRequest;
  message: string;
}
```

### 4. Bulk Status Update
**PUT** `/api/orgs/{orgId}/credential-requests/bulk-update`

#### Request Body
```typescript
{
  requestIds: string[];
  status: CredentialRequestStatus;
  rejectionReason?: string;
  internalNotes?: string;
  reviewedBy?: string;
}
```

#### Response
```typescript
{
  data: {
    updated: string[]; // Successfully updated request IDs
    failed: Array<{
      requestId: string;
      error: string;
    }>;
  };
  message: string;
}
```

### 5. Get Request Statistics
**GET** `/api/orgs/{orgId}/credential-requests/stats`

#### Query Parameters
- `dateFrom` (string, ISO 8601) - Statistics from date
- `dateTo` (string, ISO 8601) - Statistics to date

#### Response
```typescript
{
  data: {
    total: number;
    byStatus: Record<CredentialRequestStatus, number>;
    byVerificationMethod: Record<VerificationMethod, number>;
    bySource: Record<RequestSource, number>;
    dailyStats: Array<{
      date: string; // YYYY-MM-DD
      count: number;
    }>;
    averageProcessingTime: number; // in hours
  };
}
```

### 6. Export Credential Requests
**GET** `/api/orgs/{orgId}/credential-requests/export`

#### Query Parameters
- Same filtering parameters as list endpoint
- `format` ("csv" | "xlsx" | "json", default: "csv") - Export format

#### Response
- Returns file download with appropriate Content-Type header
- CSV: `text/csv`
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- JSON: `application/json`

### 7. Get Request History
**GET** `/api/orgs/{orgId}/credential-requests/{requestId}/history`

#### Response
```typescript
{
  data: StatusHistory[];
}
```

### 8. Add Internal Note
**POST** `/api/orgs/{orgId}/credential-requests/{requestId}/notes`

#### Request Body
```typescript
{
  note: string;
  isInternal: boolean; // true for internal notes, false for applicant-visible
}
```

#### Response
```typescript
{
  data: CredentialRequest;
  message: string;
}
```

### 9. Get Credential Definition Attributes
**GET** `/api/orgs/{orgId}/credential-requests/cred-def/{credDefId}/attributes`

#### Response
```typescript
{
  data: Array<{
    attributeName: string;
    schemaDataType: string;
    displayName: string;
    isRequired: boolean;
  }>;
}
```

### 10. Validate Request Data
**POST** `/api/orgs/{orgId}/credential-requests/validate`

#### Request Body
```typescript
{
  credentialDefinitionId: string;
  requestData: Record<string, any>;
}
```

#### Response
```typescript
{
  data: {
    isValid: boolean;
    errors: Array<{
      field: string;
      message: string;
      code: string;
    }>;
    warnings: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

## Error Responses

All endpoints return standardized error responses:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string; // ISO 8601
  path: string;
}
```

### Common Error Codes
- `CREDENTIAL_REQUEST_NOT_FOUND` - Request ID does not exist
- `INVALID_STATUS_TRANSITION` - Cannot change from current status to requested status
- `UNAUTHORIZED_ACCESS` - User lacks permission to access/modify resource
- `VALIDATION_ERROR` - Request data validation failed
- `ORGANIZATION_NOT_FOUND` - Organization ID is invalid
- `SCHEMA_NOT_FOUND` - Schema ID is invalid
- `CREDENTIAL_DEFINITION_NOT_FOUND` - Credential definition ID is invalid

## Webhooks (Optional Enhancement)

### Webhook Events
Organizations can register webhooks to receive real-time notifications:

- `credential_request.submitted`
- `credential_request.status_changed`
- `credential_request.approved`
- `credential_request.rejected`
- `credential_request.issued`

### Webhook Payload
```typescript
{
  event: string;
  data: CredentialRequest;
  timestamp: string; // ISO 8601
  organizationId: string;
}
```

## Rate Limiting
- **List requests**: 100 requests per minute per organization
- **Detail requests**: 200 requests per minute per organization
- **Update requests**: 50 requests per minute per organization
- **Export requests**: 10 requests per hour per organization

## Security Considerations
1. All sensitive data must be encrypted at rest
2. Audit logging for all state changes
3. Input validation and sanitization
4. Rate limiting to prevent abuse
5. HTTPS-only communication
6. Token expiration and refresh mechanisms

## Integration Points
- **Identity Verification Service**: For document and biometric verification
- **Notification Service**: For email/SMS notifications to applicants
- **Credential Issuance Service**: For issuing approved credentials
- **Audit Service**: For compliance and tracking

## Performance Requirements
- **Response Time**: < 200ms for list operations, < 100ms for detail operations
- **Throughput**: Support 1000+ concurrent requests
- **Availability**: 99.9% uptime SLA
- **Data Retention**: 7 years for compliance

This API specification provides a comprehensive foundation for credential request management while maintaining security, scalability, and usability standards.