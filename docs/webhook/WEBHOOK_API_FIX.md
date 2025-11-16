# Webhook API Fix - Added Description Field

## Issue
The backend API requires a `description` field when creating webhook apps, but our frontend was not sending it, causing 500 Internal Server Errors.

## Backend API Contract

### Create Webhook App
**POST** `/orgs/{orgId}/apps`

**Required Headers:**
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Production Webhook",
  "description": "Main webhook receiver for production",
  "webhookUrl": "https://your-app.com/webhooks/confirmd",
  "webhookSecret": "your-secure-webhook-secret-minimum-16-chars",
  "clientContext": {
    "environment": "production",
    "region": "us-east-1"
  }
}
```

**Required Fields:**
- `name` (string) - Application/webhook name
- `description` (string) - Brief description of the webhook
- `webhookUrl` (string) - URL endpoint to receive webhooks
- `webhookSecret` (string, 16-200 chars) - Secret for signing webhook requests

**Optional Fields:**
- `clientContext` (object) - Custom metadata for the webhook

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "App successfully created",
  "data": {
    "id": "app-uuid",
    "orgId": "org-uuid",
    "name": "Production Webhook",
    "description": "Main webhook receiver for production",
    "webhookUrl": "https://your-app.com/webhooks/confirmd",
    "isActive": true,
    "clientContext": {
      "environment": "production",
      "region": "us-east-1"
    },
    "createDateTime": "2025-10-03T10:00:00.000Z",
    "lastChangedDateTime": "2025-10-03T10:00:00.000Z"
  }
}
```

## Changes Made

### 1. Updated TypeScript Interfaces (`src/api/organizationApps.ts`)

**CreateOrgAppPayload:**
```typescript
export interface CreateOrgAppPayload {
  name: string;
  description: string;              // ✅ ADDED
  webhookUrl: string;
  webhookSecret: string;
  clientContext?: Record<string, any>; // ✅ ADDED (optional)
}
```

**UpdateOrgAppPayload:**
```typescript
export interface UpdateOrgAppPayload {
  name?: string;
  description?: string;              // ✅ ADDED
  webhookUrl?: string;
  webhookSecret?: string;
  clientContext?: Record<string, any>; // ✅ ADDED (optional)
}
```

**OrgApp:**
```typescript
export interface OrgApp {
  id: string;
  orgId: string;
  name: string;
  description?: string;              // ✅ ADDED
  webhookUrl: string;
  webhookSecret?: string;
  isActive?: boolean;                // ✅ ADDED
  clientContext?: Record<string, any>; // ✅ ADDED
  createDateTime?: string;           // ✅ ADDED (backend field name)
  lastChangedDateTime?: string;      // ✅ ADDED (backend field name)
  createdAt?: string;                // Legacy field name support
  updatedAt?: string;                // Legacy field name support
}
```

### 2. Updated Component State (`src/components/Setting/WebhookRegistration.tsx`)

**Form State:**
```typescript
const [name, setName] = useState('');
const [description, setDescription] = useState('');     // ✅ ADDED
const [webhookUrl, setWebhookUrl] = useState('');
const [webhookSecret, setWebhookSecret] = useState('');
```

**Edit State:**
```typescript
const [editName, setEditName] = useState('');
const [editDescription, setEditDescription] = useState(''); // ✅ ADDED
const [editWebhookUrl, setEditWebhookUrl] = useState('');
const [editWebhookSecret, setEditWebhookSecret] = useState('');
```

### 3. Updated Form Validation

**handleSubmit:**
```typescript
if (!name.trim() || !description.trim() || !webhookUrl.trim() || !webhookSecret.trim()) {
    setFailure('All fields are required');
    return;
}
```

**handleEditSubmit:**
```typescript
if (!editName.trim() || !editDescription.trim() || !editWebhookUrl.trim()) {
    setFailure('Name, description, and URL are required');
    return;
}
```

### 4. Updated Payload Creation

**Create Webhook:**
```typescript
const payload: CreateOrgAppPayload = {
    name: name.trim(),
    description: description.trim(),  // ✅ ADDED
    webhookUrl: webhookUrl.trim(),
    webhookSecret: webhookSecret.trim(),
};
```

**Edit Webhook:**
```typescript
const payload: UpdateOrgAppPayload = {
    name: editName.trim(),
    description: editDescription.trim(),  // ✅ ADDED
    webhookUrl: editWebhookUrl.trim(),
};
```

### 5. Added Description Field to UI

**Registration Form:**
```tsx
<div>
    <Label htmlFor="webhook-description" value="Description" />
    <TextInput
        id="webhook-description"
        type="text"
        placeholder="Main webhook receiver for production"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        disabled={formLoading}
    />
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Brief description of this webhook integration
    </p>
</div>
```

**Edit Modal:**
```tsx
<div>
    <div className="mb-2 block">
        <Label htmlFor="edit-description" value="Description" />
    </div>
    <TextInput
        id="edit-description"
        type="text"
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        placeholder="Webhook description"
        required
        disabled={formLoading}
    />
</div>
```

### 6. Fixed Date Field Handling

Updated to handle both old field names (`createdAt`, `updatedAt`) and new field names (`createDateTime`, `lastChangedDateTime`):

```typescript
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return dateString;
    }
};

// Display
<p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
    Created: {formatDate(webhook.createdAt || webhook.createDateTime)}
</p>
```

### 7. Updated Form Reset Logic

**After Successful Create:**
```typescript
setName('');
setDescription('');      // ✅ ADDED
setWebhookUrl('');
setWebhookSecret('');
```

**After Successful Edit:**
```typescript
setEditName('');
setEditDescription('');  // ✅ ADDED
setEditWebhookUrl('');
setEditWebhookSecret('');
```

**On Cancel Edit:**
```typescript
setEditName('');
setEditDescription('');  // ✅ ADDED
setEditWebhookUrl('');
setEditWebhookSecret('');
```

## Testing

### Create Webhook Test
1. Navigate to Settings → Webhook Registration
2. Fill in:
   - **Name:** "Test Webhook"
   - **Description:** "Testing webhook integration"
   - **URL:** "https://example.com/webhook"
   - **Secret:** "test-secret-at-least-16-chars"
3. Click "Register Webhook"
4. Should receive 201 Created response
5. Webhook should appear in the list

### Edit Webhook Test
1. Click "Edit" on an existing webhook
2. Update description
3. Click "Update Webhook"
4. Should receive success response
5. List should refresh with updated data

### Console Logs to Check
When creating/editing, verify in console:
```
📦 Actual Payload Being Sent: {
  name: "Test Webhook",
  description: "Testing webhook integration",
  webhookUrl: "https://example.com/webhook",
  webhookSecret: "test-secret-at-least-16-chars"
}
📦 Payload Keys: ["name", "description", "webhookUrl", "webhookSecret"]
```

## Notes

1. **clientContext** is currently optional and not exposed in the UI. It can be added later if needed for advanced use cases.

2. The backend returns `createDateTime` and `lastChangedDateTime`, but the code also supports legacy `createdAt` and `updatedAt` field names for backward compatibility.

3. The `description` field is **required** on the backend. The UI enforces this with the `required` attribute and validation.

4. Enhanced logging at both the service layer (`organizationApps.ts`) and HTTP layer (`apiRequests.ts`) helps debug any future issues.

## Resolution

The 500 Internal Server Error was caused by the missing `description` field in the request payload. With this field now included, webhook creation should work successfully.
