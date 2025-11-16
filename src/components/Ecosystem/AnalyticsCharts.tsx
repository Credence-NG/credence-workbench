import { useEffect, useRef, useState } from 'react';
import { Card } from 'flowbite-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { AxiosResponse } from 'axios';

import CustomSpinner from '../CustomSpinner';
import { AlertComponent } from '../AlertComponent';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getAnalytics } from '../../api/ecosystem';
import type { EcosystemAnalytics } from '../../types/ecosystem';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

interface AnalyticsChartsProps {
    ecosystemId: string;
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const AnalyticsCharts = (props: AnalyticsChartsProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [analytics, setAnalytics] = useState<EcosystemAnalytics | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<string>(props.timeRange || 'month');

    // Fetch analytics data
    const fetchAnalytics = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            // Calculate date range based on selected timeRange
            const endDate = new Date();
            const startDate = new Date();

            switch (timeRange) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(endDate.getMonth() - 3);
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
            }

            const response = await getAnalytics(props.ecosystemId, {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setAnalytics(data?.data);
            } else {
                setErrorMsg(response as string);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [props.ecosystemId, timeRange]);

    // Chart options
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Transaction Trends',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Revenue by Type',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: 'Organization Activity',
            },
        },
    };

    // Generate chart data from analytics
    const generateLineChartData = () => {
        if (!analytics) return null;

        // Mock monthly data - in production, this would come from the API
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

        return {
            labels: months,
            datasets: [
                {
                    label: 'Issuances',
                    data: [65, 78, 90, 81, 96, analytics.issuanceCount],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: 'Verifications',
                    data: [45, 52, 68, 75, 82, analytics.verificationCount],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    };

    const generateBarChartData = () => {
        if (!analytics) return null;

        return {
            labels: ['Issuance', 'Verification', 'Revocation'],
            datasets: [
                {
                    label: 'Revenue (USD)',
                    data: [
                        analytics.totalRevenue * 0.6, // Mock split
                        analytics.totalRevenue * 0.35,
                        analytics.totalRevenue * 0.05,
                    ],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                    ],
                    borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)',
                        'rgb(251, 146, 60)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const generateDoughnutData = () => {
        if (!analytics) return null;

        return {
            labels: ['Active Orgs', 'New Orgs', 'Inactive Orgs'],
            datasets: [
                {
                    data: [
                        analytics.activeOrganizations,
                        analytics.newOrganizations,
                        Math.max(0, analytics.activeOrganizations - analytics.newOrganizations),
                    ],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(156, 163, 175, 0.8)',
                    ],
                    borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)',
                        'rgb(156, 163, 175)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
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

    if (!analytics) {
        return (
            <div className="px-4 pt-2">
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            No analytics data available.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    const lineData = generateLineChartData();
    const barData = generateBarChartData();
    const doughnutData = generateDoughnutData();

    return (
        <div className="px-4 pt-2">
            {/* Header with Time Range Selector */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Analytics & Insights
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Ecosystem performance metrics and trends
                    </p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                </select>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Trends - Line Chart */}
                {lineData && (
                    <Card className="col-span-1 lg:col-span-2">
                        <div className="h-80">
                            <Line options={lineChartOptions} data={lineData} />
                        </div>
                    </Card>
                )}

                {/* Revenue by Type - Bar Chart */}
                {barData && (
                    <Card>
                        <div className="h-80">
                            <Bar options={barChartOptions} data={barData} />
                        </div>
                    </Card>
                )}

                {/* Organization Activity - Doughnut Chart */}
                {doughnutData && (
                    <Card>
                        <div className="h-80">
                            <Doughnut options={doughnutOptions} data={doughnutData} />
                        </div>
                    </Card>
                )}
            </div>

            {/* Summary Stats */}
            <Card className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Summary Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {analytics.issuanceCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total Issuances
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {analytics.verificationCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total Verifications
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {analytics.activeOrganizations}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Active Organizations
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            ${analytics.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total Revenue
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsCharts;
