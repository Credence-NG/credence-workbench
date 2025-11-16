# User Registration Process

## Overview
The registration process is a **multi-step flow** that includes email verification, user details collection, and authentication setup (either password or passkey-based).

## Architecture

### Components
- **SignUpUser.tsx** - Email entry and verification
- **SignUpUserName.tsx** - User details collection 
- **SignUpUserPasskey.tsx** - Authentication method selection
- **SignUpUserPassword.tsx** - Password setup (alternative flow)

### Routes
- **Primary Route**: `/authentication/sign-up`
- **Email Verification**: `/auth/verify`
- **Sign In**: `/authentication/sign-in`

## Step-by-Step Process

### 1. Email Entry & Verification
**Route**: `/authentication/sign-up`  
**Component**: `SignUpUser.tsx`

#### Flow:
1. User visits the sign-up page
2. Enters their email address
3. System validates email format and domain using Yup validation:
   ```typescript
   email: yup
     .string()
     .required('Email is required')
     .email('Email is invalid')
     .matches(/(\.[a-zA-Z]{2,})$/, 'Email domain is invalid')
     .trim()
   ```
4. **Email Check**: System calls `checkUserExist(email)` API to verify:
   - If email already exists and registration is complete → Show error message
   - If email exists but not verified → Send verification email
   - If email is verified but registration incomplete → Proceed to next step
5. **Verification Email**: If needed, sends verification email via `sendVerificationMail()` API

#### API Endpoints:
- `GET /users/checkUser/{email}` - Check if user exists
- `POST /auth/sendMail` - Send verification email

#### Features:
- Email auto-fill support via URL parameters (`?email=user@example.com`)
- Real-time validation feedback
- Loading states and error handling
- Responsive design for mobile and desktop

### 2. User Details Collection  
**Component**: `SignUpUserName.tsx`

#### Flow:
1. User enters first name, last name, and phone number
2. Form validation ensures all required fields are filled
3. Details are stored temporarily in component state
4. User can navigate back to previous step if needed

#### Validation:
- First name and last name are required fields (2-50 characters)
- Phone number is required (10-20 characters, accepts international format)
- Form uses Formik for state management and validation
- First name, last name, and phone number are required fields
- Phone number format validation for international numbers
- Form uses Formik for state management and validation

#### Required Fields:
- **First Name**: User's given name (required)
- **Last Name**: User's family name (required)
- **Phone Number**: Contact phone number with country code (required)

#### Navigation:
- Back button returns to email entry step
- Continue button proceeds to authentication setup
- Skip option available for faster registration

### 3. Authentication Setup
**Component**: `SignUpUserPasskey.tsx`

Users can choose between two authentication methods:

#### Option A: Passkey (WebAuthn) ✨
Modern biometric/hardware-based authentication using WebAuthn standards.

**Features:**
- Uses `@simplewebauthn/browser` library
- Supports biometric authentication (fingerprint, face recognition)
- Hardware security key support
- Platform detection for optimal UX

**Flow:**
1. Generate registration options via `generateRegistrationOption()` API
2. Browser initiates WebAuthn ceremony using `startRegistration()`
3. User completes biometric/security key authentication
4. Verify registration via `verifyRegistration()` API
5. Store device details via `addDeviceDetails()` API

**API Endpoints:**
- `POST /fido/generate-registration-options` - Generate WebAuthn options
- `POST /fido/verify-registration` - Verify WebAuthn response
- `POST /fido/add-device` - Store device information

#### Option B: Password 🔐
Traditional password-based authentication.

**Features:**
- Password strength requirements
- Confirmation field for password validation
- Secure password encryption before transmission

**Flow:**
1. User sets a password with confirmation
2. Password is encrypted using `passwordEncryption()` utility
3. Calls `addPasswordDetails()` API with user information

**API Endpoints:**
- `POST /auth/add-details` - Complete password-based registration

### 4. Account Creation
**Final Step:**

1. Backend processes the registration request
2. User account is created with chosen authentication method
3. User receives confirmation message
4. **NEW**: Automatic redirect to Organization Registration process

### 5. Organization Registration (NEW)
**Component**: `RegisterOrganization.tsx`
**Required Feature**: `REGISTER_ORGANIZATION`

#### Flow:
1. User is prompted to register their organization
2. Comprehensive organization details form with mandatory fields
3. Organization submission for admin approval
4. User redirected to pending approval page

#### Mandatory Organization Fields:
- **Organization Legal Name**: Official registered business name
- **Organization Public Name**: Public-facing organization name
- **Company Registration Number**: Official business registration ID
- **Website**: Organization website URL
- **Regulator**: Select from predefined list:
  - National Universities Commission
  - Central Bank of Nigeria
  - The National Pension Commission PENCOM
  - Medical and Dental Council of Nigeria - MDCN
  - Federal Airports Authority of Nigeria - FAAN
  - Nigerian Communications Commission
  - National Commission for Colleges of Education
  - National Business and Technical Examinations Board (NABTEB)
  - Pharmacists Council of Nigeria - PCN
- **Country**: Organization's country of operation
- **State**: State/province location
- **City**: City location
- **Address**: Physical business address
- **Regulation Registration Number**: Regulator-specific registration number
- **Official Contact First Name**: Primary contact person's first name
- **Official Contact Last Name**: Primary contact person's last name
- **Official Contact Phone Number**: Primary contact phone number

#### Submission Process:
1. Form validation ensures all fields are completed
2. Organization data submitted to backend
3. Organization status set to "pending" in database
4. Automated email sent to user confirming submission
5. User redirected to pending approval page

### 6. Pending Organization Review
**Component**: `PendingOrganizationReview.tsx`

#### Features:
- Displays organization submission status
- Shows submitted organization details (read-only)
- Informs user that verification is in progress
- Prevents access to organization features until approved
- Automatic redirect on login if organization still pending

#### User Experience:
- Clear messaging about review timeline
- Contact information for inquiries
- Status indicators for review progress

### 7. Organization Verification (Platform Admin)
**Component**: `OrganizationVerification.tsx`
**Required Feature**: `APPROVE_ORGANIZATION`
**Access**: Platform Admin only

#### Features:
- List view of all pending organizations
- Detailed review interface for each submission
- Approve/Reject actions with comments
- Automated email notifications on decision

#### Admin Actions:
1. **Review**: Examine all submitted organization details
2. **Verify**: Mark organization as approved
3. **Reject**: Decline with reason/feedback
4. **Contact**: Request additional information if needed

#### Approval Process:
1. Platform admin reviews organization details
2. Admin clicks "Approve" or "Reject"
3. Organization status updated in database
4. Automated email sent to submitter
5. If approved: User role elevated to "Organization Owner"
6. User gains access to full organization features

## Security Measures

### Email Security
- **Email Verification Required**: All registrations must verify email ownership
- **Domain Validation**: Email domain format validation prevents invalid domains
- **Verification Code**: Secure verification codes sent via email

### Password Security
- **Encryption**: Passwords encrypted using `passwordEncryption()` before transmission
- **Client Credentials**: Requires `clientId` and `clientSecret` for verification emails
- **CSRF Protection**: Hidden form tokens prevent cross-site request forgery

### WebAuthn Security
- **Hardware-based Authentication**: Leverages device security features
- **Public Key Cryptography**: Uses WebAuthn standard for secure authentication
- **Device Registration**: Each device/authenticator registered separately

## User Experience Features

### Progressive Flow
- **Step-by-step Process**: Clear progression through registration stages
- **Visual Feedback**: Loading states, success messages, and error handling
- **Back Navigation**: Users can return to previous steps to make changes

### Responsive Design
- **Mobile Optimized**: Works seamlessly on mobile devices
- **Desktop Experience**: Full-featured desktop interface
- **Adaptive Layout**: UI adapts based on screen size

### Accessibility
- **Form Labels**: Proper labeling for screen readers
- **Error Messages**: Clear, actionable error descriptions
- **Keyboard Navigation**: Full keyboard accessibility support

### Auto-fill Support
- **Email Pre-filling**: Support for email parameter in URL
- **Browser Integration**: Works with browser password managers
- **Form State Persistence**: Maintains form data during navigation

## Device Detection & Platform Support

### Platform Detection
```typescript
const platform = navigator.platform.toLowerCase();
if (platform.includes(Devices.Linux)) {
    setIsDevice(true);
}
```

### Supported Features by Platform
- **Windows/macOS**: Full WebAuthn support with Windows Hello/Touch ID
- **Android/iOS**: Biometric authentication support
- **Linux**: Password-based authentication (WebAuthn support varies)

## State Management

### Local Storage
- **User Email**: Temporarily stored during registration flow
- **Session Data**: Maintains registration state across page refreshes

### Component State
- **Flow Control**: Manages progression between registration steps
- **Form Data**: Handles user input and validation states
- **Error Handling**: Tracks and displays errors appropriately

### Storage Keys
```typescript
// From storageKeys configuration
USER_EMAIL: 'user_email'
TOKEN: 'access_token'
USER_ROLES: 'user_roles'
```

## Backend Integration

### API Routes
The registration process integrates with several backend services:

#### Authentication APIs
- `POST /auth/sendMail` - Send verification email
- `POST /auth/add-details` - Complete registration with password
- `GET /users/checkUser/{email}` - Check user existence

#### WebAuthn APIs  
- `POST /fido/generate-registration-options` - Generate WebAuthn challenge
- `POST /fido/verify-registration` - Verify WebAuthn response
- `POST /fido/add-device` - Register authenticator device

### Request/Response Examples

#### Email Verification Request
```typescript
interface UserSignUpData {
  email: string;
  clientId: string;
  clientSecret: string;
}
```

#### Registration Completion Request
```typescript
interface AddPasswordDetails {
  email: string;
  password: string;
  isPasskey: boolean;
  firstName: string | null;
  lastName: string | null;
}
```

## Role Assignment

### Default Role
Newly registered users receive the default **"holder"** role with these permissions:

```typescript
{
  role: "holder",
  features: [
    Features.VIEW_DASHBOARD,
    Features.MANAGE_PROFILE,
    Features.VIEW_WALLET_DETAILS,
    Features.VIEW_CONNECTIONS,
    Features.SEND_INVITATION,
    Features.REGISTER_ORGANIZATION, // NEW: Required for org registration
  ],
}
```

### New Features Added
```typescript
// New features for organization registration and approval
Features.REGISTER_ORGANIZATION = "REGISTER_ORGANIZATION"
Features.APPROVE_ORGANIZATION = "APPROVE_ORGANIZATION"
```

### Role Capabilities
- **VIEW_DASHBOARD**: Access to user dashboard
- **MANAGE_PROFILE**: Edit personal profile information
- **VIEW_WALLET_DETAILS**: Access organization dashboard
- **VIEW_CONNECTIONS**: View connection list
- **SEND_INVITATION**: Send and receive invitations
- **REGISTER_ORGANIZATION**: Register new organization for approval
- **APPROVE_ORGANIZATION**: Approve pending organizations (Platform Admin only)

### Role Elevation
Users can be invited to organizations with elevated roles:
- **Member**: Basic organization access
- **Issuer**: Can issue credentials
- **Verifier**: Can verify credentials  
- **Admin**: Organization management capabilities
- **Owner**: Full organization control

## Error Handling

### Client-Side Validation
- Real-time form validation using Yup schemas
- User-friendly error messages
- Visual feedback for invalid inputs

### API Error Handling
- Network error recovery
- Specific error messages for different failure scenarios
- Graceful degradation for service unavailability

### Common Error Scenarios
1. **Email Already Registered**: Clear message with sign-in link
2. **Invalid Email Domain**: Format validation with helpful hints
3. **WebAuthn Not Supported**: Fallback to password authentication
4. **Network Connectivity**: Retry mechanisms and offline indicators

## Future Enhancements

### Potential Improvements
- **Social Login Integration**: OAuth with Google, Microsoft, etc.
- **SMS Verification**: Alternative to email verification
- **Progressive Registration**: Collect additional details over time
- **Admin Approval Workflow**: Organization-specific registration approval

### Security Enhancements
- **Multi-Factor Authentication**: Additional security layers
- **Rate Limiting**: Prevent abuse of registration endpoints
- **Advanced Password Policies**: Configurable complexity requirements
- **Audit Logging**: Track registration attempts and completions

## Troubleshooting

### Common Issues
1. **Email Not Received**: Check spam folder, verify email address
2. **WebAuthn Fails**: Browser compatibility, try password method
3. **Form Validation Errors**: Clear field requirements and formats
4. **Session Timeouts**: Automatic session refresh handling

### Developer Debug Tips
- Check browser console for WebAuthn errors
- Verify API endpoint connectivity
- Test email delivery in development environment
- Validate client credentials configuration

---

This registration system provides a modern, secure, and user-friendly onboarding experience with support for both traditional and cutting-edge authentication methods, ensuring broad compatibility while maintaining high security standards.
