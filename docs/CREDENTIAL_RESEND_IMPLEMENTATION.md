# Credential Resend Implementation Guide

## Overview
This guide outlines how to implement credential resend functionality for the credentials page at `https://studio.confamd.com/organizations/credentials`.

## Current Limitation
The current credentials page does not have resend functionality for credentials that haven't been accepted (states: `offer-sent`, `abandoned`).

## Implementation Plan

### 1. Backend API Enhancement
First, you'll need to add a resend endpoint to your backend API:

```typescript
// Add to apiRoutes.ts
Issuance: {
  // ... existing routes
  resendCredential: "/credentials/resend", // New endpoint
}
```

### 2. Frontend API Service
Add resend function to `src/api/issuance.ts`:

```typescript
export const resendCredential = async (credentialId: string) => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.resendCredential}/${credentialId}`;
  
  const axiosPayload = {
    url,
    config: await getHeaderConfigs(),
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};
```

### 3. Update IssuedCredentials Component

Modify `src/components/Issuance/IssuedCrdentials.tsx` to include resend functionality:

```typescript
// Add state for resend loading
const [resendLoading, setResendLoading] = useState<Record<string, boolean>>({});
const [successMsg, setSuccessMsg] = useState<string | null>(null);

// Add resend handler
const handleResendCredential = async (credentialId: string, connectionId: string) => {
  setResendLoading(prev => ({ ...prev, [credentialId]: true }));
  
  try {
    const response = await resendCredential(credentialId);
    const { data } = response as AxiosResponse;
    
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setSuccessMsg(`Credential resent successfully to ${connectionId}`);
      // Refresh the list
      getIssuedCredDefs(listAPIParameter);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(response as string);
    }
  } catch (error) {
    setError('Failed to resend credential. Please try again.');
  } finally {
    setResendLoading(prev => ({ ...prev, [credentialId]: false }));
  }
};

// Update the credential list mapping to include action column
const credentialList = data?.data?.data?.map((issuedCredential: IssuedCredential) => {
  const schemaName = issuedCredential?.schemaName ?? 'Not available';
  const canResend = [
    IssueCredential.offerSent,
    IssueCredential.abandoned
  ].includes(issuedCredential.state as IssueCredential);
  
  return {
    data: [
      {
        data: issuedCredential.connectionId || 'Not available',
      },
      { data: schemaName },
      {
        data: (
          <DateTooltip date={issuedCredential.createDateTime}>
            {dateConversion(issuedCredential.createDateTime)}
          </DateTooltip>
        ),
      },
      {
        data: (
          <span className={`credential-status-badge ${getStatusClass(issuedCredential.state)}`}>
            {getStatusText(issuedCredential.state)}
          </span>
        ),
      },
      {
        data: canResend ? (
          <Button
            size="xs"
            color="warning"
            onClick={() => handleResendCredential(issuedCredential.id, issuedCredential.connectionId)}
            disabled={resendLoading[issuedCredential.id]}
            className="resend-btn"
          >
            {resendLoading[issuedCredential.id] ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resending...
              </>
            ) : (
              'Resend'
            )}
          </Button>
        ) : (
          <span className="text-gray-400 text-xs">No action needed</span>
        ),
      },
    ],
  };
});

// Update header to include Action column
const header = [
  { columnName: 'Connection Id' },
  { columnName: 'Schema Name' },
  { columnName: 'Date' },
  { columnName: 'Status' },
  { columnName: 'Action' }, // Add this
];

// Helper functions for status styling
const getStatusClass = (state: string) => {
  switch (state) {
    case IssueCredential.offerSent:
      return 'bg-orange-100 text-orange-800 border border-orange-100 dark:bg-gray-700 dark:border-orange-300 dark:text-orange-300';
    case IssueCredential.done:
      return 'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500';
    case IssueCredential.abandoned:
      return 'bg-red-100 text-red-800 border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400';
    case IssueCredential.requestReceived:
      return 'bg-primary-100 text-primary-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300';
    case IssueCredential.proposalReceived:
      return 'bg-secondary-700 text-primary-600 border border-secondary-100 dark:border-secondary-700 dark:bg-gray-700 dark:text-secondary-800';
    case IssueCredential.credentialIssued:
      return 'bg-sky-300 text-primary-700 border border-sky-100 dark:border-sky-700 dark:bg-gray-700 dark:text-sky-500';
    default:
      return 'text-xs font-medium mr-0.5 px-0.5 py-0.5 rounded-md border flex justify-center rounded-md items-center w-fit px-2';
  }
};

const getStatusText = (state: string) => {
  switch (state) {
    case IssueCredential.offerSent:
      return IssueCredentialUserText.offerSent;
    case IssueCredential.done:
      return IssueCredentialUserText.done;
    case IssueCredential.abandoned:
      return IssueCredentialUserText.abandoned;
    case IssueCredential.requestReceived:
      return IssueCredentialUserText.received;
    case IssueCredential.proposalReceived:
      return IssueCredentialUserText.proposalReceived;
    case IssueCredential.credentialIssued:
      return IssueCredentialUserText.credIssued;
    default:
      return state;
  }
};
```

### 4. Add Success/Error Alerts

Update the render method to include success message:

```typescript
<AlertComponent
  message={error}
  type={'failure'}
  onAlertClose={() => {
    setError(null);
  }}
/>

{successMsg && (
  <AlertComponent
    message={successMsg}
    type={'success'}
    onAlertClose={() => {
      setSuccessMsg(null);
    }}
  />
)}
```

### 5. Interface Updates

Add to `src/components/Issuance/interface.ts`:

```typescript
export interface IssuedCredential {
  // ... existing properties
  id: string; // Make sure this exists for resend functionality
  connectionId: string;
  state: string;
  schemaName?: string;
  createDateTime: string;
}
```

## Benefits of This Implementation

1. **User Experience**: Users can easily resend credentials that weren't accepted
2. **Efficiency**: No need to recreate entire credential offers
3. **State Management**: Proper loading states and feedback
4. **Conditional Display**: Only show resend for appropriate states
5. **Error Handling**: Comprehensive error handling and user feedback

## Usage After Implementation

Once implemented, users will be able to:

1. View credentials list at `/organizations/credentials`
2. See "Resend" button for credentials in `offer-sent` or `abandoned` states
3. Click "Resend" to send the credential offer again
4. See loading state while resending
5. Get success/error feedback
6. See updated status after resend

## Notes

- The backend API needs to support the resend functionality
- Credential ID must be available in the IssuedCredential interface
- Consider rate limiting for resend operations
- Add appropriate role-based permissions for resend functionality
- Test thoroughly with both INDY and W3C credential types
