import { useState, useCallback } from "react";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "../../api/Auth";
import { storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import type { Organisation, IOrgInfo } from "./interfaces";

export const useOrganizationManager = () => {
  const extractRoles = useCallback((org: Organisation): string[] => {
    return org?.userOrgRoles?.length > 0
      ? org.userOrgRoles.map((role) => role.orgRole.name)
      : [];
  }, []);

  const createOrgInfo = useCallback(
    (org: Organisation): IOrgInfo => {
      const roles = extractRoles(org);
      const { id, name, description, logoUrl } = org;
      return { id, name, description, logoUrl, roles };
    },
    [extractRoles]
  );

  const setOrgRoleDetails = useCallback(
    async (org: Organisation) => {
      if (org?.id !== undefined && org?.id !== null) {
        await setToLocalStorage(storageKeys.ORG_ID, org.id.toString());
      }

      const roles = extractRoles(org);
      if (roles.length > 0) {
        await setToLocalStorage(storageKeys.ORG_ROLES, roles.toString());
      }
    },
    [extractRoles]
  );

  const goToOrgDashboard = useCallback(
    async (org: Organisation) => {
      if (!org) return;

      // Clear existing org data
      await removeFromLocalStorage(storageKeys.ORG_INFO);
      await removeFromLocalStorage(storageKeys.ORG_DETAILS);

      // Set new org data
      await setOrgRoleDetails(org);
      const orgInfo = createOrgInfo(org);
      await setToLocalStorage(storageKeys.ORG_INFO, orgInfo);

      // Navigate to dashboard
      window.location.href = pathRoutes.organizations.dashboard;
    },
    [setOrgRoleDetails, createOrgInfo]
  );

  const loadActiveOrg = useCallback(
    async (organizations: Organisation[]): Promise<IOrgInfo | undefined> => {
      const orgInfoDetails = await getFromLocalStorage(storageKeys.ORG_INFO);
      let activeOrgDetails = orgInfoDetails ? JSON.parse(orgInfoDetails) : null;

      if (activeOrgDetails && Object.keys(activeOrgDetails).length > 0) {
        return activeOrgDetails;
      }

      if (organizations?.[0]) {
        const firstOrg = organizations[0];
        const orgInfo = createOrgInfo(firstOrg);

        await setToLocalStorage(storageKeys.ORG_INFO, orgInfo);
        await setOrgRoleDetails(firstOrg);

        return orgInfo;
      }

      return undefined;
    },
    [createOrgInfo, setOrgRoleDetails]
  );

  const redirectToCreateOrgModal = useCallback(() => {
    window.location.href = "/organizations?orgModal=true";
  }, []);

  return {
    goToOrgDashboard,
    loadActiveOrg,
    redirectToCreateOrgModal,
  };
};
