export enum Features {
  // Fix existing typos
  SETTINGS = "settings", // Fixed typo from "setting" to "settings"

  SEND_INVITATION = "send_invitations",
  CREATE_ORG = "create_org", // Fixed typo
  CREATE_SCHEMA = "create_schema", // Fixed typo
  ISSUANCE = "issuance",
  VERIFICATION = "verification",

  // Missing features found in codebase:

  // Organization Management
  MANAGE_ORGANIZATION = "manage_organization",
  DELETE_ORGANIZATION = "delete_organization",
  ORGANIZATION_SETTINGS = "organization_settings",
  VIEW_WALLET_DETAILS = "view_wallet_details",

  // User & Role Management
  MANAGE_MEMBERS = "manage_members",
  EDIT_USER_ROLES = "edit_user_roles",
  VIEW_USERS = "view_users",
  INVITE_USERS = "invite_users",

  // Schema & Credential Definition Management
  VIEW_SCHEMAS = "view_schemas",
  CREATE_CRED_DEF = "create_cred_def",
  MANAGE_SCHEMAS = "manage_schemas",
  SCHEMA_ENDORSEMENT = "schema_endorsement",

  // DID Management
  CREATE_DID = "create_did",
  MANAGE_DIDS = "manage_dids",
  SET_PRIMARY_DID = "set_primary_did",

  // Connection Management
  VIEW_CONNECTIONS = "view_connections",
  MANAGE_CONNECTIONS = "manage_connections",
  CREATE_CONNECTIONS = "create_connections",

  // Credential Management
  MANAGE_CREDENTIALS = "manage_credentials",
  VIEW_ISSUED_CREDENTIALS = "view_issued_credentials",
  VIEW_PENDING_REQUESTS = "view_pending_requests",
  MANAGE_PENDING_REQUESTS = "manage_pending_requests",
  BULK_ISSUANCE = "bulk_issuance",
  EMAIL_ISSUANCE = "email_issuance",
  W3C_ISSUANCE = "w3c_issuance",
  DOWNLOAD_TEMPLATE = "download_template",
  VIEW_ISSUANCE_HISTORY = "view_issuance_history",
  RETRY_ISSUANCE = "retry_issuance",

  // Verification Features
  REQUEST_PROOF = "request_proof",
  EMAIL_VERIFICATION = "email_verification",
  W3C_VERIFICATION = "w3c_verification",
  VERIFY_CREDENTIALS = "verify_credentials",

  // Ecosystem Management
  ECOSYSTEM_MANAGEMENT = "ecosystem_management",
  VIEW_ECOSYSTEMS = "view_ecosystems",
  CREATE_ECOSYSTEM = "create_ecosystem",

  // Platform Administration
  PLATFORM_MANAGEMENT = "platform_management",
  PLATFORM_SETTINGS = "platform_settings",
  VIEW_PLATFORM_ACTIVITY = "view_platform_activity",
  GENERATE_CLIENT_CREDENTIALS = "generate_client_credentials",

  // Dashboard & Analytics
  VIEW_DASHBOARD = "view_dashboard",
  VIEW_ANALYTICS = "view_analytics",
  VIEW_ACTIVITY = "view_activity",

  // Profile & Settings
  MANAGE_PROFILE = "manage_profile",
  VIEW_PROFILE = "view_profile",
  ACCOUNT_SETTINGS = "account_settings",

  // API & Integration
  API_ACCESS = "api_access",
  WEBHOOK_MANAGEMENT = "webhook_management",

  // Data Management
  EXPORT_DATA = "export_data",
  IMPORT_DATA = "import_data",

  // Organization Registration & Approval (NEW)
  REGISTER_ORGANIZATION = "register_organization",
  APPROVE_ORGANIZATION = "approve_organization",

  PENDING_REQUESTS = "pending_requests",
  APPROVE_PENDING_REQUESTS = "approve_pending_requests",
  REJECT_PENDING_REQUESTS = "reject_pending_requests",
  VIEW_PENDING_REQUEST_DETAILS = "view_pending_request_details",
}
