import { useState, useEffect, ChangeEvent } from 'react';
import type { AxiosResponse } from 'axios';
import { Card, Table, Badge, Pagination, Button, Avatar } from 'flowbite-react';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getApplications } from '../../api/ecosystem';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';
import type {
    Application,
    ApplicationStatus,
} from '../../types/ecosystem';

interface ApplicationListProps {
    ecosystemId: string;
    onReviewApplication?: (application: Application) => void;
}

const ApplicationList = (props: ApplicationListProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [applications, setApplications] = useState<Application[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
    const [canReviewApplications, setCanReviewApplications] = useState<boolean>(false);

    // Pagination state
    const initialPageState = { pageNumber: 1, pageSize: 10, total: 1 };
    const [currentPage, setCurrentPage] = useState(initialPageState.pageNumber);
    const [itemsPerPage] = useState(initialPageState.pageSize);
    const [totalItems, setTotalItems] = useState(0);

    // Check permissions
    useEffect(() => {
        const checkPermissions = async () => {
            const permissions = await getEcosystemPermissions();
            setCanReviewApplications(permissions.canReviewApplications);
        };
        checkPermissions();
    }, []);

    // Fetch applications
    const fetchApplications = async (page: number = 1) => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const params: any = {
                page: page,
                pageSize: itemsPerPage,
            };

            if (searchText.trim()) {
                params.search = searchText.trim();
            }

            if (selectedStatus) {
                params.status = selectedStatus;
            }

            const response = await getApplications(props.ecosystemId, params);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setApplications(data?.data?.applications || []);
                setTotalItems(data?.data?.totalItems || 0);
            } else {
                setErrorMsg(response as string);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications(currentPage);
    }, [
        props.ecosystemId,
        currentPage,
        searchText,
        selectedStatus,
    ]);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value as ApplicationStatus | '');
        setCurrentPage(1);
    };

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getStatusBadge = (status: ApplicationStatus) => {
        const badges = {
            pending: { color: 'warning' as const, label: 'Pending' },
            approved: { color: 'success' as const, label: 'Approved' },
            rejected: { color: 'failure' as const, label: 'Rejected' },
            withdrawn: { color: 'gray' as const, label: 'Withdrawn' },
        };
        const badge = badges[status];
        return (
            <Badge color={badge.color} className="w-fit">
                {badge.label}
            </Badge>
        );
    };

    const getMembershipTypeBadge = (type: string) => {
        const badges = {
            issuer: { color: 'success' as const, label: 'Issuer' },
            verifier: { color: 'info' as const, label: 'Verifier' },
            both: { color: 'purple' as const, label: 'Both' },
        };
        const badge = badges[type as keyof typeof badges] || badges.both;
        return (
            <Badge color={badge.color} className="w-fit">
                {badge.label}
            </Badge>
        );
    };

    const handleReviewClick = (application: Application) => {
        if (props.onReviewApplication) {
            props.onReviewApplication(application);
        }
    };

    if (loading && applications.length === 0) {
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
                    Membership Applications
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Review and manage organization applications to join this ecosystem
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
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Application Table */}
            {applications.length === 0 ? (
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            No applications found.
                        </p>
                    </div>
                </Card>
            ) : (
                <>
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Head>
                                    <Table.HeadCell>Organization</Table.HeadCell>
                                    <Table.HeadCell>Membership Type</Table.HeadCell>
                                    <Table.HeadCell>Submitted</Table.HeadCell>
                                    <Table.HeadCell>Status</Table.HeadCell>
                                    <Table.HeadCell>Actions</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {applications.map((application) => (
                                        <Table.Row
                                            key={application.id}
                                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        img={application.organizationLogo}
                                                        alt={application.organizationName}
                                                        rounded
                                                        size="sm"
                                                    />
                                                    <div>
                                                        <div className="font-semibold">
                                                            {application.organizationName}
                                                        </div>
                                                        {application.message && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                                {application.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {getMembershipTypeBadge(application.membershipType)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white">
                                                <div>
                                                    {new Date(application.submittedAt).toLocaleDateString()}
                                                </div>
                                                {application.reviewedAt && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {getStatusBadge(application.status)}
                                                {application.reviewedBy && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        by {application.reviewedBy}
                                                    </div>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex gap-2">
                                                    {canReviewApplications &&
                                                        application.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleReviewClick(application)}
                                                                className="bg-primary-700 hover:bg-primary-800"
                                                            >
                                                                Review
                                                            </Button>
                                                        )}
                                                    <Button
                                                        size="sm"
                                                        color="gray"
                                                        onClick={() => {
                                                            window.location.href = `/ecosystems/${props.ecosystemId}/applications/${application.id}`;
                                                        }}
                                                    >
                                                        View Details
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
                Showing {applications.length} of {totalItems} applications
            </div>
        </div>
    );
};

export default ApplicationList;
