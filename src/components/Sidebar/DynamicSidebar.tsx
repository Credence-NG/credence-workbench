import { useEffect, useState } from 'react';
import { SidebarMenus, getVisibleMenus, shouldShowCredentialsMenu, type ISidebarItem } from '../../config/sidebarMenus';
import { RolePermissions } from '../../config/permissions';
import { getFromLocalStorage } from '../../api/Auth';
import { storageKeys } from '../../config/CommonConstant';
import { Features } from '../../utils/enums/features';
import { PlatformRoles } from '../../common/enums';

const DynamicSidebar = () => {
	const [userRoles, setUserRoles] = useState<string[]>([]);
	const [userFeatures, setUserFeatures] = useState<string[]>([]);
	const [visibleMenus, setVisibleMenus] = useState<ISidebarItem[]>([]);
	const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set()); const getUserRoles = async (): Promise<string[]> => {
		try {
			const roles: string[] = [];

			// First, try to get all user roles (including platform admin)
			const userRoles = await getFromLocalStorage(storageKeys.USER_ROLES);
			console.log('DynamicSidebar: USER_ROLES from storage:', userRoles);
			if (userRoles && typeof userRoles === 'string') {
				roles.push(...userRoles.split(','));
			}

			// Fallback to organization roles if USER_ROLES is not available
			if (roles.length === 0) {
				const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
				console.log('DynamicSidebar: ORG_ROLES from storage:', orgRoles);
				if (orgRoles && typeof orgRoles === 'string') {
					roles.push(...orgRoles.split(','));
				}
			}

			// Remove duplicates and filter out empty strings
			const uniqueRoles = [...new Set(roles)].filter(role => role && role.trim() !== '');
			console.log('DynamicSidebar: Final processed roles:', uniqueRoles);

			setUserRoles(uniqueRoles);
			return uniqueRoles;
		} catch (error) {
			console.error('Error getting user roles:', error);
			return [];
		}
	};

	const getUserFeatures = (roles: string[]): string[] => {
		const features = new Set<string>();

		console.log('DynamicSidebar: Getting features for roles:', roles);

		roles.forEach(role => {
			const rolePermission = RolePermissions.find(rp => rp.role === role);
			console.log(`DynamicSidebar: Role "${role}" found permission:`, !!rolePermission);
			if (rolePermission) {
				console.log(`DynamicSidebar: Role "${role}" has ${rolePermission.features.length} features`);
				rolePermission.features.forEach(feature => features.add(feature));
			}
		});

		const featureArray = Array.from(features);
		console.log('DynamicSidebar: Total unique features:', featureArray.length);
		return featureArray;
	};

	const toggleDropdown = (menuLabel: string) => {
		setExpandedMenus(prev => {
			const newSet = new Set(prev);
			if (newSet.has(menuLabel)) {
				newSet.delete(menuLabel);
			} else {
				newSet.add(menuLabel);
			}
			return newSet;
		});
	}; useEffect(() => {
		const initializeSidebar = async () => {
			console.log('DynamicSidebar: Initializing sidebar...');
			const roles = await getUserRoles();
			console.log('DynamicSidebar: Retrieved roles:', roles);

			const features = getUserFeatures(roles);
			console.log('DynamicSidebar: Calculated features:', features);
			setUserFeatures(features);

			// Filter menus based on user features
			let filteredMenus = getVisibleMenus(features);
			console.log('DynamicSidebar: Visible menus:', filteredMenus.map(m => m.label));

			// Special handling for Credentials menu - show if user can issue OR verify
			if (shouldShowCredentialsMenu(features)) {
				const credentialsMenu = SidebarMenus.find(menu => menu.label === 'Credentials');
				if (credentialsMenu) {
					const credentialsChildren: ISidebarItem[] = [];

					if (features.includes(Features.ISSUANCE)) {
						credentialsChildren.push({
							label: "List Issued",
							href: "/organizations/credentials",
							icon: "list",
							feature: Features.ISSUANCE,
						});
					}
					if (features.includes(Features.ISSUANCE)) {
						credentialsChildren.push({
							label: "Issue",
							href: "/organizations/credentials/issue",
							icon: "issue",
							feature: Features.ISSUANCE,
						});
					}
					if (features.includes(Features.VERIFICATION)) {
						credentialsChildren.push({
							label: "Verify",
							href: "/organizations/verification",
							icon: "verify",
							feature: Features.VERIFICATION,
						});
					}

					// Replace the credentials menu in filtered results
					filteredMenus = filteredMenus.map(menu =>
						menu.label === 'Credentials'
							? { ...menu, children: credentialsChildren }
							: menu
					);

					// Add credentials menu if not already visible
					if (!filteredMenus.find(menu => menu.label === 'Credentials')) {
						filteredMenus.push({
							label: "Credentials",
							href: "#",
							icon: "credentials",
							feature: Features.ISSUANCE,
							children: credentialsChildren,
						});
					}
				}
			}

			setVisibleMenus(filteredMenus);
		};

		initializeSidebar();
	}, []);

	const renderMenuItem = (item: ISidebarItem) => {
		const hasChildren = item.children && item.children.length > 0;
		const isExpanded = expandedMenus.has(item.label);

		if (hasChildren) {
			return (
				<li key={item.label}>
					<button
						type="button"
						className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
						onClick={() => toggleDropdown(item.label)}
					>
						<SidebarIcon name={item.icon} />
						<span className="flex-1 ml-3 text-left whitespace-nowrap">{item.label}</span>
						<svg
							className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 10 6"
						>
							<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
						</svg>
					</button>
					<ul className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} py-2 space-y-2`}>
						{item.children?.map(child => (
							<li key={child.label}>
								<a
									href={child.href}
									className="flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
								>
									<SidebarIcon name={child.icon} />
									<span className="ml-2">{child.label}</span>
								</a>
							</li>
						))}
					</ul>
				</li>
			);
		} return (
			<li key={item.label}>
				<a
					href={item.href}
					className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700"
				>
					<SidebarIcon name={item.icon} />
					<span className="ml-3">{item.label}</span>
				</a>
			</li>
		);
	};

	return (
		<aside
			id="sidebar"
			className="fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 hidden w-64 h-full pt-16 font-normal duration-75 lg:flex transition-width"
			aria-label="Sidebar"
		>
			<div className="relative flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
				<div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
					<div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
						<ul className="pb-2 space-y-2">
							{visibleMenus.map(renderMenuItem)}
						</ul>

						{/* Role Debug Info (remove in production) */}
						{process.env.NODE_ENV === 'development' && (
							<div className="pt-4 mt-4 text-xs text-gray-500">
								<p>Roles: {userRoles.join(', ')}</p>
								<p>Features: {userFeatures.length}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</aside>
	);
};

// Simple icon component - you can expand this with your actual icons
const SidebarIcon = ({ name }: { name: string }) => {
	const iconClasses = "w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white";

	const iconMap: { [key: string]: JSX.Element } = {
		dashboard: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M5 21c-.55 0-1.02-.196-1.413-.587A1.926 1.926 0 0 1 3 19V5c0-.55.196-1.02.587-1.413A1.926 1.926 0 0 1 5 3h14c.55 0 1.02.196 1.413.587.39.393.587.863.587 1.413v14c0 .55-.196 1.02-.587 1.413A1.926 1.926 0 0 1 19 21H5Zm5-2v-6H5v6h5Zm2 0h7v-6h-7v6Zm-7-8h14V5H5v6Z" />
			</svg>
		),
		organization: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
			</svg>
		),
		schema: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
			</svg>
		),
		credentials: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M9,12L11,14L15,10L13,8L11,10L9,12M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14L18,6V8Z" />
			</svg>
		),
		issue: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
			</svg>
		),
		verify: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
			</svg>
		),
		connections: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M10.59,13.41C11,13.8 11,14.4 10.59,14.81C10.2,15.2 9.6,15.2 9.19,14.81L7.78,13.4L6.37,14.81C5.96,15.2 5.36,15.2 4.95,14.81C4.54,14.4 4.54,13.8 4.95,13.39L6.36,12L4.95,10.61C4.54,10.2 4.54,9.6 4.95,9.19C5.36,8.78 5.96,8.78 6.37,9.19L7.78,10.6L9.19,9.19C9.6,8.78 10.2,8.78 10.59,9.19C11,9.6 11,10.2 10.59,10.61L9.18,12L10.59,13.41M19.05,13.39C19.46,13.8 19.46,14.4 19.05,14.81C18.64,15.2 18.04,15.2 17.63,14.81L16.22,13.4L14.81,14.81C14.4,15.2 13.8,15.2 13.39,14.81C12.98,14.4 12.98,13.8 13.39,13.39L14.8,12L13.39,10.61C12.98,10.2 12.98,9.6 13.39,9.19C13.8,8.78 14.4,8.78 14.81,9.19L16.22,10.6L17.63,9.19C18.04,8.78 18.64,8.78 19.05,9.19C19.46,9.6 19.46,10.2 19.05,10.61L17.64,12L19.05,13.39Z" />
			</svg>
		),
		users: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.996 2.996 0 0 0 17.04 6c-.8 0-1.54.37-2.01.97l-2.93 3.82A2 2 0 0 0 12 12v6a2 2 0 0 0 2 2h6zm-9.5-8.5L9 11l1.5 2.5L12 11 9 6.5 6 11l1.5 2.5z" />
			</svg>
		),
		ecosystem: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
			</svg>
		),
		settings: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
			</svg>
		),
		profile: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
			</svg>
		),
		lists: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z" />
			</svg>
		),
		search: (
			<svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
				<path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
			</svg>
		),
	};

	return iconMap[name] || iconMap.dashboard;
};

export default DynamicSidebar;
