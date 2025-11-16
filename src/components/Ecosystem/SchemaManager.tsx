import { useEffect, useState } from 'react';
import { Card, Button, Table, Badge, Pagination, TextInput } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { getSchemasByOrgId } from '../../api/organizationSchema';
import type { Schema, SchemaListParams } from '../../types/ecosystem';
import { HiPlus, HiSearch, HiEye } from 'react-icons/hi';

interface SchemaManagerProps {
    ecosystemId: string;
    organizationId?: string; // Optional: filter schemas by org
}

const SchemaManager = ({ ecosystemId, organizationId }: SchemaManagerProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [schemas, setSchemas] = useState<Schema[]>([]);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        if (organizationId) {
            fetchSchemas();
        } else {
            setLoading(false);
            setError('Please add organizations to the ecosystem first. Schemas will be available from member organizations.');
        }
    }, [organizationId, currentPage, searchText]);

    const fetchSchemas = async () => {
        if (!organizationId) return;

        setLoading(true);
        setError(null);

        try {
            const params: SchemaListParams = {
                pageNumber: currentPage,
                pageSize: pageSize,
                searchByText: searchText || undefined,
            };

            const response = await getSchemasByOrgId(organizationId, params) as AxiosResponse;
            const { data } = response;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const schemaData = data?.data?.data || [];
                const total = data?.data?.totalItems || 0;
                const lastPage = data?.data?.lastPage || 1;

                setSchemas(schemaData);
                setTotalItems(total);
                setTotalPages(lastPage);
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getDataTypeBadge = (dataType: string) => {
        const badgeColors: Record<string, string> = {
            string: 'info',
            number: 'success',
            'datetime-local': 'warning',
            boolean: 'purple',
        };
        return badgeColors[dataType] || 'gray';
    };

    if (!organizationId) {
        return (
            <Card>
                <div className="text-center py-12">
                    <HiPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Organizations Yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Add organizations to your ecosystem first. Then you'll be able to browse and link their schemas for credential pricing.
                    </p>
                    <Button onClick={() => {
                        // Switch to Organizations tab
                        const event = new CustomEvent('switchToOrganizationsTab');
                        window.dispatchEvent(event);
                    }}>
                        Go to Organizations Tab
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Success/Error Messages */}
            {error && (
                <AlertComponent
                    message={error}
                    type="failure"
                    onAlertClose={() => setError(null)}
                />
            )}

            {message && (
                <AlertComponent
                    message={message}
                    type="success"
                    onAlertClose={() => setMessage(null)}
                />
            )}

            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <TextInput
                        icon={HiSearch}
                        placeholder="Search schemas by name..."
                        value={searchText}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {totalItems} schema{totalItems !== 1 ? 's' : ''} found
                </div>
            </div>

            {/* Schemas List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <CustomSpinner />
                </div>
            ) : schemas.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <HiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Schemas Found
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {searchText
                                ? `No schemas match "${searchText}". Try a different search term.`
                                : 'This organization has not created any schemas yet.'}
                        </p>
                    </div>
                </Card>
            ) : (
                <>
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Head>
                                    <Table.HeadCell>Schema Name</Table.HeadCell>
                                    <Table.HeadCell>Version</Table.HeadCell>
                                    <Table.HeadCell>Attributes</Table.HeadCell>
                                    <Table.HeadCell>Organization</Table.HeadCell>
                                    <Table.HeadCell>Created</Table.HeadCell>
                                    <Table.HeadCell>Actions</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {schemas.map((schema) => (
                                        <Table.Row
                                            key={schema.id}
                                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                <div>
                                                    <div className="font-bold">{schema.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                        {schema.id}
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge color="info">{schema.version}</Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex flex-wrap gap-1">
                                                    {schema.attributes.slice(0, 3).map((attr, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            color={getDataTypeBadge(attr.schemaDataType)}
                                                            size="sm"
                                                        >
                                                            {attr.attributeName}
                                                        </Badge>
                                                    ))}
                                                    {schema.attributes.length > 3 && (
                                                        <Badge color="gray" size="sm">
                                                            +{schema.attributes.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{schema.organizationName}</div>
                                                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                        by {schema.userName}
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {formatDate(schema.createDateTime)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="xs"
                                                        color="light"
                                                        title="View schema details"
                                                    >
                                                        <HiEye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        title="Use this schema for pricing"
                                                        onClick={() => {
                                                            // Switch to Pricing tab with this schema
                                                            const event = new CustomEvent('switchToPricingTab', {
                                                                detail: { schemaId: schema.id }
                                                            });
                                                            window.dispatchEvent(event);
                                                        }}
                                                    >
                                                        Set Pricing
                                                    </Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                                showIcons
                            />
                        </div>
                    )}
                </>
            )}

            {/* Info Box */}
            <Card>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                        💡 About Schemas
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Schemas define the structure of verifiable credentials</li>
                        <li>Each schema belongs to an organization in your ecosystem</li>
                        <li>Use schemas to set pricing for credential issuance and verification</li>
                        <li>Organizations must be added to the ecosystem before their schemas appear here</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default SchemaManager;
