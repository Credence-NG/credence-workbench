import { verifyPresentation } from "../api/verification";

export const apiRoutes = {
    auth:{
        sendMail:'/auth/verification-mail',
        sinIn: '/auth/signin',
        verifyEmail:'/auth/verify',
        addDetails:'/auth/signup'
    },
    users:{
        userProfile: '/users/profile',
        checkUser:'/users/',
        invitations: '/users/org-invitations',
        fetchUsers: '/users',
        update: '/users',
        recentActivity: '/users/activity',
    },
    organizations: {
        root: '/orgs',
        create: '/orgs',
        update: '/orgs',
        getAll: '/orgs',
        getById: '/orgs',
        getOrgDashboard: '/orgs/dashboard',
        invitations: '/invitations',
        orgRoles: '/orgs/roles',
        editUserROle: '/user-roles'
    },
    connection: {
        create: '/connections',
    },
    schema: {
        create: '/schemas',
        getAll: '/schemas',
        getSchemaById:'/schemas/id',
        createCredentialDefinition: '/credential-definitions',
        getCredDeffBySchemaId: '/schemas/credential-definitions',
        getAllSchemaFromPlatform: `/schemas/platform`
    },
    fido: {
        generateRegistration: 'fido/generate-registration-options',
        verifyRegistration: 'fido/verify-registration/',
        getDeviceList: 'fido/user-details/',
        updateDeviceName: 'fido/device-name',
        userUpdate: 'fido/user-update',
        fidoDevice: 'fido/device',
        fidoAuthentication: 'Fido/generate-authentication-options',
        fidoVerifyAuthentication: 'Fido/verify-authentication/'

    },
		Issuance:{
			getIssuedCredentials:'/issue-credentials',
			getCredDefBySchemaId :'/schemas/credential-definitions',
			getAllConnections:'/connections',
			issueCredential:'/issue-credentials/create-offer'
		},
        Verification:{
			getAllRequestList: '/proofs',
			verifyCredential:'/proofs/request-proof',
            presentationVerification:'/proofs/verify-presentation',
			proofRequestAttributesVerification:'/proofs/form-data'
		},
        Agent:{
			checkAgentHealth: '/agents/health',       
            agentDedicatedSpinup: '/agents/spinup',
            agentSharedSpinup: '/agents/wallet'
		}

}
