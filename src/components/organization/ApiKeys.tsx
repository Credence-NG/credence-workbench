import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Label, TextInput, Textarea } from 'flowbite-react';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import BreadCrumbs from '../BreadCrumbs';
import { Features } from '../../utils/enums/features';
import RoleViewButton from '../RoleViewButton';
import { EmptyListMessage } from '../EmptyListComponent';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    keyPrefix: string;
    permissions: string[];
    lastUsed?: string;
    createdAt: string;
    expiresAt?: string;
    status: 'active' | 'expired' | 'revoked';
}

const ApiKeys = () => {
    const [loading, setLoading] = useState(false);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyDescription, setNewKeyDescription] = useState('');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'success' | 'failure'>('success');

    // Mock data for demonstration
    useEffect(() => {
        // Simulate loading API keys
        setTimeout(() => {
            setApiKeys([
                {
                    id: '1',
                    name: 'Production API Key',
                    key: 'sk_test_xxxxxxxxxxxxxxxxxxxxx',
                    keyPrefix: 'sk_test_',
                    permissions: ['read', 'write'],
                    lastUsed: '2024-01-15T10:30:00Z',
                    createdAt: '2024-01-01T00:00:00Z',
                    status: 'active'
                },
                {
                    id: '2',
                    name: 'Development API Key',
                    key: 'sk_dev_xxxxxxxxxxxxxxxxxxxxx',
                    keyPrefix: 'sk_dev_',
                    permissions: ['read'],
                    lastUsed: '2024-01-10T14:20:00Z',
                    createdAt: '2023-12-15T00:00:00Z',
                    status: 'active'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleCreateApiKey = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const newKey: ApiKey = {
                id: Date.now().toString(),
                name: newKeyName,
                key: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                keyPrefix: 'sk_',
                permissions: ['read', 'write'],
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            setApiKeys([...apiKeys, newKey]);
            setShowCreateModal(false);
            setNewKeyName('');
            setNewKeyDescription('');
            setAlertType('success');
            setAlertMessage('API key created successfully!');
            setLoading(false);
        }, 1000);
    };

    const handleRevokeApiKey = async () => {
        if (!selectedKey) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setApiKeys(apiKeys.map(key =>
                key.id === selectedKey.id
                    ? { ...key, status: 'revoked' as const }
                    : key
            ));
            setShowRevokeModal(false);
            setSelectedKey(null);
            setAlertType('success');
            setAlertMessage('API key revoked successfully!');
            setLoading(false);
        }, 500);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setAlertType('success');
        setAlertMessage('API key copied to clipboard!');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'expired': return 'warning';
            case 'revoked': return 'failure';
            default: return 'gray';
        }
    };

    return (
        <div className="p-6">
            <BreadCrumbs />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        API Keys
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage your organization's API keys for secure programmatic access.
                    </p>
                </div>

                <RoleViewButton
                    feature={Features.API_ACCESS}
                    callback={() => setShowCreateModal(true)}
                >
                    Create API Key
                </RoleViewButton>
            </div>

            {alertMessage && (
                <AlertComponent
                    message={alertMessage}
                    type={alertType}
                    onAlertClose={() => setAlertMessage(null)}
                />
            )}

            {loading && apiKeys.length === 0 ? (
                <div className="flex justify-center py-8">
                    <CustomSpinner />
                </div>
            ) : apiKeys.length === 0 ? (
                <EmptyListMessage
                    message="No API keys found"
                    description="Create your first API key to get started with programmatic access."
                    buttonText="Create API Key"
                    feature={Features.API_ACCESS}
                    onClick={() => setShowCreateModal(true)}
                />
            ) : (
                <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                        <Card key={apiKey.id} className="border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {apiKey.name}
                                            </h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge color={getStatusColor(apiKey.status)} size="sm">
                                                    {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
                                                </Badge>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {apiKey.keyPrefix}••••••••
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-3">
                                        <div>
                                            <span className="font-medium">Created:</span> {formatDate(apiKey.createdAt)}
                                        </div>
                                        {apiKey.lastUsed && (
                                            <div>
                                                <span className="font-medium">Last used:</span> {formatDate(apiKey.lastUsed)}
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Permissions:</span> {apiKey.permissions.join(', ')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    {apiKey.status === 'active' && (
                                        <>
                                            <Button
                                                size="sm"
                                                color="light"
                                                onClick={() => copyToClipboard(apiKey.key)}
                                            >
                                                Copy Key
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="failure"
                                                onClick={() => {
                                                    setSelectedKey(apiKey);
                                                    setShowRevokeModal(true);
                                                }}
                                            >
                                                Revoke
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create API Key Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <Modal.Header>Create New API Key</Modal.Header>
                <Modal.Body>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="keyName" className="mb-2 block">
                                API Key Name <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id="keyName"
                                type="text"
                                placeholder="e.g., Production API Key"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="keyDescription" className="mb-2 block">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="keyDescription"
                                placeholder="Describe what this API key will be used for..."
                                rows={3}
                                value={newKeyDescription}
                                onChange={(e) => setNewKeyDescription(e.target.value)}
                            />
                        </div>
                        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Important:</strong> Make sure to copy your API key now. You won't be able to see it again!
                            </p>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={handleCreateApiKey}
                        disabled={!newKeyName.trim() || loading}
                    >
                        {loading ? 'Creating...' : 'Create API Key'}
                    </Button>
                    <Button color="gray" onClick={() => setShowCreateModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Revoke API Key Modal */}
            <Modal show={showRevokeModal} onClose={() => setShowRevokeModal(false)}>
                <Modal.Header>Revoke API Key</Modal.Header>
                <Modal.Body>
                    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        Are you sure you want to revoke the API key "{selectedKey?.name}"?
                        This action cannot be undone and any applications using this key will lose access immediately.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="failure" onClick={handleRevokeApiKey} disabled={loading}>
                        {loading ? 'Revoking...' : 'Revoke Key'}
                    </Button>
                    <Button color="gray" onClick={() => setShowRevokeModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ApiKeys;
