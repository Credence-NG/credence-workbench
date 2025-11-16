import { getUserOrganizationStatus } from "../api/organization";
import { apiStatusCodes } from "../config/CommonConstant";
import { pathRoutes } from "../config/pathRoutes";
import type { AxiosResponse } from "axios";

export interface OrganizationStatusCheck {
  hasOrganization: boolean;
  organizationStatus: "pending" | "approved" | "rejected" | null;
  requiresOrganizationRegistration: boolean;
  shouldRedirect: boolean;
  redirectPath: string | null;
}

/**
 * Check user's organization status and determine if redirect is needed
 * @returns Promise<OrganizationStatusCheck>
 */
export const checkOrganizationStatus =
  async (): Promise<OrganizationStatusCheck> => {
    const defaultResult: OrganizationStatusCheck = {
      hasOrganization: false,
      organizationStatus: null,
      requiresOrganizationRegistration: true,
      shouldRedirect: false,
      redirectPath: null,
    };

    try {
      const response = await getUserOrganizationStatus();
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const orgData = data.data;

        return {
          hasOrganization: orgData.hasOrganization,
          organizationStatus: orgData.organizationStatus,
          requiresOrganizationRegistration:
            orgData.requiresOrganizationRegistration,
          shouldRedirect: false,
          redirectPath: null,
        };
      }

      return defaultResult;
    } catch (error) {
      console.error("Error checking organization status:", error);
      return defaultResult;
    }
  };

/**
 * Get appropriate redirect path based on organization status
 * @param status Organization status
 * @param currentPath Current page path
 * @returns Redirect path or null if no redirect needed
 */
export const getOrganizationRedirectPath = (
  status: "pending" | "approved" | "rejected" | null,
  currentPath: string
): string | null => {
  // Don't redirect if already on organization pages
  if (currentPath.includes("/organizations/")) {
    return null;
  }

  switch (status) {
    case "pending":
      // Redirect to pending review page if not already there
      if (currentPath !== pathRoutes.organizations.pendingOrganizationReview) {
        return pathRoutes.organizations.pendingOrganizationReview;
      }
      break;

    case "rejected":
      // Redirect to registration page for resubmission
      if (currentPath !== pathRoutes.organizations.registerOrganization) {
        return pathRoutes.organizations.registerOrganization;
      }
      break;

    case "approved":
      // User can access all features - no redirect needed
      return null;

    default:
      // No organization - redirect to registration
      if (currentPath !== pathRoutes.organizations.registerOrganization) {
        return pathRoutes.organizations.registerOrganization;
      }
      break;
  }

  return null;
};

/**
 * Check if user should be allowed to access a specific route based on organization status
 * @param route The route being accessed
 * @param organizationStatus Current organization status
 * @returns boolean indicating if access is allowed
 */
export const canAccessRoute = (
  route: string,
  organizationStatus: "pending" | "approved" | "rejected" | null
): boolean => {
  // Always allow access to organization registration and review pages
  const alwaysAllowedRoutes = [
    pathRoutes.organizations.registerOrganization,
    pathRoutes.organizations.pendingOrganizationReview,
    pathRoutes.auth.sinIn,
    pathRoutes.auth.signUp,
    pathRoutes.users.profile,
  ];

  if (alwaysAllowedRoutes.includes(route)) {
    return true;
  }

  // Only approved organizations can access full organization features
  if (
    route.startsWith("/organizations/") &&
    organizationStatus !== "approved"
  ) {
    return false;
  }

  return true;
};

/**
 * Format organization status for display
 * @param status Organization status
 * @returns Formatted status object with display properties
 */
export const formatOrganizationStatus = (
  status: "pending" | "approved" | "rejected" | null
) => {
  switch (status) {
    case "pending":
      return {
        text: "Under Review",
        color: "warning",
        description: "Your organization registration is being reviewed",
      };
    case "approved":
      return {
        text: "Approved",
        color: "success",
        description: "Your organization is approved and active",
      };
    case "rejected":
      return {
        text: "Requires Attention",
        color: "failure",
        description: "Your organization registration needs corrections",
      };
    default:
      return {
        text: "Not Registered",
        color: "gray",
        description: "No organization registration found",
      };
  }
};
