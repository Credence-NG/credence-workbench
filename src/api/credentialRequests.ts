import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";
import { getHeaderConfigs } from "../config/GetHeaderConfigs";
import { apiRoutes } from "../config/apiRoutes";
import { axiosGet, axiosPut } from "../services/apiRequests";

/**
 * Comprehensive TypeScript interfaces for Credential Request system
 *
 * This file defines the complete data structure for credential requests including:
 * - Main CredentialRequest interface with all fields
 * - Supporting interfaces for nested objects (Schema, Organization, etc.)
 * - Utility types for status, verification methods, and request sources
 * - Filter and parameter interfaces for API calls
 * - Helper functions for data manipulation
 *
 * Based on the API response structure from the credential request system.
 */

// Schema attribute interface
export interface SchemaAttribute {
  attributeName: string;
  schemaDataType: string;
  displayName: string;
  isRequired: boolean;
}

// Schema interface
export interface Schema {
  id: string;
  name: string;
  version: string;
  attributes: string; // JSON string of SchemaAttribute[]
}

// Credential Definition interface
export interface CredentialDefinition {
  id: string;
  credentialDefinitionId: string;
  tag: string;
  schema: Schema;
  schemaLedgerId: string;
}

// Organization interface
export interface Organization {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
}

// Request metadata interface
export interface RequestMetadata {
  verificationMethod: string;
  source: string;
  requestNumber: string;
}

// Original request data interface
export interface OriginalRequest {
  lastName: string;
  firstName: string;
  nationalId: string;
  otherNames?: string;
  dateOfBirth: string;
  phoneNumber: string;
  faceLivenessCapture?: string;
  [key: string]: any; // Allow for additional dynamic fields
}

// Request data interface
export interface RequestData {
  originalRequest: OriginalRequest;
  metadata: RequestMetadata;
  attachments: any[];
}

// Status history interface (for future use)
export interface StatusHistory {
  status: string;
  timestamp: string;
  updatedBy?: string;
  notes?: string;
}

// Main credential request interface
export interface CredentialRequest {
  id: string;
  status: string;
  createdAt: string | null;
  updatedAt: string;
  organizationId: string;
  requesterFirstName: string;
  requesterLastName: string;
  requesterEmail: string | null;
  requesterPhoneNumber: string;
  requesterNationalId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  nationalIdNumber: string;
  connectionId?: string | null;
  orgId: string;
  schemaId: string;
  credentialDefinitionId: string;
  requestedAttributes: any[];
  requestData: RequestData;
  credentialDefinition: CredentialDefinition;
  organisation: Organization;
  reviewedByUser: string | null;
  statusHistory: StatusHistory[];
  verificationMethod: string;
  source: string;
  requestNumber: string;
  submittedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  issuedAt: string | null;
  rejectionReason: string | null;
  internalNotes: string | null;
}

// Simplified interface for list views
export interface CredentialRequestSummary {
  id: string;
  status: string;
  createdAt: string | null;
  requesterFirstName: string;
  requesterLastName: string;
  phoneNumber: string;
  nationalIdNumber: string;
  requestNumber: string;
  verificationMethod: string;
  source: string;
}

// Legacy interface for backward compatibility
export interface CredentialRequestDetails extends CredentialRequest {
  // This extends the main interface for backward compatibility
}

// Response interfaces
export interface CredentialRequestsResponse {
  data: {
    requests: CredentialRequest[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}

export interface CredentialRequestDetailsResponse {
  data: CredentialRequest;
}

// Utility types
export type CredentialRequestStatus =
  | "submitted"
  | "pending"
  | "proposal-sent"
  | "proposal-received"
  | "offer-sent"
  | "offer-received"
  | "declined"
  | "request-sent"
  | "request-received"
  | "credential-issued"
  | "credential-received"
  | "done"
  | "abandoned";

export type VerificationMethod = "phone" | "email" | "biometric" | "document";
export type RequestSource = "mobile_app" | "web_portal" | "api" | "admin_panel";

// Filter and search interfaces
export interface CredentialRequestFilters {
  status?: CredentialRequestStatus;
  verificationMethod?: VerificationMethod;
  source?: RequestSource;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export interface CredentialRequestParams extends CredentialRequestFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Utility functions
export const parseSchemaAttributes = (
  attributesString: string
): SchemaAttribute[] => {
  try {
    return JSON.parse(attributesString) as SchemaAttribute[];
  } catch (error) {
    console.warn("Failed to parse schema attributes:", error);
    return [];
  }
};

export const formatRequestDisplayName = (
  request: CredentialRequest
): string => {
  return `${request.firstName} ${request.lastName}`.trim();
};

export const getRequestStatusLabel = (
  status: CredentialRequestStatus
): string => {
  const statusLabels: Record<CredentialRequestStatus, string> = {
    submitted: "Submitted",
    pending: "Pending",
    "proposal-sent": "Proposal Sent",
    "proposal-received": "Proposal Received",
    "offer-sent": "Offer Sent",
    "offer-received": "Offer Received",
    declined: "Declined",
    "request-sent": "Request Sent",
    "request-received": "Request Received",
    "credential-issued": "Credential Issued",
    "credential-received": "Credential Received",
    done: "Done",
    abandoned: "Abandoned",
  };
  return statusLabels[status] || status;
};

export const getCredentialRequests = async (
  params: CredentialRequestParams = {}
): Promise<any> => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

  const {
    page = 1,
    limit = 10,
    searchTerm,
    status,
    verificationMethod,
    source,
    dateFrom,
    dateTo,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  let url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.CredentialRequests.list}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  if (status) {
    url += `&status=${status}`;
  }
  if (verificationMethod) {
    url += `&verificationMethod=${verificationMethod}`;
  }
  if (source) {
    url += `&source=${source}`;
  }
  if (dateFrom) {
    url += `&dateFrom=${dateFrom}`;
  }
  if (dateTo) {
    url += `&dateTo=${dateTo}`;
  }

  console.log("Credential Requests API URL:", url);
  console.log("Parameters passed:", params);

  const axiosPayload = {
    url,
    config: await getHeaderConfigs(),
  };

  try {
    const response = await axiosGet(axiosPayload);
    console.log("Credential Requests API Response:", response);

    // Check if response is a JWT token (starts with eyJ which is base64 for {"alg":...)
    if (typeof response === "string" && response.startsWith("eyJ")) {
      console.error(
        "API returned JWT token instead of data - authentication issue"
      );
      throw new Error(
        "Authentication token returned instead of data. Please check API authentication."
      );
    }

    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getCredentialRequestDetails = async (
  requestId: string
): Promise<any> => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.CredentialRequests.details}/${requestId}`;

  const axiosPayload = {
    url,
    config: await getHeaderConfigs(),
  };

  try {
    const response = await axiosGet(axiosPayload);
    return response;
  } catch (error) {
    const err = error as Error;
    console.error("Credential request details API error:", err?.message);
    return err?.message;
  }
};

export const updateCredentialRequestStatus = async (
  requestId: string,
  status: CredentialRequestStatus,
  rejectionReason?: string,
  internalNotes?: string
): Promise<any> => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.CredentialRequests.updateStatus}/${requestId}`;

  const payload: any = { status };
  if (rejectionReason) payload.rejectionReason = rejectionReason;
  if (internalNotes) payload.internalNotes = internalNotes;

  const axiosPayload = {
    url,
    payload,
    config: await getHeaderConfigs(),
  };

  try {
    const response = await axiosPut(axiosPayload);
    return response;
  } catch (error) {
    const err = error as Error;
    console.error("Update status error:", err);
    return err?.message;
  }
};

export const getCredentialDefinitionAttributes = async (
  credentialDefinitionId: string
) => {
  const url = `https://platform.confamd.com/orgs/public-list-fields-by-creddef/${encodeURIComponent(
    credentialDefinitionId
  )}`;

  // Use direct fetch instead of axios to avoid interceptors that might interfere
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data }; // Wrap in data property to match expected format
  } catch (error) {
    console.error("Credential definition API error:", error);
    const err = error as Error;
    return err?.message;
  }
};
