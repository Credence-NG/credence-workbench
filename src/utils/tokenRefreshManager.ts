import { apiRoutes } from "../config/apiRoutes";
import { envConfig } from "../config/envConfig";
import { apiStatusCodes, storageKeys } from "../config/CommonConstant";
import { getFromLocalStorage, setToLocalStorage } from "../api/Auth";

/**
 * Enhanced token refresh utility that ensures both localStorage and cookies are updated
 */
export class TokenRefreshManager {
  private static isRefreshing = false;
  private static refreshPromise: Promise<any> | null = null;

  /**
   * Log current refresh state for debugging
   */
  static logRefreshState(context: string = ""): void {
    const state = {
      isRefreshing: this.isRefreshing,
      hasPromise: !!this.refreshPromise,
      context: context,
      timestamp: new Date().toISOString(),
    };
    console.log(`📊 [TokenRefreshManager] [State] ${context}:`, state);
  }

  /**
   * Refresh tokens and ensure cookies are synchronized
   */
  static async refreshTokens(): Promise<{
    success: boolean;
    newToken?: string;
    error?: string;
  }> {
    const refreshId = Math.random().toString(36).substr(2, 9);
    const startTime = Date.now();
    console.log(
      `🔄 [TokenRefreshManager] [${refreshId}] Starting token refresh process at ${new Date().toISOString()}`
    );
    this.logRefreshState(`Starting refresh ${refreshId}`);

    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      console.log(
        `⏳ [TokenRefreshManager] [${refreshId}] Refresh already in progress, waiting for existing refresh...`
      );
      try {
        const result = await this.refreshPromise;
        console.log(
          `✅ [TokenRefreshManager] [${refreshId}] Existing refresh completed:`,
          { success: result.success }
        );
        return result;
      } catch (error) {
        console.error(
          `❌ [TokenRefreshManager] [${refreshId}] Waiting for existing refresh failed:`,
          error
        );
        return { success: false, error: "Refresh in progress failed" };
      }
    }

    if (this.isRefreshing) {
      console.log(
        `🚫 [TokenRefreshManager] [${refreshId}] Refresh already in progress, rejecting new request`
      );
      return { success: false, error: "Refresh already in progress" };
    }

    console.log(`🔐 [TokenRefreshManager] [${refreshId}] Setting refresh lock`);
    this.isRefreshing = true;
    this.logRefreshState(`Locked for refresh ${refreshId}`);

    this.refreshPromise = (async () => {
      console.log(
        `🔍 [TokenRefreshManager] [${refreshId}] Checking for refresh token in localStorage`
      );
      try {
        const refreshToken = await getFromLocalStorage(
          storageKeys.REFRESH_TOKEN
        );

        if (!refreshToken) {
          console.error(
            `❌ [TokenRefreshManager] [${refreshId}] No refresh token found in localStorage`
          );
          return { success: false, error: "No refresh token available" };
        }

        console.log(
          `✅ [TokenRefreshManager] [${refreshId}] Refresh token found, making API call to:`,
          apiRoutes.auth.refreshToken
        );
        const baseURL = envConfig.PUBLIC_BASE_URL;
        const refreshConfig = {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            refreshToken: refreshToken,
          }),
        };

        console.log(
          `📡 [TokenRefreshManager] [${refreshId}] Sending refresh request to: ${
            baseURL + apiRoutes.auth.refreshToken
          }`
        );
        const refreshRes = await fetch(
          `${baseURL + apiRoutes.auth.refreshToken}`,
          refreshConfig
        );

        console.log(
          `📥 [TokenRefreshManager] [${refreshId}] Refresh API response status:`,
          refreshRes.status
        );
        const refreshData = await refreshRes.json();
        console.log(
          `📋 [TokenRefreshManager] [${refreshId}] Refresh API response data:`,
          {
            statusCode: refreshData?.statusCode,
            hasAccessToken: !!refreshData?.data?.access_token,
            hasRefreshToken: !!refreshData?.data?.refresh_token,
          }
        );

        if (refreshData?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          console.log(
            `💾 [TokenRefreshManager] [${refreshId}] Updating localStorage with new tokens`
          );
          // Update localStorage
          await setToLocalStorage(
            storageKeys.TOKEN,
            refreshData.data.access_token
          );
          await setToLocalStorage(
            storageKeys.REFRESH_TOKEN,
            refreshData.data.refresh_token
          );

          console.log(
            `✅ [TokenRefreshManager] [${refreshId}] Token refresh successful, localStorage updated`
          );

          // Trigger a request to update server-side cookies
          // This ensures cookies and localStorage stay in sync
          console.log(
            `🍪 [TokenRefreshManager] [${refreshId}] Starting cookie sync process`
          );
          try {
            await this.syncCookiesWithServer(refreshData.data.access_token);
            console.log(
              `✅ [TokenRefreshManager] [${refreshId}] Cookie sync completed successfully`
            );
          } catch (cookieError) {
            console.warn(
              `⚠️ [TokenRefreshManager] [${refreshId}] Cookie sync failed but tokens were refreshed:`,
              cookieError
            );
            // Don't fail the entire refresh if cookie sync fails
          }

          console.log(
            `🎉 [TokenRefreshManager] [${refreshId}] Token refresh process completed successfully`
          );
          return { success: true, newToken: refreshData.data.access_token };
        } else {
          // Handle specific error cases
          if (
            refreshData?.statusCode === 400 ||
            refreshData?.message?.includes("Invalid refreshToken")
          ) {
            console.error(
              `🔑 [TokenRefreshManager] [${refreshId}] Refresh token expired or invalid - clearing stored tokens`
            );

            // Clear invalid tokens from localStorage
            await this.clearStoredTokens();

            return {
              success: false,
              error: "REFRESH_TOKEN_EXPIRED",
            };
          }

          console.error(
            `❌ [TokenRefreshManager] [${refreshId}] Token refresh failed:`,
            refreshData?.message
          );
          return {
            success: false,
            error: refreshData?.message || "Unknown refresh error",
          };
        }
      } catch (error) {
        console.error(
          `💥 [TokenRefreshManager] [${refreshId}] Token refresh network/server error:`,
          error
        );
        return {
          success: false,
          error: "Network or server error during refresh",
        };
      } finally {
        console.log(
          `🔓 [TokenRefreshManager] [${refreshId}] Releasing refresh lock`
        );
        this.isRefreshing = false;
        this.refreshPromise = null;
        this.logRefreshState(`Released lock for refresh ${refreshId}`);
      }
    })();

    const finalResult = await this.refreshPromise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `🏁 [TokenRefreshManager] [${refreshId}] Final refresh result:`,
      {
        success: finalResult.success,
        hasToken: !!finalResult.newToken,
        error: finalResult.error,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      }
    );
    console.log(
      `⏱️ [TokenRefreshManager] [${refreshId}] Total refresh time: ${duration}ms`
    );

    return finalResult;
  }

  /**
   * Make a lightweight request to trigger server-side cookie updates
   */
  private static async syncCookiesWithServer(newToken: string): Promise<void> {
    const syncId = Math.random().toString(36).substr(2, 6);
    console.log(`🍪 [CookieSync] [${syncId}] Starting cookie sync with server`);

    try {
      const baseURL = envConfig.PUBLIC_BASE_URL;
      const syncUrl = `${baseURL + apiRoutes.users.userProfile}`;

      console.log(
        `📡 [CookieSync] [${syncId}] Making profile request to: ${syncUrl}`
      );
      console.log(
        `🔑 [CookieSync] [${syncId}] Using new token (first 20 chars): ${newToken.substring(
          0,
          20
        )}...`
      );

      // Make a simple profile request to trigger cookie update
      const profileRes = await fetch(syncUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
        },
        method: "GET",
      });

      console.log(
        `📥 [CookieSync] [${syncId}] Cookie sync response status:`,
        profileRes.status
      );

      if (profileRes.ok) {
        console.log(
          `✅ [CookieSync] [${syncId}] Cookie sync successful - server should have updated cookies`
        );
      } else {
        console.warn(
          `⚠️ [CookieSync] [${syncId}] Cookie sync request failed with status:`,
          profileRes.status
        );
        const responseText = await profileRes.text();
        console.warn(
          `📄 [CookieSync] [${syncId}] Response body:`,
          responseText
        );
      }
    } catch (error) {
      console.error(
        `💥 [CookieSync] [${syncId}] Cookie sync request failed:`,
        error
      );
      throw error;
    }
  }

  /**
   * Clear stored tokens when they become invalid
   */
  static async clearStoredTokens(): Promise<void> {
    console.log(
      "🧹 [TokenRefreshManager] Clearing invalid tokens from localStorage"
    );
    try {
      await setToLocalStorage(storageKeys.TOKEN, "");
      await setToLocalStorage(storageKeys.REFRESH_TOKEN, "");
      console.log(
        "✅ [TokenRefreshManager] Successfully cleared stored tokens"
      );
    } catch (error) {
      console.error("❌ [TokenRefreshManager] Error clearing tokens:", error);
    }
  }

  /**
   * Check if a refresh is currently in progress
   */
  static isRefreshInProgress(): boolean {
    return this.isRefreshing;
  }

  /**
   * Reset the refresh state (for testing or error recovery)
   */
  static reset(): void {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}
