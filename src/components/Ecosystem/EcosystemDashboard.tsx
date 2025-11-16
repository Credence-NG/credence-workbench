import { useEffect, useState } from 'react';
import { Card, Button, Tabs } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { getEcosystem, getAnalytics, getHealth } from '../../api/ecosystem';
import type { Ecosystem, EcosystemAnalytics, EcosystemHealth } from '../../types/ecosystem';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';
import type { EcosystemPermissions } from '../../utils/ecosystemPermissions';
import EditEcosystemModal from './EditEcosystemModal';
import OrganizationList from './OrganizationList';
import AddOrganizationModal from './AddOrganizationModal';
import EcosystemSchemaManager from './EcosystemSchemaManager';
import PricingManager from './PricingManager';
import { HiPencil, HiUsers, HiCreditCard, HiChartBar, HiCheckCircle, HiDocumentText, HiCurrencyDollar, HiArrowLeft } from 'react-icons/hi';

interface EcosystemDashboardProps {
    ecosystemId: string;
}

const EcosystemDashboard = ({ ecosystemId }: EcosystemDashboardProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [ecosystem, setEcosystem] = useState<Ecosystem | null>(null);
    const [analytics, setAnalytics] = useState<EcosystemAnalytics | null>(null);
    const [health, setHealth] = useState<EcosystemHealth | null>(null);
    const [permissions, setPermissions] = useState<EcosystemPermissions | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showAddOrgModal, setShowAddOrgModal] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [organizationIds, setOrganizationIds] = useState<string[]>([]); // Track org IDs for schema fetching

    useEffect(() => {
        loadPermissions();
    }, []);

    useEffect(() => {
        if (permissions) {
            fetchDashboardData();
        }
    }, [ecosystemId, permissions]);

    const loadPermissions = async () => {
        try {
            const perms = await getEcosystemPermissions();
            setPermissions(perms);
        } catch (err) {
            console.error('Error loading permissions:', err);
            setError('Failed to load permissions');
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch ecosystem details
            const ecosystemResponse = await getEcosystem(ecosystemId) as AxiosResponse;
            if (ecosystemResponse.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setEcosystem(ecosystemResponse.data?.data);
            }

            // Fetch analytics if user has permission
            if (permissions?.canViewAnalytics) {
                try {
                    const analyticsResponse = await getAnalytics(ecosystemId) as AxiosResponse;
                    if (analyticsResponse.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                        setAnalytics(analyticsResponse.data?.data);
                    }
                } catch (err) {
                    console.error('Error fetching analytics:', err);
                }
            }

            // Fetch health data if user has permission
            if (permissions?.canViewAnalytics) {
                try {
                    const healthResponse = await getHealth(ecosystemId) as AxiosResponse;
                    if (healthResponse.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                        setHealth(healthResponse.data?.data);
                    }
                } catch (err) {
                    // Health endpoint has backend issues - silently fail for now
                    console.warn('⚠️ Health endpoint unavailable (backend needs fix):', err instanceof Error ? err.message : err);
                }
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'An error occurred while fetching dashboard data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSuccess = () => {
        fetchDashboardData();
    };

    const formatCurrency = (amount: number | undefined) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const formatNumber = (num: number | undefined) => {
        return new Intl.NumberFormat('en-US').format(num || 0);
    };

    const getStatusColor = (status?: string) => {
        const statusColors: Record<string, string> = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        };
        if (!status) return statusColors.inactive;
        return statusColors[status.toLowerCase()] || statusColors.inactive;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CustomSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <AlertComponent
                    message={error}
                    type={'failure'}
                    onAlertClose={() => setError(null)}
                />
            </div>
        );
    }

    if (!ecosystem) {
        return (
            <div className="p-4">
                <AlertComponent
                    message="Ecosystem not found"
                    type={'warning'}
                    onAlertClose={() => window.location.href = '/ecosystems'}
                />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Back to List Link */}
            <div>
                <a
                    href="/ecosystems"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors"
                >
                    <HiArrowLeft className="h-4 w-4" />
                    Back to List
                </a>
            </div>

            {/* Success Message */}
            {message && (
                <AlertComponent
                    message={message}
                    type={'success'}
                    onAlertClose={() => setMessage(null)}
                />
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {ecosystem.logoUrl && (
                        <img
                            src={ecosystem.logoUrl}
                            alt={`${ecosystem.name} logo`}
                            className="h-16 w-16 rounded-lg object-cover"
                        />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {ecosystem.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusColor(ecosystem.status)}`}>
                                {ecosystem.status || 'Unknown'}
                            </span>
                            {ecosystem.businessModel && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {ecosystem.businessModel.replace('_', ' ')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {permissions?.canEdit && (
                    <Button onClick={() => setShowEditModal(true)} className="flex items-center gap-2">
                        <HiPencil className="h-5 w-5" />
                        Edit Ecosystem
                    </Button>
                )}
            </div>

            {/* Description */}
            {ecosystem.description && (
                <Card>
                    <p className="text-gray-700 dark:text-gray-400">
                        {ecosystem.description}
                    </p>
                </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Organizations
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(ecosystem.totalOrganizations)}
                            </p>
                        </div>
                        <HiUsers className="h-8 w-8 text-blue-500" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Transactions
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(ecosystem.totalTransactions)}
                            </p>
                        </div>
                        <HiCreditCard className="h-8 w-8 text-green-500" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(ecosystem.totalRevenue)}
                            </p>
                        </div>
                        <HiChartBar className="h-8 w-8 text-purple-500" />
                    </div>
                </Card>

                {health && (
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Health Score
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {health.score}%
                                </p>
                            </div>
                            <HiCheckCircle className={`h-8 w-8 ${health.score >= 80 ? 'text-green-500' :
                                health.score >= 60 ? 'text-yellow-500' :
                                    'text-red-500'
                                }`} />
                        </div>
                    </Card>
                )}
            </div>

            {/* Analytics Section */}
            {analytics && permissions?.canViewAnalytics && (
                <Card>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Monthly Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Issuances
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(analytics.issuanceCount)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Active Orgs: {formatNumber(analytics.activeOrganizations)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Verifications
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(analytics.verificationCount)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                New Orgs: {formatNumber(analytics.newOrganizations)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Revenue
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(analytics.totalRevenue)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Total Transactions: {formatNumber(analytics.totalTransactions)}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Health Details */}
            {health && permissions?.canViewAnalytics && (
                <Card>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Health Metrics
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Active Organizations</span>
                                <span className="font-medium">{health.indicators.activeOrganizations.value}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Status: {health.indicators.activeOrganizations.status}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Transaction Volume</span>
                                <span className="font-medium">{formatNumber(health.indicators.transactionVolume.value)}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Trend: {health.indicators.transactionVolume.trend} ({health.indicators.transactionVolume.status})
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                                <span className="font-medium">{formatCurrency(health.indicators.revenue.value)}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Trend: {health.indicators.revenue.trend} ({health.indicators.revenue.status})
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Pending Settlements</span>
                                <span className="font-medium">{health.indicators.settlementHealth.pendingCount}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Overdue: {health.indicators.settlementHealth.overdueCount} ({health.indicators.settlementHealth.status})
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Management Tabs - Organizations, Credential Definitions, Pricing */}
            <Card>
                <Tabs.Group aria-label="Ecosystem Management" style="underline" onActiveTabChange={(tab: number) => setActiveTab(tab)}>
                    <Tabs.Item active title="Organizations" icon={HiUsers}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Member Organizations
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Organizations participating in this ecosystem
                                    </p>
                                </div>
                                {(permissions?.canCreate || permissions?.canEdit) && (
                                    <Button onClick={() => setShowAddOrgModal(true)}>
                                        <HiUsers className="mr-2 h-5 w-5" />
                                        Add Organization
                                    </Button>
                                )}
                            </div>
                            <OrganizationList
                                ecosystemId={ecosystemId}
                                onInviteClick={() => setShowAddOrgModal(true)}
                                onOrganizationsChange={(orgIds) => {
                                    setOrganizationIds(orgIds);
                                    // Update ecosystem totalOrganizations count
                                    setEcosystem(prev => prev ? { ...prev, totalOrganizations: orgIds.length } : prev);
                                }}
                            />
                        </div>
                    </Tabs.Item>

                    <Tabs.Item title="Schemas" icon={HiDocumentText}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Schemas
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Schemas from organizations in this ecosystem
                                    </p>
                                </div>
                            </div>
                            <EcosystemSchemaManager
                                ecosystemId={ecosystemId}
                            />
                        </div>
                    </Tabs.Item>

                    <Tabs.Item title="Pricing" icon={HiCurrencyDollar}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Pricing Configuration
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Set pricing for credential issuance and verification
                                    </p>
                                </div>
                            </div>
                            <PricingManager ecosystemId={ecosystemId} />
                        </div>
                    </Tabs.Item>
                </Tabs.Group>
            </Card>

            {/* Quick Actions */}
            <Card>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        onClick={() => window.location.href = `/ecosystems/${ecosystemId}/organizations`}
                        color="light"
                        className="w-full"
                    >
                        View Organizations
                    </Button>
                    <Button
                        onClick={() => window.location.href = `/ecosystems/${ecosystemId}/transactions`}
                        color="light"
                        className="w-full"
                    >
                        View Transactions
                    </Button>
                    {permissions?.canViewAnalytics && (
                        <Button
                            onClick={() => window.location.href = `/ecosystems/${ecosystemId}/analytics`}
                            color="light"
                            className="w-full"
                        >
                            View Analytics
                        </Button>
                    )}
                    {permissions?.canManageSettings && (
                        <Button
                            onClick={() => window.location.href = `/ecosystems/${ecosystemId}/settings`}
                            color="light"
                            className="w-full"
                        >
                            Manage Settings
                        </Button>
                    )}
                </div>
            </Card>

            {/* Edit Modal */}
            {showEditModal && (
                <EditEcosystemModal
                    openModal={showEditModal}
                    setOpenModal={setShowEditModal}
                    ecosystemData={ecosystem}
                    onEditSuccess={handleEditSuccess}
                    setMessage={setMessage}
                />
            )}

            {/* Add Organization Modal */}
            {showAddOrgModal && (
                <AddOrganizationModal
                    ecosystemId={ecosystemId}
                    openModal={showAddOrgModal}
                    setOpenModal={setShowAddOrgModal}
                    setMessage={setMessage}
                    onOrgAdded={() => {
                        // Refresh the organization list by re-fetching ecosystem data
                        fetchDashboardData();
                    }}
                />
            )}
        </div>
    );
};

export default EcosystemDashboard;
