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

	const { goToOrgDashboard, loadActiveOrg, redirectToCreateOrgModal } = useOrganizationManager();

	// Check if user has platform admin role
	useEffect(() => {
		const checkPlatformAdminRole = async () => {
			try {
				const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
				if (userRoles) {
					const roles = userRoles.split(',');
					const hasPlatformAdminRole = roles.includes(PlatformRoles.platformAdmin);
					setIsPlatformAdmin(hasPlatformAdminRole);
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
				const organizations = data?.data?.organizations || [];
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
	}, [activeOrg, loadActiveOrg]);

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
