export const apiRoutes = {
  auth: {
    sendMail: "/auth/verification-mail",
    sinIn: "/auth/signin",
    verifyEmail: "/auth/verify",
    addDetails: "/auth/signup",
    passkeyUserDetails: "/users/password/",
    profile: "/profile",
    generateRegistration: "auth/passkey/generate-registration",
    verifyRegistration: "auth/passkey/verify-registration/",
    getDeviceList: "auth/passkey/",
    updateDeviceName: "auth/passkey",
    userUpdate: "auth/passkey/user-details",
    fidoDevice: "auth/passkey",
    fidoAuthentication: "auth/passkey/authentication-options",
    fidoVerifyAuthentication: "auth/passkey/verify-authentication/",
    keyClockResetPassword: "auth/reset-password",
    forgotPassword: "auth/forgot-password",
    resetPassword: "auth/password-reset",
    refreshToken: "/auth/refresh-token",
  },
  Ecosystem: {
    // Core Ecosystem
    root: "/ecosystem",
    list: "/v1/ecosystem", // GET - List ecosystems
    create: "/v1/ecosystem", // POST - Create ecosystem
    getById: "/v1/ecosystem", // GET - Get ecosystem details (append /:id)
    update: "/v1/ecosystem", // PUT - Update ecosystem (append /:id)
    delete: "/v1/ecosystem", // DELETE - Delete ecosystem (append /:id)

    // Organizations
    organizations: "/v1/ecosystem", // GET/POST - List/Add orgs (append /:id/organizations)
    organization: "/v1/ecosystem", // GET/PUT/DELETE (append /:ecosystemId/organizations/:orgId)
    orgPerformance: "/v1/ecosystem", // GET - Org analytics (append /:id/organizations/:orgId/performance)

    // Pricing
    pricing: "/v1/ecosystem", // GET/POST - List/Set pricing (append /:id/pricing)

    // Schemas
    schemas: "/v1/ecosystem", // GET/POST/DELETE - Manage schemas (append /:id/schemas, /:id/schemas/:schemaId)
    schemaPricing: "/v1/ecosystem", // PUT - Update schema pricing (append /:id/schemas/:schemaId/pricing)

    // Transactions
    transactions: "/v1/ecosystem", // GET - List transactions (append /:id/transactions)

    // Settlements
    settlements: "/v1/ecosystem", // GET - List settlements (append /:id/settlements)
    processSettlement: "/v1/ecosystem", // POST (append /:id/settlements/process)
    approveSettlement: "/v1/ecosystem", // POST (append /:id/settlements/:settlementId/approve)
    completeSettlement: "/v1/ecosystem", // POST (append /:id/settlements/:settlementId/complete)
    settlementStats: "/v1/ecosystem", // GET (append /:id/settlements/stats)

    // Analytics
    analytics: "/v1/ecosystem", // GET - Analytics data (append /:id/analytics)
    health: "/v1/ecosystem", // GET - Health metrics (append /:id/health)

    // Onboarding
    applications: "/v1/ecosystem", // GET/POST - List/Submit apps (append /:id/applications)
    application: "/v1/ecosystem", // GET - App details (append /:ecosystemId/applications/:appId)
    reviewApplication: "/v1/ecosystem", // POST (append /:ecosystemId/applications/:appId/review)
    invitations: "/v1/ecosystem", // POST - Send invitation (append /:id/users/invitations)
    getInvitations: "/v1/ecosystem", // GET - Get invitations (append /:id/users/invitations)
    acceptInvitation: "/v1/ecosystem/invitations", // POST (append /:invitationId/accept)
    onboardingStats: "/v1/ecosystem", // GET (append /:id/onboarding/stats)

    // Legacy (Keep for backward compatibility)
    usersInvitation: "/users/invitations",
    endorsements: {
      list: "/endorsement-transactions",
      createSchemaRequest: "/transaction/schema",
    },
  },
  users: {
    userProfile: "/users/profile",
    checkUser: "/users/",
    invitations: "/users/org-invitations",
    fetchUsers: "/users",
    update: "/users",
    recentActivity: "/users/activity",
    platformSettings: "/users/platform-settings",
  },
  organizations: {
    root: "/orgs",
    create: "/orgs",
    register: "/orgs/register",
    myOrganization: "/orgs/my-organization",
    update: "/orgs",
    getAll: "/orgs",
    getById: "/orgs",
    getOrgDashboard: "/orgs/dashboard",
    invitations: "/invitations",
    orgRoles: "/orgs/roles",
    editUserROle: "/user-roles",
    didList: "/dids",
    createDid: "/agents/did",
    primaryDid: "/primary-did",
    getOrgReferences: "/activity-count",
    deleteOrganization: "/organizations/deleteorganizations",
    deleteVerifications: "/verification-records",
    deleteIssaunce: "/issuance-records",
    deleteConnections: "/connections",
    admin: {
      pending: "/admin/orgs/pending",
      details: "/admin/orgs",
      approve: "/admin/orgs",
      reject: "/admin/orgs",
    },
  },
  connection: {
    create: "/connections",
  },
  schema: {
    create: "/schemas",
    getAll: "/schemas",
    getSchemaById: "/schemas",
    createCredentialDefinition: "/cred-defs",
    getCredDefBySchemaId: "/schemas",
  },
  Issuance: {
    getIssuedCredentials: "/credentials",
    getAllConnections: "/connections",
    issueCredential: "/credentials/offer",
    issueOobEmailCredential: "/credentials/oob/email",
    resendCredential: "/credentials/resend",
    bulk: {
      credefList: "/credentials/bulk/template",
      uploadCsv: "/bulk/upload",
      preview: "/preview",
      bulk: "/bulk",
      files: "/bulk/files",
      filesData: "/bulk/file-data",
      retry: "/retry/bulk",
    },
    download: "/credentials/bulk/template",
  },
  CredentialRequests: {
    list: "/list-credential-requests",
    details: "/credential-request-details",
    updateStatus: "/update-credential-request-status",
  },
  Verification: {
    getAllRequestList: "/credentials/proofs",
    verifyCredential: "/proofs",
    oobProofRequest: "/proofs/oob",
    presentationVerification: "/proofs",
    proofRequestAttributesVerification: "/verified-proofs",
    verificationCredDef: "/verifiation/cred-defs",
  },
  Agent: {
    checkAgentHealth: "/agents/health",
    agentDedicatedSpinup: "/agents/spinup",
    agentSharedSpinup: "/agents/wallet",
    getLedgerConfig: "/agents/ledgerConfig",
    createPolygonKeys: "/agents/polygon/create-keys",
    setAgentConfig: "/agents/configure",
    deleteWallet: "/agents/wallet",
  },
  Platform: {
    getAllSchemaFromPlatform: "/platform/schemas",
    getLedgers: "/platform/ledgers",
    getLedgerPlatformUrl: "/platform/network/url/",
  },
  locations: {
    countries: "/locations/countries",
    states: "/locations/states",
    cities: "/locations/cities",
    regulators: "/locations/regulators",
  },
  geo: {
    countriesWithCodes: "/countries-with-codes",
    statesByCountryCode: "/country-code",
    citiesByStateCode: "/states",
    citiesByCountryAndState: "/country-code",
    regulatorsByCountryCode: "/regulators",
    validate: {
      country: "/validate/country",
      state: "/validate/state",
      city: "/validate/city",
    },
  },
  Public: {
    organizations: "/orgs/public-profile",
    organizationDetails: "/orgs/public-profiles",
  },

  setting: {
    setting: "/client_credentials",
  },
};
