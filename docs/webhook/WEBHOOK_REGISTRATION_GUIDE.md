# Webhook Registration Guide

## Overview

The webhook registration feature allows organization administrators to register webhook endpoints that will receive event notifications from the platform. This feature is accessible through the Settings page.

## Location

Navigate to **Settings** → **Webhook Registration** tab

## Features

### 1. Register New Webhook
Register a new webhook endpoint to receive platform events.

**Required Fields:**
- **Application Name**: A descriptive name for your webhook integration (e.g., "My Application")
- **Webhook URL**: The HTTPS endpoint where webhook events will be sent (e.g., "https://example.com/webhook")
- **Webhook Secret**: A secure secret key (16-200 characters) that will be used to sign webhook requests for authentication

**Features:**
- **Show/Hide Secret**: Toggle button with eye icon to show or hide the webhook secret as you type
- **Real-time Validation**: Character count and format validation
- **Password Protection**: Secret field is masked by default for security

**Validation:**
- All fields are required
- Webhook URL must be a valid URL format
- Webhook secret must be between 16-200 characters
- URL should use HTTPS in production environments

### 2. View Registered Webhooks
See all currently registered webhook endpoints for your organization.

**Displayed Information:**
- Application name
- Webhook URL
- Webhook Secret with show/hide toggle (click eye icon to reveal/hide)
  - Hidden by default: Shows first 8 chars + ••••
  - Visible: Shows full secret when eye icon is clicked
  - Note: Secrets may not be available for existing webhooks (security best practice)
- Creation timestamp
- Last update timestamp

**Interaction:**
- Click the eye icon next to each webhook secret to toggle visibility
- Secrets are hidden by default for security
- Each webhook's visibility state is independent

### 3. Edit Webhooks
Update existing webhook endpoints to modify their configuration.

**Editable Fields:**
- **Application Name**: Change the descriptive name (required)
- **Webhook URL**: Update the endpoint URL (required)
- **Webhook Secret**: Optionally update the secret key (optional)
  - Leave blank to keep the existing secret
  - If provided, must be 16-200 characters
  - Show/hide toggle available with eye icon

**Process:**
1. Click the **Edit** button on any webhook in the list
2. A modal dialog will open with pre-filled information
3. Modify the fields you want to change
4. The secret field is intentionally blank for security
5. Click **Update Webhook** to save changes or **Cancel** to discard

**Features:**
- Real-time validation for all fields
- Optional secret update (leave blank to keep existing)
- Show/hide toggle for the secret field
- Confirmation messages on successful update

### 4. Delete Webhooks
Remove webhook endpoints that are no longer needed.

**Process:**
1. Click the "Delete" button next to the webhook
2. Confirm the deletion in the popup dialog
3. The webhook will be permanently removed

### 4. Refresh Webhook List
Click the "Refresh" button to reload the list of registered webhooks.

## API Integration

### Endpoints Used

The webhook registration feature uses the following API endpoints:

#### Create Webhook
```
POST /orgs/{orgId}/apps
```

**Request Body:**
```json
{
  "name": "My Application",
  "webhookUrl": "https://example.com/webhook",
  "webhookSecret": "your-secure-secret-16-to-200-chars"
}
```

#### Get All Webhooks
```
GET /orgs/{orgId}/apps
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "orgId": "org-uuid",
      "name": "My Application",
      "webhookUrl": "https://example.com/webhook",
      "webhookSecret": "your-secure-secret-16-to-200-chars",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Delete Webhook
```
DELETE /orgs/{orgId}/apps/{appId}
```

## Implementation Files

### New Files Created

1. **src/api/organizationApps.ts**
   - API functions for webhook CRUD operations
   - TypeScript interfaces for webhook data types
   - Error handling for API requests

2. **src/components/Setting/WebhookRegistration.tsx**
   - React component for webhook UI
   - Form validation and state management
   - Integration with API layer

### Modified Files

1. **src/components/Setting/index.tsx**
   - Added tabbed interface (Client Credentials / Webhook Registration)
   - Integrated WebhookRegistration component
   - Added tab navigation state management

## Security Considerations

1. **Webhook Secret**: The webhook secret is used to sign webhook requests. Ensure your webhook endpoint validates the signature using this secret to verify the authenticity of requests.

2. **Secret Length**: The secret must be between 16-200 characters for security. Use a strong, random string.

3. **HTTPS**: Use HTTPS URLs for webhook endpoints in production to ensure secure data transmission.

4. **Access Control**: Only organization owners/administrators should have access to webhook registration (verify role-based permissions).

5. **Secret Display**: The UI shows only the first 8 characters of secrets followed by "••••" to prevent accidental exposure.

## Usage Example

### Registering a Webhook

1. Navigate to Settings → Webhook Registration
2. Fill in the form:
   - **Application Name**: "Production Notifier"
   - **Webhook URL**: "https://myapp.example.com/api/webhooks"
   - **Webhook Secret**: "my-super-secure-secret-key-123456" (16+ characters)
3. Click "Register Webhook"
4. Success message will appear, and the webhook will be added to the list

### Receiving Webhook Events

Your webhook endpoint should:
1. Accept POST requests
2. Validate the webhook signature using the secret
3. Process the event payload
4. Return appropriate HTTP status codes (200 for success)

Example webhook handler (Node.js/Express):
```javascript
const crypto = require('crypto');

app.post('/api/webhooks', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const webhookSecret = 'my-super-secure-secret-key-123456';
  
  // Validate signature (implementation depends on how the platform signs requests)
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook event
  const event = req.body;
  console.log('Received webhook event:', event);
  
  // Respond with success
  res.status(200).json({ received: true });
});
```

## Troubleshooting

### Webhook Registration Fails
- Verify the webhook URL is valid and accessible
- Ensure webhook secret is between 16-200 characters
- Use a strong, random secret (avoid simple passwords)
- Check that you have proper permissions (owner/admin role)
- Ensure the API backend is running and accessible
- Check browser console for detailed error messages

### Webhook List Not Loading
- Click the "Refresh" button
- Check network tab in browser dev tools for API errors
- Verify organization ID is set in local storage
- Ensure authentication token is valid

### Webhooks Not Receiving Events
- Verify the webhook URL is publicly accessible
- Check webhook secret configuration in your webhook handler
- Implement proper signature validation
- Review webhook endpoint logs for incoming requests
- Ensure firewall/security groups allow incoming traffic

## Future Enhancements

Potential improvements for the webhook system:
- Edit/update existing webhooks
- Test webhook endpoint with sample payload
- View webhook delivery history and retry failed deliveries
- Configure which events trigger webhook notifications
- Display signature algorithm used for webhook signing
- Webhook activity logs and statistics
- Secret rotation/regeneration capability
