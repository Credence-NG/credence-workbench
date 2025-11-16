import { Features } from "../utils/enums/features";
import { getFromLocalStorage } from "../api/Auth";
import { storageKeys } from "../config/CommonConstant";
import { RolePermissions } from "../config/permissions";
import { pathRoutes } from "../config/pathRoutes";

/**
 * Check if the current user has access to admin features
 * @param requiredFeature - The specific admin feature required
 * @returns Promise<boolean> - True if user has access
 */
export const checkAdminAccess = async (
  requiredFeature: string
): Promise<boolean> => {
  try {
    // Get user roles from storage
    const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
    const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);

    const allRoles: string[] = [];

    // Combine all user roles
    if (userRoles && typeof userRoles === "string") {
      allRoles.push(...userRoles.split(","));
    }
    if (orgRoles && typeof orgRoles === "string") {
      allRoles.push(...orgRoles.split(","));
    }

    // Remove duplicates and empty strings
    const uniqueRoles = [...new Set(allRoles)].filter(
      (role) => role && role.trim() !== ""
    );

    // Check if any role has the required feature
    for (const role of uniqueRoles) {
      const rolePermission = RolePermissions.find(
        (rp) => rp.role === role.trim()
      );
      if (rolePermission && rolePermission.features.includes(requiredFeature)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};

/**
 * Redirect to unauthorized page if user doesn't have admin access
 * @param requiredFeature - The specific admin feature required
 */
export const enforceAdminAccess = async (
  requiredFeature: string
): Promise<void> => {
  const hasAccess = await checkAdminAccess(requiredFeature);

  if (!hasAccess) {
    // Redirect to an unauthorized page or back to dashboard
    window.location.href = pathRoutes.users.dashboard;
    throw new Error("Unauthorized access to admin feature");
  }
};

/**
 * Admin feature constants for easy reference
 */
export const AdminFeatures = {
  APPROVE_ORGANIZATION: Features.APPROVE_ORGANIZATION,
  PLATFORM_MANAGEMENT: Features.PLATFORM_MANAGEMENT,
} as const;
