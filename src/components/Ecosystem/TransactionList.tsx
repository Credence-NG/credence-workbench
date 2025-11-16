import { useState, useEffect, ChangeEvent } from 'react';
import type { AxiosResponse } from 'axios';
import { Card, Table, Badge, Pagination } from 'flowbite-react';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getTransactions } from '../../api/ecosystem';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';
import type {
    EcosystemTransaction,
    TransactionType,
    TransactionListParams,
} from '../../types/ecosystem';

interface TransactionListProps {
    ecosystemId: string;
}

const TransactionList = (props: TransactionListProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [transactions, setTransactions] = useState<EcosystemTransaction[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedType, setSelectedType] = useState<TransactionType | ''>('');
    const [selectedSettled, setSelectedSettled] = useState<string>('');
    const [canViewTransactions, setCanViewTransactions] = useState<boolean>(false);

    // Pagination state
    const initialPageState = { pageNumber: 1, pageSize: 10, total: 1 };
    const [currentPage, setCurrentPage] = useState(initialPageState.pageNumber);
    const [itemsPerPage] = useState(initialPageState.pageSize);
    const [totalItems, setTotalItems] = useState(0);

    // Check permissions
    useEffect(() => {
        const checkPermissions = async () => {
            const permissions = await getEcosystemPermissions();
            setCanViewTransactions(
                permissions.canViewAllTransactions || permissions.canViewTransactions
            );
        };
        checkPermissions();
    }, []);

    // Fetch transactions
    const fetchTransactions = async (page: number = 1) => {
        if (!canViewTransactions) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const params: TransactionListParams = {
                page: page,
                limit: itemsPerPage, // Backend expects 'limit' not 'pageSize'
            };

            if (searchText.trim()) {
                params.search = searchText.trim();
            }

            if (selectedType) {
                params.type = selectedType as TransactionType;
            }

            if (selectedSettled) {
                params.settled = selectedSettled === 'true';
            }

            const response = await getTransactions(props.ecosystemId, params);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                // API returns: { statusCode: 200, message: "", data: { data: [], totalCount, page, limit, totalPages } }
                setTransactions(data?.data?.data || []);
                setTotalItems(data?.data?.totalCount || 0);
            } else {
                setErrorMsg(data?.message || 'Failed to fetch transactions');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canViewTransactions) {
            fetchTransactions(currentPage);
        }
    }, [
        props.ecosystemId,
        currentPage,
        searchText,
        selectedType,
        selectedSettled,
        canViewTransactions,
    ]);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage(1);
    };

    const handleTypeFilter = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value as TransactionType | '');
        setCurrentPage(1);
    };

    const handleSettledFilter = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedSettled(e.target.value);
        setCurrentPage(1);
    };

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getTransactionTypeBadge = (type: TransactionType) => {
        const badges = {
            issuance: { color: 'success' as const, label: 'Issuance' },
            verification: { color: 'info' as const, label: 'Verification' },
            revocation: { color: 'warning' as const, label: 'Revocation' },
        };
        const badge = badges[type];
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

    if (!canViewTransactions) {
        return (
            <div className="px-4 pt-2">
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            You don't have permission to view transactions.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    if (loading && transactions.length === 0) {
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
                    Transactions
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    View all credential transactions in this ecosystem
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <SearchInput
                            value={searchText}
                            onInputChange={handleSearch}
                        />
                    </div>

                    {/* Type Filter */}
                    <div>
                        <select
                            value={selectedType}
                            onChange={handleTypeFilter}
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">All Types</option>
                            <option value="issuance">Issuance</option>
                            <option value="verification">Verification</option>
                            <option value="revocation">Revocation</option>
                        </select>
                    </div>

                    {/* Settlement Filter */}
                    <div>
                        <select
                            value={selectedSettled}
                            onChange={handleSettledFilter}
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="true">Settled</option>
                            <option value="false">Pending Settlement</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Transaction Table */}
            {transactions.length === 0 ? (
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            No transactions found.
                        </p>
                    </div>
                </Card>
            ) : (
                <>
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Head>
                                    <Table.HeadCell>Date</Table.HeadCell>
                                    <Table.HeadCell>Organization</Table.HeadCell>
                                    <Table.HeadCell>Type</Table.HeadCell>
                                    <Table.HeadCell>Credential</Table.HeadCell>
                                    <Table.HeadCell>Amount</Table.HeadCell>
                                    <Table.HeadCell>Settlement</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {transactions.map((transaction) => (
                                        <Table.Row
                                            key={transaction.id}
                                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white">
                                                {new Date(transaction.createdAt).toLocaleString()}
                                            </Table.Cell>
                                            <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                                {transaction.organizationName}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {getTransactionTypeBadge(transaction.type)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="max-w-xs">
                                                    <div className="font-medium text-sm">
                                                        {transaction.credentialName || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {transaction.credentialDefinitionId}
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="font-semibold">
                                                {formatCurrency(
                                                    transaction.amount,
                                                    transaction.currency
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {transaction.settled ? (
                                                    <Badge color="success">Settled</Badge>
                                                ) : (
                                                    <Badge color="warning">Pending</Badge>
                                                )}
                                                {transaction.settlementId && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        ID: {transaction.settlementId.substring(0, 8)}...
                                                    </div>
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
                Showing {transactions.length} of {totalItems} transactions
            </div>
        </div>
    );
};

export default TransactionList;
