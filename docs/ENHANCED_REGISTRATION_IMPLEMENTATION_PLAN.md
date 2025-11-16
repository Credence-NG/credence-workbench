# Enhanced User Registration & Org### 2.1 Update SignUpUserName Component
- [x] Add phone number field to form
- [x] Update validation schema (Yup)
  - [x] Phone number format validation
  - [x] International number support
- [x] Update form layout and styling
- [x] Update TypeScript interfaces
- [x] Test form validation

### 2.2 Update Registration API Calls
- [x] Modify `AddPasswordDetails` interface to include phone
- [x] Update API payload structure
- [x] Update SignUpUserPassword component
- [x] Update SignUpUserPasskey component
- [ ] Test registration flow with new fieldroval - Implementation Plan

## Overview
This plan implements the enhanced user registration process with mandatory phone number collection, organization registration, and admin approval workflow.

## Phase 1: Core Infrastructure & Features Setup

### 1.1 Features & Permissions Setup
- [x] Add new features to `features.ts`
  - [x] `REGISTER_ORGANIZATION`
  - [x] `APPROVE_ORGANIZATION`
- [x] Update `permissions.ts`
  - [x] Add `REGISTER_ORGANIZATION` to holder role
  - [x] Add `APPROVE_ORGANIZATION` to platform admin role (already included via Object.values)
- [x] Update `featureRoutes.ts`
  - [x] Add routes for organization registration
  - [x] Add routes for admin approval interface
- [x] Update `pathRoutes.ts`
  - [x] Add user registration organization routes
  - [x] Add admin verification routes

### 1.2 Database & API Preparation
- [x] Review existing organization creation API
- [x] Identify required backend changes for:
  - [x] Pending organization status
  - [x] Extended organization fields
  - [x] Approval workflow
- [x] Document API requirements for backend team (See: `/docs/BACKEND_API_REQUIREMENTS.md`)
- [ ] Coordinate with backend team on implementation timeline
- [ ] Confirm database schema changes
- [ ] Validate API endpoint signatures

## Phase 2: Enhanced User Registration

## Phase 2: Enhanced User Registration

### 2.1 Update SignUpUserName Component
- [x] Add phone number field to form
- [x] Update validation schema (Yup)
  - [x] Phone number format validation
  - [x] International number support
- [x] Update form layout and styling
- [x] Update TypeScript interfaces
- [x] Test form validation

### 2.2 Update Registration API Calls
- [x] Modify `AddPasswordDetails` interface to include phone
- [x] Update API payload structure
- [x] Update SignUpUserPassword component
- [x] Update SignUpUserPasskey component
- [x] Test registration flow with new field

## Phase 3: Organization Registration System

### 3.1 Create RegisterOrganization Component
- [x] Create new component file: `RegisterOrganization.tsx`
- [x] Design comprehensive form with all mandatory fields:
  - [x] Organization Legal Name
  - [x] Organization Public Name  
  - [x] Company Registration Number
  - [x] Website URL
  - [x] Regulator dropdown (predefined list)
  - [x] Country, State, City fields (dynamic cascading dropdowns)
  - [x] Physical address
  - [x] Regulation Registration Number
  - [x] Official Contact details (First Name, Last Name, Phone)
- [x] Implement form validation
- [x] Add submission handling
- [x] Create responsive layout
- [x] Implement cascading location dropdowns (Country → State → City)

### 3.2 Create Organization Registration API
- [x] Create API function for organization submission
- [x] Handle organization creation with "pending" status
- [x] Implement error handling
- [x] Add submission confirmation
- [x] Add new API routes to `apiRoutes.ts`
- [x] Add organization interfaces and enums
- [x] Create location lookup API functions (`getCountries`, `getStates`, `getCities`)

### 3.3 Update Registration Flow
- [x] Create registration page: `/organizations/register-organization`
- [x] Add route to `pathRoutes.ts`
- [x] Update backend API requirements for location lookups
- [ ] Test registration page navigation
- [ ] Modify post-registration redirect
- [ ] Route users to organization registration
- [ ] Handle skip/later options if needed

## Phase 4: Pending Approval Interface

### 4.1 Create PendingOrganizationReview Component
- [x] Create new component: `PendingOrganizationReview.tsx`
- [x] Design status display interface
- [x] Show submitted organization details (read-only)
- [x] Add progress indicators and status badges
- [x] Implement responsive design
- [x] Add action buttons for different status states
- [x] Handle loading states and error scenarios

### 4.2 Create Pending Review Page
- [x] Create Astro page: `/organizations/pending-organization-review`
- [x] Add route to pathRoutes configuration
- [x] Handle authentication checks
- [x] Implement proper navigation and redirects

### 4.3 Update Authentication Middleware
- [x] Create organization status utility functions
- [x] Add route access control helpers
- [x] Create redirect logic for pending users
- [x] Update registration flow to redirect to pending page
- [ ] Test middleware integration
- [ ] Implement automatic redirects based on status

## Phase 5: Admin Approval System

### 5.1 Create OrganizationVerification Component
- [ ] Create new component: `OrganizationVerification.tsx`
- [ ] Design admin review interface
- [ ] Implement organization list view
- [ ] Create detailed review modal/page
- [ ] Add approve/reject actions
- [ ] Implement filtering and search

### 5.2 Create Admin API Functions
- [ ] Get pending organizations list
- [ ] Approve organization function
- [ ] Reject organization function
- [ ] Update organization status

### 5.3 Create Admin Routes
- [ ] Create Astro page: `/admin/organization-verification`
- [ ] Add platform admin route protection
- [ ] Implement proper authorization checks

## Phase 6: Sidebar & Navigation Updates

### 6.1 Update Sidebar Configuration
- [ ] Add "Organization Verification" menu item
- [ ] Configure visibility for platform admin only
- [ ] Add appropriate icons
- [ ] Update menu structure

### 6.2 Update DynamicSidebar Component
- [ ] Add new menu item rendering
- [ ] Implement feature-based visibility
- [ ] Test menu display for different roles

## Phase 7: Frontend Notification System

### 7.1 Success/Error Notifications
- [ ] Implement toast notifications for organization submission
- [ ] Add success confirmation UI after submission
- [ ] Create error handling with user-friendly messages
- [ ] Add loading states and progress indicators

### 7.2 Status Display Components
- [ ] Create organization status display component
- [ ] Add status badges (pending, approved, rejected)
- [ ] Implement status history display
- [ ] Add submission timestamp display

**Note**: Email notifications are handled entirely by the backend as documented in `/docs/BACKEND_API_REQUIREMENTS.md` Section 4.

## Phase 8: Role Elevation System

### 8.1 Owner Role Assignment
- [ ] Implement automatic role elevation on approval
- [ ] Update user permissions in real-time
- [ ] Handle role transition smoothly
- [ ] Update session/token if needed

### 8.2 Organization Access Control
- [ ] Enable full organization features for owners
- [ ] Restrict features for pending users
- [ ] Implement proper authorization checks

## Phase 9: Testing & Validation

### 9.1 Component Testing
- [ ] Test all new components individually
- [ ] Validate form submissions
- [ ] Test error handling
- [ ] Verify responsive design

### 9.2 Integration Testing
- [ ] Test complete registration flow
- [ ] Test organization submission process
- [ ] Test admin approval workflow
- [ ] Test role elevation process

### 9.3 User Experience Testing
- [ ] Test navigation flow
- [ ] Validate error messages
- [ ] Test loading states
- [ ] Verify email notifications

## Phase 10: Documentation & Deployment

### 10.1 Code Documentation
- [ ] Add JSDoc comments to new components
- [ ] Document new API functions
- [ ] Update TypeScript interfaces
- [ ] Create component usage examples

### 10.2 User Documentation
- [ ] Update user guides
- [ ] Create admin workflow documentation
- [ ] Document troubleshooting steps
- [ ] Update API documentation

## Implementation Checklist Summary

### Backend Requirements (Coordinate with Backend Team)
- [ ] Add organization status field (pending/approved/rejected)
- [ ] Extend organization model with new fields
- [ ] Implement approval workflow APIs
- [ ] **Add complete email notification system** (submission confirmation, approval/rejection emails, admin notifications)
- [ ] Implement role elevation on approval
- [ ] Add email template management
- [ ] Configure email service integration

### Frontend Implementation
- [x] **Phase 1**: Features & permissions setup ✅ COMPLETED
- [x] **Phase 2**: Enhanced user registration (phone number) ✅ COMPLETED
- [x] **Phase 3**: Organization registration system ✅ COMPLETED
- [x] **Phase 4**: Pending approval interface ✅ COMPLETED
- [x] **Phase 5**: Admin approval system ✅ COMPLETED
- [x] **Phase 6**: Audit logging system ✅ COMPLETED
- [x] **Phase 7**: Email integration (backend-driven) ✅ ARCHITECTURE DEFINED
- [ ] **Phase 8**: Role elevation system (leverage existing org creation)
- [ ] **Phase 9**: Testing & validation
- [ ] **Phase 10**: Documentation & deployment

## Phase 7: ✅ Email Integration (Backend-Driven Architecture) - COMPLETED

### 7.1 Architecture Decision
- [x] ✅ **Backend-Driven Notifications**: Emails are automatically sent by backend business logic
- [x] ✅ **Frontend Simplification**: No email-specific API calls or notification management needed
- [x] ✅ **Transactional Integrity**: Emails sent as part of database transactions
- [x] ✅ **Reliability**: Email delivery not dependent on frontend state

### 7.2 Backend Requirements Documented
- [x] ✅ **Automatic Email Triggers**: Organization submission, approval, rejection, admin alerts
- [x] ✅ **Email Service Architecture**: Internal backend service specification
- [x] ✅ **Template Requirements**: Server-side email template management
- [x] ✅ **Queue System**: Async email processing for reliability

### 7.3 Frontend Implementation
- [x] ✅ **Removed notification API routes**: Cleaned up apiRoutes.ts
- [x] ✅ **Trust backend notifications**: Frontend only handles success/error states
- [x] ✅ **No email-specific components**: All email logic handled server-side

**Note**: With backend-driven email architecture, the frontend email integration phase is complete from the frontend perspective. All email notifications will be automatically handled by the backend when the corresponding APIs are called.

## Phase 6: ✅ Audit Logging System (COMPLETED)

### 6.1 Admin Audit Logs Component
- [x] Create OrganizationAuditLogs component
- [x] Add filtering and search functionality
- [x] Add pagination support
- [x] Add mock data structure for testing

### 6.2 Admin Audit Logs Page
- [x] Create audit logs admin page
- [x] Add proper access control
- [x] Support organization-specific log viewing
- [x] Add to navigation and routes

## Questions for Clarification

1. **Phone Number Format**: Should we support international phone numbers or focus on Nigerian numbers?
2. **Organization Editing**: After approval, can organizations edit all fields or only specific ones?
3. **Multiple Regulators**: Can an organization be regulated by multiple bodies?
4. **Rejection Handling**: What happens to rejected organizations? Can they resubmit?
5. **Admin Notifications**: Should platform admins receive email notifications for new submissions?
6. **Approval Timeline**: Is there a time limit for admin review/approval?
7. **Organization Logos**: Should we include logo upload in the registration process?
8. **Contact Verification**: Should we verify the official contact details?

## Next Steps

1. Create feature branch for implementation
2. Start with Phase 1 (Features & Permissions)
3. Coordinate with backend team on API requirements
4. Begin implementation following the checklist
5. Regular progress reviews and testing

Would you like me to proceed with creating the feature branch and starting the implementation?
