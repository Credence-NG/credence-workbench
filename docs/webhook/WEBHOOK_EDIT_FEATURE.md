# Webhook Edit Feature Implementation

## Overview
Added the ability to edit existing webhook applications through a modal dialog interface. Users can now update webhook names, URLs, and optionally change webhook secrets.

## Changes Made

### 1. API Layer (`src/api/organizationApps.ts`)

#### New Interface
```typescript
export interface UpdateOrgAppPayload {
  name?: string;
  webhookUrl?: string;
  webhookSecret?: string;
}
```

#### New Function
```typescript
export const updateOrgApp = async (appId: string, payload: UpdateOrgAppPayload)
```
- Makes a PUT request to `/orgs/{orgId}/apps/{appId}`
- Accepts partial updates (all fields optional)
- Includes comprehensive error logging
- Returns the updated webhook data

### 2. Component Updates (`src/components/Setting/WebhookRegistration.tsx`)

#### New State Variables
```typescript
// Edit modal state
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editingWebhook, setEditingWebhook] = useState<OrgApp | null>(null);
const [editName, setEditName] = useState('');
const [editWebhookUrl, setEditWebhookUrl] = useState('');
const [editWebhookSecret, setEditWebhookSecret] = useState('');
const [showEditSecret, setShowEditSecret] = useState(false);
```

#### New Functions

**handleEdit(webhook: OrgApp)**
- Opens the edit modal
- Pre-fills name and URL
- Intentionally leaves secret blank for security
- Resets show/hide toggle state

**handleEditSubmit(e: React.FormEvent)**
- Validates required fields (name and URL)
- Validates secret length if provided (16-200 characters)
- Validates URL format
- Only includes secret in payload if provided
- Handles errors with detailed logging
- Refreshes webhook list on success
- Closes modal and resets form

**handleCancelEdit()**
- Closes the edit modal
- Resets all edit form state
- Clears error messages

#### UI Changes

**Webhook List Items**
- Added **Edit** button next to Delete button
- Both buttons are in a flex container with gap-2
- Edit button uses "gray" color scheme
- Delete button remains "failure" (red) color

**Edit Modal**
- Full-screen modal with Flowbite Modal component
- Header: "Edit Webhook"
- Form fields:
  1. **Webhook Name** (required, pre-filled)
  2. **Webhook URL** (required, pre-filled)
  3. **Webhook Secret** (optional, blank by default)
     - Show/hide toggle with eye icon
     - Placeholder: "Leave blank to keep existing secret"
     - Helper text explains optional nature
- Footer buttons:
  - **Cancel** (gray) - closes modal without saving
  - **Update Webhook** (blue) - submits changes
  - Loading state: "Updating..." with spinner

### 3. Documentation Updates (`docs/WEBHOOK_REGISTRATION_GUIDE.md`)

Added new section "3. Edit Webhooks" with:
- Description of editable fields
- Process steps
- Security notes about secret handling
- Feature highlights

## Security Considerations

1. **Secret Not Pre-filled**: The webhook secret field in the edit modal is intentionally left blank
   - Prevents accidental exposure of existing secrets
   - Follows principle of least privilege
   - Aligns with best practice that secrets should not be retrievable

2. **Optional Secret Update**: Users can choose whether to update the secret
   - Leave blank to keep existing secret
   - Provide new value to update (must meet 16-200 char requirement)
   - Backend should only update secret if provided in payload

3. **Show/Hide Toggle**: Secret field includes visibility toggle
   - Hidden by default (password type)
   - Eye icon button to show/hide
   - Prevents shoulder surfing

## API Contract

### Update Webhook Endpoint
**PUT** `/orgs/{orgId}/apps/{appId}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",           // optional
  "webhookUrl": "https://...",      // optional
  "webhookSecret": "new-secret"     // optional, omit to keep existing
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "app-id",
    "orgId": "org-id",
    "name": "Updated Name",
    "webhookUrl": "https://...",
    "webhookSecret": "new-secret",  // may not be returned for security
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
}
```

**Error Response (400/500):**
```json
{
  "message": "Error description",
  "error": "Detailed error"
}
```

## User Flow

1. User navigates to Settings → Webhook Registration
2. User sees list of registered webhooks
3. User clicks **Edit** button on desired webhook
4. Modal opens with pre-filled name and URL
5. User modifies fields as needed:
   - Change name (required)
   - Change URL (required)
   - Optionally provide new secret
6. User clicks **Update Webhook**
7. System validates input
8. API request sent to backend
9. On success:
   - Modal closes
   - Success message displayed
   - Webhook list refreshes
10. On error:
    - Error message displayed in modal
    - User can correct and retry
    - Or cancel to discard changes

## Testing Checklist

- [ ] Edit button appears on all webhook items
- [ ] Click edit opens modal with correct data
- [ ] Name field is pre-filled correctly
- [ ] URL field is pre-filled correctly
- [ ] Secret field is blank by default
- [ ] Show/hide toggle works in edit modal
- [ ] Submit with only name/URL update works
- [ ] Submit with new secret works
- [ ] Validation catches empty required fields
- [ ] Validation catches invalid URL format
- [ ] Validation catches short secret (<16 chars)
- [ ] Validation catches long secret (>200 chars)
- [ ] Cancel button closes modal without changes
- [ ] Success message appears after update
- [ ] Webhook list refreshes after update
- [ ] Error handling shows appropriate messages
- [ ] Loading state appears during submission
- [ ] Form disabled during submission

## Known Limitations

1. **Secret Retrieval**: Backend may not return webhook secrets in GET responses
   - Secrets may show "Not available" in webhook list
   - This is a security best practice
   - Secrets should only be visible at creation time

2. **Partial Updates**: Backend must support PATCH/PUT with optional fields
   - All fields in UpdateOrgAppPayload are optional
   - Backend should only update provided fields
   - If not supported, may need to adjust implementation

## Future Enhancements

1. **Validation Indicators**: Add real-time field validation feedback
2. **Confirmation Dialog**: Add "unsaved changes" warning on cancel
3. **Optimistic Updates**: Update UI before API response
4. **Activity Log**: Track edit history for webhooks
5. **Bulk Edit**: Allow editing multiple webhooks at once
6. **Test Webhook**: Add button to test webhook after editing

## Related Files

- `/src/api/organizationApps.ts` - API functions
- `/src/components/Setting/WebhookRegistration.tsx` - Main component
- `/src/components/Setting/index.tsx` - Settings page with tabs
- `/docs/WEBHOOK_REGISTRATION_GUIDE.md` - User documentation
- `/docs/WEBHOOK_REGISTRATION_TROUBLESHOOTING.md` - Troubleshooting guide
