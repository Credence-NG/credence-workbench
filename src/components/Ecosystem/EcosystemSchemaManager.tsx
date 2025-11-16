import { useEffect, useState } from 'react';
import { Card, Button, Badge, Table, Pagination } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import type { ChangeEvent } from 'react';
import { getEcosystemSchemas, removeSchemaFromEcosystem } from '../../api/ecosystem';
import type { EcosystemSchema, SchemaListParams } from '../../types/ecosystem';
import { HiDocumentText, HiPlus, HiTrash, HiChevronDown, HiChevronRight, HiCurrencyDollar, HiPencil } from 'react-icons/hi';
import AddSchemaToEcosystemModal from './AddSchemaToEcosystemModal';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';
import { calculateRevenueDistribution } from '../../utils/ecosystemValidation';

interface EcosystemSchemaManagerProps {
    ecosystemId: string;
}

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 1,
};

const EcosystemSchemaManager = ({ ecosystemId }: EcosystemSchemaManagerProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [schemas, setSchemas] = useState<EcosystemSchema[]>([]);
    const [currentPage, setCurrentPage] = useState(initialPageState);
    const [searchText, setSearchText] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSchema, setEditingSchema] = useState<EcosystemSchema | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deletingSchemaId, setDeletingSchemaId] = useState<string | null>(null);
    const [expandedSchemaId, setExpandedSchemaId] = useState<string | null>(null);
    const [canManageSchemas, setCanManageSchemas] = useState<boolean>(false);
    const [canViewSchemas, setCanViewSchemas] = useState<boolean>(false);

    // Fetch permissions
    useEffect(() => {
        const checkPermissions = async () => {
            const permissions = await getEcosystemPermissions();
            setCanManageSchemas(permissions.canManageEcosystemSchemas);
            setCanViewSchemas(permissions.canViewEcosystemSchemas);
        };
        checkPermissions();
    }, []);

    useEffect(() => {
        if (ecosystemId) {
            fetchSchemas();
        }
    }, [ecosystemId, currentPage.pageNumber, searchText]);

    const fetchSchemas = async () => {
        console.log('🔄 [EcosystemSchemaManager] Fetching schemas for ecosystem:', ecosystemId);
        setLoading(true);
        setError(null);

        try {
            const params: SchemaListParams = {
                pageNumber: currentPage.pageNumber,
                pageSize: currentPage.pageSize,
                searchByText: searchText || '',
            };

            console.log('📋 [EcosystemSchemaManager] Fetch params:', params);
            const response = await getEcosystemSchemas(ecosystemId, params) as AxiosResponse;
            console.log('📦 [EcosystemSchemaManager] API Response:', response);
            const { data } = response;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                // Backend returns schemas inside data.schemas
                const schemaList = Array.isArray(data?.data?.schemas) ? data.data.schemas : [];
                const totalItems = schemaList.length;
                console.log('✅ [EcosystemSchemaManager] Schemas fetched:', {
                    count: schemaList.length,
                    totalItems,
                    schemas: schemaList
                });
                const totalPages = Math.ceil(totalItems / currentPage.pageSize);

                setSchemas(schemaList);
                setCurrentPage((prev) => ({
                    ...prev,
                    total: totalPages || 1,
                }));
            } else {
                setError(data?.message || 'Failed to fetch schemas');
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'An error occurred while fetching schemas';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSchema = async (schemaId: string) => {
        if (!confirm('Are you sure you want to remove this schema from the ecosystem?')) {
            return;
        }

        setDeletingSchemaId(schemaId);
        setError(null);

        try {
            const response = await removeSchemaFromEcosystem(ecosystemId, schemaId) as AxiosResponse;
            const { data } = response;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setSuccess('Schema removed successfully');
                fetchSchemas();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data?.message || 'Failed to remove schema');
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'An error occurred while removing schema';
            setError(errorMessage);
        } finally {
            setDeletingSchemaId(null);
        }
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage((prev) => ({ ...prev, pageNumber: 1 }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage((prev) => ({ ...prev, pageNumber: page }));
    };

    const handleSchemaAdded = () => {
        console.log('🎉 [EcosystemSchemaManager] Schema added/updated, refreshing list...');
        setShowAddModal(false);
        setShowEditModal(false);
        fetchSchemas();
        setTimeout(() => setSuccess(null), 3000);
    };

    const toggleExpandRow = (schemaId: string) => {
        setExpandedSchemaId(expandedSchemaId === schemaId ? null : schemaId);
    };

    if (loading && schemas.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <CustomSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Alerts */}
            {error && (
                <AlertComponent
                    message={error}
                    type={'failure'}
                    onAlertClose={() => setError(null)}
                />
            )}
            {success && (
                <AlertComponent
                    message={success}
                    type={'success'}
                    onAlertClose={() => setSuccess(null)}
                />
            )}

            {/* Header with Search and Add Button */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                    <SearchInput
                        onInputChange={handleSearchChange}
                        value={searchText}
                    />
                </div>
                {canManageSchemas && (
                    <Button
                        color="primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <HiPlus className="mr-2 h-5 w-5" />
                        Add Schema
                    </Button>
                )}
            </div>

            {/* Schema List */}
            {schemas && schemas.length > 0 ? (
                <>
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Head>
                                    <Table.HeadCell>Schema Name</Table.HeadCell>
                                    <Table.HeadCell>Issuance</Table.HeadCell>
                                    <Table.HeadCell>Verification</Table.HeadCell>
                                    <Table.HeadCell>Revocation</Table.HeadCell>
                                    <Table.HeadCell>Currency</Table.HeadCell>
                                    <Table.HeadCell>Added</Table.HeadCell>
                                    <Table.HeadCell>Details</Table.HeadCell>
                                    {canManageSchemas && <Table.HeadCell>Actions</Table.HeadCell>}
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {schemas.map((ecosystemSchema) => {
                                        const isExpanded = expandedSchemaId === ecosystemSchema.id;

                                        return (
                                            <>
                                                <Table.Row
                                                    key={ecosystemSchema.id}
                                                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                                >
                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                        <div className="flex items-center gap-2">
                                                            <HiDocumentText className="h-5 w-5 text-gray-400" />
                                                            <div>
                                                                <div className="font-medium">
                                                                    {(() => {
                                                                        // Try nested schema object first (if backend populates it)
                                                                        if (ecosystemSchema.schema?.name) {
                                                                            return ecosystemSchema.schema.name;
                                                                        }
                                                                        // Otherwise parse from schemaLedgerId (Indy format: did:2:name:version)
                                                                        const parts = ecosystemSchema.schemaLedgerId?.split(':');
                                                                        return parts && parts.length >= 3 ? parts[2] : 'Unknown Schema';
                                                                    })()}
                                                                </div>
                                                                <div className="text-xs text-gray-500 font-normal">
                                                                    v{(() => {
                                                                        // Try nested schema object first
                                                                        if (ecosystemSchema.schema?.version) {
                                                                            return ecosystemSchema.schema.version;
                                                                        }
                                                                        // Otherwise parse from schemaLedgerId (Indy format: did:2:name:version)
                                                                        const parts = ecosystemSchema.schemaLedgerId?.split(':');
                                                                        return parts && parts.length >= 4 ? parts[3] : 'N/A';
                                                                    })()}
                                                                </div>
                                                                <div className="text-xs text-gray-400 font-mono mt-1">
                                                                    {ecosystemSchema.schemaLedgerId?.substring(0, 25)}...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="flex items-center gap-1">
                                                            <HiCurrencyDollar className="h-4 w-4 text-green-600" />
                                                            <span className="font-semibold text-green-600">
                                                                {ecosystemSchema.issuancePrice ? Number(ecosystemSchema.issuancePrice).toFixed(2) : '0.00'}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {ecosystemSchema.issuancePlatformShare}%/
                                                            {ecosystemSchema.issuanceEcosystemShare}%/
                                                            {ecosystemSchema.issuanceIssuerShare}%
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="flex items-center gap-1">
                                                            <HiCurrencyDollar className="h-4 w-4 text-blue-600" />
                                                            <span className="font-semibold text-blue-600">
                                                                {ecosystemSchema.verificationPrice ? Number(ecosystemSchema.verificationPrice).toFixed(2) : '0.00'}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {ecosystemSchema.verificationPlatformShare}%/
                                                            {ecosystemSchema.verificationEcosystemShare}%/
                                                            {ecosystemSchema.verificationIssuerShare}%
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="flex items-center gap-1">
                                                            <HiCurrencyDollar className="h-4 w-4 text-amber-600" />
                                                            <span className="font-semibold text-amber-600">
                                                                {ecosystemSchema.revocationPrice ? Number(ecosystemSchema.revocationPrice).toFixed(2) : '0.00'}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {ecosystemSchema.revocationPlatformShare}%/
                                                            {ecosystemSchema.revocationEcosystemShare}%/
                                                            {ecosystemSchema.revocationIssuerShare}%
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Badge color="gray">{ecosystemSchema.currency || 'USD'}</Badge>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            {new Date(ecosystemSchema.createDateTime).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            by {ecosystemSchema.createdBy?.substring(0, 8)}...
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Button
                                                            size="xs"
                                                            color="light"
                                                            onClick={() => toggleExpandRow(ecosystemSchema.id)}
                                                        >
                                                            {isExpanded ? (
                                                                <HiChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <HiChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </Table.Cell>
                                                    {canManageSchemas && (
                                                        <Table.Cell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="xs"
                                                                    color="info"
                                                                    onClick={() => {
                                                                        setEditingSchema(ecosystemSchema);
                                                                        setShowEditModal(true);
                                                                    }}
                                                                    title="Edit pricing"
                                                                >
                                                                    <HiPencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="xs"
                                                                    color="failure"
                                                                    onClick={() => handleRemoveSchema(ecosystemSchema.id)}
                                                                    disabled={deletingSchemaId === ecosystemSchema.id}
                                                                    title="Remove schema"
                                                                >
                                                                    {deletingSchemaId === ecosystemSchema.id ? (
                                                                        <CustomSpinner />
                                                                    ) : (
                                                                        <HiTrash className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </Table.Cell>
                                                    )}
                                                </Table.Row>

                                                {/* Expanded Row with Revenue Breakdown */}
                                                {isExpanded && (
                                                    <Table.Row className="bg-gray-50 dark:bg-gray-900">
                                                        <Table.Cell colSpan={canManageSchemas ? 8 : 7}>
                                                            <div className="p-4 space-y-4">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                                                    Revenue Distribution Breakdown
                                                                </h4>

                                                                {/* Issuance Distribution */}
                                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h5 className="font-medium text-green-600">
                                                                            Issuance Revenue
                                                                        </h5>
                                                                        <span className="text-lg font-bold text-green-600">
                                                                            {ecosystemSchema.currency} {ecosystemSchema.issuancePrice ? Number(ecosystemSchema.issuancePrice).toFixed(2) : '0.00'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Platform ({ecosystemSchema.issuancePlatformShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.issuancePrice) * Number(ecosystemSchema.issuancePlatformShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Ecosystem ({ecosystemSchema.issuanceEcosystemShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.issuancePrice) * Number(ecosystemSchema.issuanceEcosystemShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Issuer ({ecosystemSchema.issuanceIssuerShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.issuancePrice) * Number(ecosystemSchema.issuanceIssuerShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Verification Distribution */}
                                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h5 className="font-medium text-blue-600">
                                                                            Verification Revenue
                                                                        </h5>
                                                                        <span className="text-lg font-bold text-blue-600">
                                                                            {ecosystemSchema.currency} {ecosystemSchema.verificationPrice ? Number(ecosystemSchema.verificationPrice).toFixed(2) : '0.00'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Platform ({ecosystemSchema.verificationPlatformShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.verificationPrice) * Number(ecosystemSchema.verificationPlatformShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Ecosystem ({ecosystemSchema.verificationEcosystemShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.verificationPrice) * Number(ecosystemSchema.verificationEcosystemShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Issuer ({ecosystemSchema.verificationIssuerShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.verificationPrice) * Number(ecosystemSchema.verificationIssuerShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Revocation Distribution */}
                                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h5 className="font-medium text-amber-600">
                                                                            Revocation Revenue
                                                                        </h5>
                                                                        <span className="text-lg font-bold text-amber-600">
                                                                            {ecosystemSchema.currency} {ecosystemSchema.revocationPrice ? Number(ecosystemSchema.revocationPrice).toFixed(2) : '0.00'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Platform ({ecosystemSchema.revocationPlatformShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.revocationPrice) * Number(ecosystemSchema.revocationPlatformShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Ecosystem ({ecosystemSchema.revocationEcosystemShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.revocationPrice) * Number(ecosystemSchema.revocationEcosystemShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-gray-600 dark:text-gray-400">Issuer ({ecosystemSchema.revocationIssuerShare}%)</div>
                                                                            <div className="font-semibold">
                                                                                {ecosystemSchema.currency} {((Number(ecosystemSchema.revocationPrice) * Number(ecosystemSchema.revocationIssuerShare)) / 100).toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                )}
                                            </>
                                        );
                                    })}
                                </Table.Body>
                            </Table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {currentPage.total > 1 && (
                        <div className="flex justify-center mt-4">
                            <Pagination
                                currentPage={currentPage.pageNumber}
                                totalPages={currentPage.total}
                                onPageChange={handlePageChange}
                                showIcons
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <HiDocumentText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No Schemas Found</p>
                    <p className="text-sm mb-4">
                        {searchText
                            ? 'No schemas match your search criteria.'
                            : 'Add schemas with pricing configuration to start monetizing credentials in this ecosystem.'}
                    </p>
                    {canManageSchemas && (
                        <Button
                            color="primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            <HiPlus className="mr-2 h-5 w-5" />
                            Add Your First Schema
                        </Button>
                    )}
                </div>
            )}

            {/* Info Card */}
            <Card>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-2">About Schema Pricing</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Each schema has separate pricing for issuance, verification, and revocation operations</li>
                        <li>Revenue is automatically split between Platform, Ecosystem, and Issuers/Verifiers</li>
                        <li>Standard split: Platform 10%, Ecosystem 5%, Issuer/Verifier 85%</li>
                        <li>Click the arrow button to view detailed revenue breakdown for each operation</li>
                        <li>Pricing can be configured when adding a schema or updated later via the Pricing Manager</li>
                    </ul>
                </div>
            </Card>

            {/* Add Schema Modal */}
            {showAddModal && canManageSchemas && (
                <AddSchemaToEcosystemModal
                    ecosystemId={ecosystemId}
                    openModal={showAddModal}
                    setOpenModal={setShowAddModal}
                    onSchemaAdded={handleSchemaAdded}
                    setMessage={setError}
                />
            )}

            {/* Edit Schema Modal */}
            {showEditModal && canManageSchemas && editingSchema && (
                <AddSchemaToEcosystemModal
                    ecosystemId={ecosystemId}
                    openModal={showEditModal}
                    setOpenModal={(flag) => {
                        setShowEditModal(flag);
                        if (!flag) setEditingSchema(null);
                    }}
                    onSchemaAdded={handleSchemaAdded}
                    setMessage={setSuccess}
                    editingSchema={editingSchema}
                />
            )}
        </div>
    );
};

export default EcosystemSchemaManager;
