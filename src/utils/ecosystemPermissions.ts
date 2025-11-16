/**
 * Ecosystem Permission System
 *
 * This module provides permission checking utilities for the Ecosystem Coordination Layer.
 * Access is controlled by:
 * 1. Platform Admin role (PlatformRoles.platformAdmin)
 * 2. Organization membership (ORG_ID in localStorage)
 *
 * @module utils/ecosystemPermissions
 */

import { PlatformRoles } from "../common/enums";
import { getFromLocalStorage } from "../api/Auth";
import { storageKeys } from "../config/CommonConstant";

/**
 * Ecosystem permission flags
 */
export interface EcosystemPermissions {
  // Platform Admin only permissions
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageSettings: boolean;
  canInviteOrgs: boolean;
  canRemoveOrgs: boolean;
  canReviewApplications: boolean;
  canManageSettlements: boolean;
  canSetPricing: boolean;
  canViewAllTransactions: boolean;
  canViewSettlementStats: boolean;
  canViewOnboardingStats: boolean;
  canManageEcosystemSchemas: boolean; // Add/remove schemas from ecosystem whitelist
  canSetSchemaGovernance: boolean; // Set governance levels and policies for schemas

  // All organization members permissions
  canViewList: boolean;
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canViewTransactions: boolean;
  canViewMembers: boolean;
  canApplyToEcosystem: boolean;
  canAcceptInvitation: boolean;
  canViewPricing: boolean;
  canViewSettlements: boolean;
  canViewOwnOrgPerformance: boolean;
  canViewEcosystemSchemas: boolean; // View whitelisted schemas in the ecosystem
}

/**
 * Check if the current user is a Platform Admin
 * @returns Promise<boolean> - True if user has platform admin role
 */
export const isPlatformAdmin = async (): Promise<boolean> => {
  try {
    // First, check USER_ROLES for backward compatibility
    const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
    console.log(
      "🔍 [isPlatformAdmin] Raw user_roles from localStorage:",
      userRoles
    );

    if (userRoles) {
      const roles = userRoles.split(",").map((role: string) => role.trim());
      console.log("🔍 [isPlatformAdmin] Parsed roles array:", roles);

      if (roles.includes(PlatformRoles.platformAdmin)) {
        console.log("✅ [isPlatformAdmin] Found platform_admin in USER_ROLES");
        return true;
      }
    }

    // Check userOrgRoles from localStorage (more reliable source)
    const userDataStr = await getFromLocalStorage("userData");
    console.log("🔍 [isPlatformAdmin] Checking userData from localStorage");

    if (userDataStr) {
      try {
        const userData =
          typeof userDataStr === "string"
            ? JSON.parse(userDataStr)
            : userDataStr;
        const userOrgRoles =
          userData?.data?.userOrgRoles || userData?.userOrgRoles || [];

        console.log("🔍 [isPlatformAdmin] userOrgRoles:", userOrgRoles);
        console.log(
          "🔍 [isPlatformAdmin] Role names:",
          userOrgRoles.map((role: any) => role?.orgRole?.name)
        );

        const isPlatAdmin = userOrgRoles.some(
          (role: any) => role?.orgRole?.name === PlatformRoles.platformAdmin
        );

        console.log(
          `✅ [isPlatformAdmin] Result from userOrgRoles: ${isPlatAdmin}`
        );
        return isPlatAdmin;
      } catch (parseError) {
        console.error(
          "❌ [isPlatformAdmin] Error parsing userData:",
          parseError
        );
      }
    }

    console.log("❌ [isPlatformAdmin] No platform admin role found");
    return false;
  } catch (error) {
    console.error(
      "❌ [isPlatformAdmin] Error checking platform admin status:",
      error
    );
    return false;
  }
};

/**
 * Check if the current user has organization membership
 * @returns Promise<boolean> - True if user belongs to any organization
 */
export const hasOrgMembership = async (): Promise<boolean> => {
  try {
    const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
    return !!orgId;
  } catch (error) {
    console.error("Error checking organization membership:", error);
    return false;
  }
};

/**
 * Get comprehensive ecosystem permissions for current user
 * @returns Promise<EcosystemPermissions> - Complete permission object
 */
export const getEcosystemPermissions =
  async (): Promise<EcosystemPermissions> => {
    const isPlatAdmin = await isPlatformAdmin();
    const hasMembership = await hasOrgMembership();

    return {
      // Platform Admin exclusive permissions
      canCreate: isPlatAdmin,
      canEdit: isPlatAdmin,
      canDelete: isPlatAdmin,
      canManageSettings: isPlatAdmin,
      canInviteOrgs: isPlatAdmin,
      canRemoveOrgs: isPlatAdmin,
      canReviewApplications: isPlatAdmin,
      canManageSettlements: isPlatAdmin,
      canSetPricing: isPlatAdmin,
      canViewAllTransactions: isPlatAdmin,
      canViewSettlementStats: isPlatAdmin,
      canViewOnboardingStats: isPlatAdmin,
      canManageEcosystemSchemas: isPlatAdmin,
      canSetSchemaGovernance: isPlatAdmin,

      // All organization members permissions
      canViewList: hasMembership,
      canViewDashboard: hasMembership,
      canViewAnalytics: hasMembership,
      canViewTransactions: hasMembership,
      canViewMembers: hasMembership,
      canApplyToEcosystem: hasMembership,
      canAcceptInvitation: hasMembership,
      canViewPricing: hasMembership,
      canViewSettlements: hasMembership,
      canViewOwnOrgPerformance: hasMembership,
      canViewEcosystemSchemas: hasMembership,
    };
  };

/**
 * Check if user can perform a specific action
 * @param action - Permission key to check
 * @returns Promise<boolean> - True if user has permission
 */
export const canPerformAction = async (
  action: keyof EcosystemPermissions
): Promise<boolean> => {
  try {
    console.log(`🔍 [canPerformAction] Checking permission for: ${action}`);
    const permissions = await getEcosystemPermissions();
    const hasPermission = permissions[action];
    console.log(
      `✅ [canPerformAction] Permission '${action}': ${hasPermission}`
    );
    console.log("📋 [canPerformAction] All permissions:", permissions);
    return hasPermission;
  } catch (error) {
    console.error(
      `❌ [canPerformAction] Error checking permission for ${action}:`,
      error
    );
    return false;
  }
};

/**
 * Get current user's organization ID
 * @returns Promise<string | null> - Organization ID or null
 */
export const getCurrentOrgId = async (): Promise<string | null> => {
  try {
    return await getFromLocalStorage(storageKeys.ORG_ID);
  } catch (error) {
    console.error("Error getting organization ID:", error);
    return null;
  }
};

/**
 * Check if user has access to ecosystem features
 * (Must have organization membership)
 * @returns Promise<boolean> - True if user has any ecosystem access
 */
export const hasEcosystemAccess = async (): Promise<boolean> => {
  return await hasOrgMembership();
};

/**
 * Permission check utility for UI components
 * Usage: const { canCreate, canEdit } = usePermissions();
 */
export const usePermissionCheck = () => {
  let permissions: EcosystemPermissions | null = null;

  const loadPermissions = async () => {
    permissions = await getEcosystemPermissions();
    return permissions;
  };

  return {
    loadPermissions,
    getPermissions: () => permissions,
  };
};
