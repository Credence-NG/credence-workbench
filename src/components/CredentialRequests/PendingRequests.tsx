import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import { Button, Pagination } from 'flowbite-react';
import DateTooltip from '../Tooltip';
import { EmptyListMessage } from '../EmptyListComponent';
import type { ITableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { dateConversion } from '../../utils/DateConversion';
import { pathRoutes } from '../../config/pathRoutes';
import { getFromLocalStorage } from '../../api/Auth';
import type { CredentialRequest, CredentialRequestsResponse } from '../../api/credentialRequests';
import { getCredentialRequests } from '../../api/credentialRequests';
import SortDataTable from '../../commonComponents/datatable/SortDataTable';
import RoleViewButton from '../RoleViewButton';
import { Features } from '../../utils/enums/features';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createdAt',
	sortingOrder: 'desc',
};

interface IListAPIParameter {
	itemPerPage: number;
	page: number;
	search: string;
	sortBy: string;
	sortingOrder: string;
}

const PendingRequests = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [credentialRequestsList, setCredentialRequestsList] = useState<ITableData[]>([]);
	const [listAPIParameter, setListAPIParameter] = useState<IListAPIParameter>(initialPageState);
	const [totalItem, setTotalItem] = useState(0);
	const [pageInfo, setPageInfo] = useState({
		totalItem: '',
		nextPage: '',
		lastPage: '',
	});
	const [searchText, setSearchText] = useState("");
	const [debouncedSearchText, setDebouncedSearchText] = useState("");

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const searchSortByValue = (value: any) => {
		setListAPIParameter((prevState) => ({
			...prevState,
			page: 1,
			sortBy: value,
		}));
	};

	const searchSortOrder = (value: string) => {
		setListAPIParameter((prevState) => ({
			...prevState,
			page: 1,
			sortingOrder: value,
		}));
	};

	const onPageChange = (page: number) => {
		setListAPIParameter((prevState) => ({
			...prevState,
			page,
		}));
	};

	const refreshPage = () => {
		setLoading(true);
		getCredentialRequestsList();
	};

	const getCredentialRequestsList = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

		if (!orgId) {
			setError('Organization not found');
			setLoading(false);
			return;
		}

		try {
			// Get all requests that are still in progress (not yet completed)
			const response = await getCredentialRequests({
				page: listAPIParameter.page,
				limit: listAPIParameter.itemPerPage,
				searchTerm: listAPIParameter.search,
				// Don't filter by status to get all requests, then filter on frontend
				// This allows us to see requests in all pending states
			});

			console.log('API Response:', response);
			const { data } = response as AxiosResponse<CredentialRequestsResponse>;
			console.log('Response data:', data);

			// Check if we have the correct data structure
			if (data?.data?.requests && Array.isArray(data.data.requests)) {
				console.log('All requests from API:', data.data.requests);
				console.log('Request statuses:', data.data.requests.map(r => ({ id: r.id, status: r.status })));

				// Filter to show only requests that are still pending action
				// Include: submitted, pending, offer-sent (but exclude completed statuses)
				const pendingStatuses = ['submitted', 'pending', 'offer-sent'];
				const allRequests = data.data.requests; // Access requests array correctly
				const pendingRequests = allRequests.filter((request: CredentialRequest) =>
					pendingStatuses.includes(request.status)
				);

				console.log('Filtered pending requests:', pendingRequests);
				console.log('Pending request statuses:', pendingRequests.map(r => ({ id: r.id, status: r.status })));

				const tableData = pendingRequests.map((request: CredentialRequest) => ({
					clickId: request.id,
					data: [
						{
							data: request.requesterFirstName || 'N/A',
							handleChange: () => { },
							inputType: 'text'
						},
						{
							data: request.requesterLastName || 'N/A',
							handleChange: () => { },
							inputType: 'text'
						},
						{
							data: request.requesterPhoneNumber || 'N/A',
							handleChange: () => { },
							inputType: 'text'
						},
						{
							data: request.requesterNationalId || 'N/A',
							handleChange: () => { },
							inputType: 'text'
						},
						{
							data: request.requesterEmail || 'N/A',
							handleChange: () => { },
							inputType: 'text'
						},
						{
							data: (
								<div className="flex items-center">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'offer-sent'
											? 'bg-yellow-100 text-yellow-800'
											: request.status === 'credential-issued'
												? 'bg-green-100 text-green-800'
												: request.status === 'declined' || request.status === 'abandoned'
													? 'bg-red-100 text-red-800'
													: 'bg-gray-100 text-gray-800'
											}`}
									>
										{request.status}
									</span>
								</div>
							),
							handleChange: () => { },
							inputType: 'text'
						},
						{
							data: (
								<DateTooltip date={request.createdAt || ''} id={request.id}>
									{dateConversion(request.createdAt)}
								</DateTooltip>
							),
							handleChange: () => { },
							inputType: 'text'
						},
						{
							data: (
								<RoleViewButton
									feature={Features.VIEW_PENDING_REQUEST_DETAILS}
									onClickEvent={() => {
										window.location.href = `${pathRoutes.organizations.pendingRequestDetails}/${request.id}`;
									}}
									buttonTitle="View Details"
								/>
							),
							handleChange: () => { },
							inputType: 'text'
						},
					],
				}));

				setCredentialRequestsList(tableData);
				setTotalItem(data.data.totalItems || pendingRequests.length);

				if (data.data.totalItems > 0) {
					setPageInfo({
						totalItem: data.data.totalItems.toString(),
						nextPage: (data.data.currentPage + 1).toString(),
						lastPage: data.data.totalPages.toString(),
					});
				}

				// Clear any previous errors since we successfully fetched data
				setError(null);
			} else {
				// Only set error if the response structure is invalid, not if there are no records
				if (!data?.data) {
					setError('Failed to fetch credential requests - invalid response');
				} else {
					// Response is valid but no requests - this is normal, just clear the list
					setCredentialRequestsList([]);
					setTotalItem(0);
					setError(null);
				}
			}
		} catch (error) {
			console.error('Error fetching credential requests:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch credential requests';

			// Only show error if it's a real API failure, not just no data
			if (error instanceof Error && !error.message.includes('404')) {
				setError(errorMessage);
			} else {
				// Clear data and error for 404 or other "no data" scenarios
				setCredentialRequestsList([]);
				setTotalItem(0);
				setError(null);
			}
		} finally {
			setLoading(false);
		}
	};

	const searchInputSubmit = () => {
		// Force immediate search without waiting for debounce
		setDebouncedSearchText(searchText);
	};

	const searchInputClear = () => {
		setSearchText('');
		setDebouncedSearchText(''); // Also clear debounced search
		setListAPIParameter((prevState) => ({
			...prevState,
			search: '',
			page: 1,
		}));
	};

	// Debounce search text to avoid too many API calls
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedSearchText(searchText);
		}, 500); // Wait 500ms after user stops typing

		return () => clearTimeout(timeoutId);
	}, [searchText]);

	// Update search parameter when debounced search text changes
	useEffect(() => {
		setListAPIParameter((prevState) => ({
			...prevState,
			search: debouncedSearchText,
			page: 1, // Reset to first page when searching
		}));
	}, [debouncedSearchText]);

	useEffect(() => {
		getCredentialRequestsList();
	}, [listAPIParameter]);

	const header = [
		{ columnName: 'First Name' },
		{ columnName: 'Last Name', sortBy: 'lastName' },
		{ columnName: 'Phone Number', sortBy: 'phoneNumber' },
		{ columnName: 'National ID', sortBy: 'nationalIdNumber' },
		{ columnName: 'Email' },
		{ columnName: 'Status', sortBy: 'status' },
		{ columnName: 'Created', sortBy: 'createdAt' },
		{ columnName: 'Action' },
	];

	return (
		<div className="px-4 pt-2 dark:bg-slate-900">
			<div className="mb-4 col-span-full xl:mb-2 dark:bg-slate-900">
				<BreadCrumbs />
			</div>
			<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-slate-600 sm:p-6 dark:bg-slate-800">
				<div className="w-full">
					{error && (
						<AlertComponent
							message={error}
							type="failure"
							onAlertClose={() => setError(null)}
						/>
					)}

					<div className="sm:flex sm:justify-between sm:items-center">
						<div className="mb-4 col-span-full xl:mb-2">
							<h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-slate-50">
								Pending Credential Requests
							</h1>
							<p className="mt-2 text-sm text-gray-500 dark:text-slate-300">
								Manage and review credential requests submitted to your organization
							</p>
						</div>
						<div className="flex items-center ml-auto space-x-2 sm:space-x-3">
							<Button
								onClick={refreshPage}
								className="text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								<svg
									className="w-5 h-5 mr-2 -ml-1"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
										clipRule="evenodd"
									/>
								</svg>
								Refresh
							</Button>
						</div>
					</div>

					<SortDataTable
						onInputChange={searchInputChange}
						searchValue={searchText}
						refresh={refreshPage}
						header={header}
						data={credentialRequestsList}
						loading={loading}
						searchSortByValue={searchSortByValue}
						currentPage={listAPIParameter?.page}
						onPageChange={onPageChange}
						totalPages={Math.ceil(totalItem / listAPIParameter.itemPerPage)}
						pageInfo={pageInfo}
						isSearch={true}
						isRefresh={true}
						isSort={true}
						isHeader={true}
						isPagination={true}
						message={
							credentialRequestsList?.length === 0
								? 'No pending credential requests found'
								: `${totalItem} credential request${totalItem !== 1 ? 's' : ''} found`
						}
						discription={
							credentialRequestsList?.length === 0
								? 'Credential requests submitted to your organization will appear here'
								: ''
						}
					/>

					{credentialRequestsList && credentialRequestsList?.length > 0 && (
						<div className="flex items-center justify-between pt-3 sm:pt-6">
							<div>
								<span className="text-sm font-normal text-gray-500 dark:text-gray-400">
									Showing{' '}
									<span className="font-semibold text-gray-900 dark:text-white">
										{(listAPIParameter.page - 1) * listAPIParameter.itemPerPage + 1}
									</span>{' '}
									to{' '}
									<span className="font-semibold text-gray-900 dark:text-white">
										{Math.min(listAPIParameter.page * listAPIParameter.itemPerPage, totalItem)}
									</span>{' '}
									of{' '}
									<span className="font-semibold text-gray-900 dark:text-white">
										{totalItem}
									</span>{' '}
									Entries
								</span>
							</div>

							<div className="flex items-center space-x-3">
								<Pagination
									currentPage={listAPIParameter.page}
									onPageChange={onPageChange}
									showIcons
									totalPages={Math.ceil(totalItem / listAPIParameter.itemPerPage)}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PendingRequests;
