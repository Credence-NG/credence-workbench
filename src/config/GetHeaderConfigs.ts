import { getFromLocalStorage } from "../api/Auth";
import { storageKeys } from "./CommonConstant";

// Only include headers that should be sent in API requests
const commonHeaders = {
  Accept: "application/json",
  // Remove all the security headers - they belong in responses only
};

export const getHeaderConfigs = async (tokenVal?: string) => {
  const token =
    (await getFromLocalStorage(storageKeys.TOKEN)) ||
    (typeof tokenVal === "string" ? tokenVal : "");

  return {
    headers: {
      ...commonHeaders,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getHeaderConfigsForFormData = async () => {
  const token = await getFromLocalStorage(storageKeys.TOKEN);

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData - let browser set it with boundary
    },
  };
};
