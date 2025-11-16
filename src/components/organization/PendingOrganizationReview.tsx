import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'flowbite-react';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import {
    getMyOrganizationStatus,
    type OrganizationStatusResponse
} from '../../api/organization';
import { apiStatusCodes } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';

interface IProps {
    onEdit?: () => void;
    onGoToDashboard?: () => void;
}

const PendingOrganizationReview: React.FC<IProps> = ({ onEdit, onGoToDashboard }) => {
    const [loading, setLoading] = useState(true);
    const [organizationData, setOrganizationData] = useState<OrganizationStatusResponse | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'success' | 'failure'>('success');

    useEffect(() => {
        loadOrganizationStatus();
    }, []);

    const loadOrganizationStatus = async () => {
        setLoading(true);
        try {
            const response = await getMyOrganizationStatus();
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setOrganizationData(data.data);
            } else {
                setAlertType('failure');
                setAlertMessage('Failed to load organization status');
            }
        } catch (error) {
            console.error('Error loading organization status:', error);
            setAlertType('failure');
            setAlertMessage('An error occurred while loading your organization status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge color="warning" size="sm">Under Review</Badge>;
            case 'approved':
                return <Badge color="success" size="sm">Approved</Badge>;
            case 'rejected':
                return <Badge color="failure" size="sm">Requires Attention</Badge>;
            default:
                return <Badge color="gray" size="sm">Unknown</Badge>;
        }
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    title: 'Organization Under Review',
                    message: 'Your organization registration has been submitted and is currently being reviewed by our platform administrators. You will receive an email notification once the review is complete.',
                    icon: '⏳'
                };
            case 'approved':
                return {
                    title: 'Organization Approved!',
                    message: 'Congratulations! Your organization has been approved and you now have full access to all platform features. You can start managing your organization and issuing credentials.',
                    icon: '🎉'
                };
            case 'rejected':
                return {
                    title: 'Additional Information Required',
                    message: 'Your organization registration requires some corrections. Please review the feedback below and resubmit your application.',
                    icon: '⚠️'
                };
            default:
                return {
                    title: 'Status Unknown',
                    message: 'We are unable to determine your organization status at this time.',
                    icon: '❓'
                };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <CustomSpinner />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading organization status...</p>
                </div>
            </div>
        );
    }

    if (!organizationData) {
        return (
            <div className="mx-auto max-w-4xl p-6">
                <Card className="border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">❓</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            No Organization Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You haven't submitted an organization for registration yet.
                        </p>
                        {alertMessage && (
                            <AlertComponent
                                message={alertMessage}
                                type={alertType}
                                onAlertClose={() => setAlertMessage(null)}
                            />
                        )}
                        <Button
                            onClick={() => window.location.href = '/organizations/register-organization'}
                            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        >
                            Register Organization
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const statusInfo = getStatusMessage(organizationData.status);

    return (
        <div className="mx-auto max-w-4xl p-6">
            <Card className="border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                {/* Header Section */}
                <div className="border-b border-gray-200 pb-6 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">{statusInfo.icon}</div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {statusInfo.title}
                                </h2>
                                <div className="flex items-center space-x-2 mt-2">
                                    {getStatusBadge(organizationData.status)}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Submitted {formatDate(organizationData.submittedAt || '')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            {statusInfo.message}
                        </p>
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

                {/* Organization Details Section */}
                {organizationData.organizationDetails && (
                    <div className="py-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Submitted Organization Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Legal Name:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{organizationData.organizationDetails.legalName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Public Name:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{organizationData.organizationDetails.publicName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Registration Number:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{organizationData.organizationDetails.companyRegistrationNumber}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Website:</span>
                                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                                            <a href={organizationData.organizationDetails.website} target="_blank" rel="noopener noreferrer">
                                                {organizationData.organizationDetails.website}
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Regulatory Information */}
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Regulatory Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Regulator:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{organizationData.organizationDetails.regulator}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Registration Number:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{organizationData.organizationDetails.regulationRegistrationNumber}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Official Contact</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationData.organizationDetails.officialContactFirstName} {organizationData.organizationDetails.officialContactLastName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{organizationData.organizationDetails.officialContactPhoneNumber}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location Information */}
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Location</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Address:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">{organizationData.organizationDetails.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Information Section */}
                {organizationData.reviewedAt && (
                    <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Review Information
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Reviewed on:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{formatDate(organizationData.reviewedAt)}</span>
                            </div>
                            {organizationData.rejectionReason && (
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Feedback:</span>
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                                        <p className="text-red-700 dark:text-red-300">{organizationData.rejectionReason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="flex justify-end space-x-4">
                        {organizationData.status === 'rejected' && onEdit && (
                            <Button
                                onClick={onEdit}
                                color="blue"
                            >
                                Edit & Resubmit
                            </Button>
                        )}
                        {organizationData.status === 'approved' && onGoToDashboard && (
                            <Button
                                onClick={onGoToDashboard}
                                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            >
                                Go to Dashboard
                            </Button>
                        )}
                        <Button
                            onClick={loadOrganizationStatus}
                            color="light"
                        >
                            Refresh Status
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PendingOrganizationReview;
