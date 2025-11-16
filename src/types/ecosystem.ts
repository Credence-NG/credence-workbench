/**
 * Ecosystem Feature - TypeScript Type Definitions
 *
 * This file contains all type definitions for the Ecosystem Coordination Layer feature.
 * Based on FRONTEND_INTEGRATION_GUIDE.md
 *
 * @module types/ecosystem
 */

// ============================================
// ENUMS
// ============================================

/**
 * Ecosystem operational status
 */
export enum EcosystemStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

/**
 * Business model types for ecosystem operations
 * Note: Backend currently only accepts "OPEN" - other values may be added in future
 */
export enum BusinessModel {
  OPEN = "OPEN",
  // RESTRICTED and INVITE_ONLY are not yet supported by backend
  // Uncomment when backend implements these values:
  // RESTRICTED = "RESTRICTED",
  // INVITE_ONLY = "INVITE_ONLY",
}

/**
 * Organization membership types within ecosystem
 */
export enum MembershipType {
  MEMBER = "MEMBER",
  PARTNER = "PARTNER",
  FOUNDING_MEMBER = "FOUNDING_MEMBER",
}

/**
 * Organization role in ecosystem operations
 */
export enum RoleInEcosystem {
  ISSUER = "ISSUER",
  VERIFIER = "VERIFIER",
  BOTH = "BOTH",
}

/**
 * Organization membership status
 */
export enum MembershipStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

/**
 * Application status for joining ecosystem
 */
export enum ApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}

/**
 * Transaction types in ecosystem
 */
export enum TransactionType {
  ISSUANCE = "issuance",
  VERIFICATION = "verification",
  REVOCATION = "revocation",
}

/**
 * Settlement processing status
 */
export enum SettlementStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  APPROVED = "approved",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// ============================================
// CORE TYPES
// ============================================

/**
 * Main ecosystem entity
 */
export interface Ecosystem {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  managedBy: string; // User ID of ecosystem manager
  status: EcosystemStatus;
  businessModel: BusinessModel;
  isPublic: boolean;
  metadata?: Record<string, any> | null;

  // Timestamps
  createDateTime: string;
  lastChangedDateTime: string;
  createdBy: string;
  lastChangedBy: string;

  // Optional fields (may be added by frontend for display)
  membershipFee?: number;
  transactionFee?: number;
  totalOrganizations?: number;
  totalTransactions?: number;
  totalRevenue?: number;
  adminContact?: string;
}

/**
 * Organization membership in ecosystem
 */
export interface EcosystemOrganization {
  id: string;
  ecosystemId: string;
  orgId: string;
  membershipType: MembershipType;
  roleInEcosystem: RoleInEcosystem;
  status: string;
  joinedAt: string;
  createDateTime: string;
  lastChangedDateTime: string;
  createdBy: string;
  lastChangedBy: string;
  metadata?: Record<string, any>;

  // Nested organization details
  organisation: {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
  };

  // Performance metrics (may not be in all responses)
  totalIssuances?: number;
  totalVerifications?: number;
  totalRevenue?: number;
  lastActivityAt?: string;
  suspendedAt?: string;
}

/**
 * Credential pricing configuration
 */
export interface CredentialPricing {
  id: string;
  ecosystemId: string;
  schemaId: string;
  credentialDefinitionId?: string; // Deprecated, keeping for backward compatibility
  credentialName?: string; // Deprecated, keeping for backward compatibility
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice?: number;
  currency: string;
  issuanceRevenueSharing?: RevenueSharing;
  verificationRevenueSharing?: RevenueSharing;
  effectiveDate?: string;
  expirationDate?: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
  schema?: {
    id: string;
    name: string;
    version: string;
    schemaLedgerId: string;
  };
}

/**
 * Schema attribute definition
 */
export interface SchemaAttribute {
  attributeName: string;
  schemaDataType: string;
  displayName: string;
  isRequired: boolean;
}

/**
 * Schema structure (used instead of Credential Definition)
 */
export interface Schema {
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

/**
 * Schema list response
 */
export interface SchemaListResponse {
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number;
  previousPage: number;
  lastPage: number;
  data: Schema[];
}

/**
 * Schema list query parameters
 */
export interface SchemaListParams {
  pageNumber?: number;
  pageSize?: number;
  searchByText?: string;
}

/**
 * @deprecated Governance level not used in current API spec
 * Keeping for backward compatibility during migration
 */
export enum GovernanceLevel {
  MANDATORY = "MANDATORY",
  RECOMMENDED = "RECOMMENDED",
  OPTIONAL = "OPTIONAL",
}

/**
 * @deprecated Schema status not used in current API spec
 * Keeping for backward compatibility during migration
 */
export enum EcosystemSchemaStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

/**
 * Schema in ecosystem with pricing and revenue sharing configuration
 * Updated to match API Guide v1.1.0 (Nov 6, 2025)
 */
export interface EcosystemSchema {
  id: string; // Ecosystem-Schema relationship ID
  ecosystemId: string;
  schemaLedgerId: string; // DID format: did:indy:sovrin:123/schema/name/1.0

  // Pricing Configuration
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice: number;
  currency: string; // ISO currency code (USD, EUR, etc.)

  // Issuance Revenue Sharing (must total 100%)
  issuancePlatformShare: number;   // Platform's percentage
  issuanceEcosystemShare: number;  // Ecosystem's percentage
  issuanceIssuerShare: number;     // Issuer's percentage

  // Verification Revenue Sharing (must total 100%)
  verificationPlatformShare: number;  // Platform's percentage
  verificationEcosystemShare: number; // Ecosystem's percentage
  verificationIssuerShare: number;  // Verifier's percentage

  // Revocation Revenue Sharing (must total 100%)
  revocationPlatformShare: number;   // Platform's percentage
  revocationEcosystemShare: number;  // Ecosystem's percentage
  revocationIssuerShare: number;     // Issuer's percentage

  // Schema details (populated by backend)
  schema?: {
    id: string;
    name: string;
    version: string;
    schemaLedgerId: string;
    attributes?: Array<{
      attributeName: string;
      schemaDataType: string;
      displayName: string;
      isRequired: boolean;
    }>;
    createDateTime?: string;
    lastChangedDateTime?: string;
    orgId?: string;
    organizationName?: string;
  };

  // Audit fields
  createDateTime: string;
  createdBy: string;
  lastChangedDateTime?: string;
  lastChangedBy?: string;
}

/**
 * Request to add schema to ecosystem with pricing configuration
 * All fields required except optional shares (defaults to standard split)
 * Updated to match API Guide v1.1.0
 */
export interface AddSchemaToEcosystemRequest {
  schemaLedgerId: string; // DID format: did:indy:sovrin:123/schema/name/1.0

  // Pricing (required)
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice: number;
  currency: string; // ISO currency code

  // Issuance Revenue Sharing (must total 100%)
  issuancePlatformShare: number;
  issuanceEcosystemShare: number;
  issuanceIssuerShare: number;

  // Verification Revenue Sharing (must total 100%)
  verificationPlatformShare: number;
  verificationEcosystemShare: number;
  verificationIssuerShare: number;  // Issuer's percentage (not Verifier)

  // Revocation Revenue Sharing (must total 100%)
  revocationPlatformShare: number;
  revocationEcosystemShare: number;
  revocationIssuerShare: number;
}

/**
 * Schema list response for ecosystem
 */
export interface EcosystemSchemaListResponse {
  data: EcosystemSchema[];
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number;
  previousPage: number;
  lastPage: number;
}

/**
 * Transaction record
 */
export interface EcosystemTransaction {
  id: string;
  ecosystemId: string;
  organizationId: string;
  organizationName: string;
  type: TransactionType;
  credentialDefinitionId: string;
  credentialName?: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  createdAt: string;

  // Settlement info
  settlementId?: string;
  settled: boolean;
}

/**
 * Financial settlement
 */
export interface Settlement {
  id: string;
  ecosystemId: string;
  organizationId: string;
  organizationName: string;
  status: SettlementStatus;

  // Amounts
  totalAmount: number;
  issuanceAmount: number;
  verificationAmount: number;
  revocationAmount?: number;
  currency: string;

  // Dates
  periodStart: string;
  periodEnd: string;
  processedAt?: string;
  approvedAt?: string;
  completedAt?: string;

  // Details
  transactionCount: number;
  paymentReference?: string;
  notes?: string;
}

/**
 * Application to join ecosystem
 */
export interface Application {
  id: string;
  ecosystemId: string;
  organizationId: string;
  organizationName: string;
  organizationLogo?: string;
  status: ApplicationStatus;
  membershipType: MembershipType;

  // Application details
  message?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

/**
 * Ecosystem analytics data
 */
export interface EcosystemAnalytics {
  ecosystemId: string;
  period: {
    start: string;
    end: string;
  };

  // Transaction metrics
  totalTransactions: number;
  issuanceCount: number;
  verificationCount: number;
  revocationCount: number;

  // Financial metrics
  totalRevenue: number;
  issuanceRevenue: number;
  verificationRevenue: number;
  revocationRevenue?: number;

  // Organization metrics
  activeOrganizations: number;
  newOrganizations: number;

  // Trend data for charts
  transactionTrend: Array<{
    date: string;
    count: number;
    type: TransactionType;
  }>;

  revenueTrend: Array<{
    date: string;
    amount: number;
  }>;

  organizationPerformance: Array<{
    organizationId: string;
    organizationName: string;
    transactionCount: number;
    revenue: number;
  }>;
}

/**
 * Ecosystem health metrics
 */
export interface EcosystemHealth {
  ecosystemId: string;
  score: number; // 0-100
  status: "healthy" | "warning" | "critical";

  indicators: {
    activeOrganizations: {
      value: number;
      status: "good" | "warning" | "critical";
    };
    transactionVolume: {
      value: number;
      trend: "up" | "down" | "stable";
      status: "good" | "warning" | "critical";
    };
    revenue: {
      value: number;
      trend: "up" | "down" | "stable";
      status: "good" | "warning" | "critical";
    };
    settlementHealth: {
      pendingCount: number;
      overdueCount: number;
      status: "good" | "warning" | "critical";
    };
  };

  recommendations?: string[];
  lastUpdated: string;
}

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Request to create new ecosystem
 */
export interface CreateEcosystemRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  businessModel: BusinessModel;
  membershipFee?: number;
  transactionFee?: number;
}

/**
 * Request to update ecosystem
 */
export interface UpdateEcosystemRequest {
  name?: string;
  description?: string;
  logoUrl?: string;
  status?: EcosystemStatus;
  businessModel?: BusinessModel;
  membershipFee?: number;
  transactionFee?: number;
}

/**
 * Request to add organization to ecosystem
 * Updated to match new API spec (ecosystemRole array)
 */
export interface AddOrganizationRequest {
  orgId: string;
  ecosystemRole: string[]; // Array of roles: ECOSYSTEM_LEAD, ECOSYSTEM_MEMBER, ECOSYSTEM_ISSUER, ECOSYSTEM_VERIFIER
}

/**
 * Revenue sharing configuration
 */
export interface RevenueSharing {
  platformShare: number;
  ecosystemShare: number;
  issuerShare: number; // Used for both issuance and verification - Issuer gets share of verification revenue too
}

/**
 * Request to set credential pricing
 */
export interface SetPricingRequest {
  schemaId: string;
  credentialDefinitionId?: string; // Deprecated, keeping for backward compatibility
  issuancePrice: number;
  verificationPrice: number;
  revocationPrice?: number;
  currency?: string;
  issuanceRevenueSharing?: RevenueSharing;
  verificationRevenueSharing?: RevenueSharing;
  effectiveDate?: string;
  expirationDate?: string | null;
}

/**
 * Request to submit application
 */
export interface SubmitApplicationRequest {
  organizationId: string;
  membershipType: MembershipType;
  message?: string;
}

/**
 * Request to review application
 */
export interface ReviewApplicationRequest {
  status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED;
  notes?: string;
}

/**
 * Request to send invitation
 */
export interface SendInvitationRequest {
  organizationId: string;
  membershipType: MembershipType;
  message?: string;
}

/**
 * Request to process settlement
 */
export interface ProcessSettlementRequest {
  organizationId: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Request to complete settlement
 */
export interface CompleteSettlementRequest {
  paymentReference: string;
  notes?: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Query parameters for list endpoints
 * Updated to match new API spec (pageNumber/pageSize)
 */
export interface ListQueryParams {
  pageNumber?: number; // Page number for pagination
  pageSize?: number;   // Number of items per page
  search?: string;     // Search term for filtering
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Query parameters for ecosystem list
 */
export interface EcosystemListParams extends ListQueryParams {
  status?: EcosystemStatus;
  businessModel?: BusinessModel;
}

/**
 * Query parameters for organization list
 */
export interface OrganizationListParams extends ListQueryParams {
  membershipType?: MembershipType;
  status?: MembershipStatus;
}

/**
 * Query parameters for transaction list
 */
export interface TransactionListParams extends ListQueryParams {
  organizationId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  settled?: boolean;
}

/**
 * Query parameters for settlement list
 */
export interface SettlementListParams extends ListQueryParams {
  organizationId?: string;
  status?: SettlementStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Query parameters for analytics
 */
export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  organizationId?: string;
}

/**
 * Settlement statistics
 */
export interface SettlementStats {
  totalPending: number;
  totalProcessing: number;
  totalApproved: number;
  totalCompleted: number;
  totalAmount: number;
  currency: string;
}

/**
 * Onboarding statistics
 */
export interface OnboardingStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalInvitations: number;
  acceptedInvitations: number;
}

/**
 * Request to update schema pricing in ecosystem
 * All fields optional - only include fields to update
 * IMPORTANT: When updating revenue shares for an operation, ALL 3 shares required and must total 100%
 * Updated to match API Guide v1.1.0
 */
export interface UpdateSchemaPricingRequest {
  // Pricing fields (optional)
  issuancePrice?: number;
  verificationPrice?: number;
  revocationPrice?: number;
  currency?: string;

  // Issuance Revenue Sharing (if updating, all 3 required and must total 100%)
  issuancePlatformShare?: number;
  issuanceEcosystemShare?: number;
  issuanceIssuerShare?: number;

  // Verification Revenue Sharing (if updating, all 3 required and must total 100%)
  verificationPlatformShare?: number;
  verificationEcosystemShare?: number;
  verificationIssuerShare?: number;

  // Revocation Revenue Sharing (if updating, all 3 required and must total 100%)
  revocationPlatformShare?: number;
  revocationEcosystemShare?: number;
  revocationIssuerShare?: number;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Validation result for revenue sharing
 */
export interface RevenueShareValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validation result for schema pricing
 */
export interface PricingValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Ecosystem card display data
 */
export interface EcosystemCardData {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  status: EcosystemStatus;
  organizationCount: number;
  transactionCount: number;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Dashboard summary data
 */
export interface EcosystemDashboardSummary {
  ecosystem: Ecosystem;
  recentTransactions: EcosystemTransaction[];
  topOrganizations: EcosystemOrganization[];
  healthScore: number;
  totalRevenue: number;
  pendingSettlements: number;
  pendingApplications: number;
}
