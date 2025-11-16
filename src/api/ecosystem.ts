/**
 * Ecosystem API Service
 *
 * This service provides methods to interact with the Ecosystem Coordination Layer API.
 * All methods follow the existing pattern from organization.ts
 *
 * @module api/ecosystem
 */

import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
} from "../services/apiRequests";

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

import type {
  Ecosystem,
  EcosystemOrganization,
  CredentialPricing,
  EcosystemTransaction,
  Settlement,
  Application,
  EcosystemAnalytics,
  EcosystemHealth,
  CreateEcosystemRequest,
  UpdateEcosystemRequest,
  AddOrganizationRequest,
  SetPricingRequest,
  SubmitApplicationRequest,
  ReviewApplicationRequest,
  SendInvitationRequest,
  ProcessSettlementRequest,
  CompleteSettlementRequest,
  ApiResponse,
  PaginatedResponse,
  EcosystemListParams,
  OrganizationListParams,
  TransactionListParams,
  SettlementListParams,
  AnalyticsQueryParams,
  SettlementStats,
  OnboardingStats,
  SchemaListParams,
  AddSchemaToEcosystemRequest,
  UpdateSchemaPricingRequest,
} from "../types/ecosystem";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get authorization config
 */
const getAuthConfig = async () => {
  const token = await getFromLocalStorage(storageKeys.TOKEN);
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Build query string from params
 */
const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return "";
  const filtered = Object.entries(params).filter(([_, v]) => v !== undefined);
  if (filtered.length === 0) return "";
  const query = new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)])
  ).toString();
  return `?${query}`;
};

// ============================================
// CORE ECOSYSTEM OPERATIONS
// ============================================

/**
 * Get list of ecosystems
 * @param params - Query parameters for filtering and pagination
 * @returns Promise with paginated list of ecosystems
 */
export const getEcosystems = async (params?: EcosystemListParams) => {
  const url = `${apiRoutes.Ecosystem.list}${buildQueryString(params)}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch ecosystems");
  }
};

/**
 * Get ecosystem by ID
 * @param ecosystemId - Ecosystem ID
 * @returns Promise with ecosystem details
 */
export const getEcosystem = async (ecosystemId: string) => {
  const url = `${apiRoutes.Ecosystem.getById}/${ecosystemId}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch ecosystem");
  }
};

/**
 * Create new ecosystem
 * @param data - Ecosystem creation data
 * @returns Promise with created ecosystem
 */
export const createEcosystem = async (data: CreateEcosystemRequest) => {
  const url = apiRoutes.Ecosystem.create;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to create ecosystem");
  }
};

/**
 * Update ecosystem
 * @param ecosystemId - Ecosystem ID
 * @param data - Update data
 * @returns Promise with updated ecosystem
 */
export const updateEcosystem = async (
  ecosystemId: string,
  data: UpdateEcosystemRequest
) => {
  const url = `${apiRoutes.Ecosystem.update}/${ecosystemId}`;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPut({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to update ecosystem");
  }
};

/**
 * Delete ecosystem
 * @param ecosystemId - Ecosystem ID
 * @returns Promise with deletion confirmation
 */
export const deleteEcosystem = async (ecosystemId: string) => {
  const url = `${apiRoutes.Ecosystem.delete}/${ecosystemId}`;
  const config = await getAuthConfig();

  try {
    return await axiosDelete({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to delete ecosystem");
  }
};

// ============================================
// ORGANIZATION MANAGEMENT
// ============================================

/**
 * Get organizations in ecosystem
 * @param ecosystemId - Ecosystem ID
 * @param params - Query parameters
 * @returns Promise with paginated list of organizations
 */
export const getOrganizations = async (
  ecosystemId: string,
  params?: OrganizationListParams
) => {
  const url = `${
    apiRoutes.Ecosystem.organizations
  }/${ecosystemId}/organizations${buildQueryString(params)}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch organizations");
  }
};

/**
 * Add organization to ecosystem
 * @param ecosystemId - Ecosystem ID
 * @param data - Organization data
 * @returns Promise with added organization
 */
export const addOrganization = async (
  ecosystemId: string,
  data: AddOrganizationRequest
) => {
  const url = `${apiRoutes.Ecosystem.organizations}/${ecosystemId}/organizations`;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to add organization");
  }
};

/**
 * Remove organization from ecosystem
 * @param ecosystemId - Ecosystem ID
 * @param organizationId - Organization ID
 * @returns Promise with deletion confirmation
 */
export const removeOrganization = async (
  ecosystemId: string,
  organizationId: string
) => {
  const url = `${apiRoutes.Ecosystem.organization}/${ecosystemId}/organizations/${organizationId}`;
  const config = await getAuthConfig();

  try {
    return await axiosDelete({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to remove organization");
  }
};

/**
 * Get organization performance metrics
 * @param ecosystemId - Ecosystem ID
 * @param organizationId - Organization ID
 * @returns Promise with performance data
 */
export const getOrgPerformance = async (
  ecosystemId: string,
  organizationId: string
) => {
  const url = `${apiRoutes.Ecosystem.orgPerformance}/${ecosystemId}/organizations/${organizationId}/performance`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch organization performance");
  }
};

// ============================================
// PRICING MANAGEMENT
// ============================================

/**
 * Get credential pricing
 * @param ecosystemId - Ecosystem ID
 * @returns Promise with pricing list
 */
export const getPricing = async (ecosystemId: string) => {
  const url = `${apiRoutes.Ecosystem.pricing}/${ecosystemId}/pricing`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch pricing");
  }
};

/**
 * Set credential pricing
 * @param ecosystemId - Ecosystem ID
 * @param data - Pricing data
 * @returns Promise with created pricing
 */
export const setPricing = async (
  ecosystemId: string,
  data: SetPricingRequest
) => {
  const url = `${apiRoutes.Ecosystem.pricing}/${ecosystemId}/pricing`;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to set pricing");
  }
};

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

/**
 * Get transactions
 * @param ecosystemId - Ecosystem ID
 * @param params - Query parameters
 * @returns Promise with paginated transactions
 */
export const getTransactions = async (
  ecosystemId: string,
  params?: TransactionListParams
) => {
  const url = `${
    apiRoutes.Ecosystem.transactions
  }/${ecosystemId}/transactions${buildQueryString(params)}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch transactions");
  }
};

// ============================================
// SETTLEMENT MANAGEMENT
// ============================================

/**
 * Get settlements
 * @param ecosystemId - Ecosystem ID
 * @param params - Query parameters
 * @returns Promise with paginated settlements
 */
export const getSettlements = async (
  ecosystemId: string,
  params?: SettlementListParams
) => {
  const url = `${
    apiRoutes.Ecosystem.settlements
  }/${ecosystemId}/settlements${buildQueryString(params)}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch settlements");
  }
};

/**
 * Process settlement
 * @param ecosystemId - Ecosystem ID
 * @param data - Settlement processing data
 * @returns Promise with processed settlement
 */
export const processSettlement = async (
  ecosystemId: string,
  data: ProcessSettlementRequest
) => {
  const url = `${apiRoutes.Ecosystem.processSettlement}/${ecosystemId}/settlements/process`;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to process settlement");
  }
};

/**
 * Approve settlement
 * @param ecosystemId - Ecosystem ID
 * @param settlementId - Settlement ID
 * @returns Promise with approved settlement
 */
export const approveSettlement = async (
  ecosystemId: string,
  settlementId: string
) => {
  const url = `${apiRoutes.Ecosystem.approveSettlement}/${ecosystemId}/settlements/${settlementId}/approve`;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload: {}, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to approve settlement");
  }
};

/**
 * Complete settlement
 * @param ecosystemId - Ecosystem ID
 * @param settlementId - Settlement ID
 * @param data - Completion data
 * @returns Promise with completed settlement
 */
export const completeSettlement = async (
  ecosystemId: string,
  settlementId: string,
  data: CompleteSettlementRequest
) => {
  const url = `${apiRoutes.Ecosystem.completeSettlement}/${ecosystemId}/settlements/${settlementId}/complete`;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to complete settlement");
  }
};

/**
 * Get settlement statistics
 * @param ecosystemId - Ecosystem ID
 * @returns Promise with settlement stats
 */
export const getSettlementStats = async (ecosystemId: string) => {
  const url = `${apiRoutes.Ecosystem.settlementStats}/${ecosystemId}/settlements/stats`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch settlement stats");
  }
};

// ============================================
// ANALYTICS
// ============================================

/**
 * Get ecosystem analytics
 * @param ecosystemId - Ecosystem ID
 * @param params - Query parameters
 * @returns Promise with analytics data
 */
export const getAnalytics = async (
  ecosystemId: string,
  params?: AnalyticsQueryParams
) => {
  const url = `${
    apiRoutes.Ecosystem.analytics
  }/${ecosystemId}/analytics${buildQueryString(params)}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch analytics");
  }
};

/**
 * Get ecosystem health metrics
 * @param ecosystemId - Ecosystem ID
 * @returns Promise with health data
 */
export const getHealth = async (ecosystemId: string) => {
  const url = `${apiRoutes.Ecosystem.health}/${ecosystemId}/health`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch health metrics");
  }
};

// ============================================
// ONBOARDING
// ============================================

/**
 * Submit application to join ecosystem
 * @param ecosystemId - Ecosystem ID
 * @param data - Application data
 * @returns Promise with submitted application
 */
export const submitApplication = async (
  ecosystemId: string,
  data: SubmitApplicationRequest
) => {
  const url = `${apiRoutes.Ecosystem.applications}/${ecosystemId}/applications`;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to submit application");
  }
};

/**
 * Get applications
 * @param ecosystemId - Ecosystem ID
 * @param status - Filter by status
 * @returns Promise with applications list
 */
export const getApplications = async (ecosystemId: string, status?: string) => {
  const queryParams = status ? { status } : undefined;
  const url = `${
    apiRoutes.Ecosystem.applications
  }/${ecosystemId}/applications${buildQueryString(queryParams)}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch applications");
  }
};

/**
 * Review application
 * @param ecosystemId - Ecosystem ID
 * @param applicationId - Application ID
 * @param data - Review decision
 * @returns Promise with reviewed application
 */
export const reviewApplication = async (
  ecosystemId: string,
  applicationId: string,
  data: ReviewApplicationRequest
) => {
  const url = `${apiRoutes.Ecosystem.reviewApplication}/${ecosystemId}/applications/${applicationId}/review`;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to review application");
  }
};

/**
 * Send invitation to organization
 * @param ecosystemId - Ecosystem ID
 * @param data - Invitation data
 * @returns Promise with sent invitation
 */
export const sendInvitation = async (
  ecosystemId: string,
  data: SendInvitationRequest
) => {
  const url = `${apiRoutes.Ecosystem.invitations}/${ecosystemId}/users/invitations`;
  const payload = data;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to send invitation");
  }
};

/**
 * Get ecosystem invitations
 * @param ecosystemId - Ecosystem ID
 * @param params - Query parameters
 * @returns Promise with paginated invitations list
 */
export const getEcosystemInvitations = async (
  ecosystemId: string,
  params?: { pageNumber?: number; pageSize?: number; search?: string }
) => {
  const url = `${
    apiRoutes.Ecosystem.getInvitations
  }/${ecosystemId}/users/invitations${buildQueryString(params)}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch invitations");
  }
};

/**
 * Accept invitation
 * @param invitationId - Invitation ID
 * @returns Promise with acceptance confirmation
 */
export const acceptInvitation = async (invitationId: string) => {
  const url = `${apiRoutes.Ecosystem.acceptInvitation}/${invitationId}/accept`;
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload: {}, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to accept invitation");
  }
};

/**
 * Get onboarding statistics
 * @param ecosystemId - Ecosystem ID
 * @returns Promise with onboarding stats
 */
export const getOnboardingStats = async (ecosystemId: string) => {
  const url = `${apiRoutes.Ecosystem.onboardingStats}/${ecosystemId}/onboarding/stats`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch onboarding stats");
  }
};

// ============================================
// SCHEMA WHITELISTING MANAGEMENT
// ============================================

/**
 * Get whitelisted schemas for ecosystem
 * @param ecosystemId - Ecosystem ID
 * @param params - Query parameters (pageNumber, pageSize, searchByText)
 * @returns Promise with list of whitelisted schemas
 */
export const getEcosystemSchemas = async (
  ecosystemId: string,
  params?: SchemaListParams
) => {
  const url = `${
    apiRoutes.Ecosystem.schemas
  }/${ecosystemId}/schemas${buildQueryString(params)}`;
  const config = await getAuthConfig();

  console.log("� [getEcosystemSchemas API] Request:", {
    ecosystemId,
    params,
    url,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await axiosGet({ url, config });

    // Backend returns schemas inside data.schemas
    const schemasArray = Array.isArray(response.data?.data?.schemas)
      ? response.data.data.schemas
      : [];

    // Log detailed response structure
    console.log("✅ [getEcosystemSchemas API] Response:", {
      status: response.status,
      statusCode: response.data?.statusCode,
      message: response.data?.message,
      schemasCount: schemasArray.length,
      firstSchema: schemasArray[0]
        ? {
            id: schemasArray[0].id,
            schemaId: schemasArray[0].schemaId,
            schemaName: schemasArray[0].schema?.name,
            schemaLedgerId: schemasArray[0].schema?.schemaLedgerId,
            schemaLedgerId_from_top_level: schemasArray[0].schemaLedgerId,
          }
        : null,
      allSchemas: schemasArray.map((s: any) => ({
        id: s.id,
        schemaId: s.schemaId,
        name: s.schema?.name,
        schemaLedgerId: s.schemaLedgerId,
      })),
      timestamp: new Date().toISOString(),
    });

    console.log(
      "🔍 [getEcosystemSchemas API] RAW response.data:",
      JSON.stringify(response.data, null, 2)
    );

    return response;
  } catch (error) {
    console.error("❌ [getEcosystemSchemas API] Error:", {
      ecosystemId,
      params,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch ecosystem schemas");
  }
};

/**
 * Add schema to ecosystem whitelist
 * @param ecosystemId - Ecosystem ID
 * @param data - Schema to add (schemaId, governanceLevel, usagePolicy)
 * @returns Promise with added schema relationship
 */
export const addSchemaToEcosystem = async (
  ecosystemId: string,
  data: AddSchemaToEcosystemRequest
) => {
  const url = `${apiRoutes.Ecosystem.schemas}/${ecosystemId}/schemas`;
  const payload = data;
  const config = await getAuthConfig();

  console.log("🔵 [addSchemaToEcosystem API] Request:", {
    ecosystemId,
    url,
    payload,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await axiosPost({ url, payload, config });
    console.log("✅ [addSchemaToEcosystem API] Response:", {
      status: response.status,
      statusCode: response.data?.statusCode,
      message: response.data?.message,
      data: response.data?.data,
      timestamp: new Date().toISOString(),
    });
    console.log(
      "🔍 [addSchemaToEcosystem API] RAW response.data:",
      JSON.stringify(response.data, null, 2)
    );
    return response;
  } catch (error) {
    console.error("❌ [addSchemaToEcosystem API] Error:", {
      ecosystemId,
      payload,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });
    const err = error as Error;
    throw new Error(err?.message || "Failed to add schema to ecosystem");
  }
};

/**
 * Update schema pricing in ecosystem
 * Updated to match API Guide v1.1.0 - supports three-way revenue splits
 *
 * IMPORTANT: When updating revenue shares for an operation,
 * ALL 3 shares (platform, ecosystem, issuer/verifier) must be provided
 * and must total exactly 100%
 *
 * @param ecosystemId - Ecosystem ID
 * @param schemaId - Schema ID (the relationship ID, not schemaLedgerId)
 * @param pricing - Pricing update data
 * @returns Promise with updated pricing
 */
export const updateSchemaPricing = async (
  ecosystemId: string,
  schemaId: string,
  pricing: UpdateSchemaPricingRequest
) => {
  const url = `${apiRoutes.Ecosystem.schemaPricing}/${ecosystemId}/schemas/${schemaId}/pricing`;
  const payload = pricing;
  const config = await getAuthConfig();

  console.log("🔵 [updateSchemaPricing API] Request:", {
    ecosystemId,
    schemaId,
    url,
    payload,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await axiosPut({ url, payload, config });
    console.log("✅ [updateSchemaPricing API] Response:", {
      status: response.status,
      statusCode: response.data?.statusCode,
      message: response.data?.message,
      timestamp: new Date().toISOString(),
    });
    return response;
  } catch (error) {
    console.error("❌ [updateSchemaPricing API] Error:", {
      ecosystemId,
      schemaId,
      payload,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });
    const err = error as Error;
    throw new Error(err?.message || "Failed to update schema pricing");
  }
};

/**
 * Remove schema from ecosystem whitelist
 * @param ecosystemId - Ecosystem ID
 * @param schemaId - Schema ID to remove
 * @returns Promise with deletion confirmation
 */
export const removeSchemaFromEcosystem = async (
  ecosystemId: string,
  schemaId: string
) => {
  const url = `${apiRoutes.Ecosystem.schemas}/${ecosystemId}/schemas/${schemaId}`;
  const config = await getAuthConfig();

  console.log("🔵 [removeSchemaFromEcosystem API] Request:", {
    ecosystemId,
    schemaId,
    url,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await axiosDelete({ url, config });
    console.log("✅ [removeSchemaFromEcosystem API] Response:", {
      status: response.status,
      statusCode: response.data?.statusCode,
      message: response.data?.message,
      timestamp: new Date().toISOString(),
    });
    return response;
  } catch (error) {
    console.error("❌ [removeSchemaFromEcosystem API] Error:", {
      ecosystemId,
      schemaId,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });
    const err = error as Error;
    throw new Error(err?.message || "Failed to remove schema from ecosystem");
  }
};
