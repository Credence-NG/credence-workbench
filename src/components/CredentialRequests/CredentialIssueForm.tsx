import React, { useEffect, useState } from 'react';
import { Button, Card } from 'flowbite-react';
import { AlertComponent } from '../AlertComponent';
import { storageKeys } from '../../config/CommonConstant';
import type { CredentialRequestDetails } from '../../api/credentialRequests';
import { getFromLocalStorage } from '../../api/Auth';
import { issueOobEmailCredential } from '../../api/issuance';
import { updateCredentialRequestStatus } from '../../api/credentialRequests';
import { CredentialType } from '../../common/enums';
import CustomSpinner from '../CustomSpinner';
import type { AxiosResponse } from 'axios';
import { pathRoutes } from '../../config/pathRoutes';

interface CredentialIssueFormProps {
	requestDetails: CredentialRequestDetails;
	onSuccess: (message: string) => void;
	onError: (message: string) => void;
}

const CredentialIssueForm: React.FC<CredentialIssueFormProps> = ({
	requestDetails,
	onSuccess,
	onError,
}) => {
	const [preparingIssuance, setPreparingIssuance] = useState<boolean>(true);
	const [issuingCredential, setIssuingCredential] = useState<boolean>(false);
	const [issuanceComplete, setIssuanceComplete] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [credentialAttributes, setCredentialAttributes] = useState<any[]>([]);

	// Check if request is already processed (offer-sent status)
	const isAlreadyProcessed = requestDetails.status === 'offer-sent';

	// Helper function to get attribute values from request data
	const getAttributeValue = (attributeName: string): string => {
		const lowerName = attributeName.toLowerCase();

		// Map common attribute names to request data
		if (lowerName.includes('name') || lowerName.includes('full name')) {
			return `${requestDetails.requesterFirstName || ''} ${requestDetails.requesterLastName || ''}`.trim();
		}
		if (lowerName.includes('email')) {
			return requestDetails.requesterEmail || '';
		}
		if (lowerName.includes('phone')) {
			return requestDetails.requesterPhoneNumber || '';
		}
		if (lowerName.includes('national') || lowerName.includes('id')) {
			return requestDetails.requesterNationalId || '';
		}
		if (lowerName.includes('issued')) {
			return new Date().toISOString().split('T')[0]; // Current date
		}

		// Check in requestedAttributes for other attributes
		if (requestDetails.requestedAttributes) {
			const requestedAttrs = requestDetails.requestedAttributes as any;
			// Try exact match first
			if (requestedAttrs[attributeName]) {
				return String(requestedAttrs[attributeName]);
			}
			// Try case-insensitive match
			const matchingKey = Object.keys(requestedAttrs).find(key =>
				key.toLowerCase() === lowerName
			);
			if (matchingKey) {
				return String(requestedAttrs[matchingKey]);
			}
		}

		// Check in request data for other attributes (legacy support)
		if (requestDetails.requestData?.originalRequest) {
			const originalRequest = requestDetails.requestData.originalRequest;
			if (originalRequest[lowerName]) {
				return String(originalRequest[lowerName]);
			}
		}

		// Default placeholder
		return 'To be filled';
	};

	// Handle attribute value changes
	const handleAttributeChange = (index: number, newValue: string) => {
		const updatedAttributes = [...credentialAttributes];
		updatedAttributes[index] = {
			...updatedAttributes[index],
			value: newValue
		};
		setCredentialAttributes(updatedAttributes);
	};

	useEffect(() => {
		const prepareIssuanceData = async () => {
			try {
				// Get attributes from the credential definition schema
				let attributes: any[] = [];

				if (requestDetails.credentialDefinition?.schema?.attributes) {
					// The schema attributes are already an array, no need to parse JSON
					const schemaAttributes = requestDetails.credentialDefinition.schema.attributes;

					// Check if attributes is an array or needs parsing
					let attributesArray: any[];
					if (Array.isArray(schemaAttributes)) {
						attributesArray = schemaAttributes;
					} else if (typeof schemaAttributes === 'string') {
						// Fallback: try to parse as JSON string
						attributesArray = JSON.parse(schemaAttributes);
					} else {
						console.error('Unexpected schema attributes format:', schemaAttributes);
						attributesArray = [];
					}

					// Convert schema attributes to credential attributes with placeholder values
					attributes = attributesArray.map((attr: any) => ({
						name: attr.attributeName || attr.displayName || attr.name,
						value: getAttributeValue(attr.attributeName || attr.displayName || attr.name)
					}));
				} else {
					console.warn('No schema attributes found, using fallback');
					// Fallback - create attributes from request data if schema is not available
					const requestedAttributes = requestDetails.requestedAttributes as any || {};
					attributes = Object.keys(requestedAttributes).map(key => ({
						name: key,
						value: String(requestedAttributes[key] || '')
					}));
				}

				setCredentialAttributes(attributes);
				setPreparingIssuance(false);
			} catch (error) {
				console.error('=== CREDENTIAL ISSUANCE PREPARATION ERROR ===');
				console.error('Error preparing issuance data:', error);
				console.error('Error details:', {
					message: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : 'No stack trace',
					requestDetails: requestDetails
				});
				console.error('=== END ERROR DETAILS ===');
				setError('Failed to prepare credential issuance');
				onError('Failed to prepare credential issuance');
				setPreparingIssuance(false);
			}
		};

		if (isAlreadyProcessed) {
			// Request already processed, skip preparation
			setIssuanceComplete(true);
			setPreparingIssuance(false);
		} else if (requestDetails.credentialDefinition && requestDetails.requesterEmail) {
			prepareIssuanceData();
		} else {
			console.error('=== MISSING REQUIRED DATA ===');
			console.error('Credential Definition present:', !!requestDetails.credentialDefinition);
			console.error('Credential Definition:', requestDetails.credentialDefinition);
			console.error('Requester Email present:', !!requestDetails.requesterEmail);
			console.error('Requester Email:', requestDetails.requesterEmail);
			console.error('Full Request Details:', requestDetails);
			console.error('=== END MISSING DATA DEBUG ===');

			setError('Missing required data for credential issuance');
			onError('Missing required data for credential issuance');
			setPreparingIssuance(false);
		}
	}, [requestDetails, onError]);

	// Early return if request is already processed
	if (isAlreadyProcessed) {
		return (
			<div className="lg:col-span-2 mt-6">
				<Card className="mb-4">
					<div className="mb-4">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
							Issue Credential
							{requestDetails.credentialDefinition?.tag && (
								<span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
									({requestDetails.credentialDefinition.tag})
								</span>
							)}
						</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
							This credential has already been issued to {requestDetails.requesterFirstName} {requestDetails.requesterLastName}
							<br />
							<span className="text-blue-600 dark:text-blue-400">Credential was sent to: {requestDetails.requesterEmail}</span>
						</p>
					</div>

					<div className="flex justify-center items-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg">
						<div className="text-center">
							<svg className="w-16 h-16 mx-auto text-green-600 dark:text-green-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
								Credential Already Issued
							</h4>
							<p className="text-green-700 dark:text-green-300">
								This credential request has already been processed and the credential offer has been sent.
							</p>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	if (!requestDetails.requesterEmail) {
		return (
			<Card className="lg:col-span-2 mt-6">
				<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
					Issue Credential
				</h3>
				<AlertComponent
					message="Email address is missing from the request details. Please ensure this request has a valid email for credential delivery."
					type="failure"
					onAlertClose={() => { }}
				/>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="lg:col-span-2 mt-6">
				<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
					Issue Credential
				</h3>
				<AlertComponent
					message={error}
					type="failure"
					onAlertClose={() => setError(null)}
				/>
			</Card>
		);
	}

	if (preparingIssuance) {
		return (
			<Card className="lg:col-span-2 mt-6">
				<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
					Issue Credential
					{requestDetails.credentialDefinition?.tag && (
						<span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
							({requestDetails.credentialDefinition.tag})
						</span>
					)}
				</h3>
				<div className="flex items-center justify-center p-8">
					<CustomSpinner />
					<span className="ml-3 text-gray-500 dark:text-gray-400">Preparing credential issuance...</span>
				</div>
			</Card>
		);
	}

	const handleIssueCredential = async () => {
		// Double-check to prevent duplicate issuance
		if (isAlreadyProcessed || issuanceComplete || issuingCredential) {
			return;
		}

		setIssuingCredential(true);
		setError(null);

		try {
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			if (!orgId) {
				throw new Error('Organization ID not found');
			}

			// Prepare credential data for email issuance in the correct format
			const transformedData = {
				credentialOffer: [{
					emailId: requestDetails.requesterEmail,
					attributes: credentialAttributes.map(attr => ({
						name: attr.name,
						value: String(attr.value || ''),
						isRequired: true
					}))
				}],
				credentialDefinitionId: requestDetails.credentialDefinition.credentialDefinitionId,
				isReuseConnection: true
			};

			// Final check before issuing to prevent race conditions
			if (requestDetails.status === 'offer-sent') {
				throw new Error('This credential has already been issued');
			}

			// Issue credential via email - default to INDY credential type
			const response = await issueOobEmailCredential(transformedData, CredentialType.INDY);

			if (response && typeof response !== 'string') {
				const axiosResponse = response as AxiosResponse;
				if (axiosResponse.data) {
					// Update request status to 'offer-sent' after successful credential issuance
					try {
						const statusUpdateResponse = await updateCredentialRequestStatus(requestDetails.id, 'offer-sent');

						if (typeof statusUpdateResponse === 'string') {
							console.error('Status update failed:', statusUpdateResponse);
							throw new Error(`Status update failed: ${statusUpdateResponse}`);
						}
					} catch (statusError) {
						console.error('Failed to update request status:', statusError);
						// Don't fail the whole process if status update fails, but log it prominently
						alert(`Warning: Credential was issued successfully, but status update failed: ${statusError}`);
					}

					setIssuanceComplete(true);
					onSuccess(`Credential offer sent successfully to ${requestDetails.requesterEmail}. Redirecting to credentials page...`);

					// Redirect to credentials page after a short delay
					setTimeout(() => {
						window.location.href = pathRoutes.organizations.credentials;
					}, 2000);
				} else {
					throw new Error('Failed to send credential offer');
				}
			} else {
				throw new Error(typeof response === 'string' ? response : 'Failed to send credential offer');
			}
		} catch (error) {
			console.error('Error issuing credential:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to issue credential';
			setError(errorMessage);
			onError(errorMessage);
		} finally {
			setIssuingCredential(false);
		}
	};

	return (
		<div className="lg:col-span-2 mt-6">
			<Card className="mb-4">
				<div className="mb-4">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						Issue Credential
						{requestDetails.credentialDefinition?.tag && (
							<span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
								({requestDetails.credentialDefinition.tag})
							</span>
						)}
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
						Complete the credential issuance for {requestDetails.requesterFirstName} {requestDetails.requesterLastName}
						<br />
						<span className="text-blue-600 dark:text-blue-400">Credential offer will be sent to: {requestDetails.requesterEmail}</span>
					</p>
				</div>

				{/* Editable credential attributes */}
				<div className="mb-4">
					<h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
						Credential Attributes:
					</h4>
					<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
						{credentialAttributes.map((attr, index) => (
							<div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
								<label className="font-medium text-gray-700 dark:text-gray-300 w-1/3">
									{attr.name}:
								</label>
								<input
									type="text"
									value={attr.value}
									onChange={(e) => handleAttributeChange(index, e.target.value)}
									className="flex-1 ml-3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
									placeholder={`Enter ${attr.name}`}
								/>
							</div>
						))}
					</div>
				</div>

				{/* Issue credential button */}
				<div className="flex justify-end">
					<Button
						onClick={handleIssueCredential}
						disabled={issuingCredential || issuanceComplete}
						className={`text-white focus:ring-4 ${issuanceComplete
							? 'bg-green-600 hover:bg-green-700 focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800'
							: 'bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
							}`}
					>
						{issuanceComplete ? (
							<>
								<svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
								</svg>
								<span>Credential Issued Successfully</span>
							</>
						) : issuingCredential ? (
							<>
								<CustomSpinner size="sm" />
								<span className="ml-2">Processing & Sending Credential Offer...</span>
							</>
						) : (
							'Issue Credential via Email'
						)}
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default CredentialIssueForm;
