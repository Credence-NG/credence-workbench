/**
 * Organization Schema API Service
 *
 * Service for fetching schemas from organizations to be used in ecosystem management
 *
 * @module api/organizationSchema
 */

import { axiosGet } from "../services/apiRequests";
import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";
import type {
  Schema,
  SchemaListResponse,
  SchemaListParams,
} from "../types/ecosystem";

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
const buildQueryString = (params?: SchemaListParams): string => {
  if (!params) return "";
  const filtered = Object.entries(params).filter(([_, v]) => v !== undefined);
  if (filtered.length === 0) return "";
  const query = new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)])
  ).toString();
  return `?${query}`;
};

/**
 * Get schemas for a specific organization
 * @param orgId - Organization ID
 * @param params - Query parameters for pagination and search
 * @returns Promise with schema list response
 */
export const getSchemasByOrgId = async (
  orgId: string,
  params?: SchemaListParams
) => {
  const queryString = buildQueryString(params);
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getAll}${queryString}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch schemas");
  }
};

/**
 * Get all schemas across all organizations (for platform admin)
 * This is useful for selecting schemas to link to ecosystems
 * @param params - Query parameters for pagination and search
 * @returns Promise with schema list response
 */
export const getAllOrganizationSchemas = async (params?: SchemaListParams) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN);
  const ledgerId = await getFromLocalStorage(storageKeys.LEDGER_ID);

  const queryParams = {
    pageSize: params?.pageSize || 10,
    pageNumber: params?.pageNumber || 1,
    searchByText: params?.searchByText || "",
    ledgerId: ledgerId || "",
  };

  const queryString = buildQueryString(queryParams);
  const url = `${apiRoutes.Platform.getAllSchemaFromPlatform}${queryString}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch platform schemas");
  }
};

/**
 * Get a single schema by ID
 * @param orgId - Organization ID
 * @param schemaId - Schema ID
 * @returns Promise with schema details
 */
export const getSchemaById = async (orgId: string, schemaId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getSchemaById}/${schemaId}`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch schema");
  }
};
