import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPublicOrganisationGet,
  axiosPut,
  ecosystemAxiosGet,
  ecosystemAxiosPost,
} from "../services/apiRequests";

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { getHeaderConfigs } from "../config/GetHeaderConfigs";
import { storageKeys } from "../config/CommonConstant";
import type {
  IDedicatedAgentConfig,
  IUpdatePrimaryDid,
} from "../components/organization/interfaces";
import { pathRoutes } from "../config/pathRoutes";

export const createOrganization = async (data: object) => {
  const url = apiRoutes.organizations.create;
  const payload = data;
  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const updateOrganization = async (data: object, orgId: string) => {
  const url = `${apiRoutes.organizations.update}/${orgId}`;
  const payload = data;
  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPut(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizations = async (
  pageNumber: number,
  pageSize: number,
  search = "",
  role = ""
) => {
  const roleQuery = role ? `&role=${role}` : "";
  const url = `${apiRoutes.organizations.getAll}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}${roleQuery}`;

  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizationById = async (orgId: string) => {
  const url = `${apiRoutes.organizations.getById}/${orgId}`;

  const token = await getFromLocalStorage(storageKeys.TOKEN);

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

  console.log("=== API REQUEST: getOrganizationById ===");
  console.log("URL:", url);
  console.log("Organization ID:", orgId);
  //console.log('Token present:', !!token);
  const logPayload = {
    ...axiosPayload,
    config: {
      ...axiosPayload.config,
      headers: {
        ...axiosPayload.config.headers,
        Authorization: token ? `Bearer ${token.substring(0, 20)}...` : "None",
      },
    },
  };
  //console.log('Axios Payload:', JSON.stringify(logPayload, null, 2));

  try {
    const response = await axiosGet(axiosPayload);
    // console.log("=== API RESPONSE: getOrganizationById ===");
    //   console.log("Response:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    const err = error as Error;
    //console.log('=== API ERROR: getOrganizationById ===');
    //console.log('Error:', err?.message);
    return err?.message;
  }
};

export const getOrgDashboard = async (orgId: string) => {
  const url = `${apiRoutes.organizations.getOrgDashboard}/${orgId}`;

  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const spinupDedicatedAgent = async (data: object, orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentDedicatedSpinup}`;
  const payload = data;

  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const setAgentConfigDetails = async (
  data: IDedicatedAgentConfig,
  orgId: string
) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.setAgentConfig}`;
  const payload = data;

  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const spinupSharedAgent = async (data: object, orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentSharedSpinup}`;
  const payload = data;

  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizationRoles = async () => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  const url = `${apiRoutes.organizations.root}/${orgId}/roles`;
  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

//Get users of the organization
export const getOrganizationUsers = async (
  pageNumber: number,
  pageSize: number,
  search = ""
) => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  if (!orgId) {
    return "Organization is required";
  }

  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.users.fetchUsers}?&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;

  const axiosPayload = {
    url,
    config: await getHeaderConfigs(),
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

// Edit user roles
export const editOrganizationUserRole = async (
  userId: string,
  roles: string[]
) => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.editUserROle}/${userId}`;
  const payload = {
    orgId,
    userId,
    orgRoleId: roles,
  };

  const axiosPayload = {
    url,
    payload,
    config: await getHeaderConfigs(),
  };

  try {
    return axiosPut(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

//Create Connection

export const createConnection = async (orgName: string) => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.connection.create}`;

  const data = {
    label: orgName,
    multiUseInvitation: true,
    autoAcceptConnection: true,
    orgId: orgId,
  };
  const payload = data;

  const axiosPayload = {
    url,
    payload,
    config: await getHeaderConfigs(),
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

// public profile

export const getPublicOrganizations = async (
  pageNumber: number,
  pageSize: number,
  search: string
) => {
  const url = `${apiRoutes.Public.organizations}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosPublicOrganisationGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getPublicOrgDetails = async (orgSlug: string) => {
  const url = `${apiRoutes.Public.organizationDetails}/${orgSlug}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosPublicOrganisationGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

// Edit user roles
export const deleteOrganizationInvitation = async (
  orgId: string,
  invitationId: string
) => {
  const url = `${apiRoutes.organizations.root}/${orgId}/invitations/${invitationId}`;

  const axiosPayload = {
    url,
    config: await getHeaderConfigs(),
  };

  try {
    return await axiosDelete(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getDids = async (orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.didList}`;

  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const createDid = async (payload: any) => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.createDid}`;

  const axiosPayload = {
    url,
    payload,
    config: await getHeaderConfigs(),
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const updatePrimaryDid = async (
  orgId: string,
  payload: IUpdatePrimaryDid
) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.primaryDid}`;

  const axiosPayload = {
    url,
    payload,
    config: await getHeaderConfigs(),
  };

  try {
    return await axiosPut(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizationReferences = async () => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  const url = `${apiRoutes.organizations.root}${apiRoutes.organizations.getOrgReferences}/${orgId}`;

  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const deleteOrganization = async () => {
  const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

  const url = `${apiRoutes.organizations.root}/${orgId}`;

  const axiosPayload = {
    url,
    config: await getHeaderConfigs(),
  };

  try {
    return await axiosDelete(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getEcosystems = async (
  orgId: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  search = ""
) => {
  const url = `${apiRoutes.Ecosystem.root}/${orgId}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;
  const axiosPayload = {
    url,
    config: await getHeaderConfigs(),
  };

  try {
    return await ecosystemAxiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const createSchemaRequest = async (
  data: object,
  endorsementId: string,
  orgId: string
) => {
  const url = `${apiRoutes.Ecosystem.root}/${endorsementId}/${orgId}${apiRoutes.Ecosystem.endorsements.createSchemaRequest}`;
  const payload = data;
  const axiosPayload = {
    url,
    payload,
    config: await getHeaderConfigs(),
  };

  try {
    return await ecosystemAxiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

// Organization Registration API Functions
export interface OrganizationRegistrationRequest {
  legalName: string;
  publicName: string;
  companyRegistrationNumber: string;
  website: string;
  regulatorId: string; // Changed from regulator to regulatorId
  regulationRegistrationNumber: string;
  countryId: string;
  stateId: string;
  cityId: string;
  address: string;
  officialContactFirstName: string;
  officialContactLastName: string;
  officialContactPhoneNumber: string;
}

export interface OrganizationStatusResponse {
  organizationId?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  organizationDetails?: OrganizationRegistrationRequest;
}

export const registerOrganization = async (
  data: OrganizationRegistrationRequest
) => {
  const url = apiRoutes.organizations.register;
  const payload = data;
  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getMyOrganizationStatus = async () => {
  const url = apiRoutes.organizations.myOrganization;
  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getUserOrganizationStatus = async () => {
  const url = "/users/organization-status";
  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

// Admin Organization Approval APIs
export interface PendingOrganization {
  id: string;
  legalName: string;
  publicName: string;
  submittedAt: string;
  submittedBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  regulator: string;
  status: "pending";
}

export interface PendingOrganizationsResponse {
  organizations: PendingOrganization[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface OrganizationDetailsForReview {
  organization: OrganizationRegistrationRequest & {
    id: string;
    status: string;
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
  };
  submittedBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  submissionHistory: Array<{
    action: string;
    timestamp: string;
    details: string;
  }>;
}

export const getPendingOrganizations = async (
  pageNumber = 1,
  pageSize = 10,
  search?: string,
  regulator?: string
) => {
  let url = `${apiRoutes.organizations.admin.pending}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  if (regulator) {
    url += `&regulator=${encodeURIComponent(regulator)}`;
  }

  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizationDetailsForReview = async (
  organizationId: string
) => {
  const url = `${apiRoutes.organizations.admin.details}/${organizationId}/details`;
  const token = await getFromLocalStorage(storageKeys.TOKEN);

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
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const approveOrganization = async (
  organizationId: string,
  approvalNotes: string
) => {
  const url = `${apiRoutes.organizations.admin.approve}/${organizationId}/approve`;
  const payload = { approvalNotes };
  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const rejectOrganization = async (
  organizationId: string,
  rejectionReason: string,
  rejectionNotes: string
) => {
  const url = `${apiRoutes.organizations.admin.reject}/${organizationId}/reject`;
  const payload = { rejectionReason, rejectionNotes };
  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};
