import { useState, useEffect, ChangeEvent } from 'react';
import type { AxiosResponse } from 'axios';
import { Card, Table, Badge, Pagination, Button } from 'flowbite-react';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getSettlements } from '../../api/ecosystem';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';
import type {
    Settlement,
    SettlementStatus,
    SettlementListParams,
} from '../../types/ecosystem';

interface SettlementListProps {
    ecosystemId: string;
    onProcessSettlement?: (settlement: Settlement) => void;
}

const SettlementList = (props: SettlementListProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<SettlementStatus | ''>('');
    const [canViewSettlements, setCanViewSettlements] = useState<boolean>(false);
    const [canManageSettlements, setCanManageSettlements] = useState<boolean>(false);

    // Pagination state
    const initialPageState = { pageNumber: 1, pageSize: 10, total: 1 };
    const [currentPage, setCurrentPage] = useState(initialPageState.pageNumber);
    const [itemsPerPage] = useState(initialPageState.pageSize);
    const [totalItems, setTotalItems] = useState(0);

    // Check permissions
    useEffect(() => {
        const checkPermissions = async () => {
            const permissions = await getEcosystemPermissions();
            setCanViewSettlements(permissions.canViewSettlements);
            setCanManageSettlements(permissions.canManageSettlements);
        };
        checkPermissions();
    }, []);

    // Fetch settlements
    const fetchSettlements = async (page: number = 1) => {
        if (!canViewSettlements) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const params: SettlementListParams = {
                page: page,
                limit: itemsPerPage, // Backend expects 'limit' not 'pageSize'
            };

            if (searchText.trim()) {
                params.search = searchText.trim();
            }

            if (selectedStatus) {
                params.status = selectedStatus as SettlementStatus;
            }

            const response = await getSettlements(props.ecosystemId, params);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                // API returns: { statusCode: 200, message: "", data: { data: [], totalCount, page, limit, totalPages } }
                setSettlements(data?.data?.data || []);
                setTotalItems(data?.data?.totalCount || 0);
            } else {
                setErrorMsg(data?.message || 'Failed to fetch settlements');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch settlements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canViewSettlements) {
            fetchSettlements(currentPage);
        }
    }, [
        props.ecosystemId,
        currentPage,
        searchText,
        selectedStatus,
        canViewSettlements,
    ]);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value as SettlementStatus | '');
        setCurrentPage(1);
    };

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getStatusBadge = (status: SettlementStatus) => {
        const badges = {
            pending: { color: 'gray' as const, label: 'Pending' },
            processing: { color: 'warning' as const, label: 'Processing' },
            approved: { color: 'info' as const, label: 'Approved' },
            completed: { color: 'success' as const, label: 'Completed' },
            failed: { color: 'failure' as const, label: 'Failed' },
            cancelled: { color: 'dark' as const, label: 'Cancelled' },
        };
        const badge = badges[status];
        return (
            <Badge color={badge.color} className="w-fit">
                {badge.label}
            </Badge>
        );
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start).toLocaleDateString();
        const endDate = new Date(end).toLocaleDateString();
        return `${startDate} - ${endDate}`;
    };

    const handleProcessClick = (settlement: Settlement) => {
        if (props.onProcessSettlement) {
            props.onProcessSettlement(settlement);
        }
    };

    if (!canViewSettlements) {
        return (
            <div className="px-4 pt-2">
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            You don't have permission to view settlements.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    if (loading && settlements.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CustomSpinner />
            </div>
        );
    }

    return (
        <div className="px-4 pt-2">
            <AlertComponent
                message={errorMsg}
                type="failure"
                onAlertClose={() => setErrorMsg(null)}
            />

            {/* Header */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Settlements
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage financial settlements for ecosystem organizations
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div>
                        <SearchInput
                            value={searchText}
                            onInputChange={handleSearch}
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={selectedStatus}
                            onChange={handleStatusFilter}
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Settlement Table */}
            {settlements.length === 0 ? (
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            No settlements found.
                        </p>
                    </div>
                </Card>
            ) : (
                <>
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Head>
                                    <Table.HeadCell>Period</Table.HeadCell>
                                    <Table.HeadCell>Organization</Table.HeadCell>
                                    <Table.HeadCell>Amount</Table.HeadCell>
                                    <Table.HeadCell>Transactions</Table.HeadCell>
                                    <Table.HeadCell>Status</Table.HeadCell>
                                    <Table.HeadCell>Actions</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {settlements.map((settlement) => (
                                        <Table.Row
                                            key={settlement.id}
                                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white">
                                                <div>
                                                    <div className="font-medium">
                                                        {formatDateRange(
                                                            settlement.periodStart,
                                                            settlement.periodEnd
                                                        )}
                                                    </div>
                                                    {settlement.completedAt && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Completed: {new Date(settlement.completedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                                {settlement.organizationName}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div>
                                                    <div className="font-semibold text-lg">
                                                        {formatCurrency(
                                                            settlement.totalAmount,
                                                            settlement.currency
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Issuance: {formatCurrency(settlement.issuanceAmount, settlement.currency)}
                                                        <br />
                                                        Verification: {formatCurrency(settlement.verificationAmount, settlement.currency)}
                                                        {settlement.revocationAmount !== null && settlement.revocationAmount !== undefined && (
                                                            <>
                                                                <br />
                                                                Revocation: {formatCurrency(settlement.revocationAmount, settlement.currency)}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge color="info">{settlement.transactionCount}</Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {getStatusBadge(settlement.status)}
                                                {settlement.paymentReference && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Ref: {settlement.paymentReference}
                                                    </div>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {canManageSettlements &&
                                                    (settlement.status === 'pending' ||
                                                        settlement.status === 'processing') && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleProcessClick(settlement)}
                                                            className="bg-primary-700 hover:bg-primary-800"
                                                        >
                                                            Process
                                                        </Button>
                                                    )}
                                                {settlement.status === 'completed' && (
                                                    <Button
                                                        size="sm"
                                                        color="gray"
                                                        onClick={() => {
                                                            window.location.href = `/ecosystems/${props.ecosystemId}/settlements/${settlement.id}`;
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                                showIcons
                            />
                        </div>
                    )}
                </>
            )}

            {/* Summary Footer */}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Showing {settlements.length} of {totalItems} settlements
            </div>
        </div>
    );
};

export default SettlementList;
