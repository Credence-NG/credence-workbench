import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { Card, Progress, Badge } from 'flowbite-react';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getHealth } from '../../api/ecosystem';
import type { EcosystemHealth } from '../../types/ecosystem';

interface HealthIndicatorProps {
    ecosystemId: string;
    showTitle?: boolean;
}

const HealthIndicator = (props: HealthIndicatorProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [health, setHealth] = useState<EcosystemHealth | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Fetch health data
    const fetchHealth = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const response = await getHealth(props.ecosystemId);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setHealth(data?.data);
            } else {
                setErrorMsg(response as string);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch health data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        // Refresh health data every 5 minutes
        const interval = setInterval(fetchHealth, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [props.ecosystemId]);

    const getHealthColor = (score: number): string => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        if (score >= 40) return 'orange';
        return 'red';
    };

    const getHealthLabel = (score: number): string => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: 'success' | 'warning' | 'failure' | 'info'; label: string }> = {
            healthy: { color: 'success', label: 'Healthy' },
            warning: { color: 'warning', label: 'Warning' },
            critical: { color: 'failure', label: 'Critical' },
            unknown: { color: 'info', label: 'Unknown' },
        };

        const config = statusConfig[status] || statusConfig.unknown;
        return (
            <Badge color={config.color} size="lg">
                {config.label}
            </Badge>
        );
    };

    const formatPercentage = (value: number): string => {
        return `${Math.round(value)}%`;
    };

    const calculatePercentage = (value: number, max: number = 100): number => {
        return Math.min(100, Math.round((value / max) * 100));
    };

    const getStatusColor = (status: string): 'green' | 'yellow' | 'red' => {
        if (status === 'good') return 'green';
        if (status === 'warning') return 'yellow';
        return 'red';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <CustomSpinner />
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="px-4 pt-2">
                <AlertComponent
                    message={errorMsg}
                    type="failure"
                    onAlertClose={() => setErrorMsg(null)}
                />
            </div>
        );
    }

    if (!health) {
        return (
            <Card>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                        No health data available.
                    </p>
                </div>
            </Card>
        );
    }

    const healthColor = getHealthColor(health.score);
    const healthLabel = getHealthLabel(health.score);

    return (
        <div className="space-y-4">
            {props.showTitle !== false && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Ecosystem Health
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Real-time health metrics and performance indicators
                    </p>
                </div>
            )}

            {/* Overall Health Score */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Overall Health Score
                    </h3>
                    {getStatusBadge(health.status)}
                </div>

                <div className="flex items-center gap-6">
                    {/* Score Circle */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(health.score / 100) * 352} 352`}
                                className={`text-${healthColor}-500`}
                                style={{
                                    stroke:
                                        healthColor === 'green'
                                            ? 'rgb(34, 197, 94)'
                                            : healthColor === 'yellow'
                                                ? 'rgb(234, 179, 8)'
                                                : healthColor === 'orange'
                                                    ? 'rgb(251, 146, 60)'
                                                    : 'rgb(239, 68, 68)',
                                }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                {health.score}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {healthLabel}
                            </span>
                        </div>
                    </div>

                    {/* Score Description */}
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            The overall health score reflects the ecosystem's operational efficiency,
                            transaction volume, and organizational engagement.
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Last updated: {new Date(health.lastUpdated).toLocaleString()}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Health Indicators */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Indicators
                </h3>

                <div className="space-y-4">
                    {/* Active Organizations */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active Organizations
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {health.indicators.activeOrganizations.value}
                            </span>
                        </div>
                        <Progress
                            progress={calculatePercentage(health.indicators.activeOrganizations.value, 50)}
                            size="lg"
                            color={getStatusColor(health.indicators.activeOrganizations.status)}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {health.indicators.activeOrganizations.value} active organizations
                        </p>
                    </div>

                    {/* Transaction Volume */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Transaction Volume
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {health.indicators.transactionVolume.trend === 'up' ? '↑' : health.indicators.transactionVolume.trend === 'down' ? '↓' : '→'}
                            </span>
                        </div>
                        <Progress
                            progress={calculatePercentage(health.indicators.transactionVolume.value, 1000)}
                            size="lg"
                            color={getStatusColor(health.indicators.transactionVolume.status)}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {health.indicators.transactionVolume.value.toLocaleString()} transactions this period
                        </p>
                    </div>

                    {/* Revenue Performance */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Revenue Performance
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {health.indicators.revenue.trend === 'up' ? '↑' : health.indicators.revenue.trend === 'down' ? '↓' : '→'}
                            </span>
                        </div>
                        <Progress
                            progress={calculatePercentage(health.indicators.revenue.value, 10000)}
                            size="lg"
                            color={getStatusColor(health.indicators.revenue.status)}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ${health.indicators.revenue.value.toLocaleString()} revenue generated
                        </p>
                    </div>

                    {/* Settlement Health */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Settlement Health
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {health.indicators.settlementHealth.overdueCount} overdue
                            </span>
                        </div>
                        <Progress
                            progress={calculatePercentage(
                                Math.max(0, 100 - health.indicators.settlementHealth.overdueCount * 10)
                            )}
                            size="lg"
                            color={getStatusColor(health.indicators.settlementHealth.status)}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {health.indicators.settlementHealth.pendingCount} pending, {health.indicators.settlementHealth.overdueCount} overdue
                        </p>
                    </div>
                </div>
            </Card>

            {/* Health Recommendations */}
            {health.recommendations && health.recommendations.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recommendations
                    </h3>
                    <ul className="space-y-2">
                        {health.recommendations.map((recommendation, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                                <span className="text-primary-600 dark:text-primary-400 mt-1">
                                    •
                                </span>
                                <span>{recommendation}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};

export default HealthIndicator;
