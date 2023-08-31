export const pathRoutes = {
    auth: {
        signUp: '/authentication/sign-up',
        sinIn: '/authentication/sign-in',
        verifyEmail: '/users/verify',
    },
    users: {
        dashboard: '/dashboard',
        profile: '/profile',
        invitations: '/invitations',
        fetchUsers: '/users',
    },
    organizations: {
        root: '/organizations',
        invitations: '/organizations/invitations',
        users: '/organizations/users',
        schemas: `/organizations/schemas`,
        dashboard: '/organizations/dashboard',
        createSchema: '/organizations/schemas/create',
        viewSchema: '/organizations/schemas/view-schema',
    },
    credentials: {
        root: '/credentials',
        issuedCredentials: '/credentials/credentials-issued',
        credentials: '/credentials/verification',
        Issuance: {
            schema: '/credentials/credentials-issued/schemas',
            credDef:'/credentials/credentials-issued/schemas/cred-defs',
            connections:'/credentials/credentials-issued/schemas/cred-defs/connections',
            issuance:'/credentials/credentials-issued/schemas/cred-defs/connections/issuance'
        },
        verification: {
            schema: '/credentials/verification/schemas',
            credDef:'/credentials/verification/schemas/cred-defs',
            connections:'/credentials/verification/schemas/cred-defs/connections',
            verify:'/credentials/verification/schemas/cred-defs/connections/verification'
        },
    },
    // ecosystems: {
    //     root: '/ecosystems',
    //     frameworks: '/ecosystems/frameworks',
    //     members: '/ecosystems/members',
    //     registries: '/ecosystems/registries',
    //     users: '/organizations/users',
    //     credentials: '/organizations/credentials'
    // },
    documentation: {
        root: '/docs'
    },
    schema: {
        create: '/schemas',
        getAll: '/schemas',
        getSchemaById: '/schemas/id',
        createCredentialDefinition: '/credential-definitions',
        getCredDeffBySchemaId: '/schemas/credential-definitions'
    },

		back:{
			schema:{
				schemas:'/organizations/schemas'
			},
			verification:{
				credDef:'/credentials/credentials-issued/schemas/cred-defs',
				schemas:'/credentials/verification/schemas',
				verification:'/credentials/verification/schemas/cred-defs/connections',
			},
			issuance:{
				credDef:'/credentials/credentials-issued/schemas/cred-defs',
				schemas:'/credentials/credentials-issued/schemas',
				connections: '/credentials/credentials-issued/schemas/cred-defs/connections'
			}
		}
}
