import { useEffect, useState, useCallback } from 'react';
import '../../common/global.css';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant.ts';
import type { IOrgInfo, Organisation } from './interfaces';
import { getOrganizations } from '../../api/organization.ts';
import OrgDropdownTrigger from './OrgDropdownTrigger.tsx';
import OrgDropdownContent from './OrgDropdownContent.tsx';
import { useOrganizationManager } from './useOrganizationManager.ts';
import { getFromLocalStorage } from '../../api/Auth.ts';
import { PlatformRoles } from '../../common/enums.ts';

const OrgDropDown = () => {
	const [orgList, setOrgList] = useState<Organisation[]>([]);
	const [activeOrg, setActiveOrg] = useState<IOrgInfo>();
	const [searchInput, setSearchInput] = useState('');
	const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean>(false);
	const [currentUserOrgId, setCurrentUserOrgId] = useState<string>('');

	const { goToOrgDashboard, loadActiveOrg, redirectToCreateOrgModal } = useOrganizationManager();

	// Check if user has platform admin role and get current org ID
	useEffect(() => {
		const checkPlatformAdminRole = async () => {
			try {
				const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
				const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

				if (userRoles) {
					const roles = userRoles.split(',');
					const hasPlatformAdminRole = roles.includes(PlatformRoles.platformAdmin);
					setIsPlatformAdmin(hasPlatformAdminRole);
				}

				if (orgId) {
					setCurrentUserOrgId(orgId);
				}
			} catch (error) {
				console.error('Error checking platform admin role:', error);
				setIsPlatformAdmin(false);
			}
		};

		checkPlatformAdminRole();
	}, []);

	const fetchOrganizations = useCallback(async (searchTerm: string = '') => {
		try {
			const response = await getOrganizations(1, 20, searchTerm);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				let organizations = data?.data?.organizations || [];

				// For non-platform admin users, show only their own organization
				if (!isPlatformAdmin && currentUserOrgId) {
					organizations = organizations.filter((org: Organisation) => {
						return org.id === currentUserOrgId;
					});
				} else if (!isPlatformAdmin) {
					// If no current org ID is set, filter out platform admin organizations
					organizations = organizations.filter((org: Organisation) => {
						// Check if the organization has any roles that indicate it's a platform admin org
						const hasPlatformAdminRole = org.userOrgRoles?.some((userOrgRole: any) =>
							userOrgRole.orgRole?.name === 'platform_admin'
						);

						// Also check if the organization name suggests it's a platform admin org
						const isPlatformAdminOrgByName = org.name?.toLowerCase().includes('platform') &&
							(org.name?.toLowerCase().includes('admin') || org.name?.toLowerCase().includes('credebl'));

						// Exclude organizations with platform admin roles or platform admin naming
						return !hasPlatformAdminRole && !isPlatformAdminOrgByName;
					});
				}

				setOrgList(organizations);

				// Load active org only if we don't have one set
				if (!activeOrg) {
					const active = await loadActiveOrg(organizations);
					setActiveOrg(active);
				}
			}
		} catch (error) {
			console.error('Failed to fetch organizations:', error);
			setOrgList([]);
		}
	}, [activeOrg, loadActiveOrg, isPlatformAdmin, currentUserOrgId]);

	// Debounced search effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchOrganizations(searchInput);
		}, searchInput.length >= 1 ? 1000 : 0);

		return () => clearTimeout(timeoutId);
	}, [searchInput, fetchOrganizations]);

	const handleOrgSelect = useCallback(async (org: Organisation) => {
		await goToOrgDashboard(org);
	}, [goToOrgDashboard]);

	const handleSearchChange = useCallback((value: string) => {
		setSearchInput(value);
	}, []);

	return (
		<>
			<OrgDropdownTrigger activeOrg={activeOrg} />
			<OrgDropdownContent
				organizations={orgList}
				onSearchChange={handleSearchChange}
				onOrgSelect={handleOrgSelect}
				onCreateOrg={redirectToCreateOrgModal}
				showCreateOrg={isPlatformAdmin}
			/>
		</>
	);
};

export default OrgDropDown;
