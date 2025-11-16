/**
 * Proactive Token Refresh System
 *
 * This module automatically refreshes tokens BEFORE they expire for active users,
 * preventing "session expired" messages during active work sessions.
 */

import { TokenRefreshManager } from "./tokenRefreshManager";
import { getFromLocalStorage } from "../api/Auth";
import { storageKeys } from "../config/CommonConstant";

export class ProactiveTokenRefresh {
  private static refreshTimer: NodeJS.Timeout | null = null;
  private static activityTimer: NodeJS.Timeout | null = null;
  private static lastActivity: number = Date.now();
  private static isActive: boolean = true;
  private static isInitialized: boolean = false;
  private static readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity = inactive
  private static readonly REFRESH_INTERVAL = 2 * 60 * 1000; // Check every 2 minutes (more frequent for 5min tokens)
  private static readonly TOKEN_REFRESH_THRESHOLD = 90 * 1000; // Refresh if less than 1.5 minutes left (more aggressive)

  /**
   * Check if we're on an authentication page where token refresh shouldn't run
   */
  private static isAuthPage(): boolean {
    if (typeof window === "undefined") return false;

    const pathname = window.location.pathname;
    return (
      pathname.includes("/authentication/") ||
      pathname.includes("/auth/") ||
      pathname.includes("/sign-in") ||
      pathname.includes("/sign-up")
    );
  }

  /**
   * Initialize the proactive refresh system
   */
  static initialize(): void {
    if (typeof window === "undefined") return; // Server-side guard

    // Prevent multiple initializations
    if (this.isInitialized) {
      console.log("⚠️ [ProactiveTokenRefresh] Already initialized, skipping");
      return;
    }

    // Don't run on authentication pages
    if (this.isAuthPage()) {
      console.log(
        "🚫 [ProactiveTokenRefresh] Skipping initialization on auth page"
      );
      return;
    }

    console.log(
      "🚀 [ProactiveTokenRefresh] Initializing proactive token refresh system"
    );

    this.isInitialized = true;
    this.setupActivityTracking();
    this.startRefreshTimer();

    // Track page visibility changes
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );

    // Track before page unload
    window.addEventListener("beforeunload", this.cleanup.bind(this));
  }

  /**
   * Setup activity tracking to detect when user is actively working
   */
  private static setupActivityTracking(): void {
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
      "blur",
    ];

    const updateActivity = () => {
      const now = Date.now();
      const wasInactive = !this.isActive;

      this.lastActivity = now;
      this.isActive = true;

      if (wasInactive) {
        console.log("👤 [ProactiveTokenRefresh] User became active again");
        this.startRefreshTimer(); // Restart proactive refreshing
      }

      // Reset activity timeout
      if (this.activityTimer) {
        clearTimeout(this.activityTimer);
      }

      this.activityTimer = setTimeout(() => {
        this.isActive = false;
        console.log(
          "😴 [ProactiveTokenRefresh] User inactive - pausing proactive refresh"
        );
        this.stopRefreshTimer();
      }, this.ACTIVITY_TIMEOUT);
    };

    // Add activity listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    console.log("👂 [ProactiveTokenRefresh] Activity tracking setup complete");
  }

  /**
   * Start the proactive refresh timer
   */
  private static startRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshToken();
    }, this.REFRESH_INTERVAL);

    console.log(
      `⏰ [ProactiveTokenRefresh] Refresh timer started (checking every ${
        this.REFRESH_INTERVAL / 1000
      }s)`
    );
  }

  /**
   * Stop the proactive refresh timer
   */
  private static stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log("⏹️ [ProactiveTokenRefresh] Refresh timer stopped");
    }

    // Also clear activity timer when stopping refresh completely
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
      console.log("⏹️ [ProactiveTokenRefresh] Activity timer cleared");
    }
  }

  /**
   * Check if token needs refresh and refresh it proactively
   */
  private static async checkAndRefreshToken(): Promise<void> {
    try {
      // Only refresh for active users
      if (!this.isActive) {
        console.log(
          "😴 [ProactiveTokenRefresh] User inactive - skipping proactive refresh"
        );
        return;
      }

      // Don't run on auth pages
      if (this.isAuthPage()) {
        console.log("🚫 [ProactiveTokenRefresh] Skipping refresh on auth page");
        this.stopRefreshTimer();
        return;
      }

      const token = await getFromLocalStorage(storageKeys.TOKEN);
      if (!token) {
        console.log(
          "🚫 [ProactiveTokenRefresh] No token found - stopping proactive refresh"
        );
        this.stopRefreshTimer();
        return;
      }

      // Parse token to check expiration
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        console.log(
          `⏰ [ProactiveTokenRefresh] Token expires in ${Math.round(
            timeUntilExpiration / 1000 / 60
          )} minutes`
        );

        // If token expires soon, refresh it proactively
        if (timeUntilExpiration <= this.TOKEN_REFRESH_THRESHOLD) {
          console.log(
            "🔄 [ProactiveTokenRefresh] Token expiring soon - refreshing proactively"
          );

          const refreshResult = await TokenRefreshManager.refreshTokens();

          if (refreshResult.success) {
            console.log(
              "✅ [ProactiveTokenRefresh] Proactive token refresh successful"
            );

            // Verify the new token was actually stored
            const newToken = await getFromLocalStorage(storageKeys.TOKEN);
            if (newToken && newToken !== token) {
              console.log(
                "🔄 [ProactiveTokenRefresh] New token confirmed in storage"
              );
            }
          } else {
            console.error(
              "❌ [ProactiveTokenRefresh] Proactive token refresh failed:",
              refreshResult.error
            );

            // If refresh fails, stop trying to avoid spam
            if (refreshResult.error === "REFRESH_TOKEN_EXPIRED") {
              console.log(
                "🛑 [ProactiveTokenRefresh] Refresh token expired - stopping proactive refresh and redirecting"
              );
              this.stopRefreshTimer();

              // Redirect to sign-in page when refresh token expires
              if (typeof window !== "undefined") {
                console.log(
                  "🚪 [ProactiveTokenRefresh] Redirecting to sign-in due to expired refresh token"
                );
                window.location.assign("/authentication/sign-in");
              }
              return;
            }
          }
        } else {
          // Token still has plenty of time
          console.log(
            "⏳ [ProactiveTokenRefresh] Token still fresh, no refresh needed"
          );
        }
      } catch (parseError) {
        console.error(
          "❌ [ProactiveTokenRefresh] Error parsing token:",
          parseError
        );
        // Invalid token format, stop refreshing
        this.stopRefreshTimer();
      }
    } catch (error) {
      console.error(
        "💥 [ProactiveTokenRefresh] Error in checkAndRefreshToken:",
        error
      );
    }
  }

  /**
   * Handle page visibility changes
   */
  private static handleVisibilityChange(): void {
    if (document.hidden) {
      console.log(
        "👁️ [ProactiveTokenRefresh] Page hidden - pausing proactive refresh"
      );
      // Only stop the refresh timer, keep the system initialized
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    } else {
      console.log(
        "👁️ [ProactiveTokenRefresh] Page visible - resuming proactive refresh"
      );
      this.isActive = true;
      this.lastActivity = Date.now();
      // Only restart if we're still initialized and don't already have a timer
      if (this.isInitialized && !this.refreshTimer) {
        this.startRefreshTimer();
      }
    }
  }

  /**
   * Cleanup when page is unloading
   */
  private static cleanup(): void {
    console.log("🧹 [ProactiveTokenRefresh] Cleaning up timers");
    this.stopRefreshTimer();

    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }

    // Don't reset isInitialized on cleanup - this was causing re-initialization
  }

  /**
   * Force a token refresh if user is active
   */
  static async forceRefreshIfActive(): Promise<boolean> {
    if (!this.isActive) {
      console.log(
        "😴 [ProactiveTokenRefresh] User inactive - skipping forced refresh"
      );
      return false;
    }

    console.log(
      "🔥 [ProactiveTokenRefresh] Forcing token refresh for active user"
    );
    const result = await TokenRefreshManager.refreshTokens();
    return result.success;
  }

  /**
   * Get current activity status
   */
  static getActivityStatus(): {
    isActive: boolean;
    lastActivity: number;
    timeSinceActivity: number;
    isRunning: boolean;
  } {
    return {
      isActive: this.isActive,
      lastActivity: this.lastActivity,
      timeSinceActivity: Date.now() - this.lastActivity,
      isRunning: this.refreshTimer !== null,
    };
  }

  /**
   * Check if the proactive refresh system is currently running
   */
  static isRunning(): boolean {
    return this.refreshTimer !== null;
  }

  /**
   * Manually stop the system (useful for debugging or when user logs out)
   */
  static stop(): void {
    console.log("🛑 [ProactiveTokenRefresh] Manual stop requested");
    this.stopRefreshTimer();
    this.isInitialized = false;
  }

  /**
   * Reset the system (useful for debugging)
   */
  static reset(): void {
    console.log("🔄 [ProactiveTokenRefresh] Reset requested");
    this.stop();
    this.initialize();
  }
}

// Auto-initialize when module is loaded (only in browser)
if (typeof window !== "undefined") {
  // Wait for page to be fully loaded before initializing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      ProactiveTokenRefresh.initialize();
    });
  } else {
    ProactiveTokenRefresh.initialize();
  }
}
