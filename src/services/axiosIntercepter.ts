import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { envConfig } from "../config/envConfig";
import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage, setToLocalStorage } from "../api/Auth";
import { apiStatusCodes, storageKeys } from "../config/CommonConstant";
import { TokenRefreshManager } from "../utils/tokenRefreshManager";
import { APILogger } from "../utils/logger";

// Use PUBLIC_API_URL for browser requests (publicly accessible URL)
// In Docker, PUBLIC_BASE_URL may be internal (e.g., http://nginx-proxy:5000)
// but browsers need the public URL (e.g., https://platform.getconfirmd.com)
const instance = axios.create({
  baseURL: envConfig.PUBLIC_API_URL || envConfig.PUBLIC_BASE_URL,
});

const EcosystemInstance = axios.create({
  baseURL: envConfig.PUBLIC_API_URL || envConfig.PUBLIC_ECOSYSTEM_BASE_URL,
});

const checkAuthentication = async (
  sessionCookie: string,
  request: AxiosRequestConfig
) => {
  const authId = Math.random().toString(36).substr(2, 8);

  const isAuthPage =
    window.location.href.includes("/authentication/sign-in") ||
    window.location.href.includes("/authentication/sign-up");

  // Log authentication check start
  APILogger.logAuth("auth_check_start", {
    authId,
    location: window.location.href,
    isAuthPage,
    hasToken: !!sessionCookie,
  });

  try {
    // Use PUBLIC_API_URL for browser requests (publicly accessible)
    const baseURL = envConfig.PUBLIC_API_URL || envConfig.PUBLIC_BASE_URL;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionCookie}`,
      },
      method: "GET",
    };

    const profileUrl = `${baseURL + apiRoutes.users.userProfile}`;

    const res = await fetch(profileUrl, {
      ...config,
    });

    const userData = await res.json();

    if (userData.statusCode === apiStatusCodes.API_STATUS_UNAUTHORIZED) {
      // Log unauthorized status
      APILogger.logAuth("unauthorized_detected", {
        authId,
        status: userData.statusCode,
      });

      if (sessionCookie && !isAuthPage) {
        // Log token refresh attempt
        APILogger.logTokenRefresh(false, "Attempting token refresh");

        // Use TokenRefreshManager for consistent token refresh handling
        const refreshResult = await TokenRefreshManager.refreshTokens();

        // Log refresh result
        APILogger.logTokenRefresh(refreshResult.success, refreshResult.error);

        if (
          refreshResult.success &&
          refreshResult.newToken &&
          request.headers
        ) {
          request.headers.Authorization = `Bearer ${refreshResult.newToken}`;
          APILogger.logAuth("token_refreshed", { authId });
          return;
        } else {
          // Handle specific case where refresh token has expired
          if (refreshResult.error === "REFRESH_TOKEN_EXPIRED") {
            await TokenRefreshManager.clearStoredTokens();
          }
        }

        // If refresh fails, redirect to login
        APILogger.logAuth("redirect_to_login", { authId, reason: "refresh_failed" });
        window.location.assign("/authentication/sign-in");
      } else {
        APILogger.logAuth("redirect_to_login", { authId, reason: "no_token_or_auth_page" });
        window.location.assign("/authentication/sign-in");
      }
    } else {
      APILogger.logAuth("auth_check_success", { authId });
    }
  } catch (error) {
    APILogger.logAuth("auth_check_error", { authId, error: String(error) });
  }
};

instance.interceptors.request.use(
  async (config) => {
    // Use PUBLIC_API_URL for browser requests (publicly accessible)
    config.baseURL = envConfig.PUBLIC_API_URL || envConfig.PUBLIC_BASE_URL;
    return config;
  },
  (error) => Promise.reject(error)
);

EcosystemInstance.interceptors.request.use(
  async (config) => {
    // Use PUBLIC_API_URL for browser requests (publicly accessible)
    config.baseURL = envConfig.PUBLIC_API_URL || envConfig.PUBLIC_ECOSYSTEM_BASE_URL;
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async function (error) {
    const interceptorId = Math.random().toString(36).substr(2, 8);

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const isAuthPage =
      window.location.href.includes("/authentication/sign-in") ||
      window.location.href.includes("/authentication/sign-up");
    const errorRes = error?.response;
    const originalRequest = error.config;

    // Log interceptor error
    APILogger.logError(
      originalRequest?.method?.toUpperCase() || "UNKNOWN",
      originalRequest?.url || "UNKNOWN",
      error
    );

    const token = await getFromLocalStorage(storageKeys.TOKEN);

    if (errorRes?.status === 401 && !isAuthPage) {
      APILogger.logAuth("401_error_detected", { interceptorId });
      await checkAuthentication(token, originalRequest);
    }

    return Promise.reject(error);
  }
);

export { instance, EcosystemInstance };
