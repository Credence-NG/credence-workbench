import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
} from "../services/apiRequests";
import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

export interface CreateOrgAppPayload {
  name: string;
  description: string;
  webhookUrl: string;
  webhookSecret: string;
  clientContext?: Record<string, any>;
}

export interface UpdateOrgAppPayload {
  name?: string;
  description?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  clientContext?: Record<string, any>;
}

export interface OrgApp {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  webhookUrl: string;
  webhookSecret?: string;
  isActive?: boolean;
  clientContext?: Record<string, any>;
  createDateTime?: string;
  lastChangedDateTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create a new organization app/webhook
 */
export const createOrgApp = async (payload: CreateOrgAppPayload) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN);
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

  const url = `${apiRoutes.organizations.root}/${orgId}/apps`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  // Detailed logging for debugging
  console.group("🔍 CREATE WEBHOOK APP REQUEST");
  console.log("📍 Request URL:", url);
  console.log("🔑 Org ID:", orgId);
  console.log("📦 Actual Payload Being Sent:", payload);
  console.log("📦 Payload Keys:", Object.keys(payload));
  console.log("🔧 Headers:", {
    "Content-Type": config.headers["Content-Type"],
    Authorization: token ? `Bearer ${token.substring(0, 10)}...` : "No token",
  });
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.groupEnd();

  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    console.log("🚀 Sending POST request...");
    const response = await axiosPost(axiosPayload);

    console.group("✅ CREATE WEBHOOK APP SUCCESS");
    console.log("📊 Status:", response?.status);
    console.log("📄 Status Text:", response?.statusText);
    console.log("📦 Response Data:", response?.data);
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.groupEnd();

    return response;
  } catch (error) {
    const err = error as any;

    console.group("❌ CREATE WEBHOOK APP ERROR");
    console.error("🔴 Error Type:", err?.name || "Unknown");
    console.error("💬 Error Message:", err?.message);
    console.error("📊 Response Status:", err?.response?.status);
    console.error("📄 Response Status Text:", err?.response?.statusText);
    console.error("📦 Response Data:", err?.response?.data);
    console.error("🔧 Request Config:", {
      url: err?.config?.url,
      method: err?.config?.method,
      data: err?.config?.data,
    });
    console.error("⏰ Timestamp:", new Date().toISOString());
    console.error("📚 Full Error Object:", err);
    console.groupEnd();

    // Extract more detailed error message
    const errorMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to create organization app";

    throw new Error(errorMessage);
  }
};

/**
 * Get all organization apps/webhooks
 */
export const getOrgApps = async () => {
  const token = await getFromLocalStorage(storageKeys.TOKEN);
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

  const url = `${apiRoutes.organizations.root}/${orgId}/apps`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  console.log("🔍 Fetching org apps from URL:", url);

  const axiosPayload = {
    url,
    config,
  };

  try {
    const response = await axiosGet(axiosPayload);
    console.log("✅ Get org apps response:", response);
    return response;
  } catch (error) {
    const err = error as any;
    console.error("❌ Get org apps error:", err);
    console.error("❌ Error response:", err?.response?.data);
    throw new Error(err?.message || "Failed to fetch organization apps");
  }
};

/**
 * Update an organization app/webhook
 */
export const updateOrgApp = async (
  appId: string,
  payload: UpdateOrgAppPayload
) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN);
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

  const url = `${apiRoutes.organizations.root}/${orgId}/apps/${appId}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  console.log("🔍 Updating org app with payload:", payload);
  console.log("🔍 Request URL:", url);

  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPut(axiosPayload);
  } catch (error) {
    const err = error as any;
    console.error("❌ Update org app error:", err);
    console.error("❌ Error response data:", err?.response?.data);
    console.error("❌ Error response status:", err?.response?.status);

    const errorMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to update organization app";

    throw new Error(errorMessage);
  }
};

/**
 * Delete an organization app/webhook
 */
export const deleteOrgApp = async (appId: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN);
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

  const url = `${apiRoutes.organizations.root}/${orgId}/apps/${appId}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosDelete(axiosPayload);
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to delete organization app");
  }
};
