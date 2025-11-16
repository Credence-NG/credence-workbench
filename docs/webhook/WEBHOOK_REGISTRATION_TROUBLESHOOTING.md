# Webhook Registration Troubleshooting Guide

## 500 Internal Server Error

If you're encountering a **500 Internal Server Error** when trying to register a webhook, this indicates a backend issue. Here are the common causes and solutions:

### Possible Causes

1. **Database Connection Issue**
   - The backend may not be able to connect to the database
   - Check database credentials and connection status

2. **Database Schema/Migration Missing**
   - The `organization_apps` or webhook-related tables may not exist
   - Required migrations may not have been run

3. **Backend Service Not Fully Deployed**
   - The webhook endpoint may be partially implemented
   - The feature might be in development and not production-ready

4. **Validation Logic Issue**
   - Backend validation may be failing unexpectedly
   - Check server logs for validation errors

5. **Permission/Authorization Issue**
   - User may not have the required permissions
   - Organization may not be properly configured

### Debugging Steps

#### 1. Check Backend Logs
```bash
# If using Docker
docker logs confirmd-backend

# If running locally
# Check your terminal where the backend is running
```

Look for error messages around the time of the webhook registration attempt.

#### 2. Verify Database Schema
Check if the required tables exist:
```sql
-- Connect to your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%app%' OR table_name LIKE '%webhook%';
```

Expected tables might include:
- `organization_apps`
- `org_apps`
- `webhooks`

#### 3. Check API Endpoint Implementation
Verify the backend endpoint exists and is implemented:
```bash
# Check the backend codebase for the endpoint
grep -r "POST.*apps" src/
grep -r "createApp\|create-app" src/
```

#### 4. Test API Directly with cURL
Try calling the API directly to see the raw error:
```bash
curl -X POST http://localhost:5000/orgs/{orgId}/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-token}" \
  -d '{
    "name": "Test App",
    "webhookUrl": "https://example.com/webhook",
    "webhookSecret": "test-secret-12345678"
  }'
```

#### 5. Check Backend Environment Variables
Ensure all required environment variables are set:
- Database connection strings
- API keys
- Service URLs

### Common Backend Errors and Solutions

#### Error: "Table 'organization_apps' doesn't exist"
**Solution:** Run database migrations
```bash
# Example for TypeORM
npm run migration:run

# Example for Prisma
npx prisma migrate deploy

# Example for Sequelize
npm run db:migrate
```

#### Error: "Foreign key constraint fails"
**Solution:** Ensure the organization exists and user has proper associations
```sql
-- Verify organization exists
SELECT * FROM organizations WHERE id = 'your-org-id';

-- Verify user-org relationship
SELECT * FROM organization_users WHERE org_id = 'your-org-id' AND user_id = 'your-user-id';
```

#### Error: "Unique constraint violation"
**Solution:** You may already have a webhook with the same name or URL
- Try using a different name
- Check existing webhooks first
- Delete conflicting webhook if needed

### Workarounds While Backend is Fixed

If the endpoint is not yet implemented or has issues:

1. **Contact Backend Team**
   - Report the 500 error with logs
   - Request status update on webhook feature

2. **Check Feature Flag**
   - The webhook feature might be behind a feature flag
   - Ask if it needs to be enabled for your environment

3. **Use Alternative Integration Methods**
   - Check if there are other ways to receive events
   - Look for polling endpoints or SSE (Server-Sent Events)

### Frontend Debugging

Check browser console for additional details:
```javascript
// Look for these log messages:
// 🔍 Creating org app with payload
// 🔍 Request URL
// ❌ Error response data
// ❌ Error response status
```

The logs will show:
- Exact payload being sent
- Full error response from backend
- Status code and error message

### Reporting the Issue

When reporting this issue to the backend team, include:

1. **Error Details:**
   - Status code: 500
   - Endpoint: `POST /orgs/{orgId}/apps`
   - Error message from response

2. **Request Payload:**
   ```json
   {
     "name": "VerifierApp",
     "webhookUrl": "https://demo-svr.confamd.com/demo/topics",
     "webhookSecret": "qwertyuiopasdfgh"
   }
   ```

3. **Backend Logs:**
   - Include relevant error stack traces
   - Include database errors if any

4. **Environment:**
   - Development/Staging/Production
   - Backend version/commit hash
   - Database type and version

### Verification Steps After Fix

Once the backend issue is resolved:

1. Refresh the page and try again
2. Verify webhook appears in the list
3. Test webhook deletion
4. Check if webhooks persist after page reload
5. Verify webhook events are actually being sent

## Other Common Issues

### GET Endpoint Also Fails
If fetching webhooks also returns an error, the entire feature may not be implemented yet.

### Authentication Errors
- Verify your token is valid
- Check if you have organization admin permissions
- Ensure organization ID is correct

### Network Errors
- Verify backend is running
- Check if firewall is blocking requests
- Ensure correct base URL in environment config

## Need More Help?

1. Check backend API documentation: http://localhost:5000/api/docs
2. Review backend source code for the endpoint implementation
3. Contact the backend development team
4. Check project issue tracker for known issues
