import type { Connection, OrgAgent, Organisation } from './interfaces';
import React, { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import CustomQRCode from '../../commonComponents/QRcode';
import CustomSpinner from '../CustomSpinner';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { createConnection } from '../../api/organization';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import CopyDid from '../../commonComponents/CopyDid';
import { setToLocalStorage } from '../../api/Auth';
import { Tooltip } from 'flowbite-react';
import DIDList from './configuration-settings/DidList';

const OrganizationDetails = ({ orgData }: { orgData: Organisation | null }) => {

	const { org_agents } = orgData as Organisation;
	const agentData: OrgAgent | null =
		org_agents.length > 0 ? org_agents[0] : null;

	const [loading, setLoading] = useState<boolean>(true);
	const [connectionData, setConnectionData] = useState<Connection | null>(null);
	const [isUsingShortUrl, setIsUsingShortUrl] = useState<boolean>(false);
	const [shortUrl, setShortUrl] = useState<string>('');
	const [isFetching, setIsFetching] = useState<boolean>(false);

	const createQrConnection = async () => {
		console.log('🔗 OrganizationDetails: createQrConnection starting...');
		setLoading(true);
		try {
			const response = await createConnection(orgData?.name as string);
			console.log('🔗 OrganizationDetails: createConnection API response:', response);

			const { data } = response as AxiosResponse;
			console.log('🔗 Response data:', data);

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				console.log('✅ OrganizationDetails: Connection creation successful!');
				setConnectionData(data?.data);
			} else {
				console.warn('❌ OrganizationDetails: Connection creation failed with status:', data?.statusCode);
			}
		} catch (error) {
			console.error('❌ OrganizationDetails: Error creating QR connection:', error);
		} finally {
			setLoading(false);
		}
	};

	const storeLedgerDetails = async () => {
		await setToLocalStorage(storageKeys.LEDGER_ID, agentData?.ledgers.id);
	};

	const fetchActualInvitation = async (minioUrl: string, isManualRefresh = false) => {
		console.log('📥 Fetching actual invitation data from MinIO URL...');

		if (isManualRefresh) {
			setIsFetching(true);
		} else {
			setLoading(true);
		}

		try {
			// Fetch the actual invitation data from the MinIO URL
			const response = await fetch(minioUrl, {
				method: 'GET',
				mode: 'cors',
				headers: {
					'Accept': 'text/plain, */*',
				},
			});

			console.log('📬 MinIO fetch response:', {
				status: response.status,
				statusText: response.statusText,
				ok: response.ok,
			});

			if (response.ok) {
				let actualInvitationData = await response.text();
				console.log('✅ Successfully fetched actual invitation data');
				console.log('🔗 Actual invitation data:', actualInvitationData.substring(0, 200) + '...');

				// Remove any quotes that might be surrounding the invitation data
				actualInvitationData = actualInvitationData.replace(/^"|"$/g, '');
				console.log('🧹 Cleaned invitation data:', actualInvitationData.substring(0, 200) + '...');

				// Use the actual invitation data for the QR code
				setConnectionData({
					connectionInvitation: actualInvitationData
				} as Connection);
				setIsUsingShortUrl(false);

				if (isManualRefresh) {
					setIsFetching(false);
				} else {
					setLoading(false);
				}
				return true;
			} else {
				console.warn('⚠️ Failed to fetch invitation data, response status:', response.status, response.statusText);

				if (isManualRefresh) {
					setIsFetching(false);
				} else {
					setLoading(false);
				}
				return false;
			}
		} catch (fetchError) {
			console.error('❌ Error fetching invitation data:', fetchError);

			if (isManualRefresh) {
				setIsFetching(false);
			} else {
				setLoading(false);
			}
			return false;
		}
	};

	useEffect(() => {
		console.log('🏗️ OrganizationDetails: Component mounting/updating');
		console.log('🏗️ OrganizationDetails: orgData received:', orgData);

		const initializeComponent = async () => {
			try {
				// Check if we already have a connection invitation in the org data
				const firstAgent = orgData?.org_agents?.[0] as any;
				const existingInvitation = firstAgent?.agent_invitations?.[0]?.connectionInvitation;

				if (existingInvitation) {
					console.log('✅ OrganizationDetails: Found existing connection invitation URL');
					console.log('🔗 Shortened MinIO URL:', existingInvitation);
					setShortUrl(existingInvitation);

					// Try to fetch the actual invitation data
					const success = await fetchActualInvitation(existingInvitation);

					if (!success) {
						console.warn('⚠️ Using MinIO URL as fallback for QR code');
						// Remove any quotes that might be surrounding the invitation URL
						const cleanInvitationUrl = existingInvitation.replace(/^"|"$/g, '');
						setConnectionData({
							connectionInvitation: cleanInvitationUrl
						} as Connection);
						setIsUsingShortUrl(true);
						setLoading(false);
					}
				} else {
					console.log('🔧 OrganizationDetails: No existing invitation, creating new QR connection...');
					await createQrConnection();
				}

				await storeLedgerDetails();
			} catch (error) {
				console.error('OrganizationDetails: Error in useEffect:', error);
				setLoading(false);
			}
		};

		initializeComponent();
	}, []);

	return (
		<div>

			<div>
				<div className="mt-4 flex justify-start items-start flex-wrap p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 gap-6">
					<div className='flex justify-between w-full'>
						<h3 className="mb-1 mt-1 text-xl font-bold text-gray-900 dark:text-white">
							Web Wallet Details
						</h3>
					</div>
					<div
						className="mb-4 sm:mb-0 px-0 sm:px-4 py-4 min-w-full lg:min-w-[550px] lg:max-w-[50rem]"
						style={{ width: 'calc(100% - 23rem)' }}
					>
						<div>
							<ul className="divide-y divide-gray-200 dark:divide-gray-700">
								<li className="py-4">
									<div className="flex items-center space-x-8">
										<div className="inline-flex min-w-0 items-center">
											<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
												Wallet Name
											</p>
											<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">
												:
											</p>
											<p className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white w-full">
												{agentData?.walletName}
											</p>
										</div>
									</div>
								</li>
								<li className="pb-4 pt-2">
									<div className="flex items-center space-x-4">
										<div className="flex min-w-0 items-center">
											<p className="text-base font-normal text-gray-500 dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
												Org DID
											</p>
											<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">
												:
											</p>
											{agentData?.orgDid ? (
												<CopyDid
													className="ml-4 pt-2 font-courier text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white"
													value={agentData?.orgDid}
												/>
											) : (
												<span className="ml-4 pt-2 font-courier text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white">
													Not available
												</span>
											)}
										</div>
									</div>
								</li>

								<li className="py-4">
									<div className="flex items-center space-x-4">
										<div className="inline-flex min-w-0 items-center">
											<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
												Network
											</p>
											<p className="pr-4 text-base font-normal text-gray-500 dark:text-gray-400">
												:
											</p>
											<p className="text-base font-semibold text-gray-900 truncate dark:text-white w-full">
												{agentData?.ledgers ? agentData?.ledgers?.name : `-`}
											</p>
										</div>
									</div>
								</li>

								<li className="py-4">
									<div className="flex items-center space-x-4">
										<div className="inline-flex min-w-0 items-center">
											<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
												Agent Type
											</p>
											<p className="pr-4 text-base font-normal text-gray-500 dark:text-gray-400">
												:
											</p>
											<p className="text-base font-semibold text-gray-900 truncate dark:text-white w-full">
												{agentData?.org_agent_type?.agent
													? agentData?.org_agent_type?.agent
														?.charAt(0)
														.toUpperCase() +
													agentData?.org_agent_type?.agent
														?.slice(1)
														.toLowerCase()
													: ''}
											</p>
										</div>
									</div>
								</li>
								<li className="py-4">
									<div className="flex items-center space-x-4">
										<div className="inline-flex min-w-0 items-center">
											<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
												Created On
											</p>
											<p className="pr-4 text-base font-normal text-gray-500 dark:text-gray-400">
												:
											</p>
											<div className="text-base font-semibold text-gray-900 truncate dark:text-white w-full">
												{agentData?.createDateTime ? (
													<DateTooltip date={agentData?.createDateTime}>
														{' '}
														{dateConversion(agentData?.createDateTime)}{' '}
													</DateTooltip>
												) : (
													<DateTooltip date={agentData?.createDateTime || ''}>
														{' '}
														{dateConversion(new Date().toISOString())}{' '}
													</DateTooltip>
												)}
											</div>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
					<div className="flex flex-col justify-center text-wrap">
						{(() => {
							if (loading) {
								console.log('🔄 OrganizationDetails: Showing loading spinner');
								return (
									<div className="flex justify-center">
										<CustomSpinner />
									</div>
								);
							} else if (connectionData) {
								console.log('✅ QR Code: Rendering QR code with connectionInvitation:', connectionData?.connectionInvitation);
								// Remove any quotes that might be surrounding the connection invitation string
								const cleanInvitationUrl = connectionData?.connectionInvitation ?
									connectionData.connectionInvitation.replace(/^"|"$/g, '') : '';
								console.log('🧹 Cleaned QR URL:', cleanInvitationUrl);
								return (
									<div className="flex flex-col items-center">
										<CustomQRCode
											value={cleanInvitationUrl}
											size={180}
										/>
										{isUsingShortUrl && (
											<div className="mt-3 text-center">
												<p className="text-xs text-orange-600 dark:text-orange-400 mb-2">
													⚠️ Using shortened URL
												</p>
												<button
													onClick={() => fetchActualInvitation(shortUrl, true)}
													className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
													disabled={isFetching}
												>
													{isFetching ? '🔄 Fetching...' : '🔄 Fetch Actual URL'}
												</button>
											</div>
										)}
									</div>
								);
							} else {
								console.log('❌ QR Code: No connectionData available, cannot render QR code');
								return (
									<div>
										<p className="text-gray-500">No connection data available</p>
									</div>
								);
							}
						})()}
					</div>
					<div className="mt-4 w-full p-4">
						<DIDList />
					</div>
				</div>
				{agentData?.orgDid?.startsWith('did:web') && (
					<div className="mt-4 flex justify-start items-center flex-wrap p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
						<div className="flex justify-between w-full">
							<div className="relative flex w-full">
								<div
									className="mb-4 sm:mb-0 px-0 sm:px-4 py-4 w-full"
								>
									<h3 className="mb-1 mt-1 text-2xl font-bold text-gray-900 dark:text-white">
										DID Document
									</h3>

									<div className="mt-4">
										<h3 className="mb-1 mt-1 text-lg font-semibold text-gray-900 dark:text-white">
											Instructions:
										</h3>
										<p className="dark:text-white">
											1. Kindly provide the DID document for hosting purposes in
											order to facilitate its publication
										</p>
										<p className="dark:text-white">
											2. Failure to host the DID document will result in the
											inability to publish your DID
										</p>
									</div>

									<div className="flex justify-between mt-6 bg-gray-200 dark:bg-gray-300">
										<div className="flex p-4">
											<pre>
												<code>
													{JSON.stringify(agentData?.didDocument, undefined, 4)}
												</code>
											</pre>
										</div>
										<div className="flex items-start mt-4 mr-4">
											<Tooltip
												content={'Copy DID Document'}
												placement="bottom"
												className="items-center text-center dark:text-white"
											>
												<CopyDid
													className="block text-sm truncate"
													value={JSON.stringify(agentData?.didDocument)}
													hideValue={true}
												/>
											</Tooltip>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}	</div>

		</div>

	);
};

export default OrganizationDetails;
