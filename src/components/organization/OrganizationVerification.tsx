import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal, Label, TextInput, Textarea, Pagination } from 'flowbite-react';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import {
    getPendingOrganizations,
    getOrganizationDetailsForReview,
    approveOrganization,
    rejectOrganization,
    type PendingOrganization,
    type PendingOrganizationsResponse,
    type OrganizationDetailsForReview
} from '../../api/organization';
import { getRegulators, type Regulator } from '../../api/locations';
import { apiStatusCodes } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';

interface IProps {
    onSuccess?: (message: string) => void;
}

const OrganizationVerification: React.FC<IProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState<PendingOrganization[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegulator, setSelectedRegulator] = useState('');
    const [regulators, setRegulators] = useState<Regulator[]>([]);
    const [loadingRegulators, setLoadingRegulators] = useState(false);

    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
    const [organizationDetails, setOrganizationDetails] = useState<OrganizationDetailsForReview | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionNotes, setRejectionNotes] = useState('');

    // Alert states
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'success' | 'failure'>('success');

    useEffect(() => {
        loadRegulators();
        loadPendingOrganizations();
    }, [currentPage, searchTerm, selectedRegulator]);

    const loadRegulators = async () => {
        setLoadingRegulators(true);
        try {
            // For now, we'll load all regulators. In a real implementation,
            // you might want to load regulators for all countries or for a specific country
            // For this demo, we'll use a placeholder country ID (Nigeria = 'NG')
            const response = await getRegulators('NG');
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setRegulators(data.data || []);
            } else {
                console.warn('Failed to load regulators for filter');
                setRegulators([]);
            }
        } catch (error) {
            console.error('Error loading regulators:', error);
            setRegulators([]);
        } finally {
            setLoadingRegulators(false);
        }
    };

    const loadPendingOrganizations = async () => {
        setLoading(true);
        try {
            const response = await getPendingOrganizations(
                currentPage,
                10,
                searchTerm || undefined,
                selectedRegulator || undefined
            );
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const orgData: PendingOrganizationsResponse = data.data;
                setOrganizations(orgData.organizations);
                setTotalPages(orgData.totalPages);
                setTotalItems(orgData.totalItems);
            } else {
                setAlertType('failure');
                setAlertMessage('Failed to load pending organizations');
            }
        } catch (error) {
            console.error('Error loading pending organizations:', error);
            setAlertType('failure');
            setAlertMessage('An error occurred while loading pending organizations');
        } finally {
            setLoading(false);
        }
    };

    const loadOrganizationDetails = async (organizationId: string) => {
        setLoadingDetails(true);
        try {
            const response = await getOrganizationDetailsForReview(organizationId);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setOrganizationDetails(data.data);
            } else {
                setAlertType('failure');
                setAlertMessage('Failed to load organization details');
            }
        } catch (error) {
            console.error('Error loading organization details:', error);
            setAlertType('failure');
            setAlertMessage('An error occurred while loading organization details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleViewDetails = (organizationId: string) => {
        setSelectedOrganization(organizationId);
        setShowDetailsModal(true);
        loadOrganizationDetails(organizationId);
    };

    const handleApprove = (organizationId: string) => {
        setSelectedOrganization(organizationId);
        setApprovalNotes('');
        setShowApprovalModal(true);
    };

    const handleReject = (organizationId: string) => {
        setSelectedOrganization(organizationId);
        setRejectionReason('');
        setRejectionNotes('');
        setShowRejectionModal(true);
    };

    const submitApproval = async () => {
        if (!selectedOrganization) return;

        setActionLoading(true);
        try {
            const response = await approveOrganization(selectedOrganization, approvalNotes);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setAlertType('success');
                setAlertMessage('Organization approved successfully');
                setShowApprovalModal(false);
                loadPendingOrganizations(); // Refresh the list
                onSuccess?.('Organization approved successfully');
            } else {
                setAlertType('failure');
                setAlertMessage(data?.message || 'Failed to approve organization');
            }
        } catch (error) {
            console.error('Error approving organization:', error);
            setAlertType('failure');
            setAlertMessage('An error occurred while approving the organization');
        } finally {
            setActionLoading(false);
        }
    };

    const submitRejection = async () => {
        if (!selectedOrganization || !rejectionReason.trim()) return;

        setActionLoading(true);
        try {
            const response = await rejectOrganization(selectedOrganization, rejectionReason, rejectionNotes);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setAlertType('success');
                setAlertMessage('Organization rejected with feedback sent to submitter');
                setShowRejectionModal(false);
                loadPendingOrganizations(); // Refresh the list
                onSuccess?.('Organization rejected successfully');
            } else {
                setAlertType('failure');
                setAlertMessage(data?.message || 'Failed to reject organization');
            }
        } catch (error) {
            console.error('Error rejecting organization:', error);
            setAlertType('failure');
            setAlertMessage('An error occurred while rejecting the organization');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedRegulator('');
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
                                Organization Verification
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Review and approve organization registration submissions
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Badge color="warning" size="lg">
                                {totalItems} Pending
                            </Badge>
                            <Button
                                onClick={loadPendingOrganizations}
                                color="light"
                                size="sm"
                            >
                                Refresh
                            </Button>
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
                <div className="border-b border-gray-200 py-6 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Search Organizations
                            </Label>
                            <TextInput
                                id="search"
                                type="text"
                                placeholder="Search by name, email, or registration number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="regulator" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter by Regulator
                            </Label>
                            <select
                                id="regulator"
                                value={selectedRegulator}
                                onChange={(e) => setSelectedRegulator(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                disabled={loadingRegulators}
                            >
                                <option value="">All Regulators</option>
                                {regulators.map((regulator) => (
                                    <option key={regulator.id} value={regulator.name}>
                                        {regulator.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={resetFilters}
                                color="light"
                                className="w-full"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Organizations List */}
                <div className="py-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="text-center">
                                <CustomSpinner />
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pending organizations...</p>
                            </div>
                        </div>
                    ) : organizations.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Pending Organizations
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {searchTerm || selectedRegulator
                                    ? 'No organizations match your current filters.'
                                    : 'All organizations have been reviewed.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {organizations.map((org) => (
                                <Card key={org.id} className="border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {org.legalName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {org.publicName}
                                                    </p>
                                                </div>
                                                <Badge color="warning" size="sm">
                                                    {org.status}
                                                </Badge>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-3">
                                                <div>
                                                    <span className="font-medium">Submitted by:</span> {org.submittedBy.firstName} {org.submittedBy.lastName}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Email:</span> {org.submittedBy.email}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Regulator:</span> {org.regulator}
                                                </div>
                                            </div>

                                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Submitted on {formatDate(org.submittedAt)}
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                color="light"
                                                onClick={() => handleViewDetails(org.id)}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                                onClick={() => handleApprove(org.id)}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="failure"
                                                onClick={() => handleReject(org.id)}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
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

            {/* Organization Details Modal */}
            <Modal
                show={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                size="4xl"
            >
                <Modal.Header>Organization Details</Modal.Header>
                <Modal.Body>
                    {loadingDetails ? (
                        <div className="flex justify-center py-8">
                            <CustomSpinner />
                        </div>
                    ) : organizationDetails ? (
                        <div className="space-y-6">
                            {/* Submitter Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Submitted By
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.submittedBy.firstName} {organizationDetails.submittedBy.lastName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.submittedBy.email}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Organization Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Organization Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Legal Name:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.organization.legalName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Public Name:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.organization.publicName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Registration Number:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.organization.companyRegistrationNumber}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Website:</span>
                                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                                            <a href={organizationDetails.organization.website} target="_blank" rel="noopener noreferrer">
                                                {organizationDetails.organization.website}
                                            </a>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Regulator:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.organization.regulator}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Regulation Registration:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.organization.regulationRegistrationNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Official Contact
                                </h3>
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Contact Name:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.organization.officialContactFirstName} {organizationDetails.organization.officialContactLastName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {organizationDetails.organization.officialContactPhoneNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Address
                                </h3>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {organizationDetails.organization.address}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">Failed to load organization details.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex space-x-2">
                        <Button
                            color="light"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            Close
                        </Button>
                        {organizationDetails && (
                            <>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleApprove(organizationDetails.organization.id);
                                    }}
                                >
                                    Approve
                                </Button>
                                <Button
                                    color="failure"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleReject(organizationDetails.organization.id);
                                    }}
                                >
                                    Reject
                                </Button>
                            </>
                        )}
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Approval Modal */}
            <Modal
                show={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                size="md"
            >
                <Modal.Header>Approve Organization</Modal.Header>
                <Modal.Body>
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            Are you sure you want to approve this organization? This will:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>Grant the submitter organization owner privileges</li>
                            <li>Enable full platform features for the organization</li>
                            <li>Send an approval notification email</li>
                        </ul>
                        <div>
                            <Label htmlFor="approvalNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Approval Notes (Optional)
                            </Label>
                            <Textarea
                                id="approvalNotes"
                                rows={3}
                                placeholder="Add any notes for the approval..."
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex space-x-2">
                        <Button
                            color="light"
                            onClick={() => setShowApprovalModal(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            onClick={submitApproval}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <>
                                    <CustomSpinner />
                                    <span className="ml-2">Approving...</span>
                                </>
                            ) : (
                                'Approve Organization'
                            )}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Rejection Modal */}
            <Modal
                show={showRejectionModal}
                onClose={() => setShowRejectionModal(false)}
                size="md"
            >
                <Modal.Header>Reject Organization</Modal.Header>
                <Modal.Body>
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            Please provide a reason for rejection. This will be sent to the submitter via email.
                        </p>
                        <div>
                            <Label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Rejection Reason <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id="rejectionReason"
                                type="text"
                                placeholder="e.g., Invalid company registration number"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mt-1"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="rejectionNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Additional Notes
                            </Label>
                            <Textarea
                                id="rejectionNotes"
                                rows={3}
                                placeholder="Provide additional details or instructions for correction..."
                                value={rejectionNotes}
                                onChange={(e) => setRejectionNotes(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex space-x-2">
                        <Button
                            color="light"
                            onClick={() => setShowRejectionModal(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="failure"
                            onClick={submitRejection}
                            disabled={actionLoading || !rejectionReason.trim()}
                        >
                            {actionLoading ? (
                                <>
                                    <CustomSpinner />
                                    <span className="ml-2">Rejecting...</span>
                                </>
                            ) : (
                                'Reject Organization'
                            )}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrganizationVerification;
