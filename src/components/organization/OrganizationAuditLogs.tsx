import React, { useState, useEffect } from 'react';
import { Card, Badge, Table, Pagination, TextInput, Label } from 'flowbite-react';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { apiStatusCodes } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';

interface AuditLogEntry {
    id: string;
    organizationId: string;
    organizationName: string;
    action: 'APPROVED' | 'REJECTED' | 'SUBMITTED';
    adminId?: string;
    adminName?: string;
    reason?: string;
    notes?: string;
    timestamp: string;
    previousStatus?: string;
    newStatus: string;
}

interface AuditLogsResponse {
    logs: AuditLogEntry[];
    totalPages: number;
    totalItems: number;
    currentPage: number;
}

interface IProps {
    organizationId?: string; // Optional - if provided, shows logs for specific organization
}

const OrganizationAuditLogs: React.FC<IProps> = ({ organizationId }) => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Alert states
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'success' | 'failure'>('success');

    // This would be implemented to call the backend API
    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            // TODO: Implement actual API call
            // const response = await getOrganizationAuditLogs({
            //   organizationId,
            //   page: currentPage,
            //   limit: 20,
            //   search: searchTerm,
            //   action: selectedAction,
            //   startDate: dateRange.start,
            //   endDate: dateRange.end
            // });

            // Mock data for now
            const mockResponse = {
                data: {
                    statusCode: apiStatusCodes.API_STATUS_SUCCESS,
                    data: {
                        logs: [
                            {
                                id: '1',
                                organizationId: 'org-1',
                                organizationName: 'Acme Corporation',
                                action: 'SUBMITTED' as const,
                                timestamp: '2024-01-15T10:30:00Z',
                                newStatus: 'PENDING',
                                adminName: 'System',
                            },
                            {
                                id: '2',
                                organizationId: 'org-1',
                                organizationName: 'Acme Corporation',
                                action: 'APPROVED' as const,
                                adminId: 'admin-1',
                                adminName: 'John Admin',
                                timestamp: '2024-01-16T14:22:00Z',
                                previousStatus: 'PENDING',
                                newStatus: 'APPROVED',
                                notes: 'All documentation verified successfully',
                            },
                            {
                                id: '3',
                                organizationId: 'org-2',
                                organizationName: 'Beta Industries',
                                action: 'REJECTED' as const,
                                adminId: 'admin-2',
                                adminName: 'Jane Admin',
                                timestamp: '2024-01-17T09:15:00Z',
                                previousStatus: 'PENDING',
                                newStatus: 'REJECTED',
                                reason: 'Invalid registration number',
                                notes: 'Please provide a valid company registration number and resubmit',
                            },
                        ],
                        totalPages: 1,
                        totalItems: 3,
                        currentPage: 1,
                    } as AuditLogsResponse
                }
            };

            const { data } = mockResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const logData: AuditLogsResponse = data.data;
                setLogs(logData.logs);
                setTotalPages(logData.totalPages);
                setTotalItems(logData.totalItems);
            } else {
                setAlertType('failure');
                setAlertMessage('Failed to load audit logs');
            }
        } catch (error) {
            console.error('Error loading audit logs:', error);
            setAlertType('failure');
            setAlertMessage('An error occurred while loading audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuditLogs();
    }, [currentPage, searchTerm, selectedAction, dateRange, organizationId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case 'APPROVED':
                return 'success';
            case 'REJECTED':
                return 'failure';
            case 'SUBMITTED':
                return 'warning';
            default:
                return 'info';
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedAction('');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };

    return (
        <div className="mx-auto max-w-7xl p-6">
            <Card className="border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                {/* Header */}
                <div className="border-b border-gray-200 pb-6 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {organizationId ? 'Organization Audit Log' : 'Organization Audit Logs'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {organizationId
                                    ? 'Track all actions performed on this organization'
                                    : 'Track all organization approval and rejection activities'
                                }
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Badge color="info" size="lg">
                                {totalItems} Total Records
                            </Badge>
                            <button
                                onClick={loadAuditLogs}
                                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {alertMessage && (
                        <div className="mt-4">
                            <AlertComponent
                                message={alertMessage}
                                type={alertType}
                                onAlertClose={() => setAlertMessage(null)}
                            />
                        </div>
                    )}
                </div>

                {/* Filters */}
                {!organizationId && (
                    <div className="border-b border-gray-200 py-6 dark:border-gray-700">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Search Organizations
                                </Label>
                                <TextInput
                                    id="search"
                                    type="text"
                                    placeholder="Search by organization name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="action" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Filter by Action
                                </Label>
                                <select
                                    id="action"
                                    value={selectedAction}
                                    onChange={(e) => setSelectedAction(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Actions</option>
                                    <option value="SUBMITTED">Submitted</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Start Date
                                </Label>
                                <TextInput
                                    id="startDate"
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={resetFilters}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Audit Logs Table */}
                <div className="py-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="text-center">
                                <CustomSpinner />
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading audit logs...</p>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Audit Logs Found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {searchTerm || selectedAction
                                    ? 'No audit logs match your current filters.'
                                    : 'No audit logs available for the selected criteria.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Head>
                                    <Table.HeadCell>Organization</Table.HeadCell>
                                    <Table.HeadCell>Action</Table.HeadCell>
                                    <Table.HeadCell>Admin</Table.HeadCell>
                                    <Table.HeadCell>Date</Table.HeadCell>
                                    <Table.HeadCell>Status Change</Table.HeadCell>
                                    <Table.HeadCell>Details</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {logs.map((log) => (
                                        <Table.Row key={log.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                <div>
                                                    <div className="font-semibold">{log.organizationName}</div>
                                                    <div className="text-xs text-gray-500">ID: {log.organizationId}</div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge color={getActionBadgeColor(log.action)} size="sm">
                                                    {log.action}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {log.adminName || 'System'}
                                                    </div>
                                                    {log.adminId && (
                                                        <div className="text-xs text-gray-500">ID: {log.adminId}</div>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {formatDate(log.timestamp)}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="text-sm">
                                                    {log.previousStatus && (
                                                        <span className="text-gray-500">
                                                            {log.previousStatus} →{' '}
                                                        </span>
                                                    )}
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {log.newStatus}
                                                    </span>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="max-w-xs">
                                                    {log.reason && (
                                                        <div className="text-sm">
                                                            <span className="font-medium text-red-600">Reason:</span> {log.reason}
                                                        </div>
                                                    )}
                                                    {log.notes && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">Notes:</span> {log.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                                showIcons
                            />
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default OrganizationAuditLogs;
