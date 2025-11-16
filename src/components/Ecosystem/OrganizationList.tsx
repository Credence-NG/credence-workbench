import { useEffect, useState } from 'react';
import { Card, Button, Badge, Table, Pagination } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import type { ChangeEvent } from 'react';
import { getOrganizations, removeOrganization } from '../../api/ecosystem';
import type { EcosystemOrganization, OrganizationListParams } from '../../types/ecosystem';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';
import type { EcosystemPermissions } from '../../utils/ecosystemPermissions';
import { HiPlus, HiTrash, HiEye } from 'react-icons/hi';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 1,
};

interface OrganizationListProps {
	ecosystemId: string;
	onInviteClick?: () => void;
	onOrganizationsChange?: (orgIds: string[]) => void; // Callback to notify parent of org IDs
}

const OrganizationList = ({ ecosystemId, onInviteClick, onOrganizationsChange }: OrganizationListProps) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [organizations, setOrganizations] = useState<EcosystemOrganization[]>([]);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [searchText, setSearchText] = useState('');
	const [permissions, setPermissions] = useState<EcosystemPermissions | null>(null);

	useEffect(() => {
		loadPermissions();
	}, []);

	useEffect(() => {
		if (permissions) {
			fetchOrganizations();
		}
	}, [ecosystemId, currentPage.pageNumber, searchText, permissions]);

	const loadPermissions = async () => {
		try {
			const perms = await getEcosystemPermissions();
			setPermissions(perms);
		} catch (err) {
			console.error('Error loading permissions:', err);
			setError('Failed to load permissions');
		}
	};

	const fetchOrganizations = async () => {
		setLoading(true);
		setError(null);

		try {
			const params: OrganizationListParams = {
				pageNumber: currentPage.pageNumber,
				pageSize: currentPage.pageSize,
				search: searchText || undefined,
			};

			const response = await getOrganizations(ecosystemId, params) as AxiosResponse;
			const { data } = response;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				// API returns: { statusCode: 200, message: "", data: { organizations: [], totalCount } }
				const orgData = data?.data?.organizations || [];
				const totalCount = data?.data?.totalCount || 0;
				const calculatedTotalPages = Math.ceil(totalCount / currentPage.pageSize);

				setOrganizations(orgData);
				setCurrentPage((prev) => ({
					...prev,
					total: calculatedTotalPages || 1,
				}));

				// Notify parent of organization IDs for schema fetching
				if (onOrganizationsChange) {
					const orgIds = orgData.map((org: EcosystemOrganization) => org.organisation?.id || org.orgId);
					onOrganizationsChange(orgIds);
				}
			} else {
				setError(data?.message || 'Failed to fetch organizations');
			}
		} catch (err: any) {
			const errorMessage = err?.message || 'An error occurred while fetching organizations';
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveOrganization = async (organizationId: string, organizationName: string) => {
		if (!confirm(`Are you sure you want to remove ${organizationName} from this ecosystem?`)) {
			return;
		}

		try {
			const response = await removeOrganization(ecosystemId, organizationId) as AxiosResponse;
			const { data } = response;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setMessage(data?.message || 'Organization removed successfully');
				fetchOrganizations();
			} else {
				setError(data?.message || 'Failed to remove organization');
			}
		} catch (err: any) {
			const errorMessage = err?.message || 'An error occurred while removing organization';
			setError(errorMessage);
		}
	};

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};

	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchText(value);
		setCurrentPage({
			...currentPage,
			pageNumber: 1,
		});
	};

	const getStatusBadge = (status?: string) => {
		if (!status) return 'gray';
		const statusColors: Record<string, string> = {
			active: 'success',
			inactive: 'gray',
			suspended: 'failure',
			pending: 'warning',
		};
		return statusColors[status.toLowerCase()] || 'gray';
	};

	const getMembershipTypeBadge = (type?: string) => {
		if (!type) return 'gray';
		const typeColors: Record<string, string> = {
			issuer: 'info',
			verifier: 'purple',
			both: 'indigo',
		};
		return typeColors[type.toLowerCase()] || 'gray';
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

	return (
		<div className="p-4 space-y-6">
			{/* Success/Error Messages */}
			{error && (
				<AlertComponent
					message={error}
					type={'failure'}
					onAlertClose={() => setError(null)}
				/>
			)}

			{message && (
				<AlertComponent
					message={message}
					type={'success'}
					onAlertClose={() => setMessage(null)}
				/>
			)}

			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Member Organizations
				</h2>
			</div>

			{/* Search */}
			<div className="mb-4">
				<SearchInput
					onInputChange={handleSearch}
					value={searchText}
				/>
			</div>

			{/* Organizations Table */}
			{loading ? (
				<div className="flex items-center justify-center mb-4">
					<CustomSpinner />
				</div>
			) : organizations && organizations.length > 0 ? (
				<>
					<Card>
						<div className="overflow-x-auto">
							<Table>
								<Table.Head>
									<Table.HeadCell>Organization</Table.HeadCell>
									<Table.HeadCell>Type</Table.HeadCell>
									<Table.HeadCell>Status</Table.HeadCell>
									<Table.HeadCell>Issuances</Table.HeadCell>
									<Table.HeadCell>Verifications</Table.HeadCell>
									<Table.HeadCell>Revenue</Table.HeadCell>
									<Table.HeadCell>Joined</Table.HeadCell>
									<Table.HeadCell>Actions</Table.HeadCell>
								</Table.Head>
								<Table.Body className="divide-y">
									{organizations.map((org) => (
										<Table.Row
											key={org.id}
											className="bg-white dark:border-gray-700 dark:bg-gray-800"
										>
											<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
												<div className="flex items-center gap-3">
													{org.organisation?.logoUrl && (
														<img
															src={org.organisation.logoUrl}
															alt={org.organisation.name}
															className="h-8 w-8 rounded object-cover"
														/>
													)}
													<div>
														<div>{org.organisation?.name || 'Unknown'}</div>
														<div className="text-xs text-gray-500">
															{org.roleInEcosystem}
														</div>
													</div>
												</div>
											</Table.Cell>
											<Table.Cell>
												{org.membershipType ? (
													<Badge color={getMembershipTypeBadge(org.membershipType)}>
														{org.membershipType}
													</Badge>
												) : (
													<span className="text-gray-500">-</span>
												)}
											</Table.Cell>
											<Table.Cell>
												{org.status ? (
													<Badge color={getStatusBadge(org.status)}>
														{org.status}
													</Badge>
												) : (
													<span className="text-gray-500">-</span>
												)}
											</Table.Cell>
											<Table.Cell>{formatNumber(org.totalIssuances)}</Table.Cell>
											<Table.Cell>{formatNumber(org.totalVerifications)}</Table.Cell>
											<Table.Cell>{formatCurrency(org.totalRevenue)}</Table.Cell>
											<Table.Cell>
												{new Date(org.joinedAt).toLocaleDateString()}
											</Table.Cell>
											<Table.Cell>
												<div className="flex items-center gap-2">
													<Button
														size="xs"
														color="light"
														onClick={() => window.location.href = `/organizations/${org.orgId}/dashboard`}
													>
														<HiEye className="h-4 w-4" />
													</Button>
													{permissions?.canRemoveOrgs && (
														<Button
															size="xs"
															color="failure"
															onClick={() => handleRemoveOrganization(org.orgId, org.organisation?.name || 'Organization')}
														>
															<HiTrash className="h-4 w-4" />
														</Button>
													)}
												</div>
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table>
						</div>
					</Card>

					{/* Pagination */}
					<div className="flex justify-center mt-4">
						<Pagination
							currentPage={currentPage.pageNumber}
							totalPages={currentPage.total}
							onPageChange={onPageChange}
							showIcons
						/>
					</div>
				</>
			) : (
				<Card>
					<div className="text-center py-12">
						<p className="text-gray-500 dark:text-gray-400 mb-4">
							No organizations found in this ecosystem
						</p>
					</div>
				</Card>
			)}
		</div>
	);
};

export default OrganizationList;
