# Organization Wallet Retrieval and QR Code Connection - Developer Guide

This comprehensive guide explains how to retrieve organization wallet information from the backend API and generate QR codes for wallet connections in the ConfirmD platform.

## 📁 File Structure Reference

Based on the actual codebase implementation:
- [`src/config/apiRoutes.ts`](../src/config/apiRoutes.ts) - API endpoint configurations
- `src/components/organization/walletCommonComponents/` - Wallet management components
- `src/components/publicProfile/OrgWalletDetails.tsx` - QR code display
- `src/api/organization.ts` - Organization API calls
- `src/api/Agent.ts` - Agent/wallet API calls

## 🏢 Organization Wallet API Endpoints

### **Core Organization Endpoints**

From [`src/config/apiRoutes.ts`](../src/config/apiRoutes.ts):

```typescript
organizations: {
    root: "/orgs",                              // Base organization endpoint
    myOrganization: "/orgs/my-organization",    // Current user's organization
    getById: "/orgs",                           // Get organization by ID
    getOrgDashboard: "/orgs/dashboard",         // Organization dashboard data
    didList: "/dids",                           // Organization's DIDs
    createDid: "/agents/did",                   // Create new DID
    primaryDid: "/primary-did",                 // Primary DID management
    register: "/orgs/register",                 // Register new organization
    update: "/orgs",                            // Update organization
    getAll: "/orgs",                            // Get all organizations
}
```

### **Agent/Wallet Management Endpoints**

```typescript
Agent: {
    checkAgentHealth: "/agents/health",         // Check agent status
    agentDedicatedSpinup: "/agents/spinup",     // Create dedicated agent
    agentSharedSpinup: "/agents/wallet",        // Create shared wallet
    getLedgerConfig: "/agents/ledgerConfig",    // Get ledger configuration
    createPolygonKeys: "/agents/polygon/create-keys", // Generate Polygon keys
    setAgentConfig: "/agents/configure",        // Configure agent
    deleteWallet: "/agents/wallet",             // Delete wallet
}
```

### **Connection Management**

```typescript
connection: {
    create: "/connections",                     // Create connection invitation
}
```

## 🔄 Organization Wallet Retrieval Implementation

### **Step 1: Get Organization Details**

**API Call Function:**
```typescript
import { axiosGet } from '../services/apiService';
import { apiRoutes } from '../config/apiRoutes';
import { getFromLocalStorage, storageKeys } from '../api/Auth';

const getOrganizationById = async (orgId: string) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN);
    const response = await axiosGet({
        url: `${apiRoutes.organizations.getById}/${orgId}`,
        config: { 
            headers: { Authorization: `Bearer ${token}` } 
        }
    });
    return response.data;
};
```

**Usage in Component:**
```typescript
// From WalletSpinup.tsx pattern
const fetchOrganizationDetails = async () => {
    setLoading(true);
    try {
        const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
        const response = await getOrganizationById(orgId as string);
        const { data } = response as AxiosResponse;
        
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            const agentData = data?.data?.org_agents;
            
            // Check agent type
            if (data?.data?.org_agents && 
                data?.data?.org_agents[0]?.org_agent_type?.agent?.toLowerCase() === 'dedicated') {
                setIsConfiguredDedicated(true);
                setAgentType('DEDICATED');
            }
            
            // Check DID configuration
            if (agentData.length > 0 && agentData[0]?.orgDid) {
                setOrgData(data?.data);
            }
        }
    } catch (error) {
        console.error('Error fetching organization:', error);
        setError('Failed to fetch organization details');
    } finally {
        setLoading(false);
    }
};
```

### **Expected API Response Structure**

```json
{
    "statusCode": 200,
    "message": "Organization retrieved successfully",
    "data": {
        "id": "org-123-456",
        "name": "Acme Corporation",
        "description": "Digital credential issuer",
        "website": "https://acme.com",
        "logo": "https://acme.com/logo.png",
        "org_agents": [
            {
                "id": "agent-789",
                "walletName": "acme-wallet",
                "orgDid": "did:indy:sovrin:staging:ABC123...",
                "org_agent_type": {
                    "agent": "DEDICATED"
                },
                "agent_invitations": [
                    {
                        "id": "invitation-001",
                        "connectionInvitation": "https://platform.confamd.com/connections/invite?c_i=eyJhbGciOiJIUzI1NiJ9..."
                    }
                ]
            }
        ],
        "createdAt": "2025-09-08T10:30:00Z",
        "updatedAt": "2025-09-08T15:45:00Z"
    }
}
```

### **Step 2: Check Agent Health**

```typescript
const checkAgentHealth = async () => {
    try {
        const token = await getFromLocalStorage(storageKeys.TOKEN);
        const response = await axiosGet({
            url: apiRoutes.Agent.checkAgentHealth,
            config: { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        });
        
        const { data } = response as AxiosResponse;
        return data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS;
    } catch (error) {
        console.error('Agent health check failed:', error);
        return false;
    }
};
```

### **Step 3: Get Current User's Organization**

```typescript
const getMyOrganization = async () => {
    const token = await getFromLocalStorage(storageKeys.TOKEN);
    const response = await axiosGet({
        url: apiRoutes.organizations.myOrganization,
        config: { 
            headers: { Authorization: `Bearer ${token}` } 
        }
    });
    return response.data;
};
```

## 📱 QR Code Generation Implementation

### **Step 1: Install Required Dependencies**

```bash
npm install qrcode
npm install @types/qrcode --save-dev
```

### **Step 2: Extract Connection Invitation**

Based on `OrgWalletDetails.tsx` pattern:

```typescript
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface OrgWalletDetailsProps {
    orgData: any;
}

const OrgWalletDetails: React.FC<OrgWalletDetailsProps> = ({ orgData }) => {
    const [connectionInvitation, setConnectionInvitation] = useState<string | null>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

    useEffect(() => {
        if (orgData && orgData?.org_agents?.length > 0) {
            const agents = orgData?.org_agents[0];
            if (agents?.agent_invitations?.length > 0) {
                const connection = agents?.agent_invitations[0].connectionInvitation;
                setConnectionInvitation(connection);
                generateQRCode(connection);
            }
        }
    }, [orgData]);

    const generateQRCode = async (invitationUrl: string) => {
        try {
            const qrDataUrl = await QRCode.toDataURL(invitationUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });
            setQrCodeDataUrl(qrDataUrl);
        } catch (error) {
            console.error('QR Code generation failed:', error);
        }
    };

    return (
        <div className="wallet-details-container">
            {qrCodeDataUrl && (
                <div className="qr-code-section">
                    {/* Mobile QR Code */}
                    <div className="block sm:hidden">
                        <img 
                            src={qrCodeDataUrl}
                            alt="Connection QR Code"
                            className="w-24 h-24 mx-auto"
                        />
                    </div>
                    {/* Desktop QR Code */}
                    <div className="hidden sm:block">
                        <img 
                            src={qrCodeDataUrl}
                            alt="Connection QR Code"
                            className="w-40 h-40 mx-auto"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgWalletDetails;
```

### **Step 3: Create New Connection Invitation**

```typescript
const createConnectionInvitation = async (orgId: string, alias?: string) => {
    try {
        const token = await getFromLocalStorage(storageKeys.TOKEN);
        const response = await axiosPost({
            url: apiRoutes.connection.create,
            payload: {
                alias: alias || "Organization Connection",
                autoAccept: true,
                multiUse: false,
                organizationId: orgId
            },
            config: { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        });
        
        const { data } = response as AxiosResponse;
        return data;
    } catch (error) {
        console.error('Failed to create connection invitation:', error);
        throw error;
    }
};
```

### **Step 4: Complete QR Code Component with Error Handling**

```typescript
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Spinner } from 'flowbite-react';

interface WalletConnectionQRProps {
    orgId: string;
    organizationData?: any;
    onConnectionCreated?: (connectionData: any) => void;
}

const WalletConnectionQR: React.FC<WalletConnectionQRProps> = ({ 
    orgId, 
    organizationData,
    onConnectionCreated 
}) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [connectionData, setConnectionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const generateQRCode = async (invitationUrl: string) => {
        try {
            const qrDataUrl = await QRCode.toDataURL(invitationUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });
            return qrDataUrl;
        } catch (error) {
            console.error('QR Code generation failed:', error);
            throw new Error('Failed to generate QR code');
        }
    };

    useEffect(() => {
        const setupWalletConnection = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Option 1: Use existing invitation from organization data
                if (organizationData?.org_agents?.[0]?.agent_invitations?.[0]) {
                    const existingInvitation = organizationData.org_agents[0].agent_invitations[0];
                    const qrCode = await generateQRCode(existingInvitation.connectionInvitation);
                    setQrCodeDataUrl(qrCode);
                    setConnectionData(existingInvitation);
                    onConnectionCreated?.(existingInvitation);
                } else {
                    // Option 2: Create new connection invitation
                    const newConnection = await createConnectionInvitation(orgId);
                    if (newConnection?.statusCode === 200) {
                        const qrCode = await generateQRCode(newConnection.data.invitationUrl);
                        setQrCodeDataUrl(qrCode);
                        setConnectionData(newConnection.data);
                        onConnectionCreated?.(newConnection.data);
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to setup wallet connection';
                setError(errorMessage);
                console.error('Wallet connection setup failed:', err);
            } finally {
                setLoading(false);
            }
        };

        if (orgId) {
            setupWalletConnection();
        }
    }, [orgId, organizationData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-2 text-gray-600">Generating wallet connection...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <h4 className="font-semibold">Connection Error</h4>
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-sm underline"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="wallet-connection-qr bg-white rounded-lg p-6 shadow-sm">
            <div className="qr-code-container text-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Scan to Connect Wallet
                </h3>
                
                {qrCodeDataUrl && (
                    <div className="qr-code-display mb-4">
                        <img 
                            src={qrCodeDataUrl} 
                            alt="Wallet Connection QR Code"
                            className="mx-auto border border-gray-200 rounded-lg shadow-sm"
                        />
                    </div>
                )}
                
                <p className="text-sm text-gray-600 mb-4">
                    Use your mobile wallet to scan this QR code and establish a connection
                </p>
                
                {connectionData && (
                    <div className="connection-info text-left bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Connection ID:</span> {connectionData.connectionId || connectionData.id}</p>
                            <p><span className="font-medium">Status:</span> Active</p>
                        </div>
                        
                        <details className="mt-3">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                Technical Details
                            </summary>
                            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                                {JSON.stringify(connectionData, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletConnectionQR;
```

## 🔧 Wallet Types and Configuration

### **1. Shared Wallet Configuration**

Based on `SharedAgent.tsx` pattern:

```typescript
interface SharedWalletConfig {
    keyType: string;
    method: string;
    ledger?: string;
    label: string;
    privatekey?: string;
    seed?: string;
    network: string;
    domain?: string;
}

const createSharedWallet = async (config: SharedWalletConfig) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN);
    
    const payload = {
        keyType: config.keyType || 'ed25519',
        method: config.method.split(':')[1] || '',
        ledger: config.method === 'did:indy' ? config.ledger : '',
        label: config.label,
        privatekey: config.method === 'did:polygon' ? config.privatekey : '',
        seed: config.method === 'did:polygon' ? '' : config.seed,
        network: config.network,
        domain: config.method === 'did:web' ? config.domain : '',
    };
    
    const response = await axiosPost({
        url: apiRoutes.Agent.agentSharedSpinup,
        payload,
        config: { 
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        }
    });
    
    return response;
};
```

### **2. Dedicated Wallet Configuration**

Based on `DedicatedAgent.tsx` pattern:

```typescript
interface DedicatedWalletConfig {
    seed?: string;
    keyType: string;
    method: string;
    network: string;
    domain?: string;
    privatekey?: string;
}

const createDedicatedWallet = async (config: DedicatedWalletConfig) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN);
    
    const didData = {
        seed: config.method === 'polygon' ? '' : config.seed,
        keyType: config.keyType || 'ed25519',
        method: config.method,
        network: config.network,
        domain: config.method === 'web' ? config.domain : '',
        privatekey: config.method === 'polygon' ? config.privatekey : '',
    };
    
    const response = await axiosPost({
        url: apiRoutes.Agent.agentDedicatedSpinup,
        payload: didData,
        config: { 
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        }
    });
    
    return response;
};
```

## 💰 Polygon Wallet Integration

### **Generate Polygon Keys**

```typescript
const generatePolygonKeys = async (orgId: string) => {
    try {
        const token = await getFromLocalStorage(storageKeys.TOKEN);
        const response = await axiosPost({
            url: apiRoutes.Agent.createPolygonKeys,
            payload: { organizationId: orgId },
            config: { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        });
        
        const { data } = response as AxiosResponse;
        
        if (data?.statusCode === 201) {
            return {
                privateKey: data.data.privateKey,
                publicKey: data.data.publicKey,
                address: data.data.address
            };
        }
        
        throw new Error('Failed to generate Polygon keys');
    } catch (error) {
        console.error('Error generating Polygon keys:', error);
        throw error;
    }
};
```

### **Check Wallet Balance**

```typescript
import { ethers } from 'ethers';

const checkWalletBalance = async (privateKey: string, network: 'testnet' | 'mainnet') => {
    try {
        const rpcUrls = {
            testnet: process.env.PUBLIC_POLYGON_TESTNET_URL || 'https://rpc-amoy.polygon.technology/',
            mainnet: process.env.PUBLIC_POLYGON_MAINNET_URL || 'https://polygon-rpc.com/'
        };

        const networkUrl = rpcUrls[network];
        const provider = new ethers.JsonRpcProvider(networkUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const address = await wallet.getAddress();
        const balance = await provider.getBalance(address);
        const etherBalance = ethers.formatEther(balance);

        return {
            address,
            balance: etherBalance,
            hasMinimumBalance: parseFloat(etherBalance) >= 0.001, // Minimum required for transactions
            network
        };
    } catch (error) {
        console.error('Error checking wallet balance:', error);
        throw error;
    }
};
```

## 📋 Complete Implementation Service

### **OrganizationWalletService Class**

```typescript
import { axiosGet, axiosPost } from '../services/apiService';
import { apiRoutes } from '../config/apiRoutes';
import { getFromLocalStorage, storageKeys } from '../api/Auth';
import { apiStatusCodes } from '../config/CommonConstant';

export class OrganizationWalletService {
    private async getAuthToken(): Promise<string> {
        const token = await getFromLocalStorage(storageKeys.TOKEN);
        if (!token) {
            throw new Error('No authentication token found');
        }
        return token;
    }

    async getOrganizationWallet(orgId: string) {
        try {
            // 1. Get organization details
            const orgResponse = await this.getOrganizationById(orgId);
            
            // 2. Check agent health
            const isAgentHealthy = await this.checkAgentHealth();
            
            if (!isAgentHealthy) {
                throw new Error('Organization agent is not available');
            }

            // 3. Extract wallet information
            const orgData = orgResponse.data;
            const agents = orgData.org_agents || [];
            
            if (agents.length === 0) {
                throw new Error('No wallet configured for this organization');
            }

            const primaryAgent = agents[0];
            const connectionInvitation = primaryAgent.agent_invitations?.[0]?.connectionInvitation;

            return {
                organization: orgData,
                wallet: {
                    id: primaryAgent.id,
                    name: primaryAgent.walletName,
                    did: primaryAgent.orgDid,
                    type: primaryAgent.org_agent_type?.agent,
                    connectionInvitation
                },
                isHealthy: isAgentHealthy
            };
        } catch (error) {
            console.error('Failed to get organization wallet:', error);
            throw error;
        }
    }

    async getOrganizationById(orgId: string) {
        const token = await this.getAuthToken();
        const response = await axiosGet({
            url: `${apiRoutes.organizations.getById}/${orgId}`,
            config: { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        });
        
        if (response.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
            throw new Error('Failed to fetch organization');
        }
        
        return response;
    }

    async checkAgentHealth(): Promise<boolean> {
        try {
            const token = await this.getAuthToken();
            const response = await axiosGet({
                url: apiRoutes.Agent.checkAgentHealth,
                config: { 
                    headers: { Authorization: `Bearer ${token}` } 
                }
            });
            
            return response.statusCode === apiStatusCodes.API_STATUS_SUCCESS;
        } catch (error) {
            console.error('Agent health check failed:', error);
            return false;
        }
    }

    async createWalletConnectionQR(orgId: string): Promise<string> {
        try {
            const walletData = await this.getOrganizationWallet(orgId);
            
            let invitationUrl = walletData.wallet.connectionInvitation;
            
            // If no existing invitation, create a new one
            if (!invitationUrl) {
                const newConnection = await this.createConnectionInvitation(orgId);
                invitationUrl = newConnection.data.invitationUrl;
            }

            // Generate QR code
            const QRCode = await import('qrcode');
            const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });

            return qrCodeDataUrl;
        } catch (error) {
            console.error('Failed to create wallet connection QR:', error);
            throw error;
        }
    }

    async createConnectionInvitation(orgId: string) {
        const token = await this.getAuthToken();
        const response = await axiosPost({
            url: apiRoutes.connection.create,
            payload: {
                alias: "Organization Connection",
                autoAccept: true,
                multiUse: false,
                organizationId: orgId
            },
            config: { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        });
        
        if (response.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
            throw new Error('Failed to create connection invitation');
        }
        
        return response;
    }
}
```

### **Usage Example**

```typescript
import React, { useState, useEffect } from 'react';
import { OrganizationWalletService } from '../services/OrganizationWalletService';
import WalletConnectionQR from '../components/WalletConnectionQR';

const OrganizationWalletPage: React.FC = () => {
    const [orgId, setOrgId] = useState<string>('');
    const [walletService] = useState(new OrganizationWalletService());
    const [walletData, setWalletData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeWallet = async () => {
            try {
                // Get organization ID from localStorage or props
                const storedOrgId = await getFromLocalStorage(storageKeys.ORG_ID);
                if (!storedOrgId) {
                    throw new Error('No organization selected');
                }
                
                setOrgId(storedOrgId);
                
                // Fetch wallet data
                const wallet = await walletService.getOrganizationWallet(storedOrgId);
                setWalletData(wallet);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize wallet');
            } finally {
                setLoading(false);
            }
        };

        initializeWallet();
    }, [walletService]);

    if (loading) {
        return <div>Loading wallet information...</div>;
    }

    if (error) {
        return <div className="text-red-600">Error: {error}</div>;
    }

    return (
        <div className="organization-wallet-page p-6">
            <h1 className="text-2xl font-bold mb-6">Organization Wallet</h1>
            
            {walletData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Wallet Information */}
                    <div className="wallet-info bg-white rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold mb-4">Wallet Details</h2>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Organization:</span> {walletData.organization.name}</p>
                            <p><span className="font-medium">Wallet Name:</span> {walletData.wallet.name}</p>
                            <p><span className="font-medium">DID:</span> <code className="text-xs">{walletData.wallet.did}</code></p>
                            <p><span className="font-medium">Type:</span> {walletData.wallet.type}</p>
                            <p><span className="font-medium">Status:</span> 
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    walletData.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {walletData.isHealthy ? 'Healthy' : 'Offline'}
                                </span>
                            </p>
                        </div>
                    </div>
                    
                    {/* QR Code */}
                    <div>
                        <WalletConnectionQR 
                            orgId={orgId}
                            organizationData={walletData.organization}
                            onConnectionCreated={(connectionData) => {
                                console.log('New connection created:', connectionData);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationWalletPage;
```

## 🔧 Environment Configuration

Make sure your environment variables are set correctly:

```bash
# .env file
PUBLIC_BASE_URL=https://platform.confamd.com
PUBLIC_POLYGON_TESTNET_URL=https://rpc-amoy.polygon.technology/
PUBLIC_POLYGON_MAINNET_URL=https://polygon-rpc.com/
```

## 📋 API Endpoints Summary

| Action | Method | Endpoint | Purpose |
|--------|--------|----------|---------|
| Get Organization | GET | `/orgs/{orgId}` | Retrieve organization and wallet details |
| Get My Organization | GET | `/orgs/my-organization` | Current user's organization |
| Check Agent Health | GET | `/agents/health` | Verify agent availability |
| Create Connection | POST | `/connections` | Generate connection invitation |
| Get Ledger Config | GET | `/agents/ledgerConfig` | Fetch available ledgers/networks |
| Generate Polygon Keys | POST | `/agents/polygon/create-keys` | Create Polygon wallet keys |
| Create Shared Wallet | POST | `/agents/wallet` | Create shared agent wallet |
| Create Dedicated Wallet | POST | `/agents/spinup` | Create dedicated agent wallet |

## 🚀 Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators during async operations
3. **Token Management**: Check for valid authentication tokens before API calls
4. **QR Code Validation**: Validate invitation URLs before generating QR codes
5. **Responsive Design**: Ensure QR codes are appropriately sized for different devices
6. **Security**: Never expose private keys or sensitive wallet data in client-side code
7. **Caching**: Consider caching organization data to reduce API calls
8. **Health Checks**: Regularly verify agent health before wallet operations

## 🔍 Troubleshooting

### Common Issues:

1. **No wallet found**: Organization hasn't completed wallet setup
2. **Agent offline**: Backend agent service is not running
3. **Invalid QR code**: Connection invitation URL is malformed
4. **Authentication errors**: Token expired or invalid
5. **Network issues**: Check API endpoint availability

### Debug Steps:

1. Verify organization has completed wallet setup
2. Check agent health endpoint
3. Validate API endpoints in network tab
4. Confirm authentication token is valid
5. Test QR code with mobile wallet application

This guide provides a comprehensive implementation for organization wallet retrieval and QR code generation in the ConfirmD platform.
