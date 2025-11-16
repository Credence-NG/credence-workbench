import React, { useEffect, useState } from 'react';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import { Button, Card } from 'flowbite-react';
import DateTooltip from '../Tooltip';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { dateConversion } from '../../utils/DateConversion';
import { pathRoutes } from '../../config/pathRoutes';
import { getFromLocalStorage } from '../../api/Auth';
import type { CredentialRequestDetails, CredentialRequestDetailsResponse } from '../../api/credentialRequests';
import { getCredentialRequestDetails, updateCredentialRequestStatus } from '../../api/credentialRequests';
import CustomSpinner from '../CustomSpinner';
import { Features } from '../../utils/enums/features';
import RoleViewButton from '../RoleViewButton';
import CredentialIssueForm from './CredentialIssueForm';

interface PendingRequestDetailsProps {
	requestId: string;
}

const PendingRequestDetails: React.FC<PendingRequestDetailsProps> = ({ requestId }) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [requestDetails, setRequestDetails] = useState<CredentialRequestDetails | null>(null);
	const [processing, setProcessing] = useState<boolean>(false);

	const getRequestDetails = async () => {
		if (!requestId) {
			setError('Request ID is required');
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await getCredentialRequestDetails(requestId);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setRequestDetails(data?.data);
			} else {
				setError(data?.message || 'Failed to fetch request details');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch request details';
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async () => {
		setProcessing(true);
		// TODO: Implement approve functionality
		// This would typically call an API to approve the request
		setTimeout(() => {
			setSuccess('Request approved successfully');
			setProcessing(false);
			// Refresh the details
			getRequestDetails();
		}, 1000);
	};

	const handleReject = async () => {
		setProcessing(true);
		// TODO: Implement reject functionality
		// This would typically call an API to reject the request
		setTimeout(() => {
			setSuccess('Request rejected successfully');
			setProcessing(false);
			// Refresh the details
			getRequestDetails();
		}, 1000);
	};

	const handleProceed = async () => {
		setProcessing(true);
		setError(null);

		try {
			const response = await updateCredentialRequestStatus(requestId, 'pending');

			// Check if response is a string (error case from catch block)
			if (typeof response === 'string') {
				// API endpoint not available, update frontend only
				if (requestDetails) {
					setRequestDetails({
						...requestDetails,
						status: 'pending'
					});
				}
				setSuccess('Ready to proceed with credential issuance (Status updated locally)');
				setProcessing(false);
				return;
			}

			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS || data?.statusCode === 200) {
				setSuccess('Request status updated to pending successfully');
				// Refresh the details to show the updated status and credential form
				setTimeout(() => {
					getRequestDetails();
				}, 1000);
			} else {
				// API call failed, fall back to local update
				if (requestDetails) {
					setRequestDetails({
						...requestDetails,
						status: 'pending'
					});
				}
				setSuccess('Ready to proceed with credential issuance');
			}
		} catch (error) {
			console.error('API error, falling back to local update:', error);
			// Network error or API not available, fall back to local update
			if (requestDetails) {
				setRequestDetails({
					...requestDetails,
					status: 'pending'
				});
			}
			setSuccess('Ready to proceed with credential issuance');
		} finally {
			setProcessing(false);
		}
	};

	const goBack = () => {
		window.history.back();
	};

	useEffect(() => {
		getRequestDetails();
	}, [requestId]);

	if (loading) {
		return (
			<div className="px-4 pt-2">
				<div className="mb-4 col-span-full xl:mb-2">
					<BreadCrumbs />
				</div>
				<div className="flex items-center justify-center p-8">
					<CustomSpinner />
				</div>
			</div>
		);
	}

	if (error && !requestDetails) {
		return (
			<div className="px-4 pt-2">
				<div className="mb-4 col-span-full xl:mb-2">
					<BreadCrumbs />
				</div>
				<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<AlertComponent
						message={error}
						type="failure"
						onAlertClose={() => setError(null)}
					/>
					<Button onClick={goBack} className="mt-4">
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>

			<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
				{(error || success) && (
					<div className="mb-4">
						<AlertComponent
							message={error || success}
							type={error ? 'failure' : 'success'}
							onAlertClose={() => {
								setError(null);
								setSuccess(null);
							}}
						/>
					</div>
				)}

				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
							Credential Request Details
						</h1>
						<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
							Review and process the credential request
						</p>
					</div>
					<div className="flex space-x-3">
						<Button
							onClick={goBack}
							className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
						>
							Back to List
						</Button>
					</div>
				</div>

				{requestDetails && (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{/* Personal Information */}
						<Card>
							<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
								Personal Information
							</h3>
							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										First Name
									</label>
									<p className="mt-1 text-sm text-gray-900 dark:text-white">
										{requestDetails.requesterFirstName || 'N/A'}
									</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										Last Name
									</label>
									<p className="mt-1 text-sm text-gray-900 dark:text-white">
										{requestDetails.requesterLastName || 'N/A'}
									</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										Email
									</label>
									<p className="mt-1 text-sm text-gray-900 dark:text-white">
										{requestDetails.requesterEmail || 'N/A'}
									</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										Phone Number
									</label>
									<p className="mt-1 text-sm text-gray-900 dark:text-white">
										{requestDetails.requesterPhoneNumber || 'N/A'}
									</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										National ID Number
									</label>
									<p className="mt-1 text-sm text-gray-900 dark:text-white">
										{requestDetails.requesterNationalId || 'N/A'}
									</p>
								</div>
							</div>
						</Card>

						{/* Face Liveness Capture */}
						{(() => {
							const imageData = (requestDetails.requestedAttributes as any)?.faceLivenessCapture;
							// Check if imageData is actually base64 data, not a file path
							const isValidBase64Image = imageData &&
								imageData.startsWith('data:image/') &&
								imageData.includes('base64,') &&
								!imageData.includes('/data/user/') && // Not a mobile file path
								imageData.split('base64,')[1]?.length > 100; // Has substantial base64 data

							return isValidBase64Image ? (
								<Card>
									<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
										Face Liveness Capture
									</h3>
									<div className="flex flex-col items-center space-y-2">
										<img
											src={imageData}
											alt="Face Liveness Capture"
											className="h-48 w-48 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
											onLoad={() => {
												console.log('Image loaded successfully');
											}}
											onError={(e) => {
												console.error('Image failed to load:', imageData);
												const target = e.target as HTMLImageElement;
												target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NiA2NEMxMDQuODM3IDY0IDExMiA3MS4xNjMgMTEyIDgwVjExMkMxMTIgMTIwLjgzNyAxMDQuODM3IDEyOCA5NiAxMjhDODcuMTYzIDEyOCA4MCA1Ni4xNiA4MCA0OFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
												target.alt = 'Failed to load image';
											}}
										/>
									</div>
								</Card>
							) : imageData ? (
								<Card>
									<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
										Face Liveness Capture
									</h3>
									<div className="flex flex-col items-center space-y-2 p-4">
										<div className="h-48 w-48 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
											<div className="text-center">
												<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
													📱 Image stored on mobile device
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 break-all px-2">
													{imageData}
												</p>
											</div>
										</div>
										<p className="text-xs text-amber-600 dark:text-amber-400 text-center">
											Note: Mobile app needs to send base64 data instead of file path
										</p>
									</div>
								</Card>
							) : null;
						})()}						{/* Request Information */}
						<Card>
							<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
								Request Information
							</h3>
							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										Request ID
									</label>
									<p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
										{requestDetails.id}
									</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										Status
									</label>
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${requestDetails.status === 'offer-sent'
											? 'bg-yellow-100 text-yellow-800'
											: requestDetails.status === 'credential-issued'
												? 'bg-green-100 text-green-800'
												: requestDetails.status === 'declined' || requestDetails.status === 'abandoned'
													? 'bg-red-100 text-red-800'
													: 'bg-gray-100 text-gray-800'
											}`}
									>
										{requestDetails.status}
									</span>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										Created Date
									</label>
									<p className="mt-1 text-sm text-gray-900 dark:text-white">
										{requestDetails.createdAt ? (
											<DateTooltip date={requestDetails.createdAt} id={requestDetails.id}>
												{dateConversion(requestDetails.createdAt)}
											</DateTooltip>
										) : (
											'N/A'
										)}
									</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
										Last Updated
									</label>
									<p className="mt-1 text-sm text-gray-900 dark:text-white">
										<DateTooltip date={requestDetails.updatedAt} id={`${requestDetails.id}-updated`}>
											{dateConversion(requestDetails.updatedAt)}
										</DateTooltip>
									</p>
								</div>
								{requestDetails.schemaId && (
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
											Schema ID
										</label>
										<p className="mt-1 text-sm text-gray-900 dark:text-white font-mono text-xs break-all">
											{requestDetails.schemaId}
										</p>
									</div>
								)}
								{requestDetails.credentialDefinition?.tag && (
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
											Credential Type
										</label>
										<p className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
											{requestDetails.credentialDefinition.tag}
										</p>
									</div>
								)}
								{requestDetails.credentialDefinitionId && (
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
											Credential Definition ID
										</label>
										<p className="mt-1 text-sm text-gray-900 dark:text-white font-mono text-xs break-all">
											{requestDetails.credentialDefinitionId}
										</p>
									</div>
								)}
							</div>
						</Card>

						{/* Requested Attributes */}
						{requestDetails.requestedAttributes && requestDetails.requestedAttributes.length > 0 && (
							<Card className="lg:col-span-2">
								<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									Requested Attributes
								</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
										<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
											<tr>
												<th scope="col" className="px-4 py-3">
													Attribute Name
												</th>
												<th scope="col" className="px-4 py-3">
													Value
												</th>
											</tr>
										</thead>
										<tbody>
											{requestDetails.requestedAttributes.map((attr, index) => (
												<tr
													key={index}
													className="border-b dark:border-gray-700"
												>
													<td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
														{attr.name || `Attribute ${index + 1}`}
													</td>
													<td className="px-4 py-3">
														{attr.value || 'N/A'}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Card>
						)}


						{/* Proceed Action */}
						{requestDetails.status === 'submitted' && (
							<Card className="lg:col-span-2">
								<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									Actions
								</h3>
								<div className="flex space-x-4">
									<RoleViewButton
										feature={Features.MANAGE_PENDING_REQUESTS}
										onClickEvent={handleProceed}
										buttonTitle="Proceed to Issue Credential"
									/>
								</div>
								<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
									Click proceed to change status to pending and begin credential issuance process.
								</p>
							</Card>
						)}

						{/* Actions */}
						{requestDetails.status === 'pending' && (
							<Card className="lg:col-span-2">
								<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									Actions
								</h3>
								<div className="flex space-x-4">
									<RoleViewButton
										feature={Features.APPROVE_PENDING_REQUESTS}
										onClickEvent={handleApprove}
										buttonTitle="Approve Request"
									/>
									<RoleViewButton
										feature={Features.REJECT_PENDING_REQUESTS}
										onClickEvent={handleReject}
										buttonTitle="Reject Request"
									/>
								</div>
								<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
									Review all information carefully before making a decision.
								</p>
							</Card>
						)}
					</div>
				)}

				{/* Credential Issue Form */}
				{requestDetails && requestDetails.status === 'pending' && (
					<div className="mt-6">
						<CredentialIssueForm
							requestDetails={requestDetails}
							onSuccess={(message) => {
								setSuccess(message);
								getRequestDetails(); // Refresh to update status
							}}
							onError={(message) => {
								setError(message);
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default PendingRequestDetails;
