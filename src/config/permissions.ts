import { PlatformRoles } from "../common/enums";
import { Features } from "../utils/enums/features";
import { FeatureRoutes } from "./featureRoutes";

export interface IPermission {
  role: string;
  features: string[];
}

export const RolePermissions: IPermission[] = [
  {
    role: PlatformRoles.platformAdmin,
    features: Object.values(Features), // Platform admin gets all features
  },
  {
    role: "owner",
    features: [
      Features.VIEW_DASHBOARD,
      Features.MANAGE_PROFILE,
      Features.MANAGE_ORGANIZATION,
      Features.VIEW_WALLET_DETAILS,
      Features.ORGANIZATION_SETTINGS,
      Features.CREATE_SCHEMA,
      Features.VIEW_SCHEMAS,
      Features.SCHEMA_ENDORSEMENT,
      Features.ISSUANCE,
      Features.BULK_ISSUANCE,
      Features.EMAIL_ISSUANCE,
      Features.W3C_ISSUANCE,
      Features.VIEW_ISSUED_CREDENTIALS,
      Features.VERIFICATION,
      Features.REQUEST_PROOF,
      Features.EMAIL_VERIFICATION,
      Features.W3C_VERIFICATION,
      Features.VERIFY_CREDENTIALS,
      Features.MANAGE_DIDS,
      Features.CREATE_DID,
      Features.SET_PRIMARY_DID,
      Features.VIEW_CONNECTIONS,
      Features.MANAGE_CONNECTIONS,
      Features.CREATE_CONNECTIONS,
      Features.MANAGE_MEMBERS,
      Features.EDIT_USER_ROLES,
      Features.INVITE_USERS,
      Features.SEND_INVITATION,
      Features.ECOSYSTEM_MANAGEMENT,
      Features.CREATE_ORG,
      Features.GENERATE_CLIENT_CREDENTIALS,
      Features.API_ACCESS,
      Features.DOWNLOAD_TEMPLATE,
      Features.VIEW_ISSUANCE_HISTORY,
      Features.RETRY_ISSUANCE,
      Features.SETTINGS, // Added settings feature
    ],
  },
  {
    role: "admin",
    features: [
      Features.VIEW_DASHBOARD,
      Features.MANAGE_PROFILE,
      Features.MANAGE_ORGANIZATION,
      Features.VIEW_WALLET_DETAILS,
      Features.ORGANIZATION_SETTINGS,
      Features.CREATE_SCHEMA,
      Features.VIEW_SCHEMAS,
      Features.ISSUANCE,
      Features.BULK_ISSUANCE,
      Features.EMAIL_ISSUANCE,
      Features.W3C_ISSUANCE,
      Features.VIEW_ISSUED_CREDENTIALS,
      Features.VERIFICATION,
      Features.REQUEST_PROOF,
      Features.EMAIL_VERIFICATION,
      Features.W3C_VERIFICATION,
      Features.VERIFY_CREDENTIALS,
      Features.MANAGE_DIDS,
      Features.CREATE_DID,
      Features.VIEW_CONNECTIONS,
      Features.MANAGE_CONNECTIONS,
      Features.MANAGE_MEMBERS,
      Features.EDIT_USER_ROLES,
      Features.INVITE_USERS,
      Features.SEND_INVITATION,
      Features.VIEW_ISSUED_CREDENTIALS,
    ],
  },
  {
    role: "issuer",
    features: [
      Features.VIEW_DASHBOARD,
      Features.MANAGE_PROFILE,
      Features.VIEW_WALLET_DETAILS, // ✅ Allow access to /organizations/dashboard
      Features.CREATE_SCHEMA,
      Features.VIEW_SCHEMAS,
      Features.ISSUANCE, // ✅ Issuer can now issue!
      Features.BULK_ISSUANCE, // ✅ Can do bulk issuance
      Features.EMAIL_ISSUANCE, // ✅ Can do email issuance
      Features.W3C_ISSUANCE, // ✅ Can do W3C issuance
      Features.VIEW_ISSUED_CREDENTIALS,
      Features.DOWNLOAD_TEMPLATE,
      Features.VIEW_ISSUANCE_HISTORY,
      Features.RETRY_ISSUANCE,
      Features.VIEW_ISSUED_CREDENTIALS, // --- IGNORE ---
    ],
  },
  {
    role: "verifier",
    features: [
      Features.VIEW_DASHBOARD,
      Features.MANAGE_PROFILE,
      Features.VIEW_WALLET_DETAILS, // ✅ Allow access to /organizations/dashboard
      Features.VERIFICATION, // ✅ Verifier can verify
      Features.REQUEST_PROOF, // ✅ Can request proofs
      Features.EMAIL_VERIFICATION, // ✅ Can do email verification
      Features.W3C_VERIFICATION, // ✅ Can do W3C verification
      Features.VERIFY_CREDENTIALS, // ✅ Can verify credentials
    ],
  },
  {
    role: "member",
    features: [
      Features.VIEW_DASHBOARD,
      Features.MANAGE_PROFILE,
      Features.VIEW_WALLET_DETAILS, // ✅ Allow access to /organizations/dashboard
      Features.VIEW_CONNECTIONS,
      Features.SEND_INVITATION,
    ],
  },
  {
    role: "holder",
    features: [
      Features.VIEW_DASHBOARD,
      Features.MANAGE_PROFILE,
      Features.VIEW_WALLET_DETAILS, // ✅ Allow access to /organizations/dashboard
      Features.VIEW_CONNECTIONS,
      Features.SEND_INVITATION,
    ],
  },
];
