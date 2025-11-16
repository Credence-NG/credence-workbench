# Backend API Services Developer Guide

## Overview

This guide provides comprehensive documentation for consuming the ConfirmD backend API services. This guide is designed for external developers and clients who need to integrate with the ConfirmD platform APIs. All examples are provided as standalone HTTP requests that can be implemented in any programming language or HTTP client.

The ConfirmD platform provides RESTful APIs for credential management, including authentication, organizations, schemas, credential issuance, verification, and more.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Authentication & Authorization](#authentication--authorization)
3. [Core API Endpoints](#core-api-endpoints)
4. [HTTP Client Implementation](#http-client-implementation)
5. [Error Handling](#error-handling)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

## API Architecture

### Base URLs

The ConfirmD platform provides two main API endpoints:

- **Main API**: `https://api.confirmd.com` - Core platform services
- **Ecosystem API**: `https://ecosystem.confirmd.com` - Ecosystem-specific services

### Authentication

All authenticated requests require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request/Response Format

- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Character Encoding**: UTF-8

### Standard Request Structure

```http
POST /endpoint
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "key": "value"
}
```

### Standard Response Structure

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {
    "result": "data"
  }
}
```

## Authentication & Authorization

## Authentication & Authorization

### Token-Based Authentication

The ConfirmD platform uses JWT (JSON Web Token) based authentication. All authenticated endpoints require a valid Bearer token.

### User Registration

**Endpoint**: `POST /auth/verification-mail`

```http
POST /auth/verification-mail
Host: api.confirmd.com
Content-Type: application/json

{
  "email": "user@example.com",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret"
}
```

**Response**:
```json
{
  "statusCode": 201,
  "message": "Verification email sent successfully",
  "data": {
    "verificationId": "verification-id"
  }
}
```

### Email Verification

**Endpoint**: `POST /auth/verify`

```http
POST /auth/verify
Host: api.confirmd.com
Content-Type: application/json

{
  "verificationCode": "123456",
  "email": "user@example.com"
}
```

### User Sign In

**Endpoint**: `POST /auth/signin`

**Password Authentication**:
```http
POST /auth/signin
Host: api.confirmd.com
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userpassword",
  "isPasskey": false
}
```

**Passkey Authentication**:
```http
POST /auth/signin
Host: api.confirmd.com
Content-Type: application/json

{
  "email": "user@example.com",
  "isPasskey": true
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Token Refresh

**Endpoint**: `POST /auth/refresh-token`

```http
POST /auth/refresh-token
Host: api.confirmd.com
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Password Management

**Forgot Password**:
```http
POST /auth/forgot-password
Host: api.confirmd.com
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Reset Password**:
```http
POST /auth/password-reset/user@example.com
Host: api.confirmd.com
Content-Type: application/json

{
  "password": "newpassword",
  "token": "reset-token"
}
```

## Core API Endpoints

### 1. Organization Management

#### Create Organization

**Endpoint**: `POST /orgs`

```http
POST /orgs
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "My Organization",
  "description": "Organization description",
  "website": "https://example.com",
  "logo": "logo-url"
}
```

#### Get Organizations

**Endpoint**: `GET /orgs`

```http
GET /orgs?pageNumber=1&pageSize=10&search=searchterm&role=admin
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "Organizations retrieved successfully",
  "data": {
    "totalItems": 25,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextPage": 2,
    "previousPage": null,
    "lastPage": 3,
    "data": [
      {
        "id": "org-id",
        "name": "Organization Name",
        "description": "Description",
        "website": "https://example.com",
        "logo": "logo-url",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Update Organization

**Endpoint**: `PUT /orgs/{orgId}`

```http
PUT /orgs/org-id-123
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Updated Organization Name",
  "description": "Updated description",
  "website": "https://newwebsite.com"
}
```

#### Get Organization Dashboard

**Endpoint**: `GET /orgs/{orgId}/dashboard`

```http
GET /orgs/org-id-123/dashboard
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. Schema Management

#### Get Platform Schemas

**Endpoint**: `GET /platform/schemas`

```http
GET /platform/schemas?pageSize=10&pageNumber=1&searchByText=employee&ledgerId=ledger-123&schemaType=AnonCreds
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Organization Schemas

**Endpoint**: `GET /orgs/{orgId}/schemas`

```http
GET /orgs/org-id-123/schemas?pageNumber=1&pageSize=10&searchByText=credential
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Schema

**Endpoint**: `POST /orgs/{orgId}/schemas`

```http
POST /orgs/org-id-123/schemas
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "schemaName": "Employee Credential",
  "schemaVersion": "1.0",
  "attributes": ["name", "position", "department", "employeeId"],
  "description": "Employee identity credential schema"
}
```

#### Create Credential Definition

**Endpoint**: `POST /orgs/{orgId}/cred-defs`

```http
POST /orgs/org-id-123/cred-defs
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "schemaLedgerId": "schema-ledger-id-123",
  "tag": "employee-cred-def-v1"
}
```

### 3. Connection Management

#### Get Connections

**Endpoint**: `GET /orgs/{orgId}/connections`

```http
GET /orgs/org-id-123/connections?pageSize=10&pageNumber=1&searchByText=connection&sortBy=desc&sortField=createDateTime
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Delete Connection Records

**Endpoint**: `DELETE /orgs/{orgId}/connections`

```http
DELETE /orgs/org-id-123/connections
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. Credential Issuance

#### Issue Credential

**Endpoint**: `POST /orgs/{orgId}/credentials/offer`

```http
POST /orgs/org-id-123/credentials/offer?credentialType=INDY
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "connectionId": "connection-id-123",
  "credentialDefinitionId": "cred-def-id-123",
  "attributes": [
    {
      "name": "name",
      "value": "John Doe"
    },
    {
      "name": "position", 
      "value": "Developer"
    },
    {
      "name": "department",
      "value": "Engineering"
    }
  ],
  "comment": "Employee credential issuance"
}
```

#### Issue Out-of-Band Email Credential

**Endpoint**: `POST /orgs/{orgId}/credentials/oob/email`

```http
POST /orgs/org-id-123/credentials/oob/email?credentialType=INDY
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "credentialDefinitionId": "cred-def-id-123",
  "attributes": [
    {
      "name": "name",
      "value": "John Doe"
    },
    {
      "name": "email",
      "value": "john@example.com"
    }
  ],
  "emailId": "john@example.com",
  "comment": "Email credential for John Doe"
}
```

#### Get Issued Credentials

**Endpoint**: `GET /orgs/{orgId}/credentials`

```http
GET /orgs/org-id-123/credentials?pageSize=10&pageNumber=1&search=credential&sortBy=desc&sortField=createDateTime
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Resend Credential

**Endpoint**: `GET /orgs/{orgId}/credentials/resend/{credentialRequestId}`

```http
GET /orgs/org-id-123/credentials/resend/credential-request-id-123
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Bulk Credential Issuance

#### Upload CSV File

**Endpoint**: `POST /orgs/{orgId}/bulk/upload`

```http
POST /orgs/org-id-123/bulk/upload
Host: api.confirmd.com
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

Content-Disposition: form-data; name="file"; filename="credentials.csv"
Content-Type: text/csv

[CSV file content]

Content-Disposition: form-data; name="requestId"

bulk-request-id-123
```

#### Execute Bulk Issuance

**Endpoint**: `POST /orgs/{orgId}/bulk`

```http
POST /orgs/org-id-123/bulk
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "requestId": "bulk-request-id-123",
  "credentialDefinitionId": "cred-def-id-123"
}
```

#### Get Bulk Files

**Endpoint**: `GET /orgs/{orgId}/bulk/files`

```http
GET /orgs/org-id-123/bulk/files?pageNumber=1&pageSize=10&search=bulk
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

### 6. Credential Verification

#### Verify Credential

**Endpoint**: `POST /orgs/{orgId}/proofs`

```http
POST /orgs/org-id-123/proofs?requestType=INDY
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "connectionId": "connection-id-123",
  "requestedAttributes": [
    {
      "attributeName": "name",
      "schemaId": "schema-id-123",
      "credDefId": "cred-def-id-123"
    },
    {
      "attributeName": "position",
      "schemaId": "schema-id-123", 
      "credDefId": "cred-def-id-123"
    }
  ],
  "requestedPredicates": [],
  "comment": "Employment verification request"
}
```

#### Create Out-of-Band Proof Request

**Endpoint**: `POST /orgs/{orgId}/proofs/oob`

```http
POST /orgs/org-id-123/proofs/oob?requestType=INDY
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "requestedAttributes": [
    {
      "attributeName": "name",
      "schemaId": "schema-id-123",
      "credDefId": "cred-def-id-123"
    }
  ],
  "requestedPredicates": [],
  "emailId": "user@example.com",
  "comment": "Out-of-band verification request"
}
```

#### Get Verification Requests

**Endpoint**: `GET /orgs/{orgId}/credentials/proofs`

```http
GET /orgs/org-id-123/credentials/proofs?pageSize=10&pageNumber=1&searchByText=verification&sortBy=desc&sortField=createDateTime
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

### 7. Credential Requests Management

#### Get Credential Requests List

**Endpoint**: `GET /orgs/{orgId}/list-credential-requests`

```http
GET /orgs/org-id-123/list-credential-requests?pageSize=10&pageNumber=1&searchByText=request&sortBy=desc&sortField=createDateTime
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Credential Request Details

**Endpoint**: `GET /orgs/{orgId}/credential-request-details/{requestId}`

```http
GET /orgs/org-id-123/credential-request-details/request-id-123
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Credential Request Status

**Endpoint**: `PATCH /orgs/{orgId}/update-credential-request-status`

```http
PATCH /orgs/org-id-123/update-credential-request-status
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "credentialRequestId": "request-id-123",
  "status": "approved",
  "comment": "Request approved by admin"
}
```

### 8. Agent Management

#### Check Agent Health

**Endpoint**: `GET /agents/health`

```http
GET /agents/health
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Dedicated Agent Spinup

**Endpoint**: `POST /agents/spinup`

```http
POST /agents/spinup
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "seed": "agent-seed-32-characters-long",
  "ledgerId": "ledger-id-123"
}
```

#### Shared Agent Spinup

**Endpoint**: `POST /agents/wallet`

```http
POST /agents/wallet
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "label": "My Agent Wallet",
  "seed": "wallet-seed-32-characters-long"
}
```

### 9. User Management

#### Get User Profile

**Endpoint**: `GET /users/profile`

```http
GET /users/profile
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update User Profile

**Endpoint**: `PUT /users`

```http
PUT /users
Host: api.confirmd.com
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "firstName": "John",
  "lastName": "Doe", 
  "phoneNumber": "+1234567890"
}
```

#### Get Users List

**Endpoint**: `GET /users`

```http
GET /users?pageNumber=1&pageSize=10&search=john&role=admin
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

### 10. Location Services

#### Get Countries

**Endpoint**: `GET /locations/countries`

```http
GET /locations/countries
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get States by Country

**Endpoint**: `GET /locations/states/{countryId}`

```http
GET /locations/states/US
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Cities by State

**Endpoint**: `GET /locations/cities/{stateId}`

```http
GET /locations/cities/CA
Host: api.confirmd.com
Authorization: Bearer YOUR_JWT_TOKEN
```

## HTTP Client Implementation

### JavaScript/TypeScript Example

```javascript
class ConfirmDClient {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }

    async request(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        return this.request('POST', '/auth/signin', {
            email,
            password,
            isPasskey: false
        });
    }

    // Organization methods
    async getOrganizations(pageNumber = 1, pageSize = 10, search = '') {
        return this.request('GET', `/orgs?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    }

    async createOrganization(orgData) {
        return this.request('POST', '/orgs', orgData);
    }

    // Credential methods
    async issueCredential(orgId, credentialData, credentialType = 'INDY') {
        return this.request('POST', `/orgs/${orgId}/credentials/offer?credentialType=${credentialType}`, credentialData);
    }

    async getCredentials(orgId, pageNumber = 1, pageSize = 10, search = '') {
        return this.request('GET', `/orgs/${orgId}/credentials?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    }
}

// Usage
const client = new ConfirmDClient('https://api.confirmd.com', 'your-jwt-token');

// Login and get token
const loginResult = await client.login('user@example.com', 'password');
client.token = loginResult.data.access_token;

// Use the API
const orgs = await client.getOrganizations();
```

### Python Example

```python
import requests
import json

class ConfirmDClient:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
    
    def _get_headers(self):
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        return headers
    
    def request(self, method, endpoint, data=None):
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                headers=headers,
                json=data if data else None
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API Error: {e}")
            raise
    
    def login(self, email, password):
        result = self.request('POST', '/auth/signin', {
            'email': email,
            'password': password,
            'isPasskey': False
        })
        if result.get('statusCode') == 200:
            self.token = result['data']['access_token']
        return result
    
    def get_organizations(self, page_number=1, page_size=10, search=''):
        return self.request('GET', f'/orgs?pageNumber={page_number}&pageSize={page_size}&search={search}')
    
    def create_organization(self, org_data):
        return self.request('POST', '/orgs', org_data)
    
    def issue_credential(self, org_id, credential_data, credential_type='INDY'):
        return self.request('POST', f'/orgs/{org_id}/credentials/offer?credentialType={credential_type}', credential_data)

# Usage
client = ConfirmDClient('https://api.confirmd.com')

# Login
login_result = client.login('user@example.com', 'password')

# Use the API
organizations = client.get_organizations()
```

### cURL Examples

**Login**:
```bash
curl -X POST https://api.confirmd.com/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "userpassword",
    "isPasskey": false
  }'
```

**Get Organizations**:
```bash
curl -X GET "https://api.confirmd.com/orgs?pageNumber=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

**Issue Credential**:
```bash
curl -X POST "https://api.confirmd.com/orgs/org-id-123/credentials/offer?credentialType=INDY" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "connectionId": "connection-id-123",
    "credentialDefinitionId": "cred-def-id-123",
    "attributes": [
      {"name": "name", "value": "John Doe"},
      {"name": "position", "value": "Developer"}
    ],
    "comment": "Employee credential"
  }'
```

## Error Handling

### Standard Error Response

All API calls return consistent error responses:

```typescript
interface APIError {
    statusCode: number;
    message: string;
    error?: string;
}
```

### Error Handling Pattern

```javascript
// JavaScript example
async function handleAPICall(apiFunction, ...args) {
    try {
        const response = await apiFunction(...args);
        
        if (response.statusCode === 200 || response.statusCode === 201) {
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        } else {
            return {
                success: false,
                error: response.message,
                statusCode: response.statusCode
            };
        }
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message,
            statusCode: error.status || 500
        };
    }
}

// Usage
const result = await handleAPICall(
    client.issueCredential, 
    orgId, 
    credentialData, 
    'INDY'
);

if (result.success) {
    console.log('Credential issued:', result.data);
} else {
    console.error('Failed to issue credential:', result.error);
}
```

```python
# Python example
def handle_api_call(api_function, *args, **kwargs):
    try:
        response = api_function(*args, **kwargs)
        
        if response.get('statusCode') in [200, 201]:
            return {
                'success': True,
                'data': response.get('data'),
                'message': response.get('message')
            }
        else:
            return {
                'success': False,
                'error': response.get('message'),
                'status_code': response.get('statusCode')
            }
    except Exception as e:
        print(f"API Error: {e}")
        return {
            'success': False,
            'error': str(e),
            'status_code': 500
        }
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Usage Examples

## Usage Examples

### Complete Credential Issuance Flow

```javascript
// JavaScript implementation
async function completeCredentialIssuanceFlow(client, orgId) {
    try {
        // 1. Get available schemas
        const schemasResponse = await client.request(
            'GET', 
            `/orgs/${orgId}/schemas?pageNumber=1&pageSize=10`
        );
        
        if (!schemasResponse.data || schemasResponse.data.length === 0) {
            throw new Error('No schemas available');
        }
        
        const selectedSchema = schemasResponse.data[0];
        
        // 2. Get credential definitions for selected schema
        const credDefsResponse = await client.request(
            'GET',
            `/orgs/${orgId}/schemas/${selectedSchema.schemaLedgerId}/cred-defs`
        );
        
        if (!credDefsResponse.data || credDefsResponse.data.length === 0) {
            throw new Error('No credential definitions available');
        }
        
        const selectedCredDef = credDefsResponse.data[0];
        
        // 3. Get connections
        const connectionsResponse = await client.request(
            'GET',
            `/orgs/${orgId}/connections?pageNumber=1&pageSize=10`
        );
        
        if (!connectionsResponse.data || connectionsResponse.data.length === 0) {
            throw new Error('No connections available');
        }
        
        const selectedConnection = connectionsResponse.data[0];
        
        // 4. Issue credential
        const credentialData = {
            connectionId: selectedConnection.connectionId,
            credentialDefinitionId: selectedCredDef.credentialDefinitionId,
            attributes: [
                { name: 'name', value: 'John Doe' },
                { name: 'position', value: 'Software Developer' },
                { name: 'department', value: 'Engineering' },
                { name: 'employeeId', value: 'EMP001' }
            ],
            comment: 'Employee credential issuance'
        };
        
        const issuanceResult = await client.request(
            'POST',
            `/orgs/${orgId}/credentials/offer?credentialType=INDY`,
            credentialData
        );
        
        console.log('Credential issued successfully:', issuanceResult);
        return issuanceResult;
        
    } catch (error) {
        console.error('Credential issuance flow failed:', error);
        throw error;
    }
}
```

```python
# Python implementation
def complete_credential_issuance_flow(client, org_id):
    try:
        # 1. Get available schemas
        schemas_response = client.request(
            'GET', 
            f'/orgs/{org_id}/schemas?pageNumber=1&pageSize=10'
        )
        
        if not schemas_response.get('data'):
            raise Exception('No schemas available')
        
        selected_schema = schemas_response['data'][0]
        
        # 2. Get credential definitions
        cred_defs_response = client.request(
            'GET',
            f'/orgs/{org_id}/schemas/{selected_schema["schemaLedgerId"]}/cred-defs'
        )
        
        if not cred_defs_response.get('data'):
            raise Exception('No credential definitions available')
        
        selected_cred_def = cred_defs_response['data'][0]
        
        # 3. Get connections
        connections_response = client.request(
            'GET',
            f'/orgs/{org_id}/connections?pageNumber=1&pageSize=10'
        )
        
        if not connections_response.get('data'):
            raise Exception('No connections available')
        
        selected_connection = connections_response['data'][0]
        
        # 4. Issue credential
        credential_data = {
            'connectionId': selected_connection['connectionId'],
            'credentialDefinitionId': selected_cred_def['credentialDefinitionId'],
            'attributes': [
                {'name': 'name', 'value': 'John Doe'},
                {'name': 'position', 'value': 'Software Developer'},
                {'name': 'department', 'value': 'Engineering'},
                {'name': 'employeeId', 'value': 'EMP001'}
            ],
            'comment': 'Employee credential issuance'
        }
        
        issuance_result = client.request(
            'POST',
            f'/orgs/{org_id}/credentials/offer?credentialType=INDY',
            credential_data
        )
        
        print('Credential issued successfully:', issuance_result)
        return issuance_result
        
    except Exception as e:
        print(f'Credential issuance flow failed: {e}')
        raise
```

### Complete Verification Flow

```javascript
// JavaScript implementation
async function completeVerificationFlow(client, orgId, connectionId) {
    try {
        // 1. Create verification request
        const verificationData = {
            connectionId: connectionId,
            requestedAttributes: [
                {
                    attributeName: 'name',
                    schemaId: 'schema-id-123',
                    credDefId: 'cred-def-id-123'
                },
                {
                    attributeName: 'position',
                    schemaId: 'schema-id-123',
                    credDefId: 'cred-def-id-123'
                }
            ],
            requestedPredicates: [],
            comment: 'Employment verification request'
        };
        
        const verificationRequest = await client.request(
            'POST',
            `/orgs/${orgId}/proofs?requestType=INDY`,
            verificationData
        );
        
        console.log('Verification request created:', verificationRequest);
        
        // 2. Monitor verification status
        const presentationId = verificationRequest.data.presentationId;
        
        // Poll for verification completion (in practice, use webhooks)
        const checkVerificationStatus = async () => {
            const statusResponse = await client.request(
                'GET',
                `/orgs/${orgId}/credentials/proofs?pageNumber=1&pageSize=10`
            );
            
            const verification = statusResponse.data.find(
                v => v.presentationId === presentationId
            );
            
            return verification;
        };
        
        // Wait for verification completion (simplified polling)
        let verification = await checkVerificationStatus();
        let attempts = 0;
        const maxAttempts = 10;
        
        while (verification?.state !== 'verified' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            verification = await checkVerificationStatus();
            attempts++;
        }
        
        if (verification?.state === 'verified') {
            console.log('Verification completed successfully:', verification);
            return verification;
        } else {
            throw new Error('Verification timeout or failed');
        }
        
    } catch (error) {
        console.error('Verification flow failed:', error);
        throw error;
    }
}
```

### Bulk Credential Issuance

```javascript
// JavaScript implementation for bulk issuance
async function bulkCredentialIssuance(client, orgId, csvFile, credDefId) {
    try {
        // 1. Generate request ID
        const requestId = `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // 2. Upload CSV file
        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('requestId', requestId);
        
        const uploadResponse = await fetch(
            `${client.baseUrl}/orgs/${orgId}/bulk/upload`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${client.token}`
                },
                body: formData
            }
        );
        
        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.statusCode !== 200) {
            throw new Error(`File upload failed: ${uploadResult.message}`);
        }
        
        console.log('CSV file uploaded successfully:', uploadResult);
        
        // 3. Execute bulk issuance
        const bulkData = {
            requestId: requestId,
            credentialDefinitionId: credDefId
        };
        
        const bulkResponse = await client.request(
            'POST',
            `/orgs/${orgId}/bulk`,
            bulkData
        );
        
        console.log('Bulk issuance initiated:', bulkResponse);
        
        // 4. Monitor bulk issuance progress
        const monitorBulkProgress = async () => {
            const progressResponse = await client.request(
                'GET',
                `/orgs/${orgId}/bulk/files?pageNumber=1&pageSize=10&search=${requestId}`
            );
            
            return progressResponse.data.find(file => file.requestId === requestId);
        };
        
        // Poll for completion
        let bulkFile = await monitorBulkProgress();
        let attempts = 0;
        const maxAttempts = 30; // Wait up to 1 minute
        
        while (bulkFile?.status !== 'completed' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            bulkFile = await monitorBulkProgress();
            attempts++;
            
            console.log(`Bulk issuance progress: ${bulkFile?.status || 'unknown'}`);
        }
        
        if (bulkFile?.status === 'completed') {
            console.log('Bulk issuance completed successfully:', bulkFile);
            return bulkFile;
        } else {
            throw new Error('Bulk issuance timeout or failed');
        }
        
    } catch (error) {
        console.error('Bulk credential issuance failed:', error);
        throw error;
    }
}
```

## Best Practices

### 1. Token Management

- Always check token validity before making requests
- Implement automatic token refresh
- Handle 401 responses appropriately

### 2. Error Handling

- Implement consistent error handling across all API calls
- Log errors for debugging
- Provide user-friendly error messages

### 3. Performance Optimization

- Use pagination for large datasets
- Implement debouncing for search functionality
- Cache frequently accessed data

### 4. Security

- Never expose sensitive tokens in client-side code
- Use HTTPS for all API communications
- Validate all inputs before sending to API

### 5. API Versioning

- Always specify API version when available
- Handle version compatibility gracefully
- Monitor for deprecation notices

### 6. Monitoring

- Implement request/response logging
- Track API performance metrics
- Monitor error rates

### Environment Configuration

To use the ConfirmD APIs, you'll need to configure your environment with the appropriate base URLs:

### API Endpoints by Environment

**Production**:
- Main API: `https://api.confirmd.com`
- Ecosystem API: `https://ecosystem.confirmd.com`

**Staging**:
- Main API: `https://staging-api.confirmd.com`
- Ecosystem API: `https://staging-ecosystem.confirmd.com`

**Development**:
- Main API: `https://dev-api.confirmd.com`
- Ecosystem API: `https://dev-ecosystem.confirmd.com`

### Client Configuration Examples

```javascript
// JavaScript/Node.js
const config = {
    production: {
        baseUrl: 'https://api.confirmd.com',
        ecosystemUrl: 'https://ecosystem.confirmd.com'
    },
    staging: {
        baseUrl: 'https://staging-api.confirmd.com',
        ecosystemUrl: 'https://staging-ecosystem.confirmd.com'
    },
    development: {
        baseUrl: 'https://dev-api.confirmd.com',
        ecosystemUrl: 'https://dev-ecosystem.confirmd.com'
    }
};

const environment = process.env.NODE_ENV || 'development';
const apiConfig = config[environment];

const client = new ConfirmDClient(apiConfig.baseUrl);
```

```python
# Python
import os

CONFIG = {
    'production': {
        'base_url': 'https://api.confirmd.com',
        'ecosystem_url': 'https://ecosystem.confirmd.com'
    },
    'staging': {
        'base_url': 'https://staging-api.confirmd.com',
        'ecosystem_url': 'https://staging-ecosystem.confirmd.com'
    },
    'development': {
        'base_url': 'https://dev-api.confirmd.com',
        'ecosystem_url': 'https://dev-ecosystem.confirmd.com'
    }
}

environment = os.getenv('ENVIRONMENT', 'development')
api_config = CONFIG[environment]

client = ConfirmDClient(api_config['base_url'])
```

## Conclusion

This guide provides comprehensive, standalone implementations for consuming the ConfirmD backend API services. Each example is designed to work independently without requiring access to the internal application code.

### Key Takeaways:

1. **Authentication**: Always use JWT tokens in the Authorization header
2. **Base URLs**: Use appropriate environment-specific URLs
3. **Error Handling**: Implement robust error handling for all API calls
4. **Pagination**: Use pagination parameters for list endpoints
5. **Monitoring**: Implement proper logging and monitoring for API calls

### Next Steps:

1. Choose your preferred HTTP client implementation
2. Set up environment-specific configurations
3. Implement authentication flow
4. Start with basic operations (login, get organizations)
5. Build more complex workflows as needed

### Support:

For additional support or questions about specific API endpoints:
- Review the individual endpoint documentation above
- Check response status codes and error messages
- Implement proper retry logic for transient failures
- Use appropriate timeout values for long-running operations

This guide serves as a complete reference for external developers integrating with the ConfirmD platform APIs.
