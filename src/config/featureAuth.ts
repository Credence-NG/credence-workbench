import { Features } from "../utils/enums/features";
import { PlatformRoles } from "../common/enums";

/**
 * Feature-Based Authorization System
 *
 * This module provides a simplified, backend-aligned authorization system
 * that maps UI routes directly to required features without redundant route arrays.
 */

// Route pattern to feature mapping
export interface RoutePattern {
  pattern: RegExp;
  feature: string;
  description: string;
}

/**
 * Route patterns mapped to required features
 * Patterns are checked in order - first match wins
 */
export const ROUTE_FEATURE_MAP: RoutePattern[] = [
  // Platform Administration
  {
    pattern: /^\/platform-settings/,
    feature: Features.PLATFORM_SETTINGS,
    description: "Platform administration and settings",
  },

  // Dashboard & Profile
  {
    pattern: /^\/dashboard$/,
    feature: Features.VIEW_DASHBOARD,
    description: "Main user dashboard",
  },
  {
    pattern: /^\/profile/,
    feature: Features.MANAGE_PROFILE,
    description: "User profile management",
  },
  {
    pattern: /^\/setting/,
    feature: Features.SETTINGS,
    description: "Admin and platform admin settings",
  },

  // Organization Management
  {
    pattern: /^\/organizations\/dashboard/,
    feature: Features.VIEW_DASHBOARD,
    description: "Organization dashboard",
  },
  {
    pattern: /^\/organizations\/users/,
    feature: Features.MANAGE_MEMBERS,
    description: "Organization user management",
  },
  {
    pattern: /^\/organizations\/invitations/,
    feature: Features.INVITE_USERS,
    description: "Organization invitations",
  },
  {
    pattern: /^\/organizations\/delete-organizations/,
    feature: Features.DELETE_ORGANIZATION,
    description: "Delete organizations",
  },
  {
    pattern: /^\/organizations(?:\/index)?$/,
    feature: Features.MANAGE_ORGANIZATION,
    description: "Organization management",
  },

  // Schema Management
  {
    pattern: /^\/organizations\/schemas\/create/,
    feature: Features.CREATE_SCHEMA,
    description: "Create new schema",
  },
  {
    pattern: /^\/organizations\/schemas\/[^\/]+$/,
    feature: Features.VIEW_SCHEMAS,
    description: "View specific schema details",
  },
  {
    pattern: /^\/organizations\/schemas/,
    feature: Features.VIEW_SCHEMAS,
    description: "Schema management and listing",
  },

  // Credential Issuance (all issuance workflows)
  {
    pattern: /^\/organizations\/credentials\/issue\/bulk-issuance/,
    feature: Features.BULK_ISSUANCE,
    description: "Bulk credential issuance",
  },
  {
    pattern: /^\/organizations\/credentials\/issue\/email/,
    feature: Features.EMAIL_ISSUANCE,
    description: "Email-based credential issuance",
  },
  {
    pattern: /^\/organizations\/credentials\/issue/,
    feature: Features.ISSUANCE,
    description: "Standard credential issuance workflow",
  },
  {
    pattern: /^\/organizations\/credentials/,
    feature: Features.VIEW_ISSUED_CREDENTIALS,
    description: "View issued credentials",
  },

  // Verification (all verification workflows)
  {
    pattern: /^\/organizations\/verification\/verify-credentials\/email/,
    feature: Features.EMAIL_VERIFICATION,
    description: "Email-based credential verification",
  },
  {
    pattern: /^\/organizations\/verification/,
    feature: Features.VERIFICATION,
    description: "Credential verification workflow",
  },

  // Connections
  {
    pattern: /^\/connections/,
    feature: Features.VIEW_CONNECTIONS,
    description: "Connection management",
  },

  // Invitations (user-level)
  {
    pattern: /^\/invitations/,
    feature: Features.SEND_INVITATION,
    description: "User invitation management",
  },

  // Legacy credential routes
  {
    pattern: /^\/credentials\/users/,
    feature: Features.VIEW_USERS,
    description: "View users (legacy route)",
  },
  {
    pattern: /^\/credentials\/invitations/,
    feature: Features.INVITE_USERS,
    description: "Manage invitations (legacy route)",
  },
  {
    pattern: /^\/credentials\/dashboard/,
    feature: Features.VIEW_DASHBOARD,
    description: "Dashboard (legacy route)",
  },
  {
    pattern: /^\/credentials/,
    feature: Features.VIEW_ISSUED_CREDENTIALS,
    description: "View credentials (legacy route)",
  },

  // Ecosystems
  {
    pattern: /^\/ecosystems/,
    feature: Features.ECOSYSTEM_MANAGEMENT,
    description: "Ecosystem management",
  },
];

/**
 * Get the required feature for a given route path
 */
export const getRequiredFeature = (path: string): string | null => {
  // Clean the path
  const cleanPath = path.replace(/\/$/, "") || "/";

  // Find matching pattern
  for (const { pattern, feature } of ROUTE_FEATURE_MAP) {
    if (pattern.test(cleanPath)) {
      return feature;
    }
  }

  // Default fallback for unmatched routes
  return Features.VIEW_DASHBOARD;
};

/**
 * Get user's effective features based on cumulative role hierarchy
 */
export const getUserEffectiveFeatures = async (): Promise<string[]> => {
  try {
    // Get stored roles
    const userRoles = localStorage.getItem("USER_ROLES");
    const orgRoles = localStorage.getItem("ORG_ROLES");

    let allFeatures: string[] = [];

    // Check platform admin first (highest precedence)
    if (userRoles?.includes(PlatformRoles.platformAdmin)) {
      // Platform admin gets ALL features
      allFeatures = Object.values(Features);
    } else if (orgRoles) {
      // Get organization role features
      const { RolePermissions } = await import("./permissions");
      const roleList = orgRoles.split(",");

      // Combine features from all roles (cumulative)
      for (const role of roleList) {
        const rolePermission = RolePermissions.find(
          (rp) => rp.role === role.trim()
        );
        if (rolePermission) {
          allFeatures = [
            ...new Set([...allFeatures, ...rolePermission.features]),
          ];
        }
      }
    }

    return allFeatures;
  } catch (error) {
    console.error("Error getting user effective features:", error);
    return [Features.VIEW_DASHBOARD]; // Minimal fallback
  }
};

/**
 * Check if user has access to a specific route
 */
export const checkRouteAccess = async (path: string): Promise<boolean> => {
  try {
    const requiredFeature = getRequiredFeature(path);
    if (!requiredFeature) return true; // No specific feature required

    const userFeatures = await getUserEffectiveFeatures();
    return userFeatures.includes(requiredFeature);
  } catch (error) {
    console.error("Error checking route access:", error);
    return false;
  }
};

/**
 * Check if user has a specific feature
 */
export const hasFeature = async (feature: string): Promise<boolean> => {
  try {
    const userFeatures = await getUserEffectiveFeatures();
    return userFeatures.includes(feature);
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
};

/**
 * Get available routes for user based on their features
 */
export const getUserAvailableRoutes = async (): Promise<string[]> => {
  try {
    const userFeatures = await getUserEffectiveFeatures();
    const availableRoutes: string[] = [];

    // Check each route pattern against user features
    for (const { pattern, feature } of ROUTE_FEATURE_MAP) {
      if (userFeatures.includes(feature)) {
        // Extract base route from pattern (simplified)
        const routeExample = pattern.source
          .replace(/[\^$]/g, "")
          .replace(/\\\//g, "/");
        availableRoutes.push(routeExample);
      }
    }

    return [...new Set(availableRoutes)]; // Remove duplicates
  } catch (error) {
    console.error("Error getting available routes:", error);
    return ["/dashboard"]; // Fallback
  }
};

/**
 * Platform admin detection utility
 */
export const isPlatformAdmin = (): boolean => {
  try {
    const userRoles = localStorage.getItem("USER_ROLES");
    return userRoles?.includes(PlatformRoles.platformAdmin) || false;
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return false;
  }
};

/**
 * Route debugging utility - shows feature mapping for a route
 */
export const debugRoute = (path: string) => {
  const feature = getRequiredFeature(path);
  const matchedPattern = ROUTE_FEATURE_MAP.find(({ pattern }) =>
    pattern.test(path)
  );

  console.log("Route Debug:", {
    path,
    requiredFeature: feature,
    matchedPattern: matchedPattern?.description,
    pattern: matchedPattern?.pattern.source,
  });
};
